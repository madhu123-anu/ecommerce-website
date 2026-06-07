import { FiGrid, FiList, FiChevronDown } from 'react-icons/fi';
import { SORT_OPTIONS } from '../../utils/constants';

export default function ProductSort({ sort, onSortChange, view, onViewChange, totalCount, page, limit }) {
  const startItem = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-4 bg-white dark:bg-dark-800 rounded-xl border border-slate-100 dark:border-slate-700">
      {/* Results count */}
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {totalCount > 0 ? (
          <span>
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startItem}–{endItem}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span> results
          </span>
        ) : (
          <span>No results found</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Sort Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:block">
              Sort by:
            </label>
            <div className="relative">
              <select
                value={sort || '-createdAt'}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <FiChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-dark-700 rounded-lg p-1">
          <button
            onClick={() => onViewChange('grid')}
            className={`p-1.5 rounded-md transition-all duration-200 ${
              view === 'grid'
                ? 'bg-white dark:bg-dark-600 text-primary-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            aria-label="Grid view"
          >
            <FiGrid size={15} />
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`p-1.5 rounded-md transition-all duration-200 ${
              view === 'list'
                ? 'bg-white dark:bg-dark-600 text-primary-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            aria-label="List view"
          >
            <FiList size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
