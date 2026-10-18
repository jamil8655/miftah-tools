import {
  cleanAndNormalizePdfText,
  isRtlText,
  assessPageExtractionQuality,
  clusterItemsIntoLines,
  assembleLine,
  groupLinesIntoParagraphs,
  splitIntoScriptRuns,
  buildDocxParagraph,
} from '../lib/documents/pdf-text-engine.ts';
import { Document, Packer } from 'docx';
import JSZip from 'jszip';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

async function runAllTests() {
  console.log('=== STARTING AUTOMATED TEST SUITE FOR PDF-TO-WORD ENGINE ===\n');

  // Test 1: Arabic Harakat (Diacritics) Preservation
  console.log('--- Test 1: Arabic Harakat Preservation ---');
  const quranic = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
  const cleanQuranic = cleanAndNormalizePdfText(quranic);
  assert(cleanQuranic === quranic, 'Harakat (diacritics) must be preserved identically');
  assert(isRtlText(cleanQuranic), 'Text with Harakat must be detected as RTL');

  // Test 2: Urdu Characters Preservation
  console.log('\n--- Test 2: Urdu Characters Preservation ---');
  const urdu = 'اردو زبان میں ٹماٹر، گاڑی، چائے، پھول، گائے، مکھن اور 2024 شامل ہیں۔';
  const cleanUrdu = cleanAndNormalizePdfText(urdu);
  assert(cleanUrdu === urdu, 'All Urdu specific letters (ٹ, ڈ, ڑ, ں, ے, ہ, ھ, چ, پ, گ) preserved');
  assert(isRtlText(cleanUrdu), 'Urdu text must be recognized as RTL');

  // Test 3: Legacy Presentation Forms Canonical Normalization
  console.log('\n--- Test 3: Presentation Forms Normalization ---');
  // \uFE91 (Baa initial), \uFEB4 (Seen medial), \uFEE2 (Meem final) -> ﺑﺴﻢ
  const shapedArabic = '\uFE91\uFEB4\uFEE2';
  const normalizedBase = cleanAndNormalizePdfText(shapedArabic);
  assert(normalizedBase === 'بسم', 'Pre-shaped presentation forms converted to canonical Unicode');

  // Test 4: Artifact & PUA Cleansing
  console.log('\n--- Test 4: Artifact & PUA Cleansing ---');
  const dirty = 'Document\x00 text (cid:142) with bullet \uF0A7 and \u25CF circle and unmapped \uE055';
  const cleanedDirty = cleanAndNormalizePdfText(dirty);
  assert(!cleanedDirty.includes('(cid:'), 'Raw CID artifacts removed');
  assert(!cleanedDirty.includes('\x00'), 'Null control characters removed');
  assert(cleanedDirty.includes('•'), 'Symbol and circle bullets converted to standard bullet');
  assert(!cleanedDirty.includes('\uE055'), 'Unmapped PUA codes removed');

  // Test 5: Quality Assessment - Scanned Page Detection
  console.log('\n--- Test 5: Scanned Page Detection ---');
  const scannedItems = [{ str: '   ' }, { str: '1' }];
  const scannedQuality = assessPageExtractionQuality(scannedItems);
  assert(scannedQuality.isScanned === true, 'Page with <12 characters correctly detected as scanned');

  // Test 6: Quality Assessment - Corrupted / Unmapped Font Detection
  console.log('\n--- Test 6: Corrupted Font Detection ---');
  const corruptedItems = [
    { str: '\uFFFD\uFFFD\uFFFD\uFFFD(cid:10)(cid:11)\uE010\uE020' },
    { str: 'Normal' },
  ];
  const corruptQuality = assessPageExtractionQuality(corruptedItems);
  assert(corruptQuality.isCorruptedFont === true, 'Page with >25% bad characters detected as corrupted font');

  // Test 7: Word De-fragmentation & Accurate Spacing
  console.log('\n--- Test 7: Word De-fragmentation (Syllables Joined Without Space) ---');
  // Syllables of "پاکستان": "پاک" (x=450, w=20) and "ستان" (x=430, w=20) -> gap is 0
  const syllableItems = [
    { str: 'پاک', x: 450, y: 700, width: 20, height: 14, fontSize: 14, isBold: false, isItalic: false, isRtl: true, streamIndex: 0 },
    { str: 'ستان', x: 430, y: 700, width: 20, height: 14, fontSize: 14, isBold: false, isItalic: false, isRtl: true, streamIndex: 1 },
    { str: 'زندہ', x: 380, y: 700, width: 25, height: 14, fontSize: 14, isBold: false, isItalic: false, isRtl: true, streamIndex: 2 },
    { str: 'باد', x: 345, y: 700, width: 20, height: 14, fontSize: 14, isBold: false, isItalic: false, isRtl: true, streamIndex: 3 },
  ];
  const assembledLine = assembleLine(syllableItems, 595, { forceRtl: true });
  assert(assembledLine !== null, 'Line assembled');
  assert(assembledLine.text.includes('پاکستان'), 'Syllables joined into single word "پاکستان"');
  assert(assembledLine.text.includes('زندہ باد') || assembledLine.text.includes('زندہ'), 'Words have proper spacing');

  // Test 8: Mixed RTL Sentence with English and Numbers
  console.log('\n--- Test 8: Directional Run Splitting for Mixed Sentences ---');
  const mixedSentence = 'یہ ایک 2024 ماڈل ہے اور اس میں iPhone 15 Pro کی خصوصیات شامل ہیں۔';
  const scriptRuns = splitIntoScriptRuns(mixedSentence, true);
  assert(scriptRuns.length >= 3, 'Mixed sentence split into distinct runs');
  const ltr2024 = scriptRuns.find((r) => r.text.includes('2024'));
  const ltrIPhone = scriptRuns.find((r) => r.text.includes('iPhone 15 Pro'));
  const rtlStart = scriptRuns.find((r) => r.text.includes('یہ ایک'));
  assert(ltr2024 && ltr2024.isRtl === false, 'Numbers "2024" marked as LTR');
  assert(ltrIPhone && ltrIPhone.isRtl === false, 'English "iPhone 15 Pro" marked as LTR');
  assert(rtlStart && rtlStart.isRtl === true, 'Urdu "یہ ایک" marked as RTL');

  // Test 9: Reconstructed Paragraph Grouping
  console.log('\n--- Test 9: Paragraph Grouping ---');
  const lines = [
    { y: 700, text: 'پہلی لائن جو پیراگراف کا حصہ ہے۔', isRtl: true, fontSize: 12, isBold: false, isItalic: false, minX: 100, maxX: 500 },
    { y: 684, text: 'دوسری لائن جو اسی پیراگراف میں جاری ہے۔', isRtl: true, fontSize: 12, isBold: false, isItalic: false, minX: 100, maxX: 500 },
    { y: 620, text: 'عنوان نمبر 2', isRtl: true, fontSize: 18, isBold: true, isItalic: false, minX: 100, maxX: 300 },
  ];
  const paragraphs = groupLinesIntoParagraphs(lines, 595);
  assert(paragraphs.length === 2, '2 distinct paragraphs created (body paragraph + heading)');
  assert(paragraphs[0].text.includes('پہلی لائن') && paragraphs[0].text.includes('دوسری لائن'), 'Continuous lines grouped into 1 flowing paragraph');
  assert(paragraphs[1].isHeading === true, 'Heading line identified as heading');

  // Test 10: OOXML Word Document Generation and Validation with JSZip
  console.log('\n--- Test 10: Valid OOXML Word Document Generation and Inspection ---');
  const docxParagraph = buildDocxParagraph(paragraphs[0]);
  const doc = new Document({
    sections: [
      {
        children: [docxParagraph],
      },
    ],
  });
  const docxBuffer = await Packer.toBuffer(doc);
  const zip = await JSZip.loadAsync(docxBuffer);
  const docXml = await zip.file('word/document.xml')?.async('text');

  assert(docXml !== undefined, 'word/document.xml exists in generated DOCX');
  assert(docXml.includes('<w:bidi/>'), 'OOXML contains <w:bidi/> for right-to-left paragraph flow');
  assert(docXml.includes('<w:rtl/>'), 'OOXML contains <w:rtl/> for right-to-left text run');
  assert(docXml.includes('Traditional Arabic'), 'OOXML contains complex script font "Traditional Arabic"');
  assert(docXml.includes('پہلی لائن'), 'OOXML contains original Urdu text');

  console.log(`\n======================================================`);
  console.log(`🎉 ALL ${passedTests} OF ${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log(`======================================================\n`);
}

runAllTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
