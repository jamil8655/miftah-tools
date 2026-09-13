const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'docs');

function fixHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fixHtmlFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // Fix root relative _next to /miftah-tools/_next
      content = content.replace(/href="\/_next\//g, 'href="/miftah-tools/_next/');
      content = content.replace(/src="\/_next\//g, 'src="/miftah-tools/_next/');
      
      // Fix manifest and icons
      content = content.replace(/href="\/manifest\.json"/g, 'href="/miftah-tools/manifest.json"');
      content = content.replace(/href="\/icon-/g, 'href="/miftah-tools/icon-');
      content = content.replace(/href="\/apple-touch-icon\.png"/g, 'href="/miftah-tools/apple-touch-icon.png"');
      content = content.replace(/href="\/favicon\.ico"/g, 'href="/miftah-tools/favicon.ico"');

      fs.writeFileSync(fullPath, content);
    }
  }
}

console.log('Fixing GitHub Pages paths in docs/...');
fixHtmlFiles(docsDir);

// Also create .nojekyll in docs
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');
console.log('✅ All docs HTML files updated for GitHub Pages (/miftah-tools/)!');
