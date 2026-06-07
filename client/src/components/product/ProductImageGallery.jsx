import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiX } from 'react-icons/fi';
import { getProductImage } from '../../utils/productImages';


export default function ProductImageGallery({ images = [], productName = '' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [imgError, setImgError] = useState(false);

  const safeImages = [getProductImage(productName)];

  const changeIndex = (newIndex) => {
    setImgError(false);
    setActiveIndex(newIndex);
  };

  const prev = () => changeIndex(activeIndex === 0 ? safeImages.length - 1 : activeIndex - 1);
  const next = () => changeIndex(activeIndex === safeImages.length - 1 ? 0 : activeIndex + 1);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-dark-700 aspect-square cursor-zoom-in group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos({ x: 50, y: 50 })}
        onClick={() => setIsZoomed(true)}
      >
        <AnimatePresence mode="wait">
          {imgError || !safeImages[activeIndex] ? (
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-5xl select-none">
              {productName?.slice(0, 2).toUpperCase() || 'MS'}
            </div>
          ) : (
            <motion.img
              key={activeIndex}
              src={safeImages[activeIndex]}
              alt={`${productName} - Image ${activeIndex + 1}`}
              onError={() => setImgError(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </AnimatePresence>

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <FiZoomIn size={12} /> Click to zoom
        </div>

        {/* Image counter */}
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/50 text-white text-xs rounded-full">
          {activeIndex + 1} / {safeImages.length}
        </div>

        {/* Navigation arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-dark-800/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-md"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-dark-800/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-md"
            >
              <FiChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((img, i) => (
            <button
              key={i}
              onClick={() => changeIndex(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                i === activeIndex
                  ? 'border-primary-500 shadow-glow scale-105'
                  : 'border-transparent hover:border-slate-300 dark:hover:border-slate-500 opacity-70 hover:opacity-100'
              }`}
            >
              {!img ? (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs select-none">
                  {productName?.slice(0, 2).toUpperCase() || 'MS'}
                </div>
              ) : (
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={safeImages[activeIndex]}
                alt={productName}
                className="max-w-full max-h-[85vh] object-contain rounded-xl"
              />
              <button
                onClick={() => setIsZoomed(false)}
                className="absolute top-3 right-3 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <FiX size={18} />
              </button>
              {safeImages.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <FiChevronLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <FiChevronRight size={18} />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
