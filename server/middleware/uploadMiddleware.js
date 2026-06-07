const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cloudinary storage for products
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'modernshop/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }],
  },
});

// Cloudinary storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'modernshop/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

// Cloudinary storage for review images
const reviewStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'modernshop/reviews',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 600, height: 600, crop: 'limit', quality: 'auto' }],
  },
});

// Cloudinary storage for categories
const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'modernshop/categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }],
  },
});

// File filter — images only
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Multer instances
const uploadProduct = multer({
  storage: productStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

const uploadReview = multer({
  storage: reviewStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

const uploadCategory = multer({
  storage: categoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// Helper: delete image from Cloudinary
const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete image ${publicId}:`, error.message);
  }
};

// Exports: multer middleware shortcuts
module.exports = {
  uploadSingle: uploadProduct.single('image'),
  uploadMultiple: uploadProduct.array('images', 5),
  uploadAvatar: uploadAvatar.single('avatar'),
  uploadReviewImages: uploadReview.array('images', 3),
  uploadCategoryImage: uploadCategory.single('image'),
  deleteImage,
};
