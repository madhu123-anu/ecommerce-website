const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: [true, 'Rating is required'], min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 100 },
    comment: { type: String, required: [true, 'Comment is required'], maxlength: 1000 },
    images: [
      {
        public_id: { type: String },
        url: { type: String },
      },
    ],
    isApproved: { type: Boolean, default: true },
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate product average rating
reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      ratings: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      ratings: 0,
      numReviews: 0,
    });
  }
};

// Update product ratings after save/remove
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.product);
});

reviewSchema.post('remove', function () {
  this.constructor.calcAverageRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
