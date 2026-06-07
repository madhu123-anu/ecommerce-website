import { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';
import { FiTag } from 'react-icons/fi';
import { getProductImage } from '../../utils/productImages';


function SummaryItemImage({ src, name, quantity }) {
  const [error, setError] = useState(false);
  return (
    <div className="relative shrink-0 w-14 h-14 rounded-xl bg-slate-100 dark:bg-dark-700 overflow-hidden flex items-center justify-center">
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
      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
        {quantity}
      </span>
    </div>
  );
}

export default function OrderSummary({ address }) {
  const { items, totals, coupon } = useCart();

  return (
    <div className="space-y-5">
      {/* Items */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => {
          const { product, quantity, price } = item;
          if (!product) return null;
          const name = product.title || product.name || 'Product';
          const imgSrc = getProductImage(name);
          return (
            <div key={product._id} className="flex items-center gap-3">
              <SummaryItemImage src={imgSrc} name={name} quantity={quantity} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{name}</p>
                <p className="text-xs text-slate-400">{product.brand}</p>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 shrink-0">
                {formatPrice(price * quantity)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Price breakdown */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2 text-sm">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Subtotal</span>
          <span className="font-semibold">{formatPrice(totals.subtotal)}</span>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span className="flex items-center gap-1"><FiTag size={12} /> Discount</span>
            <span className="font-semibold">-{formatPrice(totals.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Shipping</span>
          <span className={`font-semibold ${totals.shipping === 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
            {totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}
          </span>
        </div>
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Tax</span>
          <span className="font-semibold">{formatPrice(totals.tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t border-slate-200 dark:border-slate-700 pt-2">
          <span className="text-slate-900 dark:text-white">Total</span>
          <span className="text-primary-600 dark:text-primary-400">{formatPrice(totals.total)}</span>
        </div>
        <div className="border-t border-slate-100 dark:border-slate-700/50 pt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 justify-center bg-slate-50 dark:bg-dark-700/30 p-2.5 rounded-xl mt-3">
          <span>🚚 <strong>Estimated Delivery:</strong> {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Shipping Address */}
      {address && (
        <div className="p-4 bg-slate-50 dark:bg-dark-700 rounded-xl">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Shipping To
          </p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{address.fullName}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {address.street}, {address.city}, {address.state} {address.zip}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{address.country}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{address.phone}</p>
        </div>
      )}
    </div>
  );
}
