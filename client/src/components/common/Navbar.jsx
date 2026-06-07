import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX,
  FiSun, FiMoon, FiChevronDown, FiLogOut, FiPackage,
  FiSettings, FiGrid
} from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import { searchProductsAPI } from '../../api/productAPI';
import { CATEGORIES } from '../../utils/constants';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsCatMenuOpen(false);
  }, [location.pathname]);

  // Search suggestions
  useEffect(() => {
    if (!debouncedSearch.trim() || debouncedSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    searchProductsAPI(debouncedSearch, 5)
      .then((data) => setSearchResults(data.products || []))
      .catch(() => setSearchResults([]))
      .finally(() => setIsSearching(false));
  }, [debouncedSearch]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([]);
        setSearchQuery('');
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  const handleResultClick = (product) => {
    navigate(`/products/${product._id}`);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl shadow-lg border-b border-white/20 dark:border-white/5'
          : 'bg-white dark:bg-dark-900'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-700 rounded-lg flex items-center justify-center shadow-glow">
              <span className="text-white font-black text-sm">Z</span>
            </div>
            <span className="font-black text-xl tracking-wider text-slate-800 dark:text-white hidden sm:block uppercase">
              ZORA
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCatMenuOpen(!isCatMenuOpen)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                Categories
                <FiChevronDown className={`transition-transform duration-200 ${isCatMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isCatMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      {CATEGORIES.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/products?category=${cat.slug}`}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                          onClick={() => setIsCatMenuOpen(false)}
                        >
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {cat.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-md mx-4 hidden lg:block">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-dark-800 border border-transparent focus:border-primary-400 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none transition-all duration-200"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </form>

            {/* Search Suggestions */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
                >
                  {searchResults.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handleResultClick(product)}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                    >
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                          ${product.discountedPrice || product.price}
                        </p>
                      </div>
                    </button>
                  ))}
                  <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                      onClick={handleSearch}
                      className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                    >
                      See all results for "{searchQuery}"
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Wishlist"
            >
              <FiHeart size={18} />
              {wishlistCount > 0 && (
                <span className="notification-dot text-[10px] w-4 h-4">{wishlistCount}</span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Cart"
            >
              <FiShoppingCart size={18} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="notification-dot text-[10px] w-4 h-4"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-purple-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <FiChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 hidden sm:block ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <FiUser size={15} /> Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <FiPackage size={15} /> My Orders
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <FiGrid size={15} /> Admin Dashboard
                          </Link>
                        )}
                        <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                          <button
                            onClick={logout}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400 transition-colors w-full text-left"
                          >
                            <FiLogOut size={15} /> Logout
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-1.5 px-4 text-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-3 px-0">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-dark-800 border border-transparent rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none"
              />
            </div>
          </form>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white dark:bg-dark-800 z-50 shadow-2xl overflow-y-auto md:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-black text-lg gradient-text">ModernShop Pro</span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                <div className="space-y-1 mb-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="block px-4 py-3 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-4">
                  Categories
                </p>
                <div className="space-y-1 mb-6">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span>{cat.icon}</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium">
                        <FiUser size={16} /> Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium">
                        <FiPackage size={16} /> Orders
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium">
                          <FiGrid size={16} /> Admin
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 font-medium w-full"
                      >
                        <FiLogOut size={16} /> Logout
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <Link to="/login" className="btn-outline w-full justify-center">
                        Login
                      </Link>
                      <Link to="/register" className="btn-primary w-full justify-center">
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
