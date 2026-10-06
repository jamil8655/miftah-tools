'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  UploadCloud,
  FileText,
  Zap,
  RotateCw,
  Trash2,
  Plus,
  Sliders,
  Layers,
  Eye,
  FileDown,
  Share2,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Video,
  VideoOff,
  Sparkles,
  HelpCircle,
  X,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { Document, Paragraph, ImageRun, Packer } from 'docx';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { downloadSingleFile, shareDownloadedFile } from '@/lib/utils/download';
import { base64ToUint8Array } from '@/lib/utils/formatters';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';

interface ScannedPage {
  id: string;
  originalDataUrl: string;
  filteredDataUrl: string;
  filter: 'magic' | 'bw' | 'grayscale' | 'original';
  rotation: number;
}

const SCANNER_LOCALES = {
  en: {
    badge: 'HD Mobile Camera & Document Scanner',
    title: 'Document & Receipt Camera Scanner',
    sub: 'Capture paper documents, receipts, and IDs with instant contrast enhancement, B&W filters, and 1-click multi-page PDF & Word export.',
    startCamera: 'Snap with Camera',
    liveViewfinder: 'Live Video Viewfinder',
    stopLive: 'Close Live Viewfinder',
    snapPhoto: 'Take Snapshot',
    uploadGallery: 'Upload from Gallery',
    scannedPages: 'Scanned Document Pages',
    filterOriginal: 'Original',
    filterMagic: 'Magic Color (Enhanced)',
    filterBw: 'B&W Document',
    filterGray: 'Grayscale',
    rotate: 'Rotate 90°',
    deletePage: 'Delete Page',
    addMorePages: 'Add Another Page',
    exportPdf: 'Download PDF',
    exportDocx: 'Download Word (DOCX)',
    sharePdf: 'Share PDF',
    processing: 'Processing scan...',
    emptyTitle: 'No Document Scanned Yet',
    emptyState: 'Tap "Snap with Camera", "Live Video Viewfinder", or "Upload from Gallery" to start scanning.',
    liveNotice: 'Point your camera at a document or receipt and tap "Take Snapshot".',
  },
  ur: {
    badge: 'موبائل کیمرا اور ڈاکومنٹ اسکینر پرو',
    title: 'ڈاکومنٹ و کیمرا اسکینر اسٹوڈیو',
    sub: 'موبائل کیمرے سے کاغذات، رسیدیں اور شناختی کارڈ اسکین کریں۔ میجک کلر، بی اینڈ ڈبلیو فلٹرز اور فوری پی ڈی ایف ایکسپورٹ کے ساتھ۔',
    startCamera: 'کیمرے سے تصویر لیں',
    liveViewfinder: 'لائیو ویڈیو کیمرا',
    stopLive: 'لائیو کیمرا بند کریں',
    snapPhoto: 'تصویر کھینچیں (Snap)',
    uploadGallery: 'گیلری سے منتخب کریں',
    scannedPages: 'اسکین شدہ صفحات',
    filterOriginal: 'اصل تصویر',
    filterMagic: 'میجک کلر (واضح تحریر)',
    filterBw: 'بلیک اینڈ وائٹ',
    filterGray: 'گرے اسکیل',
    rotate: '90° گھمائیں',
    deletePage: 'صفحہ حذف کریں',
    addMorePages: 'مزید صفحہ جوڑیں',
    exportPdf: 'PDF ڈاؤن لوڈ کریں',
    exportDocx: 'Word فائل ڈاؤن لوڈ کریں',
    sharePdf: 'پی ڈی ایف شیئر کریں',
    processing: 'اسکین تیار ہو رہا ہے...',
    emptyTitle: 'کوئی دستاویز اسکین نہیں ہوئی',
    emptyState: 'کاغذات اسکین کرنے کے لیے اوپر "کیمرے سے تصویر لیں"، "لائیو ویڈیو کیمرا" یا "گیلری سے منتخب کریں" پر ٹیپ کریں۔',
    liveNotice: 'کیمرے کو کاغذ یا رسید کے سامنے رکھیں اور نیچے "تصویر کھینچیں" پر کلک کریں۔',
  },
  ar: {
    badge: 'ماسح المستندات عالي الدقة بالكاميرا',
    title: 'ماسح المستندات والإيصالات بالكاميرا',
    sub: 'التقط المستندات الورقية والإيصالات وبطاقات الهوية بالكاميرا مع تحسين تلقائي للتباين وفلاتر الأبيض والأسود وتصدير فوري إلى PDF و Word.',
    startCamera: 'التقاط بالكاميرا',
    liveViewfinder: 'معاينة الكاميرا الحية',
    stopLive: 'إغلاق الكاميرا الحية',
    snapPhoto: 'التقاط صورة',
    uploadGallery: 'رفع من المعرض',
    scannedPages: 'الصفحات الممسوحة',
    filterOriginal: 'الأصل',
    filterMagic: 'ألوان سحرية محسنة',
    filterBw: 'أبيض وأسود',
    filterGray: 'تدرج رمادي',
    rotate: 'تدوير 90°',
    deletePage: 'حذف الصفحة',
    addMorePages: 'إضافة صفحة أخرى',
    exportPdf: 'تحميل PDF',
    exportDocx: 'تحميل Word',
    sharePdf: 'مشاركة PDF',
    processing: 'جاري المعالجة...',
    emptyTitle: 'لم يتم مسح أي مستند بعد',
    emptyState: 'انقر فوق "التقاط بالكاميرا" أو "رفع من المعرض" لبدء مسح المستندات.',
    liveNotice: 'وجه الكاميرا نحو المستند ثم اضغط على "التقاط صورة".',
  },
  hi: {
    badge: 'मोबाइल कैमरा व डॉक्यूमेंट स्कैनर',
    title: 'डॉक्यूमेंट व रसीद कैमरा स्कैनर',
    sub: 'मोबाइल कैमरे से कागजात, रसीदें और आईडी कार्ड स्कैन करें। मैजिक कलर, ब्लैक एंड व्हाइट फिल्टर और तुरंत PDF/Word एक्सपोर्ट के साथ।',
    startCamera: 'कैमरा से फोटो लें',
    liveViewfinder: 'लाइव वीडियो कैमरा',
    stopLive: 'लाइव कैमरा बंद करें',
    snapPhoto: 'फोटो खींचें (Snap)',
    uploadGallery: 'गैलरी से चुनें',
    scannedPages: 'स्कैन किए गए पेज',
    filterOriginal: 'मूल फ़ोटो',
    filterMagic: 'मैजिक कलर (स्पष्ट टेक्स्ट)',
    filterBw: 'ब्लैक एंड व्हाइट',
    filterGray: 'ग्रेस्केल',
    rotate: '90° घुमाएं',
    deletePage: 'पेज हटाएं',
    addMorePages: 'नया पेज जोड़ें',
    exportPdf: 'PDF डाउनलोड करें',
    exportDocx: 'Word डाउनलोड करें',
    sharePdf: 'PDF शेयर करें',
    processing: 'स्कैन प्रोसेस हो रहा है...',
    emptyTitle: 'कोई दस्तावेज़ स्कैन नहीं हुआ',
    emptyState: 'दस्तावेज़ स्कैन करने के लिए ऊपर "कैमरा से फोटो लें" या "गैलरी से चुनें" पर टैप करें।',
    liveNotice: 'कैमरा कागज़ की तरफ रखें और "फोटो खींचें" दबाएं।',
  },
};

export function CameraScannerStudio() {
  const { language, isRTL } = useI18n();
  const loc = SCANNER_LOCALES[language as keyof typeof SCANNER_LOCALES] || SCANNER_LOCALES.ur;

  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Live in-browser video stream state
  const [isLiveViewfinderOpen, setIsLiveViewfinderOpen] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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
            const threshold = 140;
            const val = gray > threshold ? 255 : 0;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
          } else if (filter === 'magic') {
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
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const addScannedImage = async (dataUrl: string) => {
    setIsProcessing(true);
    try {
      const filtered = await applyFilterToImage(dataUrl, 'magic', 0);
      const newPage: ScannedPage = {
        id: 'page_' + Date.now() + Math.random(),
        originalDataUrl: dataUrl,
        filteredDataUrl: filtered,
        filter: 'magic',
        rotation: 0,
      };
      setPages((prev) => {
        const next = [...prev, newPage];
        setSelectedIndex(next.length - 1);
        return next;
      });
      triggerHaptic('success');
    } catch (e: any) {
      console.error('Filter processing error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 1. Direct Native & Web Camera Trigger
  const handleCaptureCamera = () => {
    triggerHaptic('medium');
    setErrorMessage(null);

    // If native Capacitor Android, trigger native camera
    if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
      (async () => {
        try {
          const photo = await CapCamera.getPhoto({
            quality: 92,
            allowEditing: false,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Camera,
            saveToGallery: false,
          });

          if (photo.dataUrl) {
            await addScannedImage(photo.dataUrl);
            return;
          }
          if (photo.base64String) {
            const mime = photo.format ? `image/${photo.format}` : 'image/jpeg';
            await addScannedImage(`data:${mime};base64,${photo.base64String}`);
            return;
          }
          if (photo.webPath) {
            const response = await fetch(photo.webPath);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onload = async () => {
              if (reader.result) {
                await addScannedImage(reader.result as string);
              }
            };
            reader.readAsDataURL(blob);
            return;
          }
        } catch (err: any) {
          console.warn('Native camera notice, using html5 fallback:', err);
          if (cameraInputRef.current) {
            cameraInputRef.current.click();
          }
        }
      })();
      return;
    }

    // Direct synchronous call for Web & standard browsers (preserves trusted user gesture)
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Gallery Picker (Native & Web)
  const handlePickGallery = () => {
    triggerHaptic('medium');
    setErrorMessage(null);

    if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
      (async () => {
        try {
          const photo = await CapCamera.getPhoto({
            quality: 92,
            allowEditing: false,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Photos,
            saveToGallery: false,
          });

          if (photo.dataUrl) {
            await addScannedImage(photo.dataUrl);
            return;
          }
          if (photo.base64String) {
            const mime = photo.format ? `image/${photo.format}` : 'image/jpeg';
            await addScannedImage(`data:${mime};base64,${photo.base64String}`);
            return;
          }
          if (photo.webPath) {
            const response = await fetch(photo.webPath);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onload = async () => {
              if (reader.result) {
                await addScannedImage(reader.result as string);
              }
            };
            reader.readAsDataURL(blob);
            return;
          }
        } catch (err: any) {
          console.warn('Native gallery notice, using html5 fallback:', err);
          if (fileInputRef.current) {
            fileInputRef.current.click();
          }
        }
      })();
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 2. Start Live Video Viewfinder
  const startLiveViewfinder = async () => {
    setErrorMessage(null);
    triggerHaptic('medium');
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsLiveViewfinderOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.warn('Video play error:', e));
        }
      }, 100);
    } catch (err: any) {
      console.warn('Live viewfinder fallback:', err);
      // If live video fails, trigger snapshot camera input
      handleCaptureCamera();
    }
  };

  const stopLiveViewfinder = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveViewfinderOpen(false);
    triggerHaptic('light');
  };

  // Snap photo from live viewfinder
  const snapLivePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    triggerHaptic('medium');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      addScannedImage(dataUrl);
    }
  };

  // Upload Photo from Gallery / Files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    triggerHaptic('selection');

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = async () => {
        if (reader.result) {
          await addScannedImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
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
        const image = await pdfDoc.embedJpg(imageBytes);
        const pdfPage = pdfDoc.addPage([image.width, image.height]);
        pdfPage.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const filename = `Scanned_Document_${Date.now()}.pdf`;
      downloadSingleFile(blob, filename);
      triggerHaptic('success');
    } catch (err: any) {
      alert(`PDF Export error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Share PDF
  const shareAsPdf = async () => {
    if (pages.length === 0) return;
    setIsExporting(true);
    triggerHaptic('light');

    try {
      const pdfDoc = await PDFDocument.create();

      for (const page of pages) {
        const imageBytes = base64ToUint8Array(page.filteredDataUrl);
        const image = await pdfDoc.embedJpg(imageBytes);
        const pdfPage = pdfDoc.addPage([image.width, image.height]);
        pdfPage.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      await shareDownloadedFile({
        name: `Scanned_Document_${Date.now()}.pdf`,
        blob,
        mimeType: 'application/pdf',
      });
      triggerHaptic('success');
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
      triggerHaptic('success');
    } catch (err: any) {
      alert(`Word Export error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Hidden native HTML5 camera & file inputs for 100% reliable fallback */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-7 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-brand-500/25 shrink-0">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {loc.title}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                  HD Scanner Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                {loc.sub}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleCaptureCamera}
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{loc.startCamera}</span>
            </button>

            <button
              type="button"
              onClick={isLiveViewfinderOpen ? stopLiveViewfinder : startLiveViewfinder}
              className="px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 shadow-sm active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>{isLiveViewfinderOpen ? loc.stopLive : loc.liveViewfinder}</span>
            </button>

            <button
              type="button"
              onClick={handlePickGallery}
              className="px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-brand-400" />
              <span>{loc.uploadGallery}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Video Viewfinder Overlay (When active) */}
      {isLiveViewfinderOpen && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{loc.liveNotice}</span>
            </div>
            <button
              type="button"
              onClick={stopLiveViewfinder}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] sm:aspect-video flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Document alignment overlay frame */}
            <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="text-white/70 text-xs font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                Align Document in Frame
              </span>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={snapLivePhoto}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>{loc.snapPhoto}</span>
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Scanned Pages Viewer & Studio */}
      {pages.length > 0 ? (
        <div className="space-y-6">
          {/* Top Export Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 dark:text-white px-2">
                {pages.length} {pages.length === 1 ? 'Page' : 'Pages'} Scanned
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={isExporting}
                onClick={exportAsPdf}
                className="px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>{loc.exportPdf}</span>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={exportAsDocx}
                className="px-4 py-2.5 rounded-xl text-xs font-black bg-brand-600 hover:bg-brand-500 text-white shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{loc.exportDocx}</span>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={shareAsPdf}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                title={loc.sharePdf}
              >
                <Share2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span className="hidden sm:inline">{loc.sharePdf}</span>
              </button>
            </div>
          </div>

          {/* Main Selected Page Preview & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Image Preview Canvas */}
            <div className="md:col-span-8 rounded-3xl p-4 bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[420px] shadow-inner relative overflow-hidden">
              <img
                src={pages[selectedIndex]?.filteredDataUrl}
                alt={`Page ${selectedIndex + 1}`}
                className="max-h-[520px] w-auto object-contain rounded-xl shadow-2xl transition-all"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-black/75 text-white text-xs font-bold backdrop-blur-md">
                Page {selectedIndex + 1} of {pages.length}
              </div>
            </div>

            {/* Editing Tools Column */}
            <div className="md:col-span-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-600" />
                <span>Enhance & Filters</span>
              </h4>

              {/* Filter Selection Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'magic', label: loc.filterMagic, icon: Wrench },
                  { id: 'bw', label: loc.filterBw, icon: Zap },
                  { id: 'grayscale', label: loc.filterGray, icon: Sliders },
                  { id: 'original', label: loc.filterOriginal, icon: Eye },
                ].map((f) => {
                  const Icon = f.icon;
                  const isSelected = pages[selectedIndex]?.filter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => changePageFilter(f.id as any)}
                      className={`p-3 rounded-2xl border text-xs font-black flex flex-col items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-brand-50 dark:bg-brand-950 border-brand-500 text-brand-700 dark:text-brand-300 shadow-sm ring-2 ring-brand-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-brand-600" />
                      <span className="text-[11px] text-center">{f.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Page Controls (Rotate / Delete) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={rotateCurrentPage}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{loc.rotate}</span>
                </button>

                <button
                  type="button"
                  onClick={deleteCurrentPage}
                  className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{loc.deletePage}</span>
                </button>
              </div>

              {/* Add More Pages Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={handleCaptureCamera}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{loc.addMorePages} (Camera)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Thumbnails Carousel */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              <span>{loc.scannedPages}</span>
            </h4>

            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative shrink-0 w-20 h-28 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedIndex === idx
                      ? 'border-brand-600 ring-2 ring-brand-500/30 scale-105'
                      : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p.filteredDataUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                    {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        !isLiveViewfinderOpen && (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto border border-brand-200 dark:border-brand-800 shadow-inner">
              <Smartphone className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {loc.emptyTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {loc.emptyState}
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
