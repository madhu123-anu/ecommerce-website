import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiClock, FiTruck, FiMapPin, FiCreditCard, FiAlertCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getOrderByIdAPI, cancelOrderAPI } from '../api/orderAPI';
import Breadcrumb from '../components/common/Breadcrumb';
import Loader from '../components/common/Loader';
import { formatPrice } from '../utils/formatPrice';
import { formatDate } from '../utils/formatDate';
import { ORDER_STATUS_LABELS } from '../utils/constants';
import { getProductImage } from '../utils/productImages';


function OrderItemImage({ src, name }) {
  const [error, setError] = useState(false);
  return (
    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-dark-700 shrink-0 overflow-hidden flex items-center justify-center">
      {error || !src ? (
        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs select-none">
          {name?.slice(0, 2).toUpperCase() || 'MS'}
        </div>
      ) : (
        <img
          src={src}
          alt={name}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderByIdAPI(id),
    enabled: !!id,
  });

  const order = data?.order;

  const cancelMutation = useMutation({
    mutationFn: cancelOrderAPI,
    onSuccess: () => {
      toast.success('Order cancelled successfully');
      queryClient.invalidateQueries(['order', id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    },
  });

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelMutation.mutate(id);
    }
  };

  if (isLoading) return <Loader variant="fullpage" />;
  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">😞</p>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Order not found</h2>
        <Link to="/orders" className="btn-primary mt-4">Back to My Orders</Link>
      </div>
    );
  }

  const {
    orderNumber, status, createdAt, items = [], shippingAddress,
    paymentMethod, itemsPrice, shippingPrice, taxPrice, discountAmount,
    totalPrice, isPaid, paidAt, trackingNumber,
  } = order;

  // Timeline statuses
  const timelineSteps = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
  const currentStepIndex = timelineSteps.indexOf(status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'My Orders', path: '/orders' },
          { label: orderNumber, path: `/orders/${id}` },
        ]}
      />

      <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Order Details
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Placed on {formatDate(createdAt)}
          </p>
        </div>
        {['pending', 'confirmed'].includes(status) && (
          <button
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="btn-outline border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 py-2 px-4 text-xs"
          >
            <FiXCircle size={14} /> {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      {/* Dynamic Status Timeline */}
      {status !== 'cancelled' && (
        <div className="mt-8 card p-6 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] px-4 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-slate-100 dark:bg-dark-700 -z-10 rounded-full" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-600 rounded-full -z-10 transition-all duration-300"
              style={{
                width: currentStepIndex >= 0 ? `${(currentStepIndex / (timelineSteps.length - 1)) * 100}%` : '0%',
              }}
            />

            {timelineSteps.map((stepName, i) => {
              const isCompleted = currentStepIndex >= i;
              const isActive = currentStepIndex === i;

              return (
                <div key={stepName} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                      isCompleted
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white dark:bg-dark-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    } ${isActive ? 'scale-110 shadow-glow border-primary-600' : ''}`}
                  >
                    {i + 1}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-primary-600' : 'text-slate-400'}`}>
                    {ORDER_STATUS_LABELS[stepName] || stepName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="mt-8 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm">
          <FiAlertCircle size={18} />
          <div>
            <p className="font-bold">This order was cancelled</p>
            {order.cancelReason && <p className="text-xs text-red-600 dark:text-red-300/80">Reason: {order.cancelReason}</p>}
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns: Items & Address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base border-b border-slate-100 dark:border-slate-700/50 pb-3">
              Order Items
            </h3>
            <div className="space-y-4">
              {items.map((item) => {
                const prod = item.product;
                const name = prod?.title || prod?.name || item.title || 'Product';
                const imgSrc = getProductImage(name);

                return (
                  <div key={item._id} className="flex items-center gap-4 py-2 border-b border-slate-50 dark:border-slate-800/40 last:border-0 last:pb-0">
                    <OrderItemImage src={imgSrc} name={name} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate hover:text-primary-600 transition-colors">
                        {prod ? <Link to={`/products/${prod._id}`}>{name}</Link> : name}
                      </h4>
                      <p className="text-xs text-slate-400">{prod?.brand || 'Brand'}</p>
                      <p className="text-xs text-slate-500 font-bold mt-1">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Tracking Details */}
          {trackingNumber && (
            <div className="card p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/20 text-primary-600 rounded-full flex items-center justify-center">
                <FiTruck size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Tracking Number</p>
                <p className="text-sm font-black text-slate-800 dark:text-slate-200">{trackingNumber}</p>
                <p className="text-xs text-slate-500 mt-0.5">Use this number to track your package on the carrier site.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Address and Price Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Shipping Info */}
          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
              <FiMapPin size={16} className="text-primary-600" /> Shipping Information
            </h3>
            {shippingAddress && (
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">{shippingAddress.name}</p>
                <p>{shippingAddress.street}</p>
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
                <p>{shippingAddress.country}</p>
                <p className="text-slate-500 mt-2">☎️ {shippingAddress.phone}</p>
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
              <FiCreditCard size={16} className="text-primary-600" /> Payment Details
            </h3>
            <div className="text-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                  {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Stripe Card'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status</span>
                {isPaid ? (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-bold">
                    PAID
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded text-xs font-bold">
                    UNPAID
                  </span>
                )}
              </div>
              {isPaid && paidAt && (
                <p className="text-[11px] text-slate-400 text-right">Paid on {formatDate(paidAt)}</p>
              )}
            </div>
          </div>

          {/* Price Summary */}
          <div className="card p-5 space-y-3 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Items Price</span>
              <span className="font-semibold">{formatPrice(itemsPrice)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount</span>
                <span className="font-semibold">-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Shipping</span>
              <span className="font-semibold">{shippingPrice === 0 ? 'FREE' : formatPrice(shippingPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Tax</span>
              <span className="font-semibold">{formatPrice(taxPrice)}</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between font-bold text-base">
              <span className="text-slate-900 dark:text-white">Total Amount</span>
              <span className="text-primary-600 dark:text-primary-400">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
