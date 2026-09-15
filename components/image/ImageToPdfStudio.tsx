'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Download, Trash2, ArrowLeft, ArrowRight, RotateCw, Zap, Sliders, Maximize2, Minimize2, Layers, Check, Copy, Printer, Plus, ArrowUpDown, Filter, Eye, CheckCircle2, Image as ImageIcon, HardDrive, FileCheck2 } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useI18n } from '@/lib/i18n/i18n-context';
import { formatBytes } from '@/lib/utils/formatters';
import { downloadSingleFile, SavedFileInfo } from '@/lib/utils/download';
import { DownloadSuccessModal } from '@/components/shared/DownloadSuccessModal';
import confetti from 'canvas-confetti';

export interface ImageToPdfItem {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
  filter: 'original' | 'document' | 'bw' | 'grayscale' | 'vibrant';
}

const SIZE_PRESETS = [
  { label: '50 KB', value: 50 },
  { label: '100 KB', value: 100 },
  { label: '200 KB', value: 200 },
  { label: '500 KB', value: 500 },
  { label: '1 MB', value: 1024 },
  { label: '2 MB', value: 2048 },
  { label: '3 MB', value: 3072 },
  { label: '5 MB', value: 5120 },
  { label: '10 MB', value: 10240 },
];

const ENHANCEMENT_FILTERS = [
  { id: 'original', name: 'Original Color', desc: 'No alteration to source colors' },
  { id: 'document', name: 'Document Scan', desc: 'Whitens background and sharpens text' },
  { id: 'bw', name: 'Black & White', desc: 'High contrast document xerox mode' },
  { id: 'grayscale', name: 'Grayscale', desc: 'Clean monochrome for small size' },
  { id: 'vibrant', name: 'Color Boost', desc: 'Enhances saturation & clarity' },
];

export function ImageToPdfStudio() {
  const { language } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<ImageToPdfItem[]>([]);
  const [outputFileName, setOutputFileName] = useState('converted_images.pdf');
  const [paperSize, setPaperSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [margin, setMargin] = useState<'none' | 'small' | 'standard' | 'large'>('small');
  const [pageNumbers, setPageNumbers] = useState<'none' | 'bottom-center' | 'bottom-right'>('none');
  const [globalFilter, setGlobalFilter] = useState<'original' | 'document' | 'bw' | 'grayscale' | 'vibrant'>('original');

  // Compression & Size Control
  const [targetSizeKB, setTargetSizeKB] = useState<number>(200);
  const [customTargetInput, setCustomTargetInput] = useState<string>('200');
  const [qualityLevel, setQualityLevel] = useState<number>(85); // 10 to 100
  const [maxDimension, setMaxDimension] = useState<number>(2048); // 800 to 4096

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [savedFileInfo, setSavedFileInfo] = useState<SavedFileInfo | null>(null);

  const totalOriginalBytes = images.reduce((acc, img) => acc + img.file.size, 0);

  // Helper to load image file into item
  const processImageFile = async (file: File): Promise<ImageToPdfItem> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          previewUrl: url,
          width: img.naturalWidth || 800,
          height: img.naturalHeight || 600,
          rotation: 0,
          filter: globalFilter,
        });
      };
      img.onerror = () => {
        resolve({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          previewUrl: url,
          width: 800,
          height: 600,
          rotation: 0,
          filter: globalFilter,
        });
      };
      img.src = url;
    });
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems = await Promise.all(files.map(processImageFile));
    setImages((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (addMoreInputRef.current) addMoreInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    const newItems = await Promise.all(files.map(processImageFile));
    setImages((prev) => [...prev, ...newItems]);
  };

  // Reordering functions ("ترتیبات")
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setImages(updated);
  };

  const rotateImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, rotation: (img.rotation + 90) % 360 } : img))
    );
  };

  const deleteImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSortByName = () => {
    setImages((prev) => [...prev].sort((a, b) => a.file.name.localeCompare(b.file.name)));
  };

  const handleReverseOrder = () => {
    setImages((prev) => [...prev].reverse());
  };

  const handleApplyGlobalFilter = (filter: typeof globalFilter) => {
    setGlobalFilter(filter);
    setImages((prev) => prev.map((img) => ({ ...img, filter })));
  };

  const handleApplyPresetSize = (val: number) => {
    setTargetSizeKB(val);
    setCustomTargetInput(val > 0 ? `${val} KB` : '');
    if (val === 100 || val === 200) {
      setQualityLevel(45);
      setMaxDimension(1200);
    } else if (val === 500) {
      setQualityLevel(65);
      setMaxDimension(1600);
    } else if (val === 1024 || val === 2048) {
      setQualityLevel(80);
      setMaxDimension(2048);
    } else {
      setQualityLevel(90);
      setMaxDimension(2560);
    }
  };

  // Apply visual enhancements onto off-screen canvas and compress
  const renderProcessedImageBuffer = async (
    item: ImageToPdfItem,
    quality: number,
    maxDim: number
  ): Promise<{ buffer: ArrayBuffer; width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let origW = img.naturalWidth;
        let origH = img.naturalHeight;

        // Apply rotation swap if rotated 90 or 270 deg
        const isRotatedQuarter = item.rotation === 90 || item.rotation === 270;
        let effectiveW = isRotatedQuarter ? origH : origW;
        let effectiveH = isRotatedQuarter ? origW : origH;

        // Downscale to maxDim while preserving aspect ratio
        let scale = 1;
        if (effectiveW > maxDim || effectiveH > maxDim) {
          scale = Math.min(maxDim / effectiveW, maxDim / effectiveH);
        }

        const canvasW = Math.round(effectiveW * scale);
        const canvasH = Math.round(effectiveH * scale);

        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({ buffer: new ArrayBuffer(0), width: 100, height: 100 });
          return;
        }

        // Fill background with white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Apply rotation transformations
        ctx.save();
        ctx.translate(canvasW / 2, canvasH / 2);
        ctx.rotate((item.rotation * Math.PI) / 180);

        const drawW = Math.round((isRotatedQuarter ? effectiveH : effectiveW) * scale);
        const drawH = Math.round((isRotatedQuarter ? effectiveW : effectiveH) * scale);
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Apply Enhancement Filters
        if (item.filter !== 'original') {
          const imgData = ctx.getImageData(0, 0, canvasW, canvasH);
          const data = imgData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (item.filter === 'document') {
              // High contrast & Whiten background
              const gray = 0.299 * r + 0.587 * g + 0.114 * b;
              const enhanced = gray > 180 ? 255 : Math.max(0, Math.min(255, (gray - 40) * 1.3));
              data[i] = enhanced;
              data[i + 1] = enhanced;
              data[i + 2] = enhanced;
            } else if (item.filter === 'bw') {
              // Strict Threshold Black & White
              const gray = 0.299 * r + 0.587 * g + 0.114 * b;
              const bw = gray > 140 ? 255 : 0;
              data[i] = bw;
              data[i + 1] = bw;
              data[i + 2] = bw;
            } else if (item.filter === 'grayscale') {
              // Clean Monochrome
              const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
              data[i] = gray;
              data[i + 1] = gray;
              data[i + 2] = gray;
            } else if (item.filter === 'vibrant') {
              // Boost Saturation & Contrast
              data[i] = Math.min(255, Math.round(r * 1.1));
              data[i + 1] = Math.min(255, Math.round(g * 1.1));
              data[i + 2] = Math.min(255, Math.round(b * 1.15));
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }

        // Export as JPEG with targeted quality
        const finalQuality = Math.max(0.1, Math.min(1.0, quality / 100));
        canvas.toBlob(
          async (blob) => {
            if (blob) {
              const buffer = await blob.arrayBuffer();
              resolve({ buffer, width: canvasW, height: canvasH });
            } else {
              resolve({ buffer: new ArrayBuffer(0), width: 100, height: 100 });
            }
          },
          'image/jpeg',
          finalQuality
        );
      };
      img.src = item.previewUrl;
    });
  };

  // Generate & Compile High-Quality PDF
  const handleGeneratePdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProgress(10);
    setStatusText('Optimizing & compressing image layers...');

    try {
      const pdfDoc = await PDFDocument.create();
      const marginPt = margin === 'none' ? 0 : margin === 'large' ? 36 : margin === 'standard' ? 24 : 14;

      // Determine per-image quality if target size is set
      let effectiveQuality = qualityLevel;
      let effectiveMaxDim = maxDimension;

      if (targetSizeKB > 0) {
        const perImageTargetKB = Math.max(25, Math.floor(targetSizeKB / images.length));
        if (perImageTargetKB < 80) {
          effectiveQuality = 40;
          effectiveMaxDim = 1200;
        } else if (perImageTargetKB < 200) {
          effectiveQuality = 60;
          effectiveMaxDim = 1600;
        } else {
          effectiveQuality = 75;
          effectiveMaxDim = 2048;
        }
      }

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        const pct = 15 + Math.round(((i + 1) / images.length) * 70);
        setProgress(pct);
        setStatusText(`Processing page ${i + 1} of ${images.length}...`);

        const { buffer, width: imgW, height: imgH } = await renderProcessedImageBuffer(
          item,
          effectiveQuality,
          effectiveMaxDim
        );

        const embeddedImage = await pdfDoc.embedJpg(buffer);

        let pageW = 595.28; // Standard A4 width in pt
        let pageH = 841.89; // Standard A4 height in pt

        if (paperSize === 'letter') {
          pageW = 612;
          pageH = 792;
        } else if (paperSize === 'fit') {
          pageW = imgW + marginPt * 2;
          pageH = imgH + marginPt * 2;
        }

        const isLandscape = imgW > imgH;
        if (orientation === 'landscape' || (orientation === 'auto' && isLandscape && paperSize !== 'fit')) {
          const temp = pageW;
          pageW = Math.max(pageW, pageH);
          pageH = Math.min(temp, pageH);
        }

        const page = pdfDoc.addPage([pageW, pageH]);
        const maxDrawW = Math.max(10, pageW - marginPt * 2);
        const maxDrawH = Math.max(10, pageH - marginPt * 2);

        const scale = Math.min(maxDrawW / imgW, maxDrawH / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;

        page.drawImage(embeddedImage, {
          x: (pageW - drawW) / 2,
          y: (pageH - drawH) / 2,
          width: drawW,
          height: drawH,
        });

        // Add page numbers if requested
        if (pageNumbers !== 'none') {
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const numText = `Page ${i + 1} of ${images.length}`;
          const numFontSize = 9;
          const textWidth = font.widthOfTextAtSize(numText, numFontSize);

          let numX = (pageW - textWidth) / 2;
          if (pageNumbers === 'bottom-right') numX = pageW - marginPt - textWidth - 10;

          page.drawText(numText, {
            x: numX,
            y: Math.max(10, marginPt / 2),
            size: numFontSize,
            font,
            color: rgb(0.4, 0.45, 0.5),
          });
        }
      }

      setProgress(90);
      setStatusText('Assembling document metadata...');

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const safeName = outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`;

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      const saved = await downloadSingleFile(blob, safeName);
      setSavedFileInfo(saved);
    } catch (err: any) {
      console.error('Image to PDF error:', err);
      alert(`Could not create PDF: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setStatusText('');
    }
  };

  const handleClearAll = () => {
    if (images.length > 0 && confirm('Are you sure you want to clear all uploaded images?')) {
      setImages([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-100 dark:shadow-none space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white shrink-0">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <input
                type="text"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                placeholder="converted_images.pdf"
                className="text-lg sm:text-xl font-black text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 focus:border-brand-500 focus:outline-hidden px-1 py-0.5 w-full max-w-md transition-colors"
              />
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Studio Image to PDF Converter</span>
                <span>&bull;</span>
                <span className="text-brand-600 dark:text-brand-400 font-bold">Target Size &amp; Enhancement Controls</span>
              </p>
            </div>
          </div>

          {/* Top Actions */}
          {images.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                ref={addMoreInputRef}
                onChange={handleFilesSelected}
                multiple
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => addMoreInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-brand-600" />
                <span>Add More Images</span>
              </button>

              <button
                type="button"
                onClick={handleSortByName}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Sort images alphabetically (A-Z)"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort A-Z</span>
              </button>

              <button
                type="button"
                onClick={handleReverseOrder}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Reverse page order"
              >
                <span>Reverse</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900 transition-all cursor-pointer"
                title="Clear all images"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Main Convert Button */}
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs shadow-md shadow-rose-600/25 inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isProcessing ? 'Compiling PDF...' : `Generate PDF (${images.length} Pages)`}</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Metrics Ribbon */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Pages</span>
              <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                {images.length}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Original Size</span>
              <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300 font-mono">
                {formatBytes(totalOriginalBytes)}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Target Size</span>
              <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400 font-mono">
                {targetSizeKB >= 1024 ? `${(targetSizeKB / 1024).toFixed(1)} MB` : `${targetSizeKB} KB`}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Page Format</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono uppercase">
                {paperSize} ({orientation})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Upload Dropzone if No Images */}
      {images.length === 0 ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 rounded-3xl p-10 sm:p-16 text-center bg-white dark:bg-slate-900 transition-all cursor-pointer group shadow-sm"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesSelected}
            multiple
            accept="image/*"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Choose multiple images or drag &amp; drop here
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Supports JPG, PNG, WebP, BMP, TIFF, and camera document photos. Auto-optimizes file size and aligns pages cleanly.
          </p>

          <button
            type="button"
            className="mt-6 px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Select Photos / Documents</span>
          </button>
        </div>
      ) : (
        /* Multi-Image Studio Workspace */
        <div className="space-y-6">
          {/* Controls Bar: Target File Size & Compression Slider */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-600" />
                  <span>Target File Size &amp; PDF Compression Control</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Set exact MB/KB limits to ensure your PDF is email-ready, portal-compliant, or ultra high-resolution.
                </p>
              </div>

              {/* Target Size Badge */}
              <div className="px-3.5 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-bold text-xs">
                {`🎯 Limit Target: ~${targetSizeKB >= 1024 ? `${(targetSizeKB / 1024).toFixed(1)} MB` : `${targetSizeKB} KB`}`}
              </div>
            </div>

            {/* Quick Size Preset Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Size:</span>
              {SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleApplyPresetSize(preset.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    targetSizeKB === preset.value
                      ? 'border-brand-600 bg-brand-600 text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-brand-500'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Interactive Left-to-Right Range Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Drag Slider for Custom Size Reduction:</span>
                <span className="text-brand-600 font-mono">
                  {targetSizeKB >= 1024 ? `${(targetSizeKB / 1024).toFixed(2)} MB` : `${targetSizeKB} KB`}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={10240}
                step={25}
                value={targetSizeKB}
                onChange={(e) => handleApplyPresetSize(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                <span>50 KB</span>
                <span>500 KB (Govt Portals)</span>
                <span>2 MB (Standard Email)</span>
                <span>10 MB (Max)</span>
              </div>
            </div>

            {/* Document Scan & Enhancement Filters */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Document Enhancement &amp; Scanner Filter (All Pages):</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {ENHANCEMENT_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleApplyGlobalFilter(f.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      globalFilter === f.id
                        ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-extrabold text-xs">{f.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Page & Layout Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {/* Paper Format */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Paper Standard</label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:border-brand-500"
                >
                  <option value="a4">A4 (210 x 297 mm)</option>
                  <option value="letter">US Letter (8.5 x 11 in)</option>
                  <option value="fit">Fit to Image Size</option>
                </select>
              </div>

              {/* Orientation */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Page Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:border-brand-500"
                >
                  <option value="auto">Auto (Match Image Ratio)</option>
                  <option value="portrait">Portrait (Vertical)</option>
                  <option value="landscape">Landscape (Horizontal)</option>
                </select>
              </div>

              {/* Margins */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Page Margins</label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:border-brand-500"
                >
                  <option value="none">No Margins (Full Bleed)</option>
                  <option value="small">Small Margin (14pt)</option>
                  <option value="standard">Standard Margin (24pt)</option>
                  <option value="large">Big Margin (36pt)</option>
                </select>
              </div>

              {/* Page Numbers */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Page Numbers</label>
                <select
                  value={pageNumbers}
                  onChange={(e) => setPageNumbers(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:border-brand-500"
                >
                  <option value="none">No Page Numbers</option>
                  <option value="bottom-center">Bottom Center (Page X of Y)</option>
                  <option value="bottom-right">Bottom Right (Page X of Y)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reorderable Thumbnail Grid ("ترتیبات") */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-500" />
                <span>Document Pages Order ({images.length} Pages)</span>
              </h4>
              <span className="text-xs text-slate-400">Use arrows to rearrange page order</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="relative group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Page Badge */}
                  <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md bg-slate-900/80 text-white font-black text-[10px] backdrop-blur-xs">
                    Page {idx + 1}
                  </div>

                  {/* Top Control Buttons */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => rotateImage(idx)}
                      className="p-1 rounded-md bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-white shadow-xs"
                      title="Rotate 90° Clockwise"
                    >
                      <RotateCw className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteImage(idx)}
                      className="p-1 rounded-md bg-white/90 dark:bg-slate-800/90 text-rose-600 hover:bg-rose-50 shadow-xs"
                      title="Remove Page"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="w-full h-36 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center relative my-1">
                    <img
                      src={img.previewUrl}
                      alt={`Page ${idx + 1}`}
                      className="max-h-full max-w-full object-contain transition-transform duration-200"
                      style={{
                        transform: `rotate(${img.rotation}deg)`,
                      }}
                    />
                  </div>

                  {/* Bottom Navigation Controls (Move Left / Right) */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                    <button
                      type="button"
                      onClick={() => moveImage(idx, 'left')}
                      disabled={idx === 0}
                      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Left (Earlier Page)"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[10px] font-bold text-slate-400 truncate max-w-[70px]">
                      {img.file.name}
                    </span>

                    <button
                      type="button"
                      onClick={() => moveImage(idx, 'right')}
                      disabled={idx === images.length - 1}
                      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Right (Later Page)"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Generation Sticky Action Bar */}
          <div className="sticky bottom-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Ready to compile {images.length} images into a structured PDF document.
              </p>
              <p className="text-[11px] text-slate-500">
                All conversions happen 100% in your browser for total privacy.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={isProcessing}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs shadow-lg shadow-rose-600/30 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isProcessing ? 'Compiling PDF...' : `Download PDF (${images.length} Pages)`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Download Success Modal */}
      <DownloadSuccessModal
        fileInfo={savedFileInfo}
        onClose={() => setSavedFileInfo(null)}
      />
    </div>
  );
}
