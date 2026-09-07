'use client';

import React, { useState } from 'react';
import { FileUploader } from '@/components/shared/FileUploader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { PrivacyBadge } from '@/components/shared/PrivacyBadge';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { formatBytes } from '@/lib/utils/formatters';
import { downloadAsZip, downloadSingleFile } from '@/lib/utils/download';
import { convertImage, compressImage } from '@/lib/image/image-manipulator';
import { mergePdfs, imagesToPdf } from '@/lib/pdf/pdf-manipulator';
import { Layers, Play, Download, Trash2, CheckCircle, File, Image as ImageIcon, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { adManager } from '@/lib/ads/AdManager';
import { AdSlot } from '@/components/ads/AdSlot';

interface BatchItem {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  resultBlob?: Blob;
  resultName?: string;
  error?: string;
}

export default function BatchPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [batchAction, setBatchAction] = useState<'convert-webp' | 'convert-png' | 'compress' | 'merge-pdf'>('convert-webp');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleFilesAdded = (files: File[]) => {
    setSelectedFiles(files);
    setItems(
      files.map((f) => ({
        id: Math.random().toString(),
        file: f,
        status: 'pending',
        progress: 0,
      }))
    );
    setIsCompleted(false);
  };

  const handleRunBatch = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setOverallProgress(5);
    setIsCompleted(false);

    try {
      if (batchAction === 'merge-pdf') {
        // Special case: Merge all into one single PDF
        const pdfFiles = items.filter((i) => i.file.type === 'application/pdf');
        const imgFiles = items.filter((i) => i.file.type.startsWith('image/'));

        let mergedBlob: Blob;
        if (pdfFiles.length > 0) {
          const buffers = await Promise.all(pdfFiles.map((p) => p.file.arrayBuffer()));
          const bytes = await mergePdfs(buffers);
          mergedBlob = new Blob([bytes as any], { type: 'application/pdf' });
        } else {
          const imgBuffers = await Promise.all(
            imgFiles.map(async (f) => ({
              buffer: await f.file.arrayBuffer(),
              mimeType: f.file.type || 'image/jpeg',
            }))
          );
          const bytes = await imagesToPdf(imgBuffers);
          mergedBlob = new Blob([bytes as any], { type: 'application/pdf' });
        }

        downloadSingleFile(mergedBlob, 'batch-merged-document.pdf');
        setItems((prev) =>
          prev.map((i) => ({
            ...i,
            status: 'completed',
            progress: 100,
            resultBlob: mergedBlob,
            resultName: 'batch-merged-document.pdf',
          }))
        );
      } else {
        // Process each item individually in parallel / queue
        const updated = [...items];
        for (let idx = 0; idx < updated.length; idx++) {
          updated[idx].status = 'processing';
          setItems([...updated]);

          const current = updated[idx];
          try {
            if (batchAction === 'convert-webp') {
              const res = await convertImage(current.file, 'image/webp', 0.85);
              updated[idx].resultBlob = res.blob;
              updated[idx].resultName = `${current.file.name.replace(/\.[^/.]+$/, '')}.webp`;
            } else if (batchAction === 'convert-png') {
              const res = await convertImage(current.file, 'image/png', 0.95);
              updated[idx].resultBlob = res.blob;
              updated[idx].resultName = `${current.file.name.replace(/\.[^/.]+$/, '')}.png`;
            } else if (batchAction === 'compress') {
              const res = await compressImage(current.file, 0.7);
              updated[idx].resultBlob = res.blob;
              updated[idx].resultName = `compressed-${current.file.name}`;
            }
            updated[idx].status = 'completed';
            updated[idx].progress = 100;
          } catch (err: any) {
            updated[idx].status = 'error';
            updated[idx].error = err.message || 'Failed';
          }

          setOverallProgress(Math.round(((idx + 1) / updated.length) * 100));
          setItems([...updated]);
        }
      }

      setIsCompleted(true);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadZip = () => {
    const valid = items
      .filter((i) => i.resultBlob && i.resultName)
      .map((i) => ({ name: i.resultName!, blob: i.resultBlob! }));
    if (valid.length > 0) {
      downloadAsZip(valid, 'batch-processed-files.zip');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Utilities', href: '/tools' }, { label: 'Batch Processing Manager' }]} />

      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <PrivacyBadge isClientSide={true} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          Batch File Processing Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Process, convert, compress, or combine up to 50 files simultaneously with client-side Web Workers.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        {/* File Uploader */}
        {items.length === 0 && (
          <FileUploader
            acceptedExtensions={['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.docx', '.xlsx']}
            acceptedMimeTypes={['*/*']}
            maxFiles={50}
            maxFileSizeMB={50}
            selectedFiles={selectedFiles}
            onFilesSelected={handleFilesAdded}
          />
        )}

        {/* Batch Queue & Configuration */}
        {items.length > 0 && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-brand-500" />
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Bulk Action
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Select the transformation to apply across all {items.length} files
                  </p>
                </div>
              </div>

              <select
                value={batchAction}
                onChange={(e) => setBatchAction(e.target.value as any)}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-100"
              >
                <option value="convert-webp">Bulk Convert to WebP (Next-Gen)</option>
                <option value="convert-png">Bulk Convert to PNG (Lossless)</option>
                <option value="compress">Bulk Smart Compression</option>
                <option value="merge-pdf">Combine / Merge All into Single PDF</option>
              </select>
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <ProgressBar progress={overallProgress} statusText={`Processing batch queue...`} />
            )}

            {/* Items Table / Queue */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500">
                      {item.file.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-brand-500" /> : <File className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{item.file.name}</p>
                      <p className="text-[10px] text-slate-400">{formatBytes(item.file.size)}</p>
                    </div>
                  </div>

                  <div>
                    {item.status === 'completed' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Done
                      </span>
                    )}
                    {item.status === 'processing' && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 font-bold text-[10px]">
                        Processing...
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-medium text-[10px]">
                        Queued
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setItems([]);
                  setSelectedFiles([]);
                  setIsCompleted(false);
                }}
                disabled={isProcessing}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Clear Queue
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {isCompleted && (
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All as ZIP</span>
                  </button>
                )}

                {!isCompleted && (
                  <button
                    type="button"
                    onClick={handleRunBatch}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 text-white text-sm font-bold shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Batch Processing</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <AdSlot placement="tool-bottom" />
    </div>
  );
}
