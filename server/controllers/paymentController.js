const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Cart = require('../models/Cart');
const asyncHandler = require('../utils/asyncHandler');
const { createPaymentIntent, retrievePaymentIntent, constructWebhookEvent } = require('../services/stripeService');
const { sendOrderConfirmationEmail } = require('../services/emailService');

/**
 * @desc    Create a Stripe PaymentIntent for an order
 * @route   POST /api/payments/create-intent
 * @access  Private
 */
const createIntent = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;

  if (!orderId) {
    const error = new Error('Order ID is required');
    error.statusCode = 400;
    return next(error);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    return next(error);
  }

  if (order.user.toString() !== req.user._id.toString()) {
    const error = new Error('Not authorized');
    error.statusCode = 403;
    return next(error);
  }

  if (order.isPaid) {
    const error = new Error('Order is already paid');
    error.statusCode = 400;
    return next(error);
  }

  const paymentIntent = await createPaymentIntent(order.totalPrice, 'usd', {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    userId: req.user._id.toString(),
  });

  // Update payment record with intent ID
  await Payment.findOneAndUpdate(
    { order: order._id },
    { stripePaymentIntentId: paymentIntent.id },
    { upsert: true }
  );

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: order.totalPrice,
  });
});

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/payments/webhook
 * @access  Public (Stripe only) — requires raw body
 */
const handleWebhook = asyncHandler(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    const error = new Error('Stripe signature missing');
    error.statusCode = 400;
    return next(error);
  }

  let event;
  try {
    event = constructWebhookEvent(req.body, signature);
  } catch (err) {
    const error = new Error(`Webhook signature verification failed: ${err.message}`);
    error.statusCode = 400;
    return next(error);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const { orderId } = paymentIntent.metadata;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.status = 'confirmed';
          order.paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: new Date().toISOString(),
            email_address: paymentIntent.receipt_email || '',
          };
          await order.save();

          // Clear user's cart on Stripe success
          await Cart.findOneAndUpdate({ user: order.user }, { items: [], coupon: null });

          // Update payment record
          await Payment.findOneAndUpdate(
            { stripePaymentIntentId: paymentIntent.id },
            {
              status: 'succeeded',
              stripeChargeId: paymentIntent.latest_charge,
            }
          );

          // Notify user
          await Notification.create({
            user: order.user,
            title: 'Payment Successful',
            message: `Payment for order #${order.orderNumber} was successful. Amount: $${order.totalPrice.toFixed(2)}`,
            type: 'payment',
            link: `/orders/${order._id}`,
          });

          // Send email
          try {
            const user = await User.findById(order.user);
            if (user) {
              await sendOrderConfirmationEmail(user, order);
            }
          } catch (emailError) {
            console.error('Webhook email failed:', emailError.message);
          }
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: 'failed' }
      );
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object;
      await Payment.findOneAndUpdate(
        { stripeChargeId: charge.id },
        {
          status: 'refunded',
          refundId: charge.refunds?.data?.[0]?.id,
          refundedAt: new Date(),
        }
      );
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  // Always return 200 to acknowledge receipt
  res.status(200).json({ received: true });
});

/**
 * @desc    Get user's payment history
 * @route   GET /api/payments/history
 * @access  Private
 */
const getPaymentHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find({ user: req.user._id })
      .populate('order', 'orderNumber totalPrice status createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    count: payments.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    payments,
  });
});

module.exports = {
  createIntent,
  handleWebhook,
  getPaymentHistory,
};
