import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// 1. Generate Sitemap
try {
  execSync('node scripts/generate-sitemap.mjs', { stdio: 'inherit', cwd: rootDir });
} catch (e) {
  console.warn('⚠️ Sitemap generation notice:', e.message);
}

// 2. Copy .htaccess, robots.txt, and sitemap.xml to out/
const outDir = path.join(rootDir, 'out');
if (fs.existsSync(outDir)) {
  const filesToCopy = ['.htaccess', 'robots.txt', 'sitemap.xml'];
  filesToCopy.forEach((file) => {
    const src = path.join(rootDir, 'public', file);
    const dest = path.join(outDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✅ Copied public/${file} to out/${file}`);
    }
  });
}
