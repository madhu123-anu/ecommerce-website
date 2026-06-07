const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stripePaymentIntentId: { type: String, default: '' },
    stripeChargeId: { type: String, default: '' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
    },
    refundId: { type: String, default: '' },
    refundedAt: Date,
    refundAmount: { type: Number, default: 0 },
    metadata: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
