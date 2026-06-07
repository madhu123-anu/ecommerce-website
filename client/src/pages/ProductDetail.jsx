import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingCart, FiHeart, FiZap, FiTruck, FiShield,
  FiRefreshCw, FiStar, FiChevronDown, FiChevronUp,
  FiShare2, FiCheck
} from 'react-icons/fi';
import { getProductByIdAPI, getRelatedProductsAPI } from '../api/productAPI';
import { createReviewAPI } from '../api/reviewAPI';
import ProductImageGallery from '../components/product/ProductImageGallery';
import RatingStars from '../components/product/RatingStars';
import ProductCard from '../components/product/ProductCard';
import ProductGrid from '../components/product/ProductGrid';
import Breadcrumb from '../components/common/Breadcrumb';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../hooks/useAuth';
import { formatPrice, calcDiscountPercent } from '../utils/formatPrice';
import { formatDate, formatRelative } from '../utils/formatDate';
import { ProductCardSkeleton } from '../components/common/Loader';
import toast from 'react-hot-toast';

function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left"
      >
        <span className="font-semibold text-slate-800 dark:text-slate-200">{title}</span>
        {open ? <FiChevronUp size={16} className="text-slate-400" /> : <FiChevronDown size={16} className="text-slate-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewForm({ productId, onSuccess }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const mutation = useMutation({
    mutationFn: createReviewAPI,
    onSuccess: () => {
      toast.success('Review submitted! ✅');
      queryClient.invalidateQueries(['product', productId]);
      setRating(0); setTitle(''); setComment('');
      onSuccess?.();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit review'),
  });

  if (!isAuthenticated) {
    return (
      <div className="text-center py-6 text-slate-500 dark:text-slate-400">
        <p>Please <a href="/login" className="text-primary-600 hover:underline font-semibold">login</a> to write a review.</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ productId, rating, title, comment }); }} className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Your Rating *</label>
        <RatingStars rating={rating} interactive onChange={setRating} size={24} />
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title"
        className="input-field text-sm"
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product..."
        rows={4}
        required
        className="input-field text-sm resize-none"
      />
      <button
        type="submit"
        disabled={!rating || !comment || mutation.isPending}
        className="btn-primary"
      >
        {mutation.isPending ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : 'Submit Review'}
      </button>
    </form>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [shareSuccess, setShareSuccess] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductByIdAPI(id),
    enabled: !!id,
  });

  const { data: relatedData } = useQuery({
    queryKey: ['related', id],
    queryFn: () => getRelatedProductsAPI(id, 4),
    enabled: !!id,
  });

  const product = data?.product;
  const relatedProducts = relatedData?.products || [];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-3">
            <div className="skeleton-shimmer aspect-square rounded-2xl" />
            <div className="flex gap-2">
              {[1,2,3,4].map(i => <div key={i} className="skeleton-shimmer w-16 h-16 rounded-xl" />)}
            </div>
          </div>
          <div className="space-y-4">
            {[200, 300, 100, 120, 80].map((w, i) => (
              <div key={i} className={`skeleton-shimmer h-6 rounded`} style={{ width: `${w}px` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-4xl mb-4">😞</p>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">Product not found</h2>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Browse Products
        </button>
      </div>
    );
  }

  const {
    brand, price, images = [], description,
    specifications = {}, stock, rating: productRating = 0, numReviews = 0,
    reviews = [], category, features = [],
  } = product;

  const discountedPrice = product.discountPrice || product.discountedPrice;

  const name = product.title || product.name || 'Product';

  const displayPrice = discountedPrice || price;
  const discountPct = discountedPrice ? calcDiscountPercent(price, discountedPrice) : 0;
  const isOutOfStock = !stock || stock === 0;
  const inWishlist = isInWishlist(id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: `Reviews (${numReviews})` },
  ];

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = numReviews > 0 ? (count / numReviews) * 100 : 0;
    return { star, count, pct };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Home', path: '/' },
        { label: 'Products', path: '/products' },
        {
          label: typeof category === 'object' ? (category?.name || 'Category') : (category || 'Category'),
          path: `/products?category=${typeof category === 'object' ? (category?.slug || category?._id) : category}`,
        },
        { label: name, path: `/products/${id}` },
      ]} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Images */}
        <div>
          <ProductImageGallery images={images} productName={name} />
        </div>

        {/* Right: Info */}
        <div>
          {/* Brand */}
          <span className="badge-primary text-xs uppercase tracking-wider mb-3 inline-block">
            {brand}
          </span>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3 leading-tight">
            {name}
          </h1>

          {/* Rating + Stock */}
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <RatingStars rating={productRating} showCount count={numReviews} size={15} />
            {!isOutOfStock ? (
              <span className="badge-success flex items-center gap-1">
                <FiCheck size={11} /> In Stock ({stock})
              </span>
            ) : (
              <span className="badge-danger">Out of Stock</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-4 mb-4 p-4 bg-slate-50 dark:bg-dark-700 rounded-2xl">
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {formatPrice(displayPrice)}
              </p>
              {discountedPrice && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-400 line-through text-base">{formatPrice(price)}</span>
                  <span className="badge bg-red-500 text-white text-xs font-bold">
                    SAVE {discountPct}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Short description */}
          {description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5 line-clamp-3">
              {description}
            </p>
          )}

          {/* Specifications mini */}
          {Object.keys(specifications).length > 0 && (
            <div className="mb-5">
              <AccordionItem title="Key Specifications">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(specifications).slice(0, 6).map(([key, val]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-xs text-slate-400 capitalize">{key}</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{val}</span>
                    </div>
                  ))}
                </div>
              </AccordionItem>
            </div>
          )}

          {/* Quantity + Actions */}
          <div className="space-y-3">
            {/* Quantity */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Qty:</label>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-700 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-dark-600 shadow-sm flex items-center justify-center hover:bg-primary-50 transition-all"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-slate-800 dark:text-slate-200">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(stock || 99, quantity + 1))}
                  disabled={quantity >= (stock || 99)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-dark-600 shadow-sm flex items-center justify-center hover:bg-primary-50 transition-all disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 btn-primary py-3.5 justify-center text-sm"
              >
                <FiShoppingCart size={16} /> Add to Cart
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 btn-outline py-3.5 justify-center text-sm"
              >
                <FiZap size={16} /> Buy Now
              </motion.button>
              <button
                onClick={() => toggleWishlist(id, name)}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                  inWishlist
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500'
                    : 'border-slate-200 dark:border-slate-600 hover:border-red-300 text-slate-400 hover:text-red-500'
                }`}
              >
                <FiHeart size={18} className={inWishlist ? 'fill-current' : ''} />
              </button>
              <button
                onClick={handleShare}
                className="w-12 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-300 transition-all"
              >
                {shareSuccess ? <FiCheck size={18} className="text-green-500" /> : <FiShare2 size={18} />}
              </button>
            </div>
          </div>

          {/* Shipping info */}
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <FiTruck size={16} className="text-green-500 shrink-0" />
              <span>Free shipping on orders over <strong>$50</strong></span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <FiRefreshCw size={16} className="text-blue-500 shrink-0" />
              <span>30-day hassle-free returns</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <FiShield size={16} className="text-primary-500 shrink-0" />
              <span>2-year manufacturer warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="mt-14">
        <div className="flex gap-0 border-b border-slate-200 dark:border-slate-700 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold text-sm whitespace-nowrap transition-all duration-200 border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'description' && (
              <div className="prose-custom max-w-3xl">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{description || 'No description available.'}</p>
                {features.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                        <FiCheck size={14} className="text-green-500 mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-2xl">
                {Object.keys(specifications).length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {Object.entries(specifications).map(([key, val]) => (
                      <div key={key} className="grid grid-cols-2 py-3">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-sm text-slate-800 dark:text-slate-200">{val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-3xl space-y-8">
                {/* Rating Summary */}
                {numReviews > 0 && (
                  <div className="flex gap-8 p-6 bg-slate-50 dark:bg-dark-700 rounded-2xl">
                    <div className="text-center">
                      <p className="text-5xl font-black text-slate-900 dark:text-white">{productRating.toFixed(1)}</p>
                      <RatingStars rating={productRating} size={14} />
                      <p className="text-xs text-slate-400 mt-1">{numReviews} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {ratingDistribution.map(({ star, count, pct }) => (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 w-4">{star}★</span>
                          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: (5 - star) * 0.1 }}
                              className="h-full bg-amber-400 rounded-full"
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-6">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review List */}
                <div className="space-y-4">
                  {reviews.length > 0 ? reviews.map((review, i) => (
                    <div key={i} className="card p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {review.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{review.user?.name || 'Anonymous'}</p>
                            <p className="text-xs text-slate-400">{formatRelative(review.createdAt)}</p>
                          </div>
                        </div>
                        <RatingStars rating={review.rating} size={12} />
                      </div>
                      {review.title && <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1">{review.title}</p>}
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  )) : (
                    <p className="text-slate-400 text-center py-6">No reviews yet. Be the first to review!</p>
                  )}
                </div>

                {/* Write Review */}
                <div className="card p-6">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Write a Review</h3>
                  <ReviewForm productId={id} onSuccess={() => setActiveTab('reviews')} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-14">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">You Might Also Like</h2>
          <ProductGrid products={relatedProducts} view="grid" />
        </div>
      )}
    </motion.div>
  );
}
