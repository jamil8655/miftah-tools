'use client';

import React, { useState } from 'react';
import {
  getTextStats,
  convertCase,
  removeDuplicateLines,
  removeExtraSpaces,
  sortLines,
  CaseType,
} from '@/lib/text/text-engine';
import { downloadSingleFile } from '@/lib/utils/download';
import { textToPdf } from '@/lib/pdf/pdf-manipulator';
import {
  Type,
  Copy,
  Check,
  Download,
  Trash2,
  ListFilter,
  ArrowUpDown,
  Clock,
  Mic,
  FileText,
} from 'lucide-react';

export function TextStudio() {
  const [text, setText] = useState<string>(
    `Welcome to Miftah Tools Text Studio!\n\nMiftah Tools is a high-performance, privacy-first digital utility suite. You can analyze word count, convert cases, deduplicate lines, format text, and export your writing to PDF or TXT directly in your browser.`
  );
  const [copied, setCopied] = useState<boolean>(false);

  const stats = getTextStats(text);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCaseChange = (type: CaseType) => {
    setText(convertCase(text, type));
  };

  const handleRemoveDuplicates = () => {
    setText(removeDuplicateLines(text));
  };

  const handleRemoveExtraSpaces = () => {
    setText(removeExtraSpaces(text));
  };

  const handleSort = (mode: 'a-z' | 'z-a' | 'length-asc' | 'length-desc' | 'reverse' | 'shuffle') => {
    setText(sortLines(text, mode));
  };

  const handleExportTxt = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    downloadSingleFile(blob, 'miftah-text-export.txt');
  };

  const handleExportPdf = async () => {
    const pdfBytes = await textToPdf(text, { fontSize: 11 });
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    downloadSingleFile(blob, 'miftah-text-export.pdf');
  };

  return (
    <div className="space-y-6">
      {/* Live Statistics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-slate-400">Words</span>
          <div className="text-xl font-extrabold text-brand-600 dark:text-brand-400 font-mono">
            {stats.words.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-slate-400">Characters</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {stats.characters.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-slate-400">No Spaces</span>
          <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300 font-mono">
            {stats.charactersNoSpaces.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-slate-400">Sentences / Lines</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {stats.sentences} / {stats.lines}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> Read Time
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.readingTimeMinutes}m
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <Mic className="w-3 h-3 text-slate-400" /> Speak Time
          </span>
          <div className="text-xl font-extrabold text-teal-600 dark:text-teal-400 font-mono">
            {stats.speakingTimeMinutes}m
          </div>
        </div>
      </div>

      {/* Editor & Actions Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        {/* Case conversion buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 mr-1">Case:</span>
          {[
            { id: 'upper', label: 'UPPERCASE' },
            { id: 'lower', label: 'lowercase' },
            { id: 'title', label: 'Title Case' },
            { id: 'sentence', label: 'Sentence case' },
            { id: 'camel', label: 'camelCase' },
            { id: 'snake', label: 'snake_case' },
            { id: 'kebab', label: 'kebab-case' },
            { id: 'pascal', label: 'PascalCase' },
            { id: 'constant', label: 'CONSTANT_CASE' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCaseChange(c.id as CaseType)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Line Tools & Sorting */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 mr-1">Tools:</span>
          <button
            type="button"
            onClick={handleRemoveDuplicates}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1"
          >
            <ListFilter className="w-3.5 h-3.5 text-brand-500" />
            <span>Remove Duplicates</span>
          </button>

          <button
            type="button"
            onClick={handleRemoveExtraSpaces}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
          >
            Trim Spaces
          </button>

          <button
            type="button"
            onClick={() => handleSort('a-z')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-500" />
            <span>Sort A-Z</span>
          </button>

          <button
            type="button"
            onClick={() => handleSort('z-a')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
          >
            Sort Z-A
          </button>

          <button
            type="button"
            onClick={() => handleSort('length-asc')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
          >
            Sort by Length
          </button>

          <button
            type="button"
            onClick={() => handleSort('shuffle')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
          >
            Shuffle Lines
          </button>
        </div>
      </div>

      {/* Textarea Workspace */}
      <div className="relative">
        <textarea
          rows={14}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm sm:text-base text-slate-800 dark:text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
        />
      </div>

      {/* Global Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setText('')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Text</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportTxt}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export TXT</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 flex items-center justify-center gap-1.5 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
