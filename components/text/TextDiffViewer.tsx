'use client';

import React, { useState } from 'react';
import { compareTextDiff, DiffLineResult } from '@/lib/text/text-engine';
import { GitCompare, ArrowRightLeft, Sparkles } from 'lucide-react';

export function TextDiffViewer() {
  const [textA, setTextA] = useState<string>(
    `The quick brown fox jumps over the lazy dog.\nMiftah Tools is a comprehensive productivity suite.\nVersion 1.0 released.`
  );
  const [textB, setTextB] = useState<string>(
    `The fast brown fox jumps over the sleepy dog.\nMiftah Tools is a comprehensive productivity super app.\nVersion 2.0 released with 60+ tools.`
  );

  const diffResults = compareTextDiff(textA, textB);

  return (
    <div className="space-y-6">
      {/* Input Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Original Text (A)</span>
            <span className="text-slate-400 font-mono">{textA.split('\n').length} lines</span>
          </div>
          <textarea
            rows={8}
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Modified Text (B)</span>
            <span className="text-slate-400 font-mono">{textB.split('\n').length} lines</span>
          </div>
          <textarea
            rows={8}
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Difference Output Table */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
          <GitCompare className="w-4 h-4 text-brand-500" />
          <span>Line-by-Line Comparison Results</span>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 font-mono text-xs max-h-96 overflow-y-auto">
          {diffResults.map((line, idx) => (
            <div
              key={idx}
              className={`p-2 px-3 flex items-start gap-2 border-b border-slate-100 dark:border-slate-800/60 ${
                line.type === 'added'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                  : line.type === 'removed'
                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="w-4 font-bold select-none shrink-0">
                {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
              </span>
              <span className="whitespace-pre-wrap break-all">{line.value || ' '}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
