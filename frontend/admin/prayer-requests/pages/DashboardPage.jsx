import { StatsOverview } from '../components/StatsOverview.jsx';

/**
 * Pastoral Admin Dashboard Overview Page
 * Displays KPI summary cards, urgency queue for pending intercessions,
 * and prayer distribution across ministries and categories.
 */

export function DashboardPage({
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
