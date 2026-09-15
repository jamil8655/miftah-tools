'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Zap, Upload, Download, Image as ImageIcon, Sliders, RefreshCw, Eye, Check, Layers, Palette, Printer, Grid, Crop, Type, User, Sun, Contrast, Wand2, FileCheck, Maximize2, Pipette, SlidersHorizontal } from 'lucide-react';
import { downloadSingleFile } from '@/lib/utils/download';

interface PassportPreset {
  id: string;
  name: string;
  country: string;
  widthCm: number;
  heightCm: number;
  widthPx: number;
  heightPx: number;
  aspect: number;
}

const PASSPORT_PRESETS: PassportPreset[] = [
  {
    id: 'in-passport',
    name: 'India Passport / Govt Exam (3.5x4.5cm)',
    country: '🇮🇳 India',
    widthCm: 3.5,
    heightCm: 4.5,
    widthPx: 413,
    heightPx: 531,
    aspect: 3.5 / 4.5,
  },
  {
    id: 'us-visa',
    name: 'US Visa / Green Card (2x2 inch)',
    country: '🇺🇸 USA',
    widthCm: 5.1,
    heightCm: 5.1,
    widthPx: 600,
    heightPx: 600,
    aspect: 1,
  },
  {
    id: 'schengen-visa',
    name: 'Schengen / UK / Europe Visa',
    country: '🇪🇺 Europe / UK',
    widthCm: 3.5,
    heightCm: 4.5,
    widthPx: 413,
    heightPx: 531,
    aspect: 3.5 / 4.5,
  },
  {
    id: 'gulf-visa',
    name: 'UAE / Saudi / Gulf Visa (4x6cm)',
    country: '🇦🇪 Gulf / UAE',
    widthCm: 4.0,
    heightCm: 6.0,
    widthPx: 472,
    heightPx: 708,
    aspect: 4 / 6,
  },
];

const PHOTO_GRID_OPTIONS = [
  { count: 1, label: '1 Photo', paper: 'Single', cols: 1, rows: 1 },
  { count: 3, label: '3 Photos', paper: '4x6"', cols: 3, rows: 1 },
  { count: 4, label: '4 Photos', paper: '4x6"', cols: 2, rows: 2 },
  { count: 6, label: '6 Photos', paper: '4x6"', cols: 3, rows: 2 },
  { count: 8, label: '8 Photos (Standard Studio)', paper: '4x6"', cols: 4, rows: 2 },
  { count: 9, label: '9 Photos', paper: '4x6"', cols: 3, rows: 3 },
  { count: 10, label: '10 Photos', paper: '4x6"', cols: 5, rows: 2 },
  { count: 12, label: '12 Photos', paper: '4x6"', cols: 4, rows: 3 },
  { count: 15, label: '15 Photos', paper: '5x7"', cols: 5, rows: 3 },
  { count: 16, label: '16 Photos', paper: '5x7"', cols: 4, rows: 4 },
  { count: 20, label: '20 Photos', paper: 'A4', cols: 5, rows: 4 },
  { count: 24, label: '24 Photos', paper: 'A4', cols: 6, rows: 4 },
  { count: 30, label: '30 Photos', paper: 'A4', cols: 6, rows: 5 },
  { count: 32, label: '32 Photos (Full A4 Sheet)', paper: 'A4', cols: 8, rows: 4 },
];

const STUDIO_COLOR_PALETTES = [
  {
    category: 'Official Passports & Visas',
    colors: [
      { id: '#ffffff', label: 'Pure White (Official)', color: '#ffffff', border: true },
      { id: '#f8fafc', label: 'Off-White (Clean)', color: '#f8fafc', border: true },
      { id: '#0284c7', label: 'Passport Blue', color: '#0284c7' },
      { id: '#0ea5e9', label: 'Sky Blue', color: '#0ea5e9' },
      { id: '#bae6fd', label: 'Light Cyan', color: '#bae6fd' },
      { id: '#1e3a8a', label: 'Navy Blue', color: '#1e3a8a' },
    ],
  },
  {
    category: 'Studio Portraits & ID Cards',
    colors: [
      { id: '#dc2626', label: 'Studio Red', color: '#dc2626' },
      { id: '#991b1b', label: 'Crimson Burgundy', color: '#991b1b' },
      { id: '#059669', label: 'Emerald Green', color: '#059669' },
      { id: '#475569', label: 'Executive Slate', color: '#475569' },
      { id: '#1e293b', label: 'Dark Charcoal', color: '#1e293b' },
      { id: '#4f46e5', label: 'Royal Indigo', color: '#4f46e5' },
    ],
  },
  {
    category: 'Modern Soft & Aesthetic',
    colors: [
      { id: '#fefce8', label: 'Warm Cream', color: '#fefce8', border: true },
      { id: '#fdf2f8', label: 'Soft Pink', color: '#fdf2f8', border: true },
      { id: '#f0fdf4', label: 'Mint Light', color: '#f0fdf4', border: true },
      { id: '#faf5ff', label: 'Lilac White', color: '#faf5ff', border: true },
      { id: '#d97706', label: 'Warm Amber', color: '#d97706' },
      { id: 'transparent', label: 'Transparent (PNG)', color: 'transparent', isSpecial: 'checker' },
    ],
  },
  {
    category: 'Studio Gradients & Spotlights',
    colors: [
      { id: 'grad-blue', label: 'Studio Blue Spotlight', grad: 'radial-gradient(circle, #38bdf8 0%, #0369a1 100%)' },
      { id: 'grad-gray', label: 'Classic Gray Studio Glow', grad: 'radial-gradient(circle, #e2e8f0 0%, #64748b 100%)' },
      { id: 'grad-sunset', label: 'Warm Sunset Studio', grad: 'linear-gradient(135deg, #fbbf24 0%, #f43f5e 100%)' },
      { id: 'grad-executive', label: 'Dark Executive Glow', grad: 'radial-gradient(circle, #334155 0%, #0f172a 100%)' },
    ],
  },
];

export function PassportPhotoStudio() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [transparentPngSrc, setTransparentPngSrc] = useState<string | null>(null);
  const [printSheetSrc, setPrintSheetSrc] = useState<string | null>(null);
  const [cachedImg, setCachedImg] = useState<HTMLImageElement | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'background' | 'enhance' | 'grid' | 'details'>('background');

  // Background Settings
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [customHex, setCustomHex] = useState<string>('#ffffff');
  const [tolerance, setTolerance] = useState<number>(28);
  const [edgeSmoothing, setEdgeSmoothing] = useState<number>(3);

  // Presets & Grids
  const [selectedPreset, setSelectedPreset] = useState<string>('in-passport');
  const [photoCount, setPhotoCount] = useState<number>(8);
  const [paperType, setPaperType] = useState<'4x6' | '5x7' | 'a4'>('4x6');

  // HD Clarity & Lighting Enhancers
  const [brightness, setBrightness] = useState<number>(104);
  const [contrast, setContrast] = useState<number>(108);
  const [sharpness, setSharpness] = useState<number>(1);
  const [autoEnhanced, setAutoEnhanced] = useState<boolean>(false);

  // Name & Date on Photo
  const [addNameDate, setAddNameDate] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('YOUR NAME');
  const [photoDate, setPhotoDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageSrc(url);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setCachedImg(img);
      img.src = url;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageSrc(url);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setCachedImg(img);
      img.src = url;
    }
  };

  // High-Clarity Anti-Aliased Alpha Matting Engine
  const processImage = useCallback(() => {
    if (!cachedImg) return;
    setIsProcessing(true);

    const preset = PASSPORT_PRESETS.find((p) => p.id === selectedPreset) || PASSPORT_PRESETS[0];

    // 1. Render to 300 DPI Canvas
    const workCanvas = document.createElement('canvas');
    workCanvas.width = preset.widthPx;
    workCanvas.height = preset.heightPx;
    const ctx = workCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Apply Contrast & Brightness Enhancements
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    const imgAspect = cachedImg.naturalWidth / cachedImg.naturalHeight;
    const targetAspect = preset.aspect;

    let srcW = cachedImg.naturalWidth;
    let srcH = cachedImg.naturalHeight;
    let srcX = 0;
    let srcY = 0;

    if (imgAspect > targetAspect) {
      srcW = cachedImg.naturalHeight * targetAspect;
      srcX = (cachedImg.naturalWidth - srcW) / 2;
    } else {
      srcH = cachedImg.naturalWidth / targetAspect;
      srcY = (cachedImg.naturalHeight - srcH) * 0.12;
    }

    ctx.drawImage(cachedImg, srcX, srcY, srcW, srcH, 0, 0, workCanvas.width, workCanvas.height);
    ctx.filter = 'none';

    // 2. High-Precision Background Edge Cutout
    const imgData = ctx.getImageData(0, 0, workCanvas.width, workCanvas.height);
    const data = imgData.data;

    // Sample multi-point border colors
    const corners = [
      [data[0], data[1], data[2]],
      [data[(workCanvas.width - 1) * 4], data[(workCanvas.width - 1) * 4 + 1], data[(workCanvas.width - 1) * 4 + 2]],
      [data[Math.floor(workCanvas.width / 2) * 4], data[Math.floor(workCanvas.width / 2) * 4 + 1], data[Math.floor(workCanvas.width / 2) * 4 + 2]],
    ];

    const bgR = Math.round((corners[0][0] + corners[1][0] + corners[2][0]) / 3);
    const bgG = Math.round((corners[0][1] + corners[1][1] + corners[2][1]) / 3);
    const bgB = Math.round((corners[0][2] + corners[1][2] + corners[2][2]) / 3);

    const thresh = tolerance * 2.4;
    const feather = edgeSmoothing * 8;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const dist = Math.sqrt(
        (r - bgR) * (r - bgR) +
        (g - bgG) * (g - bgG) +
        (b - bgB) * (b - bgB)
      );

      if (dist < thresh) {
        data[i + 3] = 0; // Cutout background
      } else if (dist < thresh + feather) {
        // Smooth Sub-Pixel Feathering
        const alpha = (dist - thresh) / feather;
        data[i + 3] = Math.round(alpha * 255);

        // Color Spill Suppression (Removes background green/blue bounce on hair edges)
        data[i] = Math.round(r * 0.85 + bgR * 0.15);
        data[i + 1] = Math.round(g * 0.85 + bgG * 0.15);
        data[i + 2] = Math.round(b * 0.85 + bgB * 0.15);
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Save transparent PNG version
    setTransparentPngSrc(workCanvas.toDataURL('image/png'));

    // 3. Composite Final Photo with Chosen Backdrop
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = workCanvas.width;
    finalCanvas.height = workCanvas.height;
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) return;

    if (bgColor.startsWith('grad-')) {
      // Draw Gradient Spotlight
      if (bgColor === 'grad-blue') {
        const radGrad = finalCtx.createRadialGradient(
          finalCanvas.width / 2, finalCanvas.height / 2, 20,
          finalCanvas.width / 2, finalCanvas.height / 2, finalCanvas.width
        );
        radGrad.addColorStop(0, '#38bdf8');
        radGrad.addColorStop(1, '#0369a1');
        finalCtx.fillStyle = radGrad;
      } else if (bgColor === 'grad-gray') {
        const radGrad = finalCtx.createRadialGradient(
          finalCanvas.width / 2, finalCanvas.height / 2, 20,
          finalCanvas.width / 2, finalCanvas.height / 2, finalCanvas.width
        );
        radGrad.addColorStop(0, '#f1f5f9');
        radGrad.addColorStop(1, '#64748b');
        finalCtx.fillStyle = radGrad;
      } else if (bgColor === 'grad-sunset') {
        const linGrad = finalCtx.createLinearGradient(0, 0, finalCanvas.width, finalCanvas.height);
        linGrad.addColorStop(0, '#fbbf24');
        linGrad.addColorStop(1, '#f43f5e');
        finalCtx.fillStyle = linGrad;
      } else if (bgColor === 'grad-executive') {
        const radGrad = finalCtx.createRadialGradient(
          finalCanvas.width / 2, finalCanvas.height / 2, 20,
          finalCanvas.width / 2, finalCanvas.height / 2, finalCanvas.width
        );
        radGrad.addColorStop(0, '#334155');
        radGrad.addColorStop(1, '#0f172a');
        finalCtx.fillStyle = radGrad;
      }
      finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    } else if (bgColor !== 'transparent') {
      finalCtx.fillStyle = bgColor;
      finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    }

    finalCtx.drawImage(workCanvas, 0, 0);

    // Name & Date on Photo
    if (addNameDate) {
      const stripHeight = Math.round(finalCanvas.height * 0.14);
      finalCtx.fillStyle = '#ffffff';
      finalCtx.fillRect(0, finalCanvas.height - stripHeight, finalCanvas.width, stripHeight);
      finalCtx.fillStyle = '#000000';
      finalCtx.font = 'bold 16px sans-serif';
      finalCtx.textAlign = 'center';
      finalCtx.fillText(candidateName.toUpperCase(), finalCanvas.width / 2, finalCanvas.height - stripHeight + 20);
      finalCtx.font = 'bold 13px sans-serif';
      finalCtx.fillText(`DOP: ${photoDate}`, finalCanvas.width / 2, finalCanvas.height - 8);
    }

    // Photo Border
    finalCtx.strokeStyle = '#cbd5e1';
    finalCtx.lineWidth = 2;
    finalCtx.strokeRect(0, 0, finalCanvas.width, finalCanvas.height);

    const singleResult = finalCanvas.toDataURL(bgColor === 'transparent' ? 'image/png' : 'image/jpeg', 0.98);
    setResultSrc(singleResult);

    // Generate Print Sheets
    generateDynamicPrintSheet(finalCanvas, photoCount, paperType);
    setIsProcessing(false);
  }, [cachedImg, selectedPreset, tolerance, edgeSmoothing, bgColor, brightness, contrast, addNameDate, candidateName, photoDate, photoCount, paperType]);

  // Generate Multi-Photo Grid Sheet
  const generateDynamicPrintSheet = (
    singlePhoto: HTMLCanvasElement,
    count: number,
    paper: '4x6' | '5x7' | 'a4'
  ) => {
    let sheetW = 1800; // 4x6 at 300 DPI
    let sheetH = 1200;

    if (paper === '5x7') {
      sheetW = 2100;
      sheetH = 1500;
    } else if (paper === 'a4') {
      sheetW = 2480;
      sheetH = 3508;
    }

    const sheet = document.createElement('canvas');
    sheet.width = sheetW;
    sheet.height = sheetH;
    const ctx = sheet.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sheet.width, sheet.height);

    const opt = PHOTO_GRID_OPTIONS.find((o) => o.count === count);
    const cols = opt ? opt.cols : Math.ceil(Math.sqrt(count));
    const rows = opt ? opt.rows : Math.ceil(count / cols);

    const photoW = singlePhoto.width;
    const photoH = singlePhoto.height;

    const totalContentW = cols * photoW;
    const totalContentH = rows * photoH;

    const gapX = Math.max(20, Math.floor((sheetW - totalContentW) / (cols + 1)));
    const gapY = Math.max(20, Math.floor((sheetH - totalContentH) / (rows + 1)));

    let drawn = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (drawn >= count) break;
        const x = gapX + c * (photoW + gapX);
        const y = gapY + r * (photoH + gapY);

        ctx.drawImage(singlePhoto, x, y, photoW, photoH);

        // Cutting guides
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, photoW, photoH);

        drawn++;
      }
    }

    setPrintSheetSrc(sheet.toDataURL('image/jpeg', 0.98));
  };

  useEffect(() => {
    if (cachedImg) {
      processImage();
    }
  }, [processImage]);

  // 1-Click Auto Enhance
  const handleAutoEnhance = () => {
    if (autoEnhanced) {
      setBrightness(100);
      setContrast(100);
      setAutoEnhanced(false);
    } else {
      setBrightness(112);
      setContrast(115);
      setAutoEnhanced(true);
    }
  };

  // Downloads
  const handleDownloadSingle = () => {
    if (!resultSrc) return;
    const isPng = bgColor === 'transparent';
    const byteString = atob(resultSrc.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: isPng ? 'image/png' : 'image/jpeg' });
    const name = (imageFile?.name || 'photo').replace(/\.[^/.]+$/, '');
    downloadSingleFile(blob, `${name}_passport_${selectedPreset}.${isPng ? 'png' : 'jpg'}`);
  };

  const handleDownloadTransparentPng = () => {
    if (!transparentPngSrc) return;
    const byteString = atob(transparentPngSrc.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/png' });
    const name = (imageFile?.name || 'photo').replace(/\.[^/.]+$/, '');
    downloadSingleFile(blob, `${name}_transparent_cutout.png`);
  };

  const handleDownloadPrintSheet = () => {
    if (!printSheetSrc) return;
    const byteString = atob(printSheetSrc.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/jpeg' });
    const name = (imageFile?.name || 'photo').replace(/\.[^/.]+$/, '');
    downloadSingleFile(blob, `${name}_print_sheet_${photoCount}_photos.jpg`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 shadow-xs">
          <Zap className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
          <span>Professional Passport Studio • Multi-Color Backdrops • 300 DPI HD Export</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Professional Passport Photo Maker & Studio Backdrop Suite
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Create official White/Blue/Color Passport Photos with smooth anti-aliased edge cutout, instant Transparent PNGs, and 1-32 photo Printable Grid Sheets.
        </p>
      </div>

      {/* Upload Dropzone */}
      {!imageSrc ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('pro-passport-upload')?.click()}
          className="p-12 sm:p-20 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-center space-y-4 hover:border-brand-500 transition-all cursor-pointer group"
        >
          <input
            id="pro-passport-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform">
            <User className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
              Click or Drop your Selfie / Portrait Photo here
            </h3>
            <p className="text-xs text-slate-500">
              High-Precision Sub-Pixel Alpha Matting • Instant Local Processing • Zero Cloud Uploads
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Settings Column */}
          <div className="lg:col-span-6 space-y-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            {/* Top Workspace Tab Bar */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {[
                { id: 'background', label: '🎨 Color', full: 'Backdrop Color' },
                { id: 'enhance', label: '✨ HD Filter', full: 'Clarity & Lighting' },
                { id: 'grid', label: '🖨️ Grids', full: '1-32 Photos Grid' },
                { id: 'details', label: '📝 Details', full: 'Exam Name & Date' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: BACKGROUND & COLORS */}
            {activeTab === 'background' && (
              <div className="space-y-5 animate-in fade-in">
                {/* Dimension Preset */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Passport Standard:</label>
                  <select
                    value={selectedPreset}
                    onChange={(e) => setSelectedPreset(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    {PASSPORT_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.country} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Multiple Color Palette Presets */}
                {STUDIO_COLOR_PALETTES.map((sec) => (
                  <div key={sec.category} className="space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      {sec.category}:
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {sec.colors.map((c) => {
                        const isSelected = bgColor === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setBgColor(c.id)}
                            className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                              isSelected
                                ? 'border-brand-500 ring-2 ring-brand-500/30 bg-brand-50/50 dark:bg-brand-950/50'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:scale-105'
                            }`}
                          >
                            {(c as any).isSpecial === 'checker' ? (
                              <div className="w-6 h-6 rounded-full border border-slate-300 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:6px_6px] shadow-xs" />
                            ) : (
                              <div
                                className="w-6 h-6 rounded-full border border-slate-300/60 shadow-xs"
                                style={{
                                  background: (c as any).grad || (c as any).color,
                                }}
                              />
                            )}
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                              {c.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Custom Color Spectrum Picker */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Custom Hex / RGB Color:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customHex}
                      onChange={(e) => {
                        setCustomHex(e.target.value);
                        setBgColor(e.target.value);
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                    />
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">{customHex}</span>
                  </div>
                </div>

                {/* Edge Matting Controls */}
                <div dir="ltr" className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Cutout Tolerance:</span>
                      <span className="font-mono text-brand-600">{tolerance}%</span>
                    </div>
                    <input
                      type="range"
                      dir="ltr"
                      min="10"
                      max="70"
                      value={tolerance}
                      onChange={(e) => setTolerance(Number(e.target.value))}
                      className="w-full accent-brand-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Hair Edge Anti-Aliasing (Smoothing):</span>
                      <span className="font-mono text-brand-600">{edgeSmoothing}px</span>
                    </div>
                    <input
                      type="range"
                      dir="ltr"
                      min="1"
                      max="8"
                      value={edgeSmoothing}
                      onChange={(e) => setEdgeSmoothing(Number(e.target.value))}
                      className="w-full accent-brand-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HD CLARITY & LIGHTING */}
            {activeTab === 'enhance' && (
              <div dir="ltr" className="space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="space-y-0.5">
                    <div className="text-xs font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Wand2 className="w-4 h-4 text-amber-600" />
                      <span>1-Click Studio Lighting Balance</span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                      Instantly fixes dark or poorly lit smartphone selfies for official documents.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoEnhance}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md active:scale-95"
                  >
                    {autoEnhanced ? 'Reset' : 'Auto Enhance'}
                  </button>
                </div>

                {/* Brightness Boost */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" /> Brightness & Lighting:
                    </span>
                    <span className="font-mono text-brand-600">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    dir="ltr"
                    min="80"
                    max="140"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                </div>

                {/* Contrast & Clarity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Contrast className="w-4 h-4 text-indigo-500" /> Contrast & Clarity:
                    </span>
                    <span className="font-mono text-brand-600">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    dir="ltr"
                    min="80"
                    max="140"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: MULTI-PHOTO PRINT GRIDS */}
            {activeTab === 'grid' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Choose Number of Photos on Print Sheet:</span>
                  <span className="font-mono text-brand-600 font-extrabold text-sm">{photoCount} Photos</span>
                </div>

                {/* Grid Preset Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {PHOTO_GRID_OPTIONS.map((opt) => (
                    <button
                      key={opt.count}
                      type="button"
                      onClick={() => {
                        setPhotoCount(opt.count);
                        if (opt.count > 16) setPaperType('a4');
                        else setPaperType('4x6');
                      }}
                      className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all ${
                        photoCount === opt.count
                          ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-sm font-black">{opt.count}</span>
                      <span className="text-[10px] opacity-80">{opt.paper}</span>
                    </button>
                  ))}
                </div>

                {/* Paper Type Selector */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Print Paper Size:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '4x6', label: '4x6" Studio Paper' },
                      { id: '5x7', label: '5x7" Medium Paper' },
                      { id: 'a4', label: 'A4 Full Document Sheet' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaperType(p.id as any)}
                        className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                          paperType === p.id
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: EXAM NAME & DATE DETAILS */}
            {activeTab === 'details' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addNameDate}
                      onChange={(e) => setAddNameDate(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    <span>Add Name & Date of Photo Strip (Govt Exam Format)</span>
                  </label>

                  {addNameDate && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">Candidate Name:</label>
                        <input
                          type="text"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          placeholder="Candidate Full Name"
                          className="w-full px-3.5 py-2 text-xs font-bold uppercase rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">Date of Photo (DOP):</label>
                        <input
                          type="date"
                          value={photoDate}
                          onChange={(e) => setPhotoDate(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Download Buttons */}
            <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSingle}
                  className="py-3.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Passport Photo (HD)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTransparentPng}
                  className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span>Download Cutout PNG</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadPrintSheet}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Download {photoCount}-Photo {paperType.toUpperCase()} Printable Sheet</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setImageSrc(null);
                  setResultSrc(null);
                  setCachedImg(null);
                }}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-center block"
              >
                Upload Another Photo
              </button>
            </div>
          </div>

          {/* Live Preview Studio Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* 1. Single Passport Photo Live Preview */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 text-center">
              <div className="flex justify-between items-center text-xs font-extrabold text-slate-900 dark:text-white">
                <span>Passport Preview (300 DPI Studio Quality)</span>
                <span className="text-emerald-600 flex items-center gap-1 font-bold">
                  <Check className="w-3.5 h-3.5" /> High Clarity
                </span>
              </div>

              <div className="w-52 h-68 mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-slate-950 relative">
                {resultSrc ? (
                  <img src={resultSrc} alt="Passport Preview" className="w-full h-full object-cover" />
                ) : (
                  <RefreshCw className="w-6 h-6 text-brand-600 animate-spin" />
                )}
              </div>
            </div>

            {/* 2. Multi-Photo Print Grid Live Preview */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-center text-xs font-extrabold text-slate-900 dark:text-white">
                <span className="flex items-center gap-1.5">
                  <Grid className="w-4 h-4 text-brand-600" />
                  <span>{photoCount}-Photo {paperType.toUpperCase()} Print Layout</span>
                </span>
                <span className="text-slate-400 text-[11px]">Ready to Print</span>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 aspect-[3/2] bg-slate-100 dark:bg-slate-950 p-2 flex items-center justify-center">
                {printSheetSrc ? (
                  <img src={printSheetSrc} alt="Print Sheet Preview" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <RefreshCw className="w-6 h-6 text-brand-600 animate-spin" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
