const fs = require('fs');
const path = require('path');

const srcFrontend = path.resolve(__dirname, '..', 'frontend');
const srcData = path.resolve(__dirname, '..', 'backend', 'data');
const distDir = path.resolve(__dirname, '..', 'dist');

// Load local Babel compiler for pre-transpiling JSX to pure JavaScript
const babelScriptPath = path.join(__dirname, 'babel.min.js');
let Babel = null;
if (fs.existsSync(babelScriptPath)) {
  const vm = require('vm');
  const babelCode = fs.readFileSync(babelScriptPath, 'utf8');
  const ctx = { window: {}, console: console };
  vm.createContext(ctx);
  vm.runInContext(babelCode, ctx);
  Babel = ctx.Babel || ctx.window.Babel;
}

function compileJsx(code) {
  if (!Babel) return null;
  try {
    return Babel.transform(code, { presets: ['react'] }).code;
  } catch (err) {
    console.error('[Build] Babel compile error:', err.message);
    return null;
  }
}

// -----------------------------------------------------------------------------
// 1. Pastoral Prayer Admin Bundle
// -----------------------------------------------------------------------------
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

let prayerBundleContent = '/* Pastoral Prayer Admin - Feature Bundle */\n(function() {\n';
prayerBundleContent += 'const { useState, useEffect, useCallback, useMemo, useRef } = React || window.React;\n\n';

for (const file of prayerBundleFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/^\s*import\s+[^;]+;\s*$/gm, '');
    content = content.replace(/^\s*export\s+(?:default\s+)?/gm, '');
    prayerBundleContent += `\n/* === Source: ${path.basename(file)} === */\n${content}\n`;
  }
}
prayerBundleContent += '\nwindow.AdminPrayerRequests = AdminPrayerRequests;\n})();\n';

fs.writeFileSync(path.join(adminFeatureDir, 'prayer-requests.bundle.jsx'), prayerBundleContent, 'utf8');
console.log('[Build] Successfully generated prayer-requests.bundle.jsx.');
const compiledPrayer = compileJsx(prayerBundleContent);
if (compiledPrayer) {
  fs.writeFileSync(path.join(adminFeatureDir, 'prayer-requests.bundle.js'), compiledPrayer, 'utf8');
  console.log('[Build] Successfully generated pure JS: prayer-requests.bundle.js.');
}

// -----------------------------------------------------------------------------
// 2. Church CMS Master Bundle
// -----------------------------------------------------------------------------
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

let cmsBundleContent = '/* Church Website Master CMS Bundle */\n(function() {\n';
cmsBundleContent += 'const { useState, useEffect, useCallback, useMemo, useRef } = React || window.React;\n\n';

for (const file of cmsBundleFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/^\s*import\s+[^;]+;\s*$/gm, '');
    content = content.replace(/^\s*export\s+(?:default\s+)?/gm, '');
    cmsBundleContent += `\n/* === Source: ${path.basename(file)} === */\n${content}\n`;
  }
}
cmsBundleContent += '\nwindow.AdminCMSApp = AdminCMSApp;\n})();\n';

fs.writeFileSync(path.join(adminDir, 'cms.bundle.jsx'), cmsBundleContent, 'utf8');
console.log('[Build] Successfully generated cms.bundle.jsx.');
const compiledCms = compileJsx(cmsBundleContent);
if (compiledCms) {
  fs.writeFileSync(path.join(adminDir, 'cms.bundle.js'), compiledCms, 'utf8');
  console.log('[Build] Successfully generated pure JS: cms.bundle.js.');
}

// -----------------------------------------------------------------------------
// 3. Church Public Home Website Bundle
// -----------------------------------------------------------------------------
console.log('[Build] Packaging Church Public Home Website Bundle...');
const homeDir = path.join(srcFrontend, 'home');
const homeComponentDir = path.join(homeDir, 'components');
const homeBundleFiles = [
  path.join(homeComponentDir, 'Navbar.jsx'),
  path.join(homeComponentDir, 'Hero.jsx'),
  path.join(homeComponentDir, 'Announcements.jsx'),
  path.join(homeComponentDir, 'VerseOfTheDay.jsx'),
  path.join(homeComponentDir, 'ServiceTimings.jsx'),
  path.join(homeComponentDir, 'About.jsx'),
  path.join(homeComponentDir, 'LatestSermons.jsx'),
  path.join(homeComponentDir, 'UpcomingEvents.jsx'),
  path.join(homeComponentDir, 'Ministries.jsx'),
  path.join(homeComponentDir, 'Gallery.jsx'),
  path.join(homeComponentDir, 'ChurchLocation.jsx'),
  path.join(homeComponentDir, 'DonateModal.jsx'),
  path.join(homeComponentDir, 'Footer.jsx'),
  path.join(homeDir, 'HomePage.jsx'),
];

let homeBundleContent = '/* Church Public Home Website Master Bundle */\n(function() {\n';
homeBundleContent += 'const { useState, useEffect, useCallback, useMemo, useRef } = React || window.React;\n\n';

for (const file of homeBundleFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/^\s*import\s+[^;]+;\s*$/gm, '');
    content = content.replace(/^\s*export\s+(?:default\s+)?/gm, '');
    homeBundleContent += `\n/* === Source: ${path.basename(file)} === */\n${content}\n`;
  }
}

homeBundleContent += `
window.HomePage = HomePage;

// Automatically mount HomePage to #root if present
function autoMountHomeApp() {
  if (window.__HOME_MOUNTED__) return;
  const rootElement = document.getElementById("root");
  if (!rootElement) return;

  if (window.ReactDOM && typeof window.ReactDOM.createRoot === "function") {
    window.__HOME_MOUNTED__ = true;
    const reactRoot = ReactDOM.createRoot(rootElement);
    reactRoot.render(React.createElement(HomePage));
  } else if (window.ReactDOM && typeof window.ReactDOM.render === "function") {
    window.__HOME_MOUNTED__ = true;
    ReactDOM.render(React.createElement(HomePage), rootElement);
  } else {
    setTimeout(autoMountHomeApp, 50);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoMountHomeApp);
} else {
  autoMountHomeApp();
}

})();
`;

fs.writeFileSync(path.join(homeDir, 'home.bundle.jsx'), homeBundleContent, 'utf8');
console.log('[Build] Successfully generated home.bundle.jsx.');
const compiledHome = compileJsx(homeBundleContent);
if (compiledHome) {
  fs.writeFileSync(path.join(homeDir, 'home.bundle.js'), compiledHome, 'utf8');
  console.log('[Build] Successfully generated pure JS: home.bundle.js.');
}

// -----------------------------------------------------------------------------
// 4. Dist Directory Synchronization
// -----------------------------------------------------------------------------
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
