const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const { uploadCategoryImage } = require('../middleware/uploadMiddleware');

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/', optionalAuth, getCategories);
router.get('/:slug', getCategory);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.post('/', protect, isAdmin, uploadCategoryImage, createCategory);
router.put('/:id', protect, isAdmin, uploadCategoryImage, updateCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);

module.exports = router;
