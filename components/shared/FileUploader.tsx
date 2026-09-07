'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  File,
  X,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  FolderArchive,
  Image as ImageIcon,
} from 'lucide-react';
import { formatBytes, formatBytesDual } from '@/lib/utils/formatters';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';

interface FileUploaderProps {
  acceptedExtensions: string[];
  acceptedMimeTypes: string[];
  maxFiles: number;
  maxFileSizeMB: number;
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile?: (index: number) => void;
  disabled?: boolean;
}

const UPLOADER_LOCALES = {
  en: {
    maxFilesError: (max: number) => `You can upload a maximum of ${max} files at once.`,
    fileSizeError: (name: string, max: number) => `File "${name}" exceeds the limit of ${max} MB.`,
    formatError: (ext: string, allowed: string) => `Unsupported file format "${ext}". Allowed: ${allowed}`,
    dropActive: 'Drop file to select',
    dropIdle: 'Select or drop files',
    browsePrompt: 'Browse from your device',
    chooseBtn: 'Choose Files',
    formatsLabel: 'Formats:',
    maxSizeLabel: 'Max:',
    limitLabel: 'Limit:',
    filesCount: 'files',
    selectedHeader: (count: number, max: number) => `Selected (${count}${max > 1 ? ` / ${max}` : ''})`,
    clearAll: 'Clear all',
    removeFile: 'Remove file',
  },
  ur: {
    maxFilesError: (max: number) => `آپ ایک وقت میں زیادہ سے زیادہ ${max} فائلیں اپلوڈ کر سکتے ہیں۔`,
    fileSizeError: (name: string, max: number) => `فائل "${name}" کی حد ${max} ایم بی سے زیادہ ہے۔`,
    formatError: (ext: string, allowed: string) => `غیر تعاون یافتہ فائل فارمیٹ "${ext}"۔ اجازت یافتہ: ${allowed}`,
    dropActive: 'فائل چھوڑ کر منتخب کریں',
    dropIdle: 'فائلیں منتخب کریں یا یہاں ڈراپ کریں',
    browsePrompt: 'اپنے ڈیوائس سے فائل منتخب کریں',
    chooseBtn: 'فائلیں منتخب کریں',
    formatsLabel: 'فارمیٹس:',
    maxSizeLabel: 'زیادہ سے زیادہ سائز:',
    limitLabel: 'حد:',
    filesCount: 'فائلیں',
    selectedHeader: (count: number, max: number) => `منتخب کردہ (${count}${max > 1 ? ` / ${max}` : ''})`,
    clearAll: 'تمام ختم کریں',
    removeFile: 'فائل ہٹائیں',
  },
  ar: {
    maxFilesError: (max: number) => `يمكنك تحميل ما يصل إلى ${max} ملفات في المرة الواحدة.`,
    fileSizeError: (name: string, max: number) => `الملف "${name}" يتجاوز الحد الأقصى المسموح به (${max} ميجابايت).`,
    formatError: (ext: string, allowed: string) => `صيغة الملف "${ext}" غير مدعومة. المسموح به: ${allowed}`,
    dropActive: 'أفلت الملف للاختيار',
    dropIdle: 'حدد الملفات أو اسحبها هنا',
    browsePrompt: 'تصفح الملفات من جهازك',
    chooseBtn: 'اختيار الملفات',
    formatsLabel: 'الصيغ:',
    maxSizeLabel: 'الحد الأقصى:',
    limitLabel: 'العدد:',
    filesCount: 'ملفات',
    selectedHeader: (count: number, max: number) => `المحدد (${count}${max > 1 ? ` / ${max}` : ''})`,
    clearAll: 'مسح الكل',
    removeFile: 'إزالة الملف',
  },
  hi: {
    maxFilesError: (max: number) => `आप एक बार में अधिकतम ${max} फ़ाइलें अपलोड कर सकते हैं।`,
    fileSizeError: (name: string, max: number) => `फ़ाइल "${name}" की सीमा ${max} MB से अधिक है।`,
    formatError: (ext: string, allowed: string) => `असमर्थित फ़ाइल प्रारूप "${ext}"। अनुमत: ${allowed}`,
    dropActive: 'फ़ाइल चुनने के लिए छोड़ें',
    dropIdle: 'फ़ाइलें चुनें या यहां छोड़ें',
    browsePrompt: 'अपने डिवाइस से फ़ाइल चुनें',
    chooseBtn: 'फ़ाइलें चुनें',
    formatsLabel: 'फॉर्मेट्स:',
    maxSizeLabel: 'अधिकतम:',
    limitLabel: 'सीमा:',
    filesCount: 'फ़ाइलें',
    selectedHeader: (count: number, max: number) => `चयनित (${count}${max > 1 ? ` / ${max}` : ''})`,
    clearAll: 'सभी हटाएं',
    removeFile: 'फ़ाइल हटाएं',
  },
};

export function FileUploader({
  acceptedExtensions,
  acceptedMimeTypes,
  maxFiles,
  maxFileSizeMB,
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  disabled = false,
}: FileUploaderProps) {
  const { language, isRTL } = useI18n();
  const loc = UPLOADER_LOCALES[language] || UPLOADER_LOCALES.en;
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: File[] = [];
    const filesArray = Array.from(fileList);

    if (selectedFiles.length + filesArray.length > maxFiles && maxFiles > 1) {
      setErrorMessage(loc.maxFilesError(maxFiles));
      return;
    }

    for (const file of filesArray) {
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        setErrorMessage(loc.fileSizeError(file.name, maxFileSizeMB));
        continue;
      }

      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const hasValidExt =
        acceptedExtensions.length === 0 ||
        acceptedExtensions.some((e) => e.toLowerCase() === ext);
      const hasValidMime =
        acceptedMimeTypes.length === 0 ||
        acceptedMimeTypes.some((m) => file.type.startsWith(m.replace('/*', '')));

      if (acceptedExtensions.length > 0 && !hasValidExt && !hasValidMime) {
        setErrorMessage(loc.formatError(ext, acceptedExtensions.join(', ')));
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      triggerHaptic('light');
      if (maxFiles === 1) {
        onFilesSelected([validFiles[0]]);
      } else {
        onFilesSelected([...selectedFiles, ...validFiles]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        validateAndAddFiles(e.clipboardData.files);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [selectedFiles, maxFiles]);

  // Helper to render genuine, recognizable file icons
  const renderFileIcon = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (file.type.startsWith('image/')) {
      return (
        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 overflow-hidden">
          <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
      );
    }

    if (ext === 'pdf' || file.type === 'application/pdf') {
      return (
        <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
      );
    }

    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return (
        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
      );
    }

    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return (
        <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0">
          <FolderArchive className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
      );
    }

    return (
      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
        <File className="w-4 h-4 text-slate-500 dark:text-slate-400" />
      </div>
    );
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full space-y-4"
    >
      {/* Upload Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative rounded-3xl p-6 sm:p-10 text-center transition-all duration-200 cursor-pointer select-none border-2 border-dashed ${
          isDragging
            ? 'border-brand-500 bg-brand-500/10 scale-[1.01] shadow-xl shadow-brand-500/10'
            : 'border-slate-300 dark:border-slate-700/80 hover:border-brand-400 dark:hover:border-brand-500/60 bg-slate-50/80 dark:bg-slate-900/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedExtensions.join(',') || acceptedMimeTypes.join(',')}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              validateAndAddFiles(e.target.files);
              e.target.value = '';
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center justify-center shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div className="space-y-0.5 max-w-sm">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              {isDragging ? loc.dropActive : loc.dropIdle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {loc.browsePrompt}
            </p>
          </div>

          <button
            type="button"
            disabled={disabled}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all inline-flex items-center gap-2 select-none"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{loc.chooseBtn}</span>
          </button>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 pt-1 font-medium">
            {acceptedExtensions.length > 0 && (
              <span>{loc.formatsLabel} {acceptedExtensions.join(', ').toUpperCase()}</span>
            )}
            <span>•</span>
            <span>{loc.maxSizeLabel} {maxFileSizeMB} MB</span>
            {maxFiles > 1 && (
              <>
                <span>•</span>
                <span>{loc.limitLabel} {maxFiles} {loc.filesCount}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected Files Queue */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>
              {loc.selectedHeader(selectedFiles.length, maxFiles)}
            </span>
            {onRemoveFile && selectedFiles.length > 1 && (
              <button
                type="button"
                onClick={() => onFilesSelected([])}
                className="text-rose-500 hover:text-rose-600 text-xs font-semibold"
              >
                {loc.clearAll}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {renderFileIcon(file)}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[180px] sm:max-w-[220px]">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-semibold">
                      {formatBytesDual(file.size)}
                    </p>
                  </div>
                </div>

                {onRemoveFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(idx);
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={loc.removeFile}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
