import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiList, FiShoppingBag } from 'react-icons/fi';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '../common/Loader';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export default function ProductGrid({ products = [], loading = false, view = 'grid', onViewChange }) {
  if (loading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (!loading && products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-24 h-24 bg-slate-100 dark:bg-dark-700 rounded-full flex items-center justify-center mb-6">
          <FiShoppingBag size={36} className="text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
          No products found
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
          Try adjusting your filters or search terms to discover more products.
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={view}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className={
            view === 'list'
              ? 'flex flex-col gap-3'
              : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          }
        >
          {products.map((product) => (
            <ProductCard key={product._id} product={product} view={view} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
