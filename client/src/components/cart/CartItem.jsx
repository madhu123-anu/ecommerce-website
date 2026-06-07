import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiHeart } from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { formatPrice, calcDiscountPercent } from '../../utils/formatPrice';
import { getProductImage } from '../../utils/productImages';


export default function CartItem({ item }) {
  const { removeFromCart, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [removing, setRemoving] = useState(false);

  const { product, quantity, price } = item;

  if (!product) return null;

  const {
    _id, brand, images = [], stock = 99,
    price: originalPrice,
  } = product;

  const discountedPrice = product.discountPrice || product.discountedPrice;

  const name = product.title || product.name || 'Product';
  const displayPrice = price || discountedPrice || originalPrice;
  const discountPct = discountedPrice ? calcDiscountPercent(originalPrice, discountedPrice) : 0;
  const [imgError, setImgError] = useState(false);
  const imgSrc = getProductImage(name);
  const inWishlist = isInWishlist(_id);

  const handleRemove = async () => {
    setRemoving(true);
    setTimeout(() => removeFromCart(_id, name), 200);
  };

  const handleQtyChange = (newQty) => {
    if (newQty < 1) return handleRemove();
    if (newQty > stock) return;
    updateQuantity(_id, newQty);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: removing ? 0 : 1, x: removing ? -20 : 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-4 p-4 bg-white dark:bg-dark-800 rounded-2xl border border-slate-100 dark:border-slate-700"
    >
      {/* Product Image */}
      <Link to={`/products/${_id}`} className="shrink-0">
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-50 dark:bg-dark-700 flex items-center justify-center">
          {imgError || !imgSrc ? (
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm select-none">
              {name?.slice(0, 2).toUpperCase() || 'MS'}
            </div>
          ) : (
            <img
              src={imgSrc}
              alt={name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-0.5">
              {brand}
            </p>
            <Link to={`/products/${_id}`}>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-primary-600 transition-colors line-clamp-2">
                {name}
              </h3>
            </Link>
          </div>
          <button
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0"
            aria-label="Remove from cart"
          >
            <FiTrash2 size={15} />
          </button>
        </div>

        {discountPct > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-2">
            {discountPct}% OFF
          </span>
        )}

        <div className="flex items-center justify-between flex-wrap gap-2 mt-2">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-700 rounded-xl p-1">
            <button
              onClick={() => handleQtyChange(quantity - 1)}
              className="w-7 h-7 rounded-lg bg-white dark:bg-dark-600 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-all"
              aria-label="Decrease quantity"
            >
              <FiMinus size={12} />
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-800 dark:text-slate-200">
              {quantity}
            </span>
            <button
              onClick={() => handleQtyChange(quantity + 1)}
              disabled={quantity >= stock}
              className="w-7 h-7 rounded-lg bg-white dark:bg-dark-600 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-all disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <FiPlus size={12} />
            </button>
          </div>

          {/* Price + Save for Later */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleWishlist(_id, name)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                inWishlist ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
              }`}
            >
              <FiHeart size={13} className={inWishlist ? 'fill-current' : ''} />
              <span className="hidden sm:inline">{inWishlist ? 'Saved' : 'Save'}</span>
            </button>
            <div className="text-right">
              <p className="text-base font-black text-slate-900 dark:text-white">
                {formatPrice(displayPrice * quantity)}
              </p>
              {quantity > 1 && (
                <p className="text-[11px] text-slate-400">{formatPrice(displayPrice)} each</p>
              )}
            </div>
          </div>
        </div>

        {stock <= 5 && stock > 0 && (
          <p className="text-[11px] text-orange-500 font-semibold mt-1.5">
            ⚡ Only {stock} left in stock!
          </p>
        )}
      </div>
    </motion.div>
  );
}
