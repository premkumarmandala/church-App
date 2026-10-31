/**
 * ViewTabs Component
 * Horizontal navigation tabs: Read Scripture, Search Bible, Bookmarks, and Offline Reading.
 * Features active pill styling, active underline bar, and dynamic bookmarks count badge.
 */

function ViewTabs({ activeTab, onSelectTab, bookmarksCount = 0 }) {
  const tabs = [
    {
      id: "reader",
      label: "Read Scripture",
      icon: (
        <svg className="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      )
    },
    {
      id: "search",
      label: "Search Bible",
      icon: (
        <svg className="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      )
    },
    {
      id: "bookmarks",
      label: "Bookmarks",
      badge: bookmarksCount,
      icon: (
        <svg className="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    },
    {
      id: "offline",
      label: "Offline Reading",
      icon: (
        <svg className="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      )
    }
  ];

  return (
    <nav className="bible-view-tabs" aria-label="Feature View Navigation">
      <div className="tabs-flex-row">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`btn-view-tab ${isActive ? "active" : ""}`}
              onClick={() => onSelectTab(tab.id)}
              aria-selected={isActive}
              role="tab"
            >
              <span className="tab-icon-wrapper">{tab.icon}</span>
              <span className="tab-label-text">{tab.label}</span>
              {typeof tab.badge !== "undefined" && (
                <span className="tab-badge-pill">{tab.badge}</span>
              )}
              {isActive && <span className="tab-active-indicator-bar" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

window.ViewTabs = ViewTabs;
