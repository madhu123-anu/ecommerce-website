const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { mockProducts } = require('../utils/mockData');

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = asyncHandler(async (req, res) => {
  if (global.useMockData || mongoose.connection.readyState !== 1) {
    if (!global.mockWishlists) global.mockWishlists = {};
    const userId = req.user._id.toString();
    if (!global.mockWishlists[userId]) {
      global.mockWishlists[userId] = { user: req.user._id, products: [] };
    }
    const wishlist = global.mockWishlists[userId];
    const populatedProducts = wishlist.products.map(id => {
      return mockProducts.find(p => p._id === id.toString());
    }).filter(Boolean);
    return res.status(200).json({
      success: true,
      count: populatedProducts.length,
      wishlist: { ...wishlist, products: populatedProducts },
    });
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
    path: 'products',
    select: 'title images price discountPrice ratings numReviews stock isActive',
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  res.status(200).json({
    success: true,
    count: wishlist.products.length,
    wishlist,
  });
});

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist/:productId
 * @access  Private
 */
const addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  if (global.useMockData || mongoose.connection.readyState !== 1) {
    const product = mockProducts.find((p) => p._id === productId);
    if (!product || !product.isActive) {
      const error = new Error('Product not found or unavailable');
      error.statusCode = 404;
      return next(error);
    }

    if (!global.mockWishlists) global.mockWishlists = {};
    const userId = req.user._id.toString();
    if (!global.mockWishlists[userId]) {
      global.mockWishlists[userId] = { user: req.user._id, products: [] };
    }
    const wishlist = global.mockWishlists[userId];
    const alreadyInWishlist = wishlist.products.some(
      (p) => p.toString() === productId
    );

    if (alreadyInWishlist) {
      return res.status(200).json({
        success: true,
        message: 'Product already in wishlist',
        count: wishlist.products.length,
      });
    }

    wishlist.products.push(productId);
    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      count: wishlist.products.length,
    });
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    const error = new Error('Product not found or unavailable');
    error.statusCode = 404;
    return next(error);
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, products: [] });
  }

  const alreadyInWishlist = wishlist.products.some(
    (p) => p.toString() === productId
  );

  if (alreadyInWishlist) {
    return res.status(200).json({
      success: true,
      message: 'Product already in wishlist',
      count: wishlist.products.length,
    });
  }

  wishlist.products.push(productId);
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist',
    count: wishlist.products.length,
  });
});

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  if (global.useMockData || mongoose.connection.readyState !== 1) {
    if (!global.mockWishlists) global.mockWishlists = {};
    const userId = req.user._id.toString();
    if (!global.mockWishlists[userId]) {
      global.mockWishlists[userId] = { user: req.user._id, products: [] };
    }
    const wishlist = global.mockWishlists[userId];
    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    );
    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      count: wishlist.products.length,
    });
  }

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    const error = new Error('Wishlist not found');
    error.statusCode = 404;
    return next(error);
  }

  wishlist.products = wishlist.products.filter(
    (p) => p.toString() !== productId
  );
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist',
    count: wishlist.products.length,
  });
});

/**
 * @desc    Move product from wishlist to cart
 * @route   POST /api/wishlist/:productId/move-to-cart
 * @access  Private
 */
const moveToCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    const error = new Error('Product not found or unavailable');
    error.statusCode = 404;
    return next(error);
  }

  if (product.stock < 1) {
    const error = new Error('Product is out of stock');
    error.statusCode = 400;
    return next(error);
  }

  // Remove from wishlist
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (wishlist) {
    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    );
    await wishlist.save();
  }

  // Add to cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const itemPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const existingIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += 1;
    cart.items[existingIndex].price = itemPrice;
  } else {
    cart.items.push({ product: productId, quantity: 1, price: itemPrice });
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Product moved to cart',
    wishlistCount: wishlist ? wishlist.products.length : 0,
    cartItemCount: cart.items.reduce((acc, item) => acc + item.quantity, 0),
  });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
};
