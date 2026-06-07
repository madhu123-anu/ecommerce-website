import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useWishlist } from '../hooks/useWishlist';
import { getProductByIdAPI } from '../api/productAPI';
import ProductCard from '../components/product/ProductCard';
import Breadcrumb from '../components/common/Breadcrumb';
import { ProductCardSkeleton } from '../components/common/Loader';

export default function Wishlist() {
  const { items: wishlistItems, clearWishlist } = useWishlist();

  // Fetch product details for all items in the wishlist
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['wishlistProducts', wishlistItems],
    queryFn: async () => {
      if (!wishlistItems || wishlistItems.length === 0) return [];
      const promises = wishlistItems.map((id) => getProductByIdAPI(id));
      const results = await Promise.all(promises);
      return results.map((res) => res.product).filter(Boolean);
    },
    enabled: wishlistItems.length > 0,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Wishlist', path: '/wishlist' }]} />

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          My Wishlist ❤️
        </h1>
        {wishlistItems.length > 0 && (
          <button
            onClick={clearWishlist}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
          >
            <FiTrash2 size={14} /> Clear Wishlist
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: Math.max(4, wishlistItems.length) }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-24 h-24 bg-slate-100 dark:bg-dark-700 rounded-full flex items-center justify-center mb-6">
            <FiHeart size={36} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-8">
            Keep track of items you love. Tap the heart icon on any product page to save them here!
          </p>
          <Link to="/products" className="btn-primary px-8 py-3.5">
            Discover Products
          </Link>
        </motion.div>
      ) : (
        <div className="mt-8">
          <AnimatePresence>
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
