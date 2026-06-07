const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updatePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getNotifications,
  markNotificationRead,
  adminGetUsers,
  adminGetUser,
  adminUpdateUser,
  adminDeleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');
const { addressValidator } = require('../utils/validators');

// ── User profile routes ───────────────────────────────────────────────────────
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadAvatar, updateProfile);
router.put('/update-password', protect, updatePassword);

// ── Address routes ────────────────────────────────────────────────────────────
router.post('/addresses', protect, addressValidator, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.put('/addresses/:addressId/default', protect, setDefaultAddress);

// ── Notification routes ───────────────────────────────────────────────────────
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/', protect, isAdmin, adminGetUsers);
router.get('/:id', protect, isAdmin, adminGetUser);
router.put('/:id', protect, isAdmin, adminUpdateUser);
router.delete('/:id', protect, isAdmin, adminDeleteUser);

module.exports = router;
