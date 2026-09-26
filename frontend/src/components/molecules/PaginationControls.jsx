import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * PaginationControls molecule.
 * Consumes the backend pagination shape: { totalProperties, currentPage, totalPages, hasNextPage, hasPrevPage }
 * OR the admin shape: { total, page, limit, totalPages, hasNextPage, hasPrevPage }
 */
const PaginationControls = ({ pagination, onPageChange, className = '' }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const currentPage = pagination.currentPage || pagination.page;
  const { totalPages, hasNextPage, hasPrevPage } = pagination;
  const total = pagination.totalProperties || pagination.total;

  // Generate visible page numbers (show max 5 pages centered on current)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    // Adjust start if we're near the end
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-between gap-4 pt-6 ${className}`}>
      {/* Results count */}
      <p className="text-sm text-gray-500 hidden sm:block">
        Page <span className="font-semibold text-gray-700">{currentPage}</span> of{' '}
        <span className="font-semibold text-gray-700">{totalPages}</span>
        {total && (
          <>
            {' '}
            ({total.toLocaleString()} total)
          </>
        )}
      </p>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <FiChevronLeft className="text-lg" />
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors
              ${page === currentPage
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <FiChevronRight className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
