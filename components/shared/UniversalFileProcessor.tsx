'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileCheck,
  AlertCircle,
  RotateCcw,
  Download,
  X,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Layers,
  FileArchive,
  RefreshCw,
} from 'lucide-react';
import { validateFile, ValidationResult, MAX_FILE_SIZE_BYTES } from '@/lib/core/file-validator';
import { normalizeError, MiftahErrorDetail } from '@/lib/core/error-system';
import { formatBytes } from '@/lib/utils/formatters';
import { downloadSingleFile } from '@/lib/utils/download';
import { useI18n } from '@/lib/i18n/i18n-context';

export interface ProcessedResultFile {
  name: string;
  blob: Blob;
  dataUrl?: string;
  originalSize: number;
  newSize: number;
}

interface UniversalFileProcessorProps {
  toolId: string;
  toolName: string;
  allowedMimes?: string[];
  maxFiles?: number;
  isClientSide?: boolean;
  acceptLabel?: string;
  onProcess: (files: File[], updateProgress: (pct: number) => void) => Promise<ProcessedResultFile[]>;
  optionsComponent?: React.ReactNode;
}

export function UniversalFileProcessor({
  toolId,
  toolName,
  allowedMimes = ['*/*'],
  maxFiles = 10,
  isClientSide = true,
  acceptLabel = 'PDF, Images, or Documents',
  onProcess,
  optionsComponent,
}: UniversalFileProcessorProps) {
  const { t } = useI18n();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorDetail, setErrorDetail] = useState<MiftahErrorDetail | null>(null);
  const [results, setResults] = useState<ProcessedResultFile[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      setErrorDetail(null);
      const validated: File[] = [];

      for (let i = 0; i < newFiles.length; i++) {
        if (files.length + validated.length >= maxFiles) break;
        const file = newFiles[i];
        const res = await validateFile(file, allowedMimes, MAX_FILE_SIZE_BYTES);
        if (res.valid) {
          validated.push(file);
        } else {
          setErrorDetail(normalizeError(new Error(res.error || 'Invalid file')));
          return;
        }
      }

      setFiles((prev) => [...prev, ...validated]);
      setResults([]);
    },
    [files, maxFiles, allowedMimes]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setResults([]);
    setErrorDetail(null);
  };

  const handleStartProcessing = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(5);
    setErrorDetail(null);

    try {
      const output = await onProcess(files, (pct) => setProgress(pct));
      setResults(output);
      setProgress(100);
    } catch (err: any) {
      setErrorDetail(normalizeError(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = () => {
    results.forEach((res) => {
      downloadSingleFile(res.blob, res.name);
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Privacy Notice Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {isClientSide
              ? 'Processed locally in your browser. Your files are not uploaded to any server.'
              : 'End-to-end encrypted processing with automatic 24-hour expiration.'}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
          {isClientSide ? 'LOCAL' : 'SECURE'}
        </span>
      </div>

      {/* Upload Dropzone */}
      {files.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-10 sm:p-14 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center space-y-4 ${
            isDragging
              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-brand-400 hover:bg-slate-100/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={maxFiles > 1}
            className="hidden"
            onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
          />

          <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto shadow-sm">
            <Upload className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              Choose files or drag & drop here
            </h3>
            <p className="text-xs text-slate-500">
              Supported: {acceptLabel} • Max Size: 500 MB per file
            </p>
          </div>
        </div>
      )}

      {/* File List Selected */}
      {files.length > 0 && !results.length && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              <span>Selected Files ({files.length})</span>
            </h4>

            {files.length < maxFiles && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-brand-600 hover:underline"
              >
                + Add More
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple={maxFiles > 1}
            className="hidden"
            onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
          />

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {formatBytes(file.size)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  disabled={isProcessing}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Options Component (If provided by tool) */}
          {optionsComponent && <div className="pt-2">{optionsComponent}</div>}

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2 pt-2 animate-in fade-in">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Processing with Miftah Tools Engine...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleStartProcessing}
              disabled={isProcessing}
              className="flex-1 py-4 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Files ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start {toolName}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFiles([])}
              disabled={isProcessing}
              className="px-4 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-2xl"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorDetail && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-extrabold text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorDetail.message}</span>
          </div>
          <p className="text-[11px] text-rose-700 dark:text-rose-300 pl-6">
            {errorDetail.actionableHint}
          </p>
          <div className="pl-6 pt-1">
            <button
              type="button"
              onClick={handleStartProcessing}
              className="px-3 py-1 bg-rose-600 text-white text-[11px] font-bold rounded-lg hover:bg-rose-500 shadow-sm"
            >
              Retry Operation
            </button>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xl space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/60 pb-3">
            <div className="flex items-center gap-2 font-extrabold text-sm text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Processing Completed Successfully!</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
              {results.length} Files Ready
            </span>
          </div>

          <div className="space-y-2">
            {results.map((res, idx) => {
              const savedPct =
                res.originalSize > 0
                  ? Math.max(0, Math.round(((res.originalSize - res.newSize) / res.originalSize) * 100))
                  : 0;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between"
                >
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                      {res.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Original: {formatBytes(res.originalSize)} ➔ Output: {formatBytes(res.newSize)}{' '}
                      {savedPct > 0 && (
                        <span className="text-emerald-600 font-bold ml-1">(-{savedPct}%)</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadSingleFile(res.blob, res.name)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-2">
            {results.length > 1 && (
              <button
                type="button"
                onClick={handleDownloadAll}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download All ({results.length} Files)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setFiles([]);
                setResults([]);
                setErrorDetail(null);
              }}
              className="px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50"
            >
              Start New Job
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
