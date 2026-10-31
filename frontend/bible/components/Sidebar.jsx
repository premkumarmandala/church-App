/**
 * Sidebar Navigation Component
 * Recreates left sidebar with logo, navigation links, bookmarks count badge,
 * and bottom scripture citation box matching the design.
 */

function Sidebar({ activeTab, onSelectTab, bookmarksCount = 0, isOpen, onClose }) {
  const navItems = [
    {
      id: "reader",
      label: "Read Bible",
      icon: (
        <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      )
    },
    {
      id: "search",
      label: "Search",
      icon: (
        <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    },
    {
      id: "offline",
      label: "Offline Reading",
      icon: (
        <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`bible-sidebar ${isOpen ? "sidebar-open" : ""}`} aria-label="Bible Navigation Sidebar">
        {/* Mobile Close Button */}
        <button 
          className="sidebar-close-btn" 
          onClick={onClose} 
          aria-label="Close Sidebar"
        >
          ✕
        </button>

        {/* Brand Header */}
        <div className="sidebar-brand">
          <a href="../index.html" className="brand-badge-link" title="Return to Church Home">
            <div className="brand-cross-box">
              <span className="brand-cross-symbol">✝</span>
            </div>
            <div className="brand-info">
              <h2 className="brand-app-name">Grace Church Bible</h2>
              <span className="brand-app-tagline">Holy Scriptures</span>
            </div>
          </a>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu-list">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className="sidebar-menu-item">
                  <button
                    type="button"
                    className={`sidebar-nav-btn ${isActive ? "active" : ""}`}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (onClose) onClose();
                    }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="sidebar-item-icon">{item.icon}</span>
                    <span className="sidebar-item-label">{item.label}</span>
                    {typeof item.badge !== "undefined" && (
                      <span className="sidebar-badge-count">{item.badge}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Scripture Quote Box */}
        <div className="sidebar-footer-quote">
          <div className="quote-icon-wrap">
            <svg className="quote-book-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </div>
          <div className="quote-text-border">
            <p className="quote-text">
              &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
            </p>
            <span className="quote-citation">Psalm 119:105</span>
          </div>
        </div>
      </aside>
    </>
  );
}

window.Sidebar = Sidebar;
