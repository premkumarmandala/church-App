import { useState, useEffect, useCallback } from 'react';
import { cmsApi } from '../services/api.js';

/**
 * Church CMS Master Dashboard Overview Component
 * Provides an executive operations summary across all church website modules:
 * published sermons, upcoming events, active announcements, and pending prayer petitions.
 * Features quick-action navigation, system activity audit log, and a high-priority
 * pending prayer petitions widget with direct navigation to the dedicated Prayer Requests module.
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div
        className="content-panel-card"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderRadius: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ color: '#c59b27', fontSize: '1.25rem' }}>✝</span>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: 600 }}>
              Grace Fellowship Church
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
            Pastoral Administration Hub
          </h2>
          <p style={{ margin: '6px 0 0', color: '#cbd5e1', fontSize: '0.875rem' }}>
            System overview of all active website ministries, content publications, and pastoral intercession petitions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {typeof onRefresh === 'function' && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                onRefresh();
                fetchPendingPrayers();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              🔄 Refresh Data
            </button>
          )}
          <button
            type="button"
            className="btn-add-primary"
            onClick={() => onNavigateModule('prayer-requests')}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
            }}
          >
            🙏 Review Prayers ({pendingCount})
          </button>
        </div>
      </div>

      {/* 4 Primary Church KPI Cards */}
      <div className="stats-overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Sermons Card */}
        <div
          className="kpi-card"
          onClick={() => onNavigateModule('sermons')}
          style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
          title="Click to manage Sermons Library"
        >
          <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
          </div>
          <div className="kpi-meta-box">
            <span className="kpi-label">Published Sermons</span>
            <span className="kpi-number" style={{ color: '#0f172a' }}>{sermonsCount}</span>
            <span style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '2px', fontWeight: 600 }}>Manage Library →</span>
          </div>
        </div>

        {/* Events Card */}
        <div
          className="kpi-card"
          onClick={() => onNavigateModule('events')}
          style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
          title="Click to manage Events & Calendar"
        >
          <div className="kpi-icon-box" style={{ background: '#fdf2f8', color: '#db2777' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="kpi-meta-box">
            <span className="kpi-label">Upcoming Events</span>
            <span className="kpi-number" style={{ color: '#0f172a' }}>{eventsCount}</span>
            <span style={{ fontSize: '0.75rem', color: '#db2777', marginTop: '2px', fontWeight: 600 }}>Manage Calendar →</span>
          </div>
        </div>

        {/* Announcements Card */}
        <div
          className="kpi-card"
          onClick={() => onNavigateModule('announcements')}
          style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
          title="Click to manage Announcements & Alerts"
        >
          <div className="kpi-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="kpi-meta-box">
            <span className="kpi-label">Active Notices</span>
            <span className="kpi-number" style={{ color: '#0f172a' }}>{announcementsCount}</span>
            <span style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '2px', fontWeight: 600 }}>Manage Notices →</span>
          </div>
        </div>

        {/* Pending Prayers Card */}
        <div
          className="kpi-card pending"
          onClick={() => onNavigateModule('prayer-requests')}
          style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease', borderLeft: '4px solid #f59e0b' }}
          title="Click to view and intercede for community prayer requests"
        >
          <div className="kpi-icon-box" style={{ background: '#fffbeb', color: '#b45309' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9.5" />
              <polyline points="12 6.5 12 12 15.5 14" />
            </svg>
          </div>
          <div className="kpi-meta-box">
            <span className="kpi-label">Pending Prayers</span>
            <span className="kpi-number" style={{ color: '#b45309' }}>{pendingCount}</span>
            <span style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '2px', fontWeight: 600 }}>Needs Pastoral Prayer →</span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Panel */}
      <div className="content-panel-card" style={{ padding: '18px 24px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          Quick Management Shortcuts
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('sermons')}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🎙️ Add Sermon
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('events')}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📅 Create Event
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('announcements')}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📢 Post Announcement
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('prayer-requests')}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🙏 Prayer Requests Portal
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('ministries')}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            👥 Ministries ({ministriesCount})
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('service-timings')}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ⏰ Service Timings
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigateModule('settings')}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ⚙️ Website Settings
          </button>
        </div>
      </div>

      {/* Two-Column Lower Layout: Recent Activities & Needs Attention Prayers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Left Column: Recent Audit Log Feed */}
        <div className="content-panel-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>📋</span>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Recent System Activity
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
              {totalContent} Items Total
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivities.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No recent administrative activity recorded.
              </div>
            ) : (
              recentActivities.slice(0, 8).map((log, index) => {
                const actionBadgeColors = {
                  CREATE: { bg: '#dcfce7', text: '#15803d' },
                  UPDATE: { bg: '#e0f2fe', text: '#0369a1' },
                  DELETE: { bg: '#fee2e2', text: '#b91c1c' },
                };
                const badgeStyle = actionBadgeColors[log.action] || { bg: '#f1f5f9', text: '#475569' };

                return (
                  <div
                    key={log.id || index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: badgeStyle.bg,
                        color: badgeStyle.text,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {log.action || 'ACTIVITY'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.825rem', fontWeight: 600, color: '#1e293b' }}>
                        {log.description || `${log.action} on ${log.entity_type}`}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '2px', fontSize: '0.75rem', color: '#64748b' }}>
                        <span>👤 {log.admin_user || 'admin'}</span>
                        {log.created_at && <span>• {formatDate(log.created_at)}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Pending Prayer Petitions (Needs Attention) */}
        <div className="content-panel-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>🙏</span>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Pending Prayer Petitions
              </h3>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                background: '#fffbeb',
                color: '#b45309',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              {pendingCount} Needing Prayer
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isLoadingPrayers ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                Loading pending prayer requests...
              </div>
            ) : pendingList.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#10b981', background: '#f0fdf4', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>✓</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>All Caught Up!</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  No pending prayer requests awaiting pastoral intercession.
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
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                        {req.is_anonymous ? 'Anonymous' : (req.name || 'Anonymous')}
                      </span>
                      {req.category && (
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', fontWeight: 600 }}>
                          {req.category}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {formatDate(req.created_at)}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.825rem',
                      color: '#475569',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    "{req.request}"
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
                        background: '#f0fdf4',
                        color: '#16a34a',
                        border: '1px solid #bbf7d0',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      ✓ Mark as Prayed
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action button leading to the dedicated Prayer Requests module */}
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              className="btn-add-primary"
              onClick={() => onNavigateModule('prayer-requests')}
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: '0.875rem',
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Go to Prayer Requests Portal</span>
              <span>→</span>
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
