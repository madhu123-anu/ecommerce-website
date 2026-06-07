import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

export default function Breadcrumb({ items = [], className = '' }) {
  const location = useLocation();

  // Auto-generate from path if no items provided
  const crumbs = items.length > 0
    ? items
    : (() => {
        const segments = location.pathname.split('/').filter(Boolean);
        return [
          { label: 'Home', path: '/' },
          ...segments.map((seg, idx) => ({
            label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
            path: '/' + segments.slice(0, idx + 1).join('/'),
          })),
        ];
      })();

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1 text-sm ${className}`}>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        const isFirst = index === 0;

        return (
          <div key={crumb.path || index} className="flex items-center gap-1">
            {index > 0 && (
              <FiChevronRight size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
            )}
            {isLast ? (
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px]">
                {isFirst && <FiHome size={13} className="inline mr-1 -mt-0.5" />}
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate max-w-[150px]"
              >
                {isFirst && <FiHome size={13} className="inline mr-1 -mt-0.5" />}
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
