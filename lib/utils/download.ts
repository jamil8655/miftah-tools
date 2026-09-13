'use client';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface SavedFileInfo {
  name: string;
  size: number;
  blob?: Blob;
  dataUrl?: string;
  mimeType: string;
  savedPath: string;
  timestamp: number;
}

let lastDownloadedFile: SavedFileInfo | null = null;

export function getLastDownloadedFile(): SavedFileInfo | null {
  return lastDownloadedFile;
}

/**
 * Convert a Blob to Base64 string for native file saving
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      if (!res) {
        resolve('');
        return;
      }
      const base64 = res.includes(',') ? res.split(',')[1] : res;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Open a saved file in device native viewer or browser preview
 */
export async function openDownloadedFile(fileInfo: { name: string; mimeType?: string; blob?: Blob }): Promise<boolean> {
  const mime = fileInfo.mimeType || (fileInfo.blob?.type) || 'application/octet-stream';
  
  // 1. Try Android Native System Viewer Intent with base64 cache guarantee
  if (typeof window !== 'undefined' && (window as any).AndroidDownloader) {
    try {
      if (fileInfo.blob && (window as any).AndroidDownloader.openBase64FileInSystem) {
        const base64 = await blobToBase64(fileInfo.blob);
        const success = (window as any).AndroidDownloader.openBase64FileInSystem(base64, fileInfo.name, mime);
        if (success) return true;
      } else if ((window as any).AndroidDownloader.openFileInSystem) {
        const success = (window as any).AndroidDownloader.openFileInSystem(fileInfo.name, mime);
        if (success) return true;
      }
    } catch (e) {
      console.warn('Android native open failed:', e);
    }
  }

  // 2. Web fallback: open blob URL in new window/tab
  if (fileInfo.blob) {
    try {
      const url = URL.createObjectURL(fileInfo.blob);
      const w = window.open(url, '_blank');
      if (!w) {
        window.location.href = url;
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return true;
    } catch (e) {
      console.error('Failed to open blob in window:', e);
    }
  }
  return false;
}

/**
 * Share a downloaded / processed file natively via Android system sharesheet or Web Share API
 */
export async function shareDownloadedFile(fileInfo: {
  name: string;
  mimeType?: string;
  blob?: Blob;
  dataUrl?: string;
}): Promise<boolean> {
  const mime = fileInfo.mimeType || fileInfo.blob?.type || 'application/octet-stream';

  // 1. Android Native Downloader custom interface
  if (
    typeof window !== 'undefined' &&
    (window as any).AndroidDownloader?.shareBase64FileInSystem &&
    (fileInfo.blob || fileInfo.dataUrl)
  ) {
    try {
      const base64 = fileInfo.dataUrl
        ? fileInfo.dataUrl.includes(',')
          ? fileInfo.dataUrl.split(',')[1]
          : fileInfo.dataUrl
        : await blobToBase64(fileInfo.blob!);
      const success = (window as any).AndroidDownloader.shareBase64FileInSystem(base64, fileInfo.name, mime);
      if (success) return true;
    } catch (e) {
      console.warn('Native AndroidDownloader share failed:', e);
    }
  }

  // 2. Capacitor Filesystem + Share Plugin (Native Android 10-16 Sharesheet with content:// URI)
  if (Capacitor.isNativePlatform() && (fileInfo.blob || fileInfo.dataUrl)) {
    try {
      const base64 = fileInfo.dataUrl
        ? fileInfo.dataUrl.includes(',')
          ? fileInfo.dataUrl.split(',')[1]
          : fileInfo.dataUrl
        : await blobToBase64(fileInfo.blob!);

      // Save to Cache directory so Android FileProvider can share it
      const saved = await Filesystem.writeFile({
        path: fileInfo.name,
        data: base64,
        directory: Directory.Cache,
        recursive: true,
      });

      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: fileInfo.name,
        text: `Sharing ${fileInfo.name} from Miftah Tools`,
        url: saved.uri,
        dialogTitle: `Share ${fileInfo.name}`,
      });
      return true;
    } catch (err) {
      console.warn('Capacitor Share plugin failed:', err);
    }
  }

  // 3. Web Navigator Share API (supports file sharing in mobile Chrome, Safari, Edge)
  if (fileInfo.blob && typeof navigator !== 'undefined' && navigator.share) {
    try {
      const file = new File([fileInfo.blob], fileInfo.name, { type: mime });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: fileInfo.name,
          text: `Processed ${fileInfo.name} with Miftah Tools`,
        });
        return true;
      }
    } catch (e) {
      // User cancelled share
      return true;
    }
  }

  // 4. Web Fallback: download the file directly if share is unavailable
  if (fileInfo.blob) {
    await downloadSingleFile(fileInfo.blob, fileInfo.name);
    return true;
  }

  return false;
}


/**
 * Direct File Downloader for Android & Web
 * Directly saves to device Public Downloads folder without showing any share sheet.
 * Triggers in-app confirmation modal.
 */
export async function downloadSingleFile(blob: Blob, filename: string): Promise<SavedFileInfo | null> {
  if (!blob || blob.size === 0) {
    console.warn('Attempted to download empty or invalid file:', filename);
    return null;
  }

  const effectiveMime = blob.type || 'application/octet-stream';
  let savedPath = `Downloads/${filename}`;
  let saveSuccess = false;

  // 1. Android Native: Direct MediaStore Download to Public "Downloads" folder
  if (typeof window !== 'undefined' && (window as any).AndroidDownloader) {
    try {
      const base64 = await blobToBase64(blob);
      saveSuccess = (window as any).AndroidDownloader.saveBase64File(base64, filename, effectiveMime);
      savedPath = `Internal Storage > Downloads > ${filename}`;
    } catch (e) {
      console.warn('AndroidDownloader interface warning:', e);
    }
  }

  // 2. Capacitor Filesystem Direct Write to Documents / External Storage
  if (!saveSuccess && Capacitor.isNativePlatform()) {
    try {
      const base64 = await blobToBase64(blob);
      await Filesystem.writeFile({
        path: `Download/${filename}`,
        data: base64,
        directory: Directory.ExternalStorage,
        recursive: true,
      });
      savedPath = `Device Storage > Downloads > ${filename}`;
      saveSuccess = true;
    } catch (fsErr) {
      try {
        await Filesystem.writeFile({
          path: filename,
          data: await blobToBase64(blob),
          directory: Directory.Documents,
          recursive: true,
        });
        savedPath = `Documents > ${filename}`;
        saveSuccess = true;
      } catch (docErr) {
        console.warn('Capacitor direct write warning:', docErr);
      }
    }
  }

  // 3. Web & WebView Blob Anchor Fallback
  if (!saveSuccess) {
    try {
      saveAs(blob, filename);
      savedPath = `Browser Downloads > ${filename}`;
      saveSuccess = true;
    } catch (e) {
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        savedPath = `Downloads > ${filename}`;
        saveSuccess = true;
      } catch (err) {
        console.error('Download anchor failed:', err);
      }
    }
  }

  const fileInfo: SavedFileInfo = {
    name: filename,
    size: blob.size,
    blob,
    mimeType: effectiveMime,
    savedPath,
    timestamp: Date.now(),
  };

  lastDownloadedFile = fileInfo;

  // Dispatch global event for in-app real-time notification
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('miftah:file-downloaded', { detail: fileInfo }));
  }

  return fileInfo;
}

/**
 * Download multiple files packed into a single zip archive
 */
export async function downloadAsZip(
  files: { name: string; blob: Blob }[],
  zipFilename: string = 'miftah-processed-files.zip'
): Promise<SavedFileInfo | null> {
  if (!files || files.length === 0) return null;

  const zip = new JSZip();
  files.forEach((file) => {
    if (file.blob && file.blob.size > 0) {
      zip.file(file.name, file.blob);
    }
  });

  const content = await zip.generateAsync({ type: 'blob' });
  return await downloadSingleFile(content, zipFilename);
}
