import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const htaccessSrc = path.join(rootDir, 'public', '.htaccess');
const htaccessDest = path.join(rootDir, 'out', '.htaccess');

if (fs.existsSync(htaccessSrc) && fs.existsSync(path.join(rootDir, 'out'))) {
  fs.copyFileSync(htaccessSrc, htaccessDest);
  console.log('? Copied public/.htaccess to out/.htaccess for Hostinger / Apache hosting');
}
