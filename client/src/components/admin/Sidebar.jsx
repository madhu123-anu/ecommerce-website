import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiPackage, FiShoppingBag, FiUsers, FiTag,
  FiStar, FiGrid, FiChevronLeft, FiChevronRight,
  FiLogOut, FiSettings, FiList
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: FiHome, exact: true },
  { path: '/admin/products', label: 'Products', icon: FiPackage },
  { path: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { path: '/admin/users', label: 'Users', icon: FiUsers },
  { path: '/admin/categories', label: 'Categories', icon: FiGrid },
  { path: '/admin/coupons', label: 'Coupons', icon: FiTag },
  { path: '/admin/reviews', label: 'Reviews', icon: FiStar },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-gradient-to-b from-dark-900 via-dark-800 to-dark-700 border-r border-white/10 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-700 rounded-lg flex items-center justify-center shadow-glow shrink-0">
          <span className="text-white font-black text-sm">M</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-black text-white text-sm whitespace-nowrap overflow-hidden"
            >
              ModernShop Pro
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                active
                  ? 'bg-primary-600/20 text-white border border-primary-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon
                size={18}
                className={`shrink-0 transition-colors ${active ? 'text-primary-400' : 'group-hover:text-white'}`}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium text-sm whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary-500 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User + Logout */}
      <div className="border-t border-white/10 p-3 space-y-2 shrink-0">
        <Link
          to="/"
          title={collapsed ? 'Back to Store' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <FiList size={16} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Back to Store
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-700 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
                <p className="text-slate-400 text-[10px] truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={logout}
          title={collapsed ? 'Logout' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-white hover:bg-red-500/20 transition-all w-full text-sm"
        >
          <FiLogOut size={16} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-dark-700 border border-white/20 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors shadow-lg"
      >
        {collapsed ? <FiChevronRight size={12} /> : <FiChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
