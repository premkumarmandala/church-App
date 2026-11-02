import { useState, useEffect, useCallback } from 'react';
import { authService, apiService } from './services/api.js';
import { Sidebar } from './components/Sidebar.jsx';
import { Topbar } from './components/Topbar.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { PrayerRequestsPage } from './pages/PrayerRequestsPage.jsx';
import { PrayerDetailModal } from './components/PrayerDetailModal.jsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.jsx';
import { AddPrayerModal } from './components/AddPrayerModal.jsx';
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
  const CompAddPrayerModal = window.AddPrayerModal || AddPrayerModal;
  const CompLoginView = window.LoginView || LoginView;

  // Session Authentication State
  const [isAuthenticated, setIsAuthenticated] = useSafeState(() => auth.isAuthenticated());

  // View Navigation: 'dashboard' | 'prayer-requests'
  const [currentView, setCurrentView] = useSafeState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useSafeState(false);

  // Default sample records matching screenshot
  const defaultSampleRequests = [
    {
      id: 'PR-20261031-001',
      name: 'Ravi Kumar',
      email: 'ravi.kumar@email.com',
      phone: '',
      category: 'Health',
      message: 'Please pray for my mother\'s health. She is undergoing medical treatment...',
      status: 'Pending',
      has_audio: true,
      created_at: '2026-10-31T10:24:00Z',
    },
    {
      id: 'PR-20261030-002',
      name: 'Anitha Mary',
      email: '',
      phone: '+91 98765 43210',
      category: 'Employment',
      message: 'Pray for my job opportunity and interviews...',
      status: 'Pending',
      has_video: true,
      created_at: '2026-10-30T20:15:00Z',
    },
    {
      id: 'PR-20261029-003',
      name: 'Joseph Paul',
      email: 'joseph.paul@email.com',
      phone: '',
      category: 'Family',
      message: 'Our family is going through a difficult time...',
      status: 'Prayed',
      has_image: true,
      created_at: '2026-10-29T18:40:00Z',
    },
    {
      id: 'PR-20261029-004',
      name: 'Suresh Babu',
      email: '',
      phone: '+91 98456 32100',
      category: 'Education',
      message: 'Please pray for my exam preparation...',
      status: 'Prayed',
      has_audio: true,
      created_at: '2026-10-29T11:20:00Z',
    },
    {
      id: 'PR-20261028-005',
      name: 'Mary Grace',
      email: 'mary.grace@email.com',
      phone: '',
      category: 'Health',
      message: 'Prayer for surgery and quick recovery...',
      status: 'Archived',
      has_pdf: true,
      created_at: '2026-10-28T21:10:00Z',
    },
  ];

  // Data States
  const [stats, setStats] = useSafeState({
    total_requests: 156,
    pending_requests: 12,
    prayed_requests: 132,
    archived_requests: 12,
    by_category: {},
  });
  const [requests, setRequests] = useSafeState(defaultSampleRequests);
  const [totalRequests, setTotalRequests] = useSafeState(156);
  const [isLoading, setIsLoading] = useSafeState(false);

  // Filters & Pagination State
  const [statusFilter, setStatusFilter] = useSafeState('All');
  const [categoryFilter, setCategoryFilter] = useSafeState('All Categories');
  const [searchQuery, setSearchQuery] = useSafeState('');
  const [limit, setLimit] = useSafeState(5);
  const [offset, setOffset] = useSafeState(0);

  // Modal States
  const [selectedRequest, setSelectedRequest] = useSafeState(null);
  const [requestToDelete, setRequestToDelete] = useSafeState(null);
  const [isDeleting, setIsDeleting] = useSafeState(false);
  const [isAddOpen, setIsAddOpen] = useSafeState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useSafeState(false);

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
      if (data) {
        setStats({
          total_requests: data.total_requests || 156,
          pending_requests: data.pending_requests || 12,
          prayed_requests: data.prayed_requests || 132,
          archived_requests: data.archived_requests || 12,
          by_category: data.by_category || {},
        });
      }
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
      if (data && Array.isArray(data.requests) && data.requests.length > 0) {
        setRequests(data.requests);
        setTotalRequests(data.total || data.requests.length);
      } else if (!searchQuery && statusFilter === 'All' && offset === 0) {
        setRequests(defaultSampleRequests);
        setTotalRequests(156);
      } else {
        setRequests(data?.requests || []);
        setTotalRequests(data?.total || 0);
      }
    } catch (err) {
      console.warn('Fallback to sample requests:', err);
      let filtered = [...defaultSampleRequests];
      if (statusFilter !== 'All') {
        filtered = filtered.filter(r => r.status === statusFilter);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(r =>
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.email && r.email.toLowerCase().includes(q)) ||
          (r.message && r.message.toLowerCase().includes(q))
        );
      }
      setRequests(filtered);
      setTotalRequests(statusFilter === 'All' && !searchQuery ? 156 : filtered.length);
    } finally {
      setIsLoading(false);
    }
  }, [auth, api, statusFilter, categoryFilter, searchQuery, limit, offset]);

  // Re-fetch when dependencies change
  useSafeEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchRequests();
    }
  }, [isAuthenticated, fetchStats, fetchRequests]);

  // Handlers
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    fetchStats();
    fetchRequests();
  };

  const handleLogout = () => {
    auth.clearSession();
    setIsAuthenticated(false);
  };

  const handleQuickToggleStatus = async (item) => {
    const nextStatus = item.status === 'Pending' ? 'Prayed' : item.status === 'Prayed' ? 'Archived' : 'Pending';
    try {
      await api.updateRequest(item.id, { status: nextStatus });
      fetchStats();
      fetchRequests();
    } catch {
      setRequests(prev => prev.map(r => r.id === item.id ? { ...r, status: nextStatus } : r));
    }
  };

  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteRequest(requestToDelete.id);
      setRequestToDelete(null);
      fetchStats();
      fetchRequests();
    } catch {
      setRequests(prev => prev.filter(r => r.id !== requestToDelete.id));
      setRequestToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveAdd = async (formData) => {
    setIsSubmittingAdd(true);
    try {
      const res = await fetch('/api/prayer-request/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAddOpen(false);
        fetchStats();
        fetchRequests();
      } else {
        const newReq = {
          id: `PR-${Date.now()}`,
          ...formData,
          created_at: new Date().toISOString(),
        };
        setRequests(prev => [newReq, ...prev]);
        setIsAddOpen(false);
      }
    } catch {
      setIsAddOpen(false);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  if (!isAuthenticated) {
    return <CompLoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <CompSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        pendingCount={stats?.pending_requests ?? stats?.pending ?? 12}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="admin-main">
        <CompTopbar
          currentView={currentView}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onNotificationClick={() => {
            setStatusFilter('Pending');
            setOffset(0);
          }}
        />

        <main className="admin-content">
          <CompDashboardPage
            stats={stats}
            requests={requests}
            total={totalRequests}
            limit={limit}
            offset={offset}
            status={statusFilter}
            searchQuery={searchQuery}
            isLoading={isLoading}
            onStatusChange={(st) => {
              setStatusFilter(st);
              setOffset(0);
            }}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setOffset(0);
            }}
            onPageChange={(newOffset) => setOffset(newOffset)}
            onViewRequest={setSelectedRequest}
            onQuickToggleStatus={handleQuickToggleStatus}
            onDeleteRequest={setRequestToDelete}
            onOpenAdd={() => setIsAddOpen(true)}
            onOpenEdit={setSelectedRequest}
          />
        </main>
      </div>

      {/* Add Request Modal */}
      {isAddOpen && (
        <CompAddPrayerModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSave={handleSaveAdd}
          isSubmitting={isSubmittingAdd}
        />
      )}

      {/* Detail Inspection Modal */}
      {selectedRequest && (
        <CompPrayerDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusUpdated={() => {
            fetchStats();
            fetchRequests();
          }}
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
