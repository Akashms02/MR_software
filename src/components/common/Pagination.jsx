import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
  currentPage = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  isLoading = false,
  activeBtnClass = 'bg-[#C8F04A] text-[#111827]',
  simple = false,
}) => {
  if (totalElements === 0) return null;
  if (simple && totalPages <= 1) return null;

  const startEntry = currentPage * pageSize + 1;
  const endEntry = Math.min((currentPage + 1) * pageSize, totalElements);

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(0);

      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);

      if (currentPage <= 2) {
        end = 3;
      } else if (currentPage >= totalPages - 3) {
        start = totalPages - 4;
      }

      if (start > 1) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 2) {
        pages.push('...');
      }

      // Always include last page
      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className={simple 
      ? "flex items-center justify-center gap-1.5 py-4 select-none" 
      : "flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 pb-0 px-2 border-t border-[#F3F4F6] bg-white mt-auto shrink-0 select-none"
    }>
      {!simple && (
        <div className="text-[12.5px] font-semibold text-[#6B7280]">
          Showing <span className="text-[#111827]">{totalElements === 0 ? 0 : startEntry}</span> to{' '}
          <span className="text-[#111827]">{endEntry}</span> of{' '}
          <span className="text-[#111827]">{totalElements}</span> entries
        </div>
      )}

      <div className="flex items-center gap-1.5">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0 || isLoading}
          className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-150 flex items-center justify-center"
          title="First Page"
        >
          <ChevronsLeft size={14} strokeWidth={2} />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || isLoading}
          className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-150 flex items-center justify-center"
          title="Previous Page"
        >
          <ChevronLeft size={14} strokeWidth={2} />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-[12.5px] font-bold text-[#9CA3AF]"
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className={`min-w-[28px] h-[28px] px-1.5 flex items-center justify-center rounded-lg text-[12px] font-bold border transition-all duration-150 cursor-pointer ${
                  isActive
                    ? `${activeBtnClass} border-transparent shadow-xs`
                    : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:border-gray-300'
                }`}
              >
                {page + 1}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1 || isLoading}
          className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-150 flex items-center justify-center"
          title="Next Page"
        >
          <ChevronRight size={14} strokeWidth={2} />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1 || isLoading}
          className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-150 flex items-center justify-center"
          title="Last Page"
        >
          <ChevronsRight size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
