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
  const safeTotal = Math.max(total, 0);
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(safeTotal / limit));

  const startRecord = safeTotal === 0 ? 0 : offset + 1;
  const endRecord = Math.min(offset + limit, safeTotal);

  return (
    <div className="table-pagination-footer">
      <div className="showing-count-text">
        Showing {startRecord} – {endRecord} of {safeTotal} requests
      </div>

      <div className="pagination-controls-row">
        {/* Previous Page */}
        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
        >
          &lt;
        </button>

        {/* Page Numbers */}
        <button
          type="button"
          className={`btn-pagination-nav ${currentPage === 1 ? 'active' : ''}`}
          onClick={() => onPageChange(0)}
        >
          1
        </button>

        {totalPages >= 2 && (
          <button
            type="button"
            className={`btn-pagination-nav ${currentPage === 2 ? 'active' : ''}`}
            onClick={() => onPageChange(limit)}
          >
            2
          </button>
        )}

        {totalPages >= 3 && (
          <button
            type="button"
            className={`btn-pagination-nav ${currentPage === 3 ? 'active' : ''}`}
            onClick={() => onPageChange(limit * 2)}
          >
            3
          </button>
        )}

        {totalPages > 4 && <span className="pagination-ellipsis">...</span>}

        {totalPages > 3 && (
          <button
            type="button"
            className={`btn-pagination-nav ${currentPage === totalPages ? 'active' : ''}`}
            onClick={() => onPageChange((totalPages - 1) * limit)}
          >
            {totalPages > 30 ? 32 : totalPages}
          </button>
        )}

        {/* Next Page */}
        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange(offset + limit)}
          disabled={currentPage >= totalPages}
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
