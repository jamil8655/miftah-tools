'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { initNativeAndroidBridge, syncAndroidStatusBarTheme } from '@/lib/native/android-bridge';
import { adManager } from '@/lib/ads/AdManager';
import { useTheme } from './ThemeContext';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export function NativeAndroidRuntime() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    initNativeAndroidBridge(() => {
      router.back();
    });

    // Initialize official Google Mobile Ads SDK & UMP
    adManager.initialize();

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  useEffect(() => {
    syncAndroidStatusBarTheme(theme);
  }, [theme]);

  if (isOffline) {
    return (
      <div className="bg-amber-500 text-slate-950 px-3 py-1.5 text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm sticky top-0 z-50 animate-in slide-in-from-top duration-200">
        <WifiOff className="w-3.5 h-3.5" />
        <span>Offline Mode — All 220+ Client-Side Tools remain 100% functional locally!</span>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="bg-emerald-600 text-white px-3 py-1.5 text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm sticky top-0 z-50 animate-in slide-in-from-top duration-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Back Online! Cloud Sync Restored.</span>
      </div>
    );
  }

  return null;
}
