/**
 * Centralized Church CMS Dashboard Overview Component
 * Displays key content metrics, recent administrative changes, and quick module navigation.
 */
export function DashboardOverview({ overview, onNavigateModule }) {
  const statCards = [
    {
      id: 'content',
      label: 'Website Content',
      value: overview?.total_content_items ?? 0,
      hint: 'Published site items',
      icon: '🌐',
      cardClass: 'total',
      target: 'home',
    },
    {
      id: 'sermons',
      label: 'Published Sermons',
      value: overview?.published_sermons ?? 0,
      hint: 'Video & audio messages',
      icon: '🎙️',
      cardClass: 'prayed',
      target: 'sermons',
    },
    {
      id: 'events',
      label: 'Upcoming Events',
      value: overview?.upcoming_events ?? 0,
      hint: 'Calendar & registrations',
      icon: '📅',
      cardClass: 'pending',
      target: 'events',
    },
    {
      id: 'prayers',
      label: 'Prayer Petitions',
      value: overview?.total_prayer_requests ?? 0,
      hint: 'Pastoral care requests',
      icon: '🙏',
      cardClass: 'archived',
      target: 'prayer-requests',
    },
  ];

  const quickLinks = [
    { id: 'home', label: 'Home Page', icon: '🏠', desc: 'Hero banners & CTAs' },
    { id: 'about', label: 'About Us', icon: '📖', desc: 'History, vision & beliefs' },
    { id: 'sermons', label: 'Sermons', icon: '🎙️', desc: 'Manage messages & audio' },
    { id: 'events', label: 'Events', icon: '📅', desc: 'Calendar & registrations' },
    { id: 'ministries', label: 'Ministries', icon: '👥', desc: 'Departments & teams' },
    { id: 'gallery', label: 'Gallery', icon: '🖼️', desc: 'Photos & event media' },
    { id: 'service-timings', label: 'Service Timings', icon: '⏰', desc: 'Weekly schedule & hours' },
    { id: 'announcements', label: 'Announcements', icon: '📢', desc: 'Bulletins & urgent alerts' },
    { id: 'contact', label: 'Contact', icon: '📍', desc: 'Address, map & socials' },
    { id: 'bible', label: 'Bible Settings', icon: '📜', desc: 'Translations & reader UI' },
    { id: 'prayer-requests', label: 'Prayer Requests', icon: '🙏', desc: 'Review & intercede' },
    { id: 'settings', label: 'Site Settings', icon: '⚙️', desc: 'Branding, SEO & footer' },
  ];

  const activities = overview?.recent_activities || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Church Website CMS Dashboard</h1>
          <p className="page-subtitle">
            Manage all public website content, sermons, events, ministries, and pastoral prayer requests from a single portal.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ textDecoration: 'none' }}
        >
          <span>Preview Live Website ↗</span>
        </a>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div
            key={card.id}
            className={`stat-card ${card.cardClass}`}
            onClick={() => onNavigateModule(card.target)}
            role="button"
            tabIndex={0}
            title={`Open ${card.label}`}
          >
            <div className="stat-icon-wrap">{card.icon}</div>
            <div className="stat-content">
              <div className="stat-number">{card.value.toLocaleString()}</div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-hint">{card.hint}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Quick Navigation & Recent Activities */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Quick Module Navigation Panel */}
        <div className="panel-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.25rem' }}>🗂️</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f1e36' }}>
              Content Management Modules
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '12px',
            }}
          >
            {quickLinks.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigateModule(item.id)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0066cc';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '1.35rem', marginBottom: '4px' }}>{item.icon}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f1e36' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Admin Activities / Audit Trail */}
        <div className="panel-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.25rem' }}>📋</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f1e36' }}>
              Recent Administrative Activities
            </h3>
          </div>

          {activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '6px' }}>✨</span>
              <p style={{ fontSize: '0.875rem' }}>No recent admin actions recorded yet.</p>
              <p style={{ fontSize: '0.75rem', marginTop: '4px', color: '#94a3b8' }}>
                Modifications to sermons, events, and settings will appear here in real time.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activities.slice(0, 7).map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    gap: '12px',
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#e0f2fe',
                          color: '#0284c7',
                        }}
                      >
                        {log.module}
                      </span>
                      <strong style={{ fontSize: '0.825rem', color: '#0f1e36' }}>
                        {log.action}
                      </strong>
                    </div>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: '#475569',
                        marginTop: '3px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '280px',
                      }}
                    >
                      {log.details}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.DashboardOverview = DashboardOverview;
}

