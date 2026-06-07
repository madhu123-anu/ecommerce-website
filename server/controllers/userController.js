const User = require('../models/User');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { deleteImage } = require('../middleware/uploadMiddleware');

/**
 * @desc    Get current user's profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'title price images discountPrice');

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Update profile (name, phone, avatar)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;

  // Handle avatar upload
  if (req.file) {
    const user = await User.findById(req.user._id);
    // Delete old avatar if it's not the default
    if (user.avatar && user.avatar.public_id) {
      await deleteImage(user.avatar.public_id);
    }
    updateData.avatar = {
      public_id: req.file.filename,
      url: req.file.path,
    };
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user,
  });
});

/**
 * @desc    Update password
 * @route   PUT /api/users/update-password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    const error = new Error('Current password and new password are required');
    error.statusCode = 400;
    return next(error);
  }

  if (newPassword.length < 8) {
    const error = new Error('New password must be at least 8 characters');
    error.statusCode = 400;
    return next(error);
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 401;
    return next(error);
  }

  user.password = newPassword;
  user.refreshToken = ''; // Invalidate all other sessions
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully. Please log in again.',
  });
});

/**
 * @desc    Add a new address
 * @route   POST /api/users/addresses
 * @access  Private
 */
const addAddress = asyncHandler(async (req, res, next) => {
  const { label, name, phone, street, city, state, country, zip, isDefault } = req.body;

  const user = await User.findById(req.user._id);

  if (user.addresses.length >= 10) {
    const error = new Error('Maximum 10 addresses allowed');
    error.statusCode = 400;
    return next(error);
  }

  // If setting as default, clear other defaults
  if (isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  const newAddress = {
    label: label || 'Home',
    name,
    phone,
    street,
    city,
    state,
    country: country || 'US',
    zip,
    isDefault: isDefault || user.addresses.length === 0,
  };

  user.addresses.push(newAddress);
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    addresses: user.addresses,
  });
});

/**
 * @desc    Update an address
 * @route   PUT /api/users/addresses/:addressId
 * @access  Private
 */
const updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    const error = new Error('Address not found');
    error.statusCode = 404;
    return next(error);
  }

  const { label, name, phone, street, city, state, country, zip, isDefault } = req.body;

  if (label !== undefined) address.label = label;
  if (name !== undefined) address.name = name;
  if (phone !== undefined) address.phone = phone;
  if (street !== undefined) address.street = street;
  if (city !== undefined) address.city = city;
  if (state !== undefined) address.state = state;
  if (country !== undefined) address.country = country;
  if (zip !== undefined) address.zip = zip;

  if (isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
    address.isDefault = true;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    addresses: user.addresses,
  });
});

/**
 * @desc    Delete an address
 * @route   DELETE /api/users/addresses/:addressId
 * @access  Private
 */
const deleteAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    const error = new Error('Address not found');
    error.statusCode = 404;
    return next(error);
  }

  const wasDefault = address.isDefault;
  address.deleteOne();

  // If deleted address was default, make first remaining address the default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
    addresses: user.addresses,
  });
});

/**
 * @desc    Set an address as default
 * @route   PUT /api/users/addresses/:addressId/default
 * @access  Private
 */
const setDefaultAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    const error = new Error('Address not found');
    error.statusCode = 404;
    return next(error);
  }

  user.addresses.forEach((addr) => (addr.isDefault = false));
  address.isDefault = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Default address updated',
    addresses: user.addresses,
  });
});

/**
 * @desc    Get user notifications
 * @route   GET /api/users/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id };
  if (req.query.unread === 'true') filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    unreadCount,
    page,
    totalPages: Math.ceil(total / limit),
    notifications,
  });
});

/**
 * @desc    Mark notification(s) as read
 * @route   PUT /api/users/notifications/:id/read
 * @access  Private
 */
const markNotificationRead = asyncHandler(async (req, res, next) => {
  if (req.params.id === 'all') {
    await Notification.updateMany({ user: req.user._id }, { isRead: true });
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    return next(error);
  }

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    notification,
  });
});

// ── Admin controllers ─────────────────────────────────────────────────────────

/**
 * @desc    Admin: Get all users with pagination
 * @route   GET /api/users
 * @access  Private/Admin
 */
const adminGetUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    users,
  });
});

/**
 * @desc    Admin: Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const adminGetUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-refreshToken');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    return next(error);
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Admin: Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const adminUpdateUser = asyncHandler(async (req, res, next) => {
  const { name, email, role, isVerified, phone } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    return next(error);
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (isVerified !== undefined) user.isVerified = isVerified;
  if (phone !== undefined) user.phone = phone;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    user,
  });
});

/**
 * @desc    Admin: Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const adminDeleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    return next(error);
  }

  // Prevent deleting admin accounts
  if (user.role === 'admin') {
    const error = new Error('Cannot delete admin accounts');
    error.statusCode = 403;
    return next(error);
  }

  // Delete avatar
  if (user.avatar && user.avatar.public_id) {
    await deleteImage(user.avatar.public_id);
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

module.exports = {
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
};
