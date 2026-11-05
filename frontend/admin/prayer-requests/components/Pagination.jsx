/**
 * Standardized Pagination Component
 * Displays 'Showing X – Y of Z records' with accessible SVG chevron navigation buttons.
 */
export function Pagination({
  total = 0,
  limit = 10,
  offset = 0,
  onPageChange,
  entityLabel = 'records',
}) {
  const safeTotal = typeof total === 'number' && total >= 0 ? total : 0;
  const safeLimit = Math.max(1, limit);
  const currentPage = Math.floor(offset / safeLimit) + 1;
  const totalPages = Math.max(1, Math.ceil(safeTotal / safeLimit));

  const startRecord = safeTotal === 0 ? 0 : offset + 1;
  const endRecord = Math.min(offset + safeLimit, safeTotal);

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
          ? `No ${entityLabel} found`
          : `Showing ${startRecord} – ${endRecord} of ${safeTotal} ${entityLabel}`}
      </div>

      <div className="pagination-controls-row">
        {/* Previous Page */}
        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange(Math.max(0, offset - safeLimit))}
          disabled={currentPage <= 1 || safeTotal === 0}
          aria-label="Previous Page"
          title="Previous Page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
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
                onClick={() => onPageChange((p - 1) * safeLimit)}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {p}
              </button>
            );
          })}

        {/* Next Page */}
        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange(offset + safeLimit)}
          disabled={currentPage >= totalPages || safeTotal === 0}
          aria-label="Next Page"
          title="Next Page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.Pagination = Pagination;
}
