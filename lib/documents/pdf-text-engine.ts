import {
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';

export interface RawPdfItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isRtl: boolean;
  streamIndex: number;
}

export interface PageQualityMetrics {
  totalChars: number;
  meaningfulChars: number;
  rtlChars: number;
  replacementCount: number;
  cidCount: number;
  puaCount: number;
  isScanned: boolean;
  isCorruptedFont: boolean;
  isPredominantlyRtl: boolean;
}

export interface ReconstructedLine {
  y: number;
  text: string;
  isRtl: boolean;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  minX: number;
  maxX: number;
}

export interface ReconstructedParagraph {
  text: string;
  isRtl: boolean;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isHeading: boolean;
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType];
}

/**
 * Normalizes Unicode text, decomposes Arabic/Urdu presentation forms to base characters,
 * removes unprintable/null controls, strips unmapped Private Use Area (PUA) bullet codes,
 * and converts geometric circle/square markers into clean bullets.
 * PRESERVES all valid Arabic/Urdu letters, combining marks (harakat), punctuation, and ZWNJ.
 */
export function cleanAndNormalizePdfText(
  str: string,
  options?: { normalizeArabic?: boolean }
): string {
  if (!str) return '';

  // 1. Convert Unicode Presentation Forms (Arabic/Urdu pre-shaped glyphs) to base connected Unicode
  // NFKC decomposes presentation forms (U+FB50-U+FDFF, U+FE70-U+FEFF) into natural Arabic/Urdu
  // while strictly preserving base letters, diacritics (harakat), and numerals.
  let cleaned = options?.normalizeArabic !== false ? str.normalize('NFKC') : str;

  // 2. Strip non-printable ASCII control characters (nulls, escapes, bells)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 3. Remove raw CID font artifact patterns like "(cid:123)"
  cleaned = cleaned.replace(/\(cid:\d+\)/g, '');

  // 4. Handle Private Use Area (PUA) characters \uE000-\uF8FF, \uFFF0-\uFFFF
  // Convert common Wingdings/Symbol bullet characters to clean bullet • (\u2022)
  cleaned = cleaned.replace(/[\uF0A7\uF0B7\uF0D8\uF0E0\uF02D]/g, '•');
  // Strip unmapped PUA characters which otherwise render as empty boxes or question marks
  cleaned = cleaned.replace(/[\uE000-\uF8FF\uFFF0-\uFFFF]/g, '');

  // 5. Normalize geometric shape circles and stray boxes
  cleaned = cleaned.replace(/[\u25CF\u25CB\u25E6\u25AA\u25AB\u2023\u2043]/g, '•');

  // 6. Remove replacement character \uFFFD (rendered as )
  cleaned = cleaned.replace(/\uFFFD/g, '');

  // 7. Strip zero-width & invisible spaces, EXCEPT \u200C (ZWNJ which is required for Urdu/Persian)
  cleaned = cleaned.replace(/[\uFEFF\u200B\u200D\u2060]/g, '');

  return cleaned;
}

/**
 * Detects whether a string is predominantly Right-to-Left (Arabic, Urdu, Persian, Pashto, Hebrew).
 */
export function isRtlText(text: string): boolean {
  if (!text) return false;
  const rtlMatches = text.match(
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/g
  );
  const rtlChars = rtlMatches ? rtlMatches.length : 0;
  const meaningfulChars = text.replace(/[\s\d\p{P}\p{S}]/gu, '').length;
  if (meaningfulChars === 0) return rtlChars > 0;
  return rtlChars / meaningfulChars >= 0.25;
}

/**
 * Assesses the extraction quality of a PDF page.
 * Identifies scanned/image pages and pages with corrupted or unmapped fonts.
 */
export function assessPageExtractionQuality(rawItems: any[]): PageQualityMetrics {
  let totalChars = 0;
  let rtlChars = 0;
  let replacementCount = 0;
  let cidCount = 0;
  let puaCount = 0;

  for (const item of rawItems) {
    const s = item.str || '';
    totalChars += s.length;

    const rtl = s.match(
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/g
    );
    if (rtl) rtlChars += rtl.length;

    const repl = s.match(/\uFFFD/g);
    if (repl) replacementCount += repl.length;

    const cid = s.match(/\(cid:\d+\)/g);
    if (cid) cidCount += cid.length;

    const pua = s.match(/[\uE000-\uF8FF\uFFF0-\uFFFF]/g);
    if (pua) puaCount += pua.length;
  }

  const badCharCount = replacementCount + cidCount + puaCount;
  const meaningfulChars = rawItems
    .map((i) => (i.str || '').trim())
    .join('').length;

  const isScanned = meaningfulChars < 12;
  const isCorruptedFont = meaningfulChars >= 12 && badCharCount / Math.max(1, totalChars) > 0.25;
  const isPredominantlyRtl = rtlChars > 0 && rtlChars / Math.max(1, meaningfulChars) >= 0.2;

  return {
    totalChars,
    meaningfulChars,
    rtlChars,
    replacementCount,
    cidCount,
    puaCount,
    isScanned,
    isCorruptedFont,
    isPredominantlyRtl,
  };
}

/**
 * Clusters raw PDF text items into horizontal visual lines based on vertical baseline tolerance.
 */
export function clusterItemsIntoLines(
  items: RawPdfItem[],
  options?: { forceRtl?: boolean | 'auto' }
): { y: number; items: RawPdfItem[] }[] {
  const lines: { y: number; items: RawPdfItem[] }[] = [];

  for (const it of items) {
    const tolerance = Math.max(3.0, it.fontSize * 0.38);
    const existingLine = lines.find((l) => Math.abs(l.y - it.y) <= tolerance);
    if (existingLine) {
      existingLine.items.push(it);
      existingLine.y =
        (existingLine.y * (existingLine.items.length - 1) + it.y) /
        existingLine.items.length;
    } else {
      lines.push({ y: it.y, items: [it] });
    }
  }

  // Sort lines from top of the page down to bottom (PDF Y=0 is at bottom)
  lines.sort((a, b) => b.y - a.y);
  return lines;
}

/**
 * Intelligently assembles items on a single line.
 * Preserves logical order, prevents syllable fragmentation in Urdu/Arabic/English words,
 * and ensures numbers and Latin words in RTL lines remain in correct LTR reading order.
 */
export function assembleLine(
  lineItems: RawPdfItem[],
  pageWidth: number,
  options?: { forceRtl?: boolean | 'auto' }
): ReconstructedLine | null {
  if (!lineItems || lineItems.length === 0) return null;

  const combinedRaw = lineItems.map((i) => i.str).join(' ').trim();
  if (!combinedRaw) return null;

  const isLineRtl =
    options?.forceRtl === true
      ? true
      : options?.forceRtl === false
      ? false
      : isRtlText(combinedRaw);

  // Sort items on the line:
  // For LTR: items flow left to right (increasing X).
  // For RTL:
  // In modern PDFs, items in the content stream are in logical order.
  // However, within embedded LTR runs (numbers, English words), characters MUST flow left to right.
  let sortedItems: RawPdfItem[];

  if (!isLineRtl) {
    sortedItems = [...lineItems].sort((a, b) => a.x - b.x);
  } else {
    // Check if the stream items are in natural logical reading order:
    // In stream order, check if the items have decreasing X (emitted right-to-left)
    // or if they were emitted left-to-right.
    const firstX = lineItems[0].x;
    const lastX = lineItems[lineItems.length - 1].x;

    // Detect if items were emitted strictly in visual left-to-right order:
    // e.g. sentence-ending punctuation on the first item or monotonically increasing X
    const hasEndingPuncAtStart = /^[۔؟.!]/g.test(lineItems[0].str.trim());

    if (hasEndingPuncAtStart && firstX < lastX && lineItems.length > 1) {
      // Stream was emitted left-to-right visually; sort right-to-left
      // Group items into directional clusters so embedded LTR stays LTR
      sortedItems = sortRtlLineVisualOrder(lineItems);
    } else {
      // Standard stream order: preserve reading order, but ensure any LTR sub-clusters
      // (like numbers "2024" or Latin "iPhone") have increasing X
      sortedItems = fixEmbeddedLtrRunsInRtlStream(lineItems);
    }
  }

  // Merge items into text string with accurate word-spacing (preventing broken syllables)
  let lineText = '';
  let prevItem: RawPdfItem | null = null;

  for (let i = 0; i < sortedItems.length; i++) {
    const it = sortedItems[i];
    if (!it.str) continue;

    if (prevItem) {
      // Calculate true physical horizontal gap between the two bounding boxes
      const minA = Math.min(prevItem.x, prevItem.x + prevItem.width);
      const maxA = Math.max(prevItem.x, prevItem.x + prevItem.width);
      const minB = Math.min(it.x, it.x + it.width);
      const maxB = Math.max(it.x, it.x + it.width);

      // If they overlap or touch, gap is 0; otherwise gap is the space between intervals
      let gap = 0;
      if (minA > maxB) {
        gap = minA - maxB; // prevItem is to the right of it (RTL flow)
      } else if (minB > maxA) {
        gap = minB - maxA; // it is to the right of prevItem (LTR flow)
      }

      const spaceThreshold = Math.max(2.2, prevItem.fontSize * 0.22);
      const needsSpace =
        !prevItem.str.endsWith(' ') &&
        !it.str.startsWith(' ') &&
        gap >= spaceThreshold;

      if (needsSpace) {
        lineText += ' ';
      }
    }

    lineText += it.str;
    prevItem = it;
  }

  lineText = lineText.trim();
  if (!lineText) return null;

  const fontSizes = lineItems.map((i) => i.fontSize);
  const avgFontSize = Math.round(
    fontSizes.reduce((sum, s) => sum + s, 0) / fontSizes.length
  );
  const maxFontSize = Math.max(...fontSizes);
  const isBold = lineItems.some((i) => i.isBold);
  const isItalic = lineItems.some((i) => i.isItalic);
  const minX = Math.min(...lineItems.map((i) => i.x));
  const maxX = Math.max(...lineItems.map((i) => i.x + i.width));

  return {
    y: lineItems[0].y,
    text: lineText,
    isRtl: isLineRtl,
    fontSize: maxFontSize >= 16 ? maxFontSize : avgFontSize,
    isBold,
    isItalic,
    minX,
    maxX,
  };
}

/**
 * Sorts an RTL line that was emitted in visual left-to-right order,
 * while strictly guaranteeing that Latin words and numbers stay left-to-right.
 */
function sortRtlLineVisualOrder(items: RawPdfItem[]): RawPdfItem[] {
  // Cluster items into contiguous directional chunks
  const clusters: { isLtr: boolean; items: RawPdfItem[] }[] = [];
  let currentCluster: { isLtr: boolean; items: RawPdfItem[] } | null = null;

  for (const it of items) {
    const isLtrItem = /[A-Za-z0-9]/.test(it.str) && !isRtlText(it.str);
    if (!currentCluster || currentCluster.isLtr !== isLtrItem) {
      currentCluster = { isLtr: isLtrItem, items: [it] };
      clusters.push(currentCluster);
    } else {
      currentCluster.items.push(it);
    }
  }

  // Within each LTR cluster (e.g. English words, numbers), sort increasing X
  for (const c of clusters) {
    if (c.isLtr) {
      c.items.sort((a, b) => a.x - b.x);
    }
  }

  // Reverse cluster order for RTL reading (from highest X to lowest X)
  clusters.sort((a, b) => {
    const avgXA = a.items.reduce((sum, i) => sum + i.x, 0) / a.items.length;
    const avgXB = b.items.reduce((sum, i) => sum + i.x, 0) / b.items.length;
    return avgXB - avgXA;
  });

  return clusters.flatMap((c) => c.items);
}

/**
 * In an RTL line in natural stream order, ensures any fragmented LTR items
 * (such as individual digits in '2024' or letters in English words) are ordered left-to-right.
 */
function fixEmbeddedLtrRunsInRtlStream(items: RawPdfItem[]): RawPdfItem[] {
  const result: RawPdfItem[] = [...items];
  let startIdx = -1;

  for (let i = 0; i <= result.length; i++) {
    const it = i < result.length ? result[i] : null;
    const isLtrItem = it && /[A-Za-z0-9]/.test(it.str) && !isRtlText(it.str);

    if (isLtrItem) {
      if (startIdx === -1) startIdx = i;
    } else {
      if (startIdx !== -1 && i - startIdx > 1) {
        // Sort the sub-slice [startIdx, i) by X ascending
        const slice = result.slice(startIdx, i);
        slice.sort((a, b) => a.x - b.x);
        for (let j = 0; j < slice.length; j++) {
          result[startIdx + j] = slice[j];
        }
      }
      startIdx = -1;
    }
  }

  return result;
}

/**
 * Groups consecutive visual lines into cohesive paragraphs.
 * Detects headings, alignment changes, and vertical line gaps.
 */
export function groupLinesIntoParagraphs(
  lines: ReconstructedLine[],
  pageWidth: number
): ReconstructedParagraph[] {
  if (!lines || lines.length === 0) return [];

  const paragraphs: ReconstructedParagraph[] = [];
  let currentGroup: ReconstructedLine[] = [];

  const flushGroup = () => {
    if (currentGroup.length === 0) return;

    const firstLine = currentGroup[0];
    const isRtl = firstLine.isRtl;
    const fullText = currentGroup.map((l) => l.text).join(' ');

    const minX = Math.min(...currentGroup.map((l) => l.minX));
    const maxX = Math.max(...currentGroup.map((l) => l.maxX));
    const lineWidth = maxX - minX;
    const lineCenter = minX + lineWidth / 2;
    const pageCenter = pageWidth / 2;
    const isCentered =
      !isRtl &&
      Math.abs(lineCenter - pageCenter) < 45 &&
      lineWidth < pageWidth * 0.75;

    const maxFontSize = Math.max(...currentGroup.map((l) => l.fontSize));
    const isHeading =
      currentGroup.length === 1 &&
      maxFontSize >= 16 &&
      fullText.length < 120;

    const alignment = isRtl
      ? AlignmentType.RIGHT
      : isCentered
      ? AlignmentType.CENTER
      : AlignmentType.LEFT;

    paragraphs.push({
      text: fullText,
      isRtl,
      fontSize: maxFontSize,
      isBold: currentGroup.some((l) => l.isBold),
      isItalic: currentGroup.some((l) => l.isItalic),
      isHeading,
      alignment,
    });

    currentGroup = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = currentGroup[currentGroup.length - 1];

    if (!prevLine) {
      currentGroup.push(line);
      continue;
    }

    // Check if line should break into a new paragraph:
    const dy = prevLine.y - line.y;
    const lineSpacingThreshold = prevLine.fontSize * 1.85;
    const isPrevHeading = prevLine.fontSize >= 16 && prevLine.text.length < 120;
    const isCurrHeading = line.fontSize >= 16 && line.text.length < 120;
    const directionChanged = prevLine.isRtl !== line.isRtl;

    if (
      dy > lineSpacingThreshold ||
      isPrevHeading ||
      isCurrHeading ||
      directionChanged
    ) {
      flushGroup();
      currentGroup.push(line);
    } else {
      currentGroup.push(line);
    }
  }

  flushGroup();
  return paragraphs;
}

/**
 * Splits paragraph text into directional script runs (RTL Arabic/Urdu vs LTR Latin/Numbers)
 * to ensure Microsoft Word renders mixed sentences cleanly and without inverted text.
 */
export function splitIntoScriptRuns(
  paragraphText: string,
  paragraphIsRtl: boolean
): { text: string; isRtl: boolean }[] {
  if (!paragraphText) return [];

  const hasRtl = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/.test(
    paragraphText
  );
  if (!hasRtl) {
    return [{ text: paragraphText, isRtl: false }];
  }

  const hasLtrOrDigits = /[A-Za-z0-9]/.test(paragraphText);
  if (!hasLtrOrDigits) {
    return [{ text: paragraphText, isRtl: true }];
  }

  const tokens: { text: string; isRtl: boolean }[] = [];
  const ltrRegex = /([A-Za-z0-9]+(?:[\s_./\-@#&+][A-Za-z0-9]+)*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = ltrRegex.exec(paragraphText)) !== null) {
    if (match.index > lastIndex) {
      const rtlChunk = paragraphText.slice(lastIndex, match.index);
      if (rtlChunk) {
        tokens.push({ text: rtlChunk, isRtl: true });
      }
    }
    tokens.push({ text: match[1], isRtl: false });
    lastIndex = ltrRegex.lastIndex;
  }

  if (lastIndex < paragraphText.length) {
    const trailing = paragraphText.slice(lastIndex);
    if (trailing) {
      tokens.push({ text: trailing, isRtl: true });
    }
  }

  return tokens;
}

/**
 * Creates a production-grade OOXML Paragraph object from a ReconstructedParagraph.
 * Sets <w:bidi/>, <w:rtl/>, complex-script font families, and correct spacing.
 */
export function buildDocxParagraph(p: ReconstructedParagraph): Paragraph {
  const scriptRuns = splitIntoScriptRuns(p.text, p.isRtl);
  const halfPointsSize = Math.max(16, Math.min(144, p.fontSize * 2));

  const textRuns = scriptRuns.map(
    (r) =>
      new TextRun({
        text: r.text,
        bold: p.isBold,
        italics: p.isItalic,
        size: halfPointsSize,
        rightToLeft: r.isRtl,
        font: r.isRtl
          ? {
              name: 'Traditional Arabic',
              cs: 'Traditional Arabic',
              ascii: 'Calibri',
              hAnsi: 'Calibri',
            }
          : {
              name: 'Calibri',
              ascii: 'Calibri',
              hAnsi: 'Calibri',
              cs: 'Traditional Arabic',
            },
      })
  );

  return new Paragraph({
    children: textRuns,
    bidirectional: p.isRtl,
    alignment: p.alignment,
    spacing: {
      before: p.isHeading ? 160 : 36,
      after: p.isHeading ? 80 : 36,
      line: 276,
    },
    heading: p.isHeading
      ? p.fontSize >= 22
        ? HeadingLevel.HEADING_1
        : HeadingLevel.HEADING_2
      : undefined,
  });
}
