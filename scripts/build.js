const fs = require('fs');
const path = require('path');

const srcFrontend = path.resolve(__dirname, '..', 'frontend');
const srcData = path.resolve(__dirname, '..', 'backend', 'data');
const distDir = path.resolve(__dirname, '..', 'dist');

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
