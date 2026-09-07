'use client';

import React, { useState } from 'react';
import { generateTextHash, generateFileHash, HashAlgorithm } from '@/lib/security/crypto-engine';
import { Fingerprint, UploadCloud, Copy, Check, ShieldCheck } from 'lucide-react';
import { formatBytes } from '@/lib/utils/formatters';

export function HashStudio() {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256');
  const [inputText, setInputText] = useState<string>('Miftah Tools');
  const [hashResult, setHashResult] = useState<string>('');
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);

  const computeTextHash = async (text: string, alg: HashAlgorithm) => {
    setIsHashing(true);
    try {
      const hash = await generateTextHash(text, alg);
      setHashResult(hash);
    } catch (err) {
      console.error(err);
    } finally {
      setIsHashing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize(file.size);
      setIsHashing(true);
      try {
        const hash = await generateFileHash(file, algorithm);
        setHashResult(hash);
      } catch (err) {
        console.error(err);
      } finally {
        setIsHashing(false);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(hashResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Algorithm & Mode Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'text'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Text String
          </button>
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'file'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Local File Checksum
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Hash Algorithm:
          </label>
          <select
            value={algorithm}
            onChange={(e) => {
              const alg = e.target.value as HashAlgorithm;
              setAlgorithm(alg);
              if (mode === 'text') computeTextHash(inputText, alg);
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
          >
            <option value="SHA-256">SHA-256 (Standard)</option>
            <option value="SHA-512">SHA-512 (High Security)</option>
            <option value="SHA-1">SHA-1 (Legacy)</option>
          </select>
        </div>
      </div>

      {/* Input */}
      {mode === 'text' ? (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Enter Input String
          </label>
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              computeTextHash(e.target.value, algorithm);
            }}
            placeholder="Type text to compute cryptographic hash..."
            className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 bg-slate-50 dark:bg-slate-900 transition-colors">
            <UploadCloud className="w-10 h-10 text-brand-500 mb-2" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {fileName ? `${fileName} (${formatBytes(fileSize)})` : 'Select or drag any file to verify checksum'}
            </span>
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* Result Card */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{algorithm} Digest Output</span>
          </span>

          {hashResult && (
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Hash'}</span>
            </button>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-brand-600 dark:text-brand-400 break-all select-all">
          {isHashing ? 'Computing hash...' : hashResult || 'Result will appear here'}
        </div>
      </div>
    </div>
  );
}
