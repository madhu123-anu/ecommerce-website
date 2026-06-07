const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: '' },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Discount type is required'],
    },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: null },
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: [true, 'Expiry date is required'] },
  },
  { timestamps: true }
);

// Check if coupon is valid
couponSchema.methods.isValid = async function (userId, orderAmount) {
  const now = new Date();

  if (!this.isActive) return { valid: false, message: 'This coupon is inactive' };
  if (this.expiresAt < now) return { valid: false, message: 'This coupon has expired' };
  if (orderAmount < this.minOrderAmount)
    return { valid: false, message: `Minimum order amount is $${this.minOrderAmount}` };
  if (this.maxUses !== null && this.usedCount >= this.maxUses)
    return { valid: false, message: 'This coupon has reached its usage limit' };
  if (userId && this.usedBy.includes(userId.toString()))
    return { valid: false, message: 'You have already used this coupon' };

  return { valid: true };
};

// Calculate discount amount
couponSchema.methods.calcDiscount = function (orderAmount) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscountAmount) discount = Math.min(discount, this.maxDiscountAmount);
  } else {
    discount = this.discountValue;
  }
  return Math.min(discount, orderAmount);
};

module.exports = mongoose.model('Coupon', couponSchema);
