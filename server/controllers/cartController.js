const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { mockProducts } = require('../utils/mockData');

// Helper: populate cart
const populateCart = (query) =>
  query.populate('items.product', 'title images price discountPrice stock isActive brand').populate('coupon', 'code discountType discountValue');

// @desc    Get user cart
// @route   GET /api/cart
const getCart = async (req, res, next) => {
  try {
    if (global.useMockData || mongoose.connection.readyState !== 1) {
      if (!global.mockCarts) global.mockCarts = {};
      const userId = req.user._id.toString();
      if (!global.mockCarts[userId]) {
        global.mockCarts[userId] = { user: req.user._id, items: [], coupon: null };
      }
      const cart = global.mockCarts[userId];
      const populatedItems = cart.items.map(item => {
        const p = mockProducts.find(prod => prod._id === (item.product?._id || item.product).toString());
        return { ...item, product: p };
      });
      return res.json({ success: true, cart: { ...cart, items: populatedItems } });
    }

    let cart = await populateCart(Cart.findOne({ user: req.user._id }));
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (global.useMockData || mongoose.connection.readyState !== 1) {
      const product = mockProducts.find((p) => p._id === productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock` });
      }

      if (!global.mockCarts) global.mockCarts = {};
      const userId = req.user._id.toString();
      if (!global.mockCarts[userId]) {
        global.mockCarts[userId] = { user: req.user._id, items: [], coupon: null };
      }
      const cart = global.mockCarts[userId];
      const price = product.discountPrice > 0 ? product.discountPrice : product.price;
      const existingIndex = cart.items.findIndex((item) => (item.product?._id || item.product).toString() === productId);

      if (existingIndex >= 0) {
        const newQty = cart.items[existingIndex].quantity + parseInt(quantity);
        if (newQty > product.stock) {
          return res.status(400).json({ success: false, message: `Cannot add more. Only ${product.stock} available.` });
        }
        cart.items[existingIndex].quantity = newQty;
      } else {
        cart.items.push({ _id: 'item_' + Date.now(), product: productId, quantity: parseInt(quantity), price });
      }

      const populatedItems = cart.items.map(item => {
        const p = mockProducts.find(prod => prod._id === (item.product?._id || item.product).toString());
        return { ...item, product: p };
      });
      return res.json({ success: true, message: 'Added to cart', cart: { ...cart, items: populatedItems } });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock` });
    }

    const price = product.discountPrice > 0 ? product.discountPrice : product.price;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (existingIndex >= 0) {
      const newQty = cart.items[existingIndex].quantity + parseInt(quantity);
      if (newQty > product.stock) {
        return res.status(400).json({ success: false, message: `Cannot add more. Only ${product.stock} available.` });
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity: parseInt(quantity), price });
    }

    await cart.save();
    cart = await populateCart(Cart.findById(cart._id));

    res.json({ success: true, message: 'Added to cart', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });

    const product = await Product.findById(item.product);
    if (product && quantity > product.stock) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock` });
    }

    item.quantity = parseInt(quantity);
    await cart.save();

    const updated = await populateCart(Cart.findById(cart._id));
    res.json({ success: true, message: 'Cart updated', cart: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();

    const updated = await populateCart(Cart.findById(cart._id));
    res.json({ success: true, message: 'Item removed', cart: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    const cart = await populateCart(Cart.findOne({ user: req.user._id }));
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const validResult = await coupon.isValid(req.user._id, subtotal);

    if (!validResult.valid) {
      return res.status(400).json({ success: false, message: validResult.message });
    }

    const discount = coupon.calcDiscount(subtotal);
    cart.coupon = coupon._id;
    await cart.save();

    res.json({
      success: true,
      message: `Coupon applied! You save $${discount.toFixed(2)}`,
      discount,
      coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
const removeCoupon = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { coupon: null });
    res.json({ success: true, message: 'Coupon removed' });
  } catch (error) {
    next(error);
  }
};

const syncCart = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (global.useMockData || mongoose.connection.readyState !== 1) {
      if (!global.mockCarts) global.mockCarts = {};
      const userId = req.user._id.toString();

      const newItems = [];
      for (const item of items) {
        const productId = (item.product?._id || item.product || '').toString();
        const product = mockProducts.find(p => p._id === productId);
        if (product && product.isActive) {
          const price = product.discountPrice > 0 ? product.discountPrice : product.price;
          newItems.push({
            product: productId,
            quantity: parseInt(item.quantity) || 1,
            price,
          });
        }
      }

      global.mockCarts[userId] = { user: req.user._id, items: newItems, coupon: null };
      
      const populatedItems = newItems.map(item => {
        const p = mockProducts.find(prod => prod._id === item.product);
        return { ...item, product: p };
      });
      return res.json({ success: true, cart: { ...global.mockCarts[userId], items: populatedItems } });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const newItems = [];
    for (const item of items) {
      const productId = item.product?._id || item.product;
      const product = await Product.findById(productId);
      if (product && product.isActive) {
        const price = product.discountPrice > 0 ? product.discountPrice : product.price;
        newItems.push({
          product: productId,
          quantity: parseInt(item.quantity) || 1,
          price,
        });
      }
    }

    cart.items = newItems;
    await cart.save();

    const populated = await populateCart(Cart.findById(cart._id));
    res.json({ success: true, cart: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon, removeCoupon, syncCart };
