const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidator, loginValidator } = require('../utils/validators');

// @route   POST /api/auth/register
router.post('/register', authLimiter, registerValidator, register);

// @route   POST /api/auth/login
router.post('/login', authLimiter, loginValidator, login);

// @route   POST /api/auth/logout
router.post('/logout', protect, logout);

// @route   POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, forgotPassword);

// @route   PUT /api/auth/reset-password/:token
router.put('/reset-password/:token', authLimiter, resetPassword);

// @route   GET /api/auth/verify-email/:token
router.get('/verify-email/:token', verifyEmail);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
