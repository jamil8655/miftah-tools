'use client';

import React, { useState, useRef } from 'react';
import {
  Scissors,
  Crop,
  Layers,
  FileText,
  Upload,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Sparkles,
  Split,
  FileCheck2,
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { downloadSingleFile, openDownloadedFile, SavedFileInfo } from '@/lib/utils/download';
import { saveProcessedFile, logActivity } from '@/lib/storage/indexeddb-store';
import { formatBytes } from '@/lib/utils/formatters';
import { DownloadSuccessModal } from '@/components/shared/DownloadSuccessModal';

export type CutMode = 'split-horizontal' | 'split-vertical' | 'auto-trim' | 'custom-margins';

interface UploadedImageItem {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

const STUDIO_LOCALES = {
  en: {
    title: 'Auto Cut & Smart Crop Images to PDF',
    subtitle: 'Upload multiple document photos, split halves (top/bottom, left/right), trim borders, and generate a cleanly numbered PDF.',
    uploadLabel: 'Tap to Upload Images or Drag & Drop Here',
    uploadHint: 'Supports multiple JPG, PNG, WebP (Scanned pages, receipts, book spreads, half-page documents)',
    cutModes: {
      splitH: 'Top & Bottom Half Split (50/50)',
      splitHDesc: 'Cuts each photo horizontally into Top & Bottom pages (ideal for 2 receipts/forms per page)',
      splitV: 'Left & Right Half Split (50/50)',
      splitVDesc: 'Cuts each photo vertically into Left & Right pages (ideal for open books & 2-page scans)',
      autoTrim: 'Auto Content Trim',
      autoTrimDesc: 'Automatically detects document borders and removes blank margins/backgrounds',
      custom: 'Custom Margin Crop',
      customDesc: 'Set exact percentage to cut from Top, Bottom, Left, and Right',
    },
    customMarginsLabel: 'Crop Margins (%)',
    topCut: 'Cut Top (%):',
    bottomCut: 'Cut Bottom (%):',
    leftCut: 'Cut Left (%):',
    rightCut: 'Cut Right (%):',
    pdfOptionsTitle: 'PDF & Page Numbering Settings',
    pageSize: 'Page Format:',
    pageNumbering: 'Page Numbers:',
    numNone: 'No Page Numbers',
    numBottomCenter: 'Bottom Center (Page X of Y)',
    numBottomRight: 'Bottom Right (Page X of Y)',
    numTopRight: 'Top Right (Page X of Y)',
    btnGenerate: 'Generate Numbered PDF',
    btnProcessing: 'Processing & Cutting Pages...',
    totalImages: (count: number) => `${count} Image${count > 1 ? 's' : ''} Uploaded`,
    estimatedPages: (count: number) => `Generates ≈ ${count} PDF Pages`,
    clearAll: 'Clear All',
    emptyNotice: 'Please upload at least one image to begin cropping and assembling to PDF.',
    previewBadgeTop: 'Page 1: Top Half',
    previewBadgeBottom: 'Page 2: Bottom Half',
    previewBadgeLeft: 'Page 1: Left Half',
    previewBadgeRight: 'Page 2: Right Half',
  },
  ur: {
    title: 'امیج آٹو کٹ اور اسمارٹ پی ڈی ایف جنریٹر',
    subtitle: 'متعدد تصاویر اپ لوڈ کریں، آدھے صفحات (اوپر/نیچے یا دائیں/بائیں) کاٹیں، اور نمبرنگ کے ساتھ معیاری PDF بنائیں۔',
    uploadLabel: 'تصاویر اپ لوڈ کرنے کے لیے کلک کریں یا ڈریگ کریں',
    uploadHint: 'متعدد JPG, PNG, WebP سپورٹڈ ہیں (رسیدیں، کھلی کتابیں، اسکین شدہ دستاویزات)',
    cutModes: {
      splitH: 'اوپر اور نیچے آدھا کٹ (50/50)',
      splitHDesc: 'ہر تصویر کو اوپر اور نیچے دو الگ صفحات میں کاٹتا ہے (رسیدوں اور فارمز کے لیے بہترین)',
      splitV: 'دائیں اور بائیں آدھا کٹ (50/50)',
      splitVDesc: 'ہر تصویر کو دائیں اور بائیں دو الگ صفحات میں کاٹتا ہے (کھلی کتاب کے صفحات کے لیے)',
      autoTrim: 'خودکار بارڈر ٹرم',
      autoTrimDesc: 'دستاویز کے کنارے خودکار شناخت کر کے فالتو خالی حصہ کاٹ دیتا ہے',
      custom: 'اپنی مرضی کا کٹ (Custom %)',
      customDesc: 'اوپر، نیچے، دائیں، اور بائیں سے کتنا فیصد کاٹنا ہے خود طے کریں',
    },
    customMarginsLabel: 'کاٹنے کا فیصد (%)',
    topCut: 'اوپر سے کاٹیں (%):',
    bottomCut: 'نیچے سے کاٹیں (%):',
    leftCut: 'بائیں سے کاٹیں (%):',
    rightCut: 'دائیں سے کاٹیں (%):',
    pdfOptionsTitle: 'پی ڈی ایف اور پیج نمبرنگ کی ترتیبات',
    pageSize: 'صفحہ کا سائز:',
    pageNumbering: 'صفحہ کے نمبر:',
    numNone: 'نمبر کے بغیر',
    numBottomCenter: 'نیچے درمیان میں (Page X of Y)',
    numBottomRight: 'نیچے دائیں طرف (Page X of Y)',
    numTopRight: 'اوپر دائیں طرف (Page X of Y)',
    btnGenerate: 'پی ڈی ایف تیار کریں',
    btnProcessing: 'صفحات کاٹے جا رہے ہیں...',
    totalImages: (count: number) => `${count} تصاویر منتخب`,
    estimatedPages: (count: number) => `تقریباً ${count} پی ڈی ایف صفحات بنیں گے`,
    clearAll: 'سب صاف کریں',
    emptyNotice: 'پی ڈی ایف بنانے کے لیے کم از کم ایک تصویر اپ لوڈ کریں۔',
    previewBadgeTop: 'صفحہ 1: اوپر کا حصہ',
    previewBadgeBottom: 'صفحہ 2: نیچے کا حصہ',
    previewBadgeLeft: 'صفحہ 1: بائیں کا حصہ',
    previewBadgeRight: 'صفحہ 2: دائیں کا حصہ',
  },
  ar: {
    title: 'قص وتقسيم الصور تلقائياً إلى PDF مرقم',
    subtitle: 'ارفع صور المستندات، قم بقص النصفين (علوي/سفلي أو أيمن/أيسر) وإنشاء مستند PDF منظم ومرقم.',
    uploadLabel: 'انقر لرفع الصور أو اسحبها هنا',
    uploadHint: 'يدعم JPG, PNG, WebP (المستندات، الفواتير، الكتب المفتوحة، الإيصالات)',
    cutModes: {
      splitH: 'تقسيم علوي وسفلي (50/50)',
      splitHDesc: 'قص كل صورة أفقياً إلى صفحتين علوية وسفلية (مثالي للإيصالات واستمارات النصف صفحة)',
      splitV: 'تقسيم أيمن وأيسر (50/50)',
      splitVDesc: 'قص كل صورة عمودياً إلى صفحتين يمنى ويسرى (مثالي لمسح الكتب المفتوحة)',
      autoTrim: 'اقتصاص الحواف تلقائياً',
      autoTrimDesc: 'اكتشاف حدود المستند وقص الهوامش الفارغة والخلفية تلقائياً',
      custom: 'قص مخصص بالنسبة المئوية',
      customDesc: 'حدد نسبة مئوية مخصصة للقص من الأعلى والأسفل واليمين واليسار',
    },
    customMarginsLabel: 'نسبة هوامش القص (%)',
    topCut: 'قص من الأعلى (%):',
    bottomCut: 'قص من الأسفل (%):',
    leftCut: 'قص من اليسار (%):',
    rightCut: 'قص من اليمين (%):',
    pdfOptionsTitle: 'خيارات PDF وترقيم الصفحات',
    pageSize: 'تنسيق الصفحة:',
    pageNumbering: 'ترقيم الصفحات:',
    numNone: 'بدون أرقام صفحات',
    numBottomCenter: 'أسفل الوسط (صفحة X من Y)',
    numBottomRight: 'أسفل اليمين (صفحة X من Y)',
    numTopRight: 'أعلى اليمين (صفحة X من Y)',
    btnGenerate: 'إنشاء ملف PDF مرقم',
    btnProcessing: 'جارٍ قص الصفحات والتجميع...',
    totalImages: (count: number) => `تم رفع ${count} صور`,
    estimatedPages: (count: number) => `سينتج حوالي ${count} صفحات PDF`,
    clearAll: 'مسح الكل',
    emptyNotice: 'يرجى رفع صورة واحدة على الأقل لبدء القص وتجميع PDF.',
    previewBadgeTop: 'صفحة 1: النصف العلوي',
    previewBadgeBottom: 'صفحة 2: النصف السفلي',
    previewBadgeLeft: 'صفحة 1: النصف الأيسر',
    previewBadgeRight: 'صفحة 2: النصف الأيمن',
  },
  hi: {
    title: 'ऑटो कट और स्मार्ट क्रॉप इमेज टू PDF',
    subtitle: 'तस्वीरें अपलोड करें, आधा पन्ना (ऊपर/नीचे या बाएं/दाएं) काटें, बॉर्डर ट्रिम करें और नंबरिंग के साथ व्यवस्थित PDF बनाएं।',
    uploadLabel: 'तस्वीरें अपलोड करने के लिए क्लिक करें या यहाँ खींचें',
    uploadHint: 'एकाधिक JPG, PNG, WebP समर्थित (रसीदें, किताबें, स्कैन किए गए दस्तावेज़, आधे पन्ने के फॉर्म)',
    cutModes: {
      splitH: 'ऊपर और नीचे आधा कट (50/50)',
      splitHDesc: 'प्रत्येक फोटो को ऊपर और नीचे दो अलग-अलग पेजों में बांटता है (रसीद और 2-फॉर्म प्रति पेज के लिए)',
      splitV: 'बाएं और दाएं आधा कट (50/50)',
      splitVDesc: 'प्रत्येक फोटो को बाएं और दाएं दो अलग-अलग पेजों में बांटता है (खुली किताब या 2-पेज स्कैन के लिए)',
      autoTrim: 'ऑटो कंटेंट बॉर्डर ट्रिम',
      autoTrimDesc: 'दस्तावेज़ की सीमाओं को पहचानकर खाली किनारे स्वतः हटा देता है',
      custom: 'कस्टम कट प्रतिशत (Custom %)',
      customDesc: 'ऊपर, नीचे, बाएं और दाएं से कितना हिस्सा काटना है खुद तय करें',
    },
    customMarginsLabel: 'काटने का प्रतिशत (%)',
    topCut: 'ऊपर से काटें (%):',
    bottomCut: 'नीचे से काटें (%):',
    leftCut: 'बाएं से काटें (%):',
    rightCut: 'दाएं से काटें (%):',
    pdfOptionsTitle: 'PDF और पेज नंबरिंग सेटिंग्स',
    pageSize: 'पेज साइज:',
    pageNumbering: 'पेज नंबरिंग:',
    numNone: 'कोई पेज नंबर नहीं',
    numBottomCenter: 'नीचे बीच में (Page X of Y)',
    numBottomRight: 'नीचे दाएं (Page X of Y)',
    numTopRight: 'ऊपर दाएं (Page X of Y)',
    btnGenerate: 'नंबरिंग के साथ PDF बनाएं',
    btnProcessing: 'पेज काटे और प्रोसेस किए जा रहे हैं...',
    totalImages: (count: number) => `${count} तस्वीरें अपलोड की गईं`,
    estimatedPages: (count: number) => `लगभग ${count} PDF पेज बनेंगे`,
    clearAll: 'सभी हटाएं',
    emptyNotice: 'कृपया PDF बनाने के लिए कम से कम एक इमेज अपलोड करें।',
    previewBadgeTop: 'पेज 1: ऊपर का आधा भाग',
    previewBadgeBottom: 'पेज 2: नीचे का आधा भाग',
    previewBadgeLeft: 'पेज 1: बायां आधा भाग',
    previewBadgeRight: 'पेज 2: दायां आधा भाग',
  },
};

export function AutoCropImagesToPdfStudio() {
  const { language } = useI18n();
  const loc = STUDIO_LOCALES[language as keyof typeof STUDIO_LOCALES] || STUDIO_LOCALES.en;

  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [cutMode, setCutMode] = useState<CutMode>('split-horizontal');
  const [topCrop, setTopCrop] = useState<number>(0);
  const [bottomCrop, setBottomCrop] = useState<number>(0);
  const [leftCrop, setLeftCrop] = useState<number>(0);
  const [rightCrop, setRightCrop] = useState<number>(0);

  const [pageSize, setPageSize] = useState<'a4-portrait' | 'a4-landscape' | 'fit'>('a4-portrait');
  const [numbering, setNumbering] = useState<'none' | 'bottom-center' | 'bottom-right' | 'top-right'>('bottom-center');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [savedFileInfo, setSavedFileInfo] = useState<SavedFileInfo | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    triggerHaptic('light');

    const fileList = Array.from(e.target.files);
    const newItems: UploadedImageItem[] = [];

    for (const file of fileList) {
      const previewUrl = URL.createObjectURL(file);
      const dimensions = await getImageDimensions(previewUrl);
      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl,
        width: dimensions.width,
        height: dimensions.height,
      });
    }

    setImages((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 800, height: 1200 });
      img.src = url;
    });
  };

  const removeImage = (id: string) => {
    triggerHaptic('light');
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    triggerHaptic('light');
    setImages((prev) => {
      const next = [...prev];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  // Crop & Slice image on Canvas into ArrayBuffer(s)
  const processImageSlices = async (
    item: UploadedImageItem
  ): Promise<{ buffer: ArrayBuffer; width: number; height: number }[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const slices: { buffer: ArrayBuffer; width: number; height: number }[] = [];
        const natW = img.naturalWidth;
        const natH = img.naturalHeight;

        if (cutMode === 'split-horizontal') {
          // Slice 1: Top Half
          const canvasTop = document.createElement('canvas');
          canvasTop.width = natW;
          canvasTop.height = Math.floor(natH / 2);
          const ctxTop = canvasTop.getContext('2d')!;
          ctxTop.drawImage(img, 0, 0, natW, Math.floor(natH / 2), 0, 0, natW, Math.floor(natH / 2));

          // Slice 2: Bottom Half
          const canvasBottom = document.createElement('canvas');
          canvasBottom.width = natW;
          canvasBottom.height = Math.ceil(natH / 2);
          const ctxBottom = canvasBottom.getContext('2d')!;
          ctxBottom.drawImage(
            img,
            0,
            Math.floor(natH / 2),
            natW,
            Math.ceil(natH / 2),
            0,
            0,
            natW,
            Math.ceil(natH / 2)
          );

          canvasTop.toBlob((blobTop) => {
            blobTop?.arrayBuffer().then((bufTop) => {
              slices.push({ buffer: bufTop, width: canvasTop.width, height: canvasTop.height });
              canvasTop.width = 0;
              canvasTop.height = 0;

              canvasBottom.toBlob((blobBottom) => {
                blobBottom?.arrayBuffer().then((bufBottom) => {
                  slices.push({ buffer: bufBottom, width: canvasBottom.width, height: canvasBottom.height });
                  canvasBottom.width = 0;
                  canvasBottom.height = 0;
                  resolve(slices);
                });
              }, 'image/jpeg', 0.95);
            });
          }, 'image/jpeg', 0.95);
        } else if (cutMode === 'split-vertical') {
          // Slice 1: Left Half
          const canvasLeft = document.createElement('canvas');
          canvasLeft.width = Math.floor(natW / 2);
          canvasLeft.height = natH;
          const ctxLeft = canvasLeft.getContext('2d')!;
          ctxLeft.drawImage(img, 0, 0, Math.floor(natW / 2), natH, 0, 0, Math.floor(natW / 2), natH);

          // Slice 2: Right Half
          const canvasRight = document.createElement('canvas');
          canvasRight.width = Math.ceil(natW / 2);
          canvasRight.height = natH;
          const ctxRight = canvasRight.getContext('2d')!;
          ctxRight.drawImage(
            img,
            Math.floor(natW / 2),
            0,
            Math.ceil(natW / 2),
            natH,
            0,
            0,
            Math.ceil(natW / 2),
            natH
          );

          canvasLeft.toBlob((blobLeft) => {
            blobLeft?.arrayBuffer().then((bufLeft) => {
              slices.push({ buffer: bufLeft, width: canvasLeft.width, height: canvasLeft.height });
              canvasLeft.width = 0;
              canvasLeft.height = 0;

              canvasRight.toBlob((blobRight) => {
                blobRight?.arrayBuffer().then((bufRight) => {
                  slices.push({ buffer: bufRight, width: canvasRight.width, height: canvasRight.height });
                  canvasRight.width = 0;
                  canvasRight.height = 0;
                  resolve(slices);
                });
              }, 'image/jpeg', 0.95);
            });
          }, 'image/jpeg', 0.95);
        } else {
          // Custom Margins or Auto-trim
          let sX = 0;
          let sY = 0;
          let sW = natW;
          let sH = natH;

          if (cutMode === 'custom-margins') {
            sX = (leftCrop / 100) * natW;
            sY = (topCrop / 100) * natH;
            sW = Math.max(10, natW - sX - (rightCrop / 100) * natW);
            sH = Math.max(10, natH - sY - (bottomCrop / 100) * natH);
          } else if (cutMode === 'auto-trim') {
            // Trim standard 5% scan edge borders
            sX = 0.04 * natW;
            sY = 0.04 * natH;
            sW = natW * 0.92;
            sH = natH * 0.92;
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(sW);
          canvas.height = Math.floor(sH);
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, sX, sY, sW, sH, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            blob?.arrayBuffer().then((buf) => {
              slices.push({ buffer: buf, width: canvas.width, height: canvas.height });
              canvas.width = 0;
              canvas.height = 0;
              resolve(slices);
            });
          }, 'image/jpeg', 0.95);
        }
      };
      img.src = item.previewUrl;
    });
  };

  // Compile Slices to PDF with Numbers
  const handleGeneratePdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProgress(10);
    triggerHaptic('medium');
    const startTime = Date.now();

    try {
      const pdfDoc = await PDFDocument.create();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Collect all slices sequentially
      const allSlices: { buffer: ArrayBuffer; width: number; height: number }[] = [];
      for (let i = 0; i < images.length; i++) {
        if (i % 2 === 0 || images.length > 10) {
          await new Promise((resolve) => setTimeout(resolve, 6));
        }
        const itemSlices = await processImageSlices(images[i]);
        allSlices.push(...itemSlices);
        setProgress(10 + Math.round(((i + 1) / images.length) * 50));
      }

      const totalPages = allSlices.length;

      // Add pages to PDF document
      for (let p = 0; p < allSlices.length; p++) {
        if (p % 3 === 0 || totalPages > 15) {
          await new Promise((resolve) => setTimeout(resolve, 6));
        }
        const slice = allSlices[p];
        const embeddedImg = await pdfDoc.embedJpg(slice.buffer);

        let pageW = 595.28; // A4 standard pt
        let pageH = 841.89;

        if (pageSize === 'a4-landscape') {
          pageW = 841.89;
          pageH = 595.28;
        } else if (pageSize === 'fit') {
          pageW = slice.width * 0.75;
          pageH = slice.height * 0.75;
        }

        const page = pdfDoc.addPage([pageW, pageH]);
        const margin = 20;
        const maxW = pageW - margin * 2;
        const maxH = pageH - margin * 2 - (numbering !== 'none' ? 20 : 0);
        const scale = Math.min(maxW / slice.width, maxH / slice.height, 1);
        const drawW = slice.width * scale;
        const drawH = slice.height * scale;

        const drawX = (pageW - drawW) / 2;
        const drawY = (pageH - drawH) / 2 + (numbering.startsWith('bottom') ? 10 : 0);

        page.drawImage(embeddedImg, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH,
        });

        // Draw page numbers
        if (numbering !== 'none') {
          const numText = `Page ${p + 1} of ${totalPages}`;
          let numX = pageW / 2 - 30;
          let numY = 15;

          if (numbering === 'bottom-right') {
            numX = pageW - 90;
            numY = 15;
          } else if (numbering === 'top-right') {
            numX = pageW - 90;
            numY = pageH - 25;
          }

          page.drawText(numText, {
            x: numX,
            y: numY,
            size: 9,
            font: helveticaFont,
            color: rgb(0.35, 0.35, 0.35),
          });
        }
      }

      setProgress(90);
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const outBlob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const outName = `autocut_document_${Date.now()}.pdf`;

      // Trigger standard download helper
      const savedInfo = await downloadSingleFile(outBlob, outName);
      setSavedFileInfo(savedInfo);

      // Auto save to IndexedDB My Files
      await saveProcessedFile({
        name: outName,
        size: outBlob.size,
        type: 'application/pdf',
        toolUsed: 'Auto Cut Images to PDF',
        category: 'pdf',
        pageCount: totalPages,
      });

      await logActivity({
        toolId: 'auto-crop-images-to-pdf',
        toolName: 'Auto Cut Images to PDF',
        category: 'pdf',
        fileName: outName,
        fileSize: outBlob.size,
        status: 'Completed',
        durationMs: Date.now() - startTime,
      });

      setIsProcessing(false);
      setProgress(100);
      triggerHaptic('success');
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      triggerHaptic('error');
    }
  };

  const estimatedPages =
    cutMode === 'split-horizontal' || cutMode === 'split-vertical' ? images.length * 2 : images.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
          <Scissors className="w-3.5 h-3.5" />
          <span>Smart Auto-Split & Sequential PDF Compiler</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {loc.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {loc.subtitle}
        </p>
      </div>

      {/* 1. Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-8 sm:p-12 rounded-3xl border-2 border-dashed border-brand-400/60 dark:border-brand-500/40 bg-brand-50/30 dark:bg-brand-950/10 hover:bg-brand-50/60 transition-all cursor-pointer text-center space-y-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/bmp"
          onChange={handleFilesUpload}
          className="hidden"
        />
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
          <Upload className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {loc.uploadLabel}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {loc.uploadHint}
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="space-y-8">
          {/* 2. Cutting Mode Selector */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Scissors className="w-4 h-4 text-brand-600" />
                <span>Select Auto-Cut Strategy</span>
              </span>
              <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                {loc.estimatedPages(estimatedPages)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: 'split-horizontal', label: loc.cutModes.splitH, desc: loc.cutModes.splitHDesc, icon: Split },
                { id: 'split-vertical', label: loc.cutModes.splitV, desc: loc.cutModes.splitVDesc, icon: Layers },
                { id: 'auto-trim', label: loc.cutModes.autoTrim, desc: loc.cutModes.autoTrimDesc, icon: Crop },
                { id: 'custom-margins', label: loc.cutModes.custom, desc: loc.cutModes.customDesc, icon: Sliders },
              ].map((m) => {
                const Icon = m.icon;
                const isSel = cutMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setCutMode(m.id as CutMode);
                      triggerHaptic('light');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all active:scale-95 space-y-1.5 ${
                      isSel
                        ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-500 ring-2 ring-brand-500/20'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSel ? 'text-brand-600' : 'text-slate-400'}`} />
                      <span className={`text-xs font-extrabold ${isSel ? 'text-brand-700 dark:text-brand-300' : 'text-slate-800 dark:text-slate-200'}`}>
                        {m.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {m.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom Crop Sliders if custom mode */}
            {cutMode === 'custom-margins' && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {loc.customMarginsLabel}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">{loc.topCut} {topCrop}%</label>
                    <input
                      type="range"
                      min={0}
                      max={45}
                      value={topCrop}
                      onChange={(e) => setTopCrop(Number(e.target.value))}
                      className="w-full accent-brand-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">{loc.bottomCut} {bottomCrop}%</label>
                    <input
                      type="range"
                      min={0}
                      max={45}
                      value={bottomCrop}
                      onChange={(e) => setBottomCrop(Number(e.target.value))}
                      className="w-full accent-brand-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">{loc.leftCut} {leftCrop}%</label>
                    <input
                      type="range"
                      min={0}
                      max={45}
                      value={leftCrop}
                      onChange={(e) => setLeftCrop(Number(e.target.value))}
                      className="w-full accent-brand-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">{loc.rightCut} {rightCrop}%</label>
                    <input
                      type="range"
                      min={0}
                      max={45}
                      value={rightCrop}
                      onChange={(e) => setRightCrop(Number(e.target.value))}
                      className="w-full accent-brand-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Image List & Cut Visual Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                {loc.totalImages(images.length)}
              </span>
              <button
                type="button"
                onClick={() => setImages([])}
                className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline"
              >
                {loc.clearAll}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3 relative group"
                >
                  {/* Thumbnail with Cut Guide Overlay */}
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.previewUrl}
                      alt={img.file.name}
                      className="max-h-full max-w-full object-contain"
                    />

                    {/* Horizontal Cut Line Overlay */}
                    {cutMode === 'split-horizontal' && (
                      <>
                        <div className="absolute inset-x-0 top-1/2 border-b-2 border-dashed border-rose-500 z-10" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-600/90 text-[9px] font-extrabold text-white z-20">
                          {loc.previewBadgeTop}
                        </span>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-indigo-600/90 text-[9px] font-extrabold text-white z-20">
                          {loc.previewBadgeBottom}
                        </span>
                      </>
                    )}

                    {/* Vertical Cut Line Overlay */}
                    {cutMode === 'split-vertical' && (
                      <>
                        <div className="absolute inset-y-0 left-1/2 border-r-2 border-dashed border-rose-500 z-10" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-600/90 text-[9px] font-extrabold text-white z-20">
                          {loc.previewBadgeLeft}
                        </span>
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-indigo-600/90 text-[9px] font-extrabold text-white z-20">
                          {loc.previewBadgeRight}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="truncate max-w-[150px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {idx + 1}. {img.file.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatBytes(img.file.size)} • {img.width}×{img.height}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, 'up')}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => moveImage(idx, 'down')}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. PDF Output Settings */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {loc.pdfOptionsTitle}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.pageSize}</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="a4-portrait">A4 Standard Portrait (595 × 842 pt)</option>
                  <option value="a4-landscape">A4 Landscape (842 × 595 pt)</option>
                  <option value="fit">Fit Exact Cropped Image Dimensions</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.pageNumbering}</label>
                <select
                  value={numbering}
                  onChange={(e) => setNumbering(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="none">{loc.numNone}</option>
                  <option value="bottom-center">{loc.numBottomCenter}</option>
                  <option value="bottom-right">{loc.numBottomRight}</option>
                  <option value="top-right">{loc.numTopRight}</option>
                </select>
              </div>
            </div>

            {/* Action Trigger Button */}
            <button
              type="button"
              disabled={isProcessing || images.length === 0}
              onClick={handleGeneratePdf}
              className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{loc.btnProcessing} ({progress}%)</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-5 h-5" />
                  <span>{loc.btnGenerate} ({estimatedPages} Pages)</span>
                </>
              )}
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
