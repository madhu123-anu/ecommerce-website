import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiShoppingBag, FiFileText } from 'react-icons/fi';
import { getOrderByIdAPI } from '../api/orderAPI';
import Loader from '../components/common/Loader';

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderByIdAPI(id),
    enabled: !!id,
  });

  const order = data?.order;

  if (isLoading) return <Loader variant="fullpage" />;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex justify-center"
        >
          <div className="w-24 h-24 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center border-4 border-green-500 shadow-glow text-green-500">
            <FiCheckCircle size={56} className="stroke-[1.5]" />
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Order Confirmed! 🎉</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Thank you for your purchase! Your order is being processed and will ship soon.
          </p>
        </motion.div>

        {/* Order Details box */}
        {order && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-5 bg-slate-50 dark:bg-dark-700 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-3 text-sm text-left"
          >
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-600 pb-2">
              <span className="text-slate-500">Order Number</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-600 pb-2">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Stripe (Card)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Price</span>
              <span className="font-black text-primary-600 dark:text-primary-400 text-base">
                ${order.totalPrice.toFixed(2)}
              </span>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 pt-4"
        >
          <Link to="/products" className="btn-outline flex-1 py-3 justify-center text-sm">
            <FiShoppingBag size={15} /> Continue Shopping
          </Link>
          <Link to={`/orders/${id}`} className="btn-primary flex-1 py-3 justify-center text-sm">
            <FiFileText size={15} /> View Order Details
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
