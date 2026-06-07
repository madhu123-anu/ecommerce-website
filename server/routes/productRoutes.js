const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getRelatedProducts,
  getNewArrivals,
  getBestSellers,
  deleteProductImage,
  getPlaceholderImage,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const { uploadMultiple } = require('../middleware/uploadMiddleware');
const { productValidator } = require('../utils/validators');

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/image-placeholder/:text', getPlaceholderImage);
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProduct);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.post('/', protect, isAdmin, uploadMultiple, productValidator, createProduct);
router.put('/:id', protect, isAdmin, uploadMultiple, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);
router.delete('/:id/images/:publicId', protect, isAdmin, deleteProductImage);

module.exports = router;
