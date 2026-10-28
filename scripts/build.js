const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'frontend');
const distDir = path.resolve(__dirname, '..', 'dist');

console.log(`[Build] Copying static assets from ${srcDir} to ${distDir}...`);

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

fs.cpSync(srcDir, distDir, { recursive: true });
console.log('[Build] Successfully generated dist directory for Catalyst deployment.');
