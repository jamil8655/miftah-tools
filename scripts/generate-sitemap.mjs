import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://miftahtools.com';

const TOOLS_SLUGS = [
  'merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-word', 'pdf-to-image', 'image-to-pdf',
  'word-to-pdf', 'excel-to-pdf', 'rotate-pdf', 'pdf-page-numbers', 'pdf-watermark',
  'edit-pdf-metadata', 'docx-to-pdf', 'pdf-to-docx', 'text-to-pdf', 'markdown-to-pdf',
  'pdf-organizer', 'jpg-to-png', 'png-to-jpg', 'image-compressor', 'image-resizer',
  'rotate-image', 'image-metadata', 'image-exif', 'image-palette', 'favicon-generator',
  'media-downloader', 'video-to-mp3', 'youtube-downloader', 'instagram-downloader',
  'tiktok-downloader', 'whatsapp-status-saver', 'audio-cutter', 'audio-booster',
  'audio-speed', 'word-counter', 'case-converter', 'remove-duplicate-lines',
  'text-diff', 'text-compare', 'ocr-image-to-text', 'ai-summarizer',
  'file-size-converter', 'general-unit-converter', 'download-time-calculator',
  'math-calculators', 'percentage-calculator', 'mb-to-kb', 'json-formatter',
  'base64-encode-decode', 'jwt-decoder', 'timestamp-converter', 'unix-timestamp-converter',
  'uuid-generator', 'color-converter', 'markdown-editor', 'hash-generator',
  'password-generator', 'qr-code-generator', 'qr-generator', 'barcode-generator'
];

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

const today = new Date().toISOString().split('T')[0];

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

// Add static pages
STATIC_PAGES.forEach((page) => {
  sitemapXml += `  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>
`;
});

// Add tool pages (both root slugs and /tools/slugs)
TOOLS_SLUGS.forEach((slug) => {
  sitemapXml += `  <url>
    <loc>${BASE_URL}/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/tools/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
});

sitemapXml += `</urlset>`;

const publicPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(publicPath, sitemapXml);
console.log('✅ sitemap.xml generated with ' + (STATIC_PAGES.length + TOOLS_SLUGS.length * 2) + ' routes!');
