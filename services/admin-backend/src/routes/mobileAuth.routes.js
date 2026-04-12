import express from 'express';
import pool from '../config/database.js';
import jwt from 'jwt-simple';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Send OTP for driver login
router.post('/driver/login/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        error: 'Phone number is required',
      });
    }

    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        error: 'Phone must be 10 digits',
      });
    }

    // Check if driver exists
    const driverResult = await pool.query(
      'SELECT * FROM drivers WHERE phone = $1',
      [phone]
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Driver not found. Please contact admin to register.',
        driverExists: false,
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if OTP record exists for this phone
    const existingOtp = await pool.query(
      'SELECT * FROM otp_verifications WHERE email = $1',
      [`driver_${phone}`]
    );

    if (existingOtp.rows.length > 0) {
      await pool.query(
        'UPDATE otp_verifications SET otp = $1, expires_at = $2, attempts = 0, is_used = FALSE WHERE email = $3',
        [otp, expiresAt, `driver_${phone}`]
      );
    } else {
      await pool.query(
        'INSERT INTO otp_verifications (email, otp, expires_at) VALUES ($1, $2, $3)',
        [
          `driver_${phone}`,
          otp,
          expiresAt,
        ]
      );
    }

    // For testing: use mock OTP
    const testOtp = '123456';
    console.log(`📱 Driver OTP for ${phone}: ${testOtp} (actual: ${otp})`);

    // TODO: Send SMS via MSG91
    // For now, just return success

    res.json({
      success: true,
      message: 'OTP sent successfully',
      driverExists: true,
      // Remove in production
      testOtp: process.env.NODE_ENV === 'development' ? testOtp : undefined,
    });
  } catch (error) {
    console.error('Error sending driver OTP:', error);
    res.status(500).json({
      error: error.message || 'Failed to send OTP',
    });
  }
});

// Verify OTP for driver login
router.post('/driver/login/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        error: 'Phone and OTP are required',
      });
    }

    // Check if driver exists
    const driverResult = await pool.query(
      'SELECT id, name, phone, ward_no as "wardNo", status FROM drivers WHERE phone = $1',
      [phone]
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Driver not found',
      });
    }

    // Check OTP
    const otpRecord = await pool.query(
      'SELECT * FROM otp_verifications WHERE email = $1',
      [
        `driver_${phone}`,
      ]
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
        [
          `driver_${phone}`,
        ]
      );

      return res.status(400).json({
        error: 'Invalid OTP',
      });
    }

    // Mark as used
    await pool.query(
      'UPDATE otp_verifications SET is_used = TRUE WHERE email = $1',
      [
        `driver_${phone}`,
      ]
    );

    const driver = driverResult.rows[0];

    // Generate JWT token
    const tokenPayload = {
      userId: driver.id,
      driverId: driver.id,
      name: driver.name,
      phone: driver.phone,
      wardNo: driver.wardNo,
      userType: 'DRIVER',
    };

    const token = jwt.encode(tokenPayload, JWT_SECRET);

    res.json({
      success: true,
      message: 'Driver login successful',
      data: {
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        wardNo: driver.wardNo,
        status: driver.status,
      },
      token,
    });
  } catch (error) {
    console.error('Error verifying driver OTP:', error);
    res.status(500).json({
      error: error.message || 'Failed to verify OTP',
    });
  }
});

export default router;
