const { body, param } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and number'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
];

const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const resetPasswordValidator = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and number'),
];

const productValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').notEmpty().withMessage('Description is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('category').isMongoId().withMessage('Valid category ID required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('discountPrice').optional().isFloat({ min: 0 }).withMessage('Discount price must be positive'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('SKU').trim().notEmpty().withMessage('SKU is required'),
];

const reviewValidator = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required').isLength({ max: 1000 }),
  body('title').optional().isLength({ max: 100 }),
];

const addressValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('street').trim().notEmpty().withMessage('Street is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('zip').trim().notEmpty().withMessage('ZIP code is required'),
];

const couponValidator = [
  body('code').trim().notEmpty().withMessage('Coupon code is required').toUpperCase(),
  body('discountType').isIn(['percentage', 'fixed', 'free_shipping']).withMessage('Invalid discount type'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
  body('expireDate').isISO8601().toDate().withMessage('Valid expiration date is required'),
];

// Validate and extract errors
const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  productValidator,
  reviewValidator,
  addressValidator,
  couponValidator,
  handleValidationErrors,
};
