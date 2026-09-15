'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Type, PenTool, Highlighter, Square, Circle, Download, RotateCw, Undo2, Redo2, Trash2, FileUp, ChevronLeft, ChevronRight, Zap, ZoomIn, ZoomOut, PenLine, Save, Layers, FileCheck } from 'lucide-react';
import { downloadSingleFile } from '@/lib/utils/download';
import { PDFDocument, rgb } from 'pdf-lib';
import { useI18n } from '@/lib/i18n/i18n-context';
import { getPdfJsLib, base64ToUint8Array } from '@/lib/utils/formatters';

const PDF_EDITOR_LOCALES = {
  en: {
    badge: 'PDF Editor Pro • Vector Annotations & Undo/Redo',
    defaultTitle: 'Visual PDF Document Editor',
    changePdf: 'Change PDF',
    openPdf: 'Open PDF',
    savingPdf: 'Saving PDF...',
    exportPdf: 'Export Edited PDF',
    tools: {
      text: 'Text',
      draw: 'Pen',
      highlight: 'Highlight',
      rectangle: 'Box',
      signature: 'Sign',
    },
    textPlaceholder: 'Type text to add...',
    defaultText: 'Your Text Here',
    defaultSig: 'Verified Signature',
    fontSize: 'Font Size',
    pageOf: (curr: number, total: number) => `Page ${curr} of ${total}`,
  },
  ur: {
    badge: 'پی ڈی ایف ایڈیٹر پرو • ویکٹر نوٹیشنز اور ان ڈو/ری ڈو',
    defaultTitle: 'بصری پی ڈی ایف ایڈیٹر',
    changePdf: 'پی ڈی ایف تبدیل کریں',
    openPdf: 'پی ڈی ایف کھولیں',
    savingPdf: 'پی ڈی ایف محفوظ کی جا رہی ہے...',
    exportPdf: 'ترمیم شدہ پی ڈی ایف ڈاؤنلوڈ کریں',
    tools: {
      text: 'متن (Text)',
      draw: 'قلم (Pen)',
      highlight: 'ہائی لائٹ',
      rectangle: 'باکس',
      signature: 'دستخط',
    },
    textPlaceholder: 'یہاں متن لکھیں...',
    defaultText: 'یہاں اپنا متن لکھیں',
    defaultSig: 'تصدیق شدہ دستخط',
    fontSize: 'سائز',
    pageOf: (curr: number, total: number) => `صفحہ ${curr} از ${total}`,
  },
  ar: {
    badge: 'محرر PDF الاحترافي • التعليقات التوضيحية والتراجع/الإعادة',
    defaultTitle: 'محرر مستندات PDF المرئي',
    changePdf: 'تغيير PDF',
    openPdf: 'فتح PDF',
    savingPdf: 'جاري حفظ PDF...',
    exportPdf: 'تصدير PDF المعدل',
    tools: {
      text: 'نص',
      draw: 'قلم',
      highlight: 'تمييز',
      rectangle: 'مربع',
      signature: 'توقيع',
    },
    textPlaceholder: 'أدخل النص...',
    defaultText: 'اكتب نصك هنا',
    defaultSig: 'توقيع معتمد',
    fontSize: 'الحجم',
    pageOf: (curr: number, total: number) => `صفحة ${curr} من ${total}`,
  },
  hi: {
    badge: 'पीडीएफ संपादक प्रो • वेक्टर एनोटेशन और पूर्ववत/फिर से करें',
    defaultTitle: 'विज़ुअल पीडीएफ दस्तावेज़ संपादक',
    changePdf: 'पीडीएफ बदलें',
    openPdf: 'पीडीएफ खोलें',
    savingPdf: 'पीडीएफ सहेजा जा रहा है...',
    exportPdf: 'संपादित पीडीएफ निर्यात करें',
    tools: {
      text: 'पाठ (Text)',
      draw: 'कलम (Pen)',
      highlight: 'हाइलाइट',
      rectangle: 'बॉक्स',
      signature: 'हस्ताक्षर',
    },
    textPlaceholder: 'पाठ दर्ज करें...',
    defaultText: 'अपना पाठ यहाँ लिखें',
    defaultSig: 'सत्यापित हस्ताक्षर',
    fontSize: 'साइज़',
    pageOf: (curr: number, total: number) => `पृष्ठ ${curr} / ${total}`,
  },
};

type EditorTool = 'select' | 'text' | 'draw' | 'highlight' | 'rectangle' | 'circle' | 'signature';

interface AnnotationItem {
  id: string;
  type: EditorTool;
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color?: string;
  size?: number;
  fontSize?: number;
  points?: { x: number; y: number }[];
}

export function VisualPdfEditor() {
  const { language, isRTL } = useI18n();
  const loc = PDF_EDITOR_LOCALES[language] || PDF_EDITOR_LOCALES.en;

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [activeTool, setActiveTool] = useState<EditorTool>('text');
  const [selectedColor, setSelectedColor] = useState<string>('#026fc7');
  const [brushSize, setBrushSize] = useState<number>(3);
  const [fontSize, setFontSize] = useState<number>(20);
  const [canvasDims, setCanvasDims] = useState<{ width: number; height: number }>({ width: 600, height: 800 });

  // History Stacks for Multi-Level Undo / Redo
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [undoStack, setUndoStack] = useState<AnnotationItem[][]>([]);
  const [redoStack, setRedoStack] = useState<AnnotationItem[][]>([]);

  const [textInput, setTextInput] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageImageCache = useRef<Map<number, HTMLImageElement>>(new Map());
  const pdfDocRef = useRef<any>(null);

  // 1. Load Real PDF and render pages with getPdfJsLib
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
      const buffer = await file.arrayBuffer();
      setPdfBytes(buffer);

      try {
        const pdfjsLib = await getPdfJsLib();
        if (!pdfjsLib) throw new Error('PDF library unavailable');

        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        pageImageCache.current.clear();

        // Render Page 1
        await renderPdfPageImage(pdf, 1);
      } catch (err) {
        console.error('PDF load error:', err);
      }
    }
  };

  const renderPdfPageImage = async (pdfDoc: any, pageNum: number) => {
    try {
      if (pageImageCache.current.has(pageNum)) {
        const cachedImg = pageImageCache.current.get(pageNum);
        if (cachedImg) {
          setCanvasDims({ width: cachedImg.naturalWidth, height: cachedImg.naturalHeight });
        }
        redrawCanvas();
        return;
      }

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const w = Math.round(viewport.width);
      const h = Math.round(viewport.height);
      setCanvasDims({ width: w, height: h });

      const offCanvas = document.createElement('canvas');
      offCanvas.width = w;
      offCanvas.height = h;
      const offCtx = offCanvas.getContext('2d');

      if (offCtx) {
        await page.render({ canvasContext: offCtx, viewport }).promise;
        const dataUrl = offCanvas.toDataURL('image/jpeg', 0.90);
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
      console.error('Render page error:', err);
    }
  };

  useEffect(() => {
    if (pdfDocRef.current) {
      renderPdfPageImage(pdfDocRef.current, currentPage);
    } else {
      redrawCanvas();
    }
  }, [currentPage]);

  // 2. Redraw Canvas with background page image + vector annotations
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background PDF page image or clean white canvas
    const pageImg = pageImageCache.current.get(currentPage);
    if (pageImg) {
      ctx.drawImage(pageImg, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

    // Render annotations for current page
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
        ctx.lineWidth = 22;
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
          ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        ctx.stroke();
      } else if (item.type === 'text') {
        ctx.fillStyle = item.color || '#000000';
        const fSize = item.fontSize || 20;
        ctx.font = `bold ${fSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText(item.text || '', item.x, item.y);
      } else if (item.type === 'rectangle') {
        ctx.strokeStyle = item.color || '#026fc7';
        ctx.lineWidth = item.size || 3;
        ctx.strokeRect(item.x, item.y, item.width || 140, item.height || 70);
      } else if (item.type === 'signature') {
        ctx.fillStyle = item.color || '#000000';
        ctx.font = 'italic bold 24px cursive, sans-serif';
        ctx.fillText(item.text || loc.defaultSig, item.x, item.y);
      }
      ctx.restore();
    });

    // Draw live path during active drawing
    if (isDrawing && currentPath.length > 1) {
      ctx.save();
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = activeTool === 'highlight' ? 22 : brushSize;
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
  }, [currentPage, annotations, isDrawing, currentPath, selectedColor, activeTool, brushSize, loc.defaultSig]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas, canvasDims]);

  // 3. Canvas Mouse & Touch Drawing Handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : 'clientX' in e ? (e as React.MouseEvent).clientX : 0;
    const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : 'clientY' in e ? (e as React.MouseEvent).clientY : 0;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    if (x === 0 && y === 0) return;

    // Save state to undo stack before mutation
    setUndoStack((prev) => [...prev, [...annotations]]);
    setRedoStack([]); // Clear redo stack on new action

    if (activeTool === 'text') {
      const textToPlace = textInput.trim() ? textInput : loc.defaultText;
      const newAnn: AnnotationItem = {
        id: 'ann_' + Date.now(),
        type: 'text',
        page: currentPage,
        x,
        y,
        text: textToPlace,
        color: selectedColor,
        fontSize: fontSize,
      };
      setAnnotations((prev) => [...prev, newAnn]);
    } else if (activeTool === 'rectangle') {
      const newAnn: AnnotationItem = {
        id: 'ann_' + Date.now(),
        type: 'rectangle',
        page: currentPage,
        x,
        y,
        width: 140,
        height: 70,
        color: selectedColor,
        size: brushSize,
      };
      setAnnotations((prev) => [...prev, newAnn]);
    } else if (activeTool === 'signature') {
      const sigToPlace = textInput.trim() ? textInput : loc.defaultSig;
      const newAnn: AnnotationItem = {
        id: 'ann_' + Date.now(),
        type: 'signature',
        page: currentPage,
        x,
        y,
        text: sigToPlace,
        color: selectedColor,
      };
      setAnnotations((prev) => [...prev, newAnn]);
    } else if (activeTool === 'draw' || activeTool === 'highlight') {
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoords(e);
    setCurrentPath((prev) => [...prev, { x, y }]);
  };

  const handlePointerUp = () => {
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
    }
    setIsDrawing(false);
    setCurrentPath([]);
  };

  // 4. Multi-Level Undo & Redo Handlers
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, [...annotations]]);
    setAnnotations(previous);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, [...annotations]]);
    setAnnotations(next);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
  };

  const handleClearPage = () => {
    setUndoStack((prev) => [...prev, [...annotations]]);
    setRedoStack([]);
    setAnnotations((prev) => prev.filter((a) => a.page !== currentPage));
  };

  // 5. Real Export with pdf-lib & High-Resolution Vector/Overlay Baking
  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      let doc: PDFDocument;
      if (pdfBytes) {
        doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      } else {
        doc = await PDFDocument.create();
        doc.addPage([595, 842]);
      }

      const pages = doc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const pageNum = i + 1;
        const pageAnnotations = annotations.filter((a) => a.page === pageNum);
        if (pageAnnotations.length === 0) continue;

        const page = pages[i];
        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Create high-resolution overlay canvas matching the target page aspect ratio
        const overlayCanvas = document.createElement('canvas');
        overlayCanvas.width = 1600;
        overlayCanvas.height = Math.round(1600 * (pageHeight / pageWidth));
        const ctx = overlayCanvas.getContext('2d');
        if (!ctx) continue;

        // Proportional scale factor relative to current editor canvas dimensions
        const scaleX = overlayCanvas.width / canvasDims.width;
        const scaleY = overlayCanvas.height / canvasDims.height;

        // Render annotations onto overlay
        pageAnnotations.forEach((item) => {
          ctx.save();
          if ((item.type === 'draw' || item.type === 'highlight') && item.points && item.points.length > 1) {
            ctx.strokeStyle = item.color || (item.type === 'highlight' ? '#fef08a' : '#000000');
            ctx.lineWidth = (item.size || (item.type === 'highlight' ? 22 : 3)) * scaleX;
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
            const fSize = (item.fontSize || 20) * scaleX;
            ctx.font = `bold ${Math.round(fSize)}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            ctx.fillText(item.text || '', item.x * scaleX, item.y * scaleY);
          } else if (item.type === 'rectangle') {
            ctx.strokeStyle = item.color || '#026fc7';
            ctx.lineWidth = (item.size || 3) * scaleX;
            ctx.strokeRect(item.x * scaleX, item.y * scaleY, (item.width || 140) * scaleX, (item.height || 70) * scaleY);
          } else if (item.type === 'signature') {
            ctx.fillStyle = item.color || '#000000';
            ctx.font = `italic bold ${Math.round(24 * scaleX)}px cursive, sans-serif`;
            ctx.fillText(item.text || loc.defaultSig, item.x * scaleX, item.y * scaleY);
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
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200">
            <Zap className="w-3 h-3 text-brand-600" />
            <span>{loc.badge}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {pdfFile ? pdfFile.name : loc.defaultTitle}
          </h2>
        </div>

        {/* Upload & Export Action Buttons */}
        <div className="flex items-center gap-2.5">
          <input
            id="pdf-editor-upload"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handlePdfUpload}
          />
          <button
            type="button"
            onClick={() => document.getElementById('pdf-editor-upload')?.click()}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <FileUp className="w-4 h-4" />
            <span>{pdfFile ? loc.changePdf : loc.openPdf}</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 text-white text-xs font-extrabold rounded-xl shadow-md shadow-brand-500/25 flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? loc.savingPdf : loc.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* Main Toolbar & Tools Bar */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3">
        {/* Tool Selectors */}
        <div className="flex items-center gap-1 flex-wrap">
          {[
            { id: 'text', label: loc.tools.text, icon: Type },
            { id: 'draw', label: loc.tools.draw, icon: PenTool },
            { id: 'highlight', label: loc.tools.highlight, icon: Highlighter },
            { id: 'rectangle', label: loc.tools.rectangle, icon: Square },
            { id: 'signature', label: loc.tools.signature, icon: PenLine },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = activeTool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTool(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Text Input, Font Size & Color Picker */}
        <div className="flex items-center gap-3 flex-wrap">
          {(activeTool === 'text' || activeTool === 'signature') && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={loc.textPlaceholder}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-44 sm:w-56 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              {activeTool === 'text' && (
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="px-2 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <option value={14}>14px</option>
                  <option value={18}>18px</option>
                  <option value={22}>22px</option>
                  <option value={28}>28px</option>
                  <option value={36}>36px</option>
                  <option value={48}>48px</option>
                </select>
              )}
            </div>
          )}

          {/* Color Palette */}
          <div className="flex items-center gap-1.5">
            {['#026fc7', '#dc2626', '#16a34a', '#000000', '#f59e0b', '#7c3aed'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                className={`w-5 h-5 rounded-full transition-transform ${
                  selectedColor === c ? 'scale-125 ring-2 ring-brand-500/50' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Undo, Redo, and Clear Buttons */}
          <div className="flex items-center gap-1 border-l rtl:border-l-0 rtl:border-r border-slate-200 dark:border-slate-800 pl-2 rtl:pl-0 rtl:pr-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              title="Undo"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              title="Redo"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClearPage}
              title="Clear Page Annotations"
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Canvas Workspace */}
      <div className="p-4 sm:p-8 rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[550px] overflow-auto">
        <div className="shadow-2xl rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white max-w-full">
          <canvas
            ref={canvasRef}
            width={canvasDims.width}
            height={canvasDims.height}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            className="cursor-crosshair block touch-none max-w-full h-auto"
            style={{ maxHeight: '75vh' }}
          />
        </div>

        {/* Page Switcher */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3 pt-6">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-40 shadow-xs"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
              {loc.pageOf(currentPage, totalPages)}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-40 shadow-xs"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
