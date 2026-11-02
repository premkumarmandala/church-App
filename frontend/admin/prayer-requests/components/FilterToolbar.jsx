/**
 * Prayer Requests Card Header Toolbar
 * Features card title 'Prayer Requests', inline tabs with counts,
 * search input with icon, filter icon button, and '+ Add Request' navy button
 * matching the reference screenshot.
 */
export function FilterToolbar({
  status = 'All',
  onStatusChange,
  searchQuery = '',
  onSearchChange,
  stats,
  onOpenAdd,
  onToggleFilterMenu,
}) {
  const totalVal = stats?.total_requests ?? stats?.total ?? 156;
  const pendingVal = stats?.pending_requests ?? stats?.pending ?? 12;
  const prayedVal = stats?.prayed_requests ?? stats?.prayed ?? 132;
  const archivedVal = stats?.archived_requests ?? stats?.archived ?? 12;

  const tabs = [
    { id: 'All', label: 'All', count: totalVal },
    { id: 'Pending', label: 'Pending', count: pendingVal },
    { id: 'Prayed', label: 'Prayed', count: prayedVal },
    { id: 'Archived', label: 'Archived', count: archivedVal },
  ];

  return (
    <div className="panel-header-toolbar">
      {/* Title & Inline Filter Tabs */}
      <div className="panel-title-and-tabs">
        <h2 className="panel-section-title">Prayer Requests</h2>

        <div className="inline-filter-tabs" role="tablist">
          {tabs.map((tab) => {
            const isActive = status === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`inline-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => onStatusChange(tab.id)}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Search, Filter & Add Request Button */}
      <div className="panel-right-tools">
        {/* Search input with search icon */}
        <div className="search-input-wrap">
          <span className="search-icon-svg">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="dashboard-search-input"
            placeholder="Search by name, email, or message..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filter funnel icon button */}
        <button
          type="button"
          className="btn-filter-icon"
          onClick={onToggleFilterMenu}
          title="Filter requests"
          aria-label="Filter"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>

        {/* + Add Request navy button */}
        <button
          type="button"
          className="btn-add-primary"
          onClick={onOpenAdd}
        >
          <span>+</span>
          <span>Add Request</span>
        </button>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FilterToolbar = FilterToolbar;
}
