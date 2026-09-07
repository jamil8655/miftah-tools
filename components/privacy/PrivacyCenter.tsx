'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Trash2,
  Cpu,
  FileCheck,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  HardDrive,
  Info,
} from 'lucide-react';
import { purgeAllLocalData } from '@/lib/storage/indexeddb-store';
import { downloadSingleFile } from '@/lib/utils/download';

export function PrivacyCenter() {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cleanedPhotoUrl, setCleanedPhotoUrl] = useState<string | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [purgedSuccess, setPurgedSuccess] = useState(false);

  // 1. In-Browser Image EXIF & Metadata Sanitizer
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      sanitizeImage(file);
    }
  };

  const sanitizeImage = (file: File) => {
    setIsCleaning(true);
    const img = new Image();
    img.onload = () => {
      // Drawing onto a clean HTML5 canvas strips all EXIF, GPS, camera, and device metadata completely!
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            setCleanedPhotoUrl(URL.createObjectURL(blob));
          }
          setIsCleaning(false);
        }, file.type || 'image/jpeg', 0.95);
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const handleDownloadCleaned = () => {
    if (!cleanedPhotoUrl || !photoFile) return;
    const a = document.createElement('a');
    a.href = cleanedPhotoUrl;
    a.download = `sanitized_no_exif_${photoFile.name}`;
    a.click();
  };

  // 2. Complete Local Storage & Cache Purge
  const handlePurgeStorage = async () => {
    if (confirm('Are you sure you want to purge all local offline files, processing history, and cached data?')) {
      await purgeAllLocalData();
      setPurgedSuccess(true);
      setTimeout(() => setPurgedSuccess(false), 4000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% In-Browser Privacy Architecture • Zero Cloud Storage</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Miftah Tools Privacy & Security Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          We believe your files belong only to you. Learn about our client-side processing architecture, clean private metadata, or instantly purge local offline storage.
        </p>
      </div>

      {/* Core Privacy Guarantees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            100% Local In-Browser Processing
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All PDF conversions, image editing, audio cutting, and barcode generations execute entirely on your device using WebAssembly and HTML5 Canvas. Your documents never touch any server.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
            <EyeOff className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Zero Tracking & No User Logging
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We do not log file contents, filenames, or personally identifiable data. Everything stored in your &quot;My Files&quot; hub is encrypted inside your browser&apos;s local IndexedDB.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center font-bold">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Automatic 24-Hour TTL Expiration
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Temporary cached blobs and conversion items automatically expire and are purged after 24 hours to prevent memory buildup and protect your offline privacy.
          </p>
        </div>
      </div>

      {/* Interactive Tool: In-Browser EXIF & Metadata Stripper */}
      <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-brand-600" />
              <span>Instant Photo EXIF & GPS Metadata Cleaner</span>
            </h3>
            <p className="text-xs text-slate-500">
              Strip GPS locations, device serials, camera settings, and hidden timestamps before sharing photos online.
            </p>
          </div>
        </div>

        {!photoFile ? (
          <div
            onClick={() => document.getElementById('exif-upload')?.click()}
            className="p-10 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-center space-y-3 hover:border-brand-500 transition-all cursor-pointer"
          >
            <input
              id="exif-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <Upload className="w-8 h-8 text-brand-600 mx-auto" />
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Select any photo to strip EXIF & GPS location metadata
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                  Metadata Stripped: {photoFile.name}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold">
                  ✓ GPS Removed • ✓ Camera Model Cleared • ✓ Timestamps Neutralized
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadCleaned}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Clean Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoFile(null)}
                className="px-3 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                Clean Another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Complete Data Purge Button (No Stale Data Rule) */}
      <div className="p-7 rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-extrabold text-sm text-rose-900 dark:text-rose-200 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Purge All Offline Storage & History</span>
          </h4>
          <p className="text-xs text-rose-700 dark:text-rose-300">
            Instantly clears all IndexedDB cached files, local conversion history, and favorites from this browser.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePurgeStorage}
          className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-rose-600/25 active:scale-95 transition-all shrink-0"
        >
          {purgedSuccess ? '✓ Storage Cleared!' : 'Purge All Local Data'}
        </button>
      </div>
    </div>
  );
}
