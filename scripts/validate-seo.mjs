import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const BASE_URL = 'https://miftahtools.com';

console.log('🔍 Starting Miftah Tools Production SEO Validation Suite...\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedChecks++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

// 1. Verify Tools Data & SEO Generation
const toolsConfigPath = path.join(rootDir, 'lib', 'tools-config.ts');
const toolsRaw = fs.readFileSync(toolsConfigPath, 'utf8');
const toolsMatch = toolsRaw.match(/export const TOOLS_LIST[^{]*=\s*(\[[\s\S]*?\]);\s*export const CATEGORIES_CONFIG/);

assert(!!toolsMatch, 'TOOLS_LIST successfully parsed from lib/tools-config.ts');

const toolsList = JSON.parse(toolsMatch[1]);
assert(toolsList.length >= 220, `TOOLS_LIST contains ${toolsList.length} tools (expected >= 220)`);

// Check unique slugs
const slugsMap = new Map();
const titlesMap = new Map();
let toolsWithFullData = 0;

toolsList.forEach((tool) => {
  const slug = tool.slug || tool.id;
  if (slugsMap.has(slug)) {
    assert(false, `Duplicate slug detected: "${slug}"`);
  } else {
    slugsMap.set(slug, tool.id);
  }

  // Verify core fields
  if (tool.name && tool.shortDesc && tool.category) {
    toolsWithFullData++;
  }
});

assert(toolsWithFullData === toolsList.length, `All ${toolsList.length} tools have valid name, shortDesc, and category.`);

// 2. Validate Robots.txt
const robotsPath = path.join(rootDir, 'public', 'robots.txt');
assert(fs.existsSync(robotsPath), 'public/robots.txt file exists');

const robotsContent = fs.readFileSync(robotsPath, 'utf8');
assert(robotsContent.includes('Allow: /'), 'robots.txt allows public crawling');
assert(robotsContent.includes('Sitemap: https://miftahtools.com/sitemap.xml'), 'robots.txt specifies correct canonical sitemap URL');
assert(robotsContent.includes('Disallow: /admin/'), 'robots.txt disallows /admin/');
assert(robotsContent.includes('Disallow: /account/'), 'robots.txt disallows /account/');

// 3. Validate XML Sitemap
const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
assert(fs.existsSync(sitemapPath), 'public/sitemap.xml file exists');

const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
assert(sitemapContent.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'sitemap.xml has valid XML declaration');
assert(sitemapContent.includes('<urlset'), 'sitemap.xml contains valid <urlset> root element');

// Extract all <loc> entries
const locMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
const sitemapUrls = locMatches.map((m) => m.replace(/<\/?loc>/g, '').trim());

assert(sitemapUrls.length >= 250, `Sitemap contains ${sitemapUrls.length} total URLs (expected >= 250)`);

// Check for duplicates in sitemap
const uniqueSitemapUrls = new Set(sitemapUrls);
assert(uniqueSitemapUrls.size === sitemapUrls.length, `Zero duplicate URLs in sitemap (${uniqueSitemapUrls.size} unique URLs)`);

// Ensure no private/noindex pages are in sitemap
const forbiddenInSitemap = ['/admin', '/account', '/dashboard', '/settings', '/downloads', '/favorites', '/history'];
let forbiddenFound = false;
forbiddenInSitemap.forEach((route) => {
  if (sitemapUrls.some((u) => u.endsWith(route))) {
    forbiddenFound = true;
    assert(false, `Private page "${route}" found in sitemap!`);
  }
});
if (!forbiddenFound) {
  assert(true, 'No private or non-indexable user routes found in sitemap');
}

// Ensure all individual tools are in sitemap with trailing slash
let allToolsInSitemap = true;
toolsList.forEach((tool) => {
  const canonicalUrl = `${BASE_URL}/tools/${tool.slug || tool.id}/`;
  if (!uniqueSitemapUrls.has(canonicalUrl)) {
    allToolsInSitemap = false;
    console.warn(`  ⚠️ Missing tool from sitemap: ${canonicalUrl}`);
  }
});
assert(allToolsInSitemap, `All ${toolsList.length} individual tool canonical URLs (with trailing slash) are present in sitemap`);

// Check that all sitemap URLs start with https://miftahtools.com/ and end with /
const allHttps = sitemapUrls.every((u) => u.startsWith('https://miftahtools.com/'));
assert(allHttps, 'All sitemap URLs use HTTPS and canonical domain https://miftahtools.com/');

const allTrailingSlash = sitemapUrls.every((u) => u.endsWith('/'));
assert(allTrailingSlash, 'All sitemap URLs end with trailing slash to prevent HTTP 308 redirects');

// Summary
console.log('\n========================================');
console.log(`📊 SEO Validation Results:`);
console.log(`   Total Checks Run: ${totalChecks}`);
console.log(`   Passed: ${passedChecks}`);
console.log(`   Failed: ${failedChecks}`);
console.log('========================================\n');

if (failedChecks > 0) {
  console.error('❌ SEO Validation Failed! Please fix the errors above.');
  process.exit(1);
} else {
  console.log('🎉 ALL SEO VALIDATION CHECKS PASSED! Production Ready.');
  process.exit(0);
}
