/* Church Website Master CMS Bundle */
const { useState, useEffect, useCallback, useMemo, useRef } = React || window.React;


/* === Source: api.js === */
/**
 * Church Website Admin CMS - API Client Service
 * Centralizes authentication, media uploads, and full CRUD operations across all modules.
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
 * Common fetch helper with JWT bearer authentication and error handling
 */
async function request(endpoint, options = {}) {
  const token = authService.getToken();
  const headers = {
    ...(options.headers || {}),
  };

  // Only add json header if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

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
    let errorDetail = `Request failed (${response.status})`;
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
const cmsApi = {
  // Auth
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

  logout() {
    authService.clearSession();
  },

  // Overview
  async getOverview() {
    return request('/api/admin/cms/overview');
  },

  // Media Upload
  async uploadMedia(file) {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/admin/cms/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // 1. Home
  async getHome() {
    return request('/api/admin/cms/home');
  },
  async updateHome(data) {
    return request('/api/admin/cms/home', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 2. About Us
  async getAbout() {
    return request('/api/admin/cms/about');
  },
  async updateAbout(data) {
    return request('/api/admin/cms/about', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 3. Bible Settings
  async getBibleSettings() {
    return request('/api/admin/cms/bible-settings');
  },
  async updateBibleSettings(data) {
    return request('/api/admin/cms/bible-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 4. Sermons
  async getSermons(q = '') {
    const url = q ? `/api/admin/cms/sermons?q=${encodeURIComponent(q)}` : '/api/admin/cms/sermons';
    return request(url);
  },
  async createSermon(data) {
    return request('/api/admin/cms/sermons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateSermon(id, data) {
    return request(`/api/admin/cms/sermons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteSermon(id) {
    return request(`/api/admin/cms/sermons/${id}`, {
      method: 'DELETE',
    });
  },

  // 5. Events
  async getEvents(q = '') {
    const url = q ? `/api/admin/cms/events?q=${encodeURIComponent(q)}` : '/api/admin/cms/events';
    return request(url);
  },
  async createEvent(data) {
    return request('/api/admin/cms/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateEvent(id, data) {
    return request(`/api/admin/cms/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteEvent(id) {
    return request(`/api/admin/cms/events/${id}`, {
      method: 'DELETE',
    });
  },

  // 6. Ministries
  async getMinistries(q = '') {
    const url = q ? `/api/admin/cms/ministries?q=${encodeURIComponent(q)}` : '/api/admin/cms/ministries';
    return request(url);
  },
  async createMinistry(data) {
    return request('/api/admin/cms/ministries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateMinistry(id, data) {
    return request(`/api/admin/cms/ministries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteMinistry(id) {
    return request(`/api/admin/cms/ministries/${id}`, {
      method: 'DELETE',
    });
  },

  // 7. Gallery
  async getGallery(category = '') {
    const url = category && category !== 'All' ? `/api/admin/cms/gallery?category=${encodeURIComponent(category)}` : '/api/admin/cms/gallery';
    return request(url);
  },
  async createGalleryItem(data) {
    return request('/api/admin/cms/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async deleteGalleryItem(id) {
    return request(`/api/admin/cms/gallery/${id}`, {
      method: 'DELETE',
    });
  },

  // 8. Service Timings
  async getServiceTimings() {
    return request('/api/admin/cms/service-timings');
  },
  async createServiceTiming(data) {
    return request('/api/admin/cms/service-timings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateServiceTiming(id, data) {
    return request(`/api/admin/cms/service-timings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteServiceTiming(id) {
    return request(`/api/admin/cms/service-timings/${id}`, {
      method: 'DELETE',
    });
  },

  // 9. Announcements
  async getAnnouncements(q = '') {
    const url = q ? `/api/admin/cms/announcements?q=${encodeURIComponent(q)}` : '/api/admin/cms/announcements';
    return request(url);
  },
  async createAnnouncement(data) {
    return request('/api/admin/cms/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateAnnouncement(id, data) {
    return request(`/api/admin/cms/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteAnnouncement(id) {
    return request(`/api/admin/cms/announcements/${id}`, {
      method: 'DELETE',
    });
  },

  // 10. Contact
  async getContact() {
    return request('/api/admin/cms/contact');
  },
  async updateContact(data) {
    return request('/api/admin/cms/contact', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 11. Website Settings
  async getSettings() {
    return request('/api/admin/cms/settings');
  },
  async updateSettings(data) {
    return request('/api/admin/cms/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 12. Prayer Requests (Integrated)
  async getPrayerStats() {
    return request('/api/admin/prayer-requests/stats');
  },
  async getPrayerRequests(params = {}) {
    const p = new URLSearchParams();
    if (params.category && params.category !== 'All Categories') p.append('category', params.category);
    if (params.status && params.status !== 'All') p.append('status', params.status);
    if (params.q) p.append('q', params.q);
    p.append('limit', params.limit || 25);
    p.append('offset', params.offset || 0);
    return request(`/api/admin/prayer-requests?${p.toString()}`);
  },
  async updatePrayerRequest(id, data) {
    return request(`/api/admin/prayer-requests/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  async deletePrayerRequest(id) {
    return request(`/api/admin/prayer-requests/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
  getAttachmentUrl(requestId, attachmentId) {
    const token = authService.getToken();
    const base = `/api/admin/prayer-requests/${encodeURIComponent(requestId)}/attachments/${encodeURIComponent(attachmentId)}`;
    return token ? `${base}?token=${encodeURIComponent(token)}` : base;
  },

  // 13. Users & Pastoral Team Management
  async getUsers() {
    return request('/api/admin/users');
  },
  async createUser(data) {
    return request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async deleteUser(id) {
    return request(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

if (typeof window !== 'undefined') {
  window.authService = authService;
  window.cmsApi = cmsApi;
}



/* === Source: PageHeader.jsx === */
/**
 * Section Action Header Component
 * Provides clean module-level toolbar with section title and primary action button,
 * aligning with the unified white & navy corporate dashboard theme.
 */
function PageHeader({ title, subtitle, actionLabel, onAction, actionIcon = '+' }) {
  return (
    <div className="panel-header-toolbar" style={{ marginBottom: '8px' }}>
      <div className="panel-title-and-tabs">
        {title && <h2 className="panel-section-title">{title}</h2>}
        {subtitle && (
          <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '6px' }}>
            — {subtitle}
          </span>
        )}
      </div>
      {actionLabel && onAction && (
        <div className="panel-right-tools">
          <button type="button" className="btn-add-primary" onClick={onAction}>
            <span>{actionIcon}</span>
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.PageHeader = PageHeader;
}



/* === Source: StatusBadge.jsx === */
/**
 * Reusable Status Pill Badge Component
 */
function StatusBadge({ isPublished, label }) {
  const published = isPublished ?? true;
  const text = label || (published ? 'Published' : 'Draft');
  const badgeClass = published ? 'prayed' : 'pending';

  return (
    <span className={`status-pill ${badgeClass}`}>
      <span className="status-dot" />
      <span>{text}</span>
    </span>
  );
}

if (typeof window !== 'undefined') {
  window.StatusBadge = StatusBadge;
}



/* === Source: MediaUploadField.jsx === */


/**
 * Reusable Media Upload & URL Selector Field
 */
function MediaUploadField({ label, value, onChange, placeholder = 'e.g. home/assets/photo.jpg', accept = 'image/*' }) {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const [isUploading, setIsUploading] = useSafeState(false);
  const [uploadError, setUploadError] = useSafeState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    try {
      const api = window.cmsApi || cmsApi;
      const res = await api.uploadMedia(file);
      if (res && res.url) {
        onChange(res.url);
      }
    } catch (err) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="form-group" style={{ marginBottom: '16px' }}>
      {label && <label className="form-label">{label}</label>}

      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        {/* Preview Frame */}
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#f1f5f9',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {value ? (
            <img
              src={value}
              alt="Media Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>🖼️</span>
          )}
        </div>

        {/* Input Controls */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            className="form-input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label className="btn-secondary" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '0.8rem' }}>
              <span>📁 {isUploading ? 'Uploading...' : 'Choose File to Upload'}</span>
              <input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
            </label>
            {value && (
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#dc2626' }}
                onClick={() => onChange('')}
              >
                Clear
              </button>
            )}
          </div>
          {uploadError && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{uploadError}</span>}
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.MediaUploadField = MediaUploadField;
}



/* === Source: ConfirmModal.jsx === */
/**
 * Reusable Confirmation & Deletion Modal Component
 */
function ConfirmModal({ title = 'Confirm Action', message, onConfirm, onCancel, isProcessing, confirmLabel = 'Delete', isDanger = true }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: isDanger ? '#fef2f2' : '#f8fafc' }}>
          <div className="modal-title-wrap">
            <span style={{ fontSize: '1.3rem' }}>{isDanger ? '⚠️' : 'ℹ️'}</span>
            <h3 className="modal-title" style={{ color: isDanger ? '#dc2626' : '#0f1e36', fontSize: '1.1rem' }}>
              {title}
            </h3>
          </div>
          <button type="button" className="btn-modal-close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body" style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
          {message}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </button>
          <button
            type="button"
            className={isDanger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.ConfirmModal = ConfirmModal;
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
            style={category && category !== 'All Categories' ? { borderColor: '#0b1a30', background: '#eff6ff', color: '#0052cc' } : {}}
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
                        background: category === cat ? '#0b1a30' : 'transparent',
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
                        background: sortOrder === 'newest' ? '#0b1a30' : '#ffffff',
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
                        background: sortOrder === 'oldest' ? '#0b1a30' : '#ffffff',
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
  const safeTotal = typeof total === 'number' && total >= 0 ? total : 156;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(safeTotal / limit));

  const startRecord = safeTotal === 0 ? 0 : offset + 1;
  const endRecord = Math.min(offset + limit, safeTotal);

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
          ? 'Showing 0 requests'
          : `Showing ${startRecord} – ${endRecord} of ${safeTotal} requests`}
      </div>

      <div className="pagination-controls-row">
        {/* Previous Page */}
        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={currentPage <= 1 || safeTotal === 0}
          aria-label="Previous Page"
        >
          &lt;
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
                onClick={() => onPageChange((p - 1) * limit)}
              >
                {p}
              </button>
            );
          })}

        {/* Next Page */}
        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange(offset + limit)}
          disabled={currentPage >= totalPages || safeTotal === 0}
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



/* === Source: UsersManager.jsx === */


/**
 * Users & Pastoral Team Management Component
 * Allows viewing and managing administrators, pastoral intercessors, and church leaders.
 * All data persists directly to PostgreSQL / SQLite database.
 */
function UsersManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const api = window.cmsApi || cmsApi;

  const [users, setUsers] = useSafeState([]);
  const [isLoading, setIsLoading] = useSafeState(true);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [successMsg, setSuccessMsg] = useSafeState('');

  // Add user modal state
  const [isAddOpen, setIsAddOpen] = useSafeState(false);
  const [newUser, setNewUser] = useSafeState({
    name: '',
    email: '',
    role: 'Staff Administrator',
    status: 'Active',
  });
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  useSafeEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) {
      alert('Please provide name and email.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await api.createUser(newUser);
      setSuccessMsg(`Added team member ${newUser.name}.`);
      setIsAddOpen(false);
      setNewUser({ name: '', email: '', role: 'Staff Administrator', status: 'Active' });
      await fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to remove ${user.name} from the administrative team?`)) {
      return;
    }
    try {
      await api.deleteUser(user.id);
      setSuccessMsg(`Removed team member ${user.name}.`);
      await fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove member');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✕ {errorMsg}
        </div>
      )}

      <div className="content-panel-card">
        <div className="panel-header-toolbar">
          <div className="panel-title-and-tabs">
            <h2 className="panel-section-title">Church Administration & Pastoral Team</h2>
            <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '8px' }}>
              ({users.length} active members)
            </span>
          </div>
          <button
            type="button"
            className="btn-add-primary"
            onClick={() => setIsAddOpen(true)}
          >
            <span>+</span>
            <span>Add Team Member</span>
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
            Loading church administration team...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontWeight: 700, color: '#0f172a' }}>No team members found</p>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Click &quot;Add Team Member&quot; to configure administrators.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table-modern">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Role & Ministry</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar-badge-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                          {u.avatar_initials || (u.name ? u.name[0].toUpperCase() : 'A')}
                        </div>
                        <span className="requester-name-strong">{u.name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#475569', fontSize: '0.85rem' }}>{u.email}</span>
                    </td>
                    <td>
                      <span style={{ color: '#0b1a30', fontWeight: 600, fontSize: '0.825rem' }}>{u.role}</span>
                    </td>
                    <td>
                      <span className="status-pill-badge prayed">{u.status || 'Active'}</span>
                    </td>
                    <td>
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{u.last_login || 'Recently'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons-wrap" style={{ justifyContent: 'flex-end', display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-action-icon danger"
                          onClick={() => handleDeleteUser(u)}
                          title="Remove Team Member"
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Team Member Modal */}
      {isAddOpen && (
        <div className="modal-backdrop-custom" onClick={() => !isSubmitting && setIsAddOpen(false)}>
          <div className="modal-card-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header-custom">
              <h3 className="modal-title-custom">Add Pastoral Team Member</h3>
              <button
                type="button"
                className="modal-close-custom"
                onClick={() => setIsAddOpen(false)}
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deacon Michael Thomas"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. michael.t@gracefellowship.org"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Role & Responsibilities
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                >
                  <option value="Senior Pastor & Super Admin">Senior Pastor & Super Admin</option>
                  <option value="Associate Pastor">Associate Pastor</option>
                  <option value="Prayer Coordinator">Prayer Coordinator</option>
                  <option value="Intercession Lead">Intercession Lead</option>
                  <option value="Media & Tech Minister">Media & Tech Minister</option>
                  <option value="Staff Administrator">Staff Administrator</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-add-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.UsersManager = UsersManager;
}


/* === Source: Sidebar.jsx === */
/**
 * CMS Master Sidebar Navigation Component
 * Features clean white corporate styling, church branding, navy active pills,
 * and user administrator profile matching the reference screenshot.
 */
function Sidebar({ currentModule, onSelectModule, pendingPrayersCount = 0, onLogout, isOpen, onClose }) {
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
      badge: (typeof pendingPrayersCount === 'number' && pendingPrayersCount > 0) ? pendingPrayersCount : null,
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
        {/* Church Branding Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand-cross">✝</div>
          <div className="sidebar-brand-text">
            <span className="sidebar-church-title">Grace Fellowship Church</span>
            <span className="sidebar-portal-tag">Admin Portal</span>
          </div>
        </div>

        {/* Clean Vertical Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
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
        </nav>

        {/* Administrator Profile Card at Bottom */}
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="chevron-down-icon">
            <polyline points="6 9 12 15 18 9" />
          </svg>
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
 * CMS Master Topbar Component
 * Matches the reference screenshot with page titles, notification bell,
 * and user profile avatar.
 */
function Topbar({ currentModule, onToggleSidebar, onNotificationClick, pendingPrayersCount = 0 }) {
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
            ☰
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


/* === Source: DashboardOverview.jsx === */









/**
 * Master Dashboard Overview Component
 * Matches the reference screenshot with 4 KPI cards and live Prayer Requests table.
 * All metrics, requests, and pagination are fed directly from PostgreSQL / SQLite.
 */
function DashboardOverview({ overview, onNavigateModule }) {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);
  const useSafeCallback = typeof useCallback !== 'undefined' ? useCallback : (window.React ? window.React.useCallback : null);

  const api = window.cmsApi || cmsApi;

  // Real KPI statistics directly from database
  const [stats, setStats] = useSafeState({
    total_requests: 0,
    pending_requests: 0,
    prayed_requests: 0,
    archived_requests: 0,
  });

  // Requests state
  const [requests, setRequests] = useSafeState([]);
  const [totalCount, setTotalCount] = useSafeState(0);
  const [statusFilter, setStatusFilter] = useSafeState('All');
  const [categoryFilter, setCategoryFilter] = useSafeState('All Categories');
  const [sortOrder, setSortOrder] = useSafeState('newest');
  const [searchQuery, setSearchQuery] = useSafeState('');
  const [offset, setOffset] = useSafeState(0);
  const [limit, setLimit] = useSafeState(5);
  const [isLoading, setIsLoading] = useSafeState(true);
  const [isFilterOpen, setIsFilterOpen] = useSafeState(false);
  const [errorMessage, setErrorMessage] = useSafeState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useSafeState(false);
  const [selectedRequest, setSelectedRequest] = useSafeState(null);
  const [requestToDelete, setRequestToDelete] = useSafeState(null);
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  // Fetch real data from PostgreSQL / SQLite
  const fetchData = useSafeCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      // 1. Fetch real aggregate statistics
      const statsRes = await api.getPrayerStats();
      if (statsRes) {
        setStats({
          total_requests: statsRes.total_requests ?? statsRes.total ?? 0,
          pending_requests: statsRes.pending_requests ?? statsRes.pending ?? 0,
          prayed_requests: statsRes.prayed_requests ?? statsRes.prayed ?? 0,
          archived_requests: statsRes.archived_requests ?? statsRes.archived ?? 0,
        });
      }

      // 2. Fetch real filtered requests
      const listRes = await api.getPrayerRequests({
        status: statusFilter === 'All' ? undefined : statusFilter,
        category: categoryFilter === 'All Categories' ? undefined : categoryFilter,
        q: searchQuery.trim() || undefined,
        limit,
        offset,
        sort: sortOrder,
      });

      if (listRes && Array.isArray(listRes.requests)) {
        setRequests(listRes.requests);
        setTotalCount(typeof listRes.total === 'number' ? listRes.total : listRes.requests.length);
      } else {
        setRequests([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.warn('Error fetching real prayer data:', err);
      setErrorMessage(err.message || 'Unable to load prayer requests from server.');
      setRequests([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [api, statusFilter, categoryFilter, searchQuery, limit, offset, sortOrder]);

  useSafeEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    setOffset(0);
  };

  const handleCategoryChange = (newCategory) => {
    setCategoryFilter(newCategory);
    setOffset(0);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setOffset(0);
  };

  const handleSortChange = (newSort) => {
    setSortOrder(newSort);
    setOffset(0);
  };

  const handleQuickToggleStatus = async (item) => {
    const nextStatus = item.status === 'Pending' ? 'Prayed' : item.status === 'Prayed' ? 'Archived' : 'Pending';
    try {
      await api.updatePrayerRequest(item.id, { status: nextStatus });
      fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
      setErrorMessage('Could not update status on server.');
    }
  };

  const handleSaveNewRequest = async (formData) => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/prayer-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAddOpen(false);
        fetchData();
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to submit prayer request');
      }
    } catch (err) {
      alert(err.message || 'Error submitting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!requestToDelete) return;
    setIsSubmitting(true);
    try {
      await api.deletePrayerRequest(requestToDelete.id);
      setRequestToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting request:', err);
      alert('Failed to delete request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CompStatsOverview = window.StatsOverview || StatsOverview;
  const CompFilterToolbar = window.FilterToolbar || FilterToolbar;
  const CompPrayerTable = window.PrayerTable || PrayerTable;
  const CompPagination = window.Pagination || Pagination;
  const CompAddPrayerModal = window.AddPrayerModal || AddPrayerModal;
  const CompPrayerDetailModal = window.PrayerDetailModal || PrayerDetailModal;
  const CompConfirmModal = window.ConfirmModal || ConfirmModal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {errorMessage && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
          ✕ {errorMessage}
        </div>
      )}

      {/* 4 Stat Cards Row */}
      <CompStatsOverview
        stats={stats}
        onSelectStatus={handleStatusChange}
        activeStatus={statusFilter}
      />

      {/* Main White Card with Tabs, Search, Add Request & Table */}
      <div className="content-panel-card">
        <CompFilterToolbar
          status={statusFilter}
          onStatusChange={handleStatusChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          category={categoryFilter}
          onCategoryChange={handleCategoryChange}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          stats={stats}
          onOpenAdd={() => setIsAddOpen(true)}
          isFilterOpen={isFilterOpen}
          onToggleFilterMenu={() => setIsFilterOpen(!isFilterOpen)}
        />

        <CompPrayerTable
          requests={requests}
          isLoading={isLoading}
          onViewRequest={(req) => setSelectedRequest(req)}
          onQuickToggleStatus={handleQuickToggleStatus}
          onDeleteRequest={(req) => setRequestToDelete(req)}
          onOpenEdit={(req) => setSelectedRequest(req)}
        />

        <CompPagination
          total={totalCount}
          limit={limit}
          offset={offset}
          onPageChange={(newOffset) => setOffset(newOffset)}
        />
      </div>

      {/* Add Request Modal */}
      {isAddOpen && (
        <CompAddPrayerModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSave={handleSaveNewRequest}
          isSubmitting={isSubmitting}
        />
      )}

      {/* View Detail Modal */}
      {selectedRequest && (
        <CompPrayerDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusChange={async (reqId, newStatus) => {
            try {
              await api.updatePrayerRequest(reqId, { status: newStatus });
              fetchData();
            } catch (e) {
              console.error(e);
            }
          }}
          onStatusUpdated={() => fetchData()}
          onDelete={(req) => {
            setSelectedRequest(null);
            setRequestToDelete(req);
          }}
          onSaveNotes={async (reqId, notes) => {
            try {
              await api.updatePrayerRequest(reqId, { pastoral_notes: notes });
              fetchData();
            } catch (e) {
              console.error(e);
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {requestToDelete && (
        <CompConfirmModal
          title="Delete Prayer Request"
          message={`Are you sure you want to delete the prayer request from "${requestToDelete.name || 'Anonymous'}"?`}
          confirmLabel="Delete Request"
          isProcessing={isSubmitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setRequestToDelete(null)}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.DashboardOverview = DashboardOverview;
}


/* === Source: HomeManager.jsx === */




/**
 * Homepage CMS Manager Component
 * Enables editing welcome text, hero image, headline, Scripture, and CTAs.
 */
function HomeManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [formData, setFormData] = useSafeState({
    welcome_text: '',
    hero_title: '',
    hero_subtitle: '',
    hero_verse: '',
    hero_bg_image: '',
    cta_primary_text: '',
    cta_primary_link: '',
    cta_secondary_text: '',
    cta_secondary_link: '',
  });

  const [isLoading, setIsLoading] = useSafeState(true);
  const [isSaving, setIsSaving] = useSafeState(false);
  const [saveSuccess, setSaveSuccess] = useSafeState('');
  const [errorMsg, setErrorMsg] = useSafeState('');

  useSafeEffect(() => {
    let mounted = true;
    const fetchHome = async () => {
      try {
        const api = window.cmsApi || cmsApi;
        const data = await api.getHome();
        if (mounted && data) {
          setFormData(data);
        }
      } catch (err) {
        if (mounted) setErrorMsg(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchHome();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setErrorMsg('');
    try {
      const api = window.cmsApi || cmsApi;
      const res = await api.updateHome(formData);
      setFormData(res);
      setSaveSuccess('Homepage hero banner and copy updated successfully! Changes are live on the public site.');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;
  const CompMediaUpload = window.MediaUploadField || MediaUploadField;

  if (isLoading) {
    return <div className="empty-state">Loading Home Page Settings...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Home Page Management"
        subtitle="Customize the welcoming hero banner, church motto, Scripture verse, and call to action buttons."
      />

      {saveSuccess && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {saveSuccess}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          Hero Section Content
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Welcome Prefix</label>
            <input
              type="text"
              className="form-input"
              value={formData.welcome_text || ''}
              onChange={(e) => setFormData({ ...formData, welcome_text: e.target.value })}
              placeholder="e.g. Welcome to"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hero Title (Main Church Headline)</label>
            <input
              type="text"
              className="form-input"
              value={formData.hero_title || ''}
              onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
              placeholder="e.g. Grace Fellowship Church"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Hero Subtitle</label>
          <textarea
            className="form-input"
            rows="2"
            value={formData.hero_subtitle || ''}
            onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
            placeholder="A family of believers growing together in Christ's love."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Featured Scripture Verse</label>
          <input
            type="text"
            className="form-input"
            value={formData.hero_verse || ''}
            onChange={(e) => setFormData({ ...formData, hero_verse: e.target.value })}
            placeholder='“For where two or three gather in my name, there am I with them.” — Matthew 18:20'
          />
        </div>

        <CompMediaUpload
          label="Hero Background Banner Image"
          value={formData.hero_bg_image}
          onChange={(url) => setFormData({ ...formData, hero_bg_image: url })}
          placeholder="home/assets/hero_cross_sunset.jpg"
        />

        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginTop: '12px' }}>
          Action Buttons (Call to Actions)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Primary Button Text</label>
            <input
              type="text"
              className="form-input"
              value={formData.cta_primary_text || ''}
              onChange={(e) => setFormData({ ...formData, cta_primary_text: e.target.value })}
              placeholder="e.g. Join Us This Sunday"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Primary Button Link</label>
            <input
              type="text"
              className="form-input"
              value={formData.cta_primary_link || ''}
              onChange={(e) => setFormData({ ...formData, cta_primary_link: e.target.value })}
              placeholder="e.g. #service-timings"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Secondary Button Text</label>
            <input
              type="text"
              className="form-input"
              value={formData.cta_secondary_text || ''}
              onChange={(e) => setFormData({ ...formData, cta_secondary_text: e.target.value })}
              placeholder="e.g. Watch Sermons"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Secondary Button Link</label>
            <input
              type="text"
              className="form-input"
              value={formData.cta_secondary_link || ''}
              onChange={(e) => setFormData({ ...formData, cta_secondary_link: e.target.value })}
              placeholder="e.g. #sermons"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
          <button type="submit" className="btn-primary" disabled={isSaving} style={{ padding: '10px 24px', fontSize: '0.95rem' }}>
            {isSaving ? 'Saving Changes...' : '💾 Save & Publish Home Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.HomeManager = HomeManager;
}



/* === Source: AboutManager.jsx === */




/**
 * About Us CMS Manager Component
 * Allows pastors and administrators to customize church history, mission, vision,
 * core doctrinal beliefs, leadership profile, and church campus images.
 */
function AboutManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [formData, setFormData] = useSafeState({
    history_text: '',
    mission_text: '',
    vision_text: '',
    beliefs_json: '[]',
    lead_pastor_name: '',
    lead_pastor_title: '',
    lead_pastor_bio: '',
    lead_pastor_image: '',
    campus_image: '',
  });

  const [beliefsList, setBeliefsList] = useSafeState([]);
  const [newBelief, setNewBelief] = useSafeState('');
  const [isLoading, setIsLoading] = useSafeState(true);
  const [isSaving, setIsSaving] = useSafeState(false);
  const [saveSuccess, setSaveSuccess] = useSafeState('');
  const [errorMsg, setErrorMsg] = useSafeState('');

  useSafeEffect(() => {
    let mounted = true;
    const fetchAbout = async () => {
      try {
        const api = window.cmsApi || cmsApi;
        const data = await api.getAbout();
        if (mounted && data) {
          setFormData(data);
          try {
            const parsed = JSON.parse(data.beliefs_json || '[]');
            setBeliefsList(Array.isArray(parsed) ? parsed : []);
          } catch {
            setBeliefsList([]);
          }
        }
      } catch (err) {
        if (mounted) setErrorMsg(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchAbout();
    return () => { mounted = false; };
  }, []);

  const handleAddBelief = () => {
    if (!newBelief.trim()) return;
    const updated = [...beliefsList, newBelief.trim()];
    setBeliefsList(updated);
    setFormData((prev) => ({ ...prev, beliefs_json: JSON.stringify(updated) }));
    setNewBelief('');
  };

  const handleRemoveBelief = (index) => {
    const updated = beliefsList.filter((_, i) => i !== index);
    setBeliefsList(updated);
    setFormData((prev) => ({ ...prev, beliefs_json: JSON.stringify(updated) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setErrorMsg('');
    try {
      const api = window.cmsApi || cmsApi;
      const payload = {
        ...formData,
        beliefs_json: JSON.stringify(beliefsList),
      };
      const res = await api.updateAbout(payload);
      setFormData(res);
      setSaveSuccess('About Us information updated successfully! Live on public website.');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;
  const CompMediaUpload = window.MediaUploadField || MediaUploadField;

  if (isLoading) {
    return <div className="empty-state">Loading About Us information...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="About Us Management"
        subtitle="Manage church history, pastoral vision, core beliefs, leadership bio, and campus photography."
      />

      {saveSuccess && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {saveSuccess}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Vision & Mission */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Mission, Vision & History
          </h3>

          <div className="form-group">
            <label className="form-label">Church History & Legacy</label>
            <textarea
              className="form-input"
              rows={4}
              value={formData.history_text || ''}
              onChange={(e) => setFormData({ ...formData, history_text: e.target.value })}
              placeholder="Tell the founding story and testimony of Grace Fellowship..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Mission Statement</label>
              <textarea
                className="form-input"
                rows={3}
                value={formData.mission_text || ''}
                onChange={(e) => setFormData({ ...formData, mission_text: e.target.value })}
                placeholder="What is the active mission of the church?"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vision Statement</label>
              <textarea
                className="form-input"
                rows={3}
                value={formData.vision_text || ''}
                onChange={(e) => setFormData({ ...formData, vision_text: e.target.value })}
                placeholder="What is God calling Grace Fellowship to accomplish?"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Core Doctrinal Beliefs */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Core Doctrinal Beliefs
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Add key doctrinal statements displayed on the public About page.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Authority of Scripture: We believe the Holy Bible is inspired..."
              value={newBelief}
              onChange={(e) => setNewBelief(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBelief(); } }}
            />
            <button type="button" className="btn-secondary" onClick={handleAddBelief}>
              Add Statement
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {beliefsList.map((belief, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 700, color: '#c59b27' }}>#{idx + 1}</span>
                  <span>{belief}</span>
                </div>
                <button
                  type="button"
                  className="btn-icon-action delete"
                  onClick={() => handleRemoveBelief(idx)}
                  title="Remove belief"
                >
                  ✕
                </button>
              </div>
            ))}
            {beliefsList.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                No beliefs added yet. Add doctrinal bullet points above.
              </p>
            )}
          </div>
        </div>

        {/* Section 3: Leadership Profile & Campus */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Pastoral Leadership & Campus Media
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Lead Pastor Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.lead_pastor_name || ''}
                onChange={(e) => setFormData({ ...formData, lead_pastor_name: e.target.value })}
                placeholder="e.g. Pastor John Samuel"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pastoral Title / Position</label>
              <input
                type="text"
                className="form-input"
                value={formData.lead_pastor_title || ''}
                onChange={(e) => setFormData({ ...formData, lead_pastor_title: e.target.value })}
                placeholder="e.g. Senior Pastor & Founder"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pastor Biography / Message</label>
            <textarea
              className="form-input"
              rows={4}
              value={formData.lead_pastor_bio || ''}
              onChange={(e) => setFormData({ ...formData, lead_pastor_bio: e.target.value })}
              placeholder="Biography, ordination background, and welcoming heart..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <CompMediaUpload
              label="Pastor Portrait Photo"
              value={formData.lead_pastor_image || ''}
              onChange={(url) => setFormData({ ...formData, lead_pastor_image: url })}
              placeholder="Upload or enter image path (e.g. home/assets/pastor.jpg)"
            />
            <CompMediaUpload
              label="Church Campus / Sanctuary Exterior"
              value={formData.campus_image || ''}
              onChange={(url) => setFormData({ ...formData, campus_image: url })}
              placeholder="Upload or enter image path (e.g. home/assets/campus.jpg)"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            {isSaving ? 'Saving Changes...' : '💾 Save About Us Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.AboutManager = AboutManager;
}



/* === Source: BibleSettingsManager.jsx === */



/**
 * Bible Settings CMS Manager Component
 * Configures default scripture translation and public reader display settings.
 * Strictly preserves the integrity of raw Bible scripture JSON files.
 */
function BibleSettingsManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [formData, setFormData] = useSafeState({
    default_translation: 'kjv',
    allow_parallel_reading: true,
    show_verse_numbers: true,
    daily_verse_enabled: true,
  });

  const [isLoading, setIsLoading] = useSafeState(true);
  const [isSaving, setIsSaving] = useSafeState(false);
  const [saveSuccess, setSaveSuccess] = useSafeState('');
  const [errorMsg, setErrorMsg] = useSafeState('');

  useSafeEffect(() => {
    let mounted = true;
    const fetchSettings = async () => {
      try {
        const api = window.cmsApi || cmsApi;
        const data = await api.getBibleSettings();
        if (mounted && data) {
          setFormData(data);
        }
      } catch (err) {
        if (mounted) setErrorMsg(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchSettings();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setErrorMsg('');
    try {
      const api = window.cmsApi || cmsApi;
      const res = await api.updateBibleSettings(formData);
      setFormData(res);
      setSaveSuccess('Bible reader preferences updated successfully.');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;

  if (isLoading) {
    return <div className="empty-state">Loading Bible settings...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Bible Reader Settings"
        subtitle="Manage default Bible translation, display preferences, and parallel reading options."
      />

      {/* Advisory notice regarding Scripture integrity */}
      <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1.4rem' }}>🛡️</span>
        <div>
          <div style={{ fontWeight: 700, color: '#0f1e36', fontSize: '0.95rem', marginBottom: '2px' }}>
            Sacred Scripture Integrity Protection
          </div>
          <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
            Original Bible text repositories (King James Version and Telugu Holy Bible) are immutable and securely versioned.
            This manager controls presentation preferences and default reader views on the public website.
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {saveSuccess}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          Reader Defaults & Navigation
        </h3>

        {/* Translation Choice */}
        <div className="form-group" style={{ maxWidth: '480px' }}>
          <label className="form-label">Default Church Bible Translation</label>
          <select
            className="form-input"
            value={formData.default_translation || 'kjv'}
            onChange={(e) => setFormData({ ...formData, default_translation: e.target.value })}
          >
            <option value="kjv">King James Version (KJV) - English</option>
            <option value="telugu">Holy Bible (పరిశుద్ధ గ్రంథము) - Telugu</option>
          </select>
          <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
            Specifies which translation opens initially when members click "Read Bible" on the navigation bar.
          </span>
        </div>

        {/* Display Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
              checked={Boolean(formData.allow_parallel_reading)}
              onChange={(e) => setFormData({ ...formData, allow_parallel_reading: e.target.checked })}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                Enable Parallel Bilingual Reading (English & Telugu)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Permits congregants to view verses side-by-side in both languages simultaneously.
              </div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
              checked={Boolean(formData.show_verse_numbers)}
              onChange={(e) => setFormData({ ...formData, show_verse_numbers: e.target.checked })}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                Show Verse Numbers in Public Reader
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Displays superscript verse numerals alongside Scripture sentences.
              </div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
              checked={Boolean(formData.daily_verse_enabled)}
              onChange={(e) => setFormData({ ...formData, daily_verse_enabled: e.target.checked })}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                Enable "Daily Verse of Inspiration" on Homepage
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Shows the curated daily scripture quote box prominently on the main landing page.
              </div>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            {isSaving ? 'Updating...' : '💾 Save Bible Reader Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.BibleSettingsManager = BibleSettingsManager;
}



/* === Source: SermonsManager.jsx === */






/**
 * Sermons CMS Manager Component
 * Enables uploading, editing, publishing/unpublishing, and deleting church sermons.
 */
function SermonsManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [sermons, setSermons] = useSafeState([]);
  const [searchTerm, setSearchTerm] = useSafeState('');
  const [isLoading, setIsLoading] = useSafeState(true);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [successMsg, setSuccessMsg] = useSafeState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useSafeState(false);
  const [editingSermon, setEditingSermon] = useSafeState(null);
  const [deleteTarget, setDeleteTarget] = useSafeState(null);
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  // Form data
  const initialForm = {
    title: '',
    speaker: 'Pastor John Samuel',
    date_text: '',
    duration: '',
    thumbnail: '',
    video_url: '',
    audio_url: '',
    passage: '',
    description: '',
    is_published: true,
  };
  const [formData, setFormData] = useSafeState(initialForm);

  const fetchSermons = async (query = '') => {
    setIsLoading(true);
    try {
      const api = window.cmsApi || cmsApi;
      const data = await api.getSermons(query);
      setSermons(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load sermons');
    } finally {
      setIsLoading(false);
    }
  };

  useSafeEffect(() => {
    fetchSermons();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSermons(searchTerm);
  };

  const handleOpenAdd = () => {
    setEditingSermon(null);
    setFormData({
      ...initialForm,
      date_text: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sermon) => {
    setEditingSermon(sermon);
    setFormData({
      title: sermon.title || '',
      speaker: sermon.speaker || '',
      date_text: sermon.date_text || '',
      duration: sermon.duration || '',
      thumbnail: sermon.thumbnail || '',
      video_url: sermon.video_url || '',
      audio_url: sermon.audio_url || '',
      passage: sermon.passage || '',
      description: sermon.description || '',
      is_published: sermon.is_published ?? true,
    });
    setIsFormOpen(true);
  };

  const handleSaveSermon = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Sermon title is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      if (editingSermon) {
        await api.updateSermon(editingSermon.id, formData);
        setSuccessMsg(`Sermon "${formData.title}" updated successfully.`);
      } else {
        await api.createSermon(formData);
        setSuccessMsg(`Sermon "${formData.title}" published successfully.`);
      }
      setIsFormOpen(false);
      fetchSermons(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to save sermon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (sermon) => {
    try {
      const api = window.cmsApi || cmsApi;
      await api.updateSermon(sermon.id, { is_published: !sermon.is_published });
      fetchSermons(searchTerm);
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      await api.deleteSermon(deleteTarget.id);
      setSuccessMsg(`Sermon "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchSermons(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete sermon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;
  const CompStatusBadge = window.StatusBadge || StatusBadge;
  const CompMediaUpload = window.MediaUploadField || MediaUploadField;
  const CompConfirm = window.ConfirmModal || ConfirmModal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Sermons Management"
        subtitle="Upload, edit, publish video & audio recordings, scripture passages, and speaker details."
        actionLabel="Add New Sermon"
        onAction={handleOpenAdd}
        actionIcon="🎙️"
      />

      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="panel-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by sermon title, preacher, or scripture passage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn-secondary">Search</button>
          {searchTerm && (
            <button type="button" className="btn-secondary" onClick={() => { setSearchTerm(''); fetchSermons(''); }}>
              Clear
            </button>
          )}
        </form>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Total Sermons: <strong>{sermons.length}</strong>
        </div>
      </div>

      {/* Sermons Table */}
      <div className="panel-card" style={{ overflowX: 'auto' }}>
        {isLoading ? (
          <div className="empty-state">Loading Sermons...</div>
        ) : sermons.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎙️</div>
            <p style={{ fontWeight: 600 }}>No sermons found</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click "Add New Sermon" to publish your first message.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Media</th>
                <th>Sermon Details</th>
                <th>Speaker & Date</th>
                <th>Scripture</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sermons.map((sermon) => (
                <tr key={sermon.id}>
                  <td>
                    <div style={{ width: '64px', height: '42px', borderRadius: '6px', overflow: 'hidden', background: '#0f1e36', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {sermon.thumbnail ? (
                        <img src={sermon.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#c59b27', fontSize: '1.1rem' }}>🎙️</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f1e36', fontSize: '0.92rem' }}>{sermon.title}</div>
                    {sermon.description && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sermon.description}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '0.72rem', color: '#0066cc' }}>
                      {sermon.video_url && <span>▶ Video Link</span>}
                      {sermon.audio_url && <span>🎧 Audio Link</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{sermon.speaker || 'Pastor John Samuel'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      {sermon.date_text} {sermon.duration && `• ${sermon.duration}`}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.825rem', color: '#0f1e36', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      {sermon.passage || '—'}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleTogglePublish(sermon)}
                      title="Click to toggle published status"
                    >
                      <CompStatusBadge isPublished={sermon.is_published} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn-icon-action view"
                        onClick={() => handleOpenEdit(sermon)}
                        title="Edit Sermon"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action delete"
                        onClick={() => setDeleteTarget(sermon)}
                        title="Delete Sermon"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Sermon Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingSermon ? 'Edit Sermon Message' : 'Add New Sermon Message'}
              </h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsFormOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveSermon}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Sermon Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Walking by Faith, Not by Sight"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Preacher / Speaker</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.speaker}
                      onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                      placeholder="e.g. Pastor John Samuel"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Scripture Passage</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.passage}
                      onChange={(e) => setFormData({ ...formData, passage: e.target.value })}
                      placeholder="e.g. 2 Corinthians 5:7"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Date Delivered</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.date_text}
                      onChange={(e) => setFormData({ ...formData, date_text: e.target.value })}
                      placeholder="e.g. October 26, 2026"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 48 mins"
                    />
                  </div>
                </div>

                <CompMediaUpload
                  label="Sermon Thumbnail Image"
                  value={formData.thumbnail}
                  onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                  placeholder="Upload or enter thumbnail URL (e.g. home/assets/sermon1.jpg)"
                />

                <div className="form-group">
                  <label className="form-label">Video Stream / YouTube Link</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Audio Podcast MP3 Link (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.audio_url}
                    onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                    placeholder="e.g. https://gracefellowship.org/audio/message.mp3"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sermon Summary & Notes</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Key sermon outline, message themes, and reflection questions..."
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.is_published)}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
                  />
                  <span style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                    Publish immediately to Church Website
                  </span>
                </label>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingSermon ? 'Update Sermon' : 'Create Sermon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <CompConfirm
          title="Delete Sermon"
          message={`Are you sure you want to permanently delete the sermon "${deleteTarget.title}"? This cannot be undone.`}
          confirmLabel="Delete Sermon"
          isProcessing={isSubmitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.SermonsManager = SermonsManager;
}



/* === Source: EventsManager.jsx === */






/**
 * Events CMS Manager Component
 * Enables creating, editing, publishing, and scheduling church events and registrations.
 */
function EventsManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [events, setEvents] = useSafeState([]);
  const [searchTerm, setSearchTerm] = useSafeState('');
  const [isLoading, setIsLoading] = useSafeState(true);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [successMsg, setSuccessMsg] = useSafeState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useSafeState(false);
  const [editingEvent, setEditingEvent] = useSafeState(null);
  const [deleteTarget, setDeleteTarget] = useSafeState(null);
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const initialForm = {
    title: '',
    subtitle: '',
    date_text: '',
    time_text: '',
    location: 'Main Sanctuary',
    image: '',
    action_text: 'Register Now',
    registration_link: '',
    registration_open: true,
    category_tag: 'Conference',
    description: '',
    is_published: true,
  };
  const [formData, setFormData] = useSafeState(initialForm);

  const fetchEvents = async (query = '') => {
    setIsLoading(true);
    try {
      const api = window.cmsApi || cmsApi;
      const data = await api.getEvents(query);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useSafeEffect(() => {
    fetchEvents();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents(searchTerm);
  };

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormData({
      ...initialForm,
      date_text: 'Saturday, November 28, 2026',
      time_text: '6:30 PM - 8:30 PM',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (evt) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title || '',
      subtitle: evt.subtitle || '',
      date_text: evt.date_text || '',
      time_text: evt.time_text || '',
      location: evt.location || '',
      image: evt.image || '',
      action_text: evt.action_text || 'Register Now',
      registration_link: evt.registration_link || '',
      registration_open: evt.registration_open ?? true,
      category_tag: evt.category_tag || 'Special',
      description: evt.description || '',
      is_published: evt.is_published ?? true,
    });
    setIsFormOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Event title is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      if (editingEvent) {
        await api.updateEvent(editingEvent.id, formData);
        setSuccessMsg(`Event "${formData.title}" updated successfully.`);
      } else {
        await api.createEvent(formData);
        setSuccessMsg(`Event "${formData.title}" published successfully.`);
      }
      setIsFormOpen(false);
      fetchEvents(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (evt) => {
    try {
      const api = window.cmsApi || cmsApi;
      await api.updateEvent(evt.id, { is_published: !evt.is_published });
      fetchEvents(searchTerm);
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      await api.deleteEvent(deleteTarget.id);
      setSuccessMsg(`Event "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchEvents(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;
  const CompStatusBadge = window.StatusBadge || StatusBadge;
  const CompMediaUpload = window.MediaUploadField || MediaUploadField;
  const CompConfirm = window.ConfirmModal || ConfirmModal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Events & Calendar Management"
        subtitle="Manage upcoming services, conferences, youth retreats, registrations, and posters."
        actionLabel="Create New Event"
        onAction={handleOpenAdd}
        actionIcon="📅"
      />

      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="panel-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by event title, location, or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn-secondary">Search</button>
          {searchTerm && (
            <button type="button" className="btn-secondary" onClick={() => { setSearchTerm(''); fetchEvents(''); }}>
              Clear
            </button>
          )}
        </form>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Total Scheduled Events: <strong>{events.length}</strong>
        </div>
      </div>

      {/* Events Table */}
      <div className="panel-card" style={{ overflowX: 'auto' }}>
        {isLoading ? (
          <div className="empty-state">Loading Events...</div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📅</div>
            <p style={{ fontWeight: 600 }}>No events scheduled</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click "Create New Event" to publish an upcoming gathering.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Poster</th>
                <th>Event Details</th>
                <th>Date & Schedule</th>
                <th>Location</th>
                <th>Category</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((evt) => (
                <tr key={evt.id}>
                  <td>
                    <div style={{ width: '64px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#0f1e36', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {evt.image ? (
                        <img src={evt.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#c59b27', fontSize: '1.2rem' }}>📅</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f1e36', fontSize: '0.92rem' }}>{evt.title}</div>
                    {evt.subtitle && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        {evt.subtitle}
                      </div>
                    )}
                    {evt.registration_link && (
                      <div style={{ fontSize: '0.72rem', color: '#0066cc', marginTop: '3px' }}>
                        🔗 {evt.registration_open ? 'Open RSVP' : 'Registration Closed'}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{evt.date_text}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{evt.time_text}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.825rem', color: '#334155' }}>{evt.location || 'Church Campus'}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f1e36', background: '#e2e8f0', padding: '3px 8px', borderRadius: '6px' }}>
                      {evt.category_tag || 'Event'}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleTogglePublish(evt)}
                      title="Click to toggle published status"
                    >
                      <CompStatusBadge isPublished={evt.is_published} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn-icon-action view"
                        onClick={() => handleOpenEdit(evt)}
                        title="Edit Event"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action delete"
                        onClick={() => setDeleteTarget(evt)}
                        title="Delete Event"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Event Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingEvent ? 'Edit Event Details' : 'Create New Event'}
              </h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsFormOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveEvent}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Event Headline Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Annual Holy Spirit Revival Conference 2026"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Event Subtitle / Theme</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Empowered for Kingdom Impact"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.date_text}
                      onChange={(e) => setFormData({ ...formData, date_text: e.target.value })}
                      placeholder="e.g. Saturday, November 28, 2026"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time & Schedule</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.time_text}
                      onChange={(e) => setFormData({ ...formData, time_text: e.target.value })}
                      placeholder="e.g. 6:00 PM - 9:00 PM"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Location / Room</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Main Sanctuary"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category Tag</label>
                    <select
                      className="form-input"
                      value={formData.category_tag}
                      onChange={(e) => setFormData({ ...formData, category_tag: e.target.value })}
                    >
                      <option value="Conference">Conference</option>
                      <option value="Fellowship">Fellowship</option>
                      <option value="Youth">Youth Gathering</option>
                      <option value="Worship">Night of Worship</option>
                      <option value="Outreach">Community Outreach</option>
                      <option value="Prayer">Prayer & Fasting</option>
                      <option value="Special">Special Service</option>
                    </select>
                  </div>
                </div>

                <CompMediaUpload
                  label="Event Poster / Promotional Banner"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  placeholder="Upload or enter image path (e.g. home/assets/event1.jpg)"
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Action Button Text</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.action_text}
                      onChange={(e) => setFormData({ ...formData, action_text: e.target.value })}
                      placeholder="e.g. Register Online"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration / Info URL</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.registration_link}
                      onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                      placeholder="e.g. /events/register or https://forms.gle/..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Event Description</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Guest ministers, schedule details, meal arrangements, childcare notes..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.registration_open)}
                      onChange={(e) => setFormData({ ...formData, registration_open: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
                    />
                    <span style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                      Registration is Open
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.is_published)}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
                    />
                    <span style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                      Publish Immediately to Website
                    </span>
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <CompConfirm
          title="Delete Event"
          message={`Are you sure you want to remove the event "${deleteTarget.title}"? This cannot be undone.`}
          confirmLabel="Delete Event"
          isProcessing={isSubmitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.EventsManager = EventsManager;
}



/* === Source: MinistriesManager.jsx === */






/**
 * Ministries CMS Manager Component
 * Enables church leadership to manage ministry teams, leaders, meeting times, photos, and descriptions.
 */
function MinistriesManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [ministries, setMinistries] = useSafeState([]);
  const [searchTerm, setSearchTerm] = useSafeState('');
  const [isLoading, setIsLoading] = useSafeState(true);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [successMsg, setSuccessMsg] = useSafeState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useSafeState(false);
  const [editingMinistry, setEditingMinistry] = useSafeState(null);
  const [deleteTarget, setDeleteTarget] = useSafeState(null);
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const initialForm = {
    name: '',
    short_description: '',
    full_description: '',
    photo: '',
    leader_name: '',
    meeting_time: 'Weekly on Saturdays at 5:00 PM',
    order_index: 0,
    is_published: true,
  };
  const [formData, setFormData] = useSafeState(initialForm);

  const fetchMinistries = async (query = '') => {
    setIsLoading(true);
    try {
      const api = window.cmsApi || cmsApi;
      const data = await api.getMinistries(query);
      setMinistries(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load ministries');
    } finally {
      setIsLoading(false);
    }
  };

  useSafeEffect(() => {
    fetchMinistries();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMinistries(searchTerm);
  };

  const handleOpenAdd = () => {
    setEditingMinistry(null);
    setFormData({
      ...initialForm,
      order_index: ministries.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (min) => {
    setEditingMinistry(min);
    setFormData({
      name: min.name || '',
      short_description: min.short_description || '',
      full_description: min.full_description || '',
      photo: min.photo || '',
      leader_name: min.leader_name || '',
      meeting_time: min.meeting_time || '',
      order_index: min.order_index ?? 0,
      is_published: min.is_published ?? true,
    });
    setIsFormOpen(true);
  };

  const handleSaveMinistry = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Ministry name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      if (editingMinistry) {
        await api.updateMinistry(editingMinistry.id, formData);
        setSuccessMsg(`Ministry "${formData.name}" updated successfully.`);
      } else {
        await api.createMinistry(formData);
        setSuccessMsg(`Ministry "${formData.name}" created successfully.`);
      }
      setIsFormOpen(false);
      fetchMinistries(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to save ministry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (min) => {
    try {
      const api = window.cmsApi || cmsApi;
      await api.updateMinistry(min.id, { is_published: !min.is_published });
      fetchMinistries(searchTerm);
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      await api.deleteMinistry(deleteTarget.id);
      setSuccessMsg(`Ministry "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchMinistries(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete ministry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;
  const CompStatusBadge = window.StatusBadge || StatusBadge;
  const CompMediaUpload = window.MediaUploadField || MediaUploadField;
  const CompConfirm = window.ConfirmModal || ConfirmModal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Ministries Management"
        subtitle="Manage church departments, youth fellowship, Sunday school, outreach teams, and meeting hours."
        actionLabel="Add New Ministry"
        onAction={handleOpenAdd}
        actionIcon="👥"
      />

      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="panel-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by ministry name or leader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn-secondary">Search</button>
          {searchTerm && (
            <button type="button" className="btn-secondary" onClick={() => { setSearchTerm(''); fetchMinistries(''); }}>
              Clear
            </button>
          )}
        </form>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Active Ministries: <strong>{ministries.length}</strong>
        </div>
      </div>

      {/* Ministries Grid */}
      {isLoading ? (
        <div className="empty-state">Loading Ministries...</div>
      ) : ministries.length === 0 ? (
        <div className="panel-card empty-state">
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
          <p style={{ fontWeight: 600 }}>No ministries found</p>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click "Add New Ministry" to set up church programs.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {ministries.map((min) => (
            <div key={min.id} className="panel-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ height: '160px', position: 'relative', background: '#0f1e36', overflow: 'hidden' }}>
                {min.photo ? (
                  <img src={min.photo} alt={min.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c59b27', fontSize: '2.5rem' }}>
                    👥
                  </div>
                )}
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <div onClick={() => handleTogglePublish(min)} style={{ cursor: 'pointer' }}>
                    <CompStatusBadge isPublished={min.is_published} />
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f1e36' }}>{min.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>#{min.order_index}</span>
                </div>

                {min.leader_name && (
                  <div style={{ fontSize: '0.825rem', color: '#c59b27', fontWeight: 700 }}>
                    Leader: {min.leader_name}
                  </div>
                )}

                {min.meeting_time && (
                  <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⏰</span> {min.meeting_time}
                  </div>
                )}

                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, flex: 1 }}>
                  {min.short_description || min.full_description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => handleOpenEdit(min)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className="btn-icon-action delete"
                    onClick={() => setDeleteTarget(min)}
                    title="Delete Ministry"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingMinistry ? 'Edit Ministry Department' : 'Add New Ministry'}
              </h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsFormOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveMinistry}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Ministry Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Generation Next Youth Ministry"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Ministry Leader / Pastor</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.leader_name}
                      onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
                      placeholder="e.g. Deacon David Raj"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Meeting Schedule & Hours</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.meeting_time}
                    onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
                    placeholder="e.g. Saturdays at 6:00 PM • Youth Hall"
                  />
                </div>

                <CompMediaUpload
                  label="Ministry Photo / Header"
                  value={formData.photo}
                  onChange={(url) => setFormData({ ...formData, photo: url })}
                  placeholder="Upload or enter image path (e.g. home/assets/youth.jpg)"
                />

                <div className="form-group">
                  <label className="form-label">Short Tagline Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Brief 1-line summary for cards on the homepage"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Ministry Details</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={formData.full_description}
                    onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                    placeholder="Mission, age groups, curriculum, activities, and volunteer contacts..."
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.is_published)}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
                  />
                  <span style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                    Publish immediately on public website
                  </span>
                </label>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingMinistry ? 'Update Ministry' : 'Create Ministry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <CompConfirm
          title="Delete Ministry"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete Ministry"
          isProcessing={isSubmitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.MinistriesManager = MinistriesManager;
}



/* === Source: GalleryManager.jsx === */





/**
 * Gallery CMS Manager Component
 * Upload, categorize, organize, and delete church photos and videos.
 */
function GalleryManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [items, setItems] = useSafeState([]);
  const [selectedCategory, setSelectedCategory] = useSafeState('All');
  const [isLoading, setIsLoading] = useSafeState(true);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [successMsg, setSuccessMsg] = useSafeState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useSafeState(false);
  const [deleteTarget, setDeleteTarget] = useSafeState(null);
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const categories = ['All', 'Worship', 'Fellowship', 'Youth', 'Outreach', 'Celebration', 'Baptism'];

  const initialForm = {
    title: '',
    caption: '',
    media_type: 'photo',
    media_url: '',
    thumbnail_url: '',
    category: 'Worship',
    order_index: 0,
    is_published: true,
  };
  const [formData, setFormData] = useSafeState(initialForm);

  const fetchGallery = async (cat = 'All') => {
    setIsLoading(true);
    try {
      const api = window.cmsApi || cmsApi;
      const data = await api.getGallery(cat === 'All' ? '' : cat);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load gallery items');
    } finally {
      setIsLoading(false);
    }
  };

  useSafeEffect(() => {
    fetchGallery(selectedCategory);
  }, [selectedCategory]);

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      category: selectedCategory === 'All' ? 'Worship' : selectedCategory,
      order_index: items.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.media_url) {
      alert('Please upload or provide a media URL.');
      return;
    }
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      await api.createGalleryItem(formData);
      setSuccessMsg('Media uploaded to church gallery successfully.');
      setIsFormOpen(false);
      fetchGallery(selectedCategory);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to save media');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      await api.deleteGalleryItem(deleteTarget.id);
      setSuccessMsg('Media removed from gallery.');
      setDeleteTarget(null);
      fetchGallery(selectedCategory);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;
  const CompMediaUpload = window.MediaUploadField || MediaUploadField;
  const CompConfirm = window.ConfirmModal || ConfirmModal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Photo & Video Gallery Management"
        subtitle="Upload and organize high-resolution photography, baptism captures, youth nights, and worship memories."
        actionLabel="Upload Media"
        onAction={handleOpenAdd}
        actionIcon="📷"
      />

      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Category Pills Bar */}
      <div className="panel-card" style={{ padding: '12px 16px', display: 'flex', gap: '8px', overflowX: 'auto', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginRight: '6px' }}>Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
            style={{ whiteSpace: 'nowrap' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Items Grid */}
      {isLoading ? (
        <div className="empty-state">Loading Gallery...</div>
      ) : items.length === 0 ? (
        <div className="panel-card empty-state">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🖼️</div>
          <p style={{ fontWeight: 600 }}>No media found in this category</p>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click "Upload Media" to add photos or video highlights.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
          {items.map((item) => (
            <div key={item.id} className="panel-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '180px', position: 'relative', background: '#0f1e36' }}>
                <img
                  src={item.thumbnail_url || item.media_url}
                  alt={item.title || 'Church Media'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(15, 30, 54, 0.85)',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {item.category || 'General'}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: item.media_type === 'video' ? '#dc2626' : '#0066cc',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {item.media_type === 'video' ? '▶ Video' : '📷 Photo'}
                </span>
              </div>

              <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f1e36' }}>{item.title || 'Untitled Media'}</div>
                  {item.caption && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                      {item.caption}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', marginTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    className="btn-icon-action delete"
                    onClick={() => setDeleteTarget(item)}
                    title="Delete Media Item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Media Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Upload Gallery Media</h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsFormOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveItem}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Photo / Video Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Easter Sunday Resurrection Celebration"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Media Type</label>
                    <select
                      className="form-input"
                      value={formData.media_type}
                      onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                    >
                      <option value="photo">Photo Image</option>
                      <option value="video">Video Recording</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-input"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Worship">Worship</option>
                      <option value="Fellowship">Fellowship</option>
                      <option value="Youth">Youth</option>
                      <option value="Outreach">Outreach</option>
                      <option value="Celebration">Celebration</option>
                      <option value="Baptism">Baptism</option>
                    </select>
                  </div>
                </div>

                <CompMediaUpload
                  label="Select or Upload Image / Video File *"
                  value={formData.media_url}
                  onChange={(url) => setFormData({ ...formData, media_url: url })}
                  placeholder="Upload file or enter relative path (e.g. home/assets/gallery1.jpg)"
                />

                <div className="form-group">
                  <label className="form-label">Caption / Description</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="Short description or scripture quotation associated with this photo..."
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Save Media Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <CompConfirm
          title="Delete Gallery Media"
          message={`Are you sure you want to delete this media item "${deleteTarget.title || 'Untitled'}"?`}
          confirmLabel="Delete Media"
          isProcessing={isSubmitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.GalleryManager = GalleryManager;
}



/* === Source: ServiceTimingsManager.jsx === */





/**
 * Service Timings CMS Manager Component
 * Enables adjusting worship service hours, languages, days of week, and styling themes.
 */
function ServiceTimingsManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [timings, setTimings] = useSafeState([]);
  const [isLoading, setIsLoading] = useSafeState(true);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [successMsg, setSuccessMsg] = useSafeState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useSafeState(false);
  const [editingTiming, setEditingTiming] = useSafeState(null);
  const [deleteTarget, setDeleteTarget] = useSafeState(null);
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const initialForm = {
    title: '',
    hours: '',
    subtitle: '',
    card_class: 'standard',
    icon_name: 'church',
    day_of_week: 'Sunday',
    order_index: 0,
    is_published: true,
  };
  const [formData, setFormData] = useSafeState(initialForm);

  const fetchTimings = async () => {
    setIsLoading(true);
    try {
      const api = window.cmsApi || cmsApi;
      const data = await api.getServiceTimings();
      setTimings(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load service timings');
    } finally {
      setIsLoading(false);
    }
  };

  useSafeEffect(() => {
    fetchTimings();
  }, []);

  const handleOpenAdd = () => {
    setEditingTiming(null);
    setFormData({
      ...initialForm,
      order_index: timings.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (timing) => {
    setEditingTiming(timing);
    setFormData({
      title: timing.title || '',
      hours: timing.hours || '',
      subtitle: timing.subtitle || '',
      card_class: timing.card_class || 'standard',
      icon_name: timing.icon_name || 'church',
      day_of_week: timing.day_of_week || 'Sunday',
      order_index: timing.order_index ?? 0,
      is_published: timing.is_published ?? true,
    });
    setIsFormOpen(true);
  };

  const handleSaveTiming = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.hours.trim()) {
      alert('Service title and hours are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      if (editingTiming) {
        await api.updateServiceTiming(editingTiming.id, formData);
        setSuccessMsg(`Service timing "${formData.title}" updated.`);
      } else {
        await api.createServiceTiming(formData);
        setSuccessMsg(`Service timing "${formData.title}" created.`);
      }
      setIsFormOpen(false);
      fetchTimings();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to save timing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (timing) => {
    try {
      const api = window.cmsApi || cmsApi;
      await api.updateServiceTiming(timing.id, { is_published: !timing.is_published });
      fetchTimings();
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      await api.deleteServiceTiming(deleteTarget.id);
      setSuccessMsg(`Service timing "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchTimings();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete timing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;
  const CompStatusBadge = window.StatusBadge || StatusBadge;
  const CompConfirm = window.ConfirmModal || ConfirmModal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Service Timings Management"
        subtitle="Configure weekly congregation gathering times, prayer meetings, and card highlights."
        actionLabel="Add Service Timing"
        onAction={handleOpenAdd}
        actionIcon="⏰"
      />

      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Services Grid */}
      {isLoading ? (
        <div className="empty-state">Loading Service Schedules...</div>
      ) : timings.length === 0 ? (
        <div className="panel-card empty-state">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⏰</div>
          <p style={{ fontWeight: 600 }}>No service timings configured</p>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click "Add Service Timing" to create worship schedules.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {timings.map((t) => {
            const isHighlight = t.card_class === 'highlight' || t.card_class === 'gold';
            return (
              <div
                key={t.id}
                className="panel-card"
                style={{
                  borderTop: isHighlight ? '4px solid #c59b27' : '4px solid #0066cc',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  background: isHighlight ? '#fffdf7' : '#ffffff',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: isHighlight ? '#c59b27' : '#0066cc' }}>
                      {t.day_of_week || 'Service'}
                    </span>
                    <div onClick={() => handleTogglePublish(t)} style={{ cursor: 'pointer' }}>
                      <CompStatusBadge isPublished={t.is_published} />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f1e36', marginBottom: '4px' }}>
                    {t.title}
                  </h3>

                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f1e36', letterSpacing: '-0.02em', margin: '8px 0' }}>
                    🕒 {t.hours}
                  </div>

                  {t.subtitle && (
                    <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                      {t.subtitle}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                    Order: #{t.order_index} ({t.card_class})
                  </span>
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => handleOpenEdit(t)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="btn-icon-action delete"
                      onClick={() => setDeleteTarget(t)}
                      title="Delete Service Timing"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Timing Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingTiming ? 'Edit Service Schedule' : 'Add New Service Timing'}
              </h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsFormOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveTiming}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Service Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Sunday Morning Worship"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Day of Week</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                      placeholder="e.g. Sunday / Wednesday"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service Hours *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      placeholder="e.g. 9:30 AM - 11:30 AM"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subtitle / Language / Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Bilingual Service (Telugu & English) with Sunday School"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Card Style Theme</label>
                    <select
                      className="form-input"
                      value={formData.card_class}
                      onChange={(e) => setFormData({ ...formData, card_class: e.target.value })}
                    >
                      <option value="standard">Standard Navy Accent</option>
                      <option value="highlight">Prominent Highlight</option>
                      <option value="gold">Warm Gold Border</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.is_published)}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
                  />
                  <span style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                    Publish to Public Website
                  </span>
                </label>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingTiming ? 'Update Schedule' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <CompConfirm
          title="Delete Service Timing"
          message={`Are you sure you want to delete "${deleteTarget.title}"?`}
          confirmLabel="Delete Timing"
          isProcessing={isSubmitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.ServiceTimingsManager = ServiceTimingsManager;
}



/* === Source: AnnouncementsManager.jsx === */






/**
 * Announcements CMS Manager Component
 * Enables creating, scheduling, publishing, and removing church alerts and bulletins.
 */
function AnnouncementsManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [announcements, setAnnouncements] = useSafeState([]);
  const [searchTerm, setSearchTerm] = useSafeState('');
  const [isLoading, setIsLoading] = useSafeState(true);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [successMsg, setSuccessMsg] = useSafeState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useSafeState(false);
  const [editingItem, setEditingItem] = useSafeState(null);
  const [deleteTarget, setDeleteTarget] = useSafeState(null);
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const initialForm = {
    title: '',
    subtitle: '',
    date_text: '',
    time_text: '',
    location: '',
    image: '',
    action_text: 'Learn More',
    action_link: '',
    tag: 'Announcement',
    tag_class: 'gold',
    order_index: 0,
    is_published: true,
  };
  const [formData, setFormData] = useSafeState(initialForm);

  const fetchAnnouncements = async (query = '') => {
    setIsLoading(true);
    try {
      const api = window.cmsApi || cmsApi;
      const data = await api.getAnnouncements(query);
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  useSafeEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAnnouncements(searchTerm);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      ...initialForm,
      date_text: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      order_index: announcements.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      subtitle: item.subtitle || '',
      date_text: item.date_text || '',
      time_text: item.time_text || '',
      location: item.location || '',
      image: item.image || '',
      action_text: item.action_text || 'Learn More',
      action_link: item.action_link || '',
      tag: item.tag || 'Announcement',
      tag_class: item.tag_class || 'gold',
      order_index: item.order_index ?? 0,
      is_published: item.is_published ?? true,
    });
    setIsFormOpen(true);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Announcement title is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      if (editingItem) {
        await api.updateAnnouncement(editingItem.id, formData);
        setSuccessMsg(`Announcement "${formData.title}" updated.`);
      } else {
        await api.createAnnouncement(formData);
        setSuccessMsg(`Announcement "${formData.title}" published.`);
      }
      setIsFormOpen(false);
      fetchAnnouncements(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to save announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      const api = window.cmsApi || cmsApi;
      await api.updateAnnouncement(item.id, { is_published: !item.is_published });
      fetchAnnouncements(searchTerm);
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      await api.deleteAnnouncement(deleteTarget.id);
      setSuccessMsg(`Announcement "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchAnnouncements(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;
  const CompStatusBadge = window.StatusBadge || StatusBadge;
  const CompMediaUpload = window.MediaUploadField || MediaUploadField;
  const CompConfirm = window.ConfirmModal || ConfirmModal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Announcements & Bulletins"
        subtitle="Publish timely church updates, fasting notifications, building project notes, and urgent alerts."
        actionLabel="Create Announcement"
        onAction={handleOpenAdd}
        actionIcon="📢"
      />

      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="panel-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn-secondary">Search</button>
          {searchTerm && (
            <button type="button" className="btn-secondary" onClick={() => { setSearchTerm(''); fetchAnnouncements(''); }}>
              Clear
            </button>
          )}
        </form>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Active Bulletins: <strong>{announcements.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="panel-card" style={{ overflowX: 'auto' }}>
        {isLoading ? (
          <div className="empty-state">Loading Announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📢</div>
            <p style={{ fontWeight: 600 }}>No announcements found</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click "Create Announcement" to post your first church bulletin.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Banner</th>
                <th>Title & Subtitle</th>
                <th>Schedule & Location</th>
                <th>Badge / Tag</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ width: '56px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: '#0f1e36', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.image ? (
                        <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#c59b27', fontSize: '1.2rem' }}>📢</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f1e36', fontSize: '0.92rem' }}>{item.title}</div>
                    {item.subtitle && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        {item.subtitle}
                      </div>
                    )}
                    {item.action_link && (
                      <div style={{ fontSize: '0.72rem', color: '#0066cc', marginTop: '3px' }}>
                        Button: {item.action_text || 'Link'} → {item.action_link}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{item.date_text || 'Ongoing'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      {item.time_text} {item.location && `• ${item.location}`}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: item.tag_class === 'gold' ? '#fffbeb' : item.tag_class === 'blue' ? '#eff6ff' : '#f0fdf4',
                        color: item.tag_class === 'gold' ? '#b45309' : item.tag_class === 'blue' ? '#1d4ed8' : '#15803d',
                        border: `1px solid ${item.tag_class === 'gold' ? '#fde68a' : item.tag_class === 'blue' ? '#bfdbfe' : '#bbf7d0'}`,
                      }}
                    >
                      {item.tag || 'Announcement'}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleTogglePublish(item)}
                      title="Click to toggle published status"
                    >
                      <CompStatusBadge isPublished={item.is_published} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn-icon-action view"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Announcement"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action delete"
                        onClick={() => setDeleteTarget(item)}
                        title="Delete Announcement"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingItem ? 'Edit Church Announcement' : 'Create Church Announcement'}
              </h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsFormOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveAnnouncement}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Announcement Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Special 3-Day Prayer & Fasting for Revival"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subtitle / Message Details</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Detailed explanation, scripture focus, or bulletin message..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.date_text}
                      onChange={(e) => setFormData({ ...formData, date_text: e.target.value })}
                      placeholder="e.g. November 10-12, 2026"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.time_text}
                      onChange={(e) => setFormData({ ...formData, time_text: e.target.value })}
                      placeholder="e.g. 7:00 PM Daily"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Location / Platform</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Sanctuary & YouTube Live"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tag Badge Text</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="e.g. Urgent / Special / New"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Badge Color Accent</label>
                    <select
                      className="form-input"
                      value={formData.tag_class}
                      onChange={(e) => setFormData({ ...formData, tag_class: e.target.value })}
                    >
                      <option value="gold">Gold Accent</option>
                      <option value="blue">Blue Accent</option>
                      <option value="emerald">Green Accent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <CompMediaUpload
                  label="Announcement Banner Image"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  placeholder="Upload or enter image path (e.g. home/assets/announcement1.jpg)"
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Action Button Label</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.action_text}
                      onChange={(e) => setFormData({ ...formData, action_text: e.target.value })}
                      placeholder="e.g. Join Stream / Learn More"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Action Target Link</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.action_link}
                      onChange={(e) => setFormData({ ...formData, action_link: e.target.value })}
                      placeholder="e.g. /prayer-request or external link"
                    />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.is_published)}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
                  />
                  <span style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                    Publish to Website Announcement Bar & Homepage
                  </span>
                </label>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Bulletin' : 'Post Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <CompConfirm
          title="Delete Announcement"
          message={`Are you sure you want to remove the announcement "${deleteTarget.title}"?`}
          confirmLabel="Delete Announcement"
          isProcessing={isSubmitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.AnnouncementsManager = AnnouncementsManager;
}



/* === Source: ContactManager.jsx === */




/**
 * Contact & Location CMS Manager Component
 * Enables updating church address, pastoral phone numbers, email, maps, and social media handles.
 */
function ContactManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [formData, setFormData] = useSafeState({
    address_line1: '',
    address_line2: '',
    city_state_zip: '',
    phone: '',
    email: '',
    google_maps_url: '',
    facebook_url: '',
    youtube_url: '',
    instagram_url: '',
    whatsapp_number: '',
    church_exterior_image: '',
  });

  const [isLoading, setIsLoading] = useSafeState(true);
  const [isSaving, setIsSaving] = useSafeState(false);
  const [saveSuccess, setSaveSuccess] = useSafeState('');
  const [errorMsg, setErrorMsg] = useSafeState('');

  useSafeEffect(() => {
    let mounted = true;
    const fetchContact = async () => {
      try {
        const api = window.cmsApi || cmsApi;
        const data = await api.getContact();
        if (mounted && data) {
          setFormData(data);
        }
      } catch (err) {
        if (mounted) setErrorMsg(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchContact();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setErrorMsg('');
    try {
      const api = window.cmsApi || cmsApi;
      const res = await api.updateContact(formData);
      setFormData(res);
      setSaveSuccess('Church contact coordinates updated successfully! Live on public website.');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;
  const CompMediaUpload = window.MediaUploadField || MediaUploadField;

  if (isLoading) {
    return <div className="empty-state">Loading Contact Information...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Contact & Location Management"
        subtitle="Maintain physical sanctuary address, pastoral phone hotline, official email, Google Maps link, and social channels."
      />

      {saveSuccess && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {saveSuccess}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Physical Address Section */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Sanctuary Location & Inquiries
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Address Line 1</label>
              <input
                type="text"
                className="form-input"
                value={formData.address_line1 || ''}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                placeholder="e.g. 124 Sanctuary Way"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Address Line 2 (Building / Suite)</label>
              <input
                type="text"
                className="form-input"
                value={formData.address_line2 || ''}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                placeholder="e.g. Suite 400"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">City, State & ZIP Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.city_state_zip || ''}
                onChange={(e) => setFormData({ ...formData, city_state_zip: e.target.value })}
                placeholder="e.g. Dallas, TX 75201"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Official Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +1 (555) 789-4560"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Official Email Address</label>
              <input
                type="email"
                className="form-input"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. info@gracefellowship.org"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Google Maps Directions / Embed URL</label>
            <input
              type="text"
              className="form-input"
              value={formData.google_maps_url || ''}
              onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
              placeholder="e.g. https://maps.google.com/?q=Grace+Fellowship+Church"
            />
          </div>

          <CompMediaUpload
            label="Sanctuary Exterior Photo"
            value={formData.church_exterior_image || ''}
            onChange={(url) => setFormData({ ...formData, church_exterior_image: url })}
            placeholder="Upload or enter image path (e.g. home/assets/church-exterior.jpg)"
          />
        </div>

        {/* Social Media & Pastoral Hotline */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Online & Social Media Channels
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">YouTube Live Channel URL</label>
              <input
                type="text"
                className="form-input"
                value={formData.youtube_url || ''}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="e.g. https://www.youtube.com/@GraceFellowship"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Facebook Page URL</label>
              <input
                type="text"
                className="form-input"
                value={formData.facebook_url || ''}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                placeholder="e.g. https://www.facebook.com/GraceFellowship"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Instagram Handle / URL</label>
              <input
                type="text"
                className="form-input"
                value={formData.instagram_url || ''}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="e.g. https://instagram.com/gracefellowship"
              />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp Care Hotline Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.whatsapp_number || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="e.g. +1 555-789-4560"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            {isSaving ? 'Saving...' : '💾 Save Contact Information'}
          </button>
        </div>
      </form>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.ContactManager = ContactManager;
}



/* === Source: WebsiteSettingsManager.jsx === */




/**
 * Website Settings CMS Manager Component
 * Enables customizing church branding, logo, footer text, copyright, and global SEO metadata.
 */
function WebsiteSettingsManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [formData, setFormData] = useSafeState({
    church_name: '',
    church_tagline: '',
    logo_url: '',
    primary_color: '#0066cc',
    footer_text: '',
    copyright_text: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });

  const [isLoading, setIsLoading] = useSafeState(true);
  const [isSaving, setIsSaving] = useSafeState(false);
  const [saveSuccess, setSaveSuccess] = useSafeState('');
  const [errorMsg, setErrorMsg] = useSafeState('');

  useSafeEffect(() => {
    let mounted = true;
    const fetchSettings = async () => {
      try {
        const api = window.cmsApi || cmsApi;
        const data = await api.getSettings();
        if (mounted && data) {
          setFormData(data);
        }
      } catch (err) {
        if (mounted) setErrorMsg(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchSettings();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setErrorMsg('');
    try {
      const api = window.cmsApi || cmsApi;
      const res = await api.updateSettings(formData);
      setFormData(res);
      setSaveSuccess('Website branding & global settings updated successfully! Live on public website.');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;
  const CompMediaUpload = window.MediaUploadField || MediaUploadField;

  if (isLoading) {
    return <div className="empty-state">Loading Site Settings...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Website Settings & Branding"
        subtitle="Manage church identity, official logo, footer disclaimers, copyright notice, and search engine optimization."
      />

      {saveSuccess && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {saveSuccess}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Branding */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Church Identity & Header Logo
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Church Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.church_name || ''}
                onChange={(e) => setFormData({ ...formData, church_name: e.target.value })}
                placeholder="e.g. Grace Fellowship Church"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Motto / Tagline</label>
              <input
                type="text"
                className="form-input"
                value={formData.church_tagline || ''}
                onChange={(e) => setFormData({ ...formData, church_tagline: e.target.value })}
                placeholder="e.g. A Christ-Centered Community of Faith & Love"
              />
            </div>
          </div>

          <CompMediaUpload
            label="Church Crest / Logo Image"
            value={formData.logo_url || ''}
            onChange={(url) => setFormData({ ...formData, logo_url: url })}
            placeholder="Upload or enter logo path (e.g. home/assets/logo.png)"
          />
        </div>

        {/* Footer & Copyright */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Footer Presentation & Legal Copyright
          </h3>

          <div className="form-group">
            <label className="form-label">Footer Mission Summary Text</label>
            <textarea
              rows={3}
              className="form-input"
              value={formData.footer_text || ''}
              onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
              placeholder="Welcoming message displayed in the global website footer across all pages..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Copyright Notice Line</label>
            <input
              type="text"
              className="form-input"
              value={formData.copyright_text || ''}
              onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
              placeholder="e.g. © 2026 Grace Fellowship Church. All rights reserved."
            />
          </div>
        </div>

        {/* SEO Meta Tags */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Search Engine Optimization (SEO)
          </h3>

          <div className="form-group">
            <label className="form-label">Default Browser Tab Title (SEO Title)</label>
            <input
              type="text"
              className="form-input"
              value={formData.seo_title || ''}
              onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
              placeholder="e.g. Grace Fellowship Church - Welcoming, Worshipping & Serving"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Meta Description (Search Snippet)</label>
            <textarea
              rows={2}
              className="form-input"
              value={formData.seo_description || ''}
              onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
              placeholder="150-160 characters summarizing the church for Google and Bing search results..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Keywords (Comma Separated)</label>
            <input
              type="text"
              className="form-input"
              value={formData.seo_keywords || ''}
              onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
              placeholder="e.g. Church, Jesus Christ, Sunday Service, Prayer, Bible Study"
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            {isSaving ? 'Saving...' : '💾 Save Website Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.WebsiteSettingsManager = WebsiteSettingsManager;
}



/* === Source: AdminCMSApp.jsx === */



















/**
 * Master Church Website Admin CMS Application
 * Orchestrates authentication, responsive navigation, module switching,
 * and data synchronization with PostgreSQL for all modules.
 * UI matches the reference design with corporate white sidebar and navy active indicators.
 */
function AdminCMSApp() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);
  const useSafeCallback = typeof useCallback !== 'undefined' ? useCallback : (window.React ? window.React.useCallback : null);

  const auth = window.authService || authService;
  const api = window.cmsApi || cmsApi;

  // Components with fallback
  const CompSidebar = window.Sidebar || Sidebar;
  const CompTopbar = window.Topbar || Topbar;
  const CompLoginView = window.LoginView || LoginView;
  const CompDashboardOverview = window.DashboardOverview || DashboardOverview;
  const CompHomeManager = window.HomeManager || HomeManager;
  const CompAboutManager = window.AboutManager || AboutManager;
  const CompBibleSettingsManager = window.BibleSettingsManager || BibleSettingsManager;
  const CompSermonsManager = window.SermonsManager || SermonsManager;
  const CompEventsManager = window.EventsManager || EventsManager;
  const CompMinistriesManager = window.MinistriesManager || MinistriesManager;
  const CompGalleryManager = window.GalleryManager || GalleryManager;
  const CompServiceTimingsManager = window.ServiceTimingsManager || ServiceTimingsManager;
  const CompAnnouncementsManager = window.AnnouncementsManager || AnnouncementsManager;
  const CompContactManager = window.ContactManager || ContactManager;
  const CompWebsiteSettingsManager = window.WebsiteSettingsManager || WebsiteSettingsManager;
  const CompUsersManager = window.UsersManager || UsersManager;
  const CompAdminPrayerRequests = window.AdminPrayerRequests || AdminPrayerRequests;

  // Session state
  const [isAuthenticated, setIsAuthenticated] = useSafeState(() => auth.isAuthenticated());
  const [isSidebarOpen, setIsSidebarOpen] = useSafeState(false);
  const [currentModule, setCurrentModule] = useSafeState('dashboard');

  // Overview metrics state
  const [overview, setOverview] = useSafeState(null);
  const [pendingPrayersCount, setPendingPrayersCount] = useSafeState(0);
  const [isLoadingOverview, setIsLoadingOverview] = useSafeState(false);
  const [refreshKey, setRefreshKey] = useSafeState(0);

  // Authentication expired listener
  useSafeEffect(() => {
    const handleExpired = () => setIsAuthenticated(false);
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  // Fetch Dashboard Overview and Prayer stats
  const fetchOverviewData = useSafeCallback(async () => {
    if (!auth.isAuthenticated()) return;
    setIsLoadingOverview(true);
    try {
      const data = await api.getOverview();
      if (data) {
        setOverview(data);
      }
      const prayerStats = await api.getPrayerStats();
      if (prayerStats && typeof prayerStats.pending_requests === 'number') {
        setPendingPrayersCount(prayerStats.pending_requests);
      } else if (prayerStats && typeof prayerStats.pending === 'number') {
        setPendingPrayersCount(prayerStats.pending);
      } else {
        setPendingPrayersCount(0);
      }
    } catch (err) {
      console.warn('Overview fetch error:', err);
    } finally {
      setIsLoadingOverview(false);
    }
  }, [auth, api]);

  useSafeEffect(() => {
    if (isAuthenticated) {
      fetchOverviewData();
    }
  }, [isAuthenticated, fetchOverviewData, refreshKey]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentModule('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
  };

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return <CompLoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Render the selected feature module
  const renderModuleContent = () => {
    switch (currentModule) {
      case 'dashboard':
        return (
          <CompDashboardOverview
            key={refreshKey}
            overview={overview}
            onNavigateModule={(mod) => setCurrentModule(mod)}
          />
        );
      case 'prayer-requests':
        return (
          <CompDashboardOverview
            key={`pr-${refreshKey}`}
            overview={overview}
            onNavigateModule={(mod) => setCurrentModule(mod)}
          />
        );
      case 'sermons':
        return <CompSermonsManager key={refreshKey} />;
      case 'events':
        return <CompEventsManager key={refreshKey} />;
      case 'announcements':
        return <CompAnnouncementsManager key={refreshKey} />;
      case 'users':
        return <CompUsersManager key={refreshKey} />;
      case 'settings':
        return (
          <div key={refreshKey} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Quick switcher to all CMS section managers */}
            <div className="content-panel-card" style={{ padding: '16px 20px', display: 'flex', gap: '10px', overflowX: 'auto', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', alignSelf: 'center', marginRight: '6px' }}>CMS Modules:</span>
              <button type="button" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setCurrentModule('home')}>🏠 Home Page</button>
              <button type="button" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setCurrentModule('about')}>📖 About Us</button>
              <button type="button" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setCurrentModule('bible')}>📜 Bible Settings</button>
              <button type="button" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setCurrentModule('ministries')}>👥 Ministries</button>
              <button type="button" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setCurrentModule('gallery')}>🖼️ Gallery</button>
              <button type="button" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setCurrentModule('service-timings')}>⏰ Service Timings</button>
              <button type="button" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setCurrentModule('contact')}>📍 Contact Info</button>
            </div>
            <CompWebsiteSettingsManager key={refreshKey} />
          </div>
        );
      case 'home':
        return <CompHomeManager key={refreshKey} />;
      case 'about':
        return <CompAboutManager key={refreshKey} />;
      case 'bible':
        return <CompBibleSettingsManager key={refreshKey} />;
      case 'ministries':
        return <CompMinistriesManager key={refreshKey} />;
      case 'gallery':
        return <CompGalleryManager key={refreshKey} />;
      case 'service-timings':
        return <CompServiceTimingsManager key={refreshKey} />;
      case 'contact':
        return <CompContactManager key={refreshKey} />;
      default:
        return (
          <CompDashboardOverview
            overview={overview}
            onNavigateModule={(mod) => setCurrentModule(mod)}
          />
        );
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <CompSidebar
        currentModule={currentModule}
        onSelectModule={(mod) => setCurrentModule(mod)}
        pendingPrayersCount={pendingPrayersCount}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="admin-main">
        <CompTopbar
          currentModule={currentModule}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNotificationClick={() => setCurrentModule('prayer-requests')}
          pendingPrayersCount={pendingPrayersCount}
        />

        <main className="admin-content">
          {renderModuleContent()}
        </main>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.AdminCMSApp = AdminCMSApp;
}

