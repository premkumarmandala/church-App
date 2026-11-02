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
 * Features church branding crest, admin profile, active navigation states,
 * and placeholder ministry tabs with 'Coming Soon' badges.
 */
function Sidebar({ currentView, onViewChange, pendingCount = 0, onLogout, isOpen, onClose }) {
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


/* === Source: Topbar.jsx === */
/**
 * Topbar Component
 * Provides breadcrumb trail, mobile sidebar drawer toggle,
 * live date/time indicator, and data refresh button.
 */
function Topbar({ currentView, onToggleSidebar, onRefresh, isLoading }) {
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


/* === Source: StatsOverview.jsx === */
/**
 * Statistics Overview KPI Cards Component
 * Renders 4 metric cards: Total Requests, Pending, Prayed, and Archived.
 * Clicking a card applies the corresponding status filter.
 */
function StatsOverview({ stats, onSelectStatus, activeStatus }) {
  const statItems = [
    {
      id: 'total',
      label: 'Total Requests',
      value: stats?.total_requests ?? stats?.total ?? 0,
      hint: 'All pastoral submissions',
      icon: '📋',
      cardClass: 'total',
      filterTarget: 'All',
    },
    {
      id: 'pending',
      label: 'Pending Intercession',
      value: stats?.pending_requests ?? stats?.pending ?? 0,
      hint: 'Awaiting pastoral prayer',
      icon: '⏳',
      cardClass: 'pending',
      filterTarget: 'Pending',
    },
    {
      id: 'prayed',
      label: 'Prayed & Blessed',
      value: stats?.prayed_requests ?? stats?.prayed ?? 0,
      hint: 'Interceded by prayer team',
      icon: '🙏',
      cardClass: 'prayed',
      filterTarget: 'Prayed',
    },
    {
      id: 'archived',
      label: 'Archived Requests',
      value: stats?.archived_requests ?? stats?.archived ?? 0,
      hint: 'Saved in pastoral archives',
      icon: '📦',
      cardClass: 'archived',
      filterTarget: 'Archived',
    },
  ];

  return (
    <div className="stats-grid">
      {statItems.map((item) => {
        const isSelected = activeStatus === item.filterTarget;
        return (
          <div
            key={item.id}
            className={`stat-card ${item.cardClass} ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectStatus && onSelectStatus(item.filterTarget)}
            role="button"
            tabIndex={0}
            title={`Click to view ${item.label.toLowerCase()}`}
          >
            <div className="stat-icon-wrap">{item.icon}</div>
            <div className="stat-content">
              <div className="stat-number">{item.value.toLocaleString()}</div>
              <div className="stat-label">{item.label}</div>
              <div className="stat-hint">{item.hint}</div>
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
 * Filter and Search Toolbar Component
 * Features status tabs with counters, full-text search input, category dropdown,
 * and quick filter reset.
 */

const CATEGORIES = [
  'All Categories',
  'Spiritual Growth',
  'Healing & Health',
  'Family & Children',
  'Financial & Job',
  'Comfort & Grief',
  'Salvation',
  'Praise & Thanksgiving',
  'Guidance & Wisdom',
  'General Need',
];
function FilterToolbar({
  status,
  onStatusChange,
  category,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  stats,
  onResetFilters,
}) {
  const tabs = [
    { id: 'All', label: 'All Requests', count: stats?.total_requests ?? stats?.total ?? 0, className: '' },
    { id: 'Pending', label: 'Pending', count: stats?.pending_requests ?? stats?.pending ?? 0, className: 'pending' },
    { id: 'Prayed', label: 'Prayed', count: stats?.prayed_requests ?? stats?.prayed ?? 0, className: 'prayed' },
    { id: 'Archived', label: 'Archived', count: stats?.archived_requests ?? stats?.archived ?? 0, className: 'archived' },
  ];

  const hasActiveFilters = status !== 'All' || category !== 'All Categories' || Boolean(searchQuery.trim());

  return (
    <div className="toolbar-container">
      {/* Status Tabs Row */}
      <div className="toolbar-tabs-row">
        <div className="status-tabs" role="tablist">
          {tabs.map((tab) => {
            const isActive = status === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`tab-btn ${isActive ? `active ${tab.className}` : ''}`}
                onClick={() => onStatusChange(tab.id)}
              >
                <span>{tab.label}</span>
                <span className="tab-pill">{tab.count}</span>
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onResetFilters}
            title="Reset all filters and search"
          >
            <span>✖</span>
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Search and Category Filter Row */}
      <div className="toolbar-controls-row">
        <div className="search-box-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by requester, email, request ID, message..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              title="Clear search query"
            >
              ×
            </button>
          )}
        </div>

        <div className="filters-actions">
          <select
            className="select-filter"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by Prayer Category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
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
 * Displays interactive list with requester information, category badge,
 * message preview, media indicators, status pill, and action buttons.
 */
function PrayerTable({
  requests = [],
  isLoading,
  onViewRequest,
  onQuickToggleStatus,
  onDeleteRequest,
}) {
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const getMediaSummary = (attachments = []) => {
    if (!attachments || attachments.length === 0) return null;

    const counts = { audio: 0, image: 0, video: 0, doc: 0 };
    attachments.forEach((att) => {
      const type = (att.file_type || '').toLowerCase();
      if (type.includes('audio')) counts.audio++;
      else if (type.includes('image')) counts.image++;
      else if (type.includes('video')) counts.video++;
      else counts.doc++;
    });

    return (
      <div className="media-indicators">
        {counts.audio > 0 && <span className="media-chip audio" title={`${counts.audio} Audio File(s)`}>🎵 {counts.audio}</span>}
        {counts.image > 0 && <span className="media-chip image" title={`${counts.image} Photo(s)`}>🖼️ {counts.image}</span>}
        {counts.video > 0 && <span className="media-chip video" title={`${counts.video} Video(s)`}>🎥 {counts.video}</span>}
        {counts.doc > 0 && <span className="media-chip document" title={`${counts.doc} Document(s)`}>📄 {counts.doc}</span>}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="empty-icon" style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
        <div className="empty-title">Loading Prayer Requests...</div>
        <div className="empty-desc">Fetching intercession records from PostgreSQL database.</div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <div className="empty-title">No Prayer Requests Found</div>
        <div className="empty-desc">
          There are no prayer requests matching your current filter criteria or search query.
        </div>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Requester</th>
            <th>Category</th>
            <th>Message Preview</th>
            <th>Media</th>
            <th>Date</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((item) => {
            const isPending = item.status === 'Pending';
            const isPrayed = item.status === 'Prayed';

            return (
              <tr key={item.id}>
                {/* ID Badge */}
                <td>
                  <span
                    className="id-badge"
                    onClick={() => onViewRequest(item)}
                    title="Click to inspect prayer request details"
                  >
                    {item.id}
                  </span>
                </td>

                {/* Requester */}
                <td>
                  <div className="requester-cell">
                    {item.is_anonymous ? (
                      <span className="anonymous-badge">🔒 Anonymous</span>
                    ) : (
                      <>
                        <span className="requester-name">{item.name || 'Anonymous Believer'}</span>
                        {(item.email || item.phone) && (
                          <span className="requester-contact">
                            {[item.email, item.phone].filter(Boolean).join(' • ')}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </td>

                {/* Category */}
                <td>
                  <span className="category-tag" data-cat={item.category || ''}>
                    {item.category || 'General Need'}
                  </span>
                </td>

                {/* Message Preview */}
                <td>
                  <div className="message-preview" title={item.message}>
                    {item.message}
                  </div>
                </td>

                {/* Media */}
                <td>
                  {getMediaSummary(item.attachments) || (
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                  )}
                </td>

                {/* Date */}
                <td>
                  <span className="date-cell">{formatDate(item.created_at)}</span>
                </td>

                {/* Status */}
                <td>
                  <span className={`status-pill ${item.status?.toLowerCase() || 'pending'}`}>
                    <span className="status-dot" />
                    <span>{item.status || 'Pending'}</span>
                  </span>
                </td>

                {/* Actions */}
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-icon-action view"
                      onClick={() => onViewRequest(item)}
                      title="View complete request and attachments"
                    >
                      👁️
                    </button>
                    {isPending && (
                      <button
                        type="button"
                        className="btn-icon-action prayed-quick"
                        onClick={() => onQuickToggleStatus(item.id, 'Prayed')}
                        title="Quick mark as Prayed & Interceded"
                      >
                        ✓
                      </button>
                    )}
                    {isPrayed && (
                      <button
                        type="button"
                        className="btn-icon-action"
                        onClick={() => onQuickToggleStatus(item.id, 'Archived')}
                        title="Archive this prayer record"
                      >
                        📦
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-icon-action delete"
                      onClick={() => onDeleteRequest(item)}
                      title="Delete request and private attachments"
                    >
                      🗑️
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


/* === Source: Pagination.jsx === */
/**
 * Pagination Controls Component
 * Provides rows-per-page selector, total count indicator, and previous/next page buttons.
 */
function Pagination({
  total = 0,
  limit = 25,
  offset = 0,
  onPageChange,
  onLimitChange,
}) {
  if (total === 0) return null;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  const startEntry = Math.min(offset + 1, total);
  const endEntry = Math.min(offset + limit, total);

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing <strong>{startEntry}</strong> to <strong>{endEntry}</strong> of{' '}
        <strong>{total.toLocaleString()}</strong> prayer requests
      </div>

      <div className="pagination-controls">
        <label style={{ fontSize: '0.8rem', color: '#64748b', marginRight: '6px' }}>
          Per page:
          <select
            className="select-filter"
            style={{ padding: '4px 8px', marginLeft: '6px' }}
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>

        <button
          type="button"
          className="btn-page"
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={!canPrev}
        >
          ← Previous
        </button>

        <span style={{ fontSize: '0.825rem', fontWeight: 600, padding: '0 8px', color: '#334155' }}>
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          className="btn-page"
          onClick={() => onPageChange(offset + limit)}
          disabled={!canNext}
        >
          Next →
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
 * Pastoral Admin Dashboard Overview Page
 * Displays KPI summary cards, urgency queue for pending intercessions,
 * and prayer distribution across ministries and categories.
 */
function DashboardPage({
  stats,
  recentPending = [],
  onNavigateRequests,
  onViewRequest,
  onQuickToggleStatus,
}) {
  const CompStatsOverview = window.StatsOverview || StatsOverview;
  const categoriesMap = stats?.by_category || {};
  const categoryEntries = Object.entries(categoriesMap).sort((a, b) => b[1] - a[1]);
  const totalRequests = stats?.total_requests ?? stats?.total ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pastoral Dashboard</h1>
          <p className="page-subtitle">
            Overview of church prayer requests, urgent intercessions, and ministry care statistics.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => onNavigateRequests('All')}
        >
          <span>View All Prayer Requests →</span>
        </button>
      </div>

      {/* 4 KPI Metric Cards */}
      <CompStatsOverview
        stats={stats}
        onSelectStatus={(status) => onNavigateRequests(status)}
        activeStatus="All"
      />

      {/* Grid: Pending Queue & Category Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Urgent Pending Intercessions Card */}
        <div className="panel-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem' }}>⏳</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f1e36' }}>
                Pending Intercessions
              </h3>
            </div>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => onNavigateRequests('Pending')}
            >
              See All ({stats?.pending_requests ?? stats?.pending ?? 0})
            </button>
          </div>

          {recentPending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>🎉</span>
              <strong>All prayers are interceded!</strong>
              <p style={{ fontSize: '0.825rem', marginTop: '4px' }}>
                There are currently no pending prayer petitions awaiting pastoral review.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentPending.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    gap: '12px',
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="id-badge" style={{ fontSize: '0.72rem' }}>{req.id}</span>
                      <strong style={{ fontSize: '0.85rem', color: '#0f1e36' }}>
                        {req.is_anonymous ? 'Anonymous' : req.name || 'Anonymous'}
                      </strong>
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#475569',
                        marginTop: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '280px',
                      }}
                    >
                      {req.message}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn-icon-action view"
                      onClick={() => onViewRequest(req)}
                      title="Inspect details"
                    >
                      👁️
                    </button>
                    <button
                      type="button"
                      className="btn-icon-action prayed-quick"
                      onClick={() => onQuickToggleStatus(req.id, 'Prayed')}
                      title="Mark as Prayed"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown Card */}
        <div className="panel-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.25rem' }}>📊</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f1e36' }}>
              Prayer Petitions by Category
            </h3>
          </div>

          {categoryEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
              No prayer request data available yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {categoryEntries.map(([cat, count]) => {
                const percentage = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;
                return (
                  <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 600 }}>
                      <span style={{ color: '#1e293b' }}>{cat}</span>
                      <span style={{ color: '#64748b' }}>
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.max(percentage, 4)}%`,
                          background: 'linear-gradient(90deg, #0284c7 0%, #0066cc 100%)',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.DashboardPage = DashboardPage;
}


/* === Source: PrayerRequestsPage.jsx === */




/**
 * Full Prayer Requests Management Page
 * Encapsulates search, filters, pagination, table view, and status updates.
 */
function PrayerRequestsPage({
  stats,
  requests = [],
  total = 0,
  limit = 25,
  offset = 0,
  status = 'All',
  category = 'All Categories',
  searchQuery = '',
  isLoading = false,
  onStatusChange,
  onCategoryChange,
  onSearchChange,
  onPageChange,
  onLimitChange,
  onResetFilters,
  onViewRequest,
  onQuickToggleStatus,
  onDeleteRequest,
}) {
  const CompStatsOverview = window.StatsOverview || StatsOverview;
  const CompFilterToolbar = window.FilterToolbar || FilterToolbar;
  const CompPrayerTable = window.PrayerTable || PrayerTable;
  const CompPagination = window.Pagination || Pagination;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Prayer Requests</h1>
          <p className="page-subtitle">
            Manage, intercede, and archive church community prayer petitions with secure media attachments.
          </p>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <CompStatsOverview
        stats={stats}
        onSelectStatus={onStatusChange}
        activeStatus={status}
      />

      {/* Main Data Panel */}
      <div className="panel-card">
        {/* Filter & Search Toolbar */}
        <CompFilterToolbar
          status={status}
          onStatusChange={onStatusChange}
          category={category}
          onCategoryChange={onCategoryChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          stats={stats}
          onResetFilters={onResetFilters}
        />

        {/* Data Table */}
        <CompPrayerTable
          requests={requests}
          isLoading={isLoading}
          onViewRequest={onViewRequest}
          onQuickToggleStatus={onQuickToggleStatus}
          onDeleteRequest={onDeleteRequest}
        />

        {/* Pagination Bar */}
        <CompPagination
          total={total}
          limit={limit}
          offset={offset}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
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
  const [limit, setLimit] = useSafeState(25);
  const [offset, setOffset] = useSafeState(0);

  // Modal States
  const [selectedRequest, setSelectedRequest] = useSafeState(null);
  const [requestToDelete, setRequestToDelete] = useSafeState(null);
  const [isDeleting, setIsDeleting] = useSafeState(false);

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
      setStats(data);
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
      setRequests(data.requests || []);
      setTotalRequests(data.total || 0);
    } catch (err) {
      console.error('Failed to load prayer requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [auth, api, statusFilter, categoryFilter, searchQuery, limit, offset]);

  // Initial and reactive data load
  useSafeEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchRequests();
    }
  }, [isAuthenticated, fetchStats, fetchRequests]);

  // Handle Logout
  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
  };

  // Quick toggle status (e.g., mark as Prayed or Archived)
  const handleQuickToggleStatus = async (requestId, nextStatus) => {
    try {
      await api.updatePrayerRequest(requestId, { status: nextStatus });
      // Optimistically update list
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: nextStatus } : r))
      );
      // Refresh stats and records
      fetchStats();
      fetchRequests();
    } catch (err) {
      alert(`Could not update prayer request status: ${err.message}`);
    }
  };

  // Status and Notes Updated inside Modal
  const handleModalStatusUpdated = (requestId, newStatus, newNotes) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: newStatus, pastoral_notes: newNotes }
          : r
      )
    );
    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest((prev) => ({
        ...prev,
        status: newStatus,
        pastoral_notes: newNotes,
      }));
    }
    fetchStats();
  };

  // Delete Request
  const handleConfirmDelete = async (requestId) => {
    setIsDeleting(true);
    try {
      await api.deletePrayerRequest(requestId);
      setRequestToDelete(null);
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(null);
      }
      fetchStats();
      fetchRequests();
    } catch (err) {
      alert(`Failed to delete prayer request: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Status Filter changed from Dashboard KPI card
  const handleNavigateWithStatus = (newStatus) => {
    setStatusFilter(newStatus);
    setOffset(0);
    setCurrentView('prayer-requests');
  };

  // Reset Filters
  const handleResetFilters = () => {
    setStatusFilter('All');
    setCategoryFilter('All Categories');
    setSearchQuery('');
    setOffset(0);
  };

  // If unauthenticated, render Login View
  if (!isAuthenticated) {
    return (
      <CompLoginView
        onLoginSuccess={() => {
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // Pending requests for the urgent dashboard queue
  const recentPendingRequests = requests.filter((r) => r.status === 'Pending');

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
          onRefresh={() => {
            fetchStats();
            fetchRequests();
          }}
          isLoading={isLoading}
        />

        <main className="admin-content">
          {currentView === 'dashboard' ? (
            <CompDashboardPage
              stats={stats}
              recentPending={recentPendingRequests}
              onNavigateRequests={handleNavigateWithStatus}
              onViewRequest={setSelectedRequest}
              onQuickToggleStatus={handleQuickToggleStatus}
            />
          ) : (
            <CompPrayerRequestsPage
              stats={stats}
              requests={requests}
              total={totalRequests}
              limit={limit}
              offset={offset}
              status={statusFilter}
              category={categoryFilter}
              searchQuery={searchQuery}
              isLoading={isLoading}
              onStatusChange={(st) => {
                setStatusFilter(st);
                setOffset(0);
              }}
              onCategoryChange={(cat) => {
                setCategoryFilter(cat);
                setOffset(0);
              }}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setOffset(0);
              }}
              onPageChange={setOffset}
              onLimitChange={(l) => {
                setLimit(l);
                setOffset(0);
              }}
              onResetFilters={handleResetFilters}
              onViewRequest={setSelectedRequest}
              onQuickToggleStatus={handleQuickToggleStatus}
              onDeleteRequest={setRequestToDelete}
            />
          )}
        </main>
      </div>

      {/* Detailed Prayer Request Inspection Modal */}
      {selectedRequest && (
        <CompPrayerDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusUpdated={handleModalStatusUpdated}
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

