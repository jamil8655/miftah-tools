'use client';

import React, { useState, useRef } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  EyeOff,
  Upload,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Key,
  RefreshCw,
} from 'lucide-react';
import { protectPdfWithPassword, unlockPdf } from '@/lib/pdf/pdf-encryptor';
import { downloadSingleFile, shareDownloadedFile } from '@/lib/utils/download';
import { shareFileNative } from '@/lib/native/android-bridge';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { formatBytes } from '@/lib/utils/formatters';

interface PdfProtectStudioProps {
  mode?: 'protect' | 'unlock';
}

export function PdfProtectStudio({ mode = 'protect' }: PdfProtectStudioProps) {
  const [activeMode, setActiveMode] = useState<'protect' | 'unlock'>(mode);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processedResult, setProcessedResult] = useState<{
    name: string;
    blob: Blob;
    originalSize: number;
    processedSize: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        setErrorMsg('Please select a valid PDF document.');
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
      setProcessedResult(null);
      triggerHaptic('selection');
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a PDF file first.');
      return;
    }

    if (activeMode === 'protect') {
      if (!password || password.length < 1) {
        setErrorMsg('Please enter a password to protect the PDF.');
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify your password.');
        return;
      }
    }

    setIsProcessing(true);
    setErrorMsg(null);
    triggerHaptic('light');

    try {
      const buffer = await selectedFile.arrayBuffer();

      if (activeMode === 'protect') {
        const encryptedBytes = await protectPdfWithPassword(buffer, password);
        const blob = new Blob([encryptedBytes as any], { type: 'application/pdf' });
        const outName = `protected-${selectedFile.name}`;

        setProcessedResult({
          name: outName,
          blob,
          originalSize: selectedFile.size,
          processedSize: blob.size,
        });
      } else {
        const decryptedBytes = await unlockPdf(buffer, password);
        const blob = new Blob([decryptedBytes as any], { type: 'application/pdf' });
        const outName = `unlocked-${selectedFile.name}`;

        setProcessedResult({
          name: outName,
          blob,
          originalSize: selectedFile.size,
          processedSize: blob.size,
        });
      }

      triggerHaptic('success');
    } catch (err: any) {
      console.error('PDF protection error:', err);
      setErrorMsg(err?.message || 'Failed to process PDF. Please check the file and try again.');
      triggerHaptic('medium');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!processedResult) return;
    triggerHaptic('selection');
    await downloadSingleFile(processedResult.blob, processedResult.name);
  };

  const handleShare = async () => {
    if (!processedResult) return;
    triggerHaptic('selection');
    await shareDownloadedFile({
      name: processedResult.name,
      blob: processedResult.blob,
      mimeType: 'application/pdf',
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => {
            setActiveMode('protect');
            setProcessedResult(null);
            setErrorMsg(null);
          }}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
            activeMode === 'protect'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Encrypt & Protect PDF</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveMode('unlock');
            setProcessedResult(null);
            setErrorMsg(null);
          }}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
            activeMode === 'unlock'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Unlock className="w-4 h-4" />
          <span>Unlock & Remove Password</span>
        </button>
      </div>

      {/* Main Workspace Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
        {/* File Picker Section */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            1. Select PDF File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition-all group"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                Tap to select PDF from device
              </p>
              <p className="text-xs text-slate-400">Supported format: .pdf</p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-400">{formatBytes(selectedFile.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Password Inputs */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            2. {activeMode === 'protect' ? 'Set Document Password' : 'Enter Current Password (If required)'}
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Key className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={activeMode === 'protect' ? 'Enter strong password...' : 'Enter unlock password...'}
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {activeMode === 'protect' && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={handleProcess}
          disabled={isProcessing || !selectedFile}
          className={`w-full py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 text-white shadow-md transition-all active:scale-[0.98] ${
            activeMode === 'protect'
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25 disabled:bg-slate-400'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25 disabled:bg-slate-400'
          }`}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{activeMode === 'protect' ? 'Encrypting PDF...' : 'Unlocking PDF...'}</span>
            </>
          ) : (
            <>
              {activeMode === 'protect' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              <span>{activeMode === 'protect' ? 'Encrypt & Protect PDF' : 'Unlock & Save PDF'}</span>
            </>
          )}
        </button>

        {/* Success Result State */}
        {processedResult && (
          <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
                  {activeMode === 'protect' ? 'PDF Successfully Protected!' : 'PDF Successfully Unlocked!'}
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  {activeMode === 'protect'
                    ? 'The output PDF is 100% password-encrypted and will require your password to view.'
                    : 'The output PDF is now decrypted and unlocked.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Save to Device / Download</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="py-3.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
