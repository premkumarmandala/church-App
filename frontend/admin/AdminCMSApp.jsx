import { useState, useEffect, useCallback } from 'react';
import { authService, cmsApi } from './services/api.js';
import { Sidebar } from './layout/Sidebar.jsx';
import { Topbar } from './layout/Topbar.jsx';
import { DashboardOverview } from './dashboard/DashboardOverview.jsx';
import { HomeManager } from './home/HomeManager.jsx';
import { AboutManager } from './about/AboutManager.jsx';
import { BibleSettingsManager } from './bible/BibleSettingsManager.jsx';
import { SermonsManager } from './sermons/SermonsManager.jsx';
import { EventsManager } from './events/EventsManager.jsx';
import { MinistriesManager } from './ministries/MinistriesManager.jsx';
import { GalleryManager } from './gallery/GalleryManager.jsx';
import { ServiceTimingsManager } from './service-timings/ServiceTimingsManager.jsx';
import { AnnouncementsManager } from './announcements/AnnouncementsManager.jsx';
import { ContactManager } from './contact/ContactManager.jsx';
import { WebsiteSettingsManager } from './settings/WebsiteSettingsManager.jsx';
import { LoginView } from './prayer-requests/components/LoginView.jsx';
import { AdminPrayerRequests } from './prayer-requests/AdminPrayerRequests.jsx';

/**
 * Master Church Website Admin CMS Application
 * Orchestrates authentication, responsive navigation, module switching,
 * and data synchronization with PostgreSQL for all 12 modules.
 */
export function AdminCMSApp() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);
  const useSafeCallback = typeof useCallback !== 'undefined' ? useCallback : (window.React ? window.React.useCallback : null);

  const auth = window.authService || authService;
  const api = window.cmsApi || cmsApi;

  // Components with fallback
  const CompSidebar = window.Sidebar || Sidebar;
  const CompTopbar = window.Topbar || Topbar;
  const CompLoginView = window.LoginView || LoginView;
  const CompDashboardOverview = window.DashboardOverview || DashboardOverview;
  const CompHomeManager = window.HomeManager || HomeManager;
  const CompAboutManager = window.AboutManager || AboutManager;
  const CompBibleSettingsManager = window.BibleSettingsManager || BibleSettingsManager;
  const CompSermonsManager = window.SermonsManager || SermonsManager;
  const CompEventsManager = window.EventsManager || EventsManager;
  const CompMinistriesManager = window.MinistriesManager || MinistriesManager;
  const CompGalleryManager = window.GalleryManager || GalleryManager;
  const CompServiceTimingsManager = window.ServiceTimingsManager || ServiceTimingsManager;
  const CompAnnouncementsManager = window.AnnouncementsManager || AnnouncementsManager;
  const CompContactManager = window.ContactManager || ContactManager;
  const CompWebsiteSettingsManager = window.WebsiteSettingsManager || WebsiteSettingsManager;
  const CompAdminPrayerRequests = window.AdminPrayerRequests || AdminPrayerRequests;

  // Session state
  const [isAuthenticated, setIsAuthenticated] = useSafeState(() => auth.isAuthenticated());
  const [isSidebarOpen, setIsSidebarOpen] = useSafeState(false);
  const [currentModule, setCurrentModule] = useSafeState('dashboard');

  // Overview metrics state
  const [overview, setOverview] = useSafeState(null);
  const [pendingPrayersCount, setPendingPrayersCount] = useSafeState(0);
  const [isLoadingOverview, setIsLoadingOverview] = useSafeState(false);
  const [refreshKey, setRefreshKey] = useSafeState(0);

  // Authentication expired listener
  useSafeEffect(() => {
    const handleExpired = () => setIsAuthenticated(false);
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  // Fetch Dashboard Overview and Prayer stats
  const fetchOverviewData = useSafeCallback(async () => {
    if (!auth.isAuthenticated()) return;
    setIsLoadingOverview(true);
    try {
      const data = await api.getOverview();
      if (data) {
        setOverview(data);
      }
      const prayerStats = await api.getPrayerStats();
      if (prayerStats && typeof prayerStats.pending_requests === 'number') {
        setPendingPrayersCount(prayerStats.pending_requests);
      }
    } catch (err) {
      console.warn('Overview fetch error:', err);
    } finally {
      setIsLoadingOverview(false);
    }
  }, [auth, api]);

  useSafeEffect(() => {
    if (isAuthenticated) {
      fetchOverviewData();
    }
  }, [isAuthenticated, fetchOverviewData, refreshKey]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentModule('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return <CompLoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Render the selected feature module
  const renderModuleContent = () => {
    switch (currentModule) {
      case 'dashboard':
        return (
          <CompDashboardOverview
            key={refreshKey}
            overview={overview}
            onNavigateModule={(mod) => setCurrentModule(mod)}
          />
        );
      case 'home':
        return <CompHomeManager key={refreshKey} />;
      case 'about':
        return <CompAboutManager key={refreshKey} />;
      case 'bible':
        return <CompBibleSettingsManager key={refreshKey} />;
      case 'sermons':
        return <CompSermonsManager key={refreshKey} />;
      case 'events':
        return <CompEventsManager key={refreshKey} />;
      case 'ministries':
        return <CompMinistriesManager key={refreshKey} />;
      case 'gallery':
        return <CompGalleryManager key={refreshKey} />;
      case 'service-timings':
        return <CompServiceTimingsManager key={refreshKey} />;
      case 'announcements':
        return <CompAnnouncementsManager key={refreshKey} />;
      case 'contact':
        return <CompContactManager key={refreshKey} />;
      case 'prayer-requests':
        return (
          <div key={refreshKey}>
            <CompAdminPrayerRequests />
          </div>
        );
      case 'settings':
        return <CompWebsiteSettingsManager key={refreshKey} />;
      default:
        return (
          <CompDashboardOverview
            overview={overview}
            onNavigateModule={(mod) => setCurrentModule(mod)}
          />
        );
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <CompSidebar
        currentModule={currentModule}
        onSelectModule={(mod) => setCurrentModule(mod)}
        pendingPrayersCount={pendingPrayersCount}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="admin-main">
        <CompTopbar
          currentModule={currentModule}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onRefresh={handleRefresh}
          isLoading={isLoadingOverview}
        />

        <main className="admin-content" style={{ padding: '28px 32px' }}>
          {renderModuleContent()}
        </main>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.AdminCMSApp = AdminCMSApp;
}

