'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Layers,
  Upload,
  Download,
  Trash2,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Copy,
  ArrowUpDown,
  Plus,
  FilePlus2,
  FileCheck,
  CheckSquare,
  Square,
  Replace,
  X as CrossIcon,
  Scissors,
  Split,
  Eye,
  Undo2,
  Filter,
  FileText,
  Archive,
  ZoomIn,
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import JSZip from 'jszip';
import { getPdfJsLib } from '@/lib/utils/formatters';
import { downloadSingleFile } from '@/lib/utils/download';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { useI18n } from '@/lib/i18n/i18n-context';

export interface PageItem {
  id: string;
  pageIndex: number; // 0-based index in original source PDF (or -1 for blank)
  sourceDocIndex: number; // 0 for main file, 1+ for replaced/inserted docs
  dataUrl: string;
  rotation: number; // 0, 90, 180, 270
  selected?: boolean;
}

export type SplitOrganizerMode = 'extract' | 'delete' | 'split-all' | 'organize';

interface PdfOrganizerStudioProps {
  initialMode?: SplitOrganizerMode;
}

const LOCALES = {
  en: {
    badge: 'Visual PDF Split, Delete & Page Extraction Studio',
    title: 'Visual PDF Splitter & Page Manager',
    sub: 'Visually view all pages of your PDF. Delete unwanted pages with a single click (❌), select specific pages (e.g. 5, 8, 9, 15, 20) to extract into a new PDF, or split all pages into separate files.',
    uploadTitle: 'Click or Drag & Drop PDF Document Here',
    uploadSub: 'All pages rendered locally in browser • 100% private & secure',
    changeFile: 'Change PDF File',
    modes: {
      extract: 'Extract Selected Pages',
      delete: 'Delete Unwanted Pages',
      splitAll: 'Split into Individual Pages',
      organize: 'Reorder & Rotate',
    },
    quickSelectLabel: 'Quick Select by Numbers / Ranges:',
    quickSelectPlaceholder: 'e.g. 5, 8, 9, 15, 20, 50 or 1-4, 8, 12-15...',
    applyQuickSelect: 'Select Pages',
    clearSelect: 'Deselect All',
    selectAll: 'Select All',
    selectOdd: 'Odd Pages (1, 3, 5...)',
    selectEven: 'Even Pages (2, 4, 6...)',
    invertSelect: 'Invert Selection',
    deletePageHint: 'Click the red ❌ icon on any page to instantly delete it.',
    undoDelete: 'Undo Delete',
    restoreAll: 'Restore All Deleted',
    exportExtractBtn: (count: number) => `Extract & Download ${count} Selected Pages (PDF)`,
    exportDeleteBtn: (count: number) => `Download PDF with Deleted Pages Removed (${count} Left)`,
    exportSplitAllBtn: (count: number) => `Split All ${count} Pages into Separate PDFs (ZIP)`,
    exportOrganizeBtn: (count: number) => `Save & Export Organized PDF (${count} Pages)`,
    processing: 'Processing PDF Pages...',
    renderingThumbnail: (curr: number, total: number) => `Rendering thumbnail ${curr} of ${total}...`,
    pageLabel: (num: number, total: number) => `Page ${num} of ${total}`,
    origPage: (num: number) => `Orig #${num}`,
    previewModalTitle: 'Page Preview',
    closePreview: 'Close Preview',
    reverseAll: 'Reverse Order',
    rotateAll: 'Rotate All 90°',
    insertBlank: 'Add Blank Page',
    selectedPagesCount: (count: number, total: number) => `${count} of ${total} pages selected`,
    noPagesSelectedNotice: 'Please click or select at least 1 page to extract.',
    deletedPagesCount: (count: number) => `${count} page(s) removed`,
  },
  ur: {
    badge: 'بصری پی ڈی ایف اسپلٹ، ڈیلیٹ و پیج ایکسٹریکشن اسٹوڈیو',
    title: 'پی ڈی ایف اسپلٹر اور پیجز مینیجر',
    sub: 'تمام صفحات کو براہ راست دیکھیں۔ ناپسندیدہ صفحات کو فوری ❌ سے حذف کریں، مخصوص صفحات (مثلاً 5، 8، 9، 15، 20) نکال کر الگ پی ڈی ایف بنائیں، یا تمام صفحات کو الگ الگ فائلوں میں تقسیم کریں۔',
    uploadTitle: 'پی ڈی ایف فائل یہاں ڈراپ کریں یا منتخب کریں',
    uploadSub: 'تمام صفحات کا لائیو پریویو • 100% محفوظ و آف لائن',
    changeFile: 'پی ڈی ایف تبدیل کریں',
    modes: {
      extract: 'مخصوص صفحات نکالیں (Extract)',
      delete: 'صفحات حذف کریں (Delete)',
      splitAll: 'تمام صفحات الگ الگ کریں (Split All)',
      organize: 'ترتیب و گھماؤ (Organize)',
    },
    quickSelectLabel: 'صفحات نمبر یا رینج کے ذریعے منتخب کریں:',
    quickSelectPlaceholder: 'مثلاً 5, 8, 9, 15, 20, 50 یا 1-4, 8...',
    applyQuickSelect: 'صفحات منتخب کریں',
    clearSelect: 'انتخاب ختم کریں',
    selectAll: 'تمام منتخب کریں',
    selectOdd: 'طاق صفحات (1، 3، 5...)',
    selectEven: 'جفت صفحات (2، 4، 6...)',
    invertSelect: 'الٹ انتخاب',
    deletePageHint: 'کسی بھی صفحے کو فوری مٹانے کے لیے اس کے سرخ ❌ بٹن پر کلک کریں۔',
    undoDelete: 'حذف واپس لیں (Undo)',
    restoreAll: 'تمام صفحات بحال کریں',
    exportExtractBtn: (count: number) => `منتخب کردہ ${count} صفحات نکالیں (PDF)`,
    exportDeleteBtn: (count: number) => `بقیہ ${count} صفحات پر مشتمل PDF ڈاؤن لوڈ کریں`,
    exportSplitAllBtn: (count: number) => `تمام ${count} صفحات کو الگ الگ فائلوں میں محفوظ کریں (ZIP)`,
    exportOrganizeBtn: (count: number) => `منظم شدہ PDF ڈاؤن لوڈ کریں (${count} صفحات)`,
    processing: 'پی ڈی ایف تیار ہو رہی ہے...',
    renderingThumbnail: (curr: number, total: number) => `صفحہ ${curr} از ${total} لوڈ ہو رہا ہے...`,
    pageLabel: (num: number, total: number) => `صفحہ ${num} از ${total}`,
    origPage: (num: number) => `اصل #${num}`,
    previewModalTitle: 'صفحے کا مکمل منظر',
    closePreview: 'بند کریں',
    reverseAll: 'ترتیب الٹ کریں (Reverse)',
    rotateAll: 'تمام 90° گھمائیں',
    insertBlank: 'خالی صفحہ شامل کریں',
    selectedPagesCount: (count: number, total: number) => `${count} از ${total} صفحات منتخب`,
    noPagesSelectedNotice: 'براہ کرم نکالنے کے لیے کم از کم 1 صفحہ منتخب کریں۔',
    deletedPagesCount: (count: number) => `${count} صفحات حذف کیے گئے`,
  },
  ar: {
    badge: 'استوديو تقسيم وحذف واستخراج صفحات PDF المرئي',
    title: 'محرر تقسيم واستخراج صفحات PDF',
    sub: 'عرض كافة الصفحات بصرياً. حذف الصفحات غير المرغوبة بنقرة واحدة (❌)، استخراج صفحات معينة (مثل 5، 8، 9، 15، 20) في ملف مستقل، أو تقسيم كافة الصفحات لملفات منفصلة.',
    uploadTitle: 'انقر أو أسقط مستند PDF هنا',
    uploadSub: 'معالجة محلية داخل المتصفح • خصوصية وأمان 100%',
    changeFile: 'تغيير المستند',
    modes: {
      extract: 'استخراج صفحات محددة',
      delete: 'حذف الصفحات غير المرغوبة',
      splitAll: 'تقسيم كل صفحة لملف منفصل',
      organize: 'إعادة الترتيب والتدوير',
    },
    quickSelectLabel: 'تحديد سريع بالأرقام أو النطاق:',
    quickSelectPlaceholder: 'مثال: 5, 8, 9, 15, 20, 50 أو 1-4, 8...',
    applyQuickSelect: 'تحديد الصفحات',
    clearSelect: 'إلغاء التحديد',
    selectAll: 'تحديد الكل',
    selectOdd: 'الصفحات الفردية (1, 3, 5...)',
    selectEven: 'الصفحات الزوجية (2, 4, 6...)',
    invertSelect: 'عكس التحديد',
    deletePageHint: 'انقر على علامة ❌ الحمراء في أي صفحة لحذفها فوراً.',
    undoDelete: 'تراجع عن الحذف',
    restoreAll: 'استعادة كافة الصفحات',
    exportExtractBtn: (count: number) => `استخراج ${count} صفحة محددة في PDF جديد`,
    exportDeleteBtn: (count: number) => `تحميل PDF بعد حذف الصفحات (${count} متبقية)`,
    exportSplitAllBtn: (count: number) => `تقسيم كافة الصفحات الـ ${count} إلى أرشيف (ZIP)`,
    exportOrganizeBtn: (count: number) => `حفظ وتصدير المستند المنظم (${count} صفحة)`,
    processing: 'جاري معالجة المستند...',
    renderingThumbnail: (curr: number, total: number) => `جاري تجهيز مصغرة ${curr} من ${total}...`,
    pageLabel: (num: number, total: number) => `صفحة ${num} من ${total}`,
    origPage: (num: number) => `الأصل #${num}`,
    previewModalTitle: 'معاينة الصفحة',
    closePreview: 'إغلاق المعاينة',
    reverseAll: 'عكس الترتيب',
    rotateAll: 'تدوير الكل 90°',
    insertBlank: 'إضافة صفحة فارغة',
    selectedPagesCount: (count: number, total: number) => `تم تحديد ${count} من أصل ${total} صفحة`,
    noPagesSelectedNotice: 'يرجى تحديد صفحة واحدة على الأقل للاستخراج.',
    deletedPagesCount: (count: number) => `تم حذف ${count} صفحة`,
  },
  hi: {
    badge: 'विज़ुअल PDF स्प्लिट, डिलीट व पेज एक्सट्रैक्टर स्टूडियो',
    title: 'विज़ुअल PDF स्प्लिट व पेज मैनेजर',
    sub: 'PDF के सभी पेजों को साफ देखें। अनचाहे पेज को लाल ❌ बटन पर क्लिक करके तुरंत हटाएं, विशेष पेज (उदा. 5, 8, 9, 15, 20, 50) चुनकर अलग नई PDF बनाएं, या हर पेज को अलग-अलग PDF में स्प्लिट करें।',
    uploadTitle: 'PDF फ़ाइल यहाँ चुनें या ड्रैग करके छोड़ें',
    uploadSub: 'सभी पेजों का लाइव विज़ुअल प्रिव्यू • 100% स्थानीय व सुरक्षित',
    changeFile: 'PDF फ़ाइल बदलें',
    modes: {
      extract: 'पेज अलग निकालें (Extract)',
      delete: 'पेज हटाएं (Delete / Remove)',
      splitAll: 'हर पेज अलग-अलग करें (Split All)',
      organize: 'क्रम बदलें व घुमाएं (Organize)',
    },
    quickSelectLabel: 'पेज नंबर या रेंज लिखकर तुरंत चुनें:',
    quickSelectPlaceholder: 'उदा. 5, 8, 9, 15, 20, 50 या 1-4, 8, 12-15...',
    applyQuickSelect: 'पेज चुनें',
    clearSelect: 'चयन साफ़ करें',
    selectAll: 'सभी चुनें',
    selectOdd: 'ताक पेज (Odd: 1, 3, 5...)',
    selectEven: 'जुफ़्त पेज (Even: 2, 4, 6...)',
    invertSelect: 'उलट चयन',
    deletePageHint: 'किसी भी पेज को हटाने के लिए उस पर बने लाल ❌ बटन पर क्लिक करें।',
    undoDelete: 'हटाया पेज वापस लाएं (Undo)',
    restoreAll: 'सभी पेज रीस्टोर करें',
    exportExtractBtn: (count: number) => `चुने हुए ${count} पेज अलग निकालें (नई PDF)`,
    exportDeleteBtn: (count: number) => `हटाए गए पेज छोड़कर बाकी ${count} पेज डाउनलोड करें`,
    exportSplitAllBtn: (count: number) => `सभी ${count} पेजों को अलग-अलग PDF में स्प्लिट करें (ZIP)`,
    exportOrganizeBtn: (count: number) => `व्यवस्थित PDF सहेजें (${count} पेज)`,
    processing: 'PDF तैयार हो रही है...',
    renderingThumbnail: (curr: number, total: number) => `पेज ${curr} / ${total} लोड हो रहा है...`,
    pageLabel: (num: number, total: number) => `पेज ${num} / ${total}`,
    origPage: (num: number) => `मूल #${num}`,
    previewModalTitle: 'पेज प्रिव्यू',
    closePreview: 'बंद करें',
    reverseAll: 'क्रम उलटें (Reverse)',
    rotateAll: 'सभी को 90° घुमाएं',
    insertBlank: 'खाली पेज जोड़ें',
    selectedPagesCount: (count: number, total: number) => `${total} में से ${count} पेज चुने गए`,
    noPagesSelectedNotice: 'कृपया अलग निकालने के लिए कम से कम 1 पेज चुनें।',
    deletedPagesCount: (count: number) => `${count} पेज हटाए गए`,
  },
};

// Helper to parse page range strings like "5, 8, 9, 15, 20, 50" or "1-4, 8"
function parsePageRangeString(input: string, maxPages: number): number[] {
  const selected = new Set<number>();
  const parts = input.split(/[,;\s]+/);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(maxPages, Math.max(start, end));
        for (let p = from; p <= to; p++) {
          selected.add(p);
        }
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= maxPages) {
        selected.add(num);
      }
    }
  }
  return Array.from(selected);
}

export function PdfOrganizerStudio({ initialMode = 'extract' }: PdfOrganizerStudioProps) {
  const { language, isRTL } = useI18n();
  const loc = LOCALES[language as keyof typeof LOCALES] || LOCALES.en;

  const [mode, setMode] = useState<SplitOrganizerMode>(initialMode);
  const [file, setFile] = useState<File | null>(null);
  const [sourceBuffers, setSourceBuffers] = useState<ArrayBuffer[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [deletedHistory, setDeletedHistory] = useState<{ item: PageItem; index: number }[]>([]);
  const [initialPagesSnapshot, setInitialPagesSnapshot] = useState<PageItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState<string>('');
  const [exporting, setExporting] = useState(false);

  // Range text input state
  const [rangeInput, setRangeInput] = useState<string>('');

  // Page Preview Modal
  const [previewPageItem, setPreviewPageItem] = useState<PageItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // Load and render all PDF pages
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPages([]);
      setDeletedHistory([]);
      setLoading(true);
      setProgressText('Initializing PDF rendering engine...');

      try {
        const pdfjs = await getPdfJsLib();
        if (!pdfjs) throw new Error('PDF library unavailable');

        const arrayBuffer = await f.arrayBuffer();
        setSourceBuffers([arrayBuffer]);

        const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        const total = pdf.numPages;

        const renderedPages: PageItem[] = [];
        for (let i = 1; i <= total; i++) {
          setProgressText(loc.renderingThumbnail(i, total));

          if (i % 2 === 0 || total > 15) {
            await new Promise((resolve) => setTimeout(resolve, 5));
          }

          const p = await pdf.getPage(i);
          const viewport = p.getViewport({ scale: 0.55 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await p.render({ canvasContext: ctx, viewport }).promise;
            renderedPages.push({
              id: `page_${i}_${Date.now()}`,
              pageIndex: i - 1,
              sourceDocIndex: 0,
              dataUrl: canvas.toDataURL('image/jpeg', 0.85),
              rotation: 0,
              selected: false,
            });
          }
          canvas.width = 0;
          canvas.height = 0;
        }

        setPages(renderedPages);
        setInitialPagesSnapshot(renderedPages.map((p) => ({ ...p })));
        triggerHaptic('success');
      } catch (err) {
        console.error('PDF Load Error:', err);
      } finally {
        setLoading(false);
        setProgressText('');
      }
    }
  };

  // Immediate Page Delete (prominent cross button)
  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) return;
    triggerHaptic('medium');
    const target = pages[index];
    setDeletedHistory((prev) => [...prev, { item: target, index }]);
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  // Undo delete
  const handleUndoDelete = () => {
    if (deletedHistory.length === 0) return;
    triggerHaptic('light');
    const lastDeleted = deletedHistory[deletedHistory.length - 1];
    setDeletedHistory((prev) => prev.slice(0, prev.length - 1));
    const next = [...pages];
    next.splice(Math.min(lastDeleted.index, next.length), 0, lastDeleted.item);
    setPages(next);
  };

  // Restore all deleted pages to initial state
  const handleRestoreAll = () => {
    triggerHaptic('medium');
    setPages(initialPagesSnapshot.map((p) => ({ ...p })));
    setDeletedHistory([]);
  };

  // Toggle selection on card
  const toggleSelectPage = (index: number) => {
    triggerHaptic('selection');
    setPages((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  // Select by parsed range string (e.g. 5, 8, 9, 15, 20, 50)
  const handleApplyRangeInput = (inputStr: string) => {
    const matchedNumbers = parsePageRangeString(inputStr, pages.length);
    if (matchedNumbers.length === 0) return;
    triggerHaptic('selection');
    setPages((prev) =>
      prev.map((item, idx) => ({
        ...item,
        selected: matchedNumbers.includes(idx + 1),
      }))
    );
  };

  // Quick Select Helpers
  const selectAllPages = (val: boolean) => {
    triggerHaptic('light');
    setPages((prev) => prev.map((item) => ({ ...item, selected: val })));
  };

  const selectOddPages = () => {
    triggerHaptic('selection');
    setPages((prev) => prev.map((item, i) => ({ ...item, selected: (i + 1) % 2 !== 0 })));
  };

  const selectEvenPages = () => {
    triggerHaptic('selection');
    setPages((prev) => prev.map((item, i) => ({ ...item, selected: (i + 1) % 2 === 0 })));
  };

  const invertSelection = () => {
    triggerHaptic('selection');
    setPages((prev) => prev.map((item) => ({ ...item, selected: !item.selected })));
  };

  // Reorder and Rotation
  const movePage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= pages.length) return;
    triggerHaptic('selection');
    const next = [...pages];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setPages(next);
  };

  const rotatePage = (idx: number) => {
    triggerHaptic('light');
    const next = [...pages];
    next[idx].rotation = (next[idx].rotation + 90) % 360;
    setPages(next);
  };

  const rotateAllPages = () => {
    triggerHaptic('medium');
    setPages((prev) => prev.map((item) => ({ ...item, rotation: (item.rotation + 90) % 360 })));
  };

  const reverseAllPages = () => {
    triggerHaptic('medium');
    setPages((prev) => [...prev].reverse());
  };

  const insertBlankPage = () => {
    triggerHaptic('selection');
    const blankCanvas = document.createElement('canvas');
    blankCanvas.width = 200;
    blankCanvas.height = 280;
    const ctx = blankCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 200, 280);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(0, 0, 200, 280);
    }
    const blankItem: PageItem = {
      id: `blank_${Date.now()}`,
      pageIndex: -1,
      sourceDocIndex: -1,
      dataUrl: blankCanvas.toDataURL('image/jpeg', 0.8),
      rotation: 0,
      selected: false,
    };
    setPages((prev) => [...prev, blankItem]);
  };

  // EXPORT 1: Extract Selected Pages into New PDF
  const handleExportExtract = async () => {
    const selectedPages = pages.filter((p) => p.selected);
    if (selectedPages.length === 0 || !file) return;

    setExporting(true);
    triggerHaptic('medium');

    try {
      const loadedDocs: PDFDocument[] = [];
      for (const buf of sourceBuffers) {
        loadedDocs.push(await PDFDocument.load(buf, { ignoreEncryption: true }));
      }

      const outDoc = await PDFDocument.create();
      for (const item of selectedPages) {
        if (item.pageIndex === -1 || item.sourceDocIndex === -1) {
          outDoc.addPage([595, 842]);
        } else {
          const src = loadedDocs[item.sourceDocIndex];
          if (src && item.pageIndex >= 0 && item.pageIndex < src.getPageCount()) {
            const [copied] = await outDoc.copyPages(src, [item.pageIndex]);
            if (item.rotation > 0) {
              copied.setRotation(degrees((copied.getRotation().angle + item.rotation) % 360));
            }
            outDoc.addPage(copied);
          }
        }
      }

      const pdfBytes = await outDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.pdf$/i, '');
      await downloadSingleFile(blob, `${baseName}_extracted.pdf`);
      triggerHaptic('success');
    } catch (err) {
      console.error('Extract Pages Error:', err);
    } finally {
      setExporting(false);
    }
  };

  // EXPORT 2: Download PDF with Deleted Pages Removed
  const handleExportRemaining = async () => {
    if (pages.length === 0 || !file) return;

    setExporting(true);
    triggerHaptic('medium');

    try {
      const loadedDocs: PDFDocument[] = [];
      for (const buf of sourceBuffers) {
        loadedDocs.push(await PDFDocument.load(buf, { ignoreEncryption: true }));
      }

      const outDoc = await PDFDocument.create();
      for (const item of pages) {
        if (item.pageIndex === -1 || item.sourceDocIndex === -1) {
          outDoc.addPage([595, 842]);
        } else {
          const src = loadedDocs[item.sourceDocIndex];
          if (src && item.pageIndex >= 0 && item.pageIndex < src.getPageCount()) {
            const [copied] = await outDoc.copyPages(src, [item.pageIndex]);
            if (item.rotation > 0) {
              copied.setRotation(degrees((copied.getRotation().angle + item.rotation) % 360));
            }
            outDoc.addPage(copied);
          }
        }
      }

      const pdfBytes = await outDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.pdf$/i, '');
      await downloadSingleFile(blob, `${baseName}_pages_removed.pdf`);
      triggerHaptic('success');
    } catch (err) {
      console.error('Export Error:', err);
    } finally {
      setExporting(false);
    }
  };

  // EXPORT 3: Split Every Page into Separate PDFs (ZIP archive)
  const handleExportSplitAll = async () => {
    if (pages.length === 0 || !file) return;

    setExporting(true);
    triggerHaptic('medium');

    try {
      const loadedDocs: PDFDocument[] = [];
      for (const buf of sourceBuffers) {
        loadedDocs.push(await PDFDocument.load(buf, { ignoreEncryption: true }));
      }

      const zip = new JSZip();
      const baseName = file.name.replace(/\.pdf$/i, '');

      for (let i = 0; i < pages.length; i++) {
        const item = pages[i];
        const singleDoc = await PDFDocument.create();

        if (item.pageIndex === -1 || item.sourceDocIndex === -1) {
          singleDoc.addPage([595, 842]);
        } else {
          const src = loadedDocs[item.sourceDocIndex];
          if (src && item.pageIndex >= 0 && item.pageIndex < src.getPageCount()) {
            const [copied] = await singleDoc.copyPages(src, [item.pageIndex]);
            if (item.rotation > 0) {
              copied.setRotation(degrees((copied.getRotation().angle + item.rotation) % 360));
            }
            singleDoc.addPage(copied);
          }
        }

        const singleBytes = await singleDoc.save({ useObjectStreams: true });
        zip.file(`${baseName}_page_${i + 1}.pdf`, singleBytes);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      await downloadSingleFile(zipBlob, `${baseName}_split_pages.zip`);
      triggerHaptic('success');
    } catch (err) {
      console.error('Split All Pages Error:', err);
    } finally {
      setExporting(false);
    }
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Page Preview Modal */}
      {previewPageItem && (
        <div
          onClick={() => setPreviewPageItem(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-600" />
                <span>{loc.previewModalTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setPreviewPageItem(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <CrossIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-950 rounded-2xl">
              <img
                src={previewPageItem.dataUrl}
                alt="Page Preview"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-md"
                style={{ transform: `rotate(${previewPageItem.rotation}deg)` }}
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setPreviewPageItem(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl cursor-pointer"
              >
                {loc.closePreview}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white shrink-0">
              <Split className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                <Sparkles className="w-3 h-3" />
                <span>{loc.badge}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{loc.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">{loc.sub}</p>
            </div>
          </div>

          {pages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPages([]);
                setSourceBuffers([]);
                setDeletedHistory([]);
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              {loc.changeFile}
            </button>
          )}
        </div>

        {/* Upload Dropzone */}
        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 bg-slate-50/60 dark:bg-slate-950/40 rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 group-hover:scale-110 flex items-center justify-center mx-auto mb-4 transition-transform shadow-xs">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-1">
              {loc.uploadTitle}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {loc.uploadSub}
            </p>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{progressText}</p>
          </div>
        )}

        {/* Active PDF Workspace */}
        {pages.length > 0 && (
          <div className="space-y-6">
            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800">
              {[
                { id: 'extract', label: loc.modes.extract, icon: Scissors, color: 'text-blue-500' },
                { id: 'delete', label: loc.modes.delete, icon: Trash2, color: 'text-rose-500' },
                { id: 'split-all', label: loc.modes.splitAll, icon: Split, color: 'text-purple-500' },
                { id: 'organize', label: loc.modes.organize, icon: Layers, color: 'text-amber-500' },
              ].map((m) => {
                const Icon = m.icon;
                const isCurrent = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMode(m.id as SplitOrganizerMode);
                      triggerHaptic('selection');
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isCurrent ? '' : m.color}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions & Range Selection Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              {/* Range Input for Extract & Delete Modes */}
              {(mode === 'extract' || mode === 'delete') && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {loc.quickSelectLabel}
                  </span>
                  <div className="flex items-center gap-1.5 flex-1 min-w-[240px]">
                    <input
                      type="text"
                      value={rangeInput}
                      onChange={(e) => {
                        setRangeInput(e.target.value);
                        handleApplyRangeInput(e.target.value);
                      }}
                      placeholder={loc.quickSelectPlaceholder}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 flex-1 focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyRangeInput(rangeInput)}
                      className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      {loc.applyQuickSelect}
                    </button>
                  </div>
                </div>
              )}

              {/* Batch Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => selectAllPages(selectedCount !== pages.length)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 cursor-pointer shadow-xs"
                  >
                    {selectedCount === pages.length ? loc.clearSelect : loc.selectAll}
                  </button>
                  <button
                    type="button"
                    onClick={selectOddPages}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 cursor-pointer shadow-xs"
                  >
                    {loc.selectOdd}
                  </button>
                  <button
                    type="button"
                    onClick={selectEvenPages}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 cursor-pointer shadow-xs"
                  >
                    {loc.selectEven}
                  </button>
                  <button
                    type="button"
                    onClick={invertSelection}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 cursor-pointer shadow-xs"
                  >
                    {loc.invertSelect}
                  </button>

                  {mode === 'organize' && (
                    <>
                      <button
                        type="button"
                        onClick={reverseAllPages}
                        className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <ArrowUpDown className="w-3 h-3 text-brand-600" />
                        <span>{loc.reverseAll}</span>
                      </button>
                      <button
                        type="button"
                        onClick={rotateAllPages}
                        className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <RotateCw className="w-3 h-3 text-amber-500" />
                        <span>{loc.rotateAll}</span>
                      </button>
                      <button
                        type="button"
                        onClick={insertBlankPage}
                        className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-emerald-500" />
                        <span>{loc.insertBlank}</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Undo / Restore Deleted Pages */}
                {deletedHistory.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-rose-600">
                      {loc.deletedPagesCount(deletedHistory.length)}
                    </span>
                    <button
                      type="button"
                      onClick={handleUndoDelete}
                      className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800 rounded-lg font-bold flex items-center gap-1 cursor-pointer hover:bg-rose-100"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>{loc.undoDelete}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRestoreAll}
                      className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold cursor-pointer"
                    >
                      {loc.restoreAll}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Hint Notice */}
            <div className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
                <span>{loc.deletePageHint}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {loc.selectedPagesCount(selectedCount, pages.length)}
              </span>
            </div>

            {/* Visual Page Thumbnails Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pages.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (mode === 'extract' || mode === 'delete') {
                      toggleSelectPage(idx);
                    }
                  }}
                  className={`group relative p-3 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-2.5 shadow-sm hover:shadow-lg cursor-pointer ${
                    item.selected
                      ? 'bg-rose-50/80 dark:bg-rose-950/50 border-rose-500 ring-4 ring-rose-500/20 scale-[1.02]'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-400'
                  }`}
                >
                  {/* Floating Red ✕ Instant Delete Button (Top-Right Corner) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePage(idx);
                    }}
                    className="absolute -top-2.5 -right-2.5 z-20 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-90 text-white flex items-center justify-center shadow-md transition-transform cursor-pointer border-2 border-white dark:border-slate-900"
                    title={`Delete Page ${idx + 1}`}
                  >
                    <CrossIcon className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  {/* Header: Page Badge + Selection Checkbox */}
                  <div className="flex items-center justify-between text-xs pr-4">
                    <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white text-xs">
                      {item.selected ? (
                        <CheckSquare className="w-4 h-4 text-rose-600 fill-current" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span>Page {idx + 1}</span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.pageIndex === -1 ? 'Blank' : loc.origPage(item.pageIndex + 1)}
                    </span>
                  </div>

                  {/* Thumbnail Image Viewport */}
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-1.5 border border-slate-100 dark:border-slate-800 group-hover:border-brand-300">
                    <img
                      src={item.dataUrl}
                      alt={`Page ${idx + 1}`}
                      className="max-h-full max-w-full object-contain rounded-md shadow-xs transition-transform duration-200 select-none"
                      style={{ transform: `rotate(${item.rotation}deg)` }}
                    />

                    {/* Hover Zoom Eye Icon */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewPageItem(item);
                      }}
                      className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                      title="Preview Page"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Operational Toolbar for Each Card */}
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        movePage(idx, idx - 1);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-30 text-slate-700 dark:text-slate-300 cursor-pointer"
                      title="Move Left"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        rotatePage(idx);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-amber-500" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(idx);
                      }}
                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-600 cursor-pointer transition-colors"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={idx === pages.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        movePage(idx, idx + 1);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-30 text-slate-700 dark:text-slate-300 cursor-pointer"
                      title="Move Right"
                    >
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Floating Export Bar */}
            <div className="sticky bottom-4 z-30 p-4 rounded-3xl bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4 border border-slate-800 dark:border-slate-200">
              <div className="space-y-0.5">
                <div className="text-xs font-black flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-500" />
                  <span>
                    {mode === 'extract' && loc.selectedPagesCount(selectedCount, pages.length)}
                    {mode === 'delete' && `${pages.length} Pages Active (${deletedHistory.length} Removed)`}
                    {mode === 'split-all' && `${pages.length} Total Pages to Split`}
                    {mode === 'organize' && `${pages.length} Pages Structured`}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  {mode === 'extract' && (selectedCount === 0 ? loc.noPagesSelectedNotice : 'Ready to export chosen pages.')}
                  {mode === 'delete' && 'Click the red ❌ button on unwanted pages, then download.'}
                  {mode === 'split-all' && 'Creates a zip archive with each page as an individual PDF.'}
                  {mode === 'organize' && 'Saves modified rotation and page sequence.'}
                </div>
              </div>

              {/* Dynamic CTA Button based on mode */}
              <div>
                {mode === 'extract' && (
                  <button
                    type="button"
                    onClick={handleExportExtract}
                    disabled={selectedCount === 0 || exporting}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/30 active:scale-95 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>{exporting ? loc.processing : loc.exportExtractBtn(selectedCount)}</span>
                  </button>
                )}

                {mode === 'delete' && (
                  <button
                    type="button"
                    onClick={handleExportRemaining}
                    disabled={pages.length === 0 || exporting}
                    className="px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-600/30 active:scale-95 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{exporting ? loc.processing : loc.exportDeleteBtn(pages.length)}</span>
                  </button>
                )}

                {mode === 'split-all' && (
                  <button
                    type="button"
                    onClick={handleExportSplitAll}
                    disabled={pages.length === 0 || exporting}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-purple-600/30 active:scale-95 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    <span>{exporting ? loc.processing : loc.exportSplitAllBtn(pages.length)}</span>
                  </button>
                )}

                {mode === 'organize' && (
                  <button
                    type="button"
                    onClick={handleExportRemaining}
                    disabled={pages.length === 0 || exporting}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-95 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{exporting ? loc.processing : loc.exportOrganizeBtn(pages.length)}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
