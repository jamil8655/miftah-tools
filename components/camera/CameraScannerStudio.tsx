'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  UploadCloud,
  FileText,
  Sparkles,
  RefreshCw,
  RotateCw,
  Trash2,
  Download,
  Plus,
  Sliders,
  Check,
  Zap,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown,
  Share2,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { Document, Paragraph, ImageRun, Packer } from 'docx';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { downloadSingleFile, shareDownloadedFile } from '@/lib/utils/download';
import { base64ToUint8Array } from '@/lib/utils/formatters';

interface ScannedPage {
  id: string;
  originalDataUrl: string;
  filteredDataUrl: string;
  filter: 'magic' | 'bw' | 'grayscale' | 'original';
  rotation: number;
}

const SCANNER_LOCALES = {
  en: {
    badge: 'Mobile Camera Scanner',
    title: 'Document & Receipt Camera Scanner',
    sub: 'Capture multi-page paper documents, receipts, and IDs with automatic contrast enhancement, B&W filters, and instant 1-click PDF/Word export.',
    startCamera: 'Open Camera',
    stopCamera: 'Close Camera',
    takePhoto: 'Capture Page',
    uploadGallery: 'Upload From Gallery',
    scannedPages: 'Scanned Document Pages',
    filterOriginal: 'Original',
    filterMagic: 'Magic Color',
    filterBw: 'B&W Document',
    filterGray: 'Grayscale',
    rotate: 'Rotate 90°',
    deletePage: 'Delete Page',
    addMorePages: 'Add Another Page',
    exportPdf: 'Generate Multi-Page PDF',
    exportDocx: 'Export to Word DOCX',
    processing: 'Processing scan...',
    emptyState: 'Click "Open Camera" or "Upload From Gallery" to begin scanning multi-page documents.',
  },
  ur: {
    badge: 'موبائل کیمرا اسکینر',
    title: 'ڈاکومنٹ و کیمرا اسکینر اسٹوڈیو',
    sub: 'موبائل کیمرے سے کاغذات، رسیدیں اور شناختی کارڈ اسکین کریں۔ میجک کلر، بی اینڈ ڈبلیو فلٹرز اور فوری پی ڈی ایف ایکسپورٹ کے ساتھ۔',
    startCamera: 'کیمرا کھولیں',
    stopCamera: 'کیمرا بند کریں',
    takePhoto: 'صفحہ اسکین کریں',
    uploadGallery: 'گیلری سے منتخب کریں',
    scannedPages: 'اسکین شدہ صفحات',
    filterOriginal: 'اصل تصویر',
    filterMagic: 'میجک کلر',
    filterBw: 'بلیک اینڈ وائٹ',
    filterGray: 'گرے اسکیل',
    rotate: '90 ڈگری گھمائیں',
    deletePage: 'صفحہ حذف کریں',
    addMorePages: 'مزید صفحہ شامل کریں',
    exportPdf: 'ملٹی پیج PDF بنائیں',
    exportDocx: 'ورڈ DOCX میں بدلیں',
    processing: 'اسکین پروسیس ہو رہا ہے...',
    emptyState: 'کاغذات اسکین کرنے کے لیے اوپر "کیمرا کھولیں" یا "گیلری سے منتخب کریں" پر کلک کریں۔',
  },
  ar: {
    badge: 'الماسح الضوئي الذكي بالكاميرا',
    title: 'ماسح المستندات والإيصالات بالكاميرا',
    sub: 'التقط المستندات الورقية والإيصالات وبطاقات الهوية بالكاميرا مع تحسين تلقائي للتباين وفلاتر الأبيض والأسود وتصدير فوري إلى PDF.',
    startCamera: 'فتح الكاميرا',
    stopCamera: 'إغلاق الكاميرا',
    takePhoto: 'التقاط الصفحة',
    uploadGallery: 'رفع من المعرض',
    scannedPages: 'الصفحات الممسوحة ضوئياً',
    filterOriginal: 'الأصل',
    filterMagic: 'ألوان سحرية (Magic)',
    filterBw: 'أبيض وأسود',
    filterGray: 'تدرج رمادي',
    rotate: 'تدوير 90°',
    deletePage: 'حذف الصفحة',
    addMorePages: 'إضافة صفحة أخرى',
    exportPdf: 'إنشاء ملف PDF متعدد الصفحات',
    exportDocx: 'تصدير كملف Word',
    processing: 'جاري معالجة المسح...',
    emptyState: 'انقر فوق "فتح الكاميرا" أو "رفع من المعرض" لبدء مسح المستندات.',
  },
  hi: {
    badge: 'मोबाइल कैमरा स्कैनर',
    title: 'डॉक्यूमेंट व रसीद कैमरा स्कैनर',
    sub: 'मोबाइल कैमरे से कागजात, रसीदें और आईडी कार्ड स्कैन करें। मैजिक कलर, ब्लैक एंड व्हाइट फिल्टर और त्वरित PDF/Word एक्सपोर्ट के साथ।',
    startCamera: 'कैमरा चालू करें',
    stopCamera: 'कैमरा बंद करें',
    takePhoto: 'पेज कैप्चर करें',
    uploadGallery: 'गैलरी से चुनें',
    scannedPages: 'स्कैन किए गए पेज',
    filterOriginal: 'मूल फ़ोटो',
    filterMagic: 'मैजिक कलर',
    filterBw: 'ब्लैक एंड व्हाइट',
    filterGray: 'ग्रेस्केल',
    rotate: '90° घुमाएं',
    deletePage: 'पेज हटाएं',
    addMorePages: 'एक और पेज जोड़ें',
    exportPdf: 'मल्टी-पेज PDF बनाएं',
    exportDocx: 'Word DOCX में बदलें',
    processing: 'स्कैन प्रोसेस हो रहा है...',
    emptyState: 'दस्तावेज़ स्कैन करने के लिए ऊपर "कैमरा चालू करें" या "गैलरी से चुनें" पर क्लिक करें।',
  },
};

export function CameraScannerStudio() {
  const { language, isRTL } = useI18n();
  const loc = SCANNER_LOCALES[language as keyof typeof SCANNER_LOCALES] || SCANNER_LOCALES.en;

  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply Document Filter onto canvas
  const applyFilterToImage = (
    dataUrl: string,
    filter: 'magic' | 'bw' | 'grayscale' | 'original',
    rotation: number
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const isRotated = rotation % 180 !== 0;
        canvas.width = isRotated ? img.naturalHeight : img.naturalWidth;
        canvas.height = isRotated ? img.naturalWidth : img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();

        if (filter === 'original') {
          return resolve(canvas.toDataURL('image/jpeg', 0.95));
        }

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;

          if (filter === 'grayscale') {
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
          } else if (filter === 'bw') {
            // Adaptive thresholding for crisp text
            const threshold = 140;
            const val = gray > threshold ? 255 : 0;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
          } else if (filter === 'magic') {
            // Contrast boost & Shadow reduction
            const factor = 1.35;
            const newR = Math.min(255, Math.max(0, (r - 128) * factor + 128 + 15));
            const newG = Math.min(255, Math.max(0, (g - 128) * factor + 128 + 15));
            const newB = Math.min(255, Math.max(0, (b - 128) * factor + 128 + 15));
            data[i] = newR;
            data[i + 1] = newG;
            data[i + 2] = newB;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.src = dataUrl;
    });
  };

  // Start Camera Stream
  const startCamera = async () => {
    try {
      triggerHaptic('selection');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      alert('Camera permission denied or camera unavailable. You can use "Upload From Gallery".');
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture Photo from Camera
  const capturePhoto = async () => {
    if (!videoRef.current) return;
    triggerHaptic('medium');
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    const filtered = await applyFilterToImage(dataUrl, 'magic', 0);
    const newPage: ScannedPage = {
      id: 'page_' + Date.now(),
      originalDataUrl: dataUrl,
      filteredDataUrl: filtered,
      filter: 'magic',
      rotation: 0,
    };

    setPages((prev) => [...prev, newPage]);
    setSelectedIndex(pages.length);
  };

  // Upload Photo from Gallery / Files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const filtered = await applyFilterToImage(dataUrl, 'magic', 0);
        const newPage: ScannedPage = {
          id: 'page_' + Date.now() + Math.random(),
          originalDataUrl: dataUrl,
          filteredDataUrl: filtered,
          filter: 'magic',
          rotation: 0,
        };
        setPages((prev) => [...prev, newPage]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Update Page Filter
  const changePageFilter = async (filter: 'magic' | 'bw' | 'grayscale' | 'original') => {
    if (pages.length === 0 || selectedIndex >= pages.length) return;
    triggerHaptic('selection');
    const cur = pages[selectedIndex];
    const filtered = await applyFilterToImage(cur.originalDataUrl, filter, cur.rotation);
    const updated = [...pages];
    updated[selectedIndex] = { ...cur, filter, filteredDataUrl: filtered };
    setPages(updated);
  };

  // Rotate Page 90 deg
  const rotateCurrentPage = async () => {
    if (pages.length === 0 || selectedIndex >= pages.length) return;
    triggerHaptic('light');
    const cur = pages[selectedIndex];
    const newRot = (cur.rotation + 90) % 360;
    const filtered = await applyFilterToImage(cur.originalDataUrl, cur.filter, newRot);
    const updated = [...pages];
    updated[selectedIndex] = { ...cur, rotation: newRot, filteredDataUrl: filtered };
    setPages(updated);
  };

  // Delete Page
  const deleteCurrentPage = () => {
    if (pages.length === 0 || selectedIndex >= pages.length) return;
    triggerHaptic('error');
    const updated = pages.filter((_, idx) => idx !== selectedIndex);
    setPages(updated);
    setSelectedIndex(Math.max(0, selectedIndex - 1));
  };

  // Export to Multi-Page PDF
  const exportAsPdf = async () => {
    if (pages.length === 0) return;
    setIsExporting(true);
    triggerHaptic('medium');

    try {
      const pdfDoc = await PDFDocument.create();

      for (const page of pages) {
        const imageBytes = base64ToUint8Array(page.filteredDataUrl);
        const embeddedImage = page.filteredDataUrl.startsWith('data:image/png')
          ? await pdfDoc.embedPng(imageBytes)
          : await pdfDoc.embedJpg(imageBytes);
        const { width, height } = embeddedImage.scale(1);

        // Standard A4 aspect mapping
        const pdfPage = pdfDoc.addPage([width, height]);
        pdfPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      await downloadSingleFile(blob, `Scanned_Document_${Date.now()}.pdf`);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const shareAsPdf = async () => {
    if (pages.length === 0) return;
    setIsExporting(true);
    triggerHaptic('medium');

    try {
      const pdfDoc = await PDFDocument.create();

      for (const page of pages) {
        const imageBytes = base64ToUint8Array(page.filteredDataUrl);
        const embeddedImage = page.filteredDataUrl.startsWith('data:image/png')
          ? await pdfDoc.embedPng(imageBytes)
          : await pdfDoc.embedJpg(imageBytes);

        const { width, height } = embeddedImage.scale(1);
        const pdfPage = pdfDoc.addPage([width, height]);
        pdfPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      await shareDownloadedFile({
        name: `Scanned_Document_${Date.now()}.pdf`,
        blob,
        mimeType: 'application/pdf',
      });
    } catch (err: any) {
      alert(`Share error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Export to Word Document
  const exportAsDocx = async () => {
    if (pages.length === 0) return;
    setIsExporting(true);
    triggerHaptic('medium');

    try {
      const docxParagraphs: Paragraph[] = [];

      for (const page of pages) {
        const imageBytes = base64ToUint8Array(page.filteredDataUrl);
        docxParagraphs.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBytes,
                transformation: { width: 550, height: 750 },
                type: page.filteredDataUrl.startsWith('data:image/png') ? 'png' : 'jpg',
              }),
            ],
            spacing: { after: 200 },
          })
        );
      }

      const doc = new Document({
        sections: [{ properties: {}, children: docxParagraphs }],
      });

      const blob = await Packer.toBlob(doc);
      await downloadSingleFile(blob, `Scanned_Document_${Date.now()}.docx`);
    } catch (err: any) {
      alert(`Word Export error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {!isCameraActive ? (
            <button
              type="button"
              onClick={startCamera}
              className="px-4 py-2 rounded-2xl text-xs font-bold bg-brand-600 text-white shadow-md hover:bg-brand-700 transition-all flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>{loc.startCamera}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 rounded-2xl text-xs font-bold bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-all flex items-center gap-2"
            >
              <span>{loc.stopCamera}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-2xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-brand-500 shadow-xs transition-all flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4 text-brand-600" />
            <span>{loc.uploadGallery}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {pages.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isExporting}
              onClick={exportAsPdf}
              className="px-4 py-2 rounded-2xl text-xs font-bold bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              <span>{loc.exportPdf} ({pages.length})</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={exportAsDocx}
              className="px-4 py-2 rounded-2xl text-xs font-bold bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>{loc.exportDocx}</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={shareAsPdf}
              className="px-3.5 py-2 rounded-2xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-2 shadow-xs"
              title="Share PDF Document"
            >
              <Share2 className="w-4 h-4 text-brand-600" />
              <span className="hidden sm:inline">Share PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Live Camera Viewport */}
      {isCameraActive && (
        <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-brand-500 shadow-2xl max-w-xl mx-auto aspect-[3/4]">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-6 inset-x-0 flex justify-center items-center gap-4">
            <button
              type="button"
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-white text-brand-600 border-4 border-brand-500 flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
            >
              <Camera className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}

      {/* Scanned Pages Viewer & Studio */}
      {pages.length > 0 && (
        <div className="space-y-6">
          {/* Main Selected Page Preview & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image Preview Canvas */}
            <div className="md:col-span-2 rounded-3xl p-4 bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[420px] shadow-inner relative">
              <img
                src={pages[selectedIndex]?.filteredDataUrl}
                alt={`Page ${selectedIndex + 1}`}
                className="max-h-[500px] w-auto object-contain rounded-xl shadow-2xl"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-black/70 text-white text-xs font-bold backdrop-blur-md">
                Page {selectedIndex + 1} of {pages.length}
              </div>
            </div>

            {/* Editing Tools Column */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-600" />
                <span>Document Enhancer Filters</span>
              </h4>

              {/* Filter Selection Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'magic', label: loc.filterMagic, icon: Sparkles },
                  { id: 'bw', label: loc.filterBw, icon: Zap },
                  { id: 'grayscale', label: loc.filterGray, icon: Layers },
                  { id: 'original', label: loc.filterOriginal, icon: Eye },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => changePageFilter(f.id as any)}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-1.5 ${
                      pages[selectedIndex]?.filter === f.id
                        ? 'bg-brand-50 text-brand-700 border-brand-500 dark:bg-brand-950/60 dark:text-brand-300'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <f.icon className="w-4 h-4" />
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>

              {/* Manipulation Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={rotateCurrentPage}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{loc.rotate}</span>
                </button>

                <button
                  type="button"
                  onClick={deleteCurrentPage}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Thumbnail Strip */}
          <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-500 block">{loc.scannedPages}</span>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => {
                    triggerHaptic('selection');
                    setSelectedIndex(idx);
                  }}
                  className={`relative shrink-0 w-20 h-28 rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                    selectedIndex === idx
                      ? 'border-brand-600 scale-105 shadow-md'
                      : 'border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p.filteredDataUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white">
                    {idx + 1}
                  </span>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  if (isCameraActive) capturePhoto();
                  else fileInputRef.current?.click();
                }}
                className="shrink-0 w-20 h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-brand-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[9px] font-bold">{loc.addMorePages}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {pages.length === 0 && !isCameraActive && (
        <div className="p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {loc.emptyState}
          </p>
        </div>
      )}
    </div>
  );
}
