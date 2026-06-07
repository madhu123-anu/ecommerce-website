import { motion } from 'framer-motion';

// Full page loader
function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-dark-900">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-glow animate-float">
          <span className="text-white font-black text-2xl">M</span>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 bg-primary-500 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
            />
          ))}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
      </motion.div>
    </div>
  );
}

// Spinner
function Spinner({ size = 'md', color = 'primary' }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };
  const colorMap = {
    primary: 'border-primary-500',
    white: 'border-white',
    gray: 'border-gray-500',
  };
  return (
    <div
      className={`${sizeMap[size]} border-2 ${colorMap[color]} border-t-transparent rounded-full animate-spin`}
    />
  );
}

// Dots loader
function DotsLoader() {
  return (
    <div className="flex gap-1.5 items-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary-500 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

// Product card skeleton
function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="skeleton-shimmer h-52 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton-shimmer h-3 w-20 rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-3/4 rounded" />
        <div className="skeleton-shimmer h-3 w-24 rounded" />
        <div className="flex justify-between items-center">
          <div className="skeleton-shimmer h-5 w-16 rounded" />
          <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Grid of product skeletons
function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Section skeleton
function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton-shimmer h-8 w-48 rounded-xl" />
      <div className="skeleton-shimmer h-4 w-72 rounded" />
    </div>
  );
}

// Table row skeleton
function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="skeleton-shimmer h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

// Main Loader component
export default function Loader({ variant = 'spinner', count, size, color }) {
  if (variant === 'fullpage') return <FullPageLoader />;
  if (variant === 'dots') return <DotsLoader />;
  if (variant === 'product-grid') return <ProductGridSkeleton count={count || 8} />;
  if (variant === 'product-card') return <ProductCardSkeleton />;
  if (variant === 'section') return <SectionSkeleton />;
  if (variant === 'table-row') return <TableRowSkeleton cols={count || 5} />;
  return <Spinner size={size || 'md'} color={color || 'primary'} />;
}

export {
  Spinner,
  DotsLoader,
  ProductCardSkeleton,
  ProductGridSkeleton,
  SectionSkeleton,
  TableRowSkeleton,
};
