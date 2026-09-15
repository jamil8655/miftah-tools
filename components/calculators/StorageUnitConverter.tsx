'use client';

import React, { useState } from 'react';
import { Binary, Copy, Check, Zap, ArrowRightLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

type UnitType = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';

const UNITS: { id: UnitType; label: string; decName: string; binName: string }[] = [
  { id: 'B', label: 'Bytes', decName: 'Bytes (B)', binName: 'Bytes (B)' },
  { id: 'KB', label: 'KB / KiB', decName: 'Kilobytes (KB)', binName: 'Kibibytes (KiB)' },
  { id: 'MB', label: 'MB / MiB', decName: 'Megabytes (MB)', binName: 'Mebibytes (MiB)' },
  { id: 'GB', label: 'GB / GiB', decName: 'Gigabytes (GB)', binName: 'Gibibytes (GiB)' },
  { id: 'TB', label: 'TB / TiB', decName: 'Terabytes (TB)', binName: 'Tebibytes (TiB)' },
  { id: 'PB', label: 'PB / PiB', decName: 'Petabytes (PB)', binName: 'Pebibytes (PiB)' },
];

export function StorageUnitConverter() {
  const { t } = useI18n();
  const [inputValue, setInputValue] = useState<number>(1);
  const [sourceUnit, setSourceUnit] = useState<UnitType>('GB');
  const [isBinary, setIsBinary] = useState<boolean>(false); // false = Decimal 1000, true = Binary 1024
  const [copiedUnit, setCopiedUnit] = useState<string | null>(null);

  const base = isBinary ? 1024 : 1000;

  const unitPowers: Record<UnitType, number> = {
    B: 0,
    KB: 1,
    MB: 2,
    GB: 3,
    TB: 4,
    PB: 5,
  };

  // Convert input value to raw bytes first
  const inputBytes = (inputValue || 0) * Math.pow(base, unitPowers[sourceUnit]);

  // Compute all units
  const results = UNITS.map((unit) => {
    const power = unitPowers[unit.id];
    const val = inputBytes / Math.pow(base, power);
    return {
      unit: unit.id,
      name: isBinary ? unit.binName : unit.decName,
      value: val,
      formatted:
        unit.id === 'B'
          ? Math.round(val).toLocaleString()
          : val < 0.00001 && val > 0
          ? val.toExponential(4)
          : parseFloat(val.toFixed(6)).toString(),
    };
  });

  const handleCopy = (text: string, unit: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUnit(unit);
    setTimeout(() => setCopiedUnit(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Controls: Input value, Source Unit, Decimal vs Binary Switch */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Binary className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Digital Storage Unit Converter
              </h3>
              <p className="text-xs text-slate-500">
                Real-time multi-unit conversion with mathematical breakdown
              </p>
            </div>
          </div>

          {/* Decimal vs Binary Standard Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsBinary(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isBinary
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Decimal (1000 KB)
            </button>
            <button
              type="button"
              onClick={() => setIsBinary(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isBinary
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Binary (1024 KiB)
            </button>
          </div>
        </div>

        {/* Value and Unit Input */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Enter Value to Convert
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={inputValue}
              onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              From Unit
            </label>
            <select
              value={sourceUnit}
              onChange={(e) => setSourceUnit(e.target.value as UnitType)}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {isBinary ? u.binName : u.decName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-500">Quick Presets:</span>
          {[
            { label: '500 MB', val: 500, unit: 'MB' as UnitType },
            { label: '1 GB', val: 1, unit: 'GB' as UnitType },
            { label: '4.7 GB (DVD)', val: 4.7, unit: 'GB' as UnitType },
            { label: '25 GB (Blu-ray)', val: 25, unit: 'GB' as UnitType },
            { label: '1 TB (Drive)', val: 1, unit: 'TB' as UnitType },
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputValue(preset.val);
                setSourceUnit(preset.unit);
              }}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversion Results Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
          <span>Converted Equivalent Units</span>
          <span className="text-brand-600 dark:text-brand-400">
            {isBinary ? 'Binary Base 1024' : 'Decimal Base 1000'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {results.map((res) => {
            const isSelected = res.unit === sourceUnit;
            return (
              <div
                key={res.unit}
                className={`p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-brand-50/70 dark:bg-brand-950/30 border-brand-300 dark:border-brand-700 shadow-sm ring-1 ring-brand-400/30'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                    {res.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(res.formatted, res.unit)}
                    className="p-1 rounded-md text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Copy value"
                  >
                    {copiedUnit === res.unit ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-50 font-mono truncate">
                  {res.formatted}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Formula and Explanation Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/20 space-y-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
          <Zap className="w-4 h-4 text-brand-500" />
          <span>Mathematical Calculation Formula</span>
        </div>
        <p className="font-mono bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          {inputValue} {sourceUnit} = {inputValue} × {base}
          <sup>{unitPowers[sourceUnit]}</sup> Bytes = {inputBytes.toLocaleString()} Bytes
        </p>
        <p className="text-[11px] text-slate-500">
          * Decimal standard (SI) uses 1000 multipliers (used by storage drive manufacturers & macOS). Binary standard (IEC) uses 1024 multipliers (used by Windows RAM and filesystem OS).
        </p>
      </div>
    </div>
  );
}
