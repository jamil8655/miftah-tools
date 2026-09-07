'use client';

import React, { useState } from 'react';
import { encodeBase64, decodeBase64 } from '@/lib/dev/dev-utilities';
import { FileCode, ArrowRightLeft, Copy, Check, UploadCloud } from 'lucide-react';

export function Base64Studio() {
  const [mode, setMode] = useState<'encode' | 'decode' | 'file'>('encode');
  const [inputText, setInputText] = useState<string>('Hello Miftah Tools!');
  const [outputText, setOutputText] = useState<string>(encodeBase64('Hello Miftah Tools!'));
  const [copied, setCopied] = useState<boolean>(false);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);

  const handleInputChange = (val: string) => {
    setInputText(val);
    if (mode === 'encode') {
      setOutputText(encodeBase64(val));
    } else if (mode === 'decode') {
      const res = decodeBase64(val);
      setOutputText(res.text || res.error || '');
    }
  };

  const handleModeSwitch = (newMode: 'encode' | 'decode' | 'file') => {
    setMode(newMode);
    if (newMode === 'encode') {
      setOutputText(encodeBase64(inputText));
    } else if (newMode === 'decode') {
      const res = decodeBase64(inputText);
      setOutputText(res.text || res.error || '');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setFileDataUrl(result);
        setOutputText(result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
        <button
          type="button"
          onClick={() => handleModeSwitch('encode')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'encode'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Encode Text to Base64
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch('decode')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'decode'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Decode Base64 to Text
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch('file')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'file'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          File to Base64
        </button>
      </div>

      {mode === 'file' ? (
        <div className="space-y-4">
          <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 bg-slate-50 dark:bg-slate-900">
            <UploadCloud className="w-10 h-10 text-brand-500 mb-2" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Upload any file or image to convert to Base64 URI
            </span>
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {mode === 'encode' ? 'Input Plain Text' : 'Input Base64 String'}
          </label>
          <textarea
            rows={6}
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      )}

      {/* Output result */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Output Result
          </label>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Result'}</span>
          </button>
        </div>

        <textarea
          rows={6}
          readOnly
          value={outputText}
          className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-100"
        />
      </div>
    </div>
  );
}
