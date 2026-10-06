'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  PageBreak,
  ImageRun,
  Header,
  Footer,
  PageNumber,
} from 'docx';
import {
  DocumentModel,
  PAPER_DIMENSIONS,
  MARGIN_VALUES,
} from './document-types';

/**
 * Clean and sanitize filename for safe filesystem export
 */
export function getSafeFileName(title: string, extension: string): string {
  const base = (title || 'document')
    .replace(/[\\/:*?"<>|\r\n]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 80)
    .trim();
  const safe = base || 'document';
  return safe.endsWith(`.${extension}`) ? safe : `${safe}.${extension}`;
}

/**
 * High-Fidelity Client-Side Multi-Page PDF Exporter
 * Renders pages with exact A4/Letter dimensions, headers, footers, and page numbers.
 */
export async function exportDocumentToPdf(
  docModel: DocumentModel,
  onProgress?: (percent: number, status: string) => void
): Promise<Blob> {
  onProgress?.(10, 'Initializing PDF rendering engine...');

  const { settings, isRTL, fontFamily, fontSize, lineSpacing, contentHtml, title } = docModel;
  const paper = PAPER_DIMENSIONS[settings.paperSize] || PAPER_DIMENSIONS.a4;
  const dim = settings.orientation === 'landscape' ? paper.landscape : paper.portrait;
  const marginConfig = MARGIN_VALUES[settings.marginPreset] || MARGIN_VALUES.normal;

  // 1. Create off-screen rendering container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = `${dim.widthPx}px`;
  container.style.zIndex = '-1000';
  container.style.boxSizing = 'border-box';
  container.style.fontFamily = fontFamily;
  container.style.fontSize = fontSize;
  container.style.lineHeight = lineSpacing;
  container.style.color = '#0f172a';
  container.dir = isRTL ? 'rtl' : 'ltr';

  // Parse HTML into pages based on manual page-break or content height
  const tempHost = document.createElement('div');
  tempHost.innerHTML = contentHtml || '<p>Empty Document</p>';

  // Check if content has explicit page break markers
  const rawHtmlPages = contentHtml.split(/<div[^>]*class="[^"]*page-break[^"]*"[^>]*><\/div>|<hr[^>]*class="[^"]*page-break[^"]*"[^>]*\/?>/gi);

  const pagesToRender: string[] = rawHtmlPages.length > 1
    ? rawHtmlPages
    : [contentHtml || '<p>Empty Document</p>'];

  document.body.appendChild(container);

  const pdf = new jsPDF({
    orientation: settings.orientation,
    unit: 'mm',
    format: settings.paperSize,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  try {
    const totalPages = pagesToRender.length;

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      const pageNum = pageIdx + 1;
      const basePct = 15 + Math.round((pageIdx / totalPages) * 75);
      onProgress?.(basePct, `Rendering page ${pageNum} of ${totalPages}...`);

      container.innerHTML = '';

      const pageEl = document.createElement('div');
      pageEl.style.width = `${dim.widthPx}px`;
      pageEl.style.minHeight = `${dim.heightPx}px`;
      pageEl.style.backgroundColor = settings.pageBgColor || '#ffffff';
      pageEl.style.padding = marginConfig.css;
      pageEl.style.boxSizing = 'border-box';
      pageEl.style.display = 'flex';
      pageEl.style.flexDirection = 'column';
      pageEl.style.justifyContent = 'space-between';
      pageEl.style.position = 'relative';

      // Header
      let headerHtml = '';
      if (settings.includeHeaderFooter) {
        headerHtml = `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px; font-size: 10px; color: #64748b; font-family: ${fontFamily};" dir="${isRTL ? 'rtl' : 'ltr'}">
            <span>${settings.headerText || title || 'Document'}</span>
            <span>Miftah Tools &bull; miftahtools.com</span>
          </div>
        `;
      }

      // Footer
      let footerHtml = '';
      if (settings.includeHeaderFooter) {
        let pageNumText = `Page ${pageNum} of ${totalPages}`;
        if (settings.pageNumberPosition === 'none') {
          pageNumText = '';
        }

        footerHtml = `
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 24px; font-size: 9px; color: #94a3b8; font-family: ${fontFamily};" dir="${isRTL ? 'rtl' : 'ltr'}">
            <span>${settings.footerText || new Date().toLocaleDateString()}</span>
            <span>${pageNumText}</span>
          </div>
        `;
      }

      const bodyHtml = `
        <div class="miftah-doc-body" style="flex: 1; font-family: ${fontFamily}; font-size: ${fontSize}; line-height: ${lineSpacing}; word-break: break-word;" dir="${isRTL ? 'rtl' : 'ltr'}">
          ${pagesToRender[pageIdx]}
        </div>
      `;

      pageEl.innerHTML = `${headerHtml}${bodyHtml}${footerHtml}`;
      container.appendChild(pageEl);

      // Render page element to high-res canvas
      const canvas = await html2canvas(pageEl, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: settings.pageBgColor || '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (pageIdx > 0) {
        pdf.addPage(settings.paperSize, settings.orientation);
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }

    onProgress?.(95, 'Finalizing PDF document...');
    const pdfBlob = pdf.output('blob');
    onProgress?.(100, 'PDF export complete!');
    return pdfBlob;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * High-Fidelity Client-Side Microsoft Word (.docx) Exporter
 * Converts document model, formatting, tables, lists, and images to real DOCX.
 */
export async function exportDocumentToDocx(
  docModel: DocumentModel,
  onProgress?: (percent: number, status: string) => void
): Promise<Blob> {
  onProgress?.(15, 'Structuring Word document schema...');

  const { title, contentHtml, isRTL, settings } = docModel;
  const docElements: (Paragraph | Table)[] = [];

  // Parse inline child nodes into TextRuns
  const parseInlineChildren = (element: Node): (TextRun | ImageRun)[] => {
    const runs: (TextRun | ImageRun)[] = [];

    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || '';
        if (text) {
          runs.push(
            new TextRun({
              text,
              size: 24, // 12pt
              rightToLeft: isRTL,
            })
          );
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const text = el.innerText || el.textContent || '';

        const isBold = tag === 'b' || tag === 'strong' || el.style.fontWeight === 'bold' || parseInt(el.style.fontWeight || '400') >= 600;
        const isItalic = tag === 'i' || tag === 'em' || el.style.fontStyle === 'italic';
        const isUnderline = tag === 'u' || el.style.textDecoration.includes('underline');
        const isStrike = tag === 's' || tag === 'strike' || el.style.textDecoration.includes('line-through');

        // Extract color if present
        let hexColor: string | undefined = undefined;
        if (el.style.color && el.style.color.startsWith('#')) {
          hexColor = el.style.color.replace('#', '');
        }

        if (tag === 'a') {
          runs.push(
            new TextRun({
              text: text || el.getAttribute('href') || '',
              underline: {},
              color: '0284C7',
              size: 24,
              rightToLeft: isRTL,
            })
          );
        } else if (text) {
          runs.push(
            new TextRun({
              text,
              bold: isBold,
              italics: isItalic,
              underline: isUnderline ? {} : undefined,
              strike: isStrike,
              color: hexColor,
              size: 24,
              rightToLeft: isRTL,
            })
          );
        }
      }
    });

    return runs;
  };

  const tempHost = document.createElement('div');
  tempHost.innerHTML = contentHtml || '<p>Empty Document</p>';

  const nodes = Array.from(tempHost.childNodes);
  const totalNodes = nodes.length;

  for (let i = 0; i < totalNodes; i++) {
    const node = nodes[i];
    const pct = 20 + Math.round((i / Math.max(1, totalNodes)) * 70);
    onProgress?.(pct, `Converting element ${i + 1} of ${totalNodes}...`);

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      // Page break check
      if (el.classList.contains('page-break') || tag === 'hr' && el.classList.contains('page-break')) {
        docElements.push(new Paragraph({ children: [new PageBreak()] }));
        continue;
      }

      if (tag === 'h1') {
        docElements.push(
          new Paragraph({
            text: el.innerText || el.textContent || '',
            heading: HeadingLevel.HEADING_1,
            alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
            bidirectional: isRTL,
            spacing: { before: 240, after: 120 },
          })
        );
      } else if (tag === 'h2') {
        docElements.push(
          new Paragraph({
            text: el.innerText || el.textContent || '',
            heading: HeadingLevel.HEADING_2,
            alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
            bidirectional: isRTL,
            spacing: { before: 200, after: 100 },
          })
        );
      } else if (tag === 'h3') {
        docElements.push(
          new Paragraph({
            text: el.innerText || el.textContent || '',
            heading: HeadingLevel.HEADING_3,
            alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
            bidirectional: isRTL,
            spacing: { before: 160, after: 80 },
          })
        );
      } else if (tag === 'hr') {
        docElements.push(
          new Paragraph({
            border: {
              bottom: {
                color: 'cbd5e1',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { before: 120, after: 120 },
          })
        );
      } else if (tag === 'ul' || tag === 'ol') {
        const listItems = Array.from(el.querySelectorAll('li'));
        listItems.forEach((li) => {
          docElements.push(
            new Paragraph({
              children: parseInlineChildren(li),
              bullet: tag === 'ul' ? { level: 0 } : undefined,
              alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
              bidirectional: isRTL,
              spacing: { after: 80 },
            })
          );
        });
      } else if (tag === 'table') {
        const rows = Array.from(el.querySelectorAll('tr')).map((tr) => {
          const cells = Array.from(tr.querySelectorAll('th, td')).map((cell) => {
            const isHeader = cell.tagName.toLowerCase() === 'th';
            return new TableCell({
              children: [
                new Paragraph({
                  children: parseInlineChildren(cell),
                  alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
                  bidirectional: isRTL,
                }),
              ],
              shading: isHeader ? { fill: 'f1f5f9' } : undefined,
              width: { size: 100 / Math.max(1, tr.children.length), type: WidthType.PERCENTAGE },
            });
          });
          return new TableRow({ children: cells });
        });

        if (rows.length > 0) {
          docElements.push(
            new Table({
              rows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          );
        }
      } else if (tag === 'blockquote') {
        docElements.push(
          new Paragraph({
            children: parseInlineChildren(el),
            alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
            bidirectional: isRTL,
            indent: { left: 720 },
            spacing: { before: 120, after: 120 },
          })
        );
      } else {
        const runs = parseInlineChildren(el);
        docElements.push(
          new Paragraph({
            children: runs.length > 0 ? runs : [new TextRun({ text: el.innerText || '', size: 24, rightToLeft: isRTL })],
            alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
            bidirectional: isRTL,
            spacing: { after: 140 },
          })
        );
      }
    }
  }

  onProgress?.(92, 'Packaging Microsoft Word .docx file...');

  const doc = new Document({
    title: title || 'Document',
    description: 'Generated with Miftah Tools Document Studio',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: settings.includeHeaderFooter && (settings.headerText || title) ? {
          default: new Header({
            children: [
              new Paragraph({
                text: settings.headerText || title,
                alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
              }),
            ],
          }),
        } : undefined,
        footers: settings.includeHeaderFooter ? {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun(settings.footerText || 'Miftah Tools • '),
                  new TextRun('Page '),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        } : undefined,
        children: docElements.length > 0 ? docElements : [new Paragraph({ text: 'Miftah Tools Document' })],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  onProgress?.(100, 'Word .docx export complete!');
  return blob;
}

/**
 * Direct Print or System Vector PDF Generator
 */
export function printDocumentNative(docModel: DocumentModel): void {
  const { contentHtml, title, isRTL, fontFamily, fontSize, lineSpacing, settings } = docModel;

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    window.print();
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${isRTL ? 'ur' : 'en'}">
      <head>
        <title>${title || 'Miftah Tools Document'}</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: ${settings.paperSize} ${settings.orientation};
            margin: ${MARGIN_VALUES[settings.marginPreset].css};
          }
          body {
            font-family: ${fontFamily};
            font-size: ${fontSize};
            line-height: ${lineSpacing};
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 14px 0;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 8px 12px;
          }
          th {
            background-color: #f1f5f9;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          @media print {
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        ${settings.includeHeaderFooter && (settings.headerText || title) ? `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px; font-size: 10px; color: #64748b;">
            <span>${settings.headerText || title}</span>
            <span>Miftah Tools &bull; miftahtools.com</span>
          </div>
        ` : ''}

        ${contentHtml}

        ${settings.includeHeaderFooter ? `
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 30px; font-size: 9px; color: #94a3b8;">
            <span>${settings.footerText || new Date().toLocaleDateString()}</span>
            <span>Printed via Miftah Tools</span>
          </div>
        ` : ''}

        <script>
          window.onload = function() {
            window.focus();
            window.print();
            setTimeout(function() { window.close(); }, 1000);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
