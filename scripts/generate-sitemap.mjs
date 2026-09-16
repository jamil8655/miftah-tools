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

function buildUrlEntry(url, priority = '0.8', changefreq = 'weekly') {
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>\n`;
}

// 1. Pages Sitemap (Homepage, Hubs, Legal)
let pagesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
pagesXml += buildUrlEntry(`${BASE_URL}/`, '1.0', 'daily');

STANDALONE_HUBS.forEach((hub) => {
  const cleanHub = hub.endsWith('/') ? hub : `${hub}/`;
  pagesXml += buildUrlEntry(`${BASE_URL}${cleanHub}`, '0.9', 'weekly');
});

INFORMATIONAL_PAGES.forEach((page) => {
  const cleanPage = page.endsWith('/') ? page : `${page}/`;
  pagesXml += buildUrlEntry(`${BASE_URL}${cleanPage}`, '0.6', 'monthly');
});
pagesXml += `</urlset>`;

// 2. Categories Sitemap
let categoryXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
CATEGORIES.forEach((cat) => {
  categoryXml += buildUrlEntry(`${BASE_URL}/tools/${cat}/`, '0.9', 'daily');
});
categoryXml += `</urlset>`;

// 3. Tools / Posts Sitemap (All canonical tools)
let toolsXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
const seenSlugs = new Set();
toolsList.forEach((tool) => {
  const canonicalSlug = tool.slug || tool.id;
  if (!seenSlugs.has(canonicalSlug)) {
    seenSlugs.add(canonicalSlug);
    toolsXml += buildUrlEntry(`${BASE_URL}/tools/${canonicalSlug}/`, '0.8', 'weekly');
  }
});
toolsXml += `</urlset>`;

// 4. Master Sitemap (Combined all URLs)
let masterSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
masterSitemapXml += buildUrlEntry(`${BASE_URL}/`, '1.0', 'daily');

CATEGORIES.forEach((cat) => {
  masterSitemapXml += buildUrlEntry(`${BASE_URL}/tools/${cat}/`, '0.9', 'daily');
});

STANDALONE_HUBS.forEach((hub) => {
  const cleanHub = hub.endsWith('/') ? hub : `${hub}/`;
  masterSitemapXml += buildUrlEntry(`${BASE_URL}${cleanHub}`, '0.9', 'weekly');
});

toolsList.forEach((tool) => {
  const canonicalSlug = tool.slug || tool.id;
  masterSitemapXml += buildUrlEntry(`${BASE_URL}/tools/${canonicalSlug}/`, '0.8', 'weekly');
});

INFORMATIONAL_PAGES.forEach((page) => {
  const cleanPage = page.endsWith('/') ? page : `${page}/`;
  masterSitemapXml += buildUrlEntry(`${BASE_URL}${cleanPage}`, '0.6', 'monthly');
});
masterSitemapXml += `</urlset>`;

// 5. Sitemap Index (Standard Index pointing to sub-sitemaps)
const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/page-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/category-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/tools-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/post-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;

// Define all target sitemap files and aliases
const sitemapFiles = {
  'sitemap.xml': masterSitemapXml,
  'sitemap_index.xml': sitemapIndexXml,
  'sitemaps.xml': sitemapIndexXml,
  'sitemap-index.xml': sitemapIndexXml,
  'index.xml': sitemapIndexXml,
  'post-sitemap.xml': toolsXml,
  'posts-sitemap.xml': toolsXml,
  'posts.sitemap.xml': toolsXml,
  'post_sitemap.xml': toolsXml,
  'page-sitemap.xml': pagesXml,
  'pages-sitemap.xml': pagesXml,
  'pages.sitemap.xml': pagesXml,
  'page_sitemap.xml': pagesXml,
  'tools-sitemap.xml': toolsXml,
  'tool-sitemap.xml': toolsXml,
  'category-sitemap.xml': categoryXml,
  'categories-sitemap.xml': categoryXml,
};

const publicDir = path.join(rootDir, 'public');
const outDir = path.join(rootDir, 'out');

// Write each sitemap to public/ and out/ (if exists)
Object.entries(sitemapFiles).forEach(([fileName, content]) => {
  const pubPath = path.join(publicDir, fileName);
  fs.writeFileSync(pubPath, content, 'utf8');

  if (fs.existsSync(outDir)) {
    const outPath = path.join(outDir, fileName);
    fs.writeFileSync(outPath, content, 'utf8');
  }
});

const totalRoutes = 1 + CATEGORIES.length + STANDALONE_HUBS.length + seenSlugs.size + INFORMATIONAL_PAGES.length;
console.log(`✅ Production XML Sitemaps generated successfully with ${totalRoutes} canonical URLs!`);
console.log(`   - Master: /sitemap.xml & /sitemap_index.xml`);
console.log(`   - Pages: /page-sitemap.xml & /pages-sitemap.xml (${1 + STANDALONE_HUBS.length + INFORMATIONAL_PAGES.length} URLs)`);
console.log(`   - Categories: /category-sitemap.xml (${CATEGORIES.length} URLs)`);
console.log(`   - Tools/Posts: /tools-sitemap.xml & /post-sitemap.xml (${seenSlugs.size} URLs)`);
console.log(`   - Generated ${Object.keys(sitemapFiles).length} total sitemap endpoints for Google Search Console parity.`);
