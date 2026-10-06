'use client';

import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Copy,
  Check,
  Download,
  Share2,
  Zap,
  Eye,
  Code2,
  FileSpreadsheet,
  FileCode,
  Layers,
  FileArchive,
  RefreshCw,
  Cpu,
  BrainCircuit,
  HelpCircle,
  Sparkles,
  Bot,
  CheckCircle2,
  FileCheck,
  Table,
  Image as ImageIcon,
} from 'lucide-react';
import {
  universalMarkItDown,
  generateLlmPrompt,
  MarkItDownResult,
} from '@/lib/engines/markitdown-engine';
import { downloadSingleFile, shareDownloadedFile } from '@/lib/utils/download';
import { marked } from 'marked';
import { sanitizeHtml } from '@/lib/utils/sanitizer';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';

const STUDIO_LOCALES = {
  en: {
    badge: 'Universal AI Document to Markdown & Text Studio',
    title: 'Document to Text & Markdown Studio',
    subtitle: 'Extract clean, readable text, tables, and notes from any PDF, Word, Excel, PowerPoint, or Image with 1-click AI & ChatGPT prompt export.',
    whatIsThisTitle: 'What is this tool?',
    whatIsThisDesc: 'This tool reads any document (PDF, Word DOCX, Excel sheets, Slides, Images) and converts all contents and tables into clean Text & Markdown. You can easily read it, copy it, or feed it to ChatGPT & AI for summaries and Q&A.',
    dropTitle: 'Select or Drop Any Document Here',
    dropSubtitle: 'Supports PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), Images (OCR), CSV, JSON, ZIP & Text files.',
    browseBtn: 'Choose Document',
    converting: 'Extracting text and tables...',
    previewTab: 'Formatted Text View',
    rawTab: 'Raw Markdown Code',
    aiTab: 'ChatGPT / AI Prompts',
    copyMd: 'Copy Text',
    copyPrompt: 'Copy AI Prompt',
    downloadMd: 'Download .md',
    downloadTxt: 'Download .txt',
    shareMd: 'Share Text',
    copied: 'Copied!',
    statsChars: 'Characters',
    statsWords: 'Words',
    statsLines: 'Lines',
    statsTokens: 'Est. AI Tokens',
    llmPromptType: 'Select AI Goal:',
    llmSummary: 'Executive Summary (خلاصہ)',
    llmQna: 'Q&A Assistant (سوال و جواب)',
    llmExtract: 'Key Facts & Tables (اہم نکات)',
    llmRag: 'Detailed Data Extraction (تفصیلی ڈیٹا)',
    llmTranslate: 'Translate to Urdu / Arabic (ترجمہ)',
    emptyNotice: 'Upload any file above to instantly convert it into structured text.',
    supportedFormats: [
      { name: 'PDF', icon: FileText, color: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 border-red-200' },
      { name: 'Word (DOCX)', icon: FileText, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 border-blue-200' },
      { name: 'Excel (XLSX)', icon: Table, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200' },
      { name: 'PowerPoint (PPTX)', icon: Layers, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 border-amber-200' },
      { name: 'Images (OCR)', icon: ImageIcon, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 border-purple-200' },
      { name: 'CSV & JSON', icon: FileCode, color: 'bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border-slate-200' },
    ],
  },
  ur: {
    badge: 'یونیورسل اے آئی ڈاکومنٹ ٹو ٹیکسٹ و مارک ڈاؤن اسٹوڈیو',
    title: 'ڈاکومنٹ ٹو ٹیکسٹ و مارک ڈاؤن کنورٹر',
    subtitle: 'پی ڈی ایف، ورڈ، ایکسل، پاورپوائنٹ یا تصویر سے تمام تحریر اور ٹیبلز نکال کر صاف ٹیکسٹ اور مارک ڈاؤن میں تبدیل کریں۔',
    whatIsThisTitle: 'یہ ٹول کیا ہے اور کیسے کام کرتا ہے؟',
    whatIsThisDesc: 'یہ ٹول کسی بھی دستاویز (PDF, Word, Excel, PowerPoint, تصاویر) سے تحریر اور ٹیبلز خودکار طور پر الگ کر کے صاف ٹیکسٹ بنا دیتا ہے۔ آپ اسے باآسانی پڑھ سکتے ہیں، کاپی کر سکتے ہیں، یا ChatGPT/AI میں ڈال کر فوری خلاصہ اور سوال جواب حاصل کر سکتے ہیں۔',
    dropTitle: 'کوئی بھی دستاویز یا فائل یہاں منتخب کریں',
    dropSubtitle: 'سپورٹ: PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), Images (OCR), CSV, JSON اور ٹیکسٹ فائلیں',
    browseBtn: 'فائل منتخب کریں',
    converting: 'دستاویز سے تحریر اور ٹیبلز نکالے جا رہے ہیں...',
    previewTab: 'صاف پڑھنے کا منظر',
    rawTab: 'مارک ڈاؤن کوڈ',
    aiTab: 'ChatGPT و AI پرامپٹس',
    copyMd: 'ٹیکسٹ کاپی کریں',
    copyPrompt: 'AI پرامپٹ کاپی کریں',
    downloadMd: 'ڈاؤنلوڈ .md',
    downloadTxt: 'ڈاؤنلوڈ .txt',
    shareMd: 'شیئر کریں',
    copied: 'کاپی ہو گیا!',
    statsChars: 'حروف',
    statsWords: 'الفاظ',
    statsLines: 'سطریں',
    statsTokens: 'متوقع AI ٹوکنز',
    llmPromptType: 'AI مقصد منتخب کریں:',
    llmSummary: 'جامع خلاصہ (Executive Summary)',
    llmQna: 'سوال و جواب اسسٹنٹ (Q&A)',
    llmExtract: 'اہم حقائق و ٹیبلز (Key Facts)',
    llmRag: 'مکمل ڈیٹا کا تجزیہ (Data Extraction)',
    llmTranslate: 'اردو / عربی میں ترجمہ کریں',
    emptyNotice: 'صاف ٹیکسٹ اور مارک ڈاؤن حاصل کرنے کے لیے اوپر فائل اپلوڈ کریں۔',
    supportedFormats: [
      { name: 'PDF', icon: FileText, color: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 border-red-200' },
      { name: 'Word (DOCX)', icon: FileText, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 border-blue-200' },
      { name: 'Excel (XLSX)', icon: Table, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200' },
      { name: 'PowerPoint (PPTX)', icon: Layers, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 border-amber-200' },
      { name: 'تصاویر (OCR)', icon: ImageIcon, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 border-purple-200' },
      { name: 'CSV و JSON', icon: FileCode, color: 'bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border-slate-200' },
    ],
  },
  ar: {
    badge: 'استوديو استخراج النصوص وMarkdown الشامل للذكاء الاصطناعي',
    title: 'استوديو تحويل المستندات إلى نص وMarkdown',
    subtitle: 'استخرج النصوص والجداول بوضوح من ملفات PDF وWord وExcel وPowerPoint والصور مع إمكانية التصدير الفوري لنماذج ChatGPT والذكاء الاصطناعي.',
    whatIsThisTitle: 'ما هي هذه الأداة وكيف تعمل؟',
    whatIsThisDesc: 'تقوم هذه الأداة بقراءة أي مستند واستخراج جميع النصوص والجداول والملاحظات وتحويلها إلى كود Markdown ونصوص نظيفة جاهزة للملخصات والذكاء الاصطناعي.',
    dropTitle: 'اختر أو أسقط أي مستند هنا',
    dropSubtitle: 'يدعم ملفات: PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), الصور (OCR), CSV, JSON',
    browseBtn: 'اختيار مستند',
    converting: 'جاري استخراج النصوص والجداول...',
    previewTab: 'معاينة منسقة',
    rawTab: 'كود Markdown الخام',
    aiTab: 'أوامر ChatGPT والذكاء الاصطناعي',
    copyMd: 'نسخ النص',
    copyPrompt: 'نسخ أمر الذكاء الاصطناعي',
    downloadMd: 'تحميل .md',
    downloadTxt: 'تحميل .txt',
    shareMd: 'مشاركة النص',
    copied: 'تم النسخ!',
    statsChars: 'الحروف',
    statsWords: 'الكلمات',
    statsLines: 'الأسطر',
    statsTokens: 'تقدير توكنز الذكاء الاصطناعي',
    llmPromptType: 'حدد الهدف للذكاء الاصطناعي:',
    llmSummary: 'ملخص تنفيذي شامل',
    llmQna: 'مساعد الأسئلة والأجوبة',
    llmExtract: 'استخراج الحقائق والجداول',
    llmRag: 'استخراج تفصيلي للبيانات',
    llmTranslate: 'ترجمة المحتوى',
    emptyNotice: 'قم برفع مستند في الأعلى للبدء في استخراج النصوص.',
    supportedFormats: [
      { name: 'PDF', icon: FileText, color: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 border-red-200' },
      { name: 'Word (DOCX)', icon: FileText, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 border-blue-200' },
      { name: 'Excel (XLSX)', icon: Table, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200' },
      { name: 'PowerPoint (PPTX)', icon: Layers, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 border-amber-200' },
      { name: 'الصور (OCR)', icon: ImageIcon, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 border-purple-200' },
      { name: 'CSV و JSON', icon: FileCode, color: 'bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border-slate-200' },
    ],
  },
  hi: {
    badge: 'यूनिवर्सल AI डॉक्यूमेंट टू टेक्स्ट व मार्कडाउन स्टूडियो',
    title: 'डॉक्यूमेंट टू टेक्स्ट व मार्कडाउन कन्वर्टर',
    subtitle: 'PDF, Word, Excel, PowerPoint या इमेज से सभी टेक्स्ट और टेबल निकालकर साफ टेक्स्ट व मार्कडाउन में बदलें।',
    whatIsThisTitle: 'यह टूल क्या है और कैसे काम करता है?',
    whatIsThisDesc: 'यह टूल किसी भी दस्तावेज़ (PDF, Word, Excel, PPT, फोटो) से टेक्स्ट व टेबल निकालकर साफ टेक्स्ट बनाता है ताकि आप इसे आसानी से पढ़ सकें या ChatGPT/AI में उपयोग कर सकें।',
    dropTitle: 'यहाँ कोई भी दस्तावेज़ चुनें या ड्रॉप करें',
    dropSubtitle: 'सपोर्ट: PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), Images (OCR), CSV, JSON और टेक्स्ट फाइलें',
    browseBtn: 'फ़ाइल चुनें',
    converting: 'टेक्स्ट व टेबल निकाले जा रहे हैं...',
    previewTab: 'फॉर्मेटेड टेक्स्ट व्यू',
    rawTab: 'रॉ मार्कडाउन कोड',
    aiTab: 'ChatGPT व AI प्रॉम्प्ट्स',
    copyMd: 'टेक्स्ट कॉपी करें',
    copyPrompt: 'AI प्रॉम्प्ट कॉपी करें',
    downloadMd: 'डाउनलोड .md',
    downloadTxt: 'डाउनलोड .txt',
    shareMd: 'शेयर करें',
    copied: 'कॉपी हो गया!',
    statsChars: 'अक्षर',
    statsWords: 'शब्द',
    statsLines: 'पंक्तियाँ',
    statsTokens: 'अनुमानित AI टोकन्स',
    llmPromptType: 'AI उद्देश्य चुनें:',
    llmSummary: 'कार्यकारी सारांश (Summary)',
    llmQna: 'प्रश्न व उत्तर सहायक (Q&A)',
    llmExtract: 'मुख्य तथ्य व टेबल (Key Facts)',
    llmRag: 'डेटा निष्कर्षण (Data Extraction)',
    llmTranslate: 'अनुवाद करें (Translate)',
    emptyNotice: 'टेक्स्ट व मार्कडाउन प्राप्त करने के लिए ऊपर कोई भी फ़ाइल अपलोड करें।',
    supportedFormats: [
      { name: 'PDF', icon: FileText, color: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 border-red-200' },
      { name: 'Word (DOCX)', icon: FileText, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 border-blue-200' },
      { name: 'Excel (XLSX)', icon: Table, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200' },
      { name: 'PowerPoint (PPTX)', icon: Layers, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 border-amber-200' },
      { name: 'तस्वीरें (OCR)', icon: ImageIcon, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 border-purple-200' },
      { name: 'CSV व JSON', icon: FileCode, color: 'bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border-slate-200' },
    ],
  },
};

export function MarkItDownStudio() {
  const { language, isRTL } = useI18n();
  const loc = STUDIO_LOCALES[language as keyof typeof STUDIO_LOCALES] || STUDIO_LOCALES.en;

  const [activeTab, setActiveTab] = useState<'preview' | 'raw' | 'ai'>('preview');
  const [promptType, setPromptType] = useState<'summary' | 'qna' | 'extract' | 'rag' | 'translate'>('summary');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [result, setResult] = useState<MarkItDownResult | null>(null);
  const [copiedMd, setCopiedMd] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setProgressMsg(loc.converting);
    triggerHaptic('selection');
    try {
      const res = await universalMarkItDown(file, {
        includeMetadata: true,
        onProgress: (pct, status) => setProgressMsg(status),
      });
      setResult(res);
      triggerHaptic('success');
    } catch (err: any) {
      alert(`Error converting file: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleCopyMarkdown = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.markdown);
    setCopiedMd(true);
    triggerHaptic('light');
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyLlmPrompt = () => {
    if (!result) return;
    const prompt = generateLlmPrompt(result.markdown, result.title, promptType);
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    triggerHaptic('success');
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownloadMd = () => {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: 'text/markdown;charset=utf-8' });
    const filename = `${result.title || 'document'}.md`;
    downloadSingleFile(blob, filename);
    triggerHaptic('medium');
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: 'text/plain;charset=utf-8' });
    const filename = `${result.title || 'document'}.txt`;
    downloadSingleFile(blob, filename);
    triggerHaptic('medium');
  };

  const handleShare = async () => {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: 'text/plain;charset=utf-8' });
    const filename = `${result.title || 'document'}.txt`;
    await shareDownloadedFile({
      name: filename,
      blob,
      mimeType: 'text/plain',
    });
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">
      {/* 1. What Is This Tool Informative Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 shadow-sm flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-black text-brand-950 dark:text-brand-100">
            {loc.whatIsThisTitle}
          </h4>
          <p className="text-[11px] sm:text-xs text-brand-800 dark:text-brand-300 leading-relaxed">
            {loc.whatIsThisDesc}
          </p>
        </div>
      </div>

      {/* 2. Upload / Dropzone Card */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="relative border-2 border-dashed border-brand-500/40 hover:border-brand-500 rounded-3xl p-8 sm:p-10 text-center cursor-pointer bg-white dark:bg-slate-900 hover:bg-brand-50/20 dark:hover:bg-slate-800/60 transition-all duration-200 group shadow-sm"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-brand-200 dark:border-brand-800">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
            {loc.dropTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {loc.dropSubtitle}
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 active:scale-95 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>{loc.browseBtn}</span>
          </button>
        </div>

        {/* Supported Formats Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 max-w-xl mx-auto">
          {loc.supportedFormats.map((fmt, i) => {
            const Icon = fmt.icon;
            return (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${fmt.color}`}
              >
                <Icon className="w-3 h-3" />
                <span>{fmt.name}</span>
              </span>
            );
          })}
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-9 h-9 text-brand-600 animate-spin" />
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
              {progressMsg}
            </span>
          </div>
        )}
      </div>

      {/* 3. Results Section */}
      {result && (
        <div className="space-y-4">
          {/* Document Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-400 font-bold block">Type</span>
              <span className="font-black text-brand-600 dark:text-brand-400 uppercase">{result.fileType}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-bold block">{loc.statsWords}</span>
              <span className="font-black text-slate-800 dark:text-slate-200">
                {result.wordCount.toLocaleString()}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-bold block">{loc.statsChars}</span>
              <span className="font-black text-slate-800 dark:text-slate-200">
                {result.charCount.toLocaleString()}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-bold block">{loc.statsLines}</span>
              <span className="font-black text-slate-800 dark:text-slate-200">
                {result.lineCount.toLocaleString()}
              </span>
            </div>
            <div className="space-y-0.5 col-span-2 sm:col-span-1">
              <span className="text-slate-400 font-bold block flex items-center gap-1">
                <BrainCircuit className="w-3.5 h-3.5 text-brand-500" />
                {loc.statsTokens}
              </span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
                ~{result.estimatedTokens.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  activeTab === 'preview'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{loc.previewTab}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  activeTab === 'raw'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{loc.rawTab}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  activeTab === 'ai'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{loc.aiTab}</span>
              </button>
            </div>

            {/* Prompt Selector (When in AI Tab or Preview) */}
            {activeTab === 'ai' && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">{loc.llmPromptType}</span>
                <select
                  value={promptType}
                  onChange={(e) => setPromptType(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="summary">🧠 {loc.llmSummary}</option>
                  <option value="qna">❓ {loc.llmQna}</option>
                  <option value="extract">📊 {loc.llmExtract}</option>
                  <option value="rag">🔍 {loc.llmRag}</option>
                  <option value="translate">🌐 {loc.llmTranslate}</option>
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all"
              >
                {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMd ? loc.copied : loc.copyMd}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLlmPrompt}
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 text-brand-700 dark:text-brand-300 flex items-center gap-1.5 shadow-sm transition-all"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Zap className="w-3.5 h-3.5 text-brand-600" />}
                <span>{copiedPrompt ? loc.copied : loc.copyPrompt}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{loc.downloadTxt}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{loc.shareMd}</span>
              </button>
            </div>
          </div>

          {/* Content Viewer */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            {activeTab === 'preview' ? (
              <div
                className="p-6 sm:p-8 max-h-[550px] overflow-y-auto prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(marked.parse(result.markdown) as string) }}
              />
            ) : activeTab === 'raw' ? (
              <textarea
                readOnly
                value={result.markdown}
                className="w-full h-[500px] p-6 text-xs font-mono bg-slate-950 text-slate-100 dark:text-slate-200 resize-none focus:outline-none"
              />
            ) : (
              /* AI Prompts Tab */
              <div className="p-6 sm:p-8 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-brand-600 dark:text-brand-400 flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      <span>Ready-to-use ChatGPT & LLM Prompt</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLlmPrompt}
                      className="px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPrompt ? loc.copied : 'Copy Prompt'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono whitespace-pre-wrap max-h-80 overflow-y-auto">
                    {generateLlmPrompt(result.markdown, result.title, promptType)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!result && !isProcessing && (
        <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
          {loc.emptyNotice}
        </div>
      )}
    </div>
  );
}
