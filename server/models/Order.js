const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  quantity: { type: Number, required: true, min: 1 },
  SKU: { type: String },
});

const shippingAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zip: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      enum: ['stripe', 'cod', 'upi', 'netbanking'],
      required: true,
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    cancelReason: String,
    notes: String,
    trackingNumber: String,
  },
  { timestamps: true }
);

// Auto-generate order number before saving
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const uid = uuidv4().replace(/-/g, '').toUpperCase().slice(0, 8);
    this.orderNumber = `ORD-${uid}`;
  }
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() });
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
