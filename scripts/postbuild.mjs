import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSitemap } from './generate-sitemap.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const outDir = path.join(rootDir, 'out');

// 1. Copy public/.htaccess to out/.htaccess for Hostinger / Apache hosting
const htaccessSrc = path.join(rootDir, 'public', '.htaccess');
const htaccessDest = path.join(outDir, '.htaccess');
if (fs.existsSync(htaccessSrc) && fs.existsSync(outDir)) {
  fs.copyFileSync(htaccessSrc, htaccessDest);
  console.log('✓ Copied public/.htaccess to out/.htaccess for Hostinger / Apache hosting');
}

// 2. Disable Jekyll for GitHub Pages
if (fs.existsSync(outDir)) {
  const nojekyllDest = path.join(outDir, '.nojekyll');
  fs.writeFileSync(nojekyllDest, '# Disable Jekyll for GitHub Pages\n');
  console.log('✓ Created out/.nojekyll for GitHub Pages CSS & JS asset serving');

  // 3. Custom domain CNAME
  const cnameDest = path.join(outDir, 'CNAME');
  fs.writeFileSync(cnameDest, 'miftahtools.com\n');
  console.log('✓ Created out/CNAME for miftahtools.com custom domain');
}

// 4. Generate sitemap.xml with exactly 365 verified URLs
try {
  generateSitemap();
  console.log('✓ Build-time sitemap.xml verified and generated');
} catch (e) {
  console.error('Error generating sitemap during postbuild:', e);
}
