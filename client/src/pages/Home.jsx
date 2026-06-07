import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Countdown from 'react-countdown';
import {
  FiArrowRight, FiShoppingBag, FiZap, FiTruck,
  FiShield, FiStar, FiChevronRight
} from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import { getBestSellersAPI, getNewArrivalsAPI, getSaleProductsAPI } from '../api/productAPI';
import { CATEGORIES } from '../utils/constants';
import { ProductCardSkeleton } from '../components/common/Loader';
import ShaderBackground from '../components/ui/shader-background';

const categoryGradients = [
  'from-indigo-500 to-purple-600',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-amber-500 to-orange-500',
  'from-green-500 to-emerald-500',
  'from-violet-500 to-purple-600',
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Verified Buyer',
    rating: 5,
    comment: 'Absolutely love this platform! The product quality is exceptional and delivery was faster than expected. Will definitely shop here again.',
    date: '2 days ago',
    initials: 'SJ',
    color: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Michael Chen',
    role: 'Premium Member',
    rating: 5,
    comment: 'Best e-commerce experience I\'ve ever had. The UI is stunning, products are genuine, and customer support is top-notch. Highly recommend!',
    date: '1 week ago',
    initials: 'MC',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'Priya Sharma',
    role: 'Verified Buyer',
    rating: 4,
    comment: 'Great selection of products and competitive prices. The checkout process is seamless and returns are hassle-free. 5 stars!',
    date: '3 days ago',
    initials: 'PS',
    color: 'from-purple-500 to-violet-600',
  },
];

const promoStats = [
  { value: '50K+', label: 'Products', icon: '📦' },
  { value: '2M+', label: 'Customers', icon: '😊' },
  { value: '99.9%', label: 'Satisfaction', icon: '⭐' },
  { value: '24/7', label: 'Support', icon: '🎧' },
];

// Typewriter effect hook
function useTypewriter(words, speed = 80, pause = 1500) {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIdx];
    const timer = setTimeout(() => {
      if (!deleting) {
        if (charIdx < word.length) {
          setText(word.slice(0, charIdx + 1));
          setCharIdx(charIdx + 1);
        } else {
          setTimeout(() => setDeleting(true), pause);
        }
      } else {
        if (charIdx > 0) {
          setText(word.slice(0, charIdx - 1));
          setCharIdx(charIdx - 1);
        } else {
          setDeleting(false);
          setWordIdx((i) => (i + 1) % words.length);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timer);
  }, [text, charIdx, deleting, wordIdx, words, speed, pause]);

  return text;
}

function Section({ children, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${className}`}
    >
      {children}
    </motion.section>
  );
}

function SectionTitle({ title, subtitle, linkTo, linkText }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-semibold text-sm hover:gap-2 transition-all duration-200"
        >
          {linkText || 'View All'} <FiChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

// Countdown renderer
const CountdownRenderer = ({ hours, minutes, seconds, completed }) => {
  if (completed) return <span className="text-white font-bold">Sale ended!</span>;
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-2 text-white">
      {[{ v: hours, l: 'HRS' }, { v: minutes, l: 'MIN' }, { v: seconds, l: 'SEC' }].map(({ v, l }, i) => (
        <div key={l} className="flex items-center gap-2">
          {i > 0 && <span className="text-2xl font-black opacity-70">:</span>}
          <div className="bg-black/30 rounded-xl px-3 py-2 text-center min-w-[3.5rem]">
            <p className="text-2xl font-black">{pad(v)}</p>
            <p className="text-[10px] tracking-widest opacity-70">{l}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const typewriterText = useTypewriter(['Future.', 'World.', 'Deals.', 'Style.'], 80, 1800);

  // Get next midnight for flash sale countdown
  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 0);

  const { data: bestSellersData, isLoading: bsLoading } = useQuery({
    queryKey: ['bestSellers'],
    queryFn: () => getBestSellersAPI(8),
    staleTime: 5 * 60 * 1000,
  });

  const { data: newArrivalsData, isLoading: naLoading } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: () => getNewArrivalsAPI(4),
    staleTime: 5 * 60 * 1000,
  });

  const { data: saleProductsData, isLoading: saleLoading } = useQuery({
    queryKey: ['saleProducts'],
    queryFn: () => getSaleProductsAPI(6),
    staleTime: 5 * 60 * 1000,
  });

  const bestSellers = bestSellersData?.products || [];
  const newArrivals = newArrivalsData?.products || [];
  const saleProducts = saleProductsData?.products || [];

  // Floating badges data
  const floatingBadges = [
    { text: '50K+ Products', icon: '📦', delay: 0 },
    { text: 'Free Shipping', icon: '🚚', delay: 0.3 },
    { text: 'Easy Returns', icon: '🔄', delay: 0.6 },
    { text: '24/7 Support', icon: '🎧', delay: 0.9 },
  ];

  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('seenSplash');
  });

  const handleEnterStore = () => {
    sessionStorage.setItem('seenSplash', 'true');
    setShowSplash(false);
  };

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        handleEnterStore();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  if (showSplash) {
    return (
      <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden bg-black select-none z-[9999]">
        <ShaderBackground />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative text-center z-10 flex flex-col items-center gap-6 px-4"
        >
          <motion.div className="flex gap-2.5 sm:gap-4 justify-center items-center">
            {['Z', 'O', 'R', 'A'].map((char, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="text-7xl sm:text-9xl font-black text-white tracking-tight drop-shadow-[0_0_35px_rgba(139,92,246,0.6)] font-inter select-none"
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
          <motion.p
            variants={itemVariants}
            className="text-xs sm:text-sm uppercase tracking-[0.4em] text-slate-300 font-semibold max-w-xs sm:max-w-md drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
          >
            Curated Premium Aesthetics
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="w-48 h-[2px] bg-slate-800 rounded-full overflow-hidden mt-2 relative"
          >
            <motion.div
              initial={{ left: '-100%' }}
              animate={{ left: '100%' }}
              transition={{ duration: 3.5, ease: 'easeInOut', repeat: 0 }}
              className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_8px_#a855f7]"
            />
          </motion.div>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(168,85,247,0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEnterStore}
            className="mt-6 px-8 py-3.5 rounded-full border border-purple-500/40 bg-purple-600/10 text-purple-300 hover:text-white hover:bg-purple-600/20 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300 backdrop-blur-md"
          >
            Enter Gallery
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      {/* ======= HERO SECTION ======= */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden hero-gradient">
        {/* WebGL Shader Background embedded directly inside the hero section */}
        <ShaderBackground className="absolute top-0 left-0 w-full h-full -z-10 object-cover opacity-70" />
        
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 -right-20 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, -20, 0], y: [0, 15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-1/4 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-10 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"
          />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/20 border border-primary-500/30 rounded-full text-primary-300 text-sm font-semibold mb-6"
            >
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
              New Season — 40% Off Selected Items
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none mb-4"
            >
              Welcome to{' '}
              <span className="gradient-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                ZORA
              </span>
              <br />
              <span className="text-slate-300 font-semibold text-3xl sm:text-4xl tracking-wide">Aesthetic Store</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 text-lg mb-8 max-w-md leading-relaxed"
            >
              Discover curated premium items across apparel, tech gadgets, and designer essentials. 
              Enjoy a decent, elegant, and seamless shopping experience.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(147, 51, 234, 0.5)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/products')}
                className="flex items-center gap-2 px-7 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold text-base transition-all duration-200 shadow-lg"
              >
                <FiShoppingBag size={18} /> Shop Now <FiArrowRight size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/products?onSale=true')}
                className="flex items-center gap-2 px-7 py-4 border-2 border-white/30 text-white rounded-2xl font-bold text-base hover:bg-white/10 transition-all duration-200"
              >
                <FiZap size={18} /> View Deals
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-6"
            >
              {promoStats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-xl font-black text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Visual */}
          <div className="relative hidden lg:block">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full aspect-square max-w-md mx-auto"
            >
              {/* Central visual element */}
              <div className="w-full h-full rounded-3xl bg-gradient-to-br from-primary-600/30 via-purple-700/20 to-indigo-800/30 backdrop-blur-sm border border-white/10 flex items-center justify-center relative overflow-hidden">
                {/* Decorative rings */}
                <div className="absolute inset-8 rounded-3xl border border-white/10" />
                <div className="absolute inset-16 rounded-3xl border border-white/10" />
                <div className="absolute inset-24 rounded-3xl border border-white/5" />

                {/* Center icon */}
                <motion.div
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="w-40 h-40 bg-gradient-to-br from-primary-500 to-purple-700 rounded-3xl flex items-center justify-center shadow-glow-lg"
                >
                  <FiShoppingBag size={60} className="text-white" />
                </motion.div>

                {/* Floating mini cards */}
                {[
                  { x: '-60%', y: '-40%', emoji: '📱', label: 'Electronics' },
                  { x: '60%', y: '-35%', emoji: '👗', label: 'Fashion' },
                  { x: '-55%', y: '40%', emoji: '🏠', label: 'Home' },
                  { x: '55%', y: '40%', emoji: '💄', label: 'Beauty' },
                ].map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.2, type: 'spring' }}
                    style={{ left: '50%', top: '50%', transform: `translate(calc(-50% + ${card.x}), calc(-50% + ${card.y}))` }}
                    className="absolute glass rounded-xl px-3 py-2 text-center w-20 shadow-lg"
                  >
                    <p className="text-xl">{card.emoji}</p>
                    <p className="text-[10px] text-white font-semibold">{card.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Floating badges */}
            <div className="absolute -bottom-4 left-0 right-0 flex flex-wrap gap-2 justify-center">
              {floatingBadges.map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: badge.delay + 1 }}
                  className="glass rounded-full px-3 py-1.5 flex items-center gap-1.5 text-white text-xs font-semibold"
                >
                  <span>{badge.icon}</span> {badge.text}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"
        >
          <div className="w-5 h-8 border-2 border-slate-500 rounded-full flex justify-center pt-1">
            <div className="w-1 h-2 bg-slate-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ======= TRUST BAR ======= */}
      <div className="bg-primary-600 dark:bg-primary-700 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-4">
          {[
            { icon: FiTruck, text: 'Free Shipping Over $50' },
            { icon: FiShield, text: '100% Secure Payment' },
            { icon: FiZap, text: 'Flash Deals Daily' },
            { icon: FiStar, text: '4.9★ Customer Rating' },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-2 text-white text-sm font-semibold">
              <Icon size={16} className="text-primary-200" /> {text}
            </div>
          ))}
        </div>
      </div>

      {/* ======= FEATURED CATEGORIES ======= */}
      <Section>
        <SectionTitle
          title="Shop by Category"
          subtitle="Explore our curated collections"
          linkTo="/products"
          linkText="All Categories"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, scale: 1.03 }}
            >
              <Link
                to={`/products?category=${cat.slug}`}
                className={`block p-5 rounded-2xl bg-gradient-to-br ${categoryGradients[i % categoryGradients.length]} text-white text-center shadow-lg hover:shadow-xl transition-all duration-300 group`}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                  {cat.icon}
                </div>
                <p className="font-bold text-sm">{cat.name}</p>
                <p className="text-white/70 text-xs mt-0.5">Shop Now →</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ======= FLASH SALE ======= */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 p-6 sm:p-8 mb-8">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-y-0 w-1/2 bg-white/5"
              />
            </div>

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiZap size={20} className="text-white" />
                  <span className="text-white font-black text-xl sm:text-2xl">⚡ Flash Sale</span>
                  <span className="badge bg-white/20 text-white border border-white/30 text-xs font-bold">
                    LIMITED TIME
                  </span>
                </div>
                <p className="text-white/90 text-sm mb-4">Deals ending in:</p>
                <Countdown date={nextMidnight} renderer={CountdownRenderer} />
              </div>
              <Link
                to="/products?onSale=true"
                className="bg-white text-red-600 font-black px-6 py-3 rounded-xl hover:bg-red-50 transition-colors shadow-lg text-sm whitespace-nowrap flex items-center gap-2"
              >
                View All Deals <FiArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Sale products horizontal scroll */}
          <div className="scroll-x flex gap-4 pb-2 -mx-4 px-4">
            {saleLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-52">
                    <ProductCardSkeleton />
                  </div>
                ))
              : saleProducts.length > 0
              ? saleProducts.map((product) => (
                  <div key={product._id} className="shrink-0 w-52">
                    <ProductCard product={product} />
                  </div>
                ))
              : Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-52">
                    <div className="card p-4 text-center">
                      <div className="text-4xl mb-2">🎁</div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sale Item {i + 1}</p>
                      <p className="text-xs text-slate-400">Coming soon</p>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ======= BEST SELLERS ======= */}
      <Section>
        <SectionTitle
          title="🔥 Best Sellers"
          subtitle="Our most popular products this week"
          linkTo="/products?sort=-numReviews"
          linkText="View All"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {bsLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : bestSellers.length > 0
            ? bestSellers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            : Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card p-4 text-center">
                  <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-700 dark:to-dark-600 rounded-xl mb-3 flex items-center justify-center text-4xl">
                    {['📱', '👟', '⌚', '🎧', '💻', '📷', '🎮', '💎'][i]}
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Product {i + 1}</p>
                  <p className="text-xs text-primary-600 font-bold mt-1">$99.99</p>
                </div>
              ))}
        </div>
      </Section>

      {/* ======= PROMOTIONAL BANNERS ======= */}
      <Section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-purple-700 to-indigo-800 p-8 min-h-[200px] flex flex-col justify-end"
          >
            <div className="absolute top-0 right-0 text-[120px] opacity-20 leading-none select-none">☀️</div>
            <p className="badge bg-white/20 text-white text-xs mb-3 w-fit">SUMMER SALE</p>
            <h3 className="text-2xl font-black text-white mb-2">Up to 40% Off</h3>
            <p className="text-white/80 text-sm mb-4">On selected summer essentials</p>
            <Link to="/products?onSale=true" className="btn-primary py-2 px-5 text-sm w-fit bg-white/20 hover:bg-white/30 border border-white/30 hover:shadow-none hover:translate-y-0">
              Shop Sale
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 min-h-[200px] flex flex-col justify-end"
          >
            <div className="absolute top-0 right-0 text-[120px] opacity-20 leading-none select-none">💻</div>
            <p className="badge bg-primary-500/30 text-primary-300 text-xs mb-3 w-fit">NEW ARRIVALS</p>
            <h3 className="text-2xl font-black text-white mb-2">New Electronics</h3>
            <p className="text-slate-400 text-sm mb-4">Latest tech, best prices</p>
            <Link to="/products?category=electronics&sort=-createdAt" className="btn-primary py-2 px-5 text-sm w-fit">
              Explore Now
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ======= NEW ARRIVALS ======= */}
      <Section>
        <SectionTitle
          title="✨ New Arrivals"
          subtitle="Fresh products just landed"
          linkTo="/products?sort=-createdAt"
          linkText="View All"
        />
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {naLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : newArrivals.length > 0
            ? newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-4 text-center">
                  <div className="w-full aspect-square bg-gradient-to-br from-primary-50 to-purple-50 dark:from-dark-700 dark:to-dark-600 rounded-xl mb-3 flex items-center justify-center text-4xl">
                    {['🆕', '🔥', '⚡', '🎯'][i]}
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Item {i + 1}</p>
                  <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs">NEW</span>
                </div>
              ))}
        </div>
      </Section>

      {/* ======= TESTIMONIALS ======= */}
      <Section>
        <SectionTitle title="💬 What Our Customers Say" subtitle="Real reviews from real people" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -4 }}
              className="card-hover p-6"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <FiStar key={s} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5 italic">
                "{t.comment}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${t.color} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role} · {t.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ======= NEWSLETTER ======= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-purple-600 to-indigo-700 p-8 sm:p-12 text-center">
            {/* Background orbs */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4" />

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-4xl mb-3">📬</p>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                  Get Exclusive Deals First!
                </h2>
                <p className="text-primary-200 mb-8 max-w-md mx-auto">
                  Join 2M+ shoppers. Subscribe for exclusive deals, early access, and style tips.
                </p>
                <form
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                  onSubmit={(e) => {
                    e.preventDefault();
                    import('react-hot-toast').then(({ default: toast }) => toast.success('Subscribed! 🎉'));
                  }}
                >
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-5 py-3.5 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:bg-white/30 transition-all"
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="px-6 py-3.5 bg-white text-primary-700 font-bold rounded-2xl hover:bg-primary-50 transition-colors shadow-lg whitespace-nowrap"
                  >
                    Subscribe 🎉
                  </motion.button>
                </form>
                <p className="text-primary-300/70 text-xs mt-3">
                  No spam. Unsubscribe anytime. We respect your privacy.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
