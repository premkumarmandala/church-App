/**
 * Statistics Overview KPI Cards Component
 * Renders 4 metric cards: Total Requests, Pending, Prayed, and Archived.
 * Clicking a card applies the corresponding status filter.
 */

export function StatsOverview({ stats, onSelectStatus, activeStatus }) {
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
