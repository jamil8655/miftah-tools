'use client';

import React, { useState, useRef } from 'react';
import { Layers, Upload, Download, CheckCircle, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { generateFaviconPackage } from '@/lib/image/image-tools';

export function FaviconStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setResultBlob(null);
      setResultUrl(null);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const zipBlob = await generateFaviconPackage(file, (pct, status) => {
        setProgress(pct);
        setStatusText(status);
      });
      const url = URL.createObjectURL(zipBlob);
      setResultBlob(zipBlob);
      setResultUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to generate favicon package.');
    } finally {
      setLoading(false);
    }
  };

  const htmlSnippet = `<!-- Favicon Package Tags -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">`;

  const copyHtml = () => {
    navigator.clipboard.writeText(htmlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Favicon & Web Icon Pack Generator</h2>
            <p className="text-sm text-slate-400">Create multi-size Favicons (16x16, 32x32, 48x48, 180x180) + HTML tags in 1 click.</p>
          </div>
        </div>

        {/* Dropzone */}
        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-950/50 hover:bg-slate-900/50 rounded-2xl p-10 text-center cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:scale-110 flex items-center justify-center mx-auto mb-4 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold text-white mb-1">Click or drag & drop brand logo / image</p>
            <p className="text-xs text-slate-400">Square PNG, JPG, WebP, or SVG (Recommended: 512x512)</p>
          </div>
        )}

        {/* Selected Image */}
        {file && previewUrl && !resultUrl && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <img src={previewUrl} alt="Preview" className="w-16 h-16 rounded-xl object-contain bg-slate-900 border border-slate-700 p-1" />
              <div>
                <p className="text-sm font-semibold text-white">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>

            {loading && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{statusText}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {!loading && (
              <button
                onClick={handleGenerate}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <Layers className="w-5 h-5" />
                Generate All Favicon Sizes (.ZIP)
              </button>
            )}
          </div>
        )}

        {/* Result */}
        {resultUrl && (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold text-white">Favicon Package Ready for Web Deployment!</p>
                <p className="text-xs text-emerald-400/80">Includes 16x16, 32x32, 48x48, 180x180, 192x192, 512x512 + HTML code</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">HTML Head Code:</span>
                <button
                  onClick={copyHtml}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-amber-500/10"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <pre className="text-xs text-slate-400 font-mono overflow-x-auto p-2 bg-slate-900/60 rounded-lg">{htmlSnippet}</pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={resultUrl}
                download="miftah_favicon_pack.zip"
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                <Download className="w-5 h-5" />
                Download Favicon Pack (.ZIP)
              </a>
              <button
                onClick={() => {
                  setFile(null);
                  setResultUrl(null);
                  setPreviewUrl(null);
                }}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                New Icon
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
