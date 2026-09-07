'use client';

import React, { useState, useRef } from 'react';
import { Layers, Upload, Download, Trash2, RotateCw, ArrowLeft, ArrowRight, CheckCircle, RefreshCw, Sparkles } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';

import { getPdfJsLib } from '@/lib/utils/formatters';

interface PageItem {
  pageIndex: number; // 0-based in original PDF
  dataUrl: string;
  rotation: number; // 0, 90, 180, 270
}

export function PdfOrganizerStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPages([]);
      setExportUrl(null);
      setLoading(true);
      setProgressText('Initializing PDF engine...');

      try {
        const pdfjs = await getPdfJsLib();
        if (!pdfjs) throw new Error('PDF library unavailable');

        const arrayBuffer = await f.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        const total = pdf.numPages;

        const renderedPages: PageItem[] = [];
        for (let i = 1; i <= total; i++) {
          setProgressText(`Rendering thumbnail ${i} of ${total}...`);

          if (i % 2 === 0 || total > 15) {
            await new Promise((resolve) => setTimeout(resolve, 6));
          }

          const p = await pdf.getPage(i);
          const viewport = p.getViewport({ scale: 0.45 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await p.render({ canvasContext: ctx, viewport }).promise;
            renderedPages.push({
              pageIndex: i - 1,
              dataUrl: canvas.toDataURL('image/jpeg', 0.8),
              rotation: 0,
            });
          }
          canvas.width = 0;
          canvas.height = 0;
        }
        setPages(renderedPages);
      } catch (err) {
        console.error('PDF Organizer Load Error:', err);
      } finally {
        setLoading(false);
        setProgressText('');
      }
    }
  };

  const movePage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= pages.length) return;
    const next = [...pages];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setPages(next);
  };

  const rotatePage = (idx: number) => {
    const next = [...pages];
    next[idx].rotation = (next[idx].rotation + 90) % 360;
    setPages(next);
  };

  const deletePage = (idx: number) => {
    if (pages.length <= 1) return;
    const next = pages.filter((_, i) => i !== idx);
    setPages(next);
  };

  const handleExport = async () => {
    if (!file || pages.length === 0) return;
    setExporting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const outDoc = await PDFDocument.create();

      for (const item of pages) {
        const [copiedPage] = await outDoc.copyPages(srcDoc, [item.pageIndex]);
        if (item.rotation > 0) {
          copiedPage.setRotation(degrees((copiedPage.getRotation().angle + item.rotation) % 360));
        }
        outDoc.addPage(copiedPage);
      }

      const pdfBytes = await outDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setExportUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100 space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">PDF Page Organizer & Reorder</h2>
            <p className="text-xs sm:text-sm text-slate-500">Visually arrange, reorder, rotate individual pages, and delete unwanted pages from your PDF.</p>
          </div>
        </div>

        {/* Dropzone */}
        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-rose-500 bg-slate-50/60 hover:bg-rose-50/20 rounded-2xl p-10 text-center cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 group-hover:scale-110 flex items-center justify-center mx-auto mb-4 transition-transform shadow-sm">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">Click or drag & drop PDF document</p>
            <p className="text-xs text-slate-500">Up to 500 MB (Organize unlimited pages)</p>
          </div>
        )}

        {loading && (
          <div className="p-8 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">{progressText || 'Generating page thumbnails...'}</p>
          </div>
        )}

        {/* Page Organizer Grid */}
        {pages.length > 0 && !exportUrl && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-slate-900">{file?.name}</p>
                <p className="text-xs text-slate-500">{pages.length} pages remaining • Use arrows to reorder</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPages([]);
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200"
                >
                  Change File
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="px-5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{exporting ? 'Saving PDF...' : 'Save & Export PDF'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pages.map((item, idx) => (
                <div
                  key={`${item.pageIndex}-${idx}`}
                  className="group relative p-3 bg-white border border-slate-200 hover:border-rose-400 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-2.5"
                >
                  {/* Page Number Badge */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                      Page {idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400">Orig #{item.pageIndex + 1}</span>
                  </div>

                  {/* Thumbnail */}
                  <div className="h-44 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-1 border border-slate-100">
                    <img
                      src={item.dataUrl}
                      alt={`Page ${idx + 1}`}
                      className="max-h-full max-w-full object-contain rounded shadow-xs transition-transform duration-200"
                      style={{ transform: `rotate(${item.rotation}deg)` }}
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => movePage(idx, idx - 1)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700"
                      title="Move Left"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => rotatePage(idx)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePage(idx)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={idx === pages.length - 1}
                      onClick={() => movePage(idx, idx + 1)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700"
                      title="Move Right"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {exportUrl && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle className="w-6 h-6" />
              <div>
                <p className="font-extrabold text-slate-900">Organized PDF Ready!</p>
                <p className="text-xs text-emerald-700">{pages.length} pages structured and saved.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={exportUrl}
                download={`organized_${file?.name}`}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Download className="w-5 h-5" />
                Download Organized PDF
              </a>
              <button
                onClick={() => {
                  setFile(null);
                  setPages([]);
                  setExportUrl(null);
                }}
                className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-200"
              >
                <RefreshCw className="w-4 h-4" />
                Organize Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
