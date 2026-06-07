const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  adminGetReviews,
  adminModerateReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const { uploadReviewImages } = require('../middleware/uploadMiddleware');
const { reviewValidator } = require('../utils/validators');

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/product/:productId', getProductReviews);

// ── User routes ───────────────────────────────────────────────────────────────
router.post('/product/:productId', protect, uploadReviewImages, reviewValidator, createReview);
router.put('/:id', protect, uploadReviewImages, updateReview);
router.delete('/:id', protect, deleteReview);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/admin', protect, isAdmin, adminGetReviews);
router.put('/:id/moderate', protect, isAdmin, adminModerateReview);

module.exports = router;
