'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  UploadCloud,
  Download,
  Trash2,
  Check,
  Calendar,
  ShieldCheck,
  Sparkles,
  Layers,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Stamp,
  Type,
  Maximize2,
  Image as ImageIcon,
  Plus,
  Minus,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { getPdfJsLib, base64ToUint8Array } from '@/lib/utils/formatters';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { downloadSingleFile } from '@/lib/utils/download';

const SIGNER_LOCALES = {
  en: {
    badge: 'Live PDF Signature & Stamp Studio',
    title: 'PDF Digital Signer & Annotation Studio',
    sub: 'Draw handwritten signatures, upload signature images, place official approval stamps, date marks, and custom text onto PDF documents with 100% client-side privacy.',
    uploadTitle: 'Upload PDF Document to Sign',
    uploadSub: 'Click or drop PDF here (Unlimited pages)',
    drawSignature: 'Draw Signature',
    typeSignature: 'Type Name',
    uploadSignature: 'Upload Image',
    presetStamps: 'Official Stamps',
    clearPad: 'Clear Signature Pad',
    inkColor: 'Ink Color:',
    inkBlack: 'Black',
    inkBlue: 'Royal Blue',
    inkRed: 'Crimson Red',
    inkGreen: 'Emerald Green',
    placeOnPdf: 'Apply to Page',
    dragNotice: 'Drag signature or stamp to position on page, then click "Download Signed PDF".',
    downloadSigned: 'Download Signed PDF',
    pageOf: (cur: number, total: number) => `Page ${cur} of ${total}`,
    prevPage: 'Previous',
    nextPage: 'Next',
    stampApproved: 'APPROVED',
    stampConfidential: 'CONFIDENTIAL',
    stampVerified: 'VERIFIED',
    stampPaid: 'PAID',
    stampUrgent: 'URGENT',
    stampDraft: 'DRAFT',
    stampDate: 'DATE STAMP',
    customStampPlaceholder: 'Enter custom stamp text...',
    typedSignPlaceholder: 'Type your full name...',
    uploadPrompt: 'Upload signature photo (PNG/JPG)',
  },
  ur: {
    badge: 'لائیو پی ڈی ایف سگنیچر اسٹوڈیو',
    title: 'پی ڈی ایف ڈیجیٹل دستخط و اسٹیمپ اسٹوڈیو',
    sub: 'پی ڈی ایف دستاویزات پر ہاتھ سے ڈیجیٹل دستخط بنائیں، دستخط کی تصویر اپ لوڈ کریں، سرکاری اپروول اسٹیمپ اور نوٹس لگائیں۔ 100% نجی اور محفوظ۔',
    uploadTitle: 'دستخط کرنے کے لیے پی ڈی ایف اپلوڈ کریں',
    uploadSub: 'یہاں کلک کریں یا پی ڈی ایف فائل ڈراپ کریں',
    drawSignature: 'ہاتھ سے بنائیں',
    typeSignature: 'نام ٹائپ کریں',
    uploadSignature: 'تصویر اپلوڈ',
    presetStamps: 'اسٹیمپس',
    clearPad: 'صاف کریں',
    inkColor: 'سیاہی کا رنگ:',
    inkBlack: 'سیاہ',
    inkBlue: 'نیلا',
    inkRed: 'سرخ',
    inkGreen: 'سبز',
    placeOnPdf: 'صفحے پر لگائیں',
    dragNotice: 'دستخط یا اسٹیمپ کو صفحے پر مطلوبہ جگہ پر منتقل کریں اور نیچے "ڈاؤن لوڈ" کا بٹن دبائیں۔',
    downloadSigned: 'دستخط شدہ PDF ڈاؤن لوڈ کریں',
    pageOf: (cur: number, total: number) => `صفحہ ${cur} از ${total}`,
    prevPage: 'پچھلا',
    nextPage: 'اگلا',
    stampApproved: 'منظور شدہ (APPROVED)',
    stampConfidential: 'خفیہ (CONFIDENTIAL)',
    stampVerified: 'تصدیق شدہ (VERIFIED)',
    stampPaid: 'ادا شدہ (PAID)',
    stampUrgent: 'ارجنٹ (URGENT)',
    stampDraft: 'ڈرافٹ (DRAFT)',
    stampDate: 'آج کی تاریخ',
    customStampPlaceholder: 'اپنا اسٹیمپ متن درج کریں...',
    typedSignPlaceholder: 'اپنا پورا نام لکھیں...',
    uploadPrompt: 'دستخط کی تصویر اپلوڈ کریں',
  },
  ar: {
    badge: 'استوديو التوقيع الرقمي لملفات PDF',
    title: 'استوديو التوقيع الرقمي والأختام لمستندات PDF',
    sub: 'رسم التوقيعات اليدوية ورفع صور التوقيع وإضافة أختام الاعتماد الرسمية وعلامات التاريخ على مستندات PDF بخصوصية محلية 100%.',
    uploadTitle: 'رفع مستند PDF للتوقيع',
    uploadSub: 'انقر أو أسقط ملف PDF هنا',
    drawSignature: 'رسم باليد',
    typeSignature: 'كتابة الاسم',
    uploadSignature: 'رفع صورة',
    presetStamps: 'أختام رسمية',
    clearPad: 'مسح اللوحة',
    inkColor: 'لون الحبر:',
    inkBlack: 'أسود',
    inkBlue: 'أزرق ملكي',
    inkRed: 'أحمر',
    inkGreen: 'أخضر',
    placeOnPdf: 'تطبيق على الصفحة',
    dragNotice: 'اسحب التوقيع أو الختم لتحديد موضعه على الصفحة ثم انقر فوق "تحميل PDF الموقع".',
    downloadSigned: 'تحميل PDF الموقع',
    pageOf: (cur: number, total: number) => `صفحة ${cur} من ${total}`,
    prevPage: 'السابق',
    nextPage: 'التالي',
    stampApproved: 'معتمد (APPROVED)',
    stampConfidential: 'سري (CONFIDENTIAL)',
    stampVerified: 'تم التحقق (VERIFIED)',
    stampPaid: 'مدفوع (PAID)',
    stampUrgent: 'عاجل (URGENT)',
    stampDraft: 'مسودة (DRAFT)',
    stampDate: 'تاريخ اليوم',
    customStampPlaceholder: 'نص الختم المخصص...',
    typedSignPlaceholder: 'اكتب اسمك الكامل...',
    uploadPrompt: 'رفع صورة التوقيع (PNG/JPG)',
  },
  hi: {
    badge: 'लाइव पीडीएफ हस्ताक्षर और स्टैम्प स्टूडियो',
    title: 'पीडीएफ डिजिटल हस्ताक्षर और एनोटेशन स्टूडियो',
    sub: 'पीडीएफ दस्तावेजों पर हस्तलिखित हस्ताक्षर बनाएं, आधिकारिक अनुमोदन स्टैम्प और कस्टम टेक्स्ट लगाएं। 100% निजी और सुरक्षित।',
    uploadTitle: 'हस्ताक्षर करने के लिए पीडीएफ अपलोड करें',
    uploadSub: 'यहाँ क्लिक करें या पीडीएफ फाइल ड्रॉप करें',
    drawSignature: 'हाथ से बनाएं',
    typeSignature: 'नाम टाइप करें',
    uploadSignature: 'फोटो अपलोड',
    presetStamps: 'आधिकारिक स्टैम्प',
    clearPad: 'साफ करें',
    inkColor: 'स्याही का रंग:',
    inkBlack: 'काला',
    inkBlue: 'शाही नीला',
    inkRed: 'लाल',
    inkGreen: 'हरा',
    placeOnPdf: 'पेज पर लगाएं',
    dragNotice: 'हस्ताक्षर या स्टैम्प को सही जगह पर खींचें और "हस्ताक्षरित पीडीएफ डाउनलोड करें" पर क्लिक करें।',
    downloadSigned: 'हस्ताक्षरित PDF डाउनलोड करें',
    pageOf: (cur: number, total: number) => `पेज ${cur} / ${total}`,
    prevPage: 'पिछला',
    nextPage: 'अगला',
    stampApproved: 'स्वीकृत (APPROVED)',
    stampConfidential: 'गोपनीय (CONFIDENTIAL)',
    stampVerified: 'सत्यापित (VERIFIED)',
    stampPaid: 'भुगतान किया (PAID)',
    stampUrgent: 'अति आवश्यक (URGENT)',
    stampDraft: 'प्रारूप (DRAFT)',
    stampDate: 'तारीख स्टैम्प',
    customStampPlaceholder: 'कस्टम स्टैम्प टेक्स्ट लिखें...',
    typedSignPlaceholder: 'अपना पूरा नाम लिखें...',
    uploadPrompt: 'हस्ताक्षर फोटो अपलोड करें',
  },
};

interface PlacedElement {
  id: string;
  page: number;
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function PdfSignatureStudio() {
  const { language, isRTL } = useI18n();
  const loc = SIGNER_LOCALES[language as keyof typeof SIGNER_LOCALES] || SIGNER_LOCALES.en;

  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fileName, setFileName] = useState<string>('document.pdf');
  const [signMode, setSignMode] = useState<'draw' | 'type' | 'stamp' | 'upload'>('draw');
  const [inkColor, setInkColor] = useState<string>('#0f172a');
  const [typedText, setTypedText] = useState<string>('');
  const [customStampText, setCustomStampText] = useState<string>('APPROVED');
  const [stampColor, setStampColor] = useState<string>('#16a34a');
  const [placedElements, setPlacedElements] = useState<PlacedElement[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Drawing Pad Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Drawing Pad
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [inkColor, signMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : 'clientX' in e ? e.clientX : 0;
    const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : 'clientY' in e ? e.clientY : 0;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : 'clientX' in e ? e.clientX : 0;
    const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : 'clientY' in e ? e.clientY : 0;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearDrawingPad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Handle PDF Upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    triggerHaptic('selection');
    const file = e.target.files[0];
    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    setPdfBuffer(buffer);

    const pdfjsLib = await getPdfJsLib();
    if (!pdfjsLib) return;
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const doc = await loadingTask.promise;
    setPdfDocProxy(doc);
    setNumPages(doc.numPages);
    setCurrentPage(1);
    setPlacedElements([]);
  };

  // Render Current PDF Page onto Preview Canvas
  useEffect(() => {
    if (!pdfDocProxy || !pdfCanvasRef.current) return;

    let isMounted = true;
    (async () => {
      try {
        const page = await pdfDocProxy.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.3 });
        const canvas = pdfCanvasRef.current;
        if (!canvas || !isMounted) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (_) {}
    })();

    return () => {
      isMounted = false;
    };
  }, [pdfDocProxy, currentPage]);

  // Generate Stamp Image
  const generateStampImage = (text: string, color: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.strokeRect(6, 6, 268, 68);

    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 140, 40);

    return canvas.toDataURL('image/png');
  };

  // Generate Typed Signature Image
  const generateTypedSignatureImage = (name: string, color: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.font = 'italic bold 34px Georgia, cursive, serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name || 'Signature', 160, 50);

    return canvas.toDataURL('image/png');
  };

  // Apply Current Signature/Stamp onto the PDF Page
  const applySignatureToCurrentPage = () => {
    let dataUrl = '';

    if (signMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      dataUrl = canvas.toDataURL('image/png');
    } else if (signMode === 'type') {
      dataUrl = generateTypedSignatureImage(typedText, inkColor);
    }

    if (!dataUrl) return;
    triggerHaptic('success');

    const newElem: PlacedElement = {
      id: 'elem_' + Date.now(),
      page: currentPage,
      dataUrl,
      x: 80,
      y: 120,
      width: 170,
      height: 60,
    };

    setPlacedElements((prev) => [...prev, newElem]);
  };

  const applyStamp = (text: string, color: string) => {
    triggerHaptic('selection');
    const dataUrl = generateStampImage(text, color);
    const newElem: PlacedElement = {
      id: 'elem_' + Date.now(),
      page: currentPage,
      dataUrl,
      x: 100,
      y: 100,
      width: 160,
      height: 50,
    };
    setPlacedElements((prev) => [...prev, newElem]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          const newElem: PlacedElement = {
            id: 'elem_' + Date.now(),
            page: currentPage,
            dataUrl,
            x: 90,
            y: 110,
            width: 160,
            height: 60,
          };
          setPlacedElements((prev) => [...prev, newElem]);
          triggerHaptic('success');
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Touch & Mouse Drag Handler
  const startDrag = (el: PlacedElement, startClientX: number, startClientY: number) => {
    const startX = startClientX - el.x;
    const startY = startClientY - el.y;

    const moveAt = (clientX: number, clientY: number) => {
      const newX = Math.max(0, clientX - startX);
      const newY = Math.max(0, clientY - startY);
      setPlacedElements((prev) =>
        prev.map((item) => (item.id === el.id ? { ...item, x: newX, y: newY } : item))
      );
    };

    const handleMouseMove = (e: MouseEvent) => moveAt(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        moveAt(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
  };

  const resizeElement = (id: string, delta: number) => {
    setPlacedElements((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newWidth = Math.max(60, item.width + delta);
          const newHeight = Math.max(25, item.height + Math.round((delta * item.height) / item.width));
          return { ...item, width: newWidth, height: newHeight };
        }
        return item;
      })
    );
  };

  // Save & Download Signed PDF
  const downloadSignedPdf = async () => {
    if (!pdfBuffer) return;
    setIsDownloading(true);
    triggerHaptic('medium');

    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

      for (const elem of placedElements) {
        const pageIdx = elem.page - 1;
        if (pageIdx < 0 || pageIdx >= pdfDoc.getPageCount()) continue;

        const targetPage = pdfDoc.getPage(pageIdx);
        const { width: pageWidth, height: pageHeight } = targetPage.getSize();

        const imgBytes = base64ToUint8Array(elem.dataUrl);
        const embeddedPng =
          elem.dataUrl.startsWith('data:image/jpeg') || elem.dataUrl.startsWith('data:image/jpg')
            ? await pdfDoc.embedJpg(imgBytes)
            : await pdfDoc.embedPng(imgBytes);

        const previewCanvas = pdfCanvasRef.current;
        const scaleX = pageWidth / (previewCanvas?.width || pageWidth);
        const scaleY = pageHeight / (previewCanvas?.height || pageHeight);

        const pdfX = elem.x * scaleX;
        const pdfY = pageHeight - (elem.y + elem.height) * scaleY;

        targetPage.drawImage(embeddedPng, {
          x: pdfX,
          y: Math.max(0, pdfY),
          width: elem.width * scaleX,
          height: elem.height * scaleY,
        });
      }

      const signedBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([signedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      await downloadSingleFile(blob, `Signed_${fileName}`);
    } catch (err: any) {
      console.error('Signature error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Upload Zone if no PDF loaded */}
      {!pdfBuffer ? (
        <div className="border-2 border-dashed border-brand-500/40 hover:border-brand-500 rounded-3xl p-10 text-center bg-brand-50/20 dark:bg-brand-950/10 cursor-pointer group transition-all">
          <label className="cursor-pointer space-y-3 block">
            <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {loc.uploadTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{loc.uploadSub}</p>
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top PDF Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              </button>
              <span className="text-xs font-bold px-2 text-slate-800 dark:text-slate-200 font-mono">
                {loc.pageOf(currentPage, numPages)}
              </span>
              <button
                type="button"
                disabled={currentPage >= numPages}
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>

            <button
              type="button"
              disabled={isDownloading}
              onClick={downloadSignedPdf}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 text-white shadow-md hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Saving PDF...' : loc.downloadSigned}</span>
            </button>
          </div>

          {/* Main Layout: Sign Creator + PDF Live Page */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Signature Creation Controls */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              {/* Mode Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                {[
                  { id: 'draw', label: loc.drawSignature, icon: PenTool },
                  { id: 'type', label: loc.typeSignature, icon: Type },
                  { id: 'stamp', label: loc.presetStamps, icon: Stamp },
                  { id: 'upload', label: loc.uploadSignature, icon: ImageIcon },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setSignMode(m.id as any);
                    }}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      signMode === m.id
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <m.icon className="w-3.5 h-3.5" />
                    <span className="truncate">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Ink Color Selector */}
              {signMode !== 'stamp' && signMode !== 'upload' && (
                <div className="flex items-center justify-between gap-2 text-xs pt-1">
                  <span className="font-bold text-slate-500">{loc.inkColor}</span>
                  <div className="flex items-center gap-2">
                    {[
                      { id: '#0f172a', name: loc.inkBlack },
                      { id: '#1d4ed8', name: loc.inkBlue },
                      { id: '#b91c1c', name: loc.inkRed },
                      { id: '#16a34a', name: loc.inkGreen },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setInkColor(c.id)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          inkColor === c.id ? 'scale-125 border-brand-500 shadow-sm' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.id }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Mode 1: Handwritten Draw Canvas */}
              {signMode === 'draw' && (
                <div className="space-y-3">
                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <canvas
                      ref={canvasRef}
                      width={320}
                      height={130}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-32 cursor-crosshair touch-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={clearDrawingPad}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{loc.clearPad}</span>
                    </button>
                    <button
                      type="button"
                      onClick={applySignatureToCurrentPage}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{loc.placeOnPdf}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Mode 2: Typed Cursive Signature */}
              {signMode === 'type' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    placeholder={loc.typedSignPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl text-base border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-serif italic text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={applySignatureToCurrentPage}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{loc.placeOnPdf}</span>
                  </button>
                </div>
              )}

              {/* Mode 3: Official Stamps */}
              {signMode === 'stamp' && (
                <div className="space-y-3">
                  {/* Custom Stamp Input */}
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={customStampText}
                      onChange={(e) => setCustomStampText(e.target.value)}
                      placeholder={loc.customStampPlaceholder}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 uppercase"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {['#16a34a', '#dc2626', '#2563eb', '#d97706', '#7c3aed', '#000000'].map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setStampColor(col)}
                            className={`w-5 h-5 rounded-full border-2 ${
                              stampColor === col ? 'scale-125 border-brand-500' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => applyStamp(customStampText || 'APPROVED', stampColor)}
                        className="px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-lg shadow-xs"
                      >
                        Apply Stamp
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => applyStamp('APPROVED', '#16a34a')}
                      className="p-2.5 rounded-xl text-xs font-black border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      {loc.stampApproved}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyStamp('CONFIDENTIAL', '#dc2626')}
                      className="p-2.5 rounded-xl text-xs font-black border-2 border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      {loc.stampConfidential}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyStamp('VERIFIED', '#2563eb')}
                      className="p-2.5 rounded-xl text-xs font-black border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    >
                      {loc.stampVerified}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyStamp('PAID', '#16a34a')}
                      className="p-2.5 rounded-xl text-xs font-black border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      {loc.stampPaid}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyStamp('URGENT', '#ea580c')}
                      className="p-2.5 rounded-xl text-xs font-black border-2 border-amber-500 text-amber-600 hover:bg-amber-50"
                    >
                      {loc.stampUrgent}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyStamp(new Date().toLocaleDateString(), '#475569')}
                      className="p-2.5 rounded-xl text-xs font-black border-2 border-slate-500 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                    >
                      📅 {new Date().toLocaleDateString()}
                    </button>
                  </div>
                </div>
              )}

              {/* Mode 4: Upload Signature Image */}
              {signMode === 'upload' && (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 dark:bg-slate-950/50"
                  >
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.uploadPrompt}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Transparent PNG recommended</p>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                {loc.dragNotice}
              </p>
            </div>

            {/* Live PDF Interactive Surface */}
            <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-4 flex justify-center items-start overflow-auto min-h-[500px] shadow-inner">
              <div ref={pdfContainerRef} className="relative shadow-2xl rounded-lg overflow-hidden bg-white select-none">
                <canvas ref={pdfCanvasRef} className="block max-w-full h-auto" />

                {/* Stamped Elements Overlay */}
                {placedElements
                  .filter((el) => el.page === currentPage)
                  .map((el) => (
                    <div
                      key={el.id}
                      style={{
                        position: 'absolute',
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width}px`,
                        height: `${el.height}px`,
                        cursor: 'move',
                      }}
                      className="group border-2 border-dashed border-brand-500 hover:border-brand-600 rounded p-1 bg-white/40 backdrop-blur-xs touch-none"
                      onMouseDown={(e) => startDrag(el, e.clientX, e.clientY)}
                      onTouchStart={(e) => {
                        if (e.touches.length > 0) {
                          startDrag(el, e.touches[0].clientX, e.touches[0].clientY);
                        }
                      }}
                    >
                      <img src={el.dataUrl} alt="Signature" className="w-full h-full object-contain pointer-events-none" />

                      {/* Resize & Delete Floating Controls */}
                      <div className="absolute -top-3.5 -right-3.5 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            resizeElement(el.id, -15);
                          }}
                          className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs shadow-md"
                          title="Shrink"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            resizeElement(el.id, 15);
                          }}
                          className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs shadow-md"
                          title="Enlarge"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlacedElements((prev) => prev.filter((item) => item.id !== el.id));
                          }}
                          className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs shadow-md"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
