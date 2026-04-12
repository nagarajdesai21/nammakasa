import pool from '../config/database.js';
import { sendOtpEmail } from '../config/email.js';
import { v4 as uuidv4 } from 'uuid';

// Generate a random OTP
export const generateOTP = () => {
  const length = parseInt(process.env.OTP_LENGTH) || 6;
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
};

// Send OTP to email
export const sendOTP = async (email) => {
  try {
    const otp = generateOTP();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Store OTP in database
    await pool.query(
      `INSERT INTO otp_verifications (id, email, otp, expires_at, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (email) DO UPDATE SET
       otp = $3,
       expires_at = $4,
       attempts = 0,
       is_used = false,
       updated_at = NOW()`,
      [uuidv4(), email, otp, expiresAt]
    );

    // Send email
    await sendOtpEmail(email, otp);

    return {
      success: true,
      message: 'OTP sent to your email'
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const result = await pool.query(
      `SELECT id, otp, expires_at, is_used, attempts FROM otp_verifications
       WHERE email = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      return {
        valid: false,
        message: 'No OTP found for this email'
      };
    }

    const record = result.rows[0];

    // Check if OTP is already used
    if (record.is_used) {
      return {
        valid: false,
        message: 'OTP has already been used'
      };
    }

    // Check if OTP has expired
    if (new Date() > new Date(record.expires_at)) {
      return {
        valid: false,
        message: 'OTP has expired'
      };
    }

    // Check attempts (max 3)
    if (record.attempts >= 3) {
      return {
        valid: false,
        message: 'Max attempts exceeded. Please request a new OTP'
      };
    }

    // Check if OTP matches
    if (record.otp !== otp) {
      // Increment attempts
      await pool.query(
        `UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1`,
        [record.id]
      );
      return {
        valid: false,
        message: 'Invalid OTP'
      };
    }

    // Mark OTP as used
    await pool.query(
      `UPDATE otp_verifications SET is_used = true, updated_at = NOW() WHERE id = $1`,
      [record.id]
    );

    return {
      valid: true,
      message: 'OTP verified successfully'
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Cleanup expired OTPs (run this periodically)
export const cleanupExpiredOTPs = async () => {
  try {
    await pool.query(
      `DELETE FROM otp_verifications WHERE expires_at < NOW()`
    );
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
  }
};
