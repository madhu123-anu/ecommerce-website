const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { deleteImage } = require('../middleware/uploadMiddleware');
const { mockCategories, mockProducts } = require('../utils/mockData');

// @desc    Get all categories with product counts
// @route   GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    if (global.useMockData || mongoose.connection.readyState !== 1) {
      console.log('⚠️ Database offline: Serving mock categories');
      const withCount = mockCategories.map((cat) => {
        const count = mockProducts.filter((p) => p.category._id === cat._id).length;
        return { ...cat, productCount: count };
      });
      return res.json({ success: true, categories: withCount });
    }

    const categories = await Category.find({ isActive: true }).sort('order name');

    // Add product count per category
    const withCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id, isActive: true });
        return { ...cat.toObject(), productCount: count };
      })
    );

    res.json({ success: true, categories: withCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
const getCategory = async (req, res, next) => {
  try {
    if (global.useMockData || mongoose.connection.readyState !== 1) {
      const category = mockCategories.find((c) => c.slug === req.params.slug);
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
      return res.json({ success: true, category });
    }

    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category (Admin)
// @route   POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, description, parent, icon, order } = req.body;

    let image = {};
    if (req.file) {
      image = { public_id: req.file.filename, url: req.file.path };
    }

    const category = await Category.create({ name, description, parent: parent || null, image, icon, order });
    res.status(201).json({ success: true, message: 'Category created', category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category (Admin)
// @route   PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const updates = { ...req.body };

    if (req.file) {
      if (category.image && category.image.public_id) {
        await deleteImage(category.image.public_id);
      }
      updates.image = { public_id: req.file.filename, url: req.file.path };
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Category updated', category: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productCount} products. Move products first.`,
      });
    }

    if (category.image && category.image.public_id) {
      await deleteImage(category.image.public_id);
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
