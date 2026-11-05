import { useState, useEffect, useCallback } from 'react';
import { cmsApi } from '../services/api.js';

/**
 * Church CMS Master Dashboard Overview Component
 * Provides an executive operations summary across all church website modules:
 * published sermons, upcoming events, active announcements, and pending prayer petitions.
 * Features strict Navy & White color consistency, clean SVG icons, quick-action shortcuts,
 * system audit trail, and high-priority pending prayer petitions.
 */
export function DashboardOverview({ overview, pendingPrayersCount = 0, onNavigateModule, onRefresh }) {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);
  const useSafeCallback = typeof useCallback !== 'undefined' ? useCallback : (window.React ? window.React.useCallback : null);

  const api = window.cmsApi || cmsApi;

  // Pending prayer requests widget state
  const [pendingList, setPendingList] = useSafeState([]);
  const [isLoadingPrayers, setIsLoadingPrayers] = useSafeState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useSafeState(false);

  // Fetch top 4 pending prayers for the needs-attention widget
  const fetchPendingPrayers = useSafeCallback(async () => {
    setIsLoadingPrayers(true);
    try {
      const res = await api.getPrayerRequests({ status: 'Pending', limit: 4, sort: 'newest' });
      if (res && Array.isArray(res.requests)) {
        setPendingList(res.requests);
      } else {
        setPendingList([]);
      }
    } catch (err) {
      console.warn('Failed to fetch pending prayer requests for dashboard:', err);
      setPendingList([]);
    } finally {
      setIsLoadingPrayers(false);
    }
  }, [api]);

  useSafeEffect(() => {
    fetchPendingPrayers();
  }, [fetchPendingPrayers]);

  // Quick toggle status from pending to prayed
  const handleQuickMarkPrayed = async (reqId) => {
    setIsUpdatingStatus(true);
    try {
      await api.updatePrayerRequest(reqId, { status: 'Prayed' });
      fetchPendingPrayers();
      if (typeof onRefresh === 'function') {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Helper date formatter
  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const sermonsCount = overview?.published_sermons ?? 0;
  const eventsCount = overview?.upcoming_events ?? 0;
  const announcementsCount = overview?.active_announcements ?? 0;
  const pendingCount = pendingPrayersCount ?? overview?.total_prayer_requests ?? 0;
  const ministriesCount = overview?.total_ministries ?? 0;
  const totalContent = overview?.total_content_items ?? 0;
  const recentActivities = Array.isArray(overview?.recent_activities) ? overview.recent_activities : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Welcome Banner - Strict Navy & White */}
      <div
        className="content-panel-card"
        style={{
          padding: '24px 28px',
          background: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderRadius: '14px',
          border: '1px solid #1e293b',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1rem', color: '#94a3b8' }}>✝</span>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: 700 }}>
              Grace Fellowship Church
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
            Pastoral Administration Hub
          </h2>
          <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '0.86rem' }}>
            Central management of church ministries, digital media, congregation petitions, and website content.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {typeof onRefresh === 'function' && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                onRefresh();
                fetchPendingPrayers();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.18)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                fontSize: '0.825rem',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>Refresh</span>
            </button>
          )}
          <button
            type="button"
            className="btn-add-primary"
            onClick={() => onNavigateModule('prayer-requests')}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              background: '#2563eb',
              borderColor: '#1d4ed8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
            <span>Review Prayers ({pendingCount})</span>
          </button>
        </div>
      </div>

      {/* 4 Standardized KPI Cards - Strict White & Navy Consistency */}
      <div className="stats-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
        {/* Sermons Card */}
        <div
          className="kpi-card"
          onClick={() => onNavigateModule('sermons')}
          title="Click to manage Sermons Library"
        >
          <div className="kpi-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
          </div>
          <div className="kpi-meta-box">
            <span className="kpi-label">Published Sermons</span>
            <span className="kpi-number">{sermonsCount}</span>
            <span style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '2px', fontWeight: 600 }}>Manage Library →</span>
          </div>
        </div>

        {/* Events Card */}
        <div
          className="kpi-card"
          onClick={() => onNavigateModule('events')}
          title="Click to manage Events & Calendar"
        >
          <div className="kpi-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="kpi-meta-box">
            <span className="kpi-label">Upcoming Events</span>
            <span className="kpi-number">{eventsCount}</span>
            <span style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '2px', fontWeight: 600 }}>Manage Calendar →</span>
          </div>
        </div>

        {/* Announcements Card */}
        <div
          className="kpi-card"
          onClick={() => onNavigateModule('announcements')}
          title="Click to manage Announcements & Bulletins"
        >
          <div className="kpi-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="kpi-meta-box">
            <span className="kpi-label">Active Notices</span>
            <span className="kpi-number">{announcementsCount}</span>
            <span style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '2px', fontWeight: 600 }}>Manage Notices →</span>
          </div>
        </div>

        {/* Pending Prayers Card */}
        <div
          className="kpi-card"
          onClick={() => onNavigateModule('prayer-requests')}
          title="Click to view and intercede for community prayer requests"
        >
          <div className="kpi-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="kpi-meta-box">
            <span className="kpi-label">Pending Prayers</span>
            <span className="kpi-number" style={{ color: pendingCount > 0 ? '#b45309' : '#0f172a' }}>{pendingCount}</span>
            <span style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '2px', fontWeight: 600 }}>Needs Pastoral Prayer →</span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Panel */}
      <div className="content-panel-card" style={{ padding: '20px 24px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
          Management Shortcuts
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('sermons')}
            style={{ padding: '8px 14px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
            <span>Add Sermon</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('events')}
            style={{ padding: '8px 14px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            <span>Create Event</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('announcements')}
            style={{ padding: '8px 14px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            <span>Post Notice</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('prayer-requests')}
            style={{ padding: '8px 14px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" /></svg>
            <span>Prayer Requests ({pendingCount})</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('ministries')}
            style={{ padding: '8px 14px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            <span>Ministries ({ministriesCount})</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('gallery')}
            style={{ padding: '8px 14px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
            <span>Photo Gallery</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('home')}
            style={{ padding: '8px 14px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
            <span>Home Page</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('about')}
            style={{ padding: '8px 14px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
            <span>About Us</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('service-timings')}
            style={{ padding: '8px 14px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span>Service Timings</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('contact')}
            style={{ padding: '8px 14px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            <span>Contact & Map</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('settings')}
            style={{ padding: '8px 14px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            <span>Website Settings</span>
          </button>
        </div>
      </div>

      {/* Two-Column Lower Layout: Recent Activities & Needs Attention Prayers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Left Column: Recent Audit Log Feed */}
        <div className="content-panel-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#0f172a', display: 'flex' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </span>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                System Activity Log
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
              {totalContent} Items Total
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentActivities.length === 0 ? (
              <div style={{ padding: '32px 12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No recent administrative activity recorded.
              </div>
            ) : (
              recentActivities.slice(0, 8).map((log, index) => {
                const actionBadgeColors = {
                  CREATE: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
                  UPDATE: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
                  DELETE: { bg: '#fef2f2', text: '#dc2626', border: '#fee2e2' },
                };
                const badgeStyle = actionBadgeColors[log.action] || { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };

                return (
                  <div
                    key={log.id || index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.675rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: badgeStyle.bg,
                        color: badgeStyle.text,
                        border: `1px solid ${badgeStyle.border}`,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {log.action || 'ACTIVITY'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.825rem', fontWeight: 600, color: '#1e293b' }}>
                        {log.description || `${log.action} on ${log.entity_type}`}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '2px', fontSize: '0.72rem', color: '#64748b' }}>
                        <span>Staff: {log.admin_user || 'admin'}</span>
                        {log.created_at && <span>• {formatDate(log.created_at)}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Pending Prayer Petitions */}
        <div className="content-panel-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#0f172a', display: 'flex' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                  <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                  <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                </svg>
              </span>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                Pending Prayer Petitions
              </h3>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                background: '#fef3c7',
                color: '#b45309',
                border: '1px solid #fde68a',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 700,
              }}
            >
              {pendingCount} Needing Prayer
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isLoadingPrayers ? (
              <div style={{ padding: '32px 12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                Loading pending prayer petitions...
              </div>
            ) : pendingList.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#059669', background: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>All Petitions Interceded</div>
                <div style={{ fontSize: '0.78rem', color: '#047857' }}>
                  No pending prayer requests awaiting pastoral prayer.
                </div>
              </div>
            ) : (
              pendingList.map((req) => (
                <div
                  key={req.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                        {req.is_anonymous ? 'Anonymous Believer' : (req.name || 'Anonymous')}
                      </span>
                      {req.category && (
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '9999px', background: '#fee2e2', color: '#dc2626', fontWeight: 700 }}>
                          {req.category}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {formatDate(req.created_at)}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.825rem',
                      color: '#334155',
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    "{req.request || req.message}"
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => handleQuickMarkPrayed(req.id)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      <span>Mark as Prayed</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              className="btn-add-primary"
              onClick={() => onNavigateModule('prayer-requests')}
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: '0.85rem',
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>View All Prayer Petitions</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.DashboardOverview = DashboardOverview;
}
