import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const BASE_URL = 'https://miftahtools.com';

// Extract tools and categories directly from lib/tools-config.ts
const toolsConfigPath = path.join(rootDir, 'lib', 'tools-config.ts');
const toolsConfigRaw = fs.readFileSync(toolsConfigPath, 'utf8');

const toolsMatch = toolsConfigRaw.match(/export const TOOLS_LIST[^{]*=\s*(\[[\s\S]*?\]);\s*export const CATEGORIES_CONFIG/);
let toolsList = [];
if (toolsMatch) {
  try {
    toolsList = JSON.parse(toolsMatch[1]);
  } catch (e) {
    console.error('Error parsing tools list:', e);
  }
}

const CATEGORIES = [
  'pdf',
  'document',
  'image',
  'ocr',
  'text',
  'compress',
  'security',
  'media',
  'calculator',
  'dev',
  'qr',
  'ai',
];

const STANDALONE_HUBS = [
  '/tools',
  '/pdf-editor',
  '/pdf-signer',
  '/pdf-workspace',
  '/ocr',
  '/camera-scanner',
  '/markitdown',
  '/auto-crop-images-to-pdf',
  '/image-studio',
  '/qr-barcode',
  '/calculators',
  '/text-tools',
  '/dev-tools',
  '/security-tools',
  '/ai-tools',
  '/workflows',
  '/batch',
];

const INFORMATIONAL_PAGES = [
  '/about',
  '/faq',
  '/contact',
  '/privacy',
  '/privacy-center',
  '/terms',
  '/disclaimer',
  '/guidelines',
  '/refund',
  '/developers',
];

const today = new Date().toISOString().split('T')[0];

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

// 1. Homepage (Priority 1.0, Daily)
sitemapXml += `  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

// 2. Category Pages (Priority 0.9, Daily)
CATEGORIES.forEach((cat) => {
  sitemapXml += `  <url>
    <loc>${BASE_URL}/tools/${cat}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;
});

// 3. Standalone Tool Workspaces & Hubs (Priority 0.9, Weekly)
STANDALONE_HUBS.forEach((hub) => {
  sitemapXml += `  <url>
    <loc>${BASE_URL}${hub}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
});

// 4. All Canonical Individual Tool Pages (Priority 0.8, Weekly)
const seenSlugs = new Set();
toolsList.forEach((tool) => {
  const canonicalSlug = tool.slug || tool.id;
  if (!seenSlugs.has(canonicalSlug)) {
    seenSlugs.add(canonicalSlug);
    sitemapXml += `  <url>
    <loc>${BASE_URL}/tools/${canonicalSlug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }
});

// 5. Informational & Legal Pages (Priority 0.6, Monthly)
INFORMATIONAL_PAGES.forEach((page) => {
  sitemapXml += `  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
});

sitemapXml += `</urlset>`;

// Write to public/sitemap.xml
const publicPath = path.join(rootDir, 'public', 'sitemap.xml');
fs.writeFileSync(publicPath, sitemapXml);

// Also copy to out/sitemap.xml if build directory exists
const outDir = path.join(rootDir, 'out');
if (fs.existsSync(outDir)) {
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemapXml);
}

const totalRoutes = 1 + CATEGORIES.length + STANDALONE_HUBS.length + seenSlugs.size + INFORMATIONAL_PAGES.length;
console.log(`✅ Production XML Sitemap generated successfully with ${totalRoutes} canonical URLs!`);
console.log(`   - Homepage: 1`);
console.log(`   - Category Hubs: ${CATEGORIES.length}`);
console.log(`   - Standalone Hubs: ${STANDALONE_HUBS.length}`);
console.log(`   - Individual Canonical Tools: ${seenSlugs.size}`);
console.log(`   - Informational Pages: ${INFORMATIONAL_PAGES.length}`);
