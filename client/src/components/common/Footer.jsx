import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiInstagram, FiTwitter, FiFacebook, FiYoutube,
  FiMail, FiPhone, FiMapPin, FiArrowRight, FiSend
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const footerLinks = {
  shop: [
    { label: 'Electronics', path: '/products?category=electronics' },
    { label: 'Fashion', path: '/products?category=fashion' },
    { label: 'Home & Living', path: '/products?category=home-living' },
    { label: 'Beauty', path: '/products?category=beauty' },
    { label: 'Sports', path: '/products?category=sports' },
    { label: 'All Products', path: '/products' },
  ],
  account: [
    { label: 'My Profile', path: '/profile' },
    { label: 'My Orders', path: '/orders' },
    { label: 'Wishlist', path: '/wishlist' },
    { label: 'Shopping Cart', path: '/cart' },
    { label: 'Login', path: '/login' },
    { label: 'Register', path: '/register' },
  ],
  about: [
    { label: 'About Us', path: '/#about' },
    { label: 'Careers', path: '/#careers' },
    { label: 'Press', path: '/#press' },
    { label: 'Privacy Policy', path: '/#privacy' },
    { label: 'Terms of Service', path: '/#terms' },
    { label: 'Sitemap', path: '/#sitemap' },
  ],
};

const socialLinks = [
  { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram', color: 'hover:text-pink-500' },
  { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:text-blue-400' },
  { icon: FiFacebook, href: 'https://facebook.com', label: 'Facebook', color: 'hover:text-blue-600' },
  { icon: FiYoutube, href: 'https://youtube.com', label: 'YouTube', color: 'hover:text-red-500' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000)); // Simulate API call
    toast.success('Successfully subscribed! 🎉 Check your inbox for the welcome email.');
    setEmail('');
    setLoading(false);
  };

  return (
    <footer className="bg-slate-900 dark:bg-dark-900 text-slate-300 mt-auto">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-700 rounded-lg flex items-center justify-center shadow-glow">
                <span className="text-white font-black text-sm">Z</span>
              </div>
              <span className="font-black text-lg text-white uppercase tracking-wider">ZORA</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              Your premium destination for the latest trends in electronics, fashion, home decor, and more.
              Shop 50,000+ products with free shipping and easy returns.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <FiMail size={15} className="text-primary-400 shrink-0" />
                <span>support@zora.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <FiPhone size={15} className="text-primary-400 shrink-0" />
                <span>+1 (800) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <FiMapPin size={15} className="text-primary-400 shrink-0" />
                <span>123 Commerce St, San Francisco, CA 94102</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 ${color} transition-all duration-200 hover:-translate-y-0.5`}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-400 hover:text-primary-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <FiArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Column */}
          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-3">
              {footerLinks.account.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-400 hover:text-primary-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <FiArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About + Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 mb-8">
              {footerLinks.about.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-400 hover:text-primary-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <FiArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 border-t border-slate-800 pt-10">
          <div className="max-w-lg">
            <h4 className="font-bold text-white text-lg mb-2">Stay in the loop 📬</h4>
            <p className="text-slate-400 text-sm mb-4">
              Get exclusive deals, new arrivals, and style tips delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 focus:border-primary-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiSend size={15} />
                )}
                <span className="hidden sm:inline">Subscribe</span>
              </motion.button>
            </form>
            <p className="text-xs text-slate-500 mt-2">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} ZORA. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Payment Icons */}
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              {['VISA', 'MC', 'AMEX', 'STRIPE', 'PAYPAL'].map((method) => (
                <span
                  key={method}
                  className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold tracking-wider"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
