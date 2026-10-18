'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { adConfig } from '@/config/ads';
import { adManager } from '@/lib/ads/AdManager';
import { useI18n } from '@/lib/i18n/i18n-context';

interface AdSlotProps {
  placement?: 'header' | 'in-feed' | 'tool-bottom' | 'result-page';
  className?: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical' | 'fluid';
  slotId?: string;
}

export function AdSlot({
  placement = 'tool-bottom',
  className = '',
  format = 'auto',
  slotId,
}: AdSlotProps) {
  const pathname = usePathname();
  const { language } = useI18n();
  const adRef = useRef<HTMLModElement | null>(null);
  const [adFailed, setAdFailed] = useState(false);
  const isSafeRoute = adManager.isRouteAdSafe(pathname);
  const isNative = adManager.isNativeEnvironment();

  // Determine slot ID for AdSense web placements
  const effectiveSlot =
    slotId ||
    (placement === 'header'
      ? adConfig.adsense.slots.headerBanner
      : placement === 'in-feed'
      ? adConfig.adsense.slots.inFeedCard
      : placement === 'result-page'
      ? adConfig.adsense.slots.resultPage
      : adConfig.adsense.slots.toolBottom);

  useEffect(() => {
    if (!adConfig.enabled || !isSafeRoute || isNative || !adConfig.adsense.client || !effectiveSlot) {
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      }
    } catch (e) {
      console.warn('[AdSense] Slot push failed or blocked:', e);
      setAdFailed(true);
    }
  }, [pathname, isSafeRoute, effectiveSlot, isNative]);

  // If ads are explicitly disabled or the route is safety-restricted, do not render
  if (!adConfig.enabled || !isSafeRoute) {
    return null;
  }

  // 1. WEB ADSENSE RENDER (When on web and AdSense hasn't failed)
  if (!isNative && !adFailed && adConfig.adsense.client && effectiveSlot) {
    return (
      <div
        className={`relative w-full overflow-hidden text-center transition-all duration-300 ${className}`}
        aria-label="Advertisement"
      >
        <div className="flex justify-center my-2">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '60px' }}
            data-ad-client={adConfig.adsense.client}
            data-ad-slot={effectiveSlot}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  // 2. NATIVE IN-APP & FALLBACK SPONSORED AD UNITS
  // Rendered inside the Android APK (and on web as fallback) so that Home, All Tools, Tool Bottom & Result slots are NEVER empty.
  const isUrdu = language === 'ur';
  const isArabic = language === 'ar';
  const isHindi = language === 'hi';

  const badgeText = isUrdu ? 'اشتہار' : isArabic ? 'إعلان' : isHindi ? 'विज्ञापन' : 'Ad';
  const sponsoredLabel = isUrdu ? 'اسپانسرڈ' : isArabic ? 'برعاية' : isHindi ? 'प्रायोजित' : 'Sponsored';

  if (placement === 'tool-bottom') {
    return (
      <div className={`w-full my-3 px-1 ${className}`}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 dark:from-slate-900/90 dark:via-indigo-950/30 dark:to-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-3 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="shrink-0 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                {badgeText}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                  {isUrdu ? 'مفتاح ٹولز • کلاؤڈ اسٹوڈیو' : isHindi ? 'मिफ़्ताह टूल्स • क्लाउड स्टूडियो' : 'Miftah Tools Cloud Studio'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {isUrdu ? 'ہائی کوالٹی پی ڈی ایف اور میڈیا پراسیسنگ بغیر کسی حد کے' : isHindi ? 'असीमित उच्च-गति पीडीएफ और मीडिया प्रोसेसिंग' : 'Fast, secure & unlimited document processing'}
                </div>
              </div>
            </div>

            <Link
              href="/tools"
              className="shrink-0 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>{isUrdu ? 'دیکھیں' : isHindi ? 'देखें' : 'Explore'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (placement === 'result-page') {
    return (
      <div className={`w-full my-2 ${className}`}>
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              {badgeText}
            </span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {sponsoredLabel} • Miftah AI
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isUrdu
              ? 'اگلا کام: وائس ٹو ٹیکسٹ، بیک گراؤنڈ ریموور یا او سی آر آزمائیں!'
              : isHindi
              ? 'अगला काम: वॉइस टू टेक्स्ट, बैकग्राउंड रिमूवर या ओसीआर आज़माएं!'
              : 'Try our Next-Gen AI tools: Background Remover, OCR & Live Voice!'}
          </p>
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>{isUrdu ? 'تمام ٹولز براؤز کریں' : isHindi ? 'सभी टूल्स देखें' : 'Browse All 70+ Tools'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  // Default In-Feed Card (Home page & All Tools feed)
  return (
    <div className={`w-full my-4 ${className}`}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-50 via-brand-50/30 to-indigo-50/30 dark:from-slate-900/80 dark:via-brand-950/20 dark:to-indigo-950/30 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              {badgeText}
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              {sponsoredLabel}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Miftah Studio</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            {isUrdu
              ? 'مفتاح کلاؤڈ ٹولز • تیز رفتار اور مفت'
              : isHindi
              ? 'मिफ़्ताह क्लाउड टूल्स • सुपरफास्ट व मुफ़्त'
              : 'Miftah Cloud AI Tools • Superfast & Free'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {isUrdu
              ? 'پی ڈی ایف، تصاویر اور آڈیو فائلوں کی ایچ ڈی کنورژن، کمپریشن اور جدید اے آئی ٹولز آسانی کے ساتھ استعمال کریں۔'
              : isHindi
              ? 'पीडीएफ, इमेज और ऑडियो फाइलों का एचडी रूपांतरण, कम्प्रेशन और नए एआई टूल्स आसानी से उपयोग करें।'
              : 'High-speed conversion, compression, OCR, and AI image processing with 100% privacy and zero file storage.'}
          </p>
        </div>

        <div className="pt-3 flex items-center justify-end">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
          >
            <span>{isUrdu ? 'ابھی آزمائیں' : isHindi ? 'अभी आज़माएं' : 'Explore Now'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
