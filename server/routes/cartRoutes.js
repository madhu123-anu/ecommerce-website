const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  syncCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart routes are protected
router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.post('/sync', syncCart);
router.put('/:itemId', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/:itemId', removeFromCart);
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);

module.exports = router;
