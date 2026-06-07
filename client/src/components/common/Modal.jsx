import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useEffect } from 'react';

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md', hideClose = false }) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className={`relative w-full ${sizeClasses[size]} bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[90vh] flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || !hideClose) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
                {title && (
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
                )}
                {!hideClose && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                    aria-label="Close modal"
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
