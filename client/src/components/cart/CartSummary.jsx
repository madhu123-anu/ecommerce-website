import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTag, FiX, FiLock, FiTruck, FiArrowRight, FiShield } from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { formatPrice } from '../../utils/formatPrice';
import { validateCouponAPI } from '../../api/couponAPI';
import toast from 'react-hot-toast';

export default function CartSummary({ showCheckoutButton = true }) {
  const { totals, coupon, setCoupon, removeCoupon, items } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const data = await validateCouponAPI({ code: couponCode.trim(), cartTotal: totals.subtotal });
      setCoupon(data.coupon);
      setCouponCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="card p-5 space-y-4 sticky top-24">
      <h2 className="font-bold text-lg text-slate-900 dark:text-white">Order Summary</h2>

      {/* Price Breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(totals.subtotal)}</span>
        </div>

        {totals.discount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex justify-between text-green-600 dark:text-green-400"
          >
            <span className="flex items-center gap-1">
              <FiTag size={13} /> Discount
              {coupon && <span className="text-xs bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded font-bold">{coupon.code}</span>}
            </span>
            <span className="font-semibold">-{formatPrice(totals.discount)}</span>
          </motion.div>
        )}

        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <FiTruck size={13} /> Shipping
          </span>
          <span className={`font-semibold ${totals.shipping === 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-200'}`}>
            {totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}
          </span>
        </div>

        {totals.shipping > 0 && (
          <p className="text-xs text-slate-400">
            Add {formatPrice(50 - totals.subtotal)} more for free shipping
          </p>
        )}

        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Tax (8%)</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(totals.tax)}</span>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
          <span className="font-bold text-lg text-slate-900 dark:text-white">Total</span>
          <span className="font-black text-xl text-primary-600 dark:text-primary-400">{formatPrice(totals.total)}</span>
        </div>
      </div>

      {/* Coupon Code */}
      <div>
        <AnimatePresence>
          {coupon ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <FiTag size={14} />
                <span className="text-sm font-semibold">{coupon.code}</span>
                <span className="text-xs">applied</span>
              </div>
              <button
                onClick={removeCoupon}
                className="text-green-600 dark:text-green-400 hover:text-red-500 transition-colors"
              >
                <FiX size={15} />
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                placeholder="Coupon code"
                className="input-field py-2 text-sm flex-1"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="btn-primary py-2 px-4 text-sm"
              >
                {couponLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Apply'
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleCheckout}
          disabled={items.length === 0}
          className="btn-primary w-full py-3.5 text-base justify-center disabled:opacity-50"
        >
          <FiLock size={16} />
          {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
          <FiArrowRight size={16} />
        </motion.button>
      )}

      <Link
        to="/products"
        className="block text-center text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
      >
        ← Continue Shopping
      </Link>

      {/* Trust Badges */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <FiShield size={13} className="text-green-500" /> Secure
          </div>
          <div className="flex items-center gap-1">
            <FiLock size={13} className="text-blue-500" /> Encrypted
          </div>
          <div className="flex items-center gap-1">
            <FiTruck size={13} className="text-purple-500" /> Fast Shipping
          </div>
        </div>
      </div>
    </div>
  );
}
