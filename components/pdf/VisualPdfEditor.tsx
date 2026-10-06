'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Type,
  PenTool,
  Highlighter,
  Square,
  Download,
  RotateCw,
  Undo2,
  Redo2,
  Trash2,
  FileUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PenLine,
  Stamp,
  Layers,
  Eraser,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  Share2,
  ArrowRight,
  HelpCircle,
  Eye,
  Plus,
} from 'lucide-react';
import { downloadSingleFile, shareDownloadedFile } from '@/lib/utils/download';
import { PDFDocument } from 'pdf-lib';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { getPdfJsLib, base64ToUint8Array, formatBytes } from '@/lib/utils/formatters';

const PDF_EDITOR_LOCALES = {
  en: {
    badge: 'Visual PDF Annotator & Editor Studio',
    title: 'Visual PDF Editor & Markup Studio',
    sub: 'Easily add text, draw freehand, highlight notes, place official stamps, and whiteout sensitive content on any PDF.',
    wordTipTitle: 'Need to change or rewrite existing text inside the PDF?',
    wordTipDesc: 'Standard PDF files lock original text. To edit paragraphs like a Word document, use our 1-click PDF to Word Converter.',
    wordBtn: 'Convert to Word DOCX',
    uploadCardTitle: 'Select or Drop a PDF File to Start',
    uploadCardSub: 'Upload any PDF document (contracts, forms, receipts, or ebooks). Processing is 100% private and offline.',
    choosePdf: 'Choose PDF File',
    changePdf: 'Change File',
    savingPdf: 'Generating PDF...',
    exportPdf: 'Download Edited PDF',
    sharePdf: 'Share PDF',
    activeToolLabel: 'Active Tool:',
    tabs: {
      text: 'Add Text',
      draw: 'Draw / Pen',
      highlight: 'Highlighter',
      stamp: 'Official Stamp',
      whiteout: 'Whiteout / Redact',
      signature: 'Signature',
      image: 'Insert Image',
    },
    textPlaceholder: 'Type text to place on PDF...',
    textSizeLabel: 'Size:',
    textColorLabel: 'Color:',
    brushLabel: 'Thickness:',
    stamps: {
      approved: 'APPROVED',
      paid: 'PAID',
      confidential: 'CONFIDENTIAL',
      verified: 'VERIFIED',
      urgent: 'URGENT',
      date: 'DATE STAMP',
    },
    signaturePrompt: 'Draw your signature below:',
    clearSig: 'Clear Pad',
    itemsOnPage: 'Items on This Page',
    noItems: 'No items added on this page yet. Select a tool and tap on the document.',
    tapToPlaceNotice: 'Tap anywhere on the PDF page to place your selected item.',
    pageOf: (curr: number, total: number) => `Page ${curr} of ${total}`,
    deleteItem: 'Delete',
    undo: 'Undo',
    redo: 'Redo',
    clearAllPage: 'Clear Page Markup',
  },
  ur: {
    badge: 'بصری پی ڈی ایف ایڈیٹر و مارک اپ اسٹوڈیو',
    title: 'پی ڈی ایف ایڈیٹر اور اینوٹیشن اسٹوڈیو',
    sub: 'پی ڈی ایف پر آسانی سے نیا متن لکھیں، قلم سے نشان لگائیں، ہائی لائٹ کریں، سرکاری مہریں لگائیں اور پرانا متن وائٹ آؤٹ (مٹائیں) کریں۔',
    wordTipTitle: 'کیا آپ پی ڈی ایف کے اندر موجود پرانی تحریر تبدیل کرنا چاہتے ہیں؟',
    wordTipDesc: 'پی ڈی ایف کی اصل تحریر لاک ہوتی ہے۔ اسے ورڈ فائل کی طرح ایڈٹ کرنے کے لیے ہمارے "PDF to Word" کنورٹر کا استعمال کریں۔',
    wordBtn: 'Word DOCX میں تبدیل کریں',
    uploadCardTitle: 'شروع کرنے کے لیے پی ڈی ایف فائل منتخب کریں',
    uploadCardSub: 'کسی بھی پی ڈی ایف فائل کو اپلوڈ کریں۔ تمام پروسیسنگ 100% محفوظ، پرائیویٹ اور آف لائن ہوتی ہے۔',
    choosePdf: 'پی ڈی ایف منتخب کریں',
    changePdf: 'فائل تبدیل کریں',
    savingPdf: 'پی ڈی ایف تیار ہو رہی ہے...',
    exportPdf: 'ایڈٹ شدہ PDF ڈاؤن لوڈ کریں',
    sharePdf: 'پی ڈی ایف شیئر کریں',
    activeToolLabel: 'موجودہ ٹول:',
    tabs: {
      text: 'متن لکھیں',
      draw: 'قلم / ڈرائنگ',
      highlight: 'ہائی لائٹر',
      stamp: 'سرکاری مہر',
      whiteout: 'وائٹ آؤٹ (مٹائیں)',
      signature: 'دستخط',
      image: 'تصویر لگائیں',
    },
    textPlaceholder: 'پی ڈی ایف پر لکھنے کے لیے متن ٹائپ کریں...',
    textSizeLabel: 'سائز:',
    textColorLabel: 'رنگ:',
    brushLabel: 'موٹائی:',
    stamps: {
      approved: 'منظور شدہ (APPROVED)',
      paid: 'ادا شدہ (PAID)',
      confidential: 'خفیہ (CONFIDENTIAL)',
      verified: 'تصدیق شدہ (VERIFIED)',
      urgent: 'ارجنٹ (URGENT)',
      date: 'آج کی تاریخ',
    },
    signaturePrompt: 'نیچے باکس میں انگلی سے دستخط بنائیں:',
    clearSig: 'صاف کریں',
    itemsOnPage: 'اس صفحے پر شامل کی گئی چیزیں',
    noItems: 'اس صفحے پر ابھی کوئی چیز شامل نہیں کی گئی۔ اوپر سے ٹول منتخب کر کے پی ڈی ایف پر کلک کریں۔',
    tapToPlaceNotice: 'ٹول منتخب کرنے کے بعد پی ڈی ایف پر مطلوبہ جگہ کلک کریں تاکہ وہ وہاں شامل ہو جائے۔',
    pageOf: (curr: number, total: number) => `صفحہ ${curr} از ${total}`,
    deleteItem: 'حذف کریں',
    undo: 'واپس (Undo)',
    redo: 'دوبارہ (Redo)',
    clearAllPage: 'تمام نشانات مٹائیں',
  },
  ar: {
    badge: 'استوديو تعديل وملاحظات PDF المرئي',
    title: 'محرر مستندات PDF التفاعلي',
    sub: 'أضف نصوصاً ورسومات باليد وتظليلاً وأختاماً رسمية وتغطية للنصوص الحساسة بسهولة على أي ملف PDF.',
    wordTipTitle: 'هل تريد تعديل أو إعادة كتابة النصوص الأصلية في PDF؟',
    wordTipDesc: 'النصوص الأصلية في PDF تكون مقفلة. لتعديلها بحرية مثل ملف Word، استخدم محول PDF إلى Word.',
    wordBtn: 'تحويل إلى Word DOCX',
    uploadCardTitle: 'اختر أو اسحب ملف PDF للبدء',
    uploadCardSub: 'ارفع أي مستند PDF للمعاينة والتعديل. تتم جميع العمليات بخصوصية محلية وأمان 100%.',
    choosePdf: 'اختيار ملف PDF',
    changePdf: 'تغيير الملف',
    savingPdf: 'جاري إنشاء PDF...',
    exportPdf: 'تحميل PDF المعدل',
    sharePdf: 'مشاركة PDF',
    activeToolLabel: 'الأداة الحالية:',
    tabs: {
      text: 'إضافة نص',
      draw: 'رسم / قلم',
      highlight: 'تظليل',
      stamp: 'أختام رسمية',
      whiteout: 'تغطية بيضاء (طمس)',
      signature: 'توقيع',
      image: 'إدراج صورة',
    },
    textPlaceholder: 'اكتب النص لإضافته على PDF...',
    textSizeLabel: 'الحجم:',
    textColorLabel: 'اللون:',
    brushLabel: 'السماكة:',
    stamps: {
      approved: 'معتمد (APPROVED)',
      paid: 'مدفوع (PAID)',
      confidential: 'سري (CONFIDENTIAL)',
      verified: 'موثق (VERIFIED)',
      urgent: 'عاجل (URGENT)',
      date: 'ختم التاريخ',
    },
    signaturePrompt: 'ارسم توقيعك في المربع أدناه:',
    clearSig: 'مسح',
    itemsOnPage: 'العناصر المضافة على هذه الصفحة',
    noItems: 'لم يتم إضافة عناصر على هذه الصفحة بعد. اختر أداة وانقر فوق المستند.',
    tapToPlaceNotice: 'انقر في أي مكان على صفحة PDF لوضع العنصر المحدد.',
    pageOf: (curr: number, total: number) => `صفحة ${curr} من ${total}`,
    deleteItem: 'حذف',
    undo: 'تراجع',
    redo: 'إعادة',
    clearAllPage: 'مسح الصفحة',
  },
  hi: {
    badge: 'विज़ुअल PDF एनोटेटर व एडिटर स्टूडियो',
    title: 'विज़ुअल PDF एडिटर व मार्कअप स्टूडियो',
    sub: 'PDF पर आसानी से नया टेक्स्ट लिखें, पेन से ड्रा करें, हाइलाइट करें, आधिकारिक स्टैम्प लगाएं और पुराना टेक्स्ट छिपाएं।',
    wordTipTitle: 'क्या आप PDF के पुराने टेक्स्ट को बदलना या एडिट करना चाहते हैं?',
    wordTipDesc: 'PDF का ओरिजिनल टेक्स्ट लॉक होता है। इसे Word की तरह एडिट करने के लिए हमारे "PDF to Word" कन्वर्टर का उपयोग करें।',
    wordBtn: 'Word DOCX में बदलें',
    uploadCardTitle: 'शुरू करने के लिए PDF फ़ाइल चुनें',
    uploadCardSub: 'किसी भी PDF फ़ाइल को अपलोड करें। सारी प्रोसेसिंग 100% निजी और सुरक्षित रूप से होती है।',
    choosePdf: 'PDF फ़ाइल चुनें',
    changePdf: 'फ़ाइल बदलें',
    savingPdf: 'PDF तैयार हो रही है...',
    exportPdf: 'एडिट की गई PDF डाउनलोड करें',
    sharePdf: 'PDF शेयर करें',
    activeToolLabel: 'सक्रिय टूल:',
    tabs: {
      text: 'टेक्स्ट जोड़ें',
      draw: 'पेन / ड्रॉ',
      highlight: 'हाइलाइटर',
      stamp: 'आधिकारिक स्टैम्प',
      whiteout: 'व्हाइटआउट (मिटाएं)',
      signature: 'हस्ताक्षर',
      image: 'इमेज जोड़ें',
    },
    textPlaceholder: 'PDF पर जोड़ने के लिए टेक्स्ट लिखें...',
    textSizeLabel: 'साइज:',
    textColorLabel: 'रंग:',
    brushLabel: 'मोटाई:',
    stamps: {
      approved: 'स्वीकृत (APPROVED)',
      paid: 'भुगतान (PAID)',
      confidential: 'गोपनीय (CONFIDENTIAL)',
      verified: 'सत्यापित (VERIFIED)',
      urgent: 'अति आवश्यक (URGENT)',
      date: 'आज की तारीख',
    },
    signaturePrompt: 'नीचे दिए गए बॉक्स में हस्ताक्षर बनाएं:',
    clearSig: 'साफ़ करें',
    itemsOnPage: 'इस पेज पर जोड़े गए तत्व',
    noItems: 'इस पेज पर अभी कुछ नहीं जोड़ा गया है। ऊपर टूल चुनकर PDF पर टैप करें।',
    tapToPlaceNotice: 'टूल चुनने के बाद PDF पर मनचाही जगह टैप करें।',
    pageOf: (curr: number, total: number) => `पेज ${curr} / ${total}`,
    deleteItem: 'हटाएं',
    undo: 'पूर्ववत (Undo)',
    redo: 'फिर से करें (Redo)',
    clearAllPage: 'सब हटाएं',
  },
};

type EditorToolType = 'text' | 'draw' | 'highlight' | 'stamp' | 'whiteout' | 'signature' | 'image';

interface AnnotationItem {
  id: string;
  type: EditorToolType;
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color?: string;
  size?: number;
  points?: { x: number; y: number }[];
  imageDataUrl?: string;
}

export function VisualPdfEditor() {
  const { language, isRTL } = useI18n();
  const loc = PDF_EDITOR_LOCALES[language] || PDF_EDITOR_LOCALES.en;

  // File States
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Active Tool & Controls
  const [activeTool, setActiveTool] = useState<EditorToolType>('text');
  const [selectedColor, setSelectedColor] = useState<string>('#026fc7');
  const [textSize, setTextSize] = useState<number>(18);
  const [brushSize, setBrushSize] = useState<number>(3);
  const [textInput, setTextInput] = useState<string>('Important Note');
  const [selectedStamp, setSelectedStamp] = useState<string>('APPROVED');

  // Signature Pad State
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigDrawing, setIsSigDrawing] = useState<boolean>(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  // Annotations & Multi-level Undo / Redo
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [undoStack, setUndoStack] = useState<AnnotationItem[][]>([]);
  const [redoStack, setRedoStack] = useState<AnnotationItem[][]>([]);

  // Canvas Drawing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const pageImageCache = useRef<Map<number, HTMLImageElement>>(new Map());

  // Signature Pad Handlers
  const startSigDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsSigDrawing(true);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const moveSigDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isSigDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endSigDraw = () => {
    if (!isSigDrawing) return;
    setIsSigDrawing(false);
    const canvas = sigCanvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearSigPad = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureDataUrl(null);
    }
  };

  // 1. PDF Loading & Rendering
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
      setIsLoadingPdf(true);
      triggerHaptic('selection');

      try {
        const buffer = await file.arrayBuffer();
        setPdfBytes(buffer);

        const pdfjsLib = await getPdfJsLib();
        if (!pdfjsLib) throw new Error('PDF library unavailable');

        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        pageImageCache.current.clear();
        setAnnotations([]);
        setUndoStack([]);
        setRedoStack([]);

        await renderPdfPageImage(pdf, 1);
      } catch (err) {
        console.error('PDF load error:', err);
      } finally {
        setIsLoadingPdf(false);
      }
    }
  };

  const renderPdfPageImage = async (pdfDoc: any, pageNum: number) => {
    if (pageImageCache.current.has(pageNum)) {
      redrawCanvas();
      return;
    }

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const offCanvas = document.createElement('canvas');
      offCanvas.width = viewport.width;
      offCanvas.height = viewport.height;
      const offCtx = offCanvas.getContext('2d');

      if (offCtx) {
        await page.render({ canvasContext: offCtx, viewport }).promise;
        const dataUrl = offCanvas.toDataURL('image/jpeg', 0.9);
        offCanvas.width = 0;
        offCanvas.height = 0;

        const img = new Image();
        img.onload = () => {
          pageImageCache.current.set(pageNum, img);
          redrawCanvas();
        };
        img.src = dataUrl;
      }
    } catch (err) {
      console.error('Page render error:', err);
    }
  };

  // Change active page and render
  const changePage = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    triggerHaptic('light');

    if (!pageImageCache.current.has(newPage) && pdfBytes) {
      const pdfjsLib = await getPdfJsLib();
      if (pdfjsLib) {
        const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        await renderPdfPageImage(pdf, newPage);
      }
    }
  };

  // 2. Redraw Canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw PDF page background
    const pageImg = pageImageCache.current.get(currentPage);
    if (pageImg) {
      ctx.drawImage(pageImg, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

    // Render annotations on this page
    const pageAnnotations = annotations.filter((a) => a.page === currentPage);
    pageAnnotations.forEach((item) => {
      ctx.save();

      if (item.type === 'draw' && item.points && item.points.length > 1) {
        ctx.strokeStyle = item.color || '#000000';
        ctx.lineWidth = item.size || 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
          ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        ctx.stroke();
      } else if (item.type === 'highlight' && item.points && item.points.length > 1) {
        ctx.strokeStyle = item.color || '#fef08a';
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = (item.size || 3) * 5;
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
          ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        ctx.stroke();
      } else if (item.type === 'text') {
        ctx.fillStyle = item.color || '#000000';
        ctx.font = `bold ${item.size || 18}px sans-serif`;
        ctx.fillText(item.text || '', item.x, item.y);
      } else if (item.type === 'whiteout') {
        // Redaction Whiteout Box
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.fillRect(item.x, item.y - (item.height || 24), item.width || 120, item.height || 24);
        ctx.strokeRect(item.x, item.y - (item.height || 24), item.width || 120, item.height || 24);
      } else if (item.type === 'stamp') {
        // Official Badge Stamp
        const stampText = item.text || 'APPROVED';
        ctx.strokeStyle = item.color || '#16a34a';
        ctx.fillStyle = item.color || '#16a34a';
        ctx.lineWidth = 3;
        ctx.font = 'bold 16px sans-serif';
        const metrics = ctx.measureText(stampText);
        const w = metrics.width + 24;
        const h = 32;

        ctx.strokeRect(item.x, item.y - 22, w, h);
        ctx.fillText(stampText, item.x + 12, item.y);
      } else if (item.type === 'signature' && item.imageDataUrl) {
        const sigImg = new Image();
        sigImg.src = item.imageDataUrl;
        if (sigImg.complete) {
          ctx.drawImage(sigImg, item.x - 60, item.y - 30, 120, 60);
        } else {
          sigImg.onload = () => {
            ctx.drawImage(sigImg, item.x - 60, item.y - 30, 120, 60);
          };
        }
      }

      ctx.restore();
    });

    // Render live active path during drawing
    if (isDrawing && currentPath.length > 1) {
      ctx.save();
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = activeTool === 'highlight' ? brushSize * 5 : brushSize;
      ctx.globalAlpha = activeTool === 'highlight' ? 0.45 : 1.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [currentPage, annotations, isDrawing, currentPath, selectedColor, activeTool, brushSize]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Coordinates helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : 'clientX' in e ? e.clientX : 0;
    const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : 'clientY' in e ? e.clientY : 0;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  // Pointer Handlers on Document Canvas
  const handleCanvasPointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    if (x === 0 && y === 0) return;

    setUndoStack((prev) => [...prev, [...annotations]]);
    setRedoStack([]);

    if (activeTool === 'text') {
      const newAnn: AnnotationItem = {
        id: 'ann_' + Date.now(),
        type: 'text',
        page: currentPage,
        x,
        y,
        text: textInput || 'Text',
        color: selectedColor,
        size: textSize,
      };
      setAnnotations((prev) => [...prev, newAnn]);
      triggerHaptic('light');
    } else if (activeTool === 'whiteout') {
      const newAnn: AnnotationItem = {
        id: 'ann_' + Date.now(),
        type: 'whiteout',
        page: currentPage,
        x,
        y,
        width: 140,
        height: 28,
      };
      setAnnotations((prev) => [...prev, newAnn]);
      triggerHaptic('light');
    } else if (activeTool === 'stamp') {
      const today = new Date().toISOString().split('T')[0];
      const stampText = selectedStamp === 'DATE' ? `DATE: ${today}` : selectedStamp;
      const newAnn: AnnotationItem = {
        id: 'ann_' + Date.now(),
        type: 'stamp',
        page: currentPage,
        x,
        y,
        text: stampText,
        color: selectedColor,
      };
      setAnnotations((prev) => [...prev, newAnn]);
      triggerHaptic('success');
    } else if (activeTool === 'signature') {
      if (signatureDataUrl) {
        const newAnn: AnnotationItem = {
          id: 'ann_' + Date.now(),
          type: 'signature',
          page: currentPage,
          x,
          y,
          imageDataUrl: signatureDataUrl,
        };
        setAnnotations((prev) => [...prev, newAnn]);
        triggerHaptic('success');
      }
    } else if (activeTool === 'draw' || activeTool === 'highlight') {
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
    }
  };

  const handleCanvasPointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoords(e);
    setCurrentPath((prev) => [...prev, { x, y }]);
  };

  const handleCanvasPointerUp = () => {
    if (isDrawing && currentPath.length > 1) {
      const newAnn: AnnotationItem = {
        id: 'ann_' + Date.now(),
        type: activeTool,
        page: currentPage,
        x: currentPath[0].x,
        y: currentPath[0].y,
        points: currentPath,
        color: selectedColor,
        size: brushSize,
      };
      setAnnotations((prev) => [...prev, newAnn]);
      triggerHaptic('light');
    }
    setIsDrawing(false);
    setCurrentPath([]);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, [...annotations]]);
    setAnnotations(previous);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    triggerHaptic('light');
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, [...annotations]]);
    setAnnotations(next);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    triggerHaptic('light');
  };

  const deleteAnnotation = (id: string) => {
    setUndoStack((prev) => [...prev, [...annotations]]);
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    triggerHaptic('light');
  };

  const clearCurrentPageMarkup = () => {
    setUndoStack((prev) => [...prev, [...annotations]]);
    setAnnotations((prev) => prev.filter((a) => a.page !== currentPage));
    triggerHaptic('light');
  };

  // Export Modified PDF
  const handleExportPdf = async () => {
    if (!pdfBytes) return;
    setIsExporting(true);
    triggerHaptic('medium');

    try {
      const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const pages = doc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const pageNum = i + 1;
        const pageAnnotations = annotations.filter((a) => a.page === pageNum);
        if (pageAnnotations.length === 0) continue;

        const page = pages[i];
        const { width: pageWidth, height: pageHeight } = page.getSize();

        const overlayCanvas = document.createElement('canvas');
        overlayCanvas.width = 1200;
        overlayCanvas.height = Math.round(1200 * (pageHeight / pageWidth));
        const ctx = overlayCanvas.getContext('2d');
        if (!ctx) continue;

        const scaleX = overlayCanvas.width / 600;
        const scaleY = overlayCanvas.height / 800;

        pageAnnotations.forEach((item) => {
          ctx.save();
          if ((item.type === 'draw' || item.type === 'highlight') && item.points && item.points.length > 1) {
            ctx.strokeStyle = item.color || (item.type === 'highlight' ? '#fef08a' : '#000000');
            ctx.lineWidth = (item.type === 'highlight' ? (item.size || 3) * 5 : (item.size || 3)) * scaleX;
            ctx.globalAlpha = item.type === 'highlight' ? 0.45 : 1.0;
            ctx.lineCap = item.type === 'highlight' ? 'square' : 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(item.points[0].x * scaleX, item.points[0].y * scaleY);
            for (let pt = 1; pt < item.points.length; pt++) {
              ctx.lineTo(item.points[pt].x * scaleX, item.points[pt].y * scaleY);
            }
            ctx.stroke();
          } else if (item.type === 'text') {
            ctx.fillStyle = item.color || '#000000';
            ctx.font = `bold ${Math.round((item.size || 18) * scaleX)}px sans-serif`;
            ctx.fillText(item.text || '', item.x * scaleX, item.y * scaleY);
          } else if (item.type === 'whiteout') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(item.x * scaleX, (item.y - (item.height || 24)) * scaleY, (item.width || 140) * scaleX, (item.height || 24) * scaleY);
          } else if (item.type === 'stamp') {
            const stampText = item.text || 'APPROVED';
            ctx.strokeStyle = item.color || '#16a34a';
            ctx.fillStyle = item.color || '#16a34a';
            ctx.lineWidth = 3 * scaleX;
            ctx.font = `bold ${Math.round(16 * scaleX)}px sans-serif`;
            const metrics = ctx.measureText(stampText);
            const w = metrics.width + 24 * scaleX;
            const h = 32 * scaleY;
            ctx.strokeRect(item.x * scaleX, (item.y - 22) * scaleY, w, h);
            ctx.fillText(stampText, (item.x + 12) * scaleX, item.y * scaleY);
          } else if (item.type === 'signature' && item.imageDataUrl) {
            const sigImg = new Image();
            sigImg.src = item.imageDataUrl;
            if (sigImg.complete) {
              ctx.drawImage(sigImg, (item.x - 60) * scaleX, (item.y - 30) * scaleY, 120 * scaleX, 60 * scaleY);
            }
          }
          ctx.restore();
        });

        const overlayPngData = overlayCanvas.toDataURL('image/png');
        overlayCanvas.width = 0;
        overlayCanvas.height = 0;

        const overlayPngBytes = base64ToUint8Array(overlayPngData);
        const embeddedPng = await doc.embedPng(overlayPngBytes);

        page.drawImage(embeddedPng, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });
      }

      const modifiedBytes = await doc.save({ useObjectStreams: true });
      const blob = new Blob([modifiedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const name = (pdfFile?.name || 'document').replace(/\.pdf$/i, '') + '_edited.pdf';
      downloadSingleFile(blob, name);
      triggerHaptic('success');
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const pageAnnotations = annotations.filter((a) => a.page === currentPage);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* 1. Helpful Clarification Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
              {loc.wordTipTitle}
            </h4>
            <p className="text-[11px] sm:text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              {loc.wordTipDesc}
            </p>
          </div>
        </div>
        <Link
          href="/pdf-to-word"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-sm"
        >
          <span>{loc.wordBtn}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </Link>
      </div>

      {/* 2. Upload / File Selection Hero State */}
      {!pdfFile ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-6 shadow-sm hover:border-brand-500 transition-colors">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-800 shadow-inner">
            <FileUp className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {loc.uploadCardTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {loc.uploadCardSub}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-brand-500/25 active:scale-95 transition-all">
              <FileUp className="w-4 h-4" />
              <span>{loc.choosePdf}</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handlePdfUpload}
              />
            </label>
          </div>

          {/* Quick Feature Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-2xl mx-auto border-t border-slate-100 dark:border-slate-800">
            {[
              { icon: Type, label: 'Add Text & Notes', color: 'text-blue-500' },
              { icon: PenLine, label: 'Sign & Stamps', color: 'text-emerald-500' },
              { icon: Highlighter, label: 'Highlighter', color: 'text-amber-500' },
              { icon: Eraser, label: 'Whiteout / Redact', color: 'text-purple-500' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                  <Icon className={`w-5 h-5 mx-auto ${f.color}`} />
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{f.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 3. Active PDF Workspace */
        <div className="space-y-6">
          {/* Top Control Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center border border-brand-200 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {pdfFile.name}
                </h3>
                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-2">
                  <span>{formatBytes(pdfFile.size)}</span>
                  <span>•</span>
                  <span>{totalPages} Pages</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors">
                <FileUp className="w-4 h-4" />
                <span>{loc.changePdf}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handlePdfUpload}
                />
              </label>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? loc.savingPdf : loc.exportPdf}</span>
              </button>
            </div>
          </div>

          {/* Main Editing Tools Tabs */}
          <div className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            {/* Tool Selection Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'text', label: loc.tabs.text, icon: Type },
                { id: 'draw', label: loc.tabs.draw, icon: PenTool },
                { id: 'highlight', label: loc.tabs.highlight, icon: Highlighter },
                { id: 'stamp', label: loc.tabs.stamp, icon: Stamp },
                { id: 'whiteout', label: loc.tabs.whiteout, icon: Eraser },
                { id: 'signature', label: loc.tabs.signature, icon: PenLine },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveTool(t.id as EditorToolType);
                      triggerHaptic('selection');
                    }}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tool Sub-Settings Bar */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              {/* Text Tool Inputs */}
              {activeTool === 'text' && (
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={loc.textPlaceholder}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-1 sm:max-w-xs focus:ring-2 focus:ring-brand-500"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-slate-400">{loc.textSizeLabel}</span>
                    {[14, 18, 24, 32].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setTextSize(sz)}
                        className={`px-2 py-1 text-[11px] font-black rounded-lg ${
                          textSize === sz ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600'
                        }`}
                      >
                        {sz}px
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stamp Tool Selectors */}
              {activeTool === 'stamp' && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'APPROVED', label: loc.stamps.approved, color: '#16a34a' },
                    { id: 'PAID', label: loc.stamps.paid, color: '#026fc7' },
                    { id: 'CONFIDENTIAL', label: loc.stamps.confidential, color: '#dc2626' },
                    { id: 'VERIFIED', label: loc.stamps.verified, color: '#7c3aed' },
                    { id: 'DATE', label: loc.stamps.date, color: '#475569' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setSelectedStamp(st.id);
                        setSelectedColor(st.color);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                        selectedStamp === st.id
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Pen / Highlighter Thickness */}
              {(activeTool === 'draw' || activeTool === 'highlight') && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">{loc.brushLabel}</span>
                  {[2, 4, 8, 12].map((bs) => (
                    <button
                      key={bs}
                      type="button"
                      onClick={() => setBrushSize(bs)}
                      className={`px-2.5 py-1 text-[11px] font-black rounded-lg ${
                        brushSize === bs ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                    >
                      {bs}px
                    </button>
                  ))}
                </div>
              )}

              {/* Signature Pad Area */}
              {activeTool === 'signature' && (
                <div className="space-y-2 w-full">
                  <div className="text-[11px] font-bold text-slate-500">{loc.signaturePrompt}</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <canvas
                      ref={sigCanvasRef}
                      width={240}
                      height={70}
                      onMouseDown={startSigDraw}
                      onMouseMove={moveSigDraw}
                      onMouseUp={endSigDraw}
                      onTouchStart={startSigDraw}
                      onTouchMove={moveSigDraw}
                      onTouchEnd={endSigDraw}
                      className="bg-white rounded-xl border-2 border-dashed border-slate-300 shadow-sm cursor-crosshair block touch-none"
                    />
                    <button
                      type="button"
                      onClick={clearSigPad}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                    >
                      {loc.clearSig}
                    </button>
                  </div>
                </div>
              )}

              {/* Palette & Undo/Redo */}
              {activeTool !== 'whiteout' && activeTool !== 'signature' && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {['#026fc7', '#dc2626', '#16a34a', '#000000', '#f59e0b', '#7c3aed'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`w-5 h-5 rounded-full transition-transform ${
                          selectedColor === c ? 'scale-125 ring-2 ring-brand-500' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1 border-l rtl:border-l-0 rtl:border-r border-slate-300 dark:border-slate-700 pl-2 rtl:pl-0 rtl:pr-2">
                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={undoStack.length === 0}
                      title={loc.undo}
                      className="p-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                    >
                      <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRedo}
                      disabled={redoStack.length === 0}
                      title={loc.redo}
                      className="p-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                    >
                      <Redo2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tap to Place Helper Indicator */}
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-bold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{loc.tapToPlaceNotice}</span>
            </div>
          </div>

          {/* Main PDF Canvas Viewport */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Document Canvas Column (3/4) */}
            <div className="lg:col-span-3 p-4 sm:p-8 rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[600px] overflow-auto">
              <div className="shadow-2xl rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={800}
                  onMouseDown={handleCanvasPointerDown}
                  onMouseMove={handleCanvasPointerMove}
                  onMouseUp={handleCanvasPointerUp}
                  onTouchStart={handleCanvasPointerDown}
                  onTouchMove={handleCanvasPointerMove}
                  onTouchEnd={handleCanvasPointerUp}
                  className="cursor-crosshair block touch-none max-w-full h-auto"
                />
              </div>

              {/* Page Selector */}
              {totalPages > 1 && (
                <div className="flex items-center gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                  </button>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 font-mono px-3 py-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    {loc.pageOf(currentPage, totalPages)}
                  </span>
                  <button
                    type="button"
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar: Added Items on this page (1/4) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>{loc.itemsOnPage}</span>
                  <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-[10px]">
                    {pageAnnotations.length}
                  </span>
                </h4>
                {pageAnnotations.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCurrentPageMarkup}
                    className="text-[10px] font-bold text-red-600 hover:underline"
                  >
                    {loc.clearAllPage}
                  </button>
                )}
              </div>

              {pageAnnotations.length === 0 ? (
                <p className="text-[11px] text-slate-400 py-6 text-center leading-relaxed">
                  {loc.noItems}
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {pageAnnotations.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                    >
                      <div className="truncate text-xs font-bold text-slate-700 dark:text-slate-300">
                        {item.type === 'text' && `📝 "${item.text}"`}
                        {item.type === 'stamp' && `🏷️ Stamp: ${item.text}`}
                        {item.type === 'whiteout' && `⬜ Whiteout Box`}
                        {item.type === 'draw' && `🖋️ Freehand Path`}
                        {item.type === 'highlight' && `🖍️ Highlight Mark`}
                        {item.type === 'signature' && `✍️ Signature`}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteAnnotation(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        title={loc.deleteItem}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
