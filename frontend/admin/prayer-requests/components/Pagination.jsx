/**
 * Pagination Controls Component
 * Provides rows-per-page selector, total count indicator, and previous/next page buttons.
 */

export function Pagination({
  total = 0,
  limit = 25,
  offset = 0,
  onPageChange,
  onLimitChange,
}) {
  if (total === 0) return null;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  const startEntry = Math.min(offset + 1, total);
  const endEntry = Math.min(offset + limit, total);

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing <strong>{startEntry}</strong> to <strong>{endEntry}</strong> of{' '}
        <strong>{total.toLocaleString()}</strong> prayer requests
      </div>

      <div className="pagination-controls">
        <label style={{ fontSize: '0.8rem', color: '#64748b', marginRight: '6px' }}>
          Per page:
          <select
            className="select-filter"
            style={{ padding: '4px 8px', marginLeft: '6px' }}
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>

        <button
          type="button"
          className="btn-page"
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={!canPrev}
        >
          ← Previous
        </button>

        <span style={{ fontSize: '0.825rem', fontWeight: 600, padding: '0 8px', color: '#334155' }}>
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          className="btn-page"
          onClick={() => onPageChange(offset + limit)}
          disabled={!canNext}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.Pagination = Pagination;
}
