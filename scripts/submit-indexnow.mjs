import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const HOST = 'miftahtools.com';
const KEY = '37229930aef941b09718da7f905919a6';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// Read sitemap.xml to extract all URLs
const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  console.error('❌ sitemap.xml not found. Run generate-sitemap first.');
  process.exit(1);
}

const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const urlMatches = sitemapContent.match(/<loc>(https:\/\/[^<]+)<\/loc>/g) || [];
const urlList = Array.from(new Set(urlMatches.map((m) => m.replace(/<\/?loc>/g, ''))));

console.log(`📡 Preparing IndexNow submission for ${urlList.length} URLs...`);

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urlList,
};

async function submitIndexNow() {
  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🚀 Sending URLs to ${endpoint}...`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      console.log(`   Response status: ${response.status} ${response.statusText}`);
      if (response.status === 200 || response.status === 202) {
        console.log(`✅ Successfully submitted ${urlList.length} URLs to ${endpoint}!`);
      } else {
        const text = await response.text();
        console.log(`⚠️ Endpoint response: ${text}`);
      }
    } catch (err) {
      console.error(`❌ Error submitting to ${endpoint}:`, err.message);
    }
  }
}

submitIndexNow();
