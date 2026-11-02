/**
 * Filter and Search Toolbar Component
 * Features status tabs with counters, full-text search input, category dropdown,
 * and quick filter reset.
 */

const CATEGORIES = [
  'All Categories',
  'Spiritual Growth',
  'Healing & Health',
  'Family & Children',
  'Financial & Job',
  'Comfort & Grief',
  'Salvation',
  'Praise & Thanksgiving',
  'Guidance & Wisdom',
  'General Need',
];

export function FilterToolbar({
  status,
  onStatusChange,
  category,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  stats,
  onResetFilters,
}) {
  const tabs = [
    { id: 'All', label: 'All Requests', count: stats?.total_requests ?? stats?.total ?? 0, className: '' },
    { id: 'Pending', label: 'Pending', count: stats?.pending_requests ?? stats?.pending ?? 0, className: 'pending' },
    { id: 'Prayed', label: 'Prayed', count: stats?.prayed_requests ?? stats?.prayed ?? 0, className: 'prayed' },
    { id: 'Archived', label: 'Archived', count: stats?.archived_requests ?? stats?.archived ?? 0, className: 'archived' },
  ];

  const hasActiveFilters = status !== 'All' || category !== 'All Categories' || Boolean(searchQuery.trim());

  return (
    <div className="toolbar-container">
      {/* Status Tabs Row */}
      <div className="toolbar-tabs-row">
        <div className="status-tabs" role="tablist">
          {tabs.map((tab) => {
            const isActive = status === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`tab-btn ${isActive ? `active ${tab.className}` : ''}`}
                onClick={() => onStatusChange(tab.id)}
              >
                <span>{tab.label}</span>
                <span className="tab-pill">{tab.count}</span>
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onResetFilters}
            title="Reset all filters and search"
          >
            <span>✖</span>
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Search and Category Filter Row */}
      <div className="toolbar-controls-row">
        <div className="search-box-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by requester, email, request ID, message..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              title="Clear search query"
            >
              ×
            </button>
          )}
        </div>

        <div className="filters-actions">
          <select
            className="select-filter"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by Prayer Category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FilterToolbar = FilterToolbar;
}
