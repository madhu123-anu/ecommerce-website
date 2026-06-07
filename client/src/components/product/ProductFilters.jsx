import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import { FiStar } from 'react-icons/fi';
import { CATEGORIES, RATING_FILTER_OPTIONS } from '../../utils/constants';

const BRANDS = [
  'Apple', 'Samsung', 'Sony', 'Nike', 'Adidas',
  'LG', 'Dell', 'HP', 'Canon', 'Lenovo',
];

function FilterSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{title}</span>
        {isOpen ? (
          <FiChevronUp size={16} className="text-slate-400" />
        ) : (
          <FiChevronDown size={16} className="text-slate-400" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductFilters({ filters, onChange, onClear, resultCount }) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFilterCount = [
    filters.categories?.length > 0,
    filters.brands?.length > 0,
    filters.minPrice > 0 || filters.maxPrice < 10000,
    filters.rating > 0,
    filters.inStock,
    filters.onSale,
  ].filter(Boolean).length;

  const toggleCategory = (slug) => {
    const cats = filters.categories || [];
    const newCats = cats.includes(slug) ? cats.filter((c) => c !== slug) : [...cats, slug];
    onChange({ ...filters, categories: newCats, page: 1 });
  };

  const toggleBrand = (brand) => {
    const brands = filters.brands || [];
    const newBrands = brands.includes(brand) ? brands.filter((b) => b !== brand) : [...brands, brand];
    onChange({ ...filters, brands: newBrands, page: 1 });
  };

  const FilterContent = () => (
    <div className="space-y-0">
      {/* Categories */}
      <FilterSection title="Categories">
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={(filters.categories || []).includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
                className="rounded"
              />
              <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                <span>{cat.icon}</span>
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Brands */}
      <FilterSection title="Brands" defaultOpen={false}>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={(filters.brands || []).includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="rounded"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                {brand}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-primary-600 dark:text-primary-400">
              ${filters.minPrice || 0}
            </span>
            <span className="text-primary-600 dark:text-primary-400">
              ${filters.maxPrice || 10000}
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Min Price</label>
              <input
                type="range"
                min={0}
                max={filters.maxPrice || 10000}
                value={filters.minPrice || 0}
                onChange={(e) =>
                  onChange({ ...filters, minPrice: Number(e.target.value), page: 1 })
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Max Price</label>
              <input
                type="range"
                min={filters.minPrice || 0}
                max={10000}
                value={filters.maxPrice || 10000}
                onChange={(e) =>
                  onChange({ ...filters, maxPrice: Number(e.target.value), page: 1 })
                }
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={filters.minPrice || ''}
              onChange={(e) => onChange({ ...filters, minPrice: Number(e.target.value), page: 1 })}
              placeholder="Min"
              className="input-field py-1.5 text-sm"
            />
            <input
              type="number"
              min={0}
              value={filters.maxPrice || ''}
              onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value), page: 1 })}
              placeholder="Max"
              className="input-field py-1.5 text-sm"
            />
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Minimum Rating">
        <div className="space-y-2">
          {RATING_FILTER_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === opt.value}
                onChange={() => onChange({ ...filters, rating: opt.value, page: 1 })}
              />
              <span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">
                {Array.from({ length: opt.value }).map((_, i) => (
                  <FiStar key={i} size={12} className="text-amber-400 fill-amber-400" />
                ))}
                <span className="ml-1">& above</span>
              </span>
            </label>
          ))}
          {filters.rating > 0 && (
            <button
              onClick={() => onChange({ ...filters, rating: 0, page: 1 })}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              Clear rating
            </button>
          )}
        </div>
      </FilterSection>

      {/* Availability & Discount */}
      <FilterSection title="Availability & Offers" defaultOpen={false}>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock || false}
              onChange={(e) => onChange({ ...filters, inStock: e.target.checked, page: 1 })}
              className="rounded"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">In Stock Only</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.onSale || false}
              onChange={(e) => onChange({ ...filters, onSale: e.target.checked, page: 1 })}
              className="rounded"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">On Sale</span>
          </label>
        </div>
      </FilterSection>

      {/* Actions */}
      {activeFilterCount > 0 && (
        <button
          onClick={onClear}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <FiRefreshCw size={14} /> Clear All Filters
          {activeFilterCount > 0 && (
            <span className="badge bg-red-500 text-white">{activeFilterCount}</span>
          )}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FiFilter size={16} className="text-primary-600" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="badge-primary text-xs">{activeFilterCount}</span>
                )}
              </h2>
              {resultCount !== undefined && (
                <span className="text-xs text-slate-400">{resultCount} results</span>
              )}
            </div>
            <FilterContent />
          </div>
        </div>
      </aside>

      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 btn-outline py-2 px-4 text-sm"
        >
          <FiFilter size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="badge-primary">{activeFilterCount}</span>
          )}
        </button>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {showMobileFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setShowMobileFilters(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-dark-800 z-50 overflow-y-auto shadow-2xl"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <FiFilter size={16} className="text-primary-600" /> Filters
                    </h2>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                  <FilterContent />
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="btn-primary w-full mt-4"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
