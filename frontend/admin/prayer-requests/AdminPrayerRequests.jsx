import { useState, useEffect, useCallback } from 'react';
import { authService, apiService } from './services/api.js';
import { Sidebar } from './components/Sidebar.jsx';
import { Topbar } from './components/Topbar.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { PrayerRequestsPage } from './pages/PrayerRequestsPage.jsx';
import { PrayerDetailModal } from './components/PrayerDetailModal.jsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.jsx';
import { LoginView } from './components/LoginView.jsx';

/**
 * Top-Level Pastoral Prayer Admin Application
 * Orchestrates session authentication, view routing (Dashboard vs Requests),
 * data synchronization with PostgreSQL, filters, and modals.
 */

export function AdminPrayerRequests() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);
  const useSafeCallback = typeof useCallback !== 'undefined' ? useCallback : (window.React ? window.React.useCallback : null);

  const auth = window.authService || authService;
  const api = window.apiService || apiService;

  const CompSidebar = window.Sidebar || Sidebar;
  const CompTopbar = window.Topbar || Topbar;
  const CompDashboardPage = window.DashboardPage || DashboardPage;
  const CompPrayerRequestsPage = window.PrayerRequestsPage || PrayerRequestsPage;
  const CompPrayerDetailModal = window.PrayerDetailModal || PrayerDetailModal;
  const CompDeleteConfirmModal = window.DeleteConfirmModal || DeleteConfirmModal;
  const CompLoginView = window.LoginView || LoginView;

  // Session Authentication State
  const [isAuthenticated, setIsAuthenticated] = useSafeState(() => auth.isAuthenticated());

  // View Navigation: 'dashboard' | 'prayer-requests'
  const [currentView, setCurrentView] = useSafeState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useSafeState(false);

  // Data States
  const [stats, setStats] = useSafeState({
    total_requests: 0,
    pending_requests: 0,
    prayed_requests: 0,
    archived_requests: 0,
    by_category: {},
  });
  const [requests, setRequests] = useSafeState([]);
  const [totalRequests, setTotalRequests] = useSafeState(0);
  const [isLoading, setIsLoading] = useSafeState(false);

  // Filters & Pagination State
  const [statusFilter, setStatusFilter] = useSafeState('All');
  const [categoryFilter, setCategoryFilter] = useSafeState('All Categories');
  const [searchQuery, setSearchQuery] = useSafeState('');
  const [limit, setLimit] = useSafeState(25);
  const [offset, setOffset] = useSafeState(0);

  // Modal States
  const [selectedRequest, setSelectedRequest] = useSafeState(null);
  const [requestToDelete, setRequestToDelete] = useSafeState(null);
  const [isDeleting, setIsDeleting] = useSafeState(false);

  // Listen for session expiry custom event
  useSafeEffect(() => {
    const handleAuthExpired = () => setIsAuthenticated(false);
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  // Fetch KPI Stats
  const fetchStats = useSafeCallback(async () => {
    if (!auth.isAuthenticated()) return;
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [auth, api]);

  // Fetch Requests List
  const fetchRequests = useSafeCallback(async () => {
    if (!auth.isAuthenticated()) return;
    setIsLoading(true);
    try {
      const data = await api.getPrayerRequests({
        status: statusFilter,
        category: categoryFilter,
        q: searchQuery,
        limit,
        offset,
        sort: 'newest',
      });
      setRequests(data.requests || []);
      setTotalRequests(data.total || 0);
    } catch (err) {
      console.error('Failed to load prayer requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [auth, api, statusFilter, categoryFilter, searchQuery, limit, offset]);

  // Initial and reactive data load
  useSafeEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchRequests();
    }
  }, [isAuthenticated, fetchStats, fetchRequests]);

  // Handle Logout
  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
  };

  // Quick toggle status (e.g., mark as Prayed or Archived)
  const handleQuickToggleStatus = async (requestId, nextStatus) => {
    try {
      await api.updatePrayerRequest(requestId, { status: nextStatus });
      // Optimistically update list
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: nextStatus } : r))
      );
      // Refresh stats and records
      fetchStats();
      fetchRequests();
    } catch (err) {
      alert(`Could not update prayer request status: ${err.message}`);
    }
  };

  // Status and Notes Updated inside Modal
  const handleModalStatusUpdated = (requestId, newStatus, newNotes) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: newStatus, pastoral_notes: newNotes }
          : r
      )
    );
    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest((prev) => ({
        ...prev,
        status: newStatus,
        pastoral_notes: newNotes,
      }));
    }
    fetchStats();
  };

  // Delete Request
  const handleConfirmDelete = async (requestId) => {
    setIsDeleting(true);
    try {
      await api.deletePrayerRequest(requestId);
      setRequestToDelete(null);
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(null);
      }
      fetchStats();
      fetchRequests();
    } catch (err) {
      alert(`Failed to delete prayer request: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Status Filter changed from Dashboard KPI card
  const handleNavigateWithStatus = (newStatus) => {
    setStatusFilter(newStatus);
    setOffset(0);
    setCurrentView('prayer-requests');
  };

  // Reset Filters
  const handleResetFilters = () => {
    setStatusFilter('All');
    setCategoryFilter('All Categories');
    setSearchQuery('');
    setOffset(0);
  };

  // If unauthenticated, render Login View
  if (!isAuthenticated) {
    return (
      <CompLoginView
        onLoginSuccess={() => {
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // Pending requests for the urgent dashboard queue
  const recentPendingRequests = requests.filter((r) => r.status === 'Pending');

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <CompSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        pendingCount={stats?.pending_requests ?? stats?.pending ?? 0}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="admin-main">
        <CompTopbar
          currentView={currentView}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onRefresh={() => {
            fetchStats();
            fetchRequests();
          }}
          isLoading={isLoading}
        />

        <main className="admin-content">
          {currentView === 'dashboard' ? (
            <CompDashboardPage
              stats={stats}
              recentPending={recentPendingRequests}
              onNavigateRequests={handleNavigateWithStatus}
              onViewRequest={setSelectedRequest}
              onQuickToggleStatus={handleQuickToggleStatus}
            />
          ) : (
            <CompPrayerRequestsPage
              stats={stats}
              requests={requests}
              total={totalRequests}
              limit={limit}
              offset={offset}
              status={statusFilter}
              category={categoryFilter}
              searchQuery={searchQuery}
              isLoading={isLoading}
              onStatusChange={(st) => {
                setStatusFilter(st);
                setOffset(0);
              }}
              onCategoryChange={(cat) => {
                setCategoryFilter(cat);
                setOffset(0);
              }}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setOffset(0);
              }}
              onPageChange={setOffset}
              onLimitChange={(l) => {
                setLimit(l);
                setOffset(0);
              }}
              onResetFilters={handleResetFilters}
              onViewRequest={setSelectedRequest}
              onQuickToggleStatus={handleQuickToggleStatus}
              onDeleteRequest={setRequestToDelete}
            />
          )}
        </main>
      </div>

      {/* Detailed Prayer Request Inspection Modal */}
      {selectedRequest && (
        <CompPrayerDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusUpdated={handleModalStatusUpdated}
        />
      )}

      {/* Delete Confirmation Modal */}
      {requestToDelete && (
        <CompDeleteConfirmModal
          request={requestToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setRequestToDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.AdminPrayerRequests = AdminPrayerRequests;
}
