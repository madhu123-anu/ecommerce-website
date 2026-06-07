import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import Breadcrumb from '../components/common/Breadcrumb';

export default function Cart() {
  const { items, clearCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Shopping Cart', path: '/cart' }]} />

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          Shopping Cart 🛒
        </h1>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
          >
            <FiTrash2 size={14} /> Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-24 h-24 bg-slate-100 dark:bg-dark-700 rounded-full flex items-center justify-center mb-6">
            <FiShoppingBag size={36} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
            Your cart is empty
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-8">
            Looks like you haven\'t added anything to your cart yet. Let\'s explore our curated collection!
          </p>
          <Link to="/products" className="btn-primary px-8 py-3.5">
            Start Shopping
          </Link>
        </motion.div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <CartItem key={item.product._id} item={item} />
              ))}
            </AnimatePresence>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
}
