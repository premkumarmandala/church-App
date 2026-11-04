import { useState, useEffect, useCallback } from 'react';
import { cmsApi } from '../services/api.js';
import { StatsOverview } from '../prayer-requests/components/StatsOverview.jsx';
import { FilterToolbar } from '../prayer-requests/components/FilterToolbar.jsx';
import { PrayerTable } from '../prayer-requests/components/PrayerTable.jsx';
import { Pagination } from '../prayer-requests/components/Pagination.jsx';
import { AddPrayerModal } from '../prayer-requests/components/AddPrayerModal.jsx';
import { PrayerDetailModal } from '../prayer-requests/components/PrayerDetailModal.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';

/**
 * Master Dashboard Overview Component
 * Matches the reference screenshot with 4 KPI cards and live Prayer Requests table.
 * All metrics, requests, and pagination are fed directly from PostgreSQL / SQLite.
 */
export function DashboardOverview({ overview, onNavigateModule }) {
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
