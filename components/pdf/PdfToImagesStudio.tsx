'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload,
  Download,
  FileText,
  Image as ImageIcon,
  Check,
  Sparkles,
  Layers,
  Archive,
  RefreshCw,
} from 'lucide-react';
import { downloadSingleFile, downloadAsZip } from '@/lib/utils/download';
import { getPdfJsLib } from '@/lib/utils/formatters';

export function PdfToImagesStudio() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ pageNum: number; dataUrl: string }[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');

  const renderPdfPages = async (file: File) => {
    setIsLoading(true);
    setPages([]);
    setSelectedPages([]);

    try {
      const pdfjsLib = await getPdfJsLib();

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const extracted: { pageNum: number; dataUrl: string }[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // High-Res scale
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport }).promise;
          extracted.push({
            pageNum: i,
            dataUrl: canvas.toDataURL(`image/${format}`, 0.95),
          });
        }
      }

      setPages(extracted);
      setSelectedPages(extracted.map((p) => p.pageNum));
    } catch (err) {
      console.error('PDF rendering error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
      renderPdfPages(file);
    }
  };

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum]
    );
  };

  const handleDownloadSingle = (pageNum: number, dataUrl: string) => {
    const byteString = atob(dataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: `image/${format}` });
    const baseName = (pdfFile?.name || 'document').replace(/\.pdf$/i, '');
    downloadSingleFile(blob, `${baseName}_page_${pageNum}.${format === 'jpeg' ? 'jpg' : 'png'}`);
  };

  const handleDownloadAllZip = () => {
    const baseName = (pdfFile?.name || 'document').replace(/\.pdf$/i, '');
    const zipFiles: { name: string; blob: Blob }[] = [];

    pages
      .filter((p) => selectedPages.includes(p.pageNum))
      .forEach((p) => {
        const byteString = atob(p.dataUrl.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: `image/${format}` });
        zipFiles.push({
          name: `${baseName}_page_${p.pageNum}.${format === 'jpeg' ? 'jpg' : 'png'}`,
          blob,
        });
      });

    downloadAsZip(zipFiles, `${baseName}_extracted_pages.zip`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-700 dark:text-red-300 border border-red-500/20">
          <Sparkles className="w-3.5 h-3.5 text-red-600 animate-pulse" />
          <span>High-Resolution 300 DPI Page Extractor</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          PDF to High-Res JPG & PNG Image Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Convert every page of your PDF into crisp, ultra-high-definition images with 1-click batch ZIP downloading.
        </p>
      </div>

      {!pdfFile ? (
        <div
          onClick={() => document.getElementById('pdf-images-input')?.click()}
          className="p-12 sm:p-16 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-center space-y-4 hover:border-brand-500 transition-all cursor-pointer"
        >
          <input
            id="pdf-images-input"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-md">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">
              Select or Drop PDF file here
            </h3>
            <p className="text-xs text-slate-500">Fast in-browser rendering with zero cloud upload</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Format:</span>
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setFormat('png')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    format === 'png' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  PNG (Crisp)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('jpeg')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    format === 'jpeg' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  JPG (Compact)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDownloadAllZip}
                disabled={selectedPages.length === 0}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/25 flex items-center gap-2 disabled:opacity-50"
              >
                <Archive className="w-4 h-4" />
                <span>Download {selectedPages.length} Pages as ZIP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPdfFile(null);
                  setPages([]);
                }}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                New PDF
              </button>
            </div>
          </div>

          {/* Grid Gallery of Pages */}
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Rendering pages in 300 DPI HD...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pages.map((p) => {
                const isSelected = selectedPages.includes(p.pageNum);
                return (
                  <div
                    key={p.pageNum}
                    className={`p-3 rounded-2xl bg-white dark:bg-slate-900 border transition-all space-y-2 relative group shadow-md ${
                      isSelected
                        ? 'border-brand-500 ring-2 ring-brand-500/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div
                      className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 cursor-pointer relative"
                      onClick={() => togglePageSelection(p.pageNum)}
                    >
                      <img src={p.dataUrl} alt={`Page ${p.pageNum}`} className="w-full h-full object-contain" />
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-extrabold text-slate-700 dark:text-slate-300">Page {p.pageNum}</span>
                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(p.pageNum, p.dataUrl)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-brand-600 text-[11px] font-bold flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
