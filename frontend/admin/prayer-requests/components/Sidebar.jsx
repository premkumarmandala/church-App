/**
 * Sidebar Navigation Component
 * Features church branding crest, admin profile, active navigation states,
 * and placeholder ministry tabs with 'Coming Soon' badges.
 */

export function Sidebar({ currentView, onViewChange, pendingCount = 0, onLogout, isOpen, onClose }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      isPlaceholder: false,
    },
    {
      id: 'prayer-requests',
      label: 'Prayer Requests',
      icon: '🙏',
      badge: pendingCount > 0 ? pendingCount : null,
      isPlaceholder: false,
    },
  ];

  const placeholderItems = [
    { id: 'sermons', label: 'Sermons', icon: '🎙️' },
    { id: 'events', label: 'Events & Calendar', icon: '📅' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'users', label: 'Users & Pastoral Team', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      {isOpen && <div className="admin-sidebar-backdrop" onClick={onClose} />}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Church Branding */}
        <div className="sidebar-brand">
          <div className="brand-crest">✝</div>
          <div className="brand-details">
            <div className="brand-name">Grace Fellowship</div>
            <div className="brand-role">Pastoral Admin</div>
          </div>
        </div>

        {/* Administrator Profile Card */}
        <div className="sidebar-profile">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">PS</div>
            <div className="online-pulse" title="Pastor Online" />
          </div>
          <div className="profile-info">
            <div className="profile-name">Pastor John Samuel</div>
            <div className="profile-title">Senior Pastor / Admin</div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Pastoral Care</div>
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => {
                onViewChange(item.id);
                if (onClose) onClose();
              }}
              role="button"
              tabIndex={0}
            >
              <div className="nav-item-content">
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span className="nav-badge" title={`${item.badge} Pending Requests`}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}

          <div className="nav-section-title" style={{ marginTop: '16px' }}>
            Church Administration
          </div>
          {placeholderItems.map((item) => (
            <div key={item.id} className="nav-item disabled" title="Coming Soon">
              <div className="nav-item-content">
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <span className="nav-badge-pill">Soon</span>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-sidebar-action"
            title="View Public Church Website"
          >
            <span>🌐</span>
            <span>View Public Site</span>
          </a>
          <button
            type="button"
            className="btn-sidebar-action logout"
            onClick={onLogout}
            title="Sign Out of Pastoral Dashboard"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

if (typeof window !== 'undefined') {
  window.Sidebar = Sidebar;
}
