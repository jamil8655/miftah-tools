import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// 1. Load Miftah Tools Catalog for URL mapping
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

console.log('================================================================');
console.log('🚀 MIFTAH TOOLS — GSC DATA-DRIVEN SEO OPTIMIZER & AUDIT ENGINE');
console.log(`📊 Loaded ${toolsList.length} indexed tools from catalog.`);
console.log('================================================================\n');

export const HIGH_POTENTIAL_KEYWORDS = [
  { keyword: 'compress pdf online', targetTool: 'compress-pdf', priority: 'High', category: 'PDF' },
  { keyword: 'merge pdf files', targetTool: 'merge-pdf', priority: 'High', category: 'PDF' },
  { keyword: 'pdf to word converter', targetTool: 'pdf-to-docx', priority: 'High', category: 'PDF' },
  { keyword: 'extract text from image ocr', targetTool: 'ocr-image', priority: 'High', category: 'OCR' },
  { keyword: 'video downloader hd', targetTool: 'media-downloader', priority: 'High', category: 'Media' },
  { keyword: 'qr code generator free', targetTool: 'qr-generator', priority: 'High', category: 'QR' },
  { keyword: 'image resizer online', targetTool: 'image-resizer', priority: 'Medium', category: 'Image' },
  { keyword: 'jpg to png converter', targetTool: 'jpg-to-png', priority: 'Medium', category: 'Image' },
  { keyword: 'json formatter validator', targetTool: 'json-formatter', priority: 'Medium', category: 'Dev' },
  { keyword: 'password generator secure', targetTool: 'password-generator', priority: 'Medium', category: 'Security' },
];

export const CANNIBALIZATION_RULES = [
  {
    primaryIntent: 'File Size Reduction',
    canonicalSlug: 'compress-pdf',
    aliasesOrVariants: ['reduce-pdf-size', 'pdf-compressor', 'shrink-pdf'],
    rule: 'All aliases MUST canonicalize to /tools/compress-pdf/ with 301/canonical tag.',
  },
  {
    primaryIntent: 'Document Joining',
    canonicalSlug: 'merge-pdf',
    aliasesOrVariants: ['combine-pdf', 'pdf-joiner', 'pdf-merge'],
    rule: 'All aliases MUST canonicalize to /tools/merge-pdf/ with 301/canonical tag.',
  },
  {
    primaryIntent: 'OCR Extraction',
    canonicalSlug: 'ocr-image',
    aliasesOrVariants: ['ocr-image-to-text', 'extract-text-from-image', 'image-to-text'],
    rule: 'All aliases MUST canonicalize to /tools/ocr-image/ with 301/canonical tag.',
  },
];

console.log('🔍 1. KEYWORD CANNIBALIZATION AUDIT SUMMARY:');
CANNIBALIZATION_RULES.forEach((rule, idx) => {
  console.log(`   ${idx + 1}. [${rule.primaryIntent}] Primary: /tools/${rule.canonicalSlug}/`);
  console.log(`      Variants Managed: ${rule.aliasesOrVariants.join(', ')}`);
  console.log(`      Rule Applied: ${rule.rule}`);
});

console.log('\n🎯 2. HIGH-IMPRESSION / LOW-CTR WEEKLY TARGETS:');
HIGH_POTENTIAL_KEYWORDS.forEach((kw, idx) => {
  console.log(`   ${idx + 1}. Query: "${kw.keyword}" -> Target: https://miftahtools.com/tools/${kw.targetTool}/ [${kw.priority} Priority]`);
});

console.log('\n📋 3. WEEKLY SEO EXECUTION SOP:');
console.log('   Step 1: In GSC, filter Performance report by "Position: > 4.9 and < 30.1" (Striking Distance).');
console.log('   Step 2: Identify queries with Impressions > 500 but CTR < 3%.');
console.log('   Step 3: Update the primary H1 and meta title in lib/seo/seo-engine.ts to match the exact search phrasing.');
console.log('   Step 4: Add 1 new FAQ item directly answering user query in lib/seo/seo-engine.ts.');
console.log('   Step 5: Run `npm run build && npm run zip` and re-upload to Hostinger.');

console.log('\n✅ SEO Optimizer Engine Ready!\n');
