/**
 * CMS Master Topbar Component
 */
export function Topbar({ currentModule, onToggleSidebar, onRefresh, isLoading }) {
  const titles = {
    dashboard: 'CMS Dashboard Overview',
    home: 'Home Page Management',
    about: 'About Us & History',
    bible: 'Bible Reader Display Settings',
    sermons: 'Sermons & Audio/Video Library',
    events: 'Events & Registration',
    ministries: 'Church Ministries',
    gallery: 'Photo & Video Gallery',
    'prayer-requests': 'Prayer Requests Portal',
    'service-timings': 'Weekly Service Timings',
    announcements: 'Announcements & Bulletins',
    contact: 'Contact & Campus Location',
    settings: 'Website Settings & SEO',
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="btn-mobile-menu"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
        <div className="breadcrumbs">
          <span>Church CMS</span>
          <span>/</span>
          <span className="breadcrumb-active">{titles[currentModule] || 'Dashboard'}</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="live-indicator">
          <div className="status-dot-pulse" />
          <span>{todayFormatted}</span>
        </div>
        <button
          type="button"
          className="btn-topbar-action"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh current data from database"
        >
          <span style={{ display: 'inline-block', transform: isLoading ? 'rotate(180deg)' : 'none', transition: 'transform 0.5s ease' }}>
            🔄
          </span>
          <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.8rem' }}
        >
          Live Site ↗
        </a>
      </div>
    </header>
  );
}

if (typeof window !== 'undefined') {
  window.Topbar = Topbar;
}

