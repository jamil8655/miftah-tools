'use client';

import React, { useState } from 'react';
import {
  Code,
  Terminal,
  Key,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Server,
  Cpu,
  BookOpen,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function DevelopersPage() {
  const [activeLang, setActiveLang] = useState<'curl' | 'js' | 'python'>('curl');
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState('nexora_live_sk_99a8b7c6d5e4f3a2b1');
  const [keyCopied, setKeyCopied] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const codeSnippets = {
    curl: `curl -X POST https://nexora-tools-vgti.onrender.com/api/v1/compress-pdf \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@document.pdf" \\
  -F "preset=balanced"`,
    js: `import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

const form = new FormData();
form.append('file', fs.createReadStream('document.pdf'));
form.append('preset', 'balanced');

const res = await axios.post('https://nexora-tools-vgti.onrender.com/api/v1/compress-pdf', form, {
  headers: {
    ...form.getHeaders(),
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  responseType: 'arraybuffer'
});

fs.writeFileSync('compressed.pdf', res.data);`,
    python: `import requests

with open('document.pdf', 'rb') as f:
    res = requests.post(
        'https://nexora-tools-vgti.onrender.com/api/v1/compress-pdf',
        headers={'Authorization': 'Bearer YOUR_API_KEY'},
        files={'file': f},
        data={'preset': 'balanced'}
    )

with open('compressed.pdf', 'wb') as f:
    f.write(res.content)`,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-300 pb-20">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
          <Terminal className="w-3.5 h-3.5 text-brand-600" />
          <span>Miftah Tools Developer Platform • v1 REST API & SDKs</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          High-Performance Developer API
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Integrate PDF compression, AI background removal, OCR extraction, and 4K media processing directly into your apps and backends.
        </p>
      </div>

      {/* API Key Management Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-600" />
              <span>Your Developer API Key</span>
            </h3>
            <p className="text-xs text-slate-500">
              Use this key in the <code className="font-mono text-brand-600">Authorization: Bearer</code> header.
            </p>
          </div>

          <button
            type="button"
            onClick={copyApiKey}
            className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
          >
            {keyCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{keyCopied ? 'Copied' : 'Copy Key'}</span>
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <span>{apiKey}</span>
          <span className="text-[10px] font-bold text-emerald-600 uppercase">ACTIVE (5,000 req/mo)</span>
        </div>
      </div>

      {/* Code Snippets & Endpoints */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-2xl space-y-5 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-0.5">
            <span className="text-xs font-mono text-brand-400 font-bold">POST /api/v1/compress-pdf</span>
            <h4 className="font-bold text-sm text-white">Example PDF Compression Request</h4>
          </div>

          <div className="flex items-center gap-2">
            {(['curl', 'js', 'python'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg uppercase ${
                  activeLang === lang ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}

            <button
              type="button"
              onClick={() => copyCode(codeSnippets[activeLang])}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white ml-2"
              title="Copy Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-2xl bg-slate-950 text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800/80 leading-relaxed">
          <code>{codeSnippets[activeLang]}</code>
        </pre>
      </div>

      {/* Endpoints Reference Grid */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand-600" />
          <span>Core REST API Endpoints</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            { method: 'POST', path: '/api/v1/compress-pdf', desc: 'Compress PDF documents with custom strength' },
            { method: 'POST', path: '/api/v1/pdf-to-docx', desc: 'Extract text & layout into editable Word (.docx)' },
            { method: 'POST', path: '/api/v1/remove-background', desc: 'Generate transparent cutout PNG' },
            { method: 'POST', path: '/api/v1/video-to-mp3', desc: 'Extract 320kbps MP3 audio stream from video' },
            { method: 'POST', path: '/api/v1/image-resizer', desc: 'Resize image to exact dimensions or KB limit' },
            { method: 'GET', path: '/api/v1/health', desc: 'Live health status of processing clusters' },
          ].map((ep) => (
            <div
              key={ep.path}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1"
            >
              <div className="flex items-center gap-2 font-mono">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {ep.method}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{ep.path}</span>
              </div>
              <p className="text-[11px] text-slate-500">{ep.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
