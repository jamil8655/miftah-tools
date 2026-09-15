import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '..', 'out');

fs.writeFileSync(path.join(outDir, 'CNAME'), 'miftahtools.com');
fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

console.log('🚀 Pushing live site build directly to GitHub Pages (gh-pages)...');
execSync('git init', { cwd: outDir, stdio: 'inherit' });
execSync('git add -A', { cwd: outDir, stdio: 'inherit' });
execSync('git commit -m "deploy: automated live site update"', { cwd: outDir, stdio: 'inherit' });
execSync('git branch -M gh-pages', { cwd: outDir, stdio: 'inherit' });
execSync('git remote add origin https://github.com/jamil8655/miftah-tools.git', { cwd: outDir, stdio: 'inherit' });
execSync('git push -f origin gh-pages', { cwd: outDir, stdio: 'inherit' });

console.log('✅ 100% SUCCESS! GitHub Pages branch updated automatically.');
