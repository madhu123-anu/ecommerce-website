const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Product title is required'], trim: true, maxlength: 200 },
    description: { type: String, required: [true, 'Description is required'] },
    brand: { type: String, required: [true, 'Brand is required'], trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: [true, 'Category is required'] },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    discountPrice: { type: Number, min: 0, default: 0 },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    stock: { type: Number, required: true, min: [0, 'Stock cannot be negative'], default: 0 },
    SKU: { type: String, unique: true, required: [true, 'SKU is required'], uppercase: true },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    specifications: { type: Map, of: String, default: {} },
    tags: [{ type: String, lowercase: true }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    seller: { type: String, default: 'ModernShop' },
    weight: { type: Number, default: 0 },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: discount percentage
productSchema.virtual('discountPercent').get(function () {
  if (this.discountPrice && this.discountPrice < this.price) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Virtual: effective price
productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice && this.discountPrice < this.price ? this.discountPrice : this.price;
});

// Virtual: reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

// Full-text search index
productSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
