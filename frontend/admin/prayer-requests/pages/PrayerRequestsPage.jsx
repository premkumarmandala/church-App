import { StatsOverview } from '../components/StatsOverview.jsx';
import { FilterToolbar } from '../components/FilterToolbar.jsx';
import { PrayerTable } from '../components/PrayerTable.jsx';
import { Pagination } from '../components/Pagination.jsx';

/**
 * Full Prayer Requests Management Page
 * Encapsulates search, filters, pagination, table view, and status updates.
 */

export function PrayerRequestsPage({
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
