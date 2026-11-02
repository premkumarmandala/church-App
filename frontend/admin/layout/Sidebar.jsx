/**
 * CMS Master Sidebar Navigation Component
 * Features all 12 modules, church crest branding, admin profile, and live badges.
 */
export function Sidebar({ currentModule, onSelectModule, pendingPrayersCount = 0, onLogout, isOpen, onClose }) {
  const navSections = [
    {
      title: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      ],
    },
    {
      title: 'Website Content',
      items: [
        { id: 'home', label: 'Home Page', icon: '🏠' },
        { id: 'about', label: 'About Us', icon: '📖' },
        { id: 'sermons', label: 'Sermons', icon: '🎙️' },
        { id: 'events', label: 'Events & Calendar', icon: '📅' },
        { id: 'ministries', label: 'Ministries', icon: '👥' },
        { id: 'gallery', label: 'Photo & Video Gallery', icon: '🖼️' },
        { id: 'service-timings', label: 'Service Timings', icon: '⏰' },
        { id: 'announcements', label: 'Announcements', icon: '📢' },
        { id: 'contact', label: 'Contact & Location', icon: '📍' },
        { id: 'bible', label: 'Bible Settings', icon: '📜' },
      ],
    },
    {
      title: 'Pastoral Care',
      items: [
        {
          id: 'prayer-requests',
          label: 'Prayer Requests',
          icon: '🙏',
          badge: pendingPrayersCount > 0 ? pendingPrayersCount : null,
        },
      ],
    },
    {
      title: 'System & SEO',
      items: [
        { id: 'settings', label: 'Website Settings', icon: '⚙️' },
      ],
    },
  ];

  return (
    <>
      {isOpen && <div className="admin-sidebar-backdrop" onClick={onClose} />}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Church Branding Crest */}
        <div className="sidebar-brand">
          <div className="brand-crest">✝</div>
          <div className="brand-details">
            <div className="brand-name">Grace Fellowship</div>
            <div className="brand-role">Church Website CMS</div>
          </div>
        </div>

        {/* Administrator Profile Card */}
        <div className="sidebar-profile">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">PS</div>
            <div className="online-pulse" title="Administrator Online" />
          </div>
          <div className="profile-info">
            <div className="profile-name">Pastor John Samuel</div>
            <div className="profile-title">Chief Administrator</div>
          </div>
        </div>

        {/* Modular Navigation */}
        <nav className="sidebar-nav" style={{ paddingBottom: '24px' }}>
          {navSections.map((sec, sIdx) => (
            <div key={sec.title || sIdx}>
              <div className="nav-section-title">{sec.title}</div>
              {sec.items.map((item) => (
                <div
                  key={item.id}
                  className={`nav-item ${currentModule === item.id ? 'active' : ''}`}
                  onClick={() => {
                    onSelectModule(item.id);
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
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </div>
              ))}
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
            title="Preview Public Website in new tab"
          >
            <span>🌐</span>
            <span>View Public Site ↗</span>
          </a>
          <button
            type="button"
            className="btn-sidebar-action logout"
            onClick={onLogout}
            title="Sign Out of CMS Portal"
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

