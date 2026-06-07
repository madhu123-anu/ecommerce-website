export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const ORDER_STATUS_COLORS = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'primary',
  out_for_delivery: 'primary',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'danger',
};

export const CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: '💻', slug: 'electronics' },
  { id: 'fashion', name: 'Fashion', icon: '👗', slug: 'fashion' },
  { id: 'home-living', name: 'Home & Living', icon: '🏠', slug: 'home-living' },
  { id: 'beauty', name: 'Beauty', icon: '💄', slug: 'beauty' },
  { id: 'sports', name: 'Sports', icon: '🏋️', slug: 'sports' },
  { id: 'books', name: 'Books', icon: '📚', slug: 'books' },
  { id: 'toys', name: 'Toys & Games', icon: '🎮', slug: 'toys' },
  { id: 'food', name: 'Food & Grocery', icon: '🛒', slug: 'food' },
];

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-numReviews', label: 'Most Reviews' },
  { value: '-rating', label: 'Highest Rated' },
  { value: '-sold', label: 'Best Selling' },
];

export const PAYMENT_METHODS = {
  STRIPE: 'stripe',
  COD: 'cod',
  UPI: 'upi',
  WALLET: 'wallet',
};

export const PAYMENT_METHOD_LABELS = {
  stripe: 'Credit / Debit Card',
  cod: 'Cash on Delivery',
  upi: 'UPI',
  wallet: 'Wallet',
};

export const COUPON_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  FREE_SHIPPING: 'free_shipping',
};

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

export const SHIPPING_THRESHOLD = 50;
export const SHIPPING_COST = 9.99;
export const TAX_RATE = 0.08;

export const PRODUCT_CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export const RATING_FILTER_OPTIONS = [
  { value: 4, label: '4★ & above' },
  { value: 3, label: '3★ & above' },
  { value: 2, label: '2★ & above' },
  { value: 1, label: '1★ & above' },
];

export const PRICE_RANGES = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 - $50', min: 25, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: '$200 - $500', min: 200, max: 500 },
  { label: 'Over $500', min: 500, max: 99999 },
];

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com',
  twitter: 'https://twitter.com',
  facebook: 'https://facebook.com',
  youtube: 'https://youtube.com',
};

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'ModernShop Pro';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
