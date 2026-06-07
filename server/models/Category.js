const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, default: '' },
    image: {
      public_id: { type: String, default: '' },
      url: { type: String, default: '' },
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    icon: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Auto-generate slug
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s]+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
