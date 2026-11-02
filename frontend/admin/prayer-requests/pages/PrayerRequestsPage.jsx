import { StatsOverview } from '../components/StatsOverview.jsx';
import { FilterToolbar } from '../components/FilterToolbar.jsx';
import { PrayerTable } from '../components/PrayerTable.jsx';
import { Pagination } from '../components/Pagination.jsx';

/**
 * Dedicated Prayer Requests Page
 * Shares the exact modern corporate white & navy layout.
 */
export function PrayerRequestsPage({
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
