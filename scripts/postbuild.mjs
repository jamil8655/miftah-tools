import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// 1. Generate All Sitemaps
try {
  execSync('node scripts/generate-sitemap.mjs', { stdio: 'inherit', cwd: rootDir });
} catch (e) {
  console.warn('⚠️ Sitemap generation notice:', e.message);
}

// 2. Copy all XML sitemaps, robots.txt, and .htaccess to out/
const outDir = path.join(rootDir, 'out');
const publicDir = path.join(rootDir, 'public');

if (fs.existsSync(outDir) && fs.existsSync(publicDir)) {
  const allPublicFiles = fs.readdirSync(publicDir);
  allPublicFiles.forEach((file) => {
    if (file.endsWith('.xml') || file.endsWith('.txt') || file === '.htaccess' || file === 'CNAME') {
      const src = path.join(publicDir, file);
      const dest = path.join(outDir, file);
      fs.copyFileSync(src, dest);
      console.log(`✅ Copied public/${file} to out/${file}`);
    }
  });
}
