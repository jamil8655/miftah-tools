'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Upload,
  Download,
  Image as ImageIcon,
  Sliders,
  RefreshCw,
  Eye,
  Check,
  Zap,
  Layers,
  Palette,
  Share2,
  Camera,
  Pipette,
  Maximize2,
  Split,
  Undo2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { downloadSingleFile, shareDownloadedFile } from '@/lib/utils/download';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { useI18n } from '@/lib/i18n/i18n-context';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';

const BG_LOCALES = {
  en: {
    badge: 'AI Studio',
    title: 'AI Background Remover',
    sub: 'Remove and replace photo backgrounds instantly with high precision.',
    dropTitle: 'Drop your photo here',
    dropSub: 'Supports JPG, PNG, WEBP • Fast on-device processing',
    browseBtn: 'Choose Photo',
    cameraBtn: 'Camera',
    eyedropperTip: 'Tap on photo background to remove specific color',
    sensitivityLabel: 'Cutout Tolerance',
    featherLabel: 'Edge Softness',
    backdropHeader: 'New Backdrop',
    viewSplit: 'Compare',
    viewCutout: 'Cutout',
    viewOriginal: 'Original',
    downloadPng: 'Download Transparent PNG',
    downloadJpg: 'Download with Backdrop (JPG)',
    shareBtn: 'Share',
    uploadAnother: 'New Photo',
    processing: 'Processing AI edges...',
    presets: {
      transparent: 'Transparent',
      white: 'Passport White',
      blue: 'Royal Blue',
      red: 'Studio Red',
      green: 'Chroma Green',
      dark: 'Dark Slate',
      sunset: 'Sunset',
      ocean: 'Ocean',
      neon: 'Neon',
      custom: 'Custom',
    },
  },
  ur: {
    badge: 'اے آئی اسٹوڈیو',
    title: 'اے آئی بیک گراؤنڈ ریموور',
    sub: 'تصاویر سے بیک گراؤنڈ فوری صاف کریں اور نیا بیک ڈراپ لگائیں۔',
    dropTitle: 'تصویر یہاں منتخب کریں',
    dropSub: 'سپورٹ: JPG, PNG, WEBP • تیز رفتار اور محفوظ',
    browseBtn: 'گیلری سے تصویر',
    cameraBtn: 'کیمرہ',
    eyedropperTip: 'مطلوبہ رنگ ہٹانے کے لیے تصویر پر کلک کریں',
    sensitivityLabel: 'کٹ آؤٹ حساسیت',
    featherLabel: 'کناروں کی نرمی',
    backdropHeader: 'نیا بیک گراؤنڈ',
    viewSplit: 'موازنہ',
    viewCutout: 'کٹ آؤٹ',
    viewOriginal: 'اصل',
    downloadPng: 'شفاف PNG ڈاؤن لوڈ کریں',
    downloadJpg: 'بیک گراؤنڈ کے ساتھ ڈاؤن لوڈ (JPG)',
    shareBtn: 'شیئر کریں',
    uploadAnother: 'نئی تصویر',
    processing: 'کنارے الگ کیے جا رہے ہیں...',
    presets: {
      transparent: 'شفاف',
      white: 'پاسپورٹ سفید',
      blue: 'رائل نیلا',
      red: 'اسٹوڈیو سرخ',
      green: 'کروما گرین',
      dark: 'ڈارک گرے',
      sunset: 'سن سیٹ',
      ocean: 'اوشن',
      neon: 'نیون',
      custom: 'پسندیدہ',
    },
  },
  ar: {
    badge: 'استوديو الذكاء الاصطناعي',
    title: 'إزالة وتغيير خلفية الصور',
    sub: 'إزالة خلفيات الصور بدقة فائقة واستبدالها بخلفيات احترافية.',
    dropTitle: 'اختر صورتك هنا',
    dropSub: 'يدعم JPG و PNG و WEBP • معالجة فورية',
    browseBtn: 'اختيار صورة',
    cameraBtn: 'الكاميرا',
    eyedropperTip: 'انقر على الصورة لإزالة لون محدد بدقة',
    sensitivityLabel: 'حساسية القص',
    featherLabel: 'تنعيم الحواف',
    backdropHeader: 'الخلفية الجديدة',
    viewSplit: 'مقارنة',
    viewCutout: 'المفرغة',
    viewOriginal: 'الأصلية',
    downloadPng: 'تحميل شفافة (PNG)',
    downloadJpg: 'تحميل مع الخلفية (JPG)',
    shareBtn: 'مشاركة',
    uploadAnother: 'صورة جديدة',
    processing: 'جاري استخراج الحواف...',
    presets: {
      transparent: 'شفافة',
      white: 'أبيض رسمي',
      blue: 'أزرق ملكي',
      red: 'أحمر استوديو',
      green: 'كروما خضراء',
      dark: 'رمادي داكن',
      sunset: 'غروب',
      ocean: 'محيط',
      neon: 'نيون',
      custom: 'مخصص',
    },
  },
  hi: {
    badge: 'AI स्टूडियो',
    title: 'AI बैकग्राउंड रिमूवर',
    sub: 'तस्वीरों से बैकग्राउंड तुरंत हटाएं और प्रीमियम बैकड्रॉप लगाएं।',
    dropTitle: 'अपनी फोटो यहाँ चुनें',
    dropSub: 'JPG, PNG, WEBP सपोर्ट • तेज़ और सुरक्षित',
    browseBtn: 'फोटो चुनें',
    cameraBtn: 'कैमरा',
    eyedropperTip: 'मनपसंद रंग हटाने के लिए फोटो पर टैप करें',
    sensitivityLabel: 'कटआउट संवेदनशीलता',
    featherLabel: 'किनारों की स्मूथनेस',
    backdropHeader: 'नया बैकग्राउंड',
    viewSplit: 'तुलना',
    viewCutout: 'कटआउट',
    viewOriginal: 'मूल फोटो',
    downloadPng: 'पारदर्शी PNG डाउनलोड करें',
    downloadJpg: 'बैकग्राउंड के साथ डाउनलोड (JPG)',
    shareBtn: 'शेयर करें',
    uploadAnother: 'नई फोटो',
    processing: 'किनारे अलग किए जा रहे हैं...',
    presets: {
      transparent: 'पारदर्शी',
      white: 'पासपोर्ट सफेद',
      blue: 'रॉयल नीला',
      red: 'स्टूडियो लाल',
      green: 'क्रोमा हरा',
      dark: 'डार्क स्लेट',
      sunset: 'सनसेट',
      ocean: 'ओशन',
      neon: 'नियॉन',
      custom: 'कस्टम',
    },
  },
};

export function BackgroundRemoverStudio() {
  const { language, isRTL } = useI18n();
  const loc = BG_LOCALES[language as keyof typeof BG_LOCALES] || BG_LOCALES.en;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [tolerance, setTolerance] = useState<number>(32);
  const [edgeSmoothing, setEdgeSmoothing] = useState<number>(2);
  const [backdropMode, setBackdropMode] = useState<string>('transparent');
  const [customColor, setCustomColor] = useState<string>('#ffffff');
  const [targetSampleColor, setTargetSampleColor] = useState<{ r: number; g: number; b: number } | null>(null);

  // Comparison Slider
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'split' | 'cutout' | 'original'>('split');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const handleFile = (file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setResultSrc(null);
    setTargetSampleColor(null);
    triggerHaptic('selection');
  };

  const handleNativeCamera = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const photo = await CapCamera.getPhoto({
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
          quality: 95,
          allowEditing: false,
        });

        if (photo.webPath) {
          const response = await fetch(photo.webPath);
          const blob = await response.blob();
          const file = new File([blob], `photo_${Date.now()}.${photo.format || 'jpg'}`, {
            type: `image/${photo.format || 'jpeg'}`,
          });
          handleFile(file);
        }
      } else {
        fileInputRef.current?.click();
      }
    } catch (err) {
      console.warn('Camera cancel or error:', err);
      fileInputRef.current?.click();
    }
  };

  const processCutout = useCallback(() => {
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

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Target background color (either sampled via eyedropper, or avg of 4 corners + top edge)
      let bgR: number, bgG: number, bgB: number;

      if (targetSampleColor) {
        bgR = targetSampleColor.r;
        bgG = targetSampleColor.g;
        bgB = targetSampleColor.b;
      } else {
        const corner1 = [data[0], data[1], data[2]];
        const corner2 = [data[(canvas.width - 1) * 4], data[(canvas.width - 1) * 4 + 1], data[(canvas.width - 1) * 4 + 2]];
        const corner3 = [data[(canvas.height - 1) * canvas.width * 4], data[(canvas.height - 1) * canvas.width * 4 + 1], data[(canvas.height - 1) * canvas.width * 4 + 2]];
        const corner4 = [data[data.length - 4], data[data.length - 3], data[data.length - 2]];

        bgR = Math.round((corner1[0] + corner2[0] + corner3[0] + corner4[0]) / 4);
        bgG = Math.round((corner1[1] + corner2[1] + corner3[1] + corner4[1]) / 4);
        bgB = Math.round((corner1[2] + corner2[2] + corner3[2] + corner4[2]) / 4);
      }

      const thresh = tolerance * 2.8;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean distance in RGB color space
        const dist = Math.sqrt(
          (r - bgR) * (r - bgR) +
          (g - bgG) * (g - bgG) +
          (b - bgB) * (b - bgB)
        );

        if (dist < thresh) {
          data[i + 3] = 0;
        } else if (dist < thresh + edgeSmoothing * 8) {
          const alpha = (dist - thresh) / (edgeSmoothing * 8);
          data[i + 3] = Math.round(alpha * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Render on backdrop if not transparent
      if (backdropMode !== 'transparent') {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = canvas.width;
        bgCanvas.height = canvas.height;
        const bgCtx = bgCanvas.getContext('2d');

        if (bgCtx) {
          if (backdropMode.startsWith('gradient:')) {
            const gradType = backdropMode.split(':')[1];
            const grad = bgCtx.createLinearGradient(0, 0, bgCanvas.width, bgCanvas.height);
            if (gradType === 'sunset') {
              grad.addColorStop(0, '#f97316');
              grad.addColorStop(1, '#ec4899');
            } else if (gradType === 'ocean') {
              grad.addColorStop(0, '#0284c7');
              grad.addColorStop(1, '#0d9488');
            } else if (gradType === 'neon') {
              grad.addColorStop(0, '#8b5cf6');
              grad.addColorStop(1, '#ec4899');
            }
            bgCtx.fillStyle = grad;
          } else {
            bgCtx.fillStyle = backdropMode === 'custom' ? customColor : backdropMode;
          }

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
  }, [imageSrc, tolerance, edgeSmoothing, backdropMode, customColor, targetSampleColor]);

  useEffect(() => {
    if (imageSrc) {
      processCutout();
    }
  }, [processCutout]);

  // Click on original image to sample color (Eyedropper / Magic Wand)
  const handleImageSampleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleX = target.naturalWidth / rect.width;
    const scaleY = target.naturalHeight / rect.height;

    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = target.naturalWidth;
    sampleCanvas.height = target.naturalHeight;
    const ctx = sampleCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(target, 0, 0);
      const pixel = ctx.getImageData(Math.round(x * scaleX), Math.round(y * scaleY), 1, 1).data;
      setTargetSampleColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
      triggerHaptic('success');
    }
  };

  const handleDownloadPng = () => {
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
    downloadSingleFile(blob, `${name}_cutout.png`);
  };

  const handleDownloadJpg = () => {
    if (!resultSrc) return;
    triggerHaptic('medium');
    const img = new Image();
    img.src = resultSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const name = (imageFile?.name || 'photo').replace(/\.[^/.]+$/, '');
            downloadSingleFile(blob, `${name}_backdrop.jpg`);
          }
        }, 'image/jpeg', 0.95);
      }
    };
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
    shareDownloadedFile({ name: `${name}_cutout.png`, blob, mimeType: 'image/png' });
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* 1. Ultra-Clean Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-7 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {loc.title}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                  {loc.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {loc.sub}
              </p>
            </div>
          </div>

          {imageSrc && (
            <button
              type="button"
              onClick={() => {
                setImageSrc(null);
                setResultSrc(null);
                setImageFile(null);
              }}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{loc.uploadAnother}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Upload Area (Minimal & Premium) */}
      {!imageSrc ? (
        <div className="relative overflow-hidden p-8 sm:p-14 rounded-3xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 bg-white dark:bg-slate-900/90 text-center space-y-6 shadow-sm transition-all group backdrop-blur-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 dark:from-emerald-950 dark:to-teal-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg">
              {loc.dropTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {loc.dropSub}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{loc.browseBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleNativeCamera}
              className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{loc.cameraBtn}</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3. Active Studio (Clean Glassmorphism Layout) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column (5/12) */}
          <div className="lg:col-span-5 space-y-5 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>{loc.backdropHeader}</span>
              </h3>
              {targetSampleColor && (
                <button
                  type="button"
                  onClick={() => setTargetSampleColor(null)}
                  className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Undo2 className="w-3 h-3" />
                  <span>Reset Sample</span>
                </button>
              )}
            </div>

            {/* Backdrop Swatches Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'transparent', label: loc.presets.transparent, icon: '🏁' },
                { id: '#ffffff', label: loc.presets.white, icon: '⚪' },
                { id: '#0284c7', label: loc.presets.blue, icon: '🔵' },
                { id: '#dc2626', label: loc.presets.red, icon: '🔴' },
                { id: '#10b981', label: loc.presets.green, icon: '🟢' },
                { id: '#0f172a', label: loc.presets.dark, icon: '⬛' },
                { id: 'gradient:sunset', label: loc.presets.sunset, icon: '🌅' },
                { id: 'gradient:ocean', label: loc.presets.ocean, icon: '🌊' },
                { id: 'gradient:neon', label: loc.presets.neon, icon: '🌌' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setBackdropMode(b.id);
                    triggerHaptic('selection');
                  }}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    backdropMode === b.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{b.icon}</span>
                  <span className="text-[10px] truncate max-w-full">{b.label}</span>
                </button>
              ))}
            </div>

            {/* Fine-Tune Sliders */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {/* Tolerance */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{loc.sensitivityLabel}</span>
                  <span className="font-mono text-emerald-600 font-bold">{tolerance}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="85"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Edge Feathering */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{loc.featherLabel}</span>
                  <span className="font-mono text-emerald-600 font-bold">{edgeSmoothing}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={edgeSmoothing}
                  onChange={(e) => setEdgeSmoothing(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Magic Wand Hint */}
            <div className="px-3 py-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Pipette className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{loc.eyedropperTip}</span>
            </div>

            {/* Action Download Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={!resultSrc}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{loc.downloadPng}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJpg}
                disabled={!resultSrc}
                className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-800 dark:border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{loc.downloadJpg}</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={!resultSrc}
                  className="py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{loc.shareBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImageSrc(null);
                    setResultSrc(null);
                    setImageFile(null);
                  }}
                  className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs text-center transition-all cursor-pointer"
                >
                  {loc.uploadAnother}
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview Viewport (7/12) */}
          <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'split' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {loc.viewSplit}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cutout')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'cutout' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {loc.viewCutout}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('original')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'original' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {loc.viewOriginal}
                </button>
              </div>

              {isProcessing && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{loc.processing}</span>
                </span>
              )}
            </div>

            {/* Image Canvas Container with high-end glass styling */}
            <div
              ref={previewContainerRef}
              className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-square sm:aspect-[4/3] flex items-center justify-center bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] shadow-inner select-none"
            >
              {viewMode === 'split' && resultSrc && imageSrc && (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Original Background Image */}
                  <img
                    src={imageSrc}
                    alt="Original"
                    onClick={handleImageSampleClick}
                    className="absolute inset-0 w-full h-full object-contain cursor-crosshair"
                  />

                  {/* Cutout Top Layer */}
                  <div
                    className="absolute inset-0 overflow-hidden flex items-center justify-center"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={resultSrc}
                      alt="Cutout"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>

                  {/* Split Divider Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center z-10"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white shadow-md flex items-center justify-center text-[9px] font-black border-2 border-white">
                      ↔
                    </div>
                  </div>

                  {/* Slider Range Input */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
                  />
                </div>
              )}

              {viewMode === 'cutout' && resultSrc && (
                <img
                  src={resultSrc}
                  alt="Cutout View"
                  className="max-h-full max-w-full object-contain"
                />
              )}

              {viewMode === 'original' && imageSrc && (
                <img
                  src={imageSrc}
                  alt="Original View"
                  onClick={handleImageSampleClick}
                  className="max-h-full max-w-full object-contain cursor-crosshair"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
