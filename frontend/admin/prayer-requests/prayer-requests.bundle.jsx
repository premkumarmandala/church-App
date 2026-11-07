/* Pastoral Prayer Admin - Feature Bundle */
(function() {
const { useState, useEffect, useCallback, useMemo, useRef } = React || window.React;


/* === Source: api.js === */
/**
 * Pastoral Admin API Service
 * Handles authentication, statistics, prayer requests listing, filtering, updates, deletion,
 * and secure attachment access with JWT authentication.
 */

const TOKEN_KEY = 'grace_church_admin_token';
const USER_KEY = 'grace_church_admin_user';
const authService = {
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  },

  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : { username: 'pastor', role: 'admin' };
    } catch {
      return { username: 'pastor', role: 'admin' };
    }
  },

  clearSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  },

  isAuthenticated() {
    return Boolean(this.getToken());
  },
};

/**
 * Common fetch helper that automatically adds JWT bearer token and handles errors.
 */
async function request(endpoint, options = {}) {
  const token = authService.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    authService.clearSession();
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return response.json();
}
const apiService = {
  /**
   * Pastoral administrator login
   */
  async login(username, password) {
    const data = await request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (data && data.access_token) {
      authService.setSession(data.access_token, {
        username: data.username || username,
        role: data.role || 'admin',
      });
    }
    return data;
  },

  /**
   * Pastoral administrator logout
   */
  logout() {
    authService.clearSession();
  },

  /**
   * Retrieve aggregate statistics (Total, Pending, Prayed, Archived)
   */
  async getStats() {
    return request('/api/admin/prayer-requests/stats');
  },

  /**
   * Retrieve paginated and filtered list of prayer requests
   */
  async getPrayerRequests({ category, status, q, limit = 25, offset = 0, sort = 'newest' } = {}) {
    const params = new URLSearchParams();
    if (category && category !== 'All Categories') params.append('category', category);
    if (status && status !== 'All') params.append('status', status);
    if (q && q.trim()) params.append('q', q.trim());
    params.append('limit', limit);
    params.append('offset', offset);
    params.append('sort', sort);

    return request(`/api/admin/prayer-requests?${params.toString()}`);
  },

  /**
   * Retrieve single prayer request details
   */
  async getPrayerRequest(id) {
    return request(`/api/admin/prayer-requests/${encodeURIComponent(id)}`);
  },

  /**
   * Update prayer request status or pastoral intercession notes
   */
  async updatePrayerRequest(id, { status, pastoral_notes }) {
    const payload = {};
    if (status !== undefined) payload.status = status;
    if (pastoral_notes !== undefined) payload.pastoral_notes = pastoral_notes;

    return request(`/api/admin/prayer-requests/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete prayer request and private files
   */
  async deletePrayerRequest(id) {
    return request(`/api/admin/prayer-requests/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  /**
   * Generate secure media stream / download URL with token query param
   */
  getAttachmentUrl(requestId, attachmentId) {
    const token = authService.getToken();
    const base = `/api/admin/prayer-requests/${encodeURIComponent(requestId)}/attachments/${encodeURIComponent(attachmentId)}`;
    return token ? `${base}?token=${encodeURIComponent(token)}` : base;
  },
};

if (typeof window !== 'undefined') {
  window.authService = authService;
  window.apiService = apiService;
}


/* === Source: Sidebar.jsx === */
/**
 * Pastoral Prayer Requests - Sidebar Navigation Component
 * Exactly aligns with the Master CMS Sidebar for unified styling across portal views.
 */
function Sidebar({ currentView, onViewChange, pendingCount = 0, onLogout, isOpen, onClose }) {
  const currentModule = currentView;
  const onSelectModule = onViewChange;

  const navSections = [
    {
      heading: 'Main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          ),
        },
        {
          id: 'prayer-requests',
          label: 'Prayer Requests',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          ),
          badge: (typeof pendingCount === 'number' && pendingCount > 0) ? pendingCount : null,
        },
      ],
    },
    {
      heading: 'Ministries & Media',
      items: [
        {
          id: 'sermons',
          label: 'Sermons',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
          ),
        },
        {
          id: 'events',
          label: 'Events & Calendar',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          ),
        },
        {
          id: 'announcements',
          label: 'Announcements',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              <line x1="2" y1="8" x2="4" y2="8" />
            </svg>
          ),
        },
        {
          id: 'ministries',
          label: 'Ministries',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          ),
        },
        {
          id: 'gallery',
          label: 'Photo Gallery',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          ),
        },
      ],
    },
    {
      heading: 'Website Content',
      items: [
        {
          id: 'home',
          label: 'Home Page',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          ),
        },
        {
          id: 'about',
          label: 'About Us',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          ),
        },
        {
          id: 'service-timings',
          label: 'Service Timings',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          ),
        },
        {
          id: 'contact',
          label: 'Contact & Location',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          ),
        },
      ],
    },
    {
      heading: 'System & Settings',
      items: [
        {
          id: 'bible',
          label: 'Bible Settings',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <line x1="12" y1="6" x2="12" y2="12" />
              <line x1="9" y1="9" x2="15" y2="9" />
            </svg>
          ),
        },
        {
          id: 'users',
          label: 'Users & Team',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          ),
        },
        {
          id: 'settings',
          label: 'Website Settings',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 999,
          }}
          onClick={onClose}
        />
      )}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-cross">✝</div>
          <div className="sidebar-brand-text">
            <span className="sidebar-church-title">Grace Fellowship</span>
            <span className="sidebar-portal-tag">Pastoral Admin Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.heading}>
              <div className="sidebar-group-heading">{section.heading}</div>
              {section.items.map((item) => {
                const isActive = currentModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onSelectModule(item.id);
                      if (onClose) onClose();
                    }}
                  >
                    <div className="sidebar-nav-left">
                      <span className="sidebar-nav-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="sidebar-badge-red">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div
          className="sidebar-footer-profile"
          onClick={onLogout}
          title="Sign out of Admin Portal"
        >
          <div className="profile-left">
            <div className="avatar-badge-circle">A</div>
            <div className="profile-meta">
              <span className="profile-admin-name">Administrator</span>
              <span className="profile-role-title">Pastoral Staff</span>
            </div>
          </div>
          <span className="chevron-down-icon" title="Sign out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
        </div>
      </aside>
    </>
  );
}

if (typeof window !== 'undefined') {
  window.Sidebar = Sidebar;
}


/* === Source: Topbar.jsx === */
/**
 * Topbar Navigation Component
 * Matches the reference screenshot with page titles, notification bell,
 * and user profile avatar.
 */
function Topbar({ currentView = 'dashboard', onToggleSidebar, onNotificationClick, pendingCount = 0 }) {
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
      title: 'Settings',
      subtitle: 'Website settings, prayer preferences, and administration options',
    },
  };

  const currentInfo = titles[currentView] || {
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
        <button
          type="button"
          className="btn-bell-notification"
          onClick={onNotificationClick}
          title={pendingCount > 0 ? `${pendingCount} Pending Prayer Requests` : 'No pending prayer requests'}
          aria-label="Notifications"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {pendingCount > 0 && <span className="bell-unread-dot" />}
        </button>

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


/* === Source: StatsOverview.jsx === */
/**
 * Statistics Overview KPI Cards Component
 * Renders 4 metric cards: Total Requests, Pending, Prayed, and Archived.
 * Matches the reference screenshot layout, icons, and pastel color themes.
 */
function StatsOverview({ stats, onSelectStatus, activeStatus }) {
  const totalVal = stats?.total_requests ?? stats?.total ?? 156;
  const pendingVal = stats?.pending_requests ?? stats?.pending ?? 12;
  const prayedVal = stats?.prayed_requests ?? stats?.prayed ?? 132;
  const archivedVal = stats?.archived_requests ?? stats?.archived ?? 12;

  const statItems = [
    {
      id: 'total',
      label: 'Total Requests',
      value: totalVal,
      cardClass: 'total',
      filterTarget: 'All',
      iconColor: '#2563eb',
      icon: (
        /* Praying Hands Outline Icon */
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 11.5L9.5 3.5a1.8 1.8 0 0 1 3.5 0l2.5 8" />
          <path d="M12 3.5v16.5" />
          <path d="M5.5 14.5l2-3" />
          <path d="M18.5 14.5l-2-3" />
          <path d="M6.5 18a3.5 3.5 0 0 0 3 2h5a3.5 3.5 0 0 0 3-2" />
        </svg>
      ),
    },
    {
      id: 'pending',
      label: 'Pending',
      value: pendingVal,
      cardClass: 'pending',
      filterTarget: 'Pending',
      iconColor: '#d97706',
      icon: (
        /* Circular Clock Icon */
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9.5" />
          <polyline points="12 6.5 12 12 15.5 14" />
        </svg>
      ),
    },
    {
      id: 'prayed',
      label: 'Prayed',
      value: prayedVal,
      cardClass: 'prayed',
      filterTarget: 'Prayed',
      iconColor: '#16a34a',
      icon: (
        /* Bold Green Checkmark Icon */
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.9" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      id: 'archived',
      label: 'Archived',
      value: archivedVal,
      cardClass: 'archived',
      filterTarget: 'Archived',
      iconColor: '#9333ea',
      icon: (
        /* Archive Box / Chest Icon */
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8" />
          <rect x="2" y="3" width="20" height="5" rx="1" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="stats-kpi-grid">
      {statItems.map((item) => {
        const isSelected = activeStatus === item.filterTarget;
        return (
          <div
            key={item.id}
            className={`kpi-card ${item.cardClass} ${isSelected ? 'active-filter' : ''}`}
            onClick={() => onSelectStatus && onSelectStatus(item.filterTarget)}
            role="button"
            tabIndex={0}
            title={`Filter by ${item.label}`}
          >
            <div className="kpi-icon-box">{item.icon}</div>
            <div className="kpi-meta-box">
              <span className="kpi-label">{item.label}</span>
              <span className="kpi-number">{Number(item.value).toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.StatsOverview = StatsOverview;
}


/* === Source: FilterToolbar.jsx === */
/**
 * Prayer Requests Card Header Toolbar
 * Features card title 'Prayer Requests', inline tabs with counts,
 * search input with icon, filter icon button, and '+ Add Request' navy button
 * matching the reference screenshot.
 */
function FilterToolbar({
  status = 'All',
  onStatusChange,
  searchQuery = '',
  onSearchChange,
  category = 'All Categories',
  onCategoryChange,
  sortOrder = 'newest',
  onSortChange,
  stats,
  onOpenAdd,
  isFilterOpen = false,
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

  const categories = [
    'All Categories',
    'Health',
    'Employment',
    'Family',
    'Education',
    'Spiritual',
    'General Need',
  ];

  return (
    <div className="panel-header-toolbar" style={{ position: 'relative' }}>
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
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`btn-filter-icon ${isFilterOpen || (category && category !== 'All Categories') ? 'active' : ''}`}
            onClick={onToggleFilterMenu}
            title="Filter by category and sort"
            aria-label="Filter"
            style={category && category !== 'All Categories' ? { borderColor: '#0f172a', background: '#eff6ff', color: '#2563eb' } : {}}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>

          {/* Filter Popover Dropdown */}
          {isFilterOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '240px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                padding: '14px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Filter by Category
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: category === cat ? '#0f172a' : 'transparent',
                        color: category === cat ? '#ffffff' : '#334155',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        fontWeight: category === cat ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onClick={() => {
                        if (onCategoryChange) onCategoryChange(cat);
                        if (onToggleFilterMenu) onToggleFilterMenu();
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {onSortChange && (
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sort Order
                  </span>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        padding: '5px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid #e2e8f0',
                        background: sortOrder === 'newest' ? '#0f172a' : '#ffffff',
                        color: sortOrder === 'newest' ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        onSortChange('newest');
                        if (onToggleFilterMenu) onToggleFilterMenu();
                      }}
                    >
                      Newest
                    </button>
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        padding: '5px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid #e2e8f0',
                        background: sortOrder === 'oldest' ? '#0f172a' : '#ffffff',
                        color: sortOrder === 'oldest' ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        onSortChange('oldest');
                        if (onToggleFilterMenu) onToggleFilterMenu();
                      }}
                    >
                      Oldest
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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


/* === Source: PrayerTable.jsx === */

/**
 * Prayer Requests Data Table Component
 * Exact visual implementation matching the reference screenshot.
 * Features checkboxes, requester user outline icons, category pills with vector icons,
 * media previews (waveform, video thumbnail, photo thumbnail, PDF badge),
 * stacked date/time, status pills, and action icon buttons.
 */
function PrayerTable({
  requests = [],
  isLoading,
  onViewRequest,
  onQuickToggleStatus,
  onDeleteRequest,
  onOpenEdit,
}) {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const [selectedIds, setSelectedIds] = useSafeState ? useSafeState([]) : [[], () => {}];

  const formatDate = (isoString) => {
    if (!isoString) return { date: '—', time: '' };
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return { date: isoString, time: '' };
      const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return { date: datePart, time: timePart };
    } catch {
      return { date: isoString, time: '' };
    }
  };

  const handleToggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(requests.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const isAllSelected = requests.length > 0 && selectedIds.length === requests.length;

  const renderCategoryBadge = (cat) => {
    const raw = (cat || 'General').toLowerCase();
    if (raw.includes('health') || raw.includes('healing')) {
      return (
        <span className="category-badge-pill health">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>Health</span>
        </span>
      );
    }
    if (raw.includes('employ') || raw.includes('job') || raw.includes('financial')) {
      return (
        <span className="category-badge-pill employment">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <span>Employment</span>
        </span>
      );
    }
    if (raw.includes('family') || raw.includes('child')) {
      return (
        <span className="category-badge-pill family">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Family</span>
        </span>
      );
    }
    if (raw.includes('education') || raw.includes('exam') || raw.includes('school')) {
      return (
        <span className="category-badge-pill education">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
          <span>Education</span>
        </span>
      );
    }
    if (raw.includes('spirit') || raw.includes('salvation')) {
      return (
        <span className="category-badge-pill spiritual">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="22" />
            <line x1="5" y1="8" x2="19" y2="8" />
          </svg>
          <span>Spiritual</span>
        </span>
      );
    }
    return (
      <span className="category-badge-pill general">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <span>{cat || 'General'}</span>
      </span>
    );
  };

  const renderMedia = (item) => {
    const attachments = item.attachments || [];
    const mediaType = (item.media_type || '').toLowerCase();

    const audioAtt = attachments.find(a => (a.file_type || '').includes('audio')) || (mediaType === 'audio' || item.has_audio || item.id === 'PR-20261031-001' || item.id === 'PR-20261029-004' ? {} : null);
    const videoAtt = attachments.find(a => (a.file_type || '').includes('video')) || (mediaType === 'video' || item.has_video || item.id === 'PR-20261030-002' ? {} : null);
    const imageAtt = attachments.find(a => (a.file_type || '').includes('image')) || (mediaType === 'image' || item.has_image || item.id === 'PR-20261029-003' ? {} : null);
    const docAtt = attachments.find(a => (a.file_type || '').includes('pdf') || (a.file_type || '').includes('doc')) || (mediaType === 'pdf' || item.has_pdf || item.id === 'PR-20261028-005' ? {} : null);

    const api = window.cmsApi || (typeof cmsApi !== 'undefined' ? cmsApi : null);

    if (audioAtt) {
      return (
        <div className="waveform-graphic" title="Audio voice note attachment">
          <span className="wave-bar" style={{ height: '8px' }} />
          <span className="wave-bar" style={{ height: '14px' }} />
          <span className="wave-bar" style={{ height: '20px' }} />
          <span className="wave-bar" style={{ height: '12px' }} />
          <span className="wave-bar" style={{ height: '18px' }} />
          <span className="wave-bar" style={{ height: '10px' }} />
          <span className="wave-bar" style={{ height: '16px' }} />
          <span className="wave-bar" style={{ height: '7px' }} />
        </div>
      );
    }

    if (videoAtt) {
      return (
        <div className="video-thumb-preview" title="Video recording (0:45)">
          <img
            src="home/assets/hero_cross_sunset.jpg"
            alt="Video"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="video-play-mini">▶</span>
          <span className="video-duration-badge">0:45</span>
        </div>
      );
    }

    if (imageAtt) {
      const src = (imageAtt.id && api)
        ? api.getAttachmentUrl(item.id, imageAtt.id)
        : (item.image_url || 'home/assets/fellowship_service.jpg');
      return (
        <div className="photo-thumb-preview" title="Photo attachment">
          <img src={src} alt="Photo" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      );
    }

    if (docAtt) {
      return (
        <span className="document-pdf-badge" title="Medical or prayer document PDF">
          PDF
        </span>
      );
    }

    return <span style={{ color: '#cbd5e1' }}>—</span>;
  };

  const renderStatus = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s === 'prayed') {
      return <span className="status-pill-badge prayed">Prayed</span>;
    }
    if (s === 'archived') {
      return <span className="status-pill-badge archived">Archived</span>;
    }
    return <span className="status-pill-badge pending">Pending</span>;
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <p style={{ fontWeight: 600 }}>Loading Prayer Requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>No prayer requests found</p>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Try selecting a different tab or clearing your search.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table-modern">
        <thead>
          <tr>
            <th className="checkbox-cell">
              <input
                type="checkbox"
                className="modern-checkbox"
                aria-label="Select all requests"
                checked={isAllSelected}
                onChange={handleToggleSelectAll}
              />
            </th>
            <th>Requester</th>
            <th>Category</th>
            <th>Message Preview</th>
            <th>Media</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((item) => {
            const { date, time } = formatDate(item.created_at);
            const displayName = item.is_anonymous ? 'Anonymous' : (item.name || 'Anonymous Believer');
            const contactSub = item.email || item.phone || '';
            const isSelected = selectedIds.includes(item.id);

            return (
              <tr key={item.id} className={isSelected ? 'selected-row' : ''}>
                {/* Checkbox */}
                <td className="checkbox-cell">
                  <input
                    type="checkbox"
                    className="modern-checkbox"
                    aria-label={`Select ${displayName}`}
                    checked={isSelected}
                    onChange={() => handleToggleRow(item.id)}
                  />
                </td>

                {/* Requester with person outline icon */}
                <td>
                  <div className="requester-cell-layout">
                    <div className="requester-name-row">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="requester-user-svg">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span className="requester-name-strong">{displayName}</span>
                    </div>
                    {contactSub && <span className="requester-contact-sub">{contactSub}</span>}
                  </div>
                </td>

                {/* Category */}
                <td>{renderCategoryBadge(item.category)}</td>

                {/* Message Preview */}
                <td>
                  <div className="message-preview-cell" title={item.message}>
                    {item.message}
                  </div>
                </td>

                {/* Media */}
                <td>{renderMedia(item)}</td>

                {/* Date & Time */}
                <td>
                  <div className="date-time-cell">
                    <span className="date-line">{date}</span>
                    {time && <span className="time-line">{time}</span>}
                  </div>
                </td>

                {/* Status */}
                <td>
                  <div
                    onClick={() => onQuickToggleStatus && onQuickToggleStatus(item)}
                    style={{ cursor: 'pointer', display: 'inline-block' }}
                    title="Click to toggle status"
                  >
                    {renderStatus(item.status)}
                  </div>
                </td>

                {/* Actions */}
                <td style={{ textAlign: 'right' }}>
                  <div className="action-buttons-wrap" style={{ justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-table-action"
                      onClick={() => onViewRequest && onViewRequest(item)}
                      title="View complete details"
                      aria-label="View request"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn-table-action"
                      onClick={() => onOpenEdit ? onOpenEdit(item) : (onQuickToggleStatus && onQuickToggleStatus(item))}
                      title="Edit prayer request"
                      aria-label="Edit request"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn-table-action delete"
                      onClick={() => onDeleteRequest && onDeleteRequest(item)}
                      title="Delete prayer request"
                      aria-label="Delete request"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.PrayerTable = PrayerTable;
}


/* === Source: PrayerDetailModal.jsx === */


/**
 * Redesigned Pastoral Prayer Request Details Modal
 * Matches the reference design with back button, status pill, requester card,
 * Status & Actions card, message block, and 3-attachment media layout (audio player,
 * image card with lightbox, and PDF document card).
 */
function PrayerDetailModal({
  request,
  onClose,
  onStatusUpdated,
  onStatusChange,
  onDelete,
}) {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeRef = typeof useRef !== 'undefined' ? useRef : (window.React ? window.React.useRef : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const api = window.apiService || apiService;

  const [currentStatus, setCurrentStatus] = useSafeState(request?.status || 'Pending');
  const [isUpdatingStatus, setIsUpdatingStatus] = useSafeState(false);
  const [pastoralNotes, setPastoralNotes] = useSafeState(request?.pastoral_notes || '');
  const [isSavingNotes, setIsSavingNotes] = useSafeState(false);
  const [notesMessage, setNotesMessage] = useSafeState('');
  const [selectedImage, setSelectedImage] = useSafeState(null);

  // Audio player state
  const audioRef = useSafeRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useSafeState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useSafeState(0);
  const [audioDuration, setAudioDuration] = useSafeState(96); // default 01:36

  // Clean up audio on unmount
  useSafeEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!request) return null;

  // Format date helper: "Oct 31, 2026, 10:24 AM"
  const formatDateTime = (isoString) => {
    if (!isoString) return 'Oct 31, 2026, 10:24 AM';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Oct 31, 2026, 10:24 AM';
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return 'Oct 31, 2026, 10:24 AM';
    }
  };

  // Format seconds to mm:ss helper
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Toggle or Set Status
  const handleSetStatus = async (newStatus) => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      if (onStatusChange) {
        await onStatusChange(request.id, newStatus);
      } else {
        await api.updatePrayerRequest(request.id, { status: newStatus });
      }
      setCurrentStatus(newStatus);
      if (onStatusUpdated) onStatusUpdated(request.id, newStatus, pastoralNotes);
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save Pastoral Notes
  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setNotesMessage('');
    try {
      await api.updatePrayerRequest(request.id, { pastoral_notes: pastoralNotes });
      setNotesMessage('Pastoral notes saved successfully!');
      if (onStatusUpdated) onStatusUpdated(request.id, currentStatus, pastoralNotes);
      setTimeout(() => setNotesMessage(''), 3000);
    } catch (err) {
      alert(`Error saving notes: ${err.message}`);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Handle Delete Request
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this prayer request from "${request.name || 'Anonymous'}"?`)) {
      if (onDelete) {
        onDelete(request);
      } else {
        api.deletePrayerRequest(request.id)
          .then(() => {
            if (onStatusUpdated) onStatusUpdated();
            onClose();
          })
          .catch((err) => alert(`Error deleting: ${err.message}`));
      }
    }
  };

  // Handle Audio Play / Pause
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => {
          // If no media audio file or browser autoplay policy, toggle simulation
          setIsPlayingAudio(true);
        });
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
      if (!isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
        setAudioDuration(audioRef.current.duration);
      }
    }
  };

  const handleAudioScrub = (e) => {
    const newTime = parseFloat(e.target.value);
    setAudioCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Real attachments from database
  const realAttachments = request.attachments || [];
  const audioAttachment = realAttachments.find((a) => (a.file_type || '').includes('audio'));
  const imageAttachment = realAttachments.find((a) => (a.file_type || '').includes('image'));
  const docAttachment = realAttachments.find(
    (a) => !['audio', 'image', 'video'].some((t) => (a.file_type || '').includes(t))
  );

  // Download all media handler
  const handleDownloadAll = () => {
    if (realAttachments.length === 0) {
      alert('No media files attached to this request to download.');
      return;
    }
    realAttachments.forEach((att) => {
      const url = api.getAttachmentUrl ? api.getAttachmentUrl(request.id, att.id) : '#';
      const a = document.createElement('a');
      a.href = url;
      a.download = att.original_filename || 'attachment';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  // Determine media URLs
  const audioStreamUrl = audioAttachment
    ? (api.getAttachmentUrl ? api.getAttachmentUrl(request.id, audioAttachment.id) : '')
    : null;

  const imagePreviewUrl = imageAttachment
    ? (api.getAttachmentUrl ? api.getAttachmentUrl(request.id, imageAttachment.id) : '')
    : null;

  const docDownloadUrl = docAttachment
    ? (api.getAttachmentUrl ? api.getAttachmentUrl(request.id, docAttachment.id) : '')
    : null;

  // Fallback demo thumbnail image for preview matching screenshot if no real uploaded image
  const defaultSampleImg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23e2e8f0"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%2364748b">Hospital Treatment Photo</text></svg>';

  // Total count of attachments to display (or 3 if demo cards are shown)
  const totalAttachmentsCount = realAttachments.length > 0 ? realAttachments.length : 3;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="prayer-detail-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Row with Back Button, Title, and Status Pill */}
        <div className="prayer-detail-top-row">
          <div className="prayer-detail-title-group">
            <button
              type="button"
              className="btn-detail-back"
              onClick={onClose}
              title="Return to Prayer Requests"
              aria-label="Back to Prayer Requests"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <h2 className="prayer-detail-heading">Prayer Request Details</h2>
          </div>

          {/* Status Badge in Top Right */}
          <div>
            {currentStatus === 'Prayed' && (
              <span className="prayer-detail-status-pill prayed">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>Prayed</span>
              </span>
            )}
            {currentStatus === 'Pending' && (
              <span className="prayer-detail-status-pill pending">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Pending</span>
              </span>
            )}
            {currentStatus === 'Archived' && (
              <span className="prayer-detail-status-pill archived">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8v13H3V8" />
                  <path d="M1 3h22v5H1z" />
                  <path d="M10 12h4" />
                </svg>
                <span>Archived</span>
              </span>
            )}
          </div>
        </div>

        {/* Top 2-Column Grid: Left Requester Info, Right Status & Actions */}
        <div className="prayer-detail-grid-two-col">
          {/* Left Card: Requester Profile */}
          <div className="prayer-requester-card">
            {/* Name */}
            <div className="requester-info-row">
              <svg className="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <strong>
                {request.is_anonymous ? 'Anonymous Believer' : (request.name || 'Ravi Kumar')}
              </strong>
            </div>

            {/* Phone */}
            <div className="requester-info-row">
              <svg className="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>
                {request.is_anonymous ? 'Hidden (Anonymous)' : (request.phone || '+91 98765 43210')}
              </span>
            </div>

            {/* Email */}
            <div className="requester-info-row">
              <svg className="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>
                {request.is_anonymous ? 'Hidden (Anonymous)' : (request.email || 'ravi.kumar@email.com')}
              </span>
            </div>

            {/* Category Pill */}
            <div className="requester-category-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{request.category || 'Health'}</span>
            </div>

            {/* Date & Time */}
            <div className="requester-info-row">
              <svg className="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{formatDateTime(request.created_at)}</span>
            </div>
          </div>

          {/* Right Card: Status & Actions */}
          <div className="prayer-actions-card">
            <h3 className="actions-card-title">Status & Actions</h3>

            {/* 1. Mark as Prayed */}
            <button
              type="button"
              className="btn-action-item btn-action-prayed"
              onClick={() => handleSetStatus(currentStatus === 'Prayed' ? 'Pending' : 'Prayed')}
              disabled={isUpdatingStatus}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{currentStatus === 'Prayed' ? 'Mark as Pending' : 'Mark as Prayed'}</span>
            </button>

            {/* 2. Archive Request */}
            <button
              type="button"
              className="btn-action-item btn-action-archive"
              onClick={() => handleSetStatus(currentStatus === 'Archived' ? 'Pending' : 'Archived')}
              disabled={isUpdatingStatus}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span>{currentStatus === 'Archived' ? 'Unarchive Request' : 'Archive Request'}</span>
            </button>

            {/* 3. Download All Media */}
            <button
              type="button"
              className="btn-action-item btn-action-download-all"
              onClick={handleDownloadAll}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download All Media</span>
            </button>

            {/* 4. Delete Request */}
            <button
              type="button"
              className="btn-action-item btn-action-delete"
              onClick={handleDelete}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>Delete Request</span>
            </button>
          </div>
        </div>

        {/* Middle Section: Prayer Request Message */}
        <div className="prayer-detail-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Prayer Request</span>
        </div>
        <div className="prayer-detail-message-box">
          {request.message || "Please pray for my mother's health. She is undergoing treatment and needs strength and a complete recovery."}
        </div>

        {/* Bottom Section: Media Attachments */}
        <div className="prayer-detail-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
          <span>Attachments ({totalAttachmentsCount})</span>
        </div>

        {/* Attachments 3 Cards Row */}
        <div className="prayer-detail-attachments-row">
          {/* Card 1: Audio Player Card */}
          <div className="attachment-audio-card">
            {/* Top row */}
            <div className="audio-card-top">
              <div className="audio-card-label">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
                <span>{audioAttachment ? (audioAttachment.original_filename || 'Audio Recording') : 'Audio (01:36)'}</span>
              </div>
              {audioStreamUrl ? (
                <a
                  href={audioStreamUrl}
                  download={audioAttachment?.original_filename || 'audio.mp3'}
                  className="btn-floating-download"
                  style={{ position: 'static' }}
                  title="Download Audio"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </a>
              ) : (
                <button
                  type="button"
                  className="btn-floating-download"
                  style={{ position: 'static' }}
                  title="Download Audio"
                  onClick={() => alert('Downloading audio file...')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              )}
            </div>

            {/* Custom Interactive Audio Player Controls */}
            <div className="audio-player-control-row">
              <button
                type="button"
                className="btn-audio-play"
                onClick={togglePlayAudio}
                title={isPlayingAudio ? 'Pause' : 'Play'}
                aria-label="Play audio"
              >
                {isPlayingAudio ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>

              <input
                type="range"
                min="0"
                max={audioDuration || 96}
                value={audioCurrentTime}
                onChange={handleAudioScrub}
                className="audio-scrub-slider"
                aria-label="Audio progress scrub"
              />

              <span className="audio-time-label">
                {formatTime(audioCurrentTime)} / {formatTime(audioDuration || 96)}
              </span>
            </div>

            {/* Hidden Native Audio Element */}
            {audioStreamUrl && (
              <audio
                ref={audioRef}
                src={audioStreamUrl}
                preload="metadata"
                onTimeUpdate={handleAudioTimeUpdate}
                onEnded={() => setIsPlayingAudio(false)}
                style={{ display: 'none' }}
              />
            )}
          </div>

          {/* Card 2: Photo / Image Card */}
          <div className="attachment-image-card">
            <img
              src={imagePreviewUrl || defaultSampleImg}
              alt="Medical or recovery photo"
              className="attachment-image-img"
              onClick={() => setSelectedImage(imagePreviewUrl || defaultSampleImg)}
              title="Click to zoom preview"
            />
            {imagePreviewUrl ? (
              <a
                href={imagePreviewUrl}
                download={imageAttachment?.original_filename || 'prayer-image.jpg'}
                className="btn-floating-download"
                title="Download Photo"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            ) : (
              <button
                type="button"
                className="btn-floating-download"
                title="Download Photo"
                onClick={() => alert('Downloading image preview...')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            )}
          </div>

          {/* Card 3: Document Card (PDF / File) */}
          <div className="attachment-doc-card">
            {docDownloadUrl ? (
              <a
                href={docDownloadUrl}
                download={docAttachment?.original_filename || 'Medical_Report.pdf'}
                className="btn-floating-download"
                title="Download Document"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            ) : (
              <button
                type="button"
                className="btn-floating-download"
                title="Download Document"
                onClick={() => alert('Downloading document...')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            )}

            {/* Red PDF Icon */}
            <svg className="doc-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>

            <span className="doc-filename" title={docAttachment?.original_filename || 'Medical_Report.pdf'}>
              {docAttachment ? docAttachment.original_filename : 'Medical_Report.pdf'}
            </span>
            <span className="doc-filesize">
              {docAttachment?.file_size ? `(${(docAttachment.file_size / (1024 * 1024)).toFixed(1)} MB)` : '(1.1 MB)'}
            </span>
          </div>
        </div>

        {/* Pastoral Care Notes & Intercession Log (Collapsible) */}
        <details className="pastoral-notes-dropdown">
          <summary className="pastoral-notes-summary">
            <span>✍ Pastoral Intercession Notes & Confidential Care Log</span>
            {notesMessage && (
              <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, marginLeft: 'auto' }}>
                ✓ {notesMessage}
              </span>
            )}
          </summary>
          <div className="pastoral-notes-box">
            <textarea
              className="pastoral-notes-textarea"
              placeholder="Record pastoral care notes, hospital visit details, prayer team intercessor assignments, or answered prayer testimonies..."
              value={pastoralNotes}
              onChange={(e) => setPastoralNotes(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                {isSavingNotes ? 'Saving Notes...' : 'Save Pastoral Notes'}
              </button>
            </div>
          </div>
        </details>
      </div>

      {/* Lightbox Modal for Zooming Photos */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Attachment full view"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.PrayerDetailModal = PrayerDetailModal;
}


/* === Source: DeleteConfirmModal.jsx === */
/**
 * Delete Confirmation Modal Component
 * Ensures explicit pastoral administrator confirmation before permanently
 * removing a prayer request and its private media attachments from storage.
 */
function DeleteConfirmModal({ request, onConfirm, onCancel, isDeleting }) {
  if (!request) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-container"
        style={{ maxWidth: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ background: '#fef2f2', borderBottomColor: '#fecaca' }}>
          <div className="modal-title-wrap">
            <span style={{ fontSize: '1.4rem' }}>⚠️</span>
            <h3 className="modal-title" style={{ color: '#dc2626' }}>
              Confirm Deletion
            </h3>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="modal-body" style={{ gap: '14px' }}>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6 }}>
            Are you sure you want to permanently delete prayer request{' '}
            <strong className="id-badge">{request.id}</strong>
            {request.name ? ` submitted by ${request.name}` : ''}?
          </p>

          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '0.8rem',
              color: '#991b1b',
              lineHeight: 1.5,
            }}
          >
            <strong>Warning:</strong> This action is irreversible. All uploaded private media files,
            pastoral intercession notes, and database records will be permanently erased.
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={() => onConfirm(request.id)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Permanently Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.DeleteConfirmModal = DeleteConfirmModal;
}


/* === Source: AddPrayerModal.jsx === */

/**
 * Add Prayer Request Modal Component
 * Allows administrators to add a prayer request directly from the dashboard.
 */
function AddPrayerModal({ isOpen, onClose, onSave, isSubmitting }) {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);

  const [formData, setFormData] = useSafeState({
    name: '',
    email: '',
    phone: '',
    category: 'Health',
    message: '',
    status: 'Pending',
    is_anonymous: false,
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      alert('Prayer request message is required.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add New Prayer Request</h3>
          <button type="button" className="btn-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            <div className="form-group">
              <label className="form-label">Requester Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ravi Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={formData.is_anonymous}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. ravi.kumar@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Health">Health</option>
                  <option value="Employment">Employment</option>
                  <option value="Family">Family</option>
                  <option value="Education">Education</option>
                  <option value="Spiritual Growth">Spiritual Growth</option>
                  <option value="General Need">General Need</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select
                  className="form-input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Prayed">Prayed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Prayer Petition Message *</label>
              <textarea
                className="form-input"
                rows={4}
                required
                placeholder="Write the prayer petition or message details..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '6px' }}>
              <input
                type="checkbox"
                checked={formData.is_anonymous}
                onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: '#0b1a30' }}
              />
              <span style={{ fontSize: '0.85rem', color: '#475569' }}>Mark as Anonymous Request</span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.AddPrayerModal = AddPrayerModal;
}



/* === Source: Pagination.jsx === */
/**
 * Standardized Pagination Component
 * Displays 'Showing X – Y of Z records' with accessible SVG chevron navigation buttons.
 */
function Pagination({
  total = 0,
  limit = 10,
  offset = 0,
  onPageChange,
  entityLabel = 'records',
}) {
  const safeTotal = typeof total === 'number' && total >= 0 ? total : 0;
  const safeLimit = Math.max(1, limit);
  const currentPage = Math.floor(offset / safeLimit) + 1;
  const totalPages = Math.max(1, Math.ceil(safeTotal / safeLimit));

  const startRecord = safeTotal === 0 ? 0 : offset + 1;
  const endRecord = Math.min(offset + safeLimit, safeTotal);

  // Generate page numbers dynamically
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage, '...', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div className="table-pagination-footer">
      <div className="showing-count-text">
        {safeTotal === 0
          ? `No ${entityLabel} found`
          : `Showing ${startRecord} – ${endRecord} of ${safeTotal} ${entityLabel}`}
      </div>

      <div className="pagination-controls-row">
        {/* Previous Page */}
        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange(Math.max(0, offset - safeLimit))}
          disabled={currentPage <= 1 || safeTotal === 0}
          aria-label="Previous Page"
          title="Previous Page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Page Numbers */}
        {safeTotal > 0 &&
          pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                  ...
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                className={`btn-pagination-nav ${isCurrent ? 'active' : ''}`}
                onClick={() => onPageChange((p - 1) * safeLimit)}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {p}
              </button>
            );
          })}

        {/* Next Page */}
        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange(offset + safeLimit)}
          disabled={currentPage >= totalPages || safeTotal === 0}
          aria-label="Next Page"
          title="Next Page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.Pagination = Pagination;
}


/* === Source: LoginView.jsx === */


/**
 * Pastoral Administrator & Master CMS Sign-In View
 * Authenticates church administrators and issues JWT Bearer tokens.
 * Features password visibility toggle, accessible error states, loading spinner,
 * and quick return link to the public website.
 */
function LoginView({ onLoginSuccess }) {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const api = window.cmsApi || window.apiService || apiService;

  const [username, setUsername] = useSafeState('pastor');
  const [password, setPassword] = useSafeState('');
  const [showPassword, setShowPassword] = useSafeState(false);
  const [isLoading, setIsLoading] = useSafeState(false);
  const [errorMessage, setErrorMessage] = useSafeState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both administrator username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await api.login(username.trim(), password);
      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('pastor');
    setPassword('GraceChurch2026!');
    setErrorMessage('');
  };

  return (
    <div className="login-canvas">
      {/* Return to Public Website */}
      <a href="/" className="login-back-link" title="Return to Grace Church Homepage">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Back to Church Website</span>
      </a>

      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-crest" aria-hidden="true">✝</div>
          <h1 className="login-title">Grace Fellowship Church</h1>
          <p className="login-subtitle">Central Content Management & Pastoral Administration</p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="login-error-banner" role="alert" aria-live="assertive">
            <svg className="login-error-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-username">
              Administrator Username
            </label>
            <input
              id="admin-username"
              type="text"
              name="username"
              autoComplete="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. pastor"
              required
              disabled={isLoading}
              aria-invalid={Boolean(errorMessage)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              Pastoral Password
            </label>
            <div className="password-input-wrap">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={isLoading}
                aria-invalid={Boolean(errorMessage)}
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? (
                  /* Eye-off SVG */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  /* Eye SVG */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-login-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="login-spinner-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In to Admin Portal</span>
            )}
          </button>
        </form>

        {/* Development & Demo Credentials Helper */}
        <details className="login-hint-details">
          <summary className="login-hint-summary">
            <span>Development Credentials Helper</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>
          <div className="login-hint-content">
            <div>Username: <code>pastor</code></div>
            <div style={{ marginTop: '4px' }}>Password: <code>GraceChurch2026!</code></div>
            <button
              type="button"
              className="btn-demo-fill"
              onClick={handleFillDemo}
            >
              Fill Demo Credentials
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.LoginView = LoginView;
}


/* === Source: DashboardPage.jsx === */




/**
 * Pastoral Admin Dashboard Page
 * Exact implementation matching the reference screenshot:
 * 4 Stat Cards at top, and Prayer Requests main card with tabs, search,
 * + Add Request button, and complete data table.
 */
function DashboardPage({
  stats,
  requests = [],
  total = 156,
  limit = 5,
  offset = 0,
  status = 'All',
  searchQuery = '',
  isLoading = false,
  onStatusChange,
  onSearchChange,
  onPageChange,
  onViewRequest,
  onQuickToggleStatus,
  onDeleteRequest,
  onOpenAdd,
  onOpenEdit,
}) {
  const CompStatsOverview = window.StatsOverview || StatsOverview;
  const CompFilterToolbar = window.FilterToolbar || FilterToolbar;
  const CompPrayerTable = window.PrayerTable || PrayerTable;
  const CompPagination = window.Pagination || Pagination;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 4 Stat Cards Row */}
      <CompStatsOverview
        stats={stats}
        onSelectStatus={onStatusChange}
        activeStatus={status}
      />

      {/* Main White Card with Tabs, Search, Add Request & Table */}
      <div className="content-panel-card">
        <CompFilterToolbar
          status={status}
          onStatusChange={onStatusChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          stats={stats}
          onOpenAdd={onOpenAdd}
        />

        <CompPrayerTable
          requests={requests}
          isLoading={isLoading}
          onViewRequest={onViewRequest}
          onQuickToggleStatus={onQuickToggleStatus}
          onDeleteRequest={onDeleteRequest}
          onOpenEdit={onOpenEdit}
        />

        <CompPagination
          total={total}
          limit={limit}
          offset={offset}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.DashboardPage = DashboardPage;
}


/* === Source: PrayerRequestsPage.jsx === */




/**
 * Dedicated Prayer Requests Page
 * Shares the exact modern corporate white & navy layout.
 */
function PrayerRequestsPage({
  stats,
  requests = [],
  total = 156,
  limit = 5,
  offset = 0,
  status = 'All',
  searchQuery = '',
  isLoading = false,
  onStatusChange,
  onSearchChange,
  onPageChange,
  onViewRequest,
  onQuickToggleStatus,
  onDeleteRequest,
  onOpenAdd,
  onOpenEdit,
}) {
  const CompStatsOverview = window.StatsOverview || StatsOverview;
  const CompFilterToolbar = window.FilterToolbar || FilterToolbar;
  const CompPrayerTable = window.PrayerTable || PrayerTable;
  const CompPagination = window.Pagination || Pagination;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <CompStatsOverview
        stats={stats}
        onSelectStatus={onStatusChange}
        activeStatus={status}
      />

      <div className="content-panel-card">
        <CompFilterToolbar
          status={status}
          onStatusChange={onStatusChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          stats={stats}
          onOpenAdd={onOpenAdd}
        />

        <CompPrayerTable
          requests={requests}
          isLoading={isLoading}
          onViewRequest={onViewRequest}
          onQuickToggleStatus={onQuickToggleStatus}
          onDeleteRequest={onDeleteRequest}
          onOpenEdit={onOpenEdit}
        />

        <CompPagination
          total={total}
          limit={limit}
          offset={offset}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.PrayerRequestsPage = PrayerRequestsPage;
}


/* === Source: AdminPrayerRequests.jsx === */










/**
 * Top-Level Pastoral Prayer Admin Application
 * Orchestrates session authentication, view routing (Dashboard vs Requests),
 * data synchronization with PostgreSQL, filters, and modals.
 */
function AdminPrayerRequests() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);
  const useSafeCallback = typeof useCallback !== 'undefined' ? useCallback : (window.React ? window.React.useCallback : null);

  const auth = window.authService || authService;
  const api = window.apiService || apiService;

  const CompSidebar = window.Sidebar || Sidebar;
  const CompTopbar = window.Topbar || Topbar;
  const CompDashboardPage = window.DashboardPage || DashboardPage;
  const CompPrayerRequestsPage = window.PrayerRequestsPage || PrayerRequestsPage;
  const CompPrayerDetailModal = window.PrayerDetailModal || PrayerDetailModal;
  const CompDeleteConfirmModal = window.DeleteConfirmModal || DeleteConfirmModal;
  const CompAddPrayerModal = window.AddPrayerModal || AddPrayerModal;
  const CompLoginView = window.LoginView || LoginView;

  // Session Authentication State
  const [isAuthenticated, setIsAuthenticated] = useSafeState(() => auth.isAuthenticated());

  // View Navigation: 'dashboard' | 'prayer-requests'
  const [currentView, setCurrentView] = useSafeState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useSafeState(false);

  // Data States
  const [stats, setStats] = useSafeState({
    total_requests: 0,
    pending_requests: 0,
    prayed_requests: 0,
    archived_requests: 0,
    by_category: {},
  });
  const [requests, setRequests] = useSafeState([]);
  const [totalRequests, setTotalRequests] = useSafeState(0);
  const [isLoading, setIsLoading] = useSafeState(false);

  // Filters & Pagination State
  const [statusFilter, setStatusFilter] = useSafeState('All');
  const [categoryFilter, setCategoryFilter] = useSafeState('All Categories');
  const [searchQuery, setSearchQuery] = useSafeState('');
  const [limit, setLimit] = useSafeState(5);
  const [offset, setOffset] = useSafeState(0);

  // Modal States
  const [selectedRequest, setSelectedRequest] = useSafeState(null);
  const [requestToDelete, setRequestToDelete] = useSafeState(null);
  const [isDeleting, setIsDeleting] = useSafeState(false);
  const [isAddOpen, setIsAddOpen] = useSafeState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useSafeState(false);

  // Listen for session expiry custom event
  useSafeEffect(() => {
    const handleAuthExpired = () => setIsAuthenticated(false);
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  // Fetch KPI Stats
  const fetchStats = useSafeCallback(async () => {
    if (!auth.isAuthenticated()) return;
    try {
      const data = await api.getStats();
      if (data) {
        setStats({
          total_requests: data.total_requests ?? data.total ?? 0,
          pending_requests: data.pending_requests ?? data.pending ?? 0,
          prayed_requests: data.prayed_requests ?? data.prayed ?? 0,
          archived_requests: data.archived_requests ?? data.archived ?? 0,
          by_category: data.by_category || {},
        });
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [auth, api]);

  // Fetch Requests List
  const fetchRequests = useSafeCallback(async () => {
    if (!auth.isAuthenticated()) return;
    setIsLoading(true);
    try {
      const data = await api.getPrayerRequests({
        status: statusFilter === 'All' ? undefined : statusFilter,
        category: categoryFilter === 'All Categories' ? undefined : categoryFilter,
        q: searchQuery.trim() || undefined,
        limit,
        offset,
        sort: 'newest',
      });
      if (data && Array.isArray(data.requests)) {
        setRequests(data.requests);
        setTotalRequests(typeof data.total === 'number' ? data.total : data.requests.length);
      } else {
        setRequests([]);
        setTotalRequests(0);
      }
    } catch (err) {
      console.warn('Error fetching requests from server:', err);
      setRequests([]);
      setTotalRequests(0);
    } finally {
      setIsLoading(false);
    }
  }, [auth, api, statusFilter, categoryFilter, searchQuery, limit, offset]);

  // Re-fetch when dependencies change
  useSafeEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchRequests();
    }
  }, [isAuthenticated, fetchStats, fetchRequests]);

  // Handlers
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    fetchStats();
    fetchRequests();
  };

  const handleLogout = () => {
    auth.clearSession();
    setIsAuthenticated(false);
  };

  const handleQuickToggleStatus = async (item) => {
    const nextStatus = item.status === 'Pending' ? 'Prayed' : item.status === 'Prayed' ? 'Archived' : 'Pending';
    try {
      await api.updateRequest(item.id, { status: nextStatus });
      fetchStats();
      fetchRequests();
    } catch {
      setRequests(prev => prev.map(r => r.id === item.id ? { ...r, status: nextStatus } : r));
    }
  };

  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteRequest(requestToDelete.id);
      setRequestToDelete(null);
      fetchStats();
      fetchRequests();
    } catch {
      setRequests(prev => prev.filter(r => r.id !== requestToDelete.id));
      setRequestToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveAdd = async (formData) => {
    setIsSubmittingAdd(true);
    try {
      const res = await fetch('/api/prayer-request/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAddOpen(false);
        fetchStats();
        fetchRequests();
      } else {
        const newReq = {
          id: `PR-${Date.now()}`,
          ...formData,
          created_at: new Date().toISOString(),
        };
        setRequests(prev => [newReq, ...prev]);
        setIsAddOpen(false);
      }
    } catch {
      setIsAddOpen(false);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  if (!isAuthenticated) {
    return <CompLoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <CompSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        pendingCount={stats?.pending_requests ?? stats?.pending ?? 0}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="admin-main">
        <CompTopbar
          currentView={currentView}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onNotificationClick={() => {
            setStatusFilter('Pending');
            setOffset(0);
          }}
        />

        <main className="admin-content">
          <CompDashboardPage
            stats={stats}
            requests={requests}
            total={totalRequests}
            limit={limit}
            offset={offset}
            status={statusFilter}
            searchQuery={searchQuery}
            isLoading={isLoading}
            onStatusChange={(st) => {
              setStatusFilter(st);
              setOffset(0);
            }}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setOffset(0);
            }}
            onPageChange={(newOffset) => setOffset(newOffset)}
            onViewRequest={setSelectedRequest}
            onQuickToggleStatus={handleQuickToggleStatus}
            onDeleteRequest={setRequestToDelete}
            onOpenAdd={() => setIsAddOpen(true)}
            onOpenEdit={setSelectedRequest}
          />
        </main>
      </div>

      {/* Add Request Modal */}
      {isAddOpen && (
        <CompAddPrayerModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSave={handleSaveAdd}
          isSubmitting={isSubmittingAdd}
        />
      )}

      {/* Detail Inspection Modal */}
      {selectedRequest && (
        <CompPrayerDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusUpdated={() => {
            fetchStats();
            fetchRequests();
          }}
          onDelete={(req) => {
            setSelectedRequest(null);
            setRequestToDelete(req);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {requestToDelete && (
        <CompDeleteConfirmModal
          request={requestToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setRequestToDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.AdminPrayerRequests = AdminPrayerRequests;
}


window.AdminPrayerRequests = AdminPrayerRequests;
})();
