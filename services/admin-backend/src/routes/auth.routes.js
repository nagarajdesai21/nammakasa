import express from 'express';
import { sendOTP, verifyOTP } from '../services/otpService.js';
import { signupUser, loginUser, getUserById, resetUserPassword } from '../services/authService.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Send OTP to email
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const result = await sendOTP(email);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const result = await verifyOTP(email, otp);
    
    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Signup - Create user after OTP verification
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, wardNo, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !phone || !wardNo || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Phone must be 10 digits' });
    }

    // Create user
    const result = await signupUser({ name, email, phone, wardNo, password });
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error:', error);
    const message = error.message || 'Signup failed';
    res.status(400).json({ error: message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await loginUser(email, password);
    
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    const message = error.message || 'Login failed';
    const statusCode = message.includes('not found') ? 401 : 400;
    res.status(statusCode).json({ error: message });
  }
});

// Get current user (protected route)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    console.error('Error:', error);
    res.status(404).json({ error: 'User not found' });
  }
});

// Verify token
router.post('/verify-token', authMiddleware, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Validation
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Reset password (OTP verification already done in frontend)
    const result = await resetUserPassword(email, newPassword);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    const message = error.message || 'Failed to reset password';
    res.status(400).json({ error: message });
  }
});

export default router;
