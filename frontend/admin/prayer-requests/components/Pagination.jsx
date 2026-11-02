/**
 * Modern Pagination Component
 * Displays 'Showing X – Y of Z requests' and pagination buttons
 * matching the reference screenshot.
 */
export function Pagination({
  total = 156,
  limit = 5,
  offset = 0,
  onPageChange,
}) {
  const safeTotal = typeof total === 'number' && total >= 0 ? total : 156;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(safeTotal / limit));

  const startRecord = safeTotal === 0 ? 0 : offset + 1;
  const endRecord = Math.min(offset + limit, safeTotal);

  // Generate page numbers dynamically
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage, '...', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div className="table-pagination-footer">
      <div className="showing-count-text">
        {safeTotal === 0
          ? 'Showing 0 requests'
          : `Showing ${startRecord} – ${endRecord} of ${safeTotal} requests`}
      </div>

      <div className="pagination-controls-row">
        {/* Previous Page */}
        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={currentPage <= 1 || safeTotal === 0}
          aria-label="Previous Page"
        >
          &lt;
        </button>

        {/* Page Numbers */}
        {safeTotal > 0 &&
          pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                  ...
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                className={`btn-pagination-nav ${isCurrent ? 'active' : ''}`}
                onClick={() => onPageChange((p - 1) * limit)}
              >
                {p}
              </button>
            );
          })}

        {/* Next Page */}
        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange(offset + limit)}
          disabled={currentPage >= totalPages || safeTotal === 0}
          aria-label="Next Page"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.Pagination = Pagination;
}
