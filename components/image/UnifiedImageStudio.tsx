'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Sliders,
  Crop,
  RotateCw,
  Download,
  Upload,
  Zap,
  CheckCircle2,
  Palette,
  EyeOff,
  Sun,
  Contrast,
  Layers,
  Share2,
} from 'lucide-react';
import { downloadSingleFile, shareDownloadedFile } from '@/lib/utils/download';
import { formatBytes } from '@/lib/utils/formatters';
import { triggerHaptic } from '@/lib/motion/motion-system';

export function UnifiedImageStudio() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'filter' | 'resize' | 'compress' | 'convert'>('filter');

  // Sliders State
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [rotation, setRotation] = useState(0);

  // Resize State
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(1200);
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);

  // Compression & Format
  const [targetKb, setTargetKb] = useState<number>(100);
  const [targetFormat, setTargetFormat] = useState<string>('image/jpeg');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageSrc(url);

      const img = new Image();
      img.onload = () => {
        originalImageRef.current = img;
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
        setAspectRatio(img.naturalWidth / img.naturalHeight);
        renderPreview();
      };
      img.src = url;
    }
  };

  const renderPreview = () => {
    const canvas = canvasRef.current;
    const img = originalImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw rotated & filtered canvas
    if (rotation === 90 || rotation === 270) {
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
    } else {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
  };

  useEffect(() => {
    renderPreview();
  }, [brightness, contrast, grayscale, sepia, rotation]);

  const handleDownloadOutput = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageFile) return;

    triggerHaptic('medium');
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const ext = targetFormat === 'image/png' ? 'png' : targetFormat === 'image/webp' ? 'webp' : 'jpg';
        const outName = `${imageFile.name.replace(/\.[^/.]+$/, '')}_studio.${ext}`;
        downloadSingleFile(blob, outName);
      },
      targetFormat,
      0.92
    );
  };

  const handleShareOutput = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageFile) return;

    triggerHaptic('light');
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const ext = targetFormat === 'image/png' ? 'png' : targetFormat === 'image/webp' ? 'webp' : 'jpg';
        const outName = `${imageFile.name.replace(/\.[^/.]+$/, '')}_studio.${ext}`;
        shareDownloadedFile({ name: outName, blob, mimeType: targetFormat });
      },
      targetFormat,
      0.92
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>Unified Image Studio • Live Filters & Multi-Format Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {imageFile ? imageFile.name : 'All-in-One Photo & Image Studio'}
          </h2>
          {imageFile && (
            <p className="text-xs text-slate-500 font-mono">
              Original: {formatBytes(imageFile.size)} • Dimensions: {width} × {height}px
            </p>
          )}
        </div>

        <div>
          <input
            id="studio-img-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button
            type="button"
            onClick={() => document.getElementById('studio-img-upload')?.click()}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>{imageFile ? 'Change Photo' : 'Open Image'}</span>
          </button>
        </div>
      </div>

      {!imageFile ? (
        <div
          onClick={() => document.getElementById('studio-img-upload')?.click()}
          className="p-16 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-center space-y-4 hover:border-blue-500 transition-all cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              Open Any Image in Unified Studio
            </h3>
            <p className="text-xs text-slate-500">
              Apply live HD filters, resize dimensions, convert to WebP/PNG/JPG, and compress to exact KB.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
              {[
                { id: 'filter', label: 'Filters & Lighting' },
                { id: 'resize', label: 'Resize & Rotate' },
                { id: 'compress', label: 'Exact KB' },
                { id: 'convert', label: 'Convert Format' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
                    activeTab === t.id
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* A. Filters Panel */}
            {activeTab === 'filter' && (
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Brightness:</span>
                    <span className="font-mono">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={180}
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Contrast:</span>
                    <span className="font-mono">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={180}
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Grayscale B&W:</span>
                    <span className="font-mono">{grayscale}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={grayscale}
                    onChange={(e) => setGrayscale(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            )}

            {/* B. Resize & Rotate Panel */}
            {activeTab === 'resize' && (
              <div className="space-y-4 pt-2">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="w-4 h-4" /> Rotate 90° (Current: {rotation}°)
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Width (px):</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Height (px):</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* C. Exact KB & MB Target Size Panel */}
            {activeTab === 'compress' && (
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Target Size Limit:</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400 font-extrabold text-xs px-2.5 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800">
                    🎯 {targetKb >= 1024 ? `${(targetKb / 1024).toFixed(targetKb % 1024 === 0 ? 0 : 1)} MB` : `${targetKb} KB`}
                  </span>
                </div>

                {/* Left-to-Right Range Slider */}
                <div className="space-y-1.5">
                  <input
                    type="range"
                    min={20}
                    max={10240}
                    step={20}
                    value={targetKb}
                    onChange={(e) => setTargetKb(Number(e.target.value))}
                    className="w-full accent-brand-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>20 KB</span>
                    <span>500 KB</span>
                    <span>2 MB</span>
                    <span>5 MB</span>
                    <span>10 MB</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[50, 100, 200, 500, 1024, 2048, 5120].map((kb) => (
                    <button
                      key={kb}
                      type="button"
                      onClick={() => setTargetKb(kb)}
                      className={`py-2 text-[11px] font-bold rounded-xl border transition-all ${
                        targetKb === kb
                          ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* D. Convert Format Panel */}
            {activeTab === 'convert' && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Export Format:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'image/jpeg', label: 'JPG' },
                    { id: 'image/png', label: 'PNG' },
                    { id: 'image/webp', label: 'WebP' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setTargetFormat(fmt.id)}
                      className={`py-2 text-xs font-bold rounded-xl border ${
                        targetFormat === fmt.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Download & Share Actions */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDownloadOutput}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Image</span>
              </button>

              <button
                type="button"
                onClick={handleShareOutput}
                className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-extrabold text-xs sm:text-sm rounded-2xl shadow-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Share Image</span>
              </button>
            </div>
          </div>

          {/* Canvas Live Preview */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center min-h-[480px]">
            <div className="shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-w-full max-h-[460px]">
              <canvas ref={canvasRef} className="max-w-full max-h-[460px] object-contain block" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
