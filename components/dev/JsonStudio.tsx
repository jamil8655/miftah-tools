'use client';

import React, { useState } from 'react';
import { formatJson, validateJson } from '@/lib/dev/dev-utilities';
import { Code2, Check, Copy, AlertCircle, Sparkles, Minimize2, CheckCircle2 } from 'lucide-react';
import { downloadSingleFile } from '@/lib/utils/download';

export function JsonStudio() {
  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify(
      {
        platform: 'Miftah Tools',
        version: '2.0.0',
        privacyFirst: true,
        stats: { toolsCount: 60, speed: 'high-speed WASM' },
        features: ['PDF Tools', 'Image Converter', 'OCR', 'Dev Utilities', 'Calculators'],
      },
      null,
      2
    )
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleFormat = (spaces: number) => {
    const result = formatJson(jsonInput, spaces);
    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setErrorMsg(null);
      setJsonInput(result.formatted);
    }
  };

  const handleValidate = () => {
    const result = validateJson(jsonInput);
    if (result.valid) {
      setErrorMsg(null);
      alert('Valid JSON syntax!');
    } else {
      setErrorMsg(result.error || 'Invalid JSON');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonInput], { type: 'application/json' });
    downloadSingleFile(blob, 'formatted.json');
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleFormat(2)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors"
          >
            Beautify (2 Spaces)
          </button>
          <button
            type="button"
            onClick={() => handleFormat(4)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors"
          >
            4 Spaces
          </button>
          <button
            type="button"
            onClick={() => handleFormat(0)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors"
          >
            Minify / Compact
          </button>
          <button
            type="button"
            onClick={handleValidate}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Validate</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
          >
            Download .JSON
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Editor */}
      <div className="relative">
        <textarea
          rows={16}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste JSON string here..."
          className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
    </div>
  );
}
