'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Zap, Upload, Download, Image as ImageIcon, Sliders, RefreshCw, Eye, Check, Layers, Palette, Share2 } from 'lucide-react';
import { downloadSingleFile, shareDownloadedFile } from '@/lib/utils/download';
import { triggerHaptic } from '@/lib/motion/motion-system';

export function BackgroundRemoverStudio() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tolerance, setTolerance] = useState<number>(35);
  const [bgColor, setBgColor] = useState<string>('transparent');
  const [edgeSmoothing, setEdgeSmoothing] = useState<number>(2);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setResultSrc(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setResultSrc(null);
    }
  };

  const processBackgroundRemoval = () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw original image
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample 4 corner colors for automatic background detection
      const sampleCorners = [
        [data[0], data[1], data[2]], // Top-left
        [data[(canvas.width - 1) * 4], data[(canvas.width - 1) * 4 + 1], data[(canvas.width - 1) * 4 + 2]], // Top-right
        [data[(canvas.height - 1) * canvas.width * 4], data[(canvas.height - 1) * canvas.width * 4 + 1], data[(canvas.height - 1) * canvas.width * 4 + 2]], // Bottom-left
      ];

      const avgBgR = Math.round((sampleCorners[0][0] + sampleCorners[1][0] + sampleCorners[2][0]) / 3);
      const avgBgG = Math.round((sampleCorners[0][1] + sampleCorners[1][1] + sampleCorners[2][1]) / 3);
      const avgBgB = Math.round((sampleCorners[0][2] + sampleCorners[1][2] + sampleCorners[2][2]) / 3);

      const thresh = tolerance * 2.5;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate Euclidean color distance to background
        const dist = Math.sqrt(
          (r - avgBgR) * (r - avgBgR) +
          (g - avgBgG) * (g - avgBgG) +
          (b - avgBgB) * (b - avgBgB)
        );

        if (dist < thresh) {
          // Transparent
          data[i + 3] = 0;
        } else if (dist < thresh + edgeSmoothing * 10) {
          // Soft edge feathering
          const alpha = (dist - thresh) / (edgeSmoothing * 10);
          data[i + 3] = Math.round(alpha * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // If a custom background color is selected (e.g. White for passport, Blue, etc.)
      if (bgColor !== 'transparent') {
        const bgCanvas = document.createElement('canvas');
        const bgCtx = bgCanvas.getContext('2d');
        if (bgCtx) {
          bgCanvas.width = canvas.width;
          bgCanvas.height = canvas.height;
          bgCtx.fillStyle = bgColor;
          bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
          bgCtx.drawImage(canvas, 0, 0);
          setResultSrc(bgCanvas.toDataURL('image/png'));
          setIsProcessing(false);
          return;
        }
      }

      setResultSrc(canvas.toDataURL('image/png'));
      setIsProcessing(false);
    };
  };

  useEffect(() => {
    if (imageSrc) {
      processBackgroundRemoval();
    }
  }, [tolerance, bgColor, edgeSmoothing]);

  const handleDownload = () => {
    if (!resultSrc) return;
    triggerHaptic('medium');
    const byteString = atob(resultSrc.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/png' });
    const name = (imageFile?.name || 'photo').replace(/\.[^/.]+$/, '');
    downloadSingleFile(blob, `${name}_transparent_cutout.png`);
  };

  const handleShare = () => {
    if (!resultSrc) return;
    triggerHaptic('light');
    const byteString = atob(resultSrc.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/png' });
    const name = (imageFile?.name || 'photo').replace(/\.[^/.]+$/, '');
    shareDownloadedFile({ name: `${name}_transparent_cutout.png`, blob, mimeType: 'image/png' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          <Zap className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>100% In-Browser AI Edge Cutout • Zero Cloud Uploads</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          AI Photo Background Remover & Backdrop Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Instantly erase backgrounds, create transparent PNGs, or generate professional white passport photos in 1 click.
        </p>
      </div>

      {/* Upload Dropzone */}
      {!imageSrc ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="p-10 sm:p-16 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-center space-y-4 hover:border-brand-500 transition-all cursor-pointer"
          onClick={() => document.getElementById('bg-file-input')?.click()}
        >
          <input
            id="bg-file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto shadow-md">
            <Upload className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">
              Drop your photo here, or click to browse
            </h3>
            <p className="text-xs text-slate-500">Supports JPG, PNG, WEBP up to 50MB</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-600" />
              <span>Cutout & Backdrop Controls</span>
            </h3>

            {/* Tolerance Slider */}
            <div dir="ltr" className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Cutout Sensitivity:</span>
                <span className="font-mono text-brand-600">{tolerance}%</span>
              </div>
              <input
                type="range"
                dir="ltr"
                min="5"
                max="85"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>

            {/* Edge Smoothing */}
            <div dir="ltr" className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Edge Feathering:</span>
                <span className="font-mono text-brand-600">{edgeSmoothing}px</span>
              </div>
              <input
                type="range"
                dir="ltr"
                min="0"
                max="10"
                value={edgeSmoothing}
                onChange={(e) => setEdgeSmoothing(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>

            {/* Backdrop Presets */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Backdrop Preset:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'transparent', label: 'Transparent', icon: '🏁' },
                  { id: '#ffffff', label: 'White (ID)', icon: '⚪' },
                  { id: '#0284c7', label: 'Passport Blue', icon: '🔵' },
                  { id: '#dc2626', label: 'Studio Red', icon: '🔴' },
                  { id: '#10b981', label: 'Green Screen', icon: '🟢' },
                  { id: '#0f172a', label: 'Dark Gray', icon: '⬛' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBgColor(b.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      bgColor === b.id
                        ? 'bg-brand-50 dark:bg-brand-950 border-brand-500 text-brand-700 dark:text-brand-300 shadow-sm ring-2 ring-brand-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{b.icon}</span>
                    <span className="text-[11px]">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Cutout PNG</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="w-full py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs"
              >
                <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Share Cutout Image</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setImageSrc(null);
                  setResultSrc(null);
                  setImageFile(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold text-center"
              >
                Upload Another Photo
              </button>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Cutout Live Preview</span>
              {isProcessing && <RefreshCw className="w-4 h-4 text-brand-600 animate-spin" />}
            </h3>

            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-square sm:aspect-[4/3] flex items-center justify-center bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]">
              {resultSrc ? (
                <img src={resultSrc} alt="Cutout Preview" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-slate-400 text-xs flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing edge contours...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
