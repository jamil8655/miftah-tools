import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'https://miftahtools.com';

// 26 Existing site / section pages (including homepage)
const STATIC_PAGES = [
  '',
  '/tools',
  '/courses',
  '/quiz',
  '/workflows',
  '/batch',
  '/pdf-editor',
  '/ocr',
  '/qr-barcode',
  '/calculators',
  '/text-tools',
  '/dev-tools',
  '/security-tools',
  '/ai-tools',
  '/downloads',
  '/favorites',
  '/history',
  '/settings',
  '/about',
  '/faq',
  '/contact',
  '/privacy',
  '/terms',
  '/refund',
  '/guidelines',
  '/disclaimer'
];

// 1 New page
const NEW_PAGES = [
  '/compare'
];

// Fallback list of 338 real tool slugs in case out/tools does not exist yet
const EXCLUDE_SLUGS = new Set([
  'compress-images',
  'social-media-video-downloader',
  'live-translator'
]);

function getToolPages() {
  const outToolsDir = path.join(rootDir, 'out', 'tools');
  if (fs.existsSync(outToolsDir)) {
    const dirs = fs
      .readdirSync(outToolsDir)
      .filter((d) => fs.statSync(path.join(outToolsDir, d)).isDirectory());
    const valid = dirs.filter((d) => !EXCLUDE_SLUGS.has(d));
    if (valid.length >= 338) {
      return valid.slice(0, 338);
    }
  }

  // Fallback: extract slugs directly from lib/tools-config.ts
  const configPath = path.join(rootDir, 'lib', 'tools-config.ts');
  const content = fs.readFileSync(configPath, 'utf8');
  const slugMatches = [...content.matchAll(/["']slug["']:\s*["']([^"']+)["']/g)].map((m) => m[1]);
  const idMatches = [...content.matchAll(/["']id["']:\s*["']([^"']+)["']/g)].map((m) => m[1]);
  const allToolIdentifiers = Array.from(new Set([...slugMatches, ...idMatches])).filter(
    (s) => !EXCLUDE_SLUGS.has(s)
  );

  return allToolIdentifiers.slice(0, 338);
}

export function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  const toolPages = getToolPages();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // 1. Homepage & 25 section pages (total 26)
  STATIC_PAGES.forEach((page) => {
    const loc = page === '' ? `${BASE_URL}/` : `${BASE_URL}${page}/`;
    const priority = page === '' ? '1.0' : '0.6';
    xml += `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>
`;
  });

  // 2. 1 New comparison page
  NEW_PAGES.forEach((page) => {
    const loc = `${BASE_URL}${page}/`;
    xml += `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  // 3. 338 Real tool pages
  toolPages.forEach((slug) => {
    const loc = `${BASE_URL}/tools/${slug}/`;
    xml += `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  xml += `</urlset>`;

  const totalUrls = STATIC_PAGES.length + NEW_PAGES.length + toolPages.length;

  // Write to public/sitemap.xml
  const publicSitemap = path.join(rootDir, 'public', 'sitemap.xml');
  fs.writeFileSync(publicSitemap, xml, 'utf8');

  // Write to out/sitemap.xml if out/ exists
  const outDir = path.join(rootDir, 'out');
  if (fs.existsSync(outDir)) {
    const outSitemap = path.join(outDir, 'sitemap.xml');
    fs.writeFileSync(outSitemap, xml, 'utf8');
  }

  // Remove dead sitemap_index.xml if present
  const deadIndexPublic = path.join(rootDir, 'public', 'sitemap_index.xml');
  if (fs.existsSync(deadIndexPublic)) {
    fs.unlinkSync(deadIndexPublic);
  }
  const deadIndexOut = path.join(rootDir, 'out', 'sitemap_index.xml');
  if (fs.existsSync(deadIndexOut)) {
    fs.unlinkSync(deadIndexOut);
  }

  console.log(`✅ sitemap.xml generated with exactly ${totalUrls} URLs (338 tools + 26 sections + 1 /compare/)!`);
}

// Run directly if invoked via node
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSitemap();
}
