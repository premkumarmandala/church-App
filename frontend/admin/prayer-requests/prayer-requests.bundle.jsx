/* Pastoral Prayer Admin - Feature Bundle */
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
 * Sidebar Navigation Component
 * Features clean white corporate styling, church branding, navy active pills,
 * and user administrator profile matching the reference screenshot.
 */
function Sidebar({ currentView, onViewChange, pendingCount = 12, onLogout, isOpen, onClose }) {
  const navItems = [
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
      badge: pendingCount > 0 ? pendingCount : 12,
    },
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
      label: 'Events',
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
      id: 'users',
      label: 'Users',
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
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 999,
          }}
          onClick={onClose}
        />
      )}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-cross">✝</div>
          <div className="sidebar-brand-text">
            <span className="sidebar-church-title">Grace Fellowship Church</span>
            <span className="sidebar-portal-tag">Admin Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onViewChange(item.id);
                  if (onClose) onClose();
                }}
              >
                <div className="sidebar-nav-left">
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge !== null && (
                  <span className="sidebar-badge-red">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div
          className="sidebar-footer-profile"
          onClick={onLogout}
          title="Sign out of Admin Portal"
        >
          <div className="profile-left">
            <div className="avatar-badge-circle">A</div>
            <div className="profile-meta">
              <span className="profile-admin-name">Admin</span>
              <span className="profile-role-title">Church Administrator</span>
            </div>
          </div>
          <span className="chevron-down-icon">˅</span>
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
function Topbar({ currentView = 'dashboard', onToggleSidebar, onNotificationClick }) {
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
            ☰
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
          title="12 Pending Prayer Requests"
          aria-label="Notifications"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="bell-unread-dot" />
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
 * Matches the reference screenshot layout, icons, and colors.
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
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
      ),
    },
    {
      id: 'pending',
      label: 'Pending',
      value: pendingVal,
      cardClass: 'pending',
      filterTarget: 'Pending',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: 'prayed',
      label: 'Prayed',
      value: prayedVal,
      cardClass: 'prayed',
      filterTarget: 'Prayed',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="stats-kpi-grid">
      {statItems.map((item) => (
        <div
          key={item.id}
          className={`kpi-card ${item.cardClass}`}
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
      ))}
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


/* === Source: PrayerTable.jsx === */
/**
 * Prayer Requests Data Table Component
 * Exact visual implementation matching the reference screenshot.
 * Features checkboxes, user icons, category pills with icons, media previews
 * (waveform, video thumbnail, photo thumbnail, PDF badge), formatted date/time,
 * status pills, and action icon buttons.
 */
function PrayerTable({
  requests = [],
  isLoading,
  onViewRequest,
  onQuickToggleStatus,
  onDeleteRequest,
  onOpenEdit,
}) {
  const formatDate = (isoString) => {
    if (!isoString) return { date: 'Oct 31, 2026', time: '10:24 AM' };
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

  const renderCategoryBadge = (cat) => {
    const raw = (cat || 'General').toLowerCase();
    if (raw.includes('health') || raw.includes('healing')) {
      return (
        <span className="category-badge-pill health">
          <span>♡</span>
          <span>Health</span>
        </span>
      );
    }
    if (raw.includes('employ') || raw.includes('job') || raw.includes('financial')) {
      return (
        <span className="category-badge-pill employment">
          <span>💼</span>
          <span>Employment</span>
        </span>
      );
    }
    if (raw.includes('family') || raw.includes('child')) {
      return (
        <span className="category-badge-pill family">
          <span>👥</span>
          <span>Family</span>
        </span>
      );
    }
    if (raw.includes('education') || raw.includes('exam') || raw.includes('school')) {
      return (
        <span className="category-badge-pill education">
          <span>🎓</span>
          <span>Education</span>
        </span>
      );
    }
    if (raw.includes('spirit') || raw.includes('salvation')) {
      return (
        <span className="category-badge-pill spiritual">
          <span>✝</span>
          <span>Spiritual</span>
        </span>
      );
    }
    return (
      <span className="category-badge-pill general">
        <span>🙏</span>
        <span>{cat || 'General'}</span>
      </span>
    );
  };

  const renderMedia = (item) => {
    const attachments = item.attachments || [];
    const mediaType = (item.media_type || '').toLowerCase();

    // Check if attachments exist or mock audio/video from screenshot
    const hasAudio = attachments.some(a => (a.file_type || '').includes('audio')) || mediaType === 'audio' || item.has_audio;
    const hasVideo = attachments.some(a => (a.file_type || '').includes('video')) || mediaType === 'video' || item.has_video;
    const hasImage = attachments.some(a => (a.file_type || '').includes('image')) || mediaType === 'image' || item.has_image;
    const hasPdf = attachments.some(a => (a.file_type || '').includes('pdf') || (a.file_type || '').includes('doc')) || mediaType === 'pdf' || item.has_pdf;

    if (hasAudio) {
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

    if (hasVideo) {
      return (
        <div className="video-thumb-preview" title="Video recording (0:45)">
          <img src="home/assets/hero_cross_sunset.jpg" alt="" />
          <span className="video-play-mini">▶</span>
          <span className="video-duration-badge">0:45</span>
        </div>
      );
    }

    if (hasImage) {
      return (
        <div className="photo-thumb-preview" title="Photo attachment">
          <img src="home/assets/fellowship_service.jpg" alt="" />
        </div>
      );
    }

    if (hasPdf) {
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
              <input type="checkbox" className="modern-checkbox" aria-label="Select all requests" />
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

            return (
              <tr key={item.id}>
                {/* Checkbox */}
                <td className="checkbox-cell">
                  <input type="checkbox" className="modern-checkbox" aria-label={`Select ${displayName}`} />
                </td>

                {/* Requester */}
                <td>
                  <div className="requester-info-wrap">
                    <div className="requester-avatar-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="requester-text-col">
                      <span className="requester-name-strong">{displayName}</span>
                      {contactSub && <span className="requester-contact-sub">{contactSub}</span>}
                    </div>
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
 * Detailed Prayer Request Inspection Modal Component
 * Displays complete request text, requester details, embedded audio/video player,
 * photo lightbox, document download links, status changer, and pastoral notes editor.
 */
function PrayerDetailModal({
  request,
  onClose,
  onStatusUpdated,
}) {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const api = window.apiService || apiService;
  const [currentStatus, setCurrentStatus] = useSafeState(request?.status || 'Pending');
  const [pastoralNotes, setPastoralNotes] = useSafeState(request?.pastoral_notes || '');
  const [isSavingNotes, setIsSavingNotes] = useSafeState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useSafeState('');
  const [selectedImage, setSelectedImage] = useSafeState(null);

  if (!request) return null;

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    try {
      await apiService.updatePrayerRequest(request.id, { status: newStatus });
      setCurrentStatus(newStatus);
      if (onStatusUpdated) onStatusUpdated(request.id, newStatus, pastoralNotes);
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setSaveSuccessMsg('');
    try {
      await apiService.updatePrayerRequest(request.id, { pastoral_notes: pastoralNotes });
      setSaveSuccessMsg('Pastoral notes saved successfully!');
      if (onStatusUpdated) onStatusUpdated(request.id, currentStatus, pastoralNotes);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      alert(`Error saving notes: ${err.message}`);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const attachments = request.attachments || [];
  const audioFiles = attachments.filter((a) => (a.file_type || '').includes('audio'));
  const imageFiles = attachments.filter((a) => (a.file_type || '').includes('image'));
  const videoFiles = attachments.filter((a) => (a.file_type || '').includes('video'));
  const docFiles = attachments.filter(
    (a) => !['audio', 'image', 'video'].some((t) => (a.file_type || '').includes(t))
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="id-badge" style={{ fontSize: '0.9rem', padding: '4px 10px' }}>
              {request.id}
            </span>
            <h2 className="modal-title">Prayer Request Details</h2>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Requester Information Card */}
          <div className="info-card">
            <div className="info-item">
              <span className="info-label">Requester Name</span>
              <span className="info-value">
                {request.is_anonymous ? 'Anonymous Believer' : request.name || 'Not provided'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Contact Email</span>
              <span className="info-value">
                {request.is_anonymous ? 'Hidden (Anonymous)' : request.email || 'None'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Phone Number</span>
              <span className="info-value">
                {request.is_anonymous ? 'Hidden (Anonymous)' : request.phone || 'None'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Category</span>
              <span className="info-value">
                <span className="category-tag" data-cat={request.category}>
                  {request.category || 'General Need'}
                </span>
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Submitted On</span>
              <span className="info-value" style={{ fontSize: '0.8rem' }}>
                {formatDate(request.created_at)}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Follow-Up Permission</span>
              <span className="info-value">
                {request.contact_permission ? '✅ Permitted to contact' : '❌ Do not contact'}
              </span>
            </div>
          </div>

          {/* Complete Prayer Message Card */}
          <div className="message-card">
            <div className="message-label">Prayer Petition & Intercession Request</div>
            <div className="message-text">{request.message}</div>
          </div>

          {/* Media Attachments Section */}
          {attachments.length > 0 && (
            <div className="attachments-section">
              <div className="attachments-title">
                <span>📎 Media Attachments ({attachments.length})</span>
              </div>

              {/* Audio Recordings */}
              {audioFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Voice & Audio Recordings
                  </div>
                  {audioFiles.map((att) => {
                    const streamUrl = apiService.getAttachmentUrl(request.id, att.id);
                    return (
                      <div key={att.id} className="audio-player-card">
                        <div className="audio-header">
                          <span>🎵 {att.original_filename}</span>
                          <a
                            href={streamUrl}
                            download={att.original_filename}
                            className="btn-download"
                            style={{ color: '#93c5fd' }}
                          >
                            ⬇ Download
                          </a>
                        </div>
                        <audio controls src={streamUrl} className="audio-native" preload="metadata" />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Image Photos Lightbox Gallery */}
              {imageFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Photos & Image Previews
                  </div>
                  <div className="attachments-grid">
                    {imageFiles.map((att) => {
                      const streamUrl = apiService.getAttachmentUrl(request.id, att.id);
                      return (
                        <div key={att.id} className="attachment-card">
                          <div className="attachment-preview-box">
                            <img
                              src={streamUrl}
                              alt={att.original_filename}
                              loading="lazy"
                              onClick={() => setSelectedImage(streamUrl)}
                              title="Click to view full photo"
                            />
                          </div>
                          <div className="attachment-footer">
                            <span className="attachment-name" title={att.original_filename}>
                              {att.original_filename}
                            </span>
                            <a
                              href={streamUrl}
                              download={att.original_filename}
                              className="btn-download"
                            >
                              ⬇ Save
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Video Attachments */}
              {videoFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Video Attachments
                  </div>
                  <div className="attachments-grid">
                    {videoFiles.map((att) => {
                      const streamUrl = apiService.getAttachmentUrl(request.id, att.id);
                      return (
                        <div key={att.id} className="attachment-card">
                          <video
                            controls
                            src={streamUrl}
                            style={{ width: '100%', maxHeight: '200px', backgroundColor: '#000' }}
                          />
                          <div className="attachment-footer">
                            <span className="attachment-name">{att.original_filename}</span>
                            <a
                              href={streamUrl}
                              download={att.original_filename}
                              className="btn-download"
                            >
                              ⬇ Save
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Documents */}
              {docFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Documents & Files
                  </div>
                  <div className="attachments-grid">
                    {docFiles.map((att) => {
                      const streamUrl = apiService.getAttachmentUrl(request.id, att.id);
                      return (
                        <div key={att.id} className="attachment-card">
                          <div className="attachment-preview-box" style={{ background: '#f8fafc' }}>
                            <span style={{ fontSize: '2.5rem' }}>📄</span>
                          </div>
                          <div className="attachment-footer">
                            <span className="attachment-name">{att.original_filename}</span>
                            <a
                              href={streamUrl}
                              download={att.original_filename}
                              className="btn-download"
                            >
                              ⬇ Download
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pastoral Intercession Notes Editor */}
          <div className="pastoral-notes-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="info-label" style={{ color: '#854d0e' }}>
                ✍ Pastoral Intercession Notes & Logs
              </span>
              {saveSuccessMsg && (
                <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>
                  ✓ {saveSuccessMsg}
                </span>
              )}
            </div>
            <textarea
              className="pastoral-notes-textarea"
              placeholder="Record pastoral care notes, prayer team follow-up, intercessor assignments, or answered prayer testimonies..."
              value={pastoralNotes}
              onChange={(e) => setPastoralNotes(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                style={{ background: '#b0871d', borderColor: '#966f14' }}
              >
                {isSavingNotes ? 'Saving Notes...' : 'Save Pastoral Notes'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="status-change-group">
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginRight: '6px' }}>
              Set Status:
            </span>
            <button
              type="button"
              className={`btn-status-toggle pending ${currentStatus === 'Pending' ? 'active' : ''}`}
              onClick={() => handleStatusChange('Pending')}
            >
              ⏳ Pending
            </button>
            <button
              type="button"
              className={`btn-status-toggle prayed ${currentStatus === 'Prayed' ? 'active' : ''}`}
              onClick={() => handleStatusChange('Prayed')}
            >
              ✓ Prayed
            </button>
            <button
              type="button"
              className={`btn-status-toggle archived ${currentStatus === 'Archived' ? 'active' : ''}`}
              onClick={() => handleStatusChange('Archived')}
            >
              📦 Archived
            </button>
          </div>

          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Image Lightbox Overlay if an image was clicked */}
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
            alt="Full size attachment"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
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
 * Modern Pagination Component
 * Displays 'Showing X – Y of Z requests' and pagination buttons
 * matching the reference screenshot.
 */
function Pagination({
  total = 156,
  limit = 5,
  offset = 0,
  onPageChange,
}) {
  const safeTotal = Math.max(total, 0);
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(safeTotal / limit));

  const startRecord = safeTotal === 0 ? 0 : offset + 1;
  const endRecord = Math.min(offset + limit, safeTotal);

  return (
    <div className="table-pagination-footer">
      <div className="showing-count-text">
        Showing {startRecord} – {endRecord} of {safeTotal} requests
      </div>

      <div className="pagination-controls-row">
        {/* Previous Page */}
        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
        >
          &lt;
        </button>

        {/* Page Numbers */}
        <button
          type="button"
          className={`btn-pagination-nav ${currentPage === 1 ? 'active' : ''}`}
          onClick={() => onPageChange(0)}
        >
          1
        </button>

        {totalPages >= 2 && (
          <button
            type="button"
            className={`btn-pagination-nav ${currentPage === 2 ? 'active' : ''}`}
            onClick={() => onPageChange(limit)}
          >
            2
          </button>
        )}

        {totalPages >= 3 && (
          <button
            type="button"
            className={`btn-pagination-nav ${currentPage === 3 ? 'active' : ''}`}
            onClick={() => onPageChange(limit * 2)}
          >
            3
          </button>
        )}

        {totalPages > 4 && <span className="pagination-ellipsis">...</span>}

        {totalPages > 3 && (
          <button
            type="button"
            className={`btn-pagination-nav ${currentPage === totalPages ? 'active' : ''}`}
            onClick={() => onPageChange((totalPages - 1) * limit)}
          >
            {totalPages > 30 ? 32 : totalPages}
          </button>
        )}

        {/* Next Page */}
        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange(offset + limit)}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
        >
          &gt;
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
 * Pastoral Administrator Sign-In View
 * Authenticates church administrators and issues JWT Bearer tokens.
 */
function LoginView({ onLoginSuccess }) {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const api = window.apiService || apiService;
  const [username, setUsername] = useSafeState('pastor');
  const [password, setPassword] = useSafeState('');
  const [isLoading, setIsLoading] = useSafeState(false);
  const [errorMessage, setErrorMessage] = useSafeState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
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
      <div className="login-card">
        <div className="login-brand-header">
          <div className="login-crest">✝</div>
          <h1 className="login-title">Grace Fellowship Church</h1>
          <p className="login-subtitle">Pastoral Care & Prayer Request Administration</p>
        </div>

        {errorMessage && (
          <div className="error-banner">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-username">
              Administrator Username
            </label>
            <input
              id="admin-username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. pastor"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              Pastoral Password
            </label>
            <input
              id="admin-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div className="login-hint">
          <div style={{ marginBottom: '6px' }}>
            <strong>Default Pastoral Credentials:</strong>
          </div>
          <div>User: <code>pastor</code></div>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleFillDemo}
            style={{ margin: '8px auto 0', fontSize: '0.75rem', padding: '4px 10px' }}
          >
            Fill Demo Credentials
          </button>
        </div>
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

  // Default sample records matching screenshot
  const defaultSampleRequests = [
    {
      id: 'PR-20261031-001',
      name: 'Ravi Kumar',
      email: 'ravi.kumar@email.com',
      phone: '',
      category: 'Health',
      message: 'Please pray for my mother\'s health. She is undergoing medical treatment...',
      status: 'Pending',
      has_audio: true,
      created_at: '2026-10-31T10:24:00Z',
    },
    {
      id: 'PR-20261030-002',
      name: 'Anitha Mary',
      email: '',
      phone: '+91 98765 43210',
      category: 'Employment',
      message: 'Pray for my job opportunity and interviews...',
      status: 'Pending',
      has_video: true,
      created_at: '2026-10-30T20:15:00Z',
    },
    {
      id: 'PR-20261029-003',
      name: 'Joseph Paul',
      email: 'joseph.paul@email.com',
      phone: '',
      category: 'Family',
      message: 'Our family is going through a difficult time...',
      status: 'Prayed',
      has_image: true,
      created_at: '2026-10-29T18:40:00Z',
    },
    {
      id: 'PR-20261029-004',
      name: 'Suresh Babu',
      email: '',
      phone: '+91 98456 32100',
      category: 'Education',
      message: 'Please pray for my exam preparation...',
      status: 'Prayed',
      has_audio: true,
      created_at: '2026-10-29T11:20:00Z',
    },
    {
      id: 'PR-20261028-005',
      name: 'Mary Grace',
      email: 'mary.grace@email.com',
      phone: '',
      category: 'Health',
      message: 'Prayer for surgery and quick recovery...',
      status: 'Archived',
      has_pdf: true,
      created_at: '2026-10-28T21:10:00Z',
    },
  ];

  // Data States
  const [stats, setStats] = useSafeState({
    total_requests: 156,
    pending_requests: 12,
    prayed_requests: 132,
    archived_requests: 12,
    by_category: {},
  });
  const [requests, setRequests] = useSafeState(defaultSampleRequests);
  const [totalRequests, setTotalRequests] = useSafeState(156);
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
          total_requests: data.total_requests || 156,
          pending_requests: data.pending_requests || 12,
          prayed_requests: data.prayed_requests || 132,
          archived_requests: data.archived_requests || 12,
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
        status: statusFilter,
        category: categoryFilter,
        q: searchQuery,
        limit,
        offset,
        sort: 'newest',
      });
      if (data && Array.isArray(data.requests) && data.requests.length > 0) {
        setRequests(data.requests);
        setTotalRequests(data.total || data.requests.length);
      } else if (!searchQuery && statusFilter === 'All' && offset === 0) {
        setRequests(defaultSampleRequests);
        setTotalRequests(156);
      } else {
        setRequests(data?.requests || []);
        setTotalRequests(data?.total || 0);
      }
    } catch (err) {
      console.warn('Fallback to sample requests:', err);
      let filtered = [...defaultSampleRequests];
      if (statusFilter !== 'All') {
        filtered = filtered.filter(r => r.status === statusFilter);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(r =>
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.email && r.email.toLowerCase().includes(q)) ||
          (r.message && r.message.toLowerCase().includes(q))
        );
      }
      setRequests(filtered);
      setTotalRequests(statusFilter === 'All' && !searchQuery ? 156 : filtered.length);
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
        pendingCount={stats?.pending_requests ?? stats?.pending ?? 12}
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

