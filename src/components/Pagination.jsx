import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Reusable Pagination Component
 * @param {number} currentPage - trang hiện tại (1-indexed)
 * @param {number} totalPages - tổng số trang
 * @param {number} totalItems - tổng số bản ghi
 * @param {number} pageSize - số bản ghi mỗi trang
 * @param {function} onPageChange - callback khi đổi trang
 */
export const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Tạo array các số trang hiển thị (tối đa 5 trang)
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    for (let i = left; i <= right; i++) range.push(i);

    if (left > 2) range.unshift('...');
    if (left > 1) range.unshift(1);
    if (right < totalPages - 1) range.push('...');
    if (right < totalPages) range.push(totalPages);

    return range;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3">
      {/* Info */}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Hiển thị{' '}
        <span className="font-black text-slate-700 dark:text-slate-200">{startItem}–{endItem}</span>
        {' '}trong{' '}
        <span className="font-black text-slate-700 dark:text-slate-200">{totalItems}</span>
        {' '}bản ghi
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-1">
        {/* First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Trang đầu"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-xs">…</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] h-8 rounded-lg text-xs font-black transition-all ${
                currentPage === page
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Trang sau"
        >
          <ChevronRight size={16} />
        </button>

        {/* Last */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Trang cuối"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};
