import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.resolve(rootDir, 'out');

const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const repoUrl = token 
  ? `https://jamil8655:${token}@github.com/jamil8655/miftah-tools.git`
  : 'https://github.com/jamil8655/miftah-tools.git';

async function deployGhPages() {
  try {
    console.log('🚀 Deploying out/ directory to GitHub Pages (gh-pages branch)...');
    
    // Ensure CNAME exists in out
    fs.writeFileSync(path.join(outDir, 'CNAME'), 'miftahtools.com');
    // Ensure .nojekyll exists
    fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

    const gitDir = path.join(outDir, '.git');
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true });
    }

    execSync('git init', { cwd: outDir, stdio: 'inherit' });
    execSync('git config user.name "Jamilur Rahman"', { cwd: outDir, stdio: 'inherit' });
    execSync('git config user.email "jrahmanansari132@gmail.com"', { cwd: outDir, stdio: 'inherit' });
    execSync('git add -A', { cwd: outDir, stdio: 'inherit' });
    execSync('git commit -m "Deploy: update with Google Play Store app link and badges"', { cwd: outDir, stdio: 'inherit' });
    execSync('git branch -M gh-pages', { cwd: outDir, stdio: 'inherit' });
    execSync(`git remote add origin ${repoUrl}`, { cwd: outDir, stdio: 'inherit' });
    
    console.log('📤 Pushing to origin/gh-pages...');
    execSync('git push -f origin gh-pages', { cwd: outDir, stdio: 'inherit' });

    console.log('✅ Successfully deployed to GitHub Pages! miftahtools.com is updated.');
  } catch (err) {
    console.error('❌ Error deploying to GitHub Pages:', err.message);
    process.exit(1);
  }
}

deployGhPages();
