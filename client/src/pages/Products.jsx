import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getProductsAPI } from '../api/productAPI';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';
import ProductSort from '../components/product/ProductSort';
import Breadcrumb from '../components/common/Breadcrumb';

const DEFAULT_FILTERS = {
  categories: [],
  brands: [],
  minPrice: 0,
  maxPrice: 10000,
  rating: 0,
  inStock: false,
  onSale: false,
};

const LIMIT = 12;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState('grid');

  // Derive filters from URL params
  const getFiltersFromParams = useCallback(() => {
    return {
      categories: searchParams.get('category') ? [searchParams.get('category')] : [],
      brands: searchParams.get('brand') ? [searchParams.get('brand')] : [],
      minPrice: Number(searchParams.get('minPrice')) || 0,
      maxPrice: Number(searchParams.get('maxPrice')) || 10000,
      rating: Number(searchParams.get('rating')) || 0,
      inStock: searchParams.get('inStock') === 'true',
      onSale: searchParams.get('onSale') === 'true',
    };
  }, [searchParams]);

  const [filters, setFilters] = useState(getFiltersFromParams);

  const page = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || '-createdAt';
  const search = searchParams.get('search') || '';

  // Build API params
  const buildApiParams = () => {
    const params = { page, limit: LIMIT, sort };
    if (search) params.search = search;
    if (filters.categories.length > 0) params.category = filters.categories.join(',');
    if (filters.brands.length > 0) params.brand = filters.brands.join(',');
    if (filters.minPrice > 0) params.minPrice = filters.minPrice;
    if (filters.maxPrice < 10000) params.maxPrice = filters.maxPrice;
    if (filters.rating > 0) params.rating = filters.rating;
    if (filters.inStock) params.inStock = true;
    if (filters.onSale) params.onSale = true;
    return params;
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', { page, sort, search, filters }],
    queryFn: () => getProductsAPI(buildApiParams()),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });

  const products = data?.products || [];
  const totalCount = data?.totalCount ?? data?.total ?? 0;
  const totalPages = Math.ceil(totalCount / LIMIT);

  // Update URL when filters change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const params = {};
    if (newFilters.categories.length > 0) params.category = newFilters.categories[0];
    if (newFilters.brands.length > 0) params.brand = newFilters.brands[0];
    if (newFilters.minPrice > 0) params.minPrice = newFilters.minPrice;
    if (newFilters.maxPrice < 10000) params.maxPrice = newFilters.maxPrice;
    if (newFilters.rating > 0) params.rating = newFilters.rating;
    if (newFilters.inStock) params.inStock = true;
    if (newFilters.onSale) params.onSale = true;
    if (sort !== '-createdAt') params.sort = sort;
    if (search) params.search = search;
    params.page = newFilters.page || 1;
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    const params = {};
    if (sort !== '-createdAt') params.sort = sort;
    if (search) params.search = search;
    setSearchParams(params);
  };

  const handleSortChange = (newSort) => {
    const params = Object.fromEntries(searchParams);
    params.sort = newSort;
    params.page = 1;
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = Object.fromEntries(searchParams);
    params.page = newPage;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Products', path: '/products' }]} />

      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          {search ? `Results for "${search}"` : 'All Products'}
        </h1>
        {search && (
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {totalCount} results found
          </p>
        )}
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <ProductFilters
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          resultCount={totalCount}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <ProductSort
            sort={sort}
            onSortChange={handleSortChange}
            view={view}
            onViewChange={setView}
            totalCount={totalCount}
            page={page}
            limit={LIMIT}
          />

          {/* Mobile filter button is inside ProductFilters component */}
          <div className="flex items-center gap-3 mb-4 lg:hidden">
            <ProductFilters
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
              resultCount={totalCount}
            />
          </div>

          <motion.div
            key={`${page}-${sort}-${search}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ProductGrid
              products={products}
              loading={isLoading || isFetching}
              view={view}
            />
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <FiChevronLeft size={18} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (page <= 3) pageNum = i + 1;
                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = page - 2 + i;

                return (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                      page === pageNum
                        ? 'bg-primary-600 text-white shadow-glow'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
