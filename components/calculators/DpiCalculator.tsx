'use client';

import React, { useState } from 'react';
import { Printer, Zap } from 'lucide-react';

export function DpiCalculator() {
  const [widthPx, setWidthPx] = useState<number>(3000);
  const [heightPx, setHeightPx] = useState<number>(2000);
  const [dpi, setDpi] = useState<number>(300);

  const widthInches = widthPx / dpi;
  const heightInches = heightPx / dpi;
  const widthCm = widthInches * 2.54;
  const heightCm = heightInches * 2.54;
  const megapixels = (widthPx * heightPx) / 1000000;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              DPI & Print Resolution Calculator
            </h3>
            <p className="text-xs text-slate-500">
              Calculate exact physical print dimensions from digital pixels and target DPI
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Width (Pixels)
            </label>
            <input
              type="number"
              min="1"
              value={widthPx}
              onChange={(e) => setWidthPx(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Height (Pixels)
            </label>
            <input
              type="number"
              min="1"
              value={heightPx}
              onChange={(e) => setHeightPx(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Print Quality (DPI)
            </label>
            <select
              value={dpi}
              onChange={(e) => setDpi(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="72">72 DPI (Web Screen)</option>
              <option value="150">150 DPI (Newspaper / Medium)</option>
              <option value="300">300 DPI (High Quality Print / Books)</option>
              <option value="600">600 DPI (Ultra Fine Art)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Output Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-xs font-semibold text-slate-500">Print Size (Inches)</span>
          <div className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
            {widthInches.toFixed(2)}″ × {heightInches.toFixed(2)}″
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-xs font-semibold text-slate-500">Print Size (Centimeters)</span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {widthCm.toFixed(1)} cm × {heightCm.toFixed(1)} cm
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-xs font-semibold text-slate-500">Total Resolution</span>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
            {megapixels.toFixed(1)} Megapixels
          </div>
        </div>
      </div>
    </div>
  );
}
