const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');
const { deleteImage } = require('../middleware/uploadMiddleware');

// Helper: format validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.param || e.path, message: e.msg })),
    });
    return true;
  }
  return false;
};

/**
 * @desc    Get all reviews for a product
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
const getProductReviews = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    return next(error);
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const sortMap = {
    newest: '-createdAt',
    oldest: 'createdAt',
    highest: '-rating',
    lowest: 'rating',
    helpful: '-createdAt',
  };
  const sortBy = sortMap[req.query.sort] || '-createdAt';

  const filter = { product: req.params.productId, isApproved: true };
  if (req.query.rating) filter.rating = Number(req.query.rating);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name avatar')
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  // Rating distribution
  const distribution = await Review.aggregate([
    { $match: { product: product._id, isApproved: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    ratingDistribution: distribution,
    reviews,
  });
});

/**
 * @desc    Create a review
 * @route   POST /api/reviews/product/:productId
 * @access  Private
 */
const createReview = asyncHandler(async (req, res, next) => {
  if (handleValidationErrors(req, res)) return;

  const { productId } = req.params;
  const { rating, title, comment } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    return next(error);
  }

  // Check if user has purchased the product
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    status: 'delivered',
  });

  if (!hasPurchased) {
    const error = new Error('You can only review products you have purchased and received.');
    error.statusCode = 403;
    return next(error);
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id,
  });

  if (existingReview) {
    const error = new Error('You have already reviewed this product. Please edit your existing review.');
    error.statusCode = 409;
    return next(error);
  }

  // Handle image uploads
  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map((file) => ({
      public_id: file.filename,
      url: file.path,
    }));
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating: Number(rating),
    title,
    comment,
    images,
  });

  await review.populate('user', 'name avatar');

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    review,
  });
});

/**
 * @desc    Update own review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    const error = new Error('Review not found');
    error.statusCode = 404;
    return next(error);
  }

  if (review.user.toString() !== req.user._id.toString()) {
    const error = new Error('Not authorized to update this review');
    error.statusCode = 403;
    return next(error);
  }

  const { rating, title, comment } = req.body;

  if (rating) review.rating = Number(rating);
  if (title !== undefined) review.title = title;
  if (comment) review.comment = comment;

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      public_id: file.filename,
      url: file.path,
    }));
    review.images = [...review.images, ...newImages];
  }

  await review.save();
  await review.populate('user', 'name avatar');

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    review,
  });
});

/**
 * @desc    Delete a review (own or admin)
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    const error = new Error('Review not found');
    error.statusCode = 404;
    return next(error);
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    const error = new Error('Not authorized to delete this review');
    error.statusCode = 403;
    return next(error);
  }

  // Delete review images from Cloudinary
  for (const img of review.images) {
    await deleteImage(img.public_id);
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
});

/**
 * @desc    Admin: Get all reviews with filters
 * @route   GET /api/reviews/admin
 * @access  Private/Admin
 */
const adminGetReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.isApproved !== undefined) filter.isApproved = req.query.isApproved === 'true';
  if (req.query.rating) filter.rating = Number(req.query.rating);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name email avatar')
      .populate('product', 'title images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    reviews,
  });
});

/**
 * @desc    Admin: Toggle review approval
 * @route   PUT /api/reviews/:id/moderate
 * @access  Private/Admin
 */
const adminModerateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    const error = new Error('Review not found');
    error.statusCode = 404;
    return next(error);
  }

  review.isApproved = !review.isApproved;
  await review.save();

  res.status(200).json({
    success: true,
    message: `Review ${review.isApproved ? 'approved' : 'hidden'} successfully`,
    isApproved: review.isApproved,
  });
});

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  adminGetReviews,
  adminModerateReview,
};
