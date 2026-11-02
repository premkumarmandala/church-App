const fs = require('fs');
const path = require('path');

const srcFrontend = path.resolve(__dirname, '..', 'frontend');
const srcData = path.resolve(__dirname, '..', 'backend', 'data');
const distDir = path.resolve(__dirname, '..', 'dist');

console.log('[Build] Packaging admin prayer-requests bundle...');
const adminFeatureDir = path.join(srcFrontend, 'admin', 'prayer-requests');
const bundleFiles = [
  path.join(adminFeatureDir, 'services', 'api.js'),
  path.join(adminFeatureDir, 'components', 'Sidebar.jsx'),
  path.join(adminFeatureDir, 'components', 'Topbar.jsx'),
  path.join(adminFeatureDir, 'components', 'StatsOverview.jsx'),
  path.join(adminFeatureDir, 'components', 'FilterToolbar.jsx'),
  path.join(adminFeatureDir, 'components', 'PrayerTable.jsx'),
  path.join(adminFeatureDir, 'components', 'PrayerDetailModal.jsx'),
  path.join(adminFeatureDir, 'components', 'DeleteConfirmModal.jsx'),
  path.join(adminFeatureDir, 'components', 'Pagination.jsx'),
  path.join(adminFeatureDir, 'components', 'LoginView.jsx'),
  path.join(adminFeatureDir, 'pages', 'DashboardPage.jsx'),
  path.join(adminFeatureDir, 'pages', 'PrayerRequestsPage.jsx'),
  path.join(adminFeatureDir, 'AdminPrayerRequests.jsx'),
];

let bundleContent = '/* Pastoral Prayer Admin - Feature Bundle */\n';
bundleContent += 'const { useState, useEffect, useCallback, useMemo, useRef } = React || window.React;\n\n';

for (const file of bundleFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/^\s*import\s+[^;]+;\s*$/gm, '');
    bundleContent += `\n/* === Source: ${path.basename(file)} === */\n${content}\n`;
  }
}

fs.writeFileSync(path.join(adminFeatureDir, 'prayer-requests.bundle.jsx'), bundleContent, 'utf8');
console.log('[Build] Successfully generated prayer-requests.bundle.jsx.');

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
