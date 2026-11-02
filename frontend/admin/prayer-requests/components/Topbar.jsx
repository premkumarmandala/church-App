/**
 * Topbar Component
 * Provides breadcrumb trail, mobile sidebar drawer toggle,
 * live date/time indicator, and data refresh button.
 */

export function Topbar({ currentView, onToggleSidebar, onRefresh, isLoading }) {
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const viewTitles = {
    dashboard: 'Dashboard Overview',
    'prayer-requests': 'Prayer Requests',
  };

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="btn-mobile-menu"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <div className="breadcrumbs">
          <span>Church Admin</span>
          <span>/</span>
          <span className="breadcrumb-active">{viewTitles[currentView] || 'Prayer Requests'}</span>
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
          title="Refresh prayer records from database"
        >
          <span style={{ display: 'inline-block', transform: isLoading ? 'rotate(180deg)' : 'none', transition: 'transform 0.5s ease' }}>
            🔄
          </span>
          <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
        </button>
      </div>
    </header>
  );
}

if (typeof window !== 'undefined') {
  window.Topbar = Topbar;
}
