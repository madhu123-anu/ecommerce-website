import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const colorMap = {
  purple: {
    bg: 'bg-primary-500/10 dark:bg-primary-500/20',
    icon: 'bg-primary-500 text-white',
    text: 'text-primary-600 dark:text-primary-400',
    border: 'border-primary-200 dark:border-primary-800/50',
  },
  green: {
    bg: 'bg-green-500/10 dark:bg-green-500/20',
    icon: 'bg-green-500 text-white',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800/50',
  },
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    icon: 'bg-blue-500 text-white',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800/50',
  },
  orange: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    icon: 'bg-orange-500 text-white',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800/50',
  },
};

function useCountUp(target, duration = 1500) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      if (ref.current) {
        ref.current.textContent = Math.floor(current).toLocaleString();
      }
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return ref;
}

export default function StatsCard({ label, value, icon: Icon, change, color = 'purple', prefix = '', suffix = '', index = 0 }) {
  const colors = colorMap[color];
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
  const countRef = useCountUp(numericValue || 0);
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`card p-6 border ${colors.border} relative overflow-hidden`}
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full ${colors.bg} transform translate-x-8 -translate-y-8`} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{label}</p>
          <div className="flex items-baseline gap-1">
            {prefix && <span className="text-xl font-bold text-slate-700 dark:text-slate-300">{prefix}</span>}
            <span
              ref={countRef}
              className="text-3xl font-black text-slate-900 dark:text-white"
            >
              0
            </span>
            {suffix && <span className="text-base font-semibold text-slate-500 dark:text-slate-400">{suffix}</span>}
          </div>

          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            }`}>
              {isPositive ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
              <span>{Math.abs(change)}%</span>
              <span className="text-xs text-slate-400 font-normal">vs last month</span>
            </div>
          )}
        </div>

        <div className={`w-12 h-12 rounded-2xl ${colors.icon} flex items-center justify-center shadow-md shrink-0`}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}
