'use client';

import React, { useState, useEffect } from 'react';
import {
  generatePassword,
  checkPasswordStrength,
  generateUuid,
  PasswordOptions,
  PasswordStrength,
} from '@/lib/security/crypto-engine';
import { KeyRound, RefreshCw, Copy, Check, ShieldCheck, ShieldAlert, Zap } from 'lucide-react';

export function PasswordStudio() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
  });

  const [password, setPassword] = useState<string>('');
  const [strength, setStrength] = useState<PasswordStrength>(checkPasswordStrength(''));
  const [copied, setCopied] = useState<boolean>(false);
  const [uuid, setUuid] = useState<string>('');

  const handleGenerate = () => {
    const newPass = generatePassword(options);
    setPassword(newPass);
    setStrength(checkPasswordStrength(newPass));
  };

  useEffect(() => {
    handleGenerate();
    setUuid(generateUuid());
  }, [options]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Generated Password Card */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Generated Secure Password
          </label>
          <button
            type="button"
            onClick={handleGenerate}
            className="px-3 py-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 rounded-lg flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New</span>
          </button>
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setStrength(checkPasswordStrength(e.target.value));
            }}
            className="w-full px-4 py-3.5 pr-24 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-base font-bold text-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={() => handleCopy(password)}
            className="absolute right-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Strength Meter Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-500">Security Score:</span>
            <span
              className={`font-bold ${
                strength.score >= 3
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : strength.score === 2
                  ? 'text-amber-500'
                  : 'text-rose-500'
              }`}
            >
              {strength.label} ({strength.entropy} Bits Entropy • Crack time: {strength.crackTime})
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex gap-1">
            {[0, 1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  strength.score > step
                    ? strength.score >= 3
                      ? 'bg-emerald-500'
                      : strength.score === 2
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                    : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Generator Options */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Password Customization Options
        </h3>

        {/* Length Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Password Length</span>
            <span className="text-brand-600 font-mono">{options.length} Characters</span>
          </div>
          <input
            type="range"
            min="8"
            max="64"
            value={options.length}
            onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
            className="w-full accent-brand-600"
          />
        </div>

        {/* Checkbox Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeUppercase}
              onChange={(e) => setOptions({ ...options, includeUppercase: e.target.checked })}
              className="rounded text-brand-600 w-4 h-4"
            />
            <span>Include Uppercase Letters (A-Z)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeLowercase}
              onChange={(e) => setOptions({ ...options, includeLowercase: e.target.checked })}
              className="rounded text-brand-600 w-4 h-4"
            />
            <span>Include Lowercase Letters (a-z)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })}
              className="rounded text-brand-600 w-4 h-4"
            />
            <span>Include Numbers (0-9)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeSymbols}
              onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })}
              className="rounded text-brand-600 w-4 h-4"
            />
            <span>Include Symbols (!@#$%^&*)</span>
          </label>
        </div>
      </div>

      {/* UUID v4 Quick Generator */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <span className="text-[10px] font-bold uppercase text-slate-400">Random UUID (v4)</span>
          <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
            {uuid}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const newUid = generateUuid();
            setUuid(newUid);
            handleCopy(newUid);
          }}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shrink-0"
        >
          Copy UUID
        </button>
      </div>
    </div>
  );
}
