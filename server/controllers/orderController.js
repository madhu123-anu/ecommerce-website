const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendOrderConfirmationEmail, sendOrderStatusEmail } = require('../services/emailService');
const { mockProducts } = require('../utils/mockData');

const TAX_RATE = parseFloat(process.env.TAX_RATE) || 0.10;
const SHIPPING_THRESHOLD = parseFloat(process.env.SHIPPING_THRESHOLD) || 50;
const SHIPPING_COST = parseFloat(process.env.SHIPPING_COST) || 5.99;

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, paymentMethod, notes } = req.body;

  if (!shippingAddress || !paymentMethod) {
    const error = new Error('Shipping address and payment method are required');
    error.statusCode = 400;
    return next(error);
  }

  if (global.useMockData || mongoose.connection.readyState !== 1) {
    console.log('⚠️ Database offline/Mock mode: Placing mock order');
    if (!global.mockCarts) global.mockCarts = {};
    const userId = req.user._id.toString();
    const cart = global.mockCarts[userId] || { items: [] };

    if (cart.items.length === 0) {
      const error = new Error('Your cart is empty');
      error.statusCode = 400;
      return next(error);
    }

    const orderItems = cart.items.map(item => {
      const p = mockProducts.find(prod => prod._id === (item.product?._id || item.product).toString());
      return {
        product: p?._id || item.product,
        title: p?.title || 'Product',
        image: p?.images[0]?.url || '',
        price: p?.price || item.price,
        discountPrice: p?.discountPrice || 0,
        quantity: item.quantity,
      };
    });

    let itemsPrice = orderItems.reduce((sum, item) => {
      const price = item.discountPrice > 0 ? item.discountPrice : item.price;
      return sum + price * item.quantity;
    }, 0);

    const taxPrice = Math.round(itemsPrice * TAX_RATE * 100) / 100;
    const shippingPrice = itemsPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;

    const mockOrder = {
      _id: 'mock_ord_' + Date.now(),
      orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      paymentMethod: paymentMethod || 'cod',
      items: orderItems,
      shippingAddress,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'pending',
      isPaid: false,
      user: { _id: req.user?._id || 'mock_user_1', name: req.user?.name || 'Customer', email: req.user?.email || 'customer@zora.com' },
      createdAt: new Date().toISOString()
    };

    global.mockOrders = global.mockOrders || [];
    global.mockOrders.push(mockOrder);

    // Clear mock cart
    global.mockCarts[userId] = { user: req.user._id, items: [], coupon: null };

    return res.status(201).json({ success: true, order: mockOrder });
  }

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product')
    .populate('coupon');

  if (!cart || cart.items.length === 0) {
    const error = new Error('Your cart is empty');
    error.statusCode = 400;
    return next(error);
  }

  // Validate and build order items
  const orderItems = [];
  let itemsPrice = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      const error = new Error(`Product "${item.product?.title || 'Unknown'}" is no longer available`);
      error.statusCode = 400;
      return next(error);
    }
    if (product.stock < item.quantity) {
      const error = new Error(`Insufficient stock for "${product.title}". Only ${product.stock} available.`);
      error.statusCode = 400;
      return next(error);
    }

    const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
    itemsPrice += effectivePrice * item.quantity;

    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.images[0]?.url || '',
      price: product.price,
      discountPrice: product.discountPrice,
      quantity: item.quantity,
    });
  }

  itemsPrice = Math.round(itemsPrice * 100) / 100;

  // Apply coupon discount
  let discountAmount = 0;
  let couponRef = null;
  if (cart.coupon) {
    const couponDoc = await Coupon.findById(cart.coupon._id || cart.coupon);
    if (couponDoc) {
      const validation = couponDoc.isValid(req.user._id, itemsPrice);
      if (validation.valid) {
        discountAmount = validation.discount;
        couponRef = couponDoc._id;
        couponDoc.usedCount += 1;
        couponDoc.usedBy.push(req.user._id);
        await couponDoc.save();
      }
    }
  }

  const priceAfterDiscount = itemsPrice - discountAmount;
  const shippingPrice = priceAfterDiscount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const taxPrice = Math.round(priceAfterDiscount * TAX_RATE * 100) / 100;
  const totalPrice = Math.round((priceAfterDiscount + shippingPrice + taxPrice) * 100) / 100;

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountAmount,
    totalPrice,
    coupon: couponRef,
    notes,
    isPaid: paymentMethod === 'cod' ? false : false,
    status: 'pending',
  });

  // Create payment record
  await Payment.create({
    order: order._id,
    user: req.user._id,
    amount: totalPrice,
    currency: 'usd',
    status: 'pending',
  });

  // Deduct stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null });

  // Create notification
  await Notification.create({
    user: req.user._id,
    title: 'Order Placed Successfully',
    message: `Your order #${order.orderNumber} has been placed. Total: $${totalPrice.toFixed(2)}`,
    type: 'order',
    link: `/orders/${order._id}`,
  });

  // Send confirmation email (non-blocking)
  try {
    await sendOrderConfirmationEmail(req.user, order);
  } catch (emailError) {
    console.error('Order confirmation email failed:', emailError.message);
  }

  const populatedOrder = await Order.findById(order._id)
    .populate('items.product', 'title images')
    .populate('coupon', 'code');

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    order: populatedOrder,
  });
});

/**
 * @desc    Get logged-in user's orders (paginated)
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-paymentResult')
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    orders,
  });
});

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    global.mockOrders = global.mockOrders || [];
    const order = global.mockOrders.find(o => o._id === req.params.id) || {
      _id: req.params.id,
      orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      paymentMethod: 'cod',
      totalPrice: 298.00,
      status: 'pending',
      user: { _id: req.user?._id || 'mock_user_1', name: req.user?.name || 'Customer' },
      items: [
        {
          product: { title: 'Sony WH-1000XM4 Wireless Headphones', price: 298.00 },
          quantity: 1,
          price: 298.00
        }
      ],
      createdAt: new Date().toISOString()
    };
    return res.status(200).json({ success: true, order });
  }

  const order = await Order.findById(req.params.id)
    .populate('items.product', 'title images brand')
    .populate('coupon', 'code discountType discountValue')
    .populate('user', 'name email');

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    return next(error);
  }

  // Ensure user can only see their own orders (unless admin)
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const error = new Error('Not authorized to view this order');
    error.statusCode = 403;
    return next(error);
  }

  res.status(200).json({
    success: true,
    order,
  });
});

/**
 * @desc    Cancel an order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    return next(error);
  }

  if (order.user.toString() !== req.user._id.toString()) {
    const error = new Error('Not authorized to cancel this order');
    error.statusCode = 403;
    return next(error);
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    const error = new Error(`Cannot cancel order with status "${order.status}". Only pending or confirmed orders can be cancelled.`);
    error.statusCode = 400;
    return next(error);
  }

  order.status = 'cancelled';
  order.cancelReason = req.body.cancelReason || 'Cancelled by customer';
  await order.save();

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  // Create notification
  await Notification.create({
    user: req.user._id,
    title: 'Order Cancelled',
    message: `Your order #${order.orderNumber} has been cancelled.`,
    type: 'order',
    link: `/orders/${order._id}`,
  });

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    order,
  });
});

/**
 * @desc    Get all orders (admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAdminOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
  if (req.query.isPaid) filter.isPaid = req.query.isPaid === 'true';
  if (req.query.search) {
    filter.orderNumber = { $regex: req.query.search, $options: 'i' };
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    orders,
  });
});

/**
 * @desc    Update order status (admin)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, cancelReason } = req.body;

  const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
  if (!status || !validStatuses.includes(status)) {
    const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    error.statusCode = 400;
    return next(error);
  }

  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    return next(error);
  }

  order.status = status;

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'cod') {
      order.isPaid = true;
      order.paidAt = new Date();
    }
  }

  if (status === 'cancelled') {
    order.cancelReason = cancelReason || 'Cancelled by admin';
    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
  }

  await order.save();

  // Create notification for user
  await Notification.create({
    user: order.user._id,
    title: 'Order Status Updated',
    message: `Your order #${order.orderNumber} status has been updated to: ${status.replace(/_/g, ' ')}`,
    type: 'order',
    link: `/orders/${order._id}`,
  });

  // Send status email (non-blocking)
  try {
    await sendOrderStatusEmail(order.user, order);
  } catch (emailError) {
    console.error('Order status email failed:', emailError.message);
  }

  res.status(200).json({
    success: true,
    message: `Order status updated to "${status}"`,
    order,
  });
});

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/orders/dashboard
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalRevenue,
    totalOrders,
    totalCustomers,
    totalProducts,
    monthlyOrders,
    orderStatusDistribution,
    monthlyRevenueData,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    // Total revenue (all paid orders)
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),

    // Total orders
    Order.countDocuments(),

    // Total unique customers
    User.countDocuments({ role: 'customer' }),

    // Total active products
    Product.countDocuments({ isActive: true }),

    // Orders this month
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),

    // Order status distribution
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Monthly revenue for last 12 months
    Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Recent 5 orders
    Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    // Top 5 products by revenue
    Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          title: { $first: '$items.title' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
  ]);

  // Format monthly revenue for chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueChart = monthlyRevenueData.map((item) => ({
    month: months[item._id.month - 1],
    year: item._id.year,
    revenue: Math.round(item.revenue * 100) / 100,
    orders: item.orders,
  }));

  res.status(200).json({
    success: true,
    stats: {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      monthlyOrders,
      orderStatusDistribution,
      revenueChart,
      recentOrders,
      topProducts,
    },
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAdminOrders,
  updateOrderStatus,
  getDashboardStats,
};
