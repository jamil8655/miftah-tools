'use client';

import React, { useState, useRef } from 'react';
import { FileText, Download, Copy, Check, Zap, Upload, Layers, Printer, Trash2, FileCode, Search, Settings2, CheckCircle2, BookOpen, ArrowRight, Eye } from 'lucide-react';
import { extractTextFromPdf } from '@/lib/engines/comprehensive-engines';
import { textToDocx } from '@/lib/engines/comprehensive-engines';
import { downloadSingleFile } from '@/lib/utils/download';
import { useI18n } from '@/lib/i18n/i18n-context';

export function PdfToTextStudio() {
  const { language } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [stats, setStats] = useState({ words: 0, chars: 0, lines: 0, pages: 0 });

  const calculateStats = (text: string) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text ? text.split(/\r?\n/).length : 0;
    const pageMatches = text.match(/--- Page \d+ ---/g);
    const pages = pageMatches ? pageMatches.length : 1;
    setStats({ words, chars, lines, pages });
  };

  const handleProcessFile = async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsExtracting(true);
    setProgress(10);
    setStatusText('Reading PDF structure...');

    try {
      const buffer = await selectedFile.arrayBuffer();
      const text = await extractTextFromPdf(buffer, (pct, status) => {
        setProgress(pct);
        setStatusText(status);
      });

      setExtractedText(text);
      calculateStats(text);
    } catch (err: any) {
      console.error('PDF extraction failed:', err);
      setExtractedText(`Extraction Error: ${err?.message || 'Could not parse text from this PDF.'}`);
    } finally {
      setIsExtracting(false);
      setProgress(100);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.pdf'))) {
      handleProcessFile(droppedFile);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const fileName = file ? `${file.name.replace(/\.[^/.]+$/, '')}.txt` : 'extracted-document.txt';
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    downloadSingleFile(blob, fileName);
  };

  const handleDownloadDocx = async () => {
    const fileName = file ? `${file.name.replace(/\.[^/.]+$/, '')}.docx` : 'extracted-document.docx';
    const docxBlob = await textToDocx(extractedText, file?.name.replace(/\.[^/.]+$/, '') || 'Extracted Document');
    downloadSingleFile(docxBlob, fileName);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleClear = () => {
    setFile(null);
    setExtractedText('');
    setStats({ words: 0, chars: 0, lines: 0, pages: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Studio Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-100 dark:shadow-none space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white shrink-0">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                PDF to Text &amp; Structured Layout Extractor
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Extract clean, structured, formatted UTF-8 text with preserved paragraphs, tables, and typography order.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          {extractedText && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy All Text'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                title="Print extracted text"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleDownloadDocx}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Download Word (.docx)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Clean TXT (.txt)</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900 transition-all cursor-pointer"
                title="Clear and extract another PDF"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Live Text Metrics Ribbon */}
        {extractedText && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Words</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {stats.words.toLocaleString()}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Characters</span>
              <span className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
                {stats.chars.toLocaleString()}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Lines</span>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {stats.lines.toLocaleString()}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Pages Detected</span>
              <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                {stats.pages}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace Area */}
      {!extractedText ? (
        /* Upload Area */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-10 sm:p-16 text-center bg-white dark:bg-slate-900 transition-all cursor-pointer group shadow-sm"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleProcessFile(f);
            }}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Choose a PDF document or drop it here
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Extracts all text with natural reading flow, accurate paragraph breaks, table columns, and OCR fallback for scanned sheets.
          </p>

          <button
            type="button"
            className="mt-6 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Select PDF File</span>
          </button>

          {isExtracting && (
            <div className="mt-6 max-w-sm mx-auto space-y-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{statusText}</p>
            </div>
          )}
        </div>
      ) : (
        /* Extracted Text Viewer & Live Editor */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-xs text-slate-500">Document:</span>
              <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {file?.name || 'document.pdf'}
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search within extracted text..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Textarea Editor Canvas */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
            <textarea
              value={extractedText}
              onChange={(e) => {
                setExtractedText(e.target.value);
                calculateStats(e.target.value);
              }}
              rows={24}
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm leading-relaxed outline-hidden focus:outline-hidden resize-y min-h-[500px]"
              placeholder="Extracted text will appear here..."
              spellCheck={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
