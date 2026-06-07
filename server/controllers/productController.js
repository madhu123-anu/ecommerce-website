const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const APIFeatures = require('../utils/apiFeatures');
const { deleteImage } = require('../middleware/uploadMiddleware');
const { mockProducts } = require('../utils/mockData');

const processProductImages = (productsOrProduct) => {
  if (!productsOrProduct) return productsOrProduct;
  
  const imageMapping = [
    { keyword: 'Headphones', url: '/images/headphones.jpg' },
    { keyword: 'iPhone 15', url: '/images/iphone.jpg' },
    { keyword: 'Maxi Dress', url: '/images/dress.jpg' },
    { keyword: 'Leather Motorcycle Jacket', url: '/images/jacket.jpg' },
    { keyword: 'Nike Air Max', url: '/images/shoes.jpg' },
    { keyword: 'Ceramic Vase', url: '/images/vase.jpg' },
    { keyword: 'Lipstick', url: '/images/lipstick.jpg' },
    { keyword: 'Yoga Mat', url: '/images/yogamat.jpg' },
    { keyword: 'Atomic Habits', url: '/images/book_habits.jpg' },
    { keyword: 'Millennium Falcon', url: '/images/lego_falcon.jpg' },
    { keyword: 'Monopoly', url: '/images/monopoly.jpg' },
    { keyword: 'Ethiopian Whole Bean', url: '/images/coffee.jpg' },
    { keyword: 'Adidas Ultraboost', url: '/images/shoes_adidas.jpg' },
    { keyword: 'Puma Classic', url: '/images/shoes_puma.jpg' },
    { keyword: 'iPad Air', url: '/images/ipad.jpg' },
    { keyword: 'The Alchemist', url: '/images/book_alchemist.jpg' },
    { keyword: 'Statue of Liberty', url: '/images/lego_statue.jpg' },
    { keyword: 'Matcha Green Tea', url: '/images/matcha.jpg' },
    { keyword: 'Watch', url: '/images/watch.jpg' },
    { keyword: 'Camera', url: '/images/camera.jpg' },
    { keyword: 'Sunglasses', url: '/images/sunglasses.jpg' },
    { keyword: 'Keyboard', url: '/images/keyboard.jpg' }
  ];

  const processSingle = (p) => {
    const pObj = p.toObject ? p.toObject() : { ...p };
    const titleText = pObj.title || pObj.name || '';
    
    const match = imageMapping.find(m => titleText.toLowerCase().includes(m.keyword.toLowerCase()));
    const imageUrl = match ? match.url : '/images/shoes.jpg';

    pObj.images = [{
      public_id: pObj.images?.[0]?.public_id || 'placeholder',
      url: imageUrl
    }];
    return pObj;
  };

  if (Array.isArray(productsOrProduct)) {
    return productsOrProduct.map(processSingle);
  }
  return processSingle(productsOrProduct);
};

// @desc    Get all products with filters/sort/pagination
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    console.log('🔍 GET /api/products query:', req.query);
    if (global.useMockData || mongoose.connection.readyState !== 1) {
      console.log('⚠️ Database offline: Serving mock products list');
      let products = [...mockProducts];
      
      if (req.query.category) {
        const categorySlugs = req.query.category.split(',').map((s) => s.trim());
        products = products.filter((p) => 
          categorySlugs.includes(p.category.slug) || 
          categorySlugs.includes(p.category._id.toString())
        );
      }
      
      if (req.query.search) {
        const searchVal = req.query.search.toLowerCase();
        products = products.filter((p) => 
          p.title.toLowerCase().includes(searchVal) || 
          p.description.toLowerCase().includes(searchVal) ||
          p.brand.toLowerCase().includes(searchVal)
        );
      }

      if (req.query.onSale === 'true') {
        products = products.filter((p) => p.discountPrice && p.discountPrice < p.price);
      }

      return res.json({
        success: true,
        page: 1,
        pages: 1,
        total: products.length,
        products,
      });
    }

    // Resolve category slugs to ObjectIds if present
    if (req.query.category) {
      const categorySlugs = req.query.category.split(',').map((s) => s.trim());
      const mongoose = require('mongoose');
      const validObjectIds = [];
      categorySlugs.forEach((slug) => {
        if (mongoose.Types.ObjectId.isValid(slug)) {
          validObjectIds.push(slug);
        }
      });

      const categories = await Category.find({
        $or: [
          { slug: { $in: categorySlugs } },
          { _id: { $in: validObjectIds } },
        ],
      });

      const categoryIds = categories.map((c) => c._id);
      if (categoryIds.length > 0) {
        req.query.category = categoryIds;
      } else {
        // If query was passed but didn't match any category, set a non-existent ID to return empty array
        req.query.category = [new mongoose.Types.ObjectId()];
      }
    }

    const features = new APIFeatures(
      Product.find().populate('category', 'name slug'),
      req.query
    );

    features.search().filter().sort();
    await features.paginate();

    const products = await features.query;

    res.json({
      success: true,
      ...features.pagination,
      products: processProductImages(products),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProduct = async (req, res, next) => {
  try {
    if (global.useMockData || mongoose.connection.readyState !== 1) {
      const product = mockProducts.find((p) => p._id === req.params.id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      const productObj = {
        ...product,
        reviews: [
          {
            _id: 'rev1',
            rating: 5,
            comment: 'Very elegant and highly recommended product! Fits perfectly and looks super premium.',
            title: 'Stunning!',
            user: { name: 'Customer Reviewer', avatar: '' },
            createdAt: new Date().toISOString(),
          },
        ],
      };
      return res.json({ success: true, product: productObj });
    }

    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name avatar' },
        options: { sort: { createdAt: -1 }, limit: 10 },
      });

    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product: processProductImages(product) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
const getFeaturedProducts = async (req, res, next) => {
  try {
    if (global.useMockData || mongoose.connection.readyState !== 1) {
      const products = mockProducts.filter((p) => p.isFeatured).slice(0, 8);
      return res.json({ success: true, products });
    }

    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .sort('-createdAt')
      .limit(8);

    res.json({ success: true, products: processProductImages(products) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
const getNewArrivals = async (req, res, next) => {
  try {
    if (global.useMockData || mongoose.connection.readyState !== 1) {
      const products = [...mockProducts].reverse().slice(0, 8);
      return res.json({ success: true, products });
    }

    const products = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .sort('-createdAt')
      .limit(8);

    res.json({ success: true, products: processProductImages(products) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get best sellers
// @route   GET /api/products/best-sellers
const getBestSellers = async (req, res, next) => {
  try {
    if (global.useMockData || mongoose.connection.readyState !== 1) {
      const products = [...mockProducts].sort((a, b) => b.ratings - a.ratings).slice(0, 8);
      return res.json({ success: true, products });
    }

    const products = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .sort('-numReviews -ratings')
      .limit(8);

    res.json({ success: true, products: processProductImages(products) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
const getRelatedProducts = async (req, res, next) => {
  try {
    if (global.useMockData || mongoose.connection.readyState !== 1) {
      const product = mockProducts.find((p) => p._id === req.params.id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      const related = mockProducts
        .filter((p) => p.category._id === product.category._id && p._id !== product._id)
        .slice(0, 4);
      return res.json({ success: true, products: related });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .populate('category', 'name slug')
      .limit(4);

    res.json({ success: true, products: processProductImages(related) });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (Admin)
// @route   POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const { title, description, brand, category, price, discountPrice, stock, SKU, specifications, tags, isFeatured } = req.body;

    // Build images array from uploaded files
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push({ public_id: file.filename, url: file.path });
      });
    }

    if (images.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one product image is required' });
    }

    // Parse specifications if sent as JSON string
    let specs = {};
    if (specifications) {
      try {
        specs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch {}
    }

    // Parse tags
    let tagsArr = [];
    if (tags) {
      tagsArr = typeof tags === 'string' ? tags.split(',').map((t) => t.trim().toLowerCase()) : tags;
    }

    const product = await Product.create({
      title,
      description,
      brand,
      category,
      price: parseFloat(price),
      discountPrice: parseFloat(discountPrice) || 0,
      images,
      stock: parseInt(stock),
      SKU: SKU.toUpperCase(),
      specifications: specs,
      tags: tagsArr,
      isFeatured: isFeatured === 'true' || isFeatured === true,
    });

    await product.populate('category', 'name slug');

    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const updates = { ...req.body };

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({ public_id: file.filename, url: file.path }));
      updates.images = [...(product.images || []), ...newImages];
    }

    // Remove specific images if requested
    if (req.body.removeImages) {
      const toRemove = JSON.parse(req.body.removeImages);
      for (const publicId of toRemove) {
        await deleteImage(publicId);
      }
      updates.images = (updates.images || product.images).filter((img) => !toRemove.includes(img.public_id));
    }

    if (updates.specifications && typeof updates.specifications === 'string') {
      try { updates.specifications = JSON.parse(updates.specifications); } catch {}
    }

    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map((t) => t.trim().toLowerCase());
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    res.json({ success: true, message: 'Product updated', product: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Delete all images from Cloudinary
    for (const image of product.images) {
      await deleteImage(image.public_id);
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all brands (for filter sidebar)
// @route   GET /api/products/brands
const getBrands = async (req, res, next) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true });
    res.json({ success: true, brands: brands.sort() });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product image (Admin)
// @route   DELETE /api/products/:id/images/:publicId
const deleteProductImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Call Cloudinary delete
    await deleteImage(req.params.publicId);

    // Remove from array
    product.images = product.images.filter((img) => img.public_id !== req.params.publicId);
    await product.save();

    res.json({ success: true, message: 'Image deleted successfully', product });
  } catch (error) {
    next(error);
  }
};

const getPlaceholderImage = (req, res) => {
  const text = req.params.text || 'Product';
  
  const colors = [
    { start: '#a855f7', end: '#6366f1' }, // purple to indigo
    { start: '#ec4899', end: '#be185d' }, // pink to deep pink
    { start: '#0ea5e9', end: '#1d4ed8' }, // sky to blue
    { start: '#10b981', end: '#047857' }, // emerald to green
    { start: '#f59e0b', end: '#b45309' }, // amber to brown
  ];
  
  const cleanText = text.replace(/[^a-zA-Z0-9\s-_]/g, '');
  const sum = cleanText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = colors[Math.abs(sum) % colors.length];

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color.start}" />
        <stop offset="100%" stop-color="${color.end}" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="900" fill="#ffffff">${cleanText.substring(0, 15)}</text>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="500" fill="#e2e8f0" letter-spacing="2">PREMIUM PRODUCT</text>
  </svg>`);
};

module.exports = {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getRelatedProducts,
  getNewArrivals,
  getBestSellers,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getBrands,
  getPlaceholderImage,
};
