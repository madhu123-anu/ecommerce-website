const express = require('express');
const router = express.Router();
const {
  createIntent,
  handleWebhook,
  getPaymentHistory,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// ⚠️ Stripe webhook MUST use raw body — mount at express.raw() in server.js
// The /webhook route is mounted directly in server.js with express.raw() middleware

// @route   POST /api/payments/create-intent
router.post('/create-intent', protect, createIntent);

// @route   GET /api/payments/history
router.get('/history', protect, getPaymentHistory);

// @route   POST /api/payments/webhook
// NOTE: This endpoint is mounted separately in server.js with express.raw() body parser
router.post('/webhook', handleWebhook);

module.exports = router;
