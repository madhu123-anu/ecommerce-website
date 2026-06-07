import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight,
  FiEdit2, FiTrash2, FiEye, FiMoreVertical
} from 'react-icons/fi';
import { TableRowSkeleton } from '../common/Loader';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  onEdit,
  onDelete,
  onView,
  rowActions,
  selectable = false,
  onSelectionChange,
  pagination = true,
  pageSize: initialPageSize = 10,
}) {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openActionRow, setOpenActionRow] = useState(null);

  // Search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.accessor ? row[col.accessor] : '';
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortConfig.key) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortConfig]);

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = pagination ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sorted;

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === paginated.length) {
      setSelectedRows([]);
      onSelectionChange?.([]);
    } else {
      const ids = paginated.map((row) => row._id || row.id);
      setSelectedRows(ids);
      onSelectionChange?.(ids);
    }
  };

  const toggleSelectRow = (id) => {
    const next = selectedRows.includes(id)
      ? selectedRows.filter((r) => r !== id)
      : [...selectedRows, id];
    setSelectedRows(next);
    onSelectionChange?.(next);
  };

  return (
    <div className="card overflow-hidden">
      {/* Table Header */}
      {searchable && (
        <div className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="relative flex-1 max-w-sm">
            <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="input-field pl-9 py-2 text-sm"
            />
          </div>
          {selectedRows.length > 0 && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {selectedRows.length} selected
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-slate-500">Rows:</label>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-dark-700 text-slate-700 dark:text-slate-300"
            >
              {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-dark-700/50 border-b border-slate-100 dark:border-slate-700">
              {selectable && (
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginated.length && paginated.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.accessor || col.label}
                  onClick={() => col.sortable !== false && col.accessor && handleSort(col.accessor)}
                  className={`px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap ${
                    col.sortable !== false && col.accessor ? 'cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && col.accessor && (
                      <span className="flex flex-col">
                        <FiChevronUp
                          size={10}
                          className={sortConfig.key === col.accessor && sortConfig.direction === 'asc' ? 'text-primary-500' : 'text-slate-300 dark:text-slate-600'}
                        />
                        <FiChevronDown
                          size={10}
                          className={sortConfig.key === col.accessor && sortConfig.direction === 'desc' ? 'text-primary-500' : 'text-slate-300 dark:text-slate-600'}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || onView || rowActions) && (
                <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={columns.length + (selectable ? 1 : 0) + 1} />
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (onEdit || onDelete || onView ? 1 : 0)}
                  className="px-4 py-16 text-center text-slate-400 dark:text-slate-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FiSearch size={28} className="opacity-30" />
                    <p className="font-medium">No records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {paginated.map((row, rowIdx) => {
                  const rowId = row._id || row.id || rowIdx;
                  return (
                    <motion.tr
                      key={rowId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
                    >
                      {selectable && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(rowId)}
                            onChange={() => toggleSelectRow(rowId)}
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={col.accessor || col.label} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                        </td>
                      ))}
                      {(onEdit || onDelete || onView || rowActions) && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {onView && (
                              <button
                                onClick={() => onView(row)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                title="View"
                              >
                                <FiEye size={15} />
                              </button>
                            )}
                            {onEdit && (
                              <button
                                onClick={() => onEdit(row)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                title="Edit"
                              >
                                <FiEdit2 size={15} />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(row)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                title="Delete"
                              >
                                <FiTrash2 size={15} />
                              </button>
                            )}
                            {rowActions && rowActions(row)}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
