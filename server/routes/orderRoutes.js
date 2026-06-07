const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAdminOrders,
  updateOrderStatus,
  getDashboardStats,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// ── User routes ───────────────────────────────────────────────────────────────
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/', protect, isAdmin, getAdminOrders);
router.get('/admin/dashboard', protect, isAdmin, getDashboardStats);
router.put('/:id/status', protect, isAdmin, updateOrderStatus);

module.exports = router;
