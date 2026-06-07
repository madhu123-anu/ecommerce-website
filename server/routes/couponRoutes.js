const express = require('express');
const router = express.Router();
const {
  applyCoupon,
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
} = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const { couponValidator } = require('../utils/validators');

// ── User routes ───────────────────────────────────────────────────────────────
router.post('/apply', protect, applyCoupon);
router.post('/validate', protect, applyCoupon);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/', protect, isAdmin, adminGetCoupons);
router.post('/', protect, isAdmin, couponValidator, adminCreateCoupon);
router.put('/:id', protect, isAdmin, adminUpdateCoupon);
router.delete('/:id', protect, isAdmin, adminDeleteCoupon);

module.exports = router;
