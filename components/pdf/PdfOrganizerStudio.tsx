'use client';

import React, { useState, useRef } from 'react';
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
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import { getPdfJsLib } from '@/lib/utils/formatters';
import { downloadSingleFile } from '@/lib/utils/download';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { useI18n } from '@/lib/i18n/i18n-context';

interface PageItem {
  id: string;
  pageIndex: number; // 0-based index in original source PDF (or -1 for blank)
  sourceDocIndex: number; // 0 for main file, 1+ for replaced/inserted docs
  dataUrl: string;
  rotation: number; // 0, 90, 180, 270
  selected?: boolean;
}

const ORGANIZER_LOCALES = {
  en: {
    badge: 'Visual PDF Page Studio',
    title: 'Visual PDF Page Manager & Organizer',
    sub: 'Delete pages, reorder, duplicate, reverse entire document, replace pages, and rotate with instant live preview.',
    uploadTitle: 'Click or Drag & Drop PDF Document',
    uploadSub: 'Up to 500 MB • All pages rendered locally',
    changeFile: 'Change PDF',
    saveExport: 'Save & Export PDF',
    savingPdf: 'Compiling PDF...',
    reverseAll: 'Reverse Order (3, 2, 1)',
    rotateAll: 'Rotate All 90°',
    insertBlank: 'Add Blank Page',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    deleteSelected: 'Delete Selected',
    duplicatePage: 'Duplicate Page',
    replacePage: 'Replace Page',
    deletePage: 'Delete Page',
    pageLabel: (num: number, total: number) => `Page ${num} of ${total}`,
    origPage: (num: number) => `Orig #${num}`,
    downloadReady: 'Organized PDF Ready!',
    pagesCount: (cnt: number) => `${cnt} pages organized and structured.`,
    downloadBtn: 'Download Processed PDF',
    anotherBtn: 'Process Another File',
  },
  ur: {
    badge: 'بصری پی ڈی ایف پیج اسٹوڈیو',
    title: 'پی ڈی ایف صفحات کا انتظام اور ری آرڈر اسٹوڈیو',
    sub: 'صفحات حذف کریں، ترتیب تبدیل کریں، ڈپلیکیٹ بنائیں، الٹی ترتیب (Reverse) کریں اور 100% پرائیویسی کے ساتھ محفوظ کریں۔',
    uploadTitle: 'پی ڈی ایف فائل یہاں ڈراپ کریں یا منتخب کریں',
    uploadSub: '500 ایم بی تک • تمام صفحات کا لائیو پریویو',
    changeFile: 'پی ڈی ایف تبدیل کریں',
    saveExport: 'محفوظ کریں اور ایکسپورٹ کریں',
    savingPdf: 'پی ڈی ایف تیار ہو رہی ہے...',
    reverseAll: 'ترتیب الٹ کریں (Reverse)',
    rotateAll: 'تمام کو 90° گھمائیں',
    insertBlank: 'خالی صفحہ شامل کریں',
    selectAll: 'تمام منتخب کریں',
    deselectAll: 'انتخاب ختم کریں',
    deleteSelected: 'منتخب حذف کریں',
    duplicatePage: 'ڈپلیکیٹ صفحہ',
    replacePage: 'صفحہ تبدیل کریں',
    deletePage: 'صفحہ حذف کریں',
    pageLabel: (num: number, total: number) => `صفحہ ${num} از ${total}`,
    origPage: (num: number) => `اصل #${num}`,
    downloadReady: 'منظم پی ڈی ایف تیار ہے!',
    pagesCount: (cnt: number) => `${cnt} صفحات ترتیب دیئے جا چکے ہیں۔`,
    downloadBtn: 'پی ڈی ایف ڈاؤن لوڈ کریں',
    anotherBtn: 'دوسری فائل بنائیں',
  },
  ar: {
    badge: 'استوديو تنظيم صفحات PDF المرئي',
    title: 'إدارة وترتيب وحذف صفحات PDF المرئي',
    sub: 'حذف الصفحات غير المرغوبة، إعادة الترتيب، التكرار، عكس الترتيب، التدوير والاستبدال بخصوصية كاملة.',
    uploadTitle: 'انقر أو أسقط مستند PDF هنا',
    uploadSub: 'حتى 500 ميجابايت • معالجة فورية',
    changeFile: 'تغيير المستند',
    saveExport: 'حفظ وتصدير PDF',
    savingPdf: 'جاري بناء وتجهيز المستند...',
    reverseAll: 'عكس الترتيب (Reverse)',
    rotateAll: 'تدوير الكل 90°',
    insertBlank: 'إضافة صفحة فارغة',
    selectAll: 'تحديد الكل',
    deselectAll: 'إلغاء التحديد',
    deleteSelected: 'حذف المحدد',
    duplicatePage: 'تكرار الصفحة',
    replacePage: 'استبدال الصفحة',
    deletePage: 'حذف الصفحة',
    pageLabel: (num: number, total: number) => `صفحة ${num} من ${total}`,
    origPage: (num: number) => `الأصل #${num}`,
    downloadReady: 'مستند PDF المنظم جاهز!',
    pagesCount: (cnt: number) => `تم تنظيم وتجهيز ${cnt} صفحة بنجاح.`,
    downloadBtn: 'تحميل مستند PDF المنظم',
    anotherBtn: 'تنظيم ملف آخر',
  },
  hi: {
    badge: 'विज़ुअल पीडीएफ पेज स्टूडियो',
    title: 'विज़ुअल पीडीएफ पेज मैनेजर और रीऑर्डर स्टूडियो',
    sub: 'अवांछित पेज हटाएं, क्रम बदलें, डुप्लीकेट बनाएं, रिवर्स करें और 100% गोपनीयता के साथ निर्यात करें।',
    uploadTitle: 'यहाँ क्लिक करें या पीडीएफ दस्तावेज़ ड्रॉप करें',
    uploadSub: '500 एमबी तक • सभी पेजों का लाइव पूर्वावलोकन',
    changeFile: 'पीडीएफ बदलें',
    saveExport: 'सहेजें और निर्यात करें',
    savingPdf: 'पीडीएफ तैयार हो रहा है...',
    reverseAll: 'क्रम उलटें (Reverse)',
    rotateAll: 'सभी को 90° घुमाएँ',
    insertBlank: 'खाली पेज जोड़ें',
    selectAll: 'सभी चुनें',
    deselectAll: 'चयन हटाएं',
    deleteSelected: 'चयनित हटाएं',
    duplicatePage: 'पेज डुप्लीकेट करें',
    replacePage: 'पेज बदलें',
    deletePage: 'पेज हटाएं',
    pageLabel: (num: number, total: number) => `पेज ${num} / ${total}`,
    origPage: (num: number) => `मूल #${num}`,
    downloadReady: 'व्यवस्थित पीडीएफ तैयार है!',
    pagesCount: (cnt: number) => `${cnt} पेज व्यवस्थित किए गए।`,
    downloadBtn: 'व्यवस्थित पीडीएफ डाउनलोड करें',
    anotherBtn: 'दूसरी फाइल बनाएं',
  },
};

export function PdfOrganizerStudio() {
  const { language, isRTL } = useI18n();
  const loc = ORGANIZER_LOCALES[language as keyof typeof ORGANIZER_LOCALES] || ORGANIZER_LOCALES.en;

  const [file, setFile] = useState<File | null>(null);
  const [sourceBuffers, setSourceBuffers] = useState<ArrayBuffer[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPages([]);
      setExportUrl(null);
      setLoading(true);
      setProgressText('Initializing PDF engine...');

      try {
        const pdfjs = await getPdfJsLib();
        if (!pdfjs) throw new Error('PDF library unavailable');

        const arrayBuffer = await f.arrayBuffer();
        setSourceBuffers([arrayBuffer]);

        const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        const total = pdf.numPages;

        const renderedPages: PageItem[] = [];
        for (let i = 1; i <= total; i++) {
          setProgressText(`Rendering thumbnail ${i} of ${total}...`);

          if (i % 2 === 0 || total > 15) {
            await new Promise((resolve) => setTimeout(resolve, 6));
          }

          const p = await pdf.getPage(i);
          const viewport = p.getViewport({ scale: 0.45 });
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
              dataUrl: canvas.toDataURL('image/jpeg', 0.8),
              rotation: 0,
              selected: false,
            });
          }
          canvas.width = 0;
          canvas.height = 0;
        }
        setPages(renderedPages);
        triggerHaptic('success');
      } catch (err) {
        console.error('PDF Organizer Load Error:', err);
      } finally {
        setLoading(false);
        setProgressText('');
      }
    }
  };

  // Reorder Actions
  const movePage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= pages.length) return;
    triggerHaptic('selection');
    const next = [...pages];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setPages(next);
  };

  const reverseAllPages = () => {
    triggerHaptic('medium');
    setPages((prev) => [...prev].reverse());
  };

  const rotatePage = (idx: number) => {
    triggerHaptic('light');
    const next = [...pages];
    next[idx].rotation = (next[idx].rotation + 90) % 360;
    setPages(next);
  };

  const rotateAllPages = () => {
    triggerHaptic('medium');
    setPages((prev) =>
      prev.map((item) => ({ ...item, rotation: (item.rotation + 90) % 360 }))
    );
  };

  const duplicatePage = (idx: number) => {
    triggerHaptic('selection');
    const target = pages[idx];
    const dup: PageItem = {
      ...target,
      id: `dup_${Date.now()}_${Math.random()}`,
      selected: false,
    };
    const next = [...pages];
    next.splice(idx + 1, 0, dup);
    setPages(next);
  };

  const insertBlankPage = (atIdx: number = pages.length) => {
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
      pageIndex: -1, // marks as blank
      sourceDocIndex: -1,
      dataUrl: blankCanvas.toDataURL('image/jpeg', 0.8),
      rotation: 0,
      selected: false,
    };
    const next = [...pages];
    next.splice(atIdx, 0, blankItem);
    setPages(next);
  };

  const deletePage = (idx: number) => {
    if (pages.length <= 1) return;
    triggerHaptic('light');
    setPages((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleSelectPage = (idx: number) => {
    setPages((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, selected: !item.selected } : item))
    );
  };

  const selectAll = (val: boolean) => {
    setPages((prev) => prev.map((item) => ({ ...item, selected: val })));
  };

  const deleteSelectedPages = () => {
    const unselected = pages.filter((item) => !item.selected);
    if (unselected.length === 0) return;
    triggerHaptic('medium');
    setPages(unselected);
  };

  // Replace Page with another file
  const handleTriggerReplace = (idx: number) => {
    setReplacingIndex(idx);
    replaceFileInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (replacingIndex === null || !e.target.files || !e.target.files[0]) return;
    const repFile = e.target.files[0];
    try {
      const repBuffer = await repFile.arrayBuffer();
      const newSourceIdx = sourceBuffers.length;
      setSourceBuffers((prev) => [...prev, repBuffer]);

      const pdfjs = await getPdfJsLib();
      if (!pdfjs) return;
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(repBuffer) }).promise;
      const p = await pdf.getPage(1);
      const viewport = p.getViewport({ scale: 0.45 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await p.render({ canvasContext: ctx, viewport }).promise;
        const repItem: PageItem = {
          id: `rep_${Date.now()}`,
          pageIndex: 0,
          sourceDocIndex: newSourceIdx,
          dataUrl: canvas.toDataURL('image/jpeg', 0.8),
          rotation: 0,
          selected: false,
        };
        setPages((prev) => prev.map((item, i) => (i === replacingIndex ? repItem : item)));
        triggerHaptic('success');
      }
    } catch (err) {
      console.error('Replace error:', err);
    } finally {
      setReplacingIndex(null);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  // Real Export
  const handleExport = async () => {
    if (!file || pages.length === 0) return;
    setExporting(true);
    triggerHaptic('medium');

    try {
      // Load all source PDF documents
      const loadedDocs: PDFDocument[] = [];
      for (const buf of sourceBuffers) {
        const loaded = await PDFDocument.load(buf, { ignoreEncryption: true });
        loadedDocs.push(loaded);
      }

      const outDoc = await PDFDocument.create();

      for (const item of pages) {
        if (item.pageIndex === -1 || item.sourceDocIndex === -1) {
          // Add blank page (A4 standard)
          outDoc.addPage([595, 842]);
        } else {
          const src = loadedDocs[item.sourceDocIndex];
          if (src && item.pageIndex >= 0 && item.pageIndex < src.getPageCount()) {
            const [copiedPage] = await outDoc.copyPages(src, [item.pageIndex]);
            if (item.rotation > 0) {
              copiedPage.setRotation(degrees((copiedPage.getRotation().angle + item.rotation) % 360));
            }
            outDoc.addPage(copiedPage);
          }
        }
      }

      const pdfBytes = await outDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setExportBlob(blob);
      setExportUrl(URL.createObjectURL(blob));
      triggerHaptic('success');
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setExporting(false);
    }
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="max-w-6xl mx-auto space-y-6 pb-16">
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleReplaceFile}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200">
                <Sparkles className="w-3 h-3" />
                <span>{loc.badge}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{loc.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">{loc.sub}</p>
            </div>
          </div>

          {pages.length > 0 && !exportUrl && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPages([]);
                  setSourceBuffers([]);
                }}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
              >
                {loc.changeFile}
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-extrabold rounded-xl text-xs shadow-md shadow-rose-600/25 flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{exporting ? loc.savingPdf : loc.saveExport}</span>
              </button>
            </div>
          )}
        </div>

        {/* Dropzone if no file loaded */}
        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 bg-slate-50/60 dark:bg-slate-950/40 rounded-3xl p-10 text-center cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 group-hover:scale-110 flex items-center justify-center mx-auto mb-4 transition-transform shadow-xs">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-base font-black text-slate-900 dark:text-white mb-1">{loc.uploadTitle}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{loc.uploadSub}</p>
          </div>
        )}

        {loading && (
          <div className="p-10 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{progressText}</p>
          </div>
        )}

        {/* Action Ribbon & Quick Operations */}
        {pages.length > 0 && !exportUrl && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              {/* Batch Tools */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={reverseAllPages}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 flex items-center gap-1.5 shadow-xs"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-brand-600" />
                  <span>{loc.reverseAll}</span>
                </button>

                <button
                  type="button"
                  onClick={rotateAllPages}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 flex items-center gap-1.5 shadow-xs"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-500" />
                  <span>{loc.rotateAll}</span>
                </button>

                <button
                  type="button"
                  onClick={() => insertBlankPage()}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{loc.insertBlank}</span>
                </button>
              </div>

              {/* Selection Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectAll(selectedCount !== pages.length)}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:underline"
                >
                  {selectedCount === pages.length ? loc.deselectAll : loc.selectAll}
                </button>

                {selectedCount > 0 && (
                  <button
                    type="button"
                    onClick={deleteSelectedPages}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {loc.deleteSelected} ({selectedCount})
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Visual Page Thumbnails Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-2">
              {pages.map((item, idx) => (
                <div
                  key={item.id}
                  className={`group relative p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 shadow-xs hover:shadow-md ${
                    item.selected
                      ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-400'
                  }`}
                >
                  {/* Header: Page Badge + Selection Checkbox */}
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => toggleSelectPage(idx)}
                      className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-[11px]"
                    >
                      {item.selected ? (
                        <CheckSquare className="w-4 h-4 text-rose-600 fill-current" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span>Page {idx + 1}</span>
                    </button>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.pageIndex === -1 ? 'Blank' : loc.origPage(item.pageIndex + 1)}
                    </span>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="h-44 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center p-1 border border-slate-100 dark:border-slate-800">
                    <img
                      src={item.dataUrl}
                      alt={`Page ${idx + 1}`}
                      className="max-h-full max-w-full object-contain rounded shadow-xs transition-transform duration-200 select-none"
                      style={{ transform: `rotate(${item.rotation}deg)` }}
                    />
                  </div>

                  {/* Operational Toolbar for Each Card */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {/* Primary Reorder & Rotate Row */}
                    <div className="flex items-center justify-between gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => movePage(idx, idx - 1)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-30 text-slate-700 dark:text-slate-300"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                      </button>

                      <button
                        type="button"
                        onClick={() => rotatePage(idx)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                        title="Rotate 90°"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => duplicatePage(idx)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                        title={loc.duplicatePage}
                      >
                        <Copy className="w-3.5 h-3.5 text-blue-500" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriggerReplace(idx)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                        title={loc.replacePage}
                      >
                        <Replace className="w-3.5 h-3.5 text-amber-500" />
                      </button>

                      <button
                        type="button"
                        onClick={() => deletePage(idx)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600"
                        title={loc.deletePage}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === pages.length - 1}
                        onClick={() => movePage(idx, idx + 1)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-30 text-slate-700 dark:text-slate-300"
                        title="Move Right"
                      >
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result & Direct Download */}
        {exportUrl && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
              <CheckCircle className="w-7 h-7 shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">{loc.downloadReady}</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">{loc.pagesCount(pages.length)}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (exportBlob) {
                    triggerHaptic('medium');
                    downloadSingleFile(exportBlob, `Organized_${file?.name || 'document.pdf'}`);
                  }
                }}
                className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all text-sm"
              >
                <Download className="w-5 h-5" />
                <span>{loc.downloadBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPages([]);
                  setExportBlob(null);
                  setExportUrl(null);
                  setSourceBuffers([]);
                }}
                className="px-6 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-bold rounded-2xl flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{loc.anotherBtn}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
