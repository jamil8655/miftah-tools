'use client';

import React, { useState, useRef } from 'react';
import { FileText, UploadCloud, Copy, Check, Download, Share2, Zap, Eye, Code2, FileSpreadsheet, FileCode, Layers, FileArchive, RefreshCw, Cpu, BrainCircuit } from 'lucide-react';
import {
  universalMarkItDown,
  generateLlmPrompt,
  MarkItDownResult,
} from '@/lib/engines/markitdown-engine';
import { downloadSingleFile, shareDownloadedFile } from '@/lib/utils/download';
import { marked } from 'marked';
import { sanitizeHtml } from '@/lib/utils/sanitizer';
import { useI18n } from '@/lib/i18n/i18n-context';

const STUDIO_LOCALES = {
  en: {
    badge: 'Microsoft MarkItDown Core Engine',
    title: 'Universal AI Document to Markdown Studio',
    subtitle:
      'Convert PDF, Office Word, PowerPoint, Excel, Images, CSV, JSON, and ZIP packages into clean, structured Markdown optimized for LLMs and AI workflows.',
    dropTitle: 'Drop ANY document or media file here',
    dropSubtitle: 'Supports PDF, DOCX, PPTX, XLSX, CSV, JSON, XML, HTML, Images (OCR), Audio, ZIP, & Code',
    browseBtn: 'Browse File',
    converting: 'Parsing document structures...',
    previewTab: 'Rendered Preview',
    rawTab: 'Raw Markdown',
    copyMd: 'Copy Markdown',
    copyPrompt: 'Copy as LLM Prompt',
    downloadMd: 'Download .md',
    shareMd: 'Share .md',
    copied: 'Copied!',
    statsChars: 'Characters',
    statsWords: 'Words',
    statsLines: 'Lines',
    statsTokens: 'Est. LLM Tokens',
    llmPromptType: 'Prompt Template:',
    llmSummary: 'Executive Summary',
    llmQna: 'Q&A Assistant',
    llmExtract: 'Fact Extraction',
    llmRag: 'RAG Context Ingestion',
    llmTranslate: 'Translate Content',
    emptyNotice: 'Upload a file above to inspect and convert into structured Markdown.',
  },
  ur: {
    badge: 'مائیکروسافٹ مارک اِٹ ڈاؤن کور انجن',
    title: 'یونیورسل اے آئی ڈاکومنٹ ٹو مارک ڈاؤن اسٹوڈیو',
    subtitle:
      'پی ڈی ایف، ورڈ، پاورپوائنٹ، ایکسل، تصاویر، سی ایس وی، جے سن، اور زپ فائلوں کو جدید اور منظم مارک ڈاؤن میں تبدیل کریں جو چیٹ جی پی ٹی، کلاڈ اور جیمنائی کے لیے 100% تیار ہے۔',
    dropTitle: 'کوئی بھی دستاویز یا فائل یہاں ڈراپ کریں',
    dropSubtitle: 'سپورٹ: PDF, DOCX, PPTX, XLSX, CSV, JSON, XML, HTML, Images (OCR), Audio, ZIP اور کوڈ',
    browseBtn: 'فائل منتخب کریں',
    converting: 'دستاویز کا ڈھانچہ پڑھا جا رہا ہے...',
    previewTab: 'ریویو اور پریویو',
    rawTab: 'خام مارک ڈاؤن',
    copyMd: 'مارک ڈاؤن کاپی کریں',
    copyPrompt: 'اے آئی پرامپٹ بنائیں',
    downloadMd: 'ڈاؤنلوڈ .md',
    shareMd: 'شیئر .md',
    copied: 'کاپی ہو گیا!',
    statsChars: 'حروف',
    statsWords: 'الفاظ',
    statsLines: 'سطریں',
    statsTokens: 'متوقع AI ٹوکنز',
    llmPromptType: 'پرامپٹ سانچہ:',
    llmSummary: 'جامع خلاصہ',
    llmQna: 'سوال و جواب اسسٹنٹ',
    llmExtract: 'اہم حقائق و ڈیٹا',
    llmRag: 'RAG ڈیٹا انٹیک',
    llmTranslate: 'ترجمہ کریں',
    emptyNotice: 'منظم مارک ڈاؤن میں تبدیل کرنے کے لیے اوپر فائل اپ لوڈ کریں۔',
  },
  ar: {
    badge: 'محرك مايكروسوفت MarkItDown المتطور',
    title: 'استوديو التحويل الشامل إلى ماركداون للذكاء الاصطناعي',
    subtitle:
      'تحويل ملفات PDF وWord وPowerPoint وExcel والصور وCSV وJSON وZIP إلى كود Markdown عالي الهيكلية ومُحسَّن لنماذج الذكاء الاصطناعي.',
    dropTitle: 'أسقط أي مستند أو ملف هنا',
    dropSubtitle: 'يدعم: PDF, DOCX, PPTX, XLSX, CSV, JSON, XML, HTML, الصور (OCR), الصوتيات, ZIP',
    browseBtn: 'تصفح الملفات',
    converting: 'جاري استخراج وتحليل المستند...',
    previewTab: 'المعاينة المنسقة',
    rawTab: 'كود Markdown الخام',
    copyMd: 'نسخ Markdown',
    copyPrompt: 'نسخ كأمر ذكاء اصطناعي',
    downloadMd: 'تحميل .md',
    shareMd: 'مشاركة .md',
    copied: 'تم النسخ!',
    statsChars: 'الحروف',
    statsWords: 'الكلمات',
    statsLines: 'الأسطر',
    statsTokens: 'تقدير توكنز الذكاء الاصطناعي',
    llmPromptType: 'قالب الأمر (Prompt):',
    llmSummary: 'ملخص تنفيذي',
    llmQna: 'سؤال وجواب',
    llmExtract: 'استخراج الحقائق والبيانات',
    llmRag: 'معالجة RAG المتقدمة',
    llmTranslate: 'ترجمة المحتوى',
    emptyNotice: 'قم برفع ملف في الأعلى لتحويله مباشرة إلى كود ماركداون منظم.',
  },
  hi: {
    badge: 'माइक्रोसॉफ्ट MarkItDown कोर इंजन',
    title: 'यूनिवर्सल AI डॉक्यूमेंट टू मार्कडाउन स्टूडियो',
    subtitle:
      'PDF, Word, PowerPoint, Excel, इमेजेस, CSV, JSON, और ZIP फाइलों को स्वच्छ, संरचित Markdown में बदलें जो ChatGPT, Claude और Gemini के लिए अनुकूलित है।',
    dropTitle: 'कोई भी दस्तावेज़ या मीडिया फ़ाइल यहाँ डालें',
    dropSubtitle: 'सपोर्ट: PDF, DOCX, PPTX, XLSX, CSV, JSON, XML, HTML, Images (OCR), Audio, ZIP और कोड',
    browseBtn: 'फ़ाइल चुनें',
    converting: 'दस्तावेज़ की संरचना का विश्लेषण किया जा रहा है...',
    previewTab: 'फॉर्मेटेड पूर्वावलोकन',
    rawTab: 'रॉ मार्कडाउन',
    copyMd: 'मार्कडाउन कॉपी करें',
    copyPrompt: 'AI प्रॉम्प्ट कॉपी करें',
    downloadMd: 'डाउनलोड .md',
    shareMd: 'शेयर .md',
    copied: 'कॉपी हो गया!',
    statsChars: 'अक्षर',
    statsWords: 'शब्द',
    statsLines: 'पंक्तियाँ',
    statsTokens: 'अनुमानित AI टोकन्स',
    llmPromptType: 'प्रॉम्प्ट टेम्पलेट:',
    llmSummary: 'कार्यकारी सारांश',
    llmQna: 'प्रश्न व उत्तर',
    llmExtract: 'मुख्य तथ्य व डेटा',
    llmRag: 'RAG डेटा इंजेक्शन',
    llmTranslate: 'अनुवाद करें',
    emptyNotice: 'संरचित मार्कडाउन में बदलने के लिए ऊपर कोई भी फ़ाइल अपलोड करें।',
  },
};

export function MarkItDownStudio() {
  const { language } = useI18n();
  const loc = STUDIO_LOCALES[language as keyof typeof STUDIO_LOCALES] || STUDIO_LOCALES.en;

  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
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
    try {
      const res = await universalMarkItDown(file, {
        includeMetadata: true,
        onProgress: (pct, status) => setProgressMsg(status),
      });
      setResult(res);
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
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyLlmPrompt = () => {
    if (!result) return;
    const prompt = generateLlmPrompt(result.markdown, result.title, promptType);
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: 'text/markdown;charset=utf-8' });
    const filename = `${result.title || 'document'}.md`;
    downloadSingleFile(blob, filename);
  };

  const handleShare = async () => {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: 'text/markdown;charset=utf-8' });
    const filename = `${result.title || 'document'}.md`;
    await shareDownloadedFile({
      name: filename,
      blob,
      mimeType: 'text/markdown',
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="relative border-2 border-dashed border-brand-500/30 hover:border-brand-500 rounded-3xl p-8 sm:p-10 text-center cursor-pointer bg-brand-50/20 dark:bg-brand-950/10 hover:bg-brand-50/40 dark:hover:bg-brand-950/20 transition-all duration-200 group"
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
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {loc.dropTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {loc.dropSubtitle}
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-md hover:bg-brand-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>{loc.browseBtn}</span>
          </button>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              {progressMsg}
            </span>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-4">
          {/* Document Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-500 block">Type</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{result.fileType}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-500 block">{loc.statsWords}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {result.wordCount.toLocaleString()}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-500 block">{loc.statsChars}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {result.charCount.toLocaleString()}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-500 block">{loc.statsLines}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {result.lineCount.toLocaleString()}
              </span>
            </div>
            <div className="space-y-0.5 col-span-2 sm:col-span-1">
              <span className="text-slate-500 block flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 text-brand-500" />
                {loc.statsTokens}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ~{result.estimatedTokens.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'preview'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{loc.previewTab}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'raw'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{loc.rawTab}</span>
              </button>
            </div>

            {/* Prompt Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-slate-500 hidden md:inline">{loc.llmPromptType}</span>
              <select
                value={promptType}
                onChange={(e) => setPromptType(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="summary">🧠 {loc.llmSummary}</option>
                <option value="qna">❓ {loc.llmQna}</option>
                <option value="extract">📊 {loc.llmExtract}</option>
                <option value="rag">🔍 {loc.llmRag}</option>
                <option value="translate">🌐 {loc.llmTranslate}</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm transition-all"
              >
                {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMd ? loc.copied : loc.copyMd}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLlmPrompt}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 text-brand-700 dark:text-brand-300 flex items-center gap-1.5 shadow-sm transition-all"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Zap className="w-3.5 h-3.5 text-brand-600" />}
                <span>{copiedPrompt ? loc.copied : loc.copyPrompt}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{loc.downloadMd}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{loc.shareMd}</span>
              </button>
            </div>
          </div>

          {/* Content Viewer */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-inner">
            {activeTab === 'preview' ? (
              <div
                className="p-6 max-h-[550px] overflow-y-auto prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(marked.parse(result.markdown) as string) }}
              />
            ) : (
              <textarea
                readOnly
                value={result.markdown}
                className="w-full h-[500px] p-4 text-xs font-mono bg-slate-950 text-slate-100 dark:text-slate-200 resize-none focus:outline-none"
              />
            )}
          </div>
        </div>
      )}

      {!result && !isProcessing && (
        <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
          {loc.emptyNotice}
        </div>
      )}
    </div>
  );
}
