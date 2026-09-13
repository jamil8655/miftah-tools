'use client';

import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Network } from '@capacitor/network';

export const isNativeAndroid = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

/**
 * Initialize Native Android Runtime (Splash, StatusBar, Hardware Back Button)
 */
export const initNativeAndroidBridge = (routerBack?: () => void) => {
  if (!Capacitor.isNativePlatform()) return;

  // 1. Hide Splash Screen cleanly after app hydrates
  try {
    SplashScreen.hide();
  } catch (e) {}

  // 2. Setup Status Bar
  try {
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setBackgroundColor({ color: '#020617' });
  } catch (e) {}

  // 3. Android Hardware Back Button Listener
  try {
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        CapApp.exitApp();
      } else if (canGoBack && routerBack) {
        routerBack();
      } else if (routerBack) {
        routerBack();
      } else {
        CapApp.exitApp();
      }
    });
  } catch (e) {}
};

/**
 * Update Android Status Bar to match Theme
 */
export const syncAndroidStatusBarTheme = (theme: 'light' | 'dark' | 'system') => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light,
    });
    StatusBar.setBackgroundColor({
      color: isDark ? '#020617' : '#FFFFFF',
    });
  } catch (e) {}
};

/**
 * Native Android System Share Sheet & File Opener
 */
export const shareFileNative = async (
  title: string,
  text: string,
  urlOrFilePath?: string
): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: urlOrFilePath });
        return true;
      } catch (e) {
        return false;
      }
    }
    // Fallback: Copy link to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard && urlOrFilePath) {
      try {
        await navigator.clipboard.writeText(`${title}\n${text}\n${urlOrFilePath}`);
        alert('Link copied to clipboard!');
        return true;
      } catch (e) {}
    }
    return false;
  }

  try {
    await Share.share({
      title,
      text,
      url: urlOrFilePath,
      dialogTitle: `Share / Open ${title}`,
    });
    return true;
  } catch (e) {
    console.warn('Native share notice:', e);
    return false;
  }
};

/**
 * Universal Share App Trigger with localized copy
 */
export const shareAppNative = async (lang: 'en' | 'ur' | 'ar' | 'hi' = 'en'): Promise<boolean> => {
  const shareData = {
    en: {
      title: 'Miftah Tools - 220+ Free Offline Tools & Master Courses',
      text: 'Transform PDFs, compress images, edit media, and learn digital skills with Miftah Tools! 100% private and client-side.',
      url: 'https://miftahtools.com/',
    },
    ur: {
      title: 'مفتاح ٹولز - 220+ مفت اور پرائیویٹ ٹولز',
      text: 'مفتاح ٹولز استعمال کریں! 220 سے زائد پی ڈی ایف، امیج اور دستاویزات کے ٹولز بغیر کسی سرور اپلوڈ کے 100% محفوظ اور تیز رفتار۔',
      url: 'https://miftahtools.com/',
    },
    ar: {
      title: 'مفتاح تولز - أكثر من 220 أداة مجانية وآمنة للملفات',
      text: 'جرّب تطبيق مفتاح تولز! أكثر من 220 أداة احترافية للتعامل مع ملفات PDF والصور والوسائط بخصوصية تامة 100% على جهازك.',
      url: 'https://miftahtools.com/',
    },
    hi: {
      title: 'मिफ्ताह टूल्स - 220+ मुफ़्त व सुरक्षित डिजिटल टूल्स',
      text: 'मिफ्ताह टूल्स आज़माएं! 220+ मुफ़्त PDF, इमेज, ऑडियो, वीडियो और डेवलपर टूल्स 100% सुरक्षित और ऑन-डिवाइस।',
      url: 'https://miftahtools.com/',
    },
  };

  const current = shareData[lang] || shareData.en;
  return shareFileNative(current.title, current.text, current.url);
};

/**
 * Save Processed File to Android Device Cache / Storage with 100% FileProvider accessibility
 */
export const saveFileToDeviceStorage = async (
  fileOrName: string | Blob,
  base64OrName?: string
): Promise<{ success: boolean; uri?: string; error?: string }> => {
  let fileName = typeof fileOrName === 'string' ? fileOrName : base64OrName || 'downloaded-file';
  let base64Data = typeof base64OrName === 'string' && typeof fileOrName === 'string' ? base64OrName : '';

  if (fileOrName instanceof Blob) {
    const reader = new FileReader();
    base64Data = await new Promise((resolve) => {
      reader.onloadend = () => {
        const res = reader.result as string;
        resolve(res.includes(',') ? res.split(',')[1] : res);
      };
      reader.readAsDataURL(fileOrName);
    });
  }

  if (!Capacitor.isNativePlatform()) {
    return { success: true };
  }

  try {
    // 1. Write to Cache Directory (Always permitted on all Android 10-16 versions)
    const savedCache = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
      recursive: true,
    });

    return { success: true, uri: savedCache.uri };
  } catch (e: any) {
    try {
      // 2. Fallback to Documents directory
      const savedDoc = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });
      return { success: true, uri: savedDoc.uri };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Storage write failed' };
    }
  }
};

/**
 * Native Camera Capture for Passport Photo / Document Scanner
 */
export const captureCameraPhotoNative = async (): Promise<{ success: boolean; dataUrl?: string; error?: string }> => {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, error: 'Web environment' };
  }

  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 90,
      allowEditing: false,
    });

    return { success: true, dataUrl: photo.dataUrl };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Camera cancelled or permission denied' };
  }
};

/**
 * Network Connectivity Check
 */
export const checkNetworkStatusNative = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  try {
    const status = await Network.getStatus();
    return status.connected;
  } catch (e) {
    return true;
  }
};
