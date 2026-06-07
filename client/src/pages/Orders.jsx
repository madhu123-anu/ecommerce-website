import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFileText, FiShoppingBag, FiClock } from 'react-icons/fi';
import { getMyOrdersAPI } from '../api/orderAPI';
import Breadcrumb from '../components/common/Breadcrumb';
import Loader from '../components/common/Loader';
import { formatPrice } from '../utils/formatPrice';
import { formatDate } from '../utils/formatDate';
import { ORDER_STATUS_LABELS } from '../utils/constants';

export default function Orders() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => getMyOrdersAPI({ limit: 20 }),
  });

  const orders = data?.orders || [];

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      packed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      out_for_delivery: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badges[status] || 'bg-slate-100 text-slate-700'}`}>
        {ORDER_STATUS_LABELS[status] || status}
      </span>
    );
  };

  if (isLoading) return <Loader variant="fullpage" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'My Orders', path: '/orders' }]} />

      <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-6">My Orders 📦</h1>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-24 h-24 bg-slate-100 dark:bg-dark-700 rounded-full flex items-center justify-center mb-6">
            <FiShoppingBag size={36} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
            No orders found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-8">
            You haven\'t placed any orders yet. Once you make a purchase, it will appear here!
          </p>
          <Link to="/products" className="btn-primary px-8 py-3.5">
            Browse Products
          </Link>
        </motion.div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 hover:border-primary-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {order.orderNumber}
                  </span>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <FiClock size={12} /> Placed on {formatDate(order.createdAt)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {order.items?.length || 0} items · {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                </p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div>
                  <p className="text-xs text-slate-400 sm:text-right">Total Amount</p>
                  <p className="text-base font-black text-slate-900 dark:text-white sm:text-right">
                    {formatPrice(order.totalPrice)}
                  </p>
                </div>
                <Link
                  to={`/orders/${order._id}`}
                  className="btn-outline py-2 px-4 text-xs font-bold"
                >
                  <FiFileText size={13} /> View Order
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
