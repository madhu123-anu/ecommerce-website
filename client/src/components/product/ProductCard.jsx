import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar, FiEye } from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { formatPrice, calcDiscountPercent } from '../../utils/formatPrice';
import { getProductImage } from '../../utils/productImages';


export default function ProductCard({ product, view = 'grid' }) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const {
    _id,
    brand,
    price,
    images = [],
    rating = 0,
    numReviews = 0,
    stock = 0,
    isNew,
    badge,
  } = product;

  const discountedPrice = product.discountPrice || product.discountedPrice;

  const name = product.title || product.name || 'Product';
  const inCart = isInCart(_id);
  const inWishlist = isInWishlist(_id);
  const discountPercent = discountedPrice ? calcDiscountPercent(price, discountedPrice) : 0;
  const displayPrice = discountedPrice || price;
  const isOutOfStock = stock === 0;

  const imgSrc = getProductImage(name);

  if (view === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="card-hover flex gap-4 p-4"
      >
        <Link to={`/products/${_id}`} className="shrink-0">
          <div className="w-28 h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-700 flex items-center justify-center">
            {imgError || !imgSrc ? (
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg select-none">
                {name?.slice(0, 2).toUpperCase() || 'MS'}
              </div>
            ) : (
              <img
                src={imgSrc}
                alt={name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wide">
            {brand}
          </p>
          <Link to={`/products/${_id}`}>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 hover:text-primary-600 transition-colors line-clamp-2 mb-2">
              {name}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar
                key={i}
                size={12}
                className={i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600'}
              />
            ))}
            <span className="text-xs text-slate-500">({numReviews})</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {formatPrice(displayPrice)}
              </span>
              {discountedPrice && (
                <span className="text-sm price-original">{formatPrice(price)}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleWishlist(_id, name)}
                className={`p-2 rounded-lg transition-colors ${
                  inWishlist
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400'
                }`}
              >
                <FiHeart size={16} className={inWishlist ? 'fill-current' : ''} />
              </button>
              <button
                disabled={isOutOfStock}
                onClick={() => addToCart(product)}
                className={`btn-primary py-2 px-4 text-xs ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FiShoppingCart size={14} />
                {inCart ? 'In Cart' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700/50 hover:border-primary-200 dark:hover:border-primary-800/50 flex flex-col"
    >
      {/* Image container */}
      <div className="relative overflow-hidden bg-slate-50 dark:bg-dark-700 aspect-[4/3] flex items-center justify-center">
        <Link to={`/products/${_id}`} className="w-full h-full flex items-center justify-center">
          {imgError || !imgSrc ? (
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl select-none">
              {name?.slice(0, 2).toUpperCase() || 'MS'}
            </div>
          ) : (
            <img
              src={imgSrc}
              alt={name}
              onError={() => setImgError(true)}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </Link>
      
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discountPercent > 0 && (
            <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              -{discountPercent}%
            </span>
          )}
          {isNew && (
            <span className="bg-green-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              NEW
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-slate-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              OUT OF STOCK
            </span>
          )}
          {badge && !discountPercent && !isNew && (
            <span className="bg-primary-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(_id, name); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
            inWishlist
              ? 'bg-red-50 text-red-500'
              : 'bg-white/80 dark:bg-dark-800/80 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiHeart size={14} className={inWishlist ? 'fill-current' : ''} />
        </button>

        {/* Quick actions overlay */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 8 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-3 left-3 right-3 flex gap-2"
        >
          <button
            disabled={isOutOfStock || inCart}
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isOutOfStock
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                : inCart
                ? 'bg-green-500 text-white'
                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-glow'
            }`}
          >
            <FiShoppingCart size={12} />
            {isOutOfStock ? 'Out of Stock' : inCart ? 'In Cart' : 'Add to Cart'}
          </button>
          <Link
            to={`/products/${_id}`}
            className="w-9 h-9 bg-white dark:bg-dark-700 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <FiEye size={14} />
          </Link>
        </motion.div>
      </div>

      {/* Product info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
          {brand}
        </p>
        <Link to={`/products/${_id}`} className="flex-1">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-2 leading-snug">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar
                key={i}
                size={11}
                className={
                  i < Math.floor(rating)
                    ? 'text-amber-400 fill-amber-400'
                    : i < rating
                    ? 'text-amber-300 fill-amber-300'
                    : 'text-slate-200 dark:text-slate-600'
                }
              />
            ))}
          </div>
          <span className="text-[11px] text-slate-400">({numReviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-slate-900 dark:text-white">
            {formatPrice(displayPrice)}
          </span>
          {discountedPrice && price > discountedPrice && (
            <span className="text-xs price-original">{formatPrice(price)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
