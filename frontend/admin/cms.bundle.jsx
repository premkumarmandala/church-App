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
};

if (typeof window !== 'undefined') {
  window.authService = authService;
  window.cmsApi = cmsApi;
}


/* === Source: PageHeader.jsx === */
/**
 * Reusable Page Header Component
 */
function PageHeader({ title, subtitle, actionLabel, onAction, actionIcon = '➕' }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <button type="button" className="btn-primary" onClick={onAction}>
          <span>{actionIcon}</span>
          <span>{actionLabel}</span>
        </button>
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


/* === Source: Sidebar.jsx === */
/**
 * CMS Master Sidebar Navigation Component
 * Features all 12 modules, church crest branding, admin profile, and live badges.
 */
function Sidebar({ currentModule, onSelectModule, pendingPrayersCount = 0, onLogout, isOpen, onClose }) {
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


/* === Source: Topbar.jsx === */
/**
 * CMS Master Topbar Component
 */
function Topbar({ currentModule, onToggleSidebar, onRefresh, isLoading }) {
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


/* === Source: DashboardOverview.jsx === */
/**
 * Centralized Church CMS Dashboard Overview Component
 * Displays key content metrics, recent administrative changes, and quick module navigation.
 */
function DashboardOverview({ overview, onNavigateModule }) {
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
 * and data synchronization with PostgreSQL for all 12 modules.
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

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
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
      case 'home':
        return <CompHomeManager key={refreshKey} />;
      case 'about':
        return <CompAboutManager key={refreshKey} />;
      case 'bible':
        return <CompBibleSettingsManager key={refreshKey} />;
      case 'sermons':
        return <CompSermonsManager key={refreshKey} />;
      case 'events':
        return <CompEventsManager key={refreshKey} />;
      case 'ministries':
        return <CompMinistriesManager key={refreshKey} />;
      case 'gallery':
        return <CompGalleryManager key={refreshKey} />;
      case 'service-timings':
        return <CompServiceTimingsManager key={refreshKey} />;
      case 'announcements':
        return <CompAnnouncementsManager key={refreshKey} />;
      case 'contact':
        return <CompContactManager key={refreshKey} />;
      case 'prayer-requests':
        return (
          <div key={refreshKey}>
            <CompAdminPrayerRequests />
          </div>
        );
      case 'settings':
        return <CompWebsiteSettingsManager key={refreshKey} />;
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
          onRefresh={handleRefresh}
          isLoading={isLoadingOverview}
        />

        <main className="admin-content" style={{ padding: '28px 32px' }}>
          {renderModuleContent()}
        </main>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.AdminCMSApp = AdminCMSApp;
}

