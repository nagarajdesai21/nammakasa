import express from 'express';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jwt-simple';
import bcrypt from 'bcrypt';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Send OTP for customer signup/login
router.post('/customer/signup/send-otp', async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({
        error: 'Email and phone are required',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
      });
    }

    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        error: 'Phone must be 10 digits',
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if OTP record exists
    const existingOtp = await pool.query(
      'SELECT * FROM otp_verifications WHERE email = $1',
      [email]
    );

    if (existingOtp.rows.length > 0) {
      await pool.query(
        'UPDATE otp_verifications SET otp = $1, expires_at = $2, attempts = 0, is_used = FALSE WHERE email = $3',
        [otp, expiresAt, email]
      );
    } else {
      await pool.query(
        'INSERT INTO otp_verifications (email, otp, expires_at) VALUES ($1, $2, $3)',
        [email, otp, expiresAt]
      );
    }

    // For testing: use mock OTP
    const testOtp = '123456';
    console.log(`📱 OTP for ${email}: ${testOtp} (actual: ${otp})`);

    // TODO: Send SMS via MSG91 and email
    // For now, just return success

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove in production
      testOtp: process.env.NODE_ENV === 'development' ? testOtp : undefined,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      error: error.message || 'Failed to send OTP',
    });
  }
});

// Verify OTP for customer signup/login
router.post('/customer/signup/verify-otp', async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    if (!email || !phone || !otp) {
      return res.status(400).json({
        error: 'Email, phone, and OTP are required',
      });
    }

    // Check OTP
    const otpRecord = await pool.query(
      'SELECT * FROM otp_verifications WHERE email = $1',
      [email]
    );

    if (otpRecord.rows.length === 0) {
      return res.status(400).json({
        error: 'OTP not found or expired',
      });
    }

    const record = otpRecord.rows[0];

    // Check if already used
    if (record.is_used) {
      return res.status(400).json({
        error: 'OTP already used',
      });
    }

    // Check if expired
    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({
        error: 'OTP expired',
      });
    }

    // Check attempts
    if (record.attempts >= 3) {
      return res.status(400).json({
        error: 'Too many attempts. Request new OTP.',
      });
    }

    // Verify OTP (check for mock OTP or actual)
    if (otp !== record.otp && otp !== '123456') {
      await pool.query(
        'UPDATE otp_verifications SET attempts = attempts + 1 WHERE email = $1',
        [email]
      );

      return res.status(400).json({
        error: 'Invalid OTP',
      });
    }

    // Mark as used
    await pool.query(
      'UPDATE otp_verifications SET is_used = TRUE WHERE email = $1',
      [email]
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      error: error.message || 'Failed to verify OTP',
    });
  }
});

// Register customer
router.post('/customer/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'Email or phone already registered',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const result = await pool.query(
      `INSERT INTO users (id, name, email, phone, password_hash, user_type, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, name, email, phone, user_type`,
      [userId, name, email, phone, passwordHash, 'CUSTOMER', 'APPROVED']
    );

    // Generate JWT token
    const tokenPayload = {
      userId: result.rows[0].id,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      userType: result.rows[0].user_type,
    };

    const token = jwt.encode(tokenPayload, JWT_SECRET);

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: result.rows[0],
      token,
    });
  } catch (error) {
    console.error('Error registering customer:', error);
    res.status(500).json({
      error: error.message || 'Failed to register customer',
    });
  }
});

// Customer login (with OTP)
router.post('/customer/login', async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    if (!email || !phone || !otp) {
      return res.status(400).json({
        error: 'Email, phone, and OTP are required',
      });
    }

    // Get user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND phone = $2 AND user_type = $3',
      [email, phone, 'CUSTOMER']
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Customer not found',
      });
    }

    // Verify OTP (same as signup verify)
    const otpRecord = await pool.query(
      'SELECT * FROM otp_verifications WHERE email = $1',
      [email]
    );

    if (otpRecord.rows.length === 0 || (otp !== otpRecord.rows[0].otp && otp !== '123456')) {
      return res.status(400).json({
        error: 'Invalid OTP',
      });
    }

    const user = userResult.rows[0];

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      phone: user.phone,
      userType: user.user_type,
    };

    const token = jwt.encode(tokenPayload, JWT_SECRET);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.user_type,
      },
      token,
    });
  } catch (error) {
    console.error('Error logging in customer:', error);
    res.status(500).json({
      error: error.message || 'Failed to login',
    });
  }
});

export default router;
