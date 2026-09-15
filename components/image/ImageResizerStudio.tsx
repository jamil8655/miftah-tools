'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Scaling, Upload, Download, Lock, Unlock, Zap, CheckCircle2, AlertCircle, RefreshCw, Sliders, Maximize2, FileImage, Layers } from 'lucide-react';
import { resizeImage, compressImageToTargetKB } from '@/lib/image/image-manipulator';
import { formatBytes } from '@/lib/utils/formatters';
import { downloadSingleFile } from '@/lib/utils/download';

export function ImageResizerStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Resize Mode: 'targetSize' | 'dimensions' | 'presets'
  const [mode, setMode] = useState<'targetSize' | 'dimensions' | 'presets'>('targetSize');

  // Mode 1: Target Size State
  const [targetSizeUnit, setTargetSizeUnit] = useState<'kb' | 'mb'>('kb');
  const [targetSizeVal, setTargetSizeVal] = useState<number>(100); // 100 KB default

  // Mode 2: Dimensions State
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [scalePercent, setScalePercent] = useState<number>(100);

  // Output Format & Quality
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

  // Processing State & Result
  const [loading, setLoading] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultDims, setResultDims] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setResultBlob(null);
      setResultUrl(null);
      setResultDims(null);
      setError(null);

      const url = URL.createObjectURL(f);
      setPreviewUrl(url);

      const img = new Image();
      img.onload = () => {
        setOriginalWidth(img.naturalWidth);
        setOriginalHeight(img.naturalHeight);
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
      };
      img.src = url;
    }
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && originalWidth > 0) {
      const ratio = originalWidth / originalHeight;
      setHeight(Math.round(val / ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setWidth(Math.round(val * ratio));
    }
  };

  const handleScalePercent = (pct: number) => {
    setScalePercent(pct);
    if (originalWidth > 0) {
      setWidth(Math.round((originalWidth * pct) / 100));
      setHeight(Math.round((originalHeight * pct) / 100));
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      if (mode === 'targetSize') {
        const totalTargetKB = targetSizeUnit === 'mb' ? targetSizeVal * 1024 : targetSizeVal;
        const res = await compressImageToTargetKB(file, totalTargetKB, format);
        setResultBlob(res.blob);
        setResultUrl(res.dataUrl);
        setResultDims({ width: res.width, height: res.height });
      } else {
        const res = await resizeImage(file, width, height, lockAspect, format, 0.92);
        setResultBlob(res.blob);
        setResultUrl(res.dataUrl);
        setResultDims({ width: res.width, height: res.height });
      }
    } catch (err: any) {
      setError(err.message || 'Image resizing failed.');
    } finally {
      setLoading(false);
    }
  };

  const targetSizePresets = [
    { label: '< 20 KB (Signature)', kb: 20 },
    { label: '< 50 KB (Passport Photo)', kb: 50 },
    { label: '< 100 KB (Govt Job)', kb: 100 },
    { label: '< 200 KB (Web Portal)', kb: 200 },
    { label: '< 500 KB (Standard)', kb: 500 },
    { label: '< 1 MB (Documents)', kb: 1024 },
    { label: '< 2 MB (Max Limit)', kb: 2048 },
    { label: '< 5 MB (High Res)', kb: 5120 },
  ];

  const presetDimensions = [
    { label: '🛂 Passport Photo (3.5x4.5 cm)', w: 413, h: 531 },
    { label: '📸 Instagram Square', w: 1080, h: 1080 },
    { label: '📱 Reel / Story / TikTok', w: 1080, h: 1920 },
    { label: '🎬 YouTube Thumbnail', w: 1280, h: 720 },
    { label: '🖥️ Full HD (1080p)', w: 1920, h: 1080 },
    { label: '📺 4K UHD (2160p)', w: 3840, h: 2160 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Scaling className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Image Resizer & Target Size Scaler</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Resize by exact pixels, percentages, passport presets, or scale to exact target file sizes in KB and MB.
            </p>
          </div>
        </div>

        {/* Dropzone */}
        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 bg-slate-50/60 dark:bg-slate-950/60 hover:bg-brand-50/20 rounded-2xl p-10 text-center cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 group-hover:scale-110 flex items-center justify-center mx-auto mb-4 transition-transform shadow-sm">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white mb-1">Click or drag & drop photo to resize</p>
            <p className="text-xs text-slate-500">Supports JPG, PNG, WebP, BMP, GIF (Up to 150 MB)</p>
          </div>
        )}

        {/* Loaded Image Settings Workspace */}
        {file && !resultUrl && (
          <div className="space-y-6">
            {/* File Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={previewUrl!}
                  alt="Preview"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-white"
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    Original: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{originalWidth} × {originalHeight} px</span> • {formatBytes(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300"
              >
                Change Image
              </button>
            </div>

            {/* Resize Method Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMode('targetSize')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'targetSize'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>By Exact File Size (KB / MB)</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('dimensions')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'dimensions'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>By Dimensions (Pixels / %)</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('presets')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'presets'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Social & Passport Presets</span>
              </button>
            </div>

            {/* TAB 1: By Target File Size (KB / MB) */}
            {mode === 'targetSize' && (
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Quick Size Presets for Government & Portal Uploads:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {targetSizePresets.map((p) => {
                      const isSelected = targetSizeUnit === 'kb' && targetSizeVal === p.kb;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            setTargetSizeUnit('kb');
                            setTargetSizeVal(p.kb);
                          }}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-left ${
                            isSelected
                              ? 'bg-brand-600 text-white border-brand-700 shadow-md shadow-brand-600/20'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Custom Target Size Input:</label>
                  <div className="flex items-center gap-2 max-w-sm">
                    <input
                      type="number"
                      min={5}
                      max={50000}
                      value={targetSizeVal}
                      onChange={(e) => setTargetSizeVal(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                    <select
                      value={targetSizeUnit}
                      onChange={(e) => setTargetSizeUnit(e.target.value as 'kb' | 'mb')}
                      className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="kb">Kilobytes (KB)</option>
                      <option value="mb">Megabytes (MB)</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    The engine will iteratively adjust resolution and compression factors to produce a file strictly under <span className="font-bold text-slate-700 dark:text-slate-300">{targetSizeVal} {targetSizeUnit.toUpperCase()}</span>.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: By Dimensions (Pixels / %) */}
            {mode === 'dimensions' && (
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Width (pixels):</label>
                    <input
                      type="number"
                      min={10}
                      max={10000}
                      value={width}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value) || 10)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Height (pixels):</label>
                    <input
                      type="number"
                      min={10}
                      max={10000}
                      value={height}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value) || 10)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setLockAspect(!lockAspect)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    {lockAspect ? <Lock className="w-3.5 h-3.5 text-brand-600" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{lockAspect ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {[25, 50, 75, 100, 150, 200].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleScalePercent(pct)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                          scalePercent === pct
                            ? 'bg-brand-600 text-white border-brand-700'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Presets */}
            {mode === 'presets' && (
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Choose Standard Dimension Preset:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {presetDimensions.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setMode('dimensions');
                        setLockAspect(false);
                        setWidth(preset.w);
                        setHeight(preset.h);
                      }}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-left transition-all flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{preset.label}</p>
                        <p className="text-[11px] font-mono text-slate-500">{preset.w} × {preset.h} px</p>
                      </div>
                      <span className="text-xs text-brand-600 font-bold">Apply</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Format Selector & Run Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Save As:</span>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="image/jpeg">JPG (Best Compression)</option>
                  <option value="image/png">PNG (Lossless Quality)</option>
                  <option value="image/webp">WebP (Modern Next-Gen)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleProcess}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>{loading ? 'Resizing & Processing...' : 'Resize & Download Image'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Result Screen */}
        {resultUrl && resultBlob && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-3xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Image Resized Successfully!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  {resultDims?.width} × {resultDims?.height} px • Final Size: <span className="font-bold font-mono">{formatBytes(resultBlob.size)}</span> (Original: {formatBytes(file!.size)})
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center max-h-72">
              <img
                src={resultUrl}
                alt="Resized Result"
                className="max-h-64 object-contain rounded-xl shadow-xs"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
                  const filename = `resized_${file?.name.replace(/\.[^/.]+$/, '')}.${ext}`;
                  downloadSingleFile(resultBlob, filename);
                }}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 text-xs sm:text-sm active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Resized Image ({formatBytes(resultBlob.size)})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setResultBlob(null);
                  setResultUrl(null);
                }}
                className="px-5 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold rounded-2xl flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Resize Another
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
