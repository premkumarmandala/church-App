/**
 * CMS Master Topbar Component
 * Matches the reference screenshot with page titles, notification bell,
 * and user profile avatar.
 */
export function Topbar({ currentModule, onToggleSidebar, onNotificationClick, pendingPrayersCount = 0 }) {
  const titles = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of prayer requests and church activities',
    },
    'prayer-requests': {
      title: 'Prayer Requests',
      subtitle: 'Manage, intercede, and archive church community prayer petitions',
    },
    sermons: {
      title: 'Sermons Library',
      subtitle: 'Manage recorded video messages, audio podcasts, and notes',
    },
    events: {
      title: 'Events & Calendar',
      subtitle: 'Upcoming gatherings, conferences, registrations, and posters',
    },
    announcements: {
      title: 'Announcements',
      subtitle: 'Publish church bulletins, fasting notices, and urgent alerts',
    },
    users: {
      title: 'Users & Team',
      subtitle: 'Pastoral staff, prayer coordinators, and administrator accounts',
    },
    settings: {
      title: 'Website Settings',
      subtitle: 'Church branding, SEO metadata, footer copy, and CMS configuration',
    },
    home: {
      title: 'Home Page Management',
      subtitle: 'Customize hero banner, welcome text, and calls to action',
    },
    about: {
      title: 'About Us Management',
      subtitle: 'Church history, mission, vision, doctrinal beliefs, and pastors',
    },
    bible: {
      title: 'Bible Display Settings',
      subtitle: 'Default translation and public scripture reader options',
    },
    ministries: {
      title: 'Ministries Management',
      subtitle: 'Church departments, youth, women, men, and outreach groups',
    },
    gallery: {
      title: 'Photo & Video Gallery',
      subtitle: 'Upload and organize high-resolution church event photography',
    },
    'service-timings': {
      title: 'Service Timings',
      subtitle: 'Configure weekly worship schedules and service hours',
    },
    contact: {
      title: 'Contact & Location',
      subtitle: 'Sanctuary address, telephone hotline, Google Maps, and socials',
    },
  };

  const currentInfo = titles[currentModule] || {
    title: 'Dashboard',
    subtitle: 'Overview of prayer requests and church activities',
  };

  return (
    <div className="admin-header-row">
      <div className="admin-header-titles">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-mobile-toggle"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="admin-page-heading">{currentInfo.title}</h1>
        </div>
        <p className="admin-page-subheading">{currentInfo.subtitle}</p>
      </div>

      <div className="admin-header-actions">
        {/* Notification Bell with red unread dot */}
        <button
          type="button"
          className="btn-bell-notification"
          onClick={onNotificationClick}
          title={pendingPrayersCount > 0 ? `${pendingPrayersCount} Pending Prayer Requests` : 'No pending prayer requests'}
          aria-label="Notifications"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {pendingPrayersCount > 0 && <span className="bell-unread-dot" />}
        </button>

        {/* User Profile Avatar */}
        <div className="header-user-avatar" title="Logged in as Admin">
          A
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.Topbar = Topbar;
}
