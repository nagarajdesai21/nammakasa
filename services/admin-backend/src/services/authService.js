import pool from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jwt-simple';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

// Generate JWT token
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    wardNo: user.ward_no,
    userType: user.user_type,
    status: user.status,
  };

  return jwt.encode(payload, JWT_SECRET);
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.decode(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Signup - Create user after OTP verification
export const signupUser = async (userData) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      name,
      email,
      phone,
      wardNo,
      password,
    } = userData;

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      throw new Error('User with this email or phone already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = uuidv4();
    const result = await client.query(
      `INSERT INTO users (id, name, email, phone, password_hash, user_type, ward_no, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, name, email, phone, user_type, ward_no, status, created_at`,
      [userId, name, email, phone, passwordHash, 'ADMIN', wardNo, 'PENDING']
    );

    await client.query('COMMIT');

    const user = result.rows[0];
    const token = generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        wardNo: user.ward_no,
        userType: user.user_type,
        status: user.status,
      },
      token,
      message: 'Signup successful. Awaiting admin approval.',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Login - Authenticate user
export const loginUser = async (email, password) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, password_hash, user_type, ward_no, status, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    // Check if user is approved
    if (user.status !== 'APPROVED') {
      throw new Error(`Account is ${user.status.toLowerCase()}. Please wait for admin approval.`);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const token = generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        wardNo: user.ward_no,
        userType: user.user_type,
        status: user.status,
      },
      token,
      message: 'Login successful',
    };
  } catch (error) {
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, user_type, ward_no, status, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      wardNo: user.ward_no,
      userType: user.user_type,
      status: user.status,
    };
  } catch (error) {
    throw error;
  }
};

// Reset user password
export const resetUserPassword = async (email, newPassword) => {
  try {
    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    const updateResult = await pool.query(
      `UPDATE users 
       SET password_hash = $1
       WHERE id = $2
       RETURNING id, email`,
      [passwordHash, user.id]
    );

    if (updateResult.rows.length === 0) {
      throw new Error('Failed to reset password');
    }

    return {
      success: true,
      message: 'Password has been reset successfully'
    };
  } catch (error) {
    throw error;
  }
};
