import { StatsOverview } from '../components/StatsOverview.jsx';
import { FilterToolbar } from '../components/FilterToolbar.jsx';
import { PrayerTable } from '../components/PrayerTable.jsx';
import { Pagination } from '../components/Pagination.jsx';

/**
 * Pastoral Admin Dashboard Page
 * Exact implementation matching the reference screenshot:
 * 4 Stat Cards at top, and Prayer Requests main card with tabs, search,
 * + Add Request button, and complete data table.
 */
export function DashboardPage({
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
