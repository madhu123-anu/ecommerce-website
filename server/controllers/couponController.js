const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Validate and apply a coupon (public use)
 * @route   POST /api/coupons/apply
 * @access  Private
 */
const applyCoupon = asyncHandler(async (req, res, next) => {
  const { code, orderAmount } = req.body;

  if (!code) {
    const error = new Error('Coupon code is required');
    error.statusCode = 400;
    return next(error);
  }

  if (!orderAmount || orderAmount <= 0) {
    const error = new Error('Valid order amount is required');
    error.statusCode = 400;
    return next(error);
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon) {
    const error = new Error('Invalid coupon code');
    error.statusCode = 404;
    return next(error);
  }

  const validation = coupon.isValid(req.user._id, Number(orderAmount));

  if (!validation.valid) {
    const error = new Error(validation.message);
    error.statusCode = 400;
    return next(error);
  }

  res.status(200).json({
    success: true,
    message: validation.message,
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount: validation.discount,
    },
    newTotal: Math.max(0, Number(orderAmount) - validation.discount),
  });
});

/**
 * @desc    Admin: Get all coupons
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
const adminGetCoupons = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.discountType) filter.discountType = req.query.discountType;
  if (req.query.search) {
    filter.code = { $regex: req.query.search, $options: 'i' };
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Coupon.countDocuments(filter),
  ]);

  // Enrich with validity status
  const now = new Date();
  const enrichedCoupons = coupons.map((coupon) => ({
    ...coupon,
    isExpired: coupon.expiresAt < now,
    isExhausted: coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses,
  }));

  res.status(200).json({
    success: true,
    count: coupons.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    coupons: enrichedCoupons,
  });
});

/**
 * @desc    Admin: Create a coupon
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
const adminCreateCoupon = asyncHandler(async (req, res, next) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    maxUses,
    isActive,
    expiresAt,
  } = req.body;

  // Validate percentage discount
  if (discountType === 'percentage' && (discountValue < 1 || discountValue > 100)) {
    const error = new Error('Percentage discount must be between 1 and 100');
    error.statusCode = 400;
    return next(error);
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    description,
    discountType,
    discountValue: Number(discountValue),
    minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
    maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
    maxUses: maxUses ? Number(maxUses) : null,
    isActive: isActive !== undefined ? isActive : true,
    expiresAt: new Date(expiresAt),
  });

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    coupon,
  });
});

/**
 * @desc    Admin: Update a coupon
 * @route   PUT /api/coupons/:id
 * @access  Private/Admin
 */
const adminUpdateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    const error = new Error('Coupon not found');
    error.statusCode = 404;
    return next(error);
  }

  const updatable = ['description', 'discountType', 'discountValue', 'minOrderAmount', 'maxDiscountAmount', 'maxUses', 'isActive', 'expiresAt'];
  updatable.forEach((field) => {
    if (req.body[field] !== undefined) {
      coupon[field] = req.body[field];
    }
  });

  if (req.body.code) {
    coupon.code = req.body.code.toUpperCase().trim();
  }

  await coupon.save();

  res.status(200).json({
    success: true,
    message: 'Coupon updated successfully',
    coupon,
  });
});

/**
 * @desc    Admin: Delete a coupon
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
const adminDeleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    const error = new Error('Coupon not found');
    error.statusCode = 404;
    return next(error);
  }

  await coupon.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully',
  });
});

module.exports = {
  applyCoupon,
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
};
