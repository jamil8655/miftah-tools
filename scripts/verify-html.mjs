import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const testTools = [
  'compress-pdf',
  'merge-pdf',
  'pdf-to-docx',
  'media-downloader',
  'image-resizer',
  'qr-generator',
];

console.log('🧪 Testing HTML Outputs in out/ directory...\n');

testTools.forEach((toolSlug) => {
  const filePath = path.join(rootDir, 'out', 'tools', toolSlug, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing file: ${filePath}`);
    return;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || 'None';
  const hasJsonLd = html.includes('application/ld+json');
  const hasHowTo = html.includes('How to Use');
  const hasRelated = html.includes('Related Digital Tools') || html.includes('Related Tools');

  console.log(`📌 Tool: /tools/${toolSlug}`);
  console.log(`   - Title: ${title}`);
  console.log(`   - JSON-LD Structured Data: ${hasJsonLd ? '✅ Present' : '❌ Missing'}`);
  console.log(`   - How to Use Section: ${hasHowTo ? '✅ Present' : '❌ Missing'}`);
  console.log(`   - Related Tools Links: ${hasRelated ? '✅ Present' : '❌ Missing'}\n`);
});
