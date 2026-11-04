const fs = require('fs');
const path = require('path');

const srcFrontend = path.resolve(__dirname, '..', 'frontend');
const srcData = path.resolve(__dirname, '..', 'backend', 'data');
const distDir = path.resolve(__dirname, '..', 'dist');

console.log('[Build] Packaging admin prayer-requests bundle...');
const adminFeatureDir = path.join(srcFrontend, 'admin', 'prayer-requests');
const prayerBundleFiles = [
  path.join(adminFeatureDir, 'services', 'api.js'),
  path.join(adminFeatureDir, 'components', 'Sidebar.jsx'),
  path.join(adminFeatureDir, 'components', 'Topbar.jsx'),
  path.join(adminFeatureDir, 'components', 'StatsOverview.jsx'),
  path.join(adminFeatureDir, 'components', 'FilterToolbar.jsx'),
  path.join(adminFeatureDir, 'components', 'PrayerTable.jsx'),
  path.join(adminFeatureDir, 'components', 'PrayerDetailModal.jsx'),
  path.join(adminFeatureDir, 'components', 'DeleteConfirmModal.jsx'),
  path.join(adminFeatureDir, 'components', 'AddPrayerModal.jsx'),
  path.join(adminFeatureDir, 'components', 'Pagination.jsx'),
  path.join(adminFeatureDir, 'components', 'LoginView.jsx'),
  path.join(adminFeatureDir, 'pages', 'DashboardPage.jsx'),
  path.join(adminFeatureDir, 'pages', 'PrayerRequestsPage.jsx'),
  path.join(adminFeatureDir, 'AdminPrayerRequests.jsx'),
];

let prayerBundleContent = '/* Pastoral Prayer Admin - Feature Bundle */\n';
prayerBundleContent += 'const { useState, useEffect, useCallback, useMemo, useRef } = React || window.React;\n\n';

for (const file of prayerBundleFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/^\s*import\s+[^;]+;\s*$/gm, '');
    content = content.replace(/^\s*export\s+(?:default\s+)?/gm, '');
    prayerBundleContent += `\n/* === Source: ${path.basename(file)} === */\n${content}\n`;
  }
}

fs.writeFileSync(path.join(adminFeatureDir, 'prayer-requests.bundle.jsx'), prayerBundleContent, 'utf8');
console.log('[Build] Successfully generated prayer-requests.bundle.jsx.');

console.log('[Build] Packaging Church CMS Master Bundle...');
const adminDir = path.join(srcFrontend, 'admin');
const cmsBundleFiles = [
  path.join(adminDir, 'services', 'api.js'),
  path.join(adminDir, 'components', 'PageHeader.jsx'),
  path.join(adminDir, 'components', 'StatusBadge.jsx'),
  path.join(adminDir, 'components', 'MediaUploadField.jsx'),
  path.join(adminDir, 'components', 'ConfirmModal.jsx'),
  path.join(adminFeatureDir, 'components', 'StatsOverview.jsx'),
  path.join(adminFeatureDir, 'components', 'FilterToolbar.jsx'),
  path.join(adminFeatureDir, 'components', 'PrayerTable.jsx'),
  path.join(adminFeatureDir, 'components', 'Pagination.jsx'),
  path.join(adminFeatureDir, 'components', 'PrayerDetailModal.jsx'),
  path.join(adminFeatureDir, 'components', 'AddPrayerModal.jsx'),
  path.join(adminFeatureDir, 'PrayerRequestsManager.jsx'),
  path.join(adminDir, 'users', 'UsersManager.jsx'),
  path.join(adminDir, 'layout', 'Sidebar.jsx'),
  path.join(adminDir, 'layout', 'Topbar.jsx'),
  path.join(adminDir, 'dashboard', 'DashboardOverview.jsx'),
  path.join(adminDir, 'home', 'HomeManager.jsx'),
  path.join(adminDir, 'about', 'AboutManager.jsx'),
  path.join(adminDir, 'bible', 'BibleSettingsManager.jsx'),
  path.join(adminDir, 'sermons', 'SermonsManager.jsx'),
  path.join(adminDir, 'events', 'EventsManager.jsx'),
  path.join(adminDir, 'ministries', 'MinistriesManager.jsx'),
  path.join(adminDir, 'gallery', 'GalleryManager.jsx'),
  path.join(adminDir, 'service-timings', 'ServiceTimingsManager.jsx'),
  path.join(adminDir, 'announcements', 'AnnouncementsManager.jsx'),
  path.join(adminDir, 'contact', 'ContactManager.jsx'),
  path.join(adminDir, 'settings', 'WebsiteSettingsManager.jsx'),
  path.join(adminDir, 'AdminCMSApp.jsx'),
];

let cmsBundleContent = '/* Church Website Master CMS Bundle */\n';
cmsBundleContent += 'const { useState, useEffect, useCallback, useMemo, useRef } = React || window.React;\n\n';

for (const file of cmsBundleFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/^\s*import\s+[^;]+;\s*$/gm, '');
    content = content.replace(/^\s*export\s+(?:default\s+)?/gm, '');
    cmsBundleContent += `\n/* === Source: ${path.basename(file)} === */\n${content}\n`;
  }
}

fs.writeFileSync(path.join(adminDir, 'cms.bundle.jsx'), cmsBundleContent, 'utf8');
console.log('[Build] Successfully generated cms.bundle.jsx.');

console.log('[Build] Cleaning existing dist directory...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

console.log(`[Build] Copying frontend assets from ${srcFrontend} to ${distDir}...`);
fs.cpSync(srcFrontend, distDir, { recursive: true });

const distBibleData = path.join(distDir, 'bible-data');
console.log(`[Build] Copying bible-data from ${srcData} to ${distBibleData}...`);
fs.cpSync(srcData, distBibleData, { recursive: true });

console.log('[Build] Successfully generated dist directory with frontend assets and bible-data.');
