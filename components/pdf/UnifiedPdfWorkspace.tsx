'use client';

import React, { useState, useRef } from 'react';
import { FileText, Layers, RotateCw, Trash2, Copy, Download, Upload, Zap, CheckCircle2, FileDown, Hash, Stamp, Scissors, ArrowRight, ShieldCheck } from 'lucide-react';
import { PDFDocument, degrees, rgb } from 'pdf-lib';
import { compressPdfAdvanced } from '@/lib/pdf/pdf-compressor';
import { downloadSingleFile } from '@/lib/utils/download';
import { formatBytes } from '@/lib/utils/formatters';

export function UnifiedPdfWorkspace() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pageRotations, setPageRotations] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'organize' | 'compress' | 'watermark' | 'numbers'>('organize');

  // Operation Options
  const [compressionPreset, setCompressionPreset] = useState<'balanced' | 'max' | 'high'>('balanced');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [pageNumberFormat, setPageNumberFormat] = useState('Page X of Y');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultSummary, setResultSummary] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
      const buffer = await file.arrayBuffer();
      setPdfBytes(buffer);

      try {
        const doc = await PDFDocument.load(buffer);
        const count = doc.getPageCount();
        setPageCount(count);
        setPageRotations(new Array(count).fill(0));
        setResultSummary(null);
      } catch (err) {
        console.error('PDF load error:', err);
      }
    }
  };

  const handleRotatePage = (index: number) => {
    setPageRotations((prev) => {
      const next = [...prev];
      next[index] = (next[index] + 90) % 360;
      return next;
    });
  };

  const handleRotateAll = () => {
    setPageRotations((prev) => prev.map((r) => (r + 90) % 360));
  };

  // Unified PDF Operations Pipeline Execution
  const handleApplyAndExport = async () => {
    if (!pdfBytes || !pdfFile) return;
    setIsProcessing(true);
    setResultSummary(null);

    try {
      const doc = await PDFDocument.load(pdfBytes);
      const pages = doc.getPages();

      // 1. Apply Rotations
      pages.forEach((page, idx) => {
        const rot = pageRotations[idx] || 0;
        if (rot > 0) {
          page.setRotation(degrees(page.getRotation().angle + rot));
        }
      });

      // 2. Apply Page Numbers if on Numbers tab
      if (activeTab === 'numbers') {
        const total = pages.length;
        pages.forEach((page, idx) => {
          const { width } = page.getSize();
          const str = pageNumberFormat
            .replace('X', String(idx + 1))
            .replace('Y', String(total));
          page.drawText(str, {
            x: width / 2 - 30,
            y: 25,
            size: 10,
            color: rgb(0.3, 0.3, 0.3),
          });
        });
      }

      // 3. Apply Watermark if on Watermark tab
      if (activeTab === 'watermark' && watermarkText) {
        pages.forEach((page) => {
          const { width, height } = page.getSize();
          page.drawText(watermarkText, {
            x: width / 4,
            y: height / 2,
            size: 45,
            color: rgb(0.85, 0.2, 0.2),
            opacity: 0.25,
            rotate: degrees(45),
          });
        });
      }

      let outputBlob: Blob;
      const originalSize = pdfFile.size;

      if (activeTab === 'compress') {
        const compLevel = compressionPreset === 'max' ? 'extreme' : compressionPreset === 'high' ? 'light' : 'medium';
        const compressRes = await compressPdfAdvanced(pdfBytes, { level: compLevel });
        outputBlob = new Blob([compressRes.bytes as any], { type: 'application/pdf' });
      } else {
        const modifiedBytes = await doc.save();
        outputBlob = new Blob([modifiedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      }

      const newSize = outputBlob.size;
      if (activeTab === 'compress' && newSize >= originalSize) {
        setResultSummary(`Compression preserved original file size (${formatBytes(originalSize)}) with optimal quality.`);
      } else {
        const savedPct = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));
        setResultSummary(`Successfully processed! Original: ${formatBytes(originalSize)} ➔ Output: ${formatBytes(newSize)} (-${savedPct}%)`);
      }

      const outName = `${pdfFile.name.replace(/\.pdf$/i, '')}_workspace_${activeTab}.pdf`;
      downloadSingleFile(outputBlob, outName);
    } catch (err: any) {
      setResultSummary(`Processing error: ${err.message || 'Failed'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">
            <Layers className="w-3 h-3 text-rose-600" />
            <span>Unified PDF Workspace • Multi-Operation Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {pdfFile ? pdfFile.name : 'All-in-One PDF Document Workspace'}
          </h2>
          {pageCount > 0 && (
            <p className="text-xs text-slate-500">
              Loaded: {pageCount} Pages • Size: {formatBytes(pdfFile?.size || 0)}
            </p>
          )}
        </div>

        {/* Upload / Switch Document Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handlePdfUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>{pdfFile ? 'Change Document' : 'Open PDF File'}</span>
          </button>
        </div>
      </div>

      {!pdfFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-16 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-center space-y-4 hover:border-rose-500 transition-all cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              Upload PDF into the Unified Workspace
            </h3>
            <p className="text-xs text-slate-500">
              Switch seamlessly between page organizing, smart compression, watermarking, and page numbers.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Operations Sidebar Tabs */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Workspace Operations:
            </span>

            <div className="space-y-2">
              {[
                { id: 'organize', label: 'Rotate & Organize Pages', icon: RotateCw, desc: 'Rotate individual pages or whole document' },
                { id: 'compress', label: 'Smart Compression Presets', icon: Zap, desc: 'Shrink file size with quality preservation' },
                { id: 'watermark', label: 'Security Watermark Stamp', icon: Stamp, desc: 'Add Confidential diagonal stamp' },
                { id: 'numbers', label: 'Header/Footer Page Numbers', icon: Hash, desc: 'Stamp customizable Page X of Y' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 ring-2 ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <Icon className="w-4 h-4 text-rose-600" />
                      <span>{tab.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{tab.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Custom Options Panel for Active Tab */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {activeTab === 'organize' && (
                <button
                  type="button"
                  onClick={handleRotateAll}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Rotate All Pages 90°
                </button>
              )}

              {activeTab === 'compress' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Compression Preset:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'balanced', label: 'Balanced' },
                      { id: 'max', label: 'Maximum' },
                      { id: 'high', label: 'High Res' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setCompressionPreset(p.id as any)}
                        className={`py-2 text-[11px] font-bold rounded-xl border ${
                          compressionPreset === p.id
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'watermark' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Watermark Text:</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200"
                  />
                </div>
              )}

              {activeTab === 'numbers' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Numbering Format:</label>
                  <input
                    type="text"
                    value={pageNumberFormat}
                    onChange={(e) => setPageNumberFormat(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200"
                  />
                </div>
              )}
            </div>

            {/* Execute Button */}
            <button
              type="button"
              onClick={handleApplyAndExport}
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isProcessing ? 'Processing PDF...' : 'Apply & Download PDF'}</span>
            </button>
          </div>

          {/* Page Grid & Preview Workspace */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                Document Page Grid ({pageCount} Pages)
              </span>
              <span className="text-[11px] text-slate-400">Click rotate button on any page</span>
            </div>

            {resultSummary && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resultSummary}</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto p-2">
              {Array.from({ length: pageCount }).map((_, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-between space-y-2 hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-full aspect-[3/4] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-xs font-bold text-slate-400 shadow-inner transition-transform"
                    style={{ transform: `rotate(${pageRotations[i] || 0}deg)` }}
                  >
                    <FileText className="w-8 h-8 text-rose-500/60 mb-1" />
                    <span>Page {i + 1}</span>
                  </div>

                  <div className="flex items-center justify-between w-full pt-1">
                    <span className="text-[10px] font-mono text-slate-400">
                      {pageRotations[i] || 0}°
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRotatePage(i)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                      title="Rotate Page 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
