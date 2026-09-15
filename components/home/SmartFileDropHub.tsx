'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Zap, UploadCloud, FileText, Image as ImageIcon, FileSpreadsheet, FileCheck, ArrowRight, X, FileCode, Music, Video, Layers, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { formatBytes } from '@/lib/utils/formatters';
import { triggerHaptic } from '@/lib/motion/motion-system';

interface SuggestedAction {
  id: string;
  title: string;
  desc: string;
  href: string;
  badge?: string;
}

const SMART_DROP_LOCALES = {
  en: {
    badge: 'Smart File Hub',
    title: 'Drop Any File — Instant Auto-Matching Tools',
    sub: 'Drag & drop photos, PDFs, Word, Excel, or media. We automatically identify your file and recommend the best tools.',
    browse: 'Browse File',
    detectedAs: 'Detected File:',
    recommendedActions: 'Recommended Processing Actions for',
    close: 'Close',
    openTool: 'Launch Tool',
  },
  ur: {
    badge: 'اسمارٹ فائل ہب',
    title: 'کوئی بھی فائل ڈراپ کریں — بہترین ٹولز کی فوری تجویز',
    sub: 'تصویر، پی ڈی ایف، ورڈ یا ایکسل فائل کھینچ کر ڈالیں۔ ایپ خودکار طور پر فائل کو پہچان کر بہترین ٹولز تجویز کرے گی۔',
    browse: 'فائل منتخب کریں',
    detectedAs: 'فائل کی قسم:',
    recommendedActions: 'اس فائل کے لیے تجویز کردہ ٹولز:',
    close: 'بند کریں',
    openTool: 'ٹول کھولیں',
  },
  ar: {
    badge: 'مركز الملفات الذكي',
    title: 'أسقط أي ملف — مطابقة واقتراح فوري للأدوات',
    sub: 'اسحب وأفلت الصور ومستندات PDF وملفات Word وExcel. يكتشف النظام نوع الملف ويقترح أفضل الأدوات فوراً.',
    browse: 'تصفح الملفات',
    detectedAs: 'نوع الملف المكتشف:',
    recommendedActions: 'الإجراءات والأدوات المقترحة لهذا الملف:',
    close: 'إغلاق',
    openTool: 'تشغيل الأداة',
  },
  hi: {
    badge: 'स्मार्ट फ़ाइल हब',
    title: 'कोई भी फ़ाइल डालें — स्वचालित अनुशंसित टूल्स',
    sub: 'फ़ोटो, PDF, Word, Excel या मीडिया फ़ाइल खींचकर छोड़ें। ऐप अपने आप फ़ाइल पहचान कर बेहतरीन टूल्स सुझाएगा।',
    browse: 'फ़ाइल चुनें',
    detectedAs: 'पहचानी गई फ़ाइल:',
    recommendedActions: 'इस फ़ाइल के लिए अनुशंसित टूल्स:',
    close: 'बंद करें',
    openTool: 'टूल खोलें',
  },
};

export function SmartFileDropHub() {
  const { language, isRTL } = useI18n();
  const loc = SMART_DROP_LOCALES[language as keyof typeof SMART_DROP_LOCALES] || SMART_DROP_LOCALES.en;

  const [activeFile, setActiveFile] = useState<{ name: string; size: number; ext: string; type: string } | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedAction[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeFile = (file: File) => {
    triggerHaptic('selection');
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const mime = file.type.toLowerCase();

    setActiveFile({
      name: file.name,
      size: file.size,
      ext,
      type: file.type || ext.toUpperCase(),
    });

    // 1. PDF Actions
    if (ext === 'pdf' || mime.includes('pdf')) {
      setSuggestions([
        { id: 'compress-pdf', title: 'Compress PDF', desc: 'Reduce file size by up to 90% without losing quality.', href: '/tools/compress-pdf', badge: 'Popular' },
        { id: 'pdf-to-docx', title: 'PDF to Word DOCX', desc: 'Convert PDF with OCR into an editable Word document.', href: '/tools/pdf-to-docx' },
        { id: 'pdf-signer', title: 'Sign & Stamp PDF', desc: 'Draw digital signatures, stamps, and notes onto pages.', href: '/pdf-signer', badge: 'Signature' },
        { id: 'split-pdf', title: 'Split & Extract Pages', desc: 'Separate pages into individual PDF files.', href: '/tools/split-pdf' },
        { id: 'markitdown', title: 'PDF to Markdown', desc: 'Convert structured text and tables to Markdown.', href: '/markitdown' },
      ]);
      return;
    }

    // 2. Image Actions (PNG, JPG, WebP, GIF)
    if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif'].includes(ext) || mime.startsWith('image/')) {
      setSuggestions([
        { id: 'bg-remove', title: 'Background Cutout', desc: 'Auto-remove background with transparent alpha mask.', href: '/tools/remove-background', badge: 'Smart' },
        { id: 'passport', title: 'Passport Photo Maker', desc: '3.5x4.5cm cropping with date strip and print sheet.', href: '/tools/passport-photo-maker' },
        { id: 'img-compress', title: 'Compress to Target KB', desc: 'Compress image under 50KB or 100KB for portals.', href: '/tools/compress-image' },
        { id: 'img-to-pdf', title: 'Images to PDF Package', desc: 'Combine multiple photos into a single organized PDF.', href: '/tools/images-to-pdf' },
        { id: 'ocr-image', title: 'Extract OCR Text', desc: 'Recognize Arabic, Urdu, Hindi, or English text.', href: '/ocr' },
      ]);
      return;
    }

    // 3. Word DOCX Actions
    if (['docx', 'doc'].includes(ext) || mime.includes('wordprocessingml')) {
      setSuggestions([
        { id: 'docx-pdf', title: 'Word to PDF', desc: 'Convert Word document directly into printable PDF.', href: '/tools/docx-to-pdf', badge: 'Instant' },
        { id: 'docx-md', title: 'Word to Markdown', desc: 'Extract headings, tables, and lists into structured MD.', href: '/markitdown' },
        { id: 'docx-clean', title: 'Clean Word Formatting', desc: 'Remove double spaces, broken tags, and metadata.', href: '/tools/clean-word-formatting' },
      ]);
      return;
    }

    // 4. Excel & Spreadsheet Actions
    if (['xlsx', 'xls', 'csv', 'tsv'].includes(ext) || mime.includes('spreadsheet') || mime.includes('csv')) {
      setSuggestions([
        { id: 'excel-pdf', title: 'Spreadsheet to PDF', desc: 'Convert sheets into landscape formatted PDF.', href: '/tools/excel-to-pdf' },
        { id: 'excel-md', title: 'Spreadsheet to Markdown Table', desc: 'Transform data rows into clean GitHub Flavored Markdown.', href: '/markitdown', badge: 'Smart' },
        { id: 'csv-json', title: 'CSV to JSON Converter', desc: 'Convert tabular rows into API-ready JSON data.', href: '/tools/csv-to-json' },
      ]);
      return;
    }

    // 5. PowerPoint Presentation
    if (['pptx', 'ppt'].includes(ext) || mime.includes('presentationml')) {
      setSuggestions([
        { id: 'ppt-pdf', title: 'PowerPoint to PDF', desc: 'Convert presentation slides into high quality PDF.', href: '/tools/pptx-to-pdf' },
        { id: 'ppt-md', title: 'PowerPoint to Markdown', desc: 'Extract slide titles, bullet points, and speaker notes.', href: '/markitdown' },
      ]);
      return;
    }

    // Fallback Universal Actions
    setSuggestions([
      { id: 'universal-md', title: 'Universal MarkItDown', desc: 'Extract structured text and data into clean Markdown.', href: '/markitdown' },
      { id: 'workflows-pipe', title: 'Smart Pipeline Workflow', desc: 'Chain multiple processing steps in sequence.', href: '/workflows' },
    ]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      analyzeFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      {/* Interactive Drop Card */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="relative group rounded-3xl p-6 sm:p-8 border-2 border-dashed border-brand-500/30 hover:border-brand-500 bg-gradient-to-br from-brand-500/5 via-white to-brand-500/10 dark:from-brand-950/20 dark:via-slate-900 dark:to-brand-950/30 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              analyzeFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
          <div className="flex items-center gap-4 text-center sm:text-left rtl:sm:text-right">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                <Zap className="w-3 h-3" />
                <span>{loc.badge}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                {loc.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                {loc.sub}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-md transition-all shrink-0 flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{loc.browse}</span>
          </button>
        </div>
      </div>

      {/* Detected Suggestions Drawer / Modal */}
      {activeFile && (
        <div className="mt-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-brand-500/30 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block font-semibold">{loc.detectedAs}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate block">
                  {activeFile.name} ({formatBytes(activeFile.size)})
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveFile(null)}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
              {loc.recommendedActions} <code className="text-brand-600 dark:text-brand-400">.{activeFile.ext}</code>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {suggestions.map((act) => (
                <Link
                  key={act.id}
                  href={act.href}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-brand-500 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors">
                        {act.title}
                      </span>
                      {act.badge && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                          {act.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {act.desc}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400">
                    <span>{loc.openTool}</span>
                    <ArrowRight className="w-3 h-3 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
