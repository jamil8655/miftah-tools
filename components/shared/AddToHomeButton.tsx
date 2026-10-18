'use client';

import React, { useState } from 'react';
import { Smartphone, Check, ExternalLink, Copy, X, Sparkles, Plus, Share2 } from 'lucide-react';
import { TOOLS_LIST } from '@/lib/tools-config';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { useI18n } from '@/lib/i18n/i18n-context';
import { getLocalizedTool } from '@/lib/i18n/catalog-translations';
import {
  isNativeAndroid,
  createNativeHomeScreenShortcut,
  showNativeNotification,
} from '@/lib/native/android-bridge';
import { generateToolShortcutIcon } from '@/lib/utils/shortcut-icon';

export interface AddToHomeButtonProps {
  toolId: string;
  toolName?: string;
  category?: string;
  icon?: string;
  className?: string;
  variant?: 'icon' | 'pill' | 'button' | 'badge' | 'banner';
  size?: 'sm' | 'md' | 'lg';
  directNavigate?: boolean;
  showLabel?: boolean;
}

const LOCALES = {
  en: {
    btnTitle: 'Add to Phone Screen',
    btnShort: 'Phone Screen',
    addedSuccess: 'Added to Phone Screen!',
    toastSuccess: 'Shortcut added to your mobile home screen! You can now launch this tool directly from your phone.',
    modalTitle: 'Add Shortcut to Phone Screen',
    modalDesc: (name: string) =>
      `Access ${name} directly from your phone's desktop or home screen with 1 tap.`,
    androidStep: '1. In Chrome, tap ⋮ (Top Right Menu) and select "Add to Home screen"',
    iosStep: '2. In Safari, tap the Share button ⎋ and select "Add to Home Screen"',
    copyLink: 'Copy Tool Direct Link',
    copied: 'Link Copied!',
    close: 'Close',
  },
  ur: {
    btnTitle: 'موبائل اسکرین پر شامل کریں',
    btnShort: 'موبائل اسکرین',
    addedSuccess: 'فون اسکرین پر شامل ہو گیا!',
    toastSuccess: 'شارٹ کٹ آپ کے موبائل کی ہوم اسکرین پر شامل کر دیا گیا ہے! اب آپ اسے براہ راست اپنے فون کی اسکرین سے کھول سکتے ہیں۔',
    modalTitle: 'موبائل ہوم اسکرین پر شارٹ کٹ بنائیں',
    modalDesc: (name: string) =>
      `اب آپ ${name} کو براہ راست اپنے موبائل کے ڈیسک ٹاپ سے ایک کلک میں کھول سکتے ہیں۔`,
    androidStep: '1. کروم میں اوپر تین نقطوں (⋮) پر کلک کر کے "Add to Home screen" پر کلک کریں۔',
    iosStep: '2. سفاری میں شیئر بٹن ⎋ پر کلک کر کے "Add to Home Screen" منتخب کریں۔',
    copyLink: 'ٹول کا براہ راست لنک کاپی کریں',
    copied: 'لنک کاپی ہو گیا!',
    close: 'بند کریں',
  },
  ar: {
    btnTitle: 'إضافة لشاشة الهاتف',
    btnShort: 'شاشة الهاتف',
    addedSuccess: 'تمت الإضافة لشاشة الهاتف!',
    toastSuccess: 'تمت إضافة اختصار التطبيق إلى شاشة هاتفك الرئيسية! يمكنك الآن فتح هذه الأداة بضغطة واحدة من الشاشة مباشرة.',
    modalTitle: 'إضافة اختصار لشاشة الهاتف الرئيسية',
    modalDesc: (name: string) =>
      `افتح ${name} مباشرة من شاشة هاتفك الرئيسية بضغطة واحدة.`,
    androidStep: '1. في كروم، اضغط على القائمة (⋮) ثم اختر "إضافة إلى الشاشة الرئيسية"',
    iosStep: '2. في سفاري، اضغط على زر المشاركة ⎋ ثم اختر "إضافة إلى الشاشة الرئيسية"',
    copyLink: 'نسخ رابط الأداة المباشر',
    copied: 'تم النسخ!',
    close: 'إغلاق',
  },
  hi: {
    btnTitle: 'फ़ोन स्क्रीन पर जोड़ें',
    btnShort: 'फ़ोन स्क्रीन',
    addedSuccess: 'फ़ोन स्क्रीन पर जुड़ गया!',
    toastSuccess: 'शॉर्टकट आपके मोबाइल की होम स्क्रीन पर जोड़ दिया गया है! अब आप सीधे मोबाइल स्क्रीन से इसे खोल सकते हैं।',
    modalTitle: 'फ़ोन की होम स्क्रीन पर शॉर्टकट बनाएं',
    modalDesc: (name: string) =>
      `${name} को अपने मोबाइल के डेस्कटॉप / होम स्क्रीन पर जोड़ें ताकि सीधे 1-क्लिक में खुल सके।`,
    androidStep: '1. Chrome ब्राउज़र में ऊपर 3 डॉट्स (⋮) दबाएं और "Add to Home screen" चुनें।',
    iosStep: '2. Safari में शेयर बटन ⎋ दबाएं और "Add to Home Screen" चुनें।',
    copyLink: 'टूल का डायरेक्ट लिंक कॉपी करें',
    copied: 'लिंक कॉपी हो गया!',
    close: 'बंद करें',
  },
};

export function AddToHomeButton({
  toolId,
  toolName,
  category,
  className = '',
  variant = 'pill',
  size = 'md',
}: AddToHomeButtonProps) {
  const { language } = useI18n();
  const [justAdded, setJustAdded] = useState(false);
  const [showWebModal, setShowWebModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const loc = LOCALES[language as keyof typeof LOCALES] || LOCALES.en;

  // Resolve tool details
  const tool = TOOLS_LIST.find((t) => t.id === toolId || t.slug === toolId);
  const localized = tool ? getLocalizedTool(tool, language) : null;
  const resolvedName = toolName || localized?.name || tool?.name || toolId;
  const resolvedCategory = category || tool?.category || 'utility';
  const targetRoute = `/tools/${tool?.slug || toolId}`;

  const handleAddToPhoneScreen = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    triggerHaptic('success');

    // 1. Android Native App Environment
    if (isNativeAndroid()) {
      try {
        const iconBase64 = generateToolShortcutIcon(toolId, resolvedName, resolvedCategory);
        const success = await createNativeHomeScreenShortcut(
          toolId,
          resolvedName,
          targetRoute,
          iconBase64
        );

        if (success) {
          setJustAdded(true);
          setTimeout(() => setJustAdded(false), 3500);

          // Dispatch visual notification
          showNativeNotification(
            'Miftah Tools',
            `${resolvedName}: ${loc.toastSuccess}`,
            targetRoute
          );

          // Trigger custom event for in-app toast
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('miftah:tool-pinned', {
                detail: {
                  toolId,
                  toolName: resolvedName,
                  url: targetRoute,
                  message: loc.toastSuccess,
                },
              })
            );
          }
          return;
        }
      } catch (err) {
        console.error('Error invoking native shortcut:', err);
      }
    }

    // 2. Web / Browser Environment: Try PWA beforeinstallprompt or show helpful modal
    if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
      try {
        const promptEvent = (window as any).deferredPrompt;
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          (window as any).deferredPrompt = null;
          setJustAdded(true);
          setTimeout(() => setJustAdded(false), 3500);
          return;
        }
      } catch (err) {}
    }

    // Show instructional web modal
    setShowWebModal(true);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      const fullUrl = `${window.location.origin}${targetRoute}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      triggerHaptic('light');
    }
  };

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  // 1. Banner Variant (Prominent full-width or card banner)
  if (variant === 'banner') {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border p-3 sm:p-4 transition-all duration-200 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-blue-500/10 border-sky-500/25 dark:border-sky-500/30 ${className}`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-600/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>{loc.modalTitle}</span>
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500 text-white uppercase tracking-wider">
                  1-Tap
                </span>
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {loc.modalDesc(resolvedName)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddToPhoneScreen}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-black text-xs text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 active:scale-95 shadow-md shadow-sky-600/25 transition-all cursor-pointer select-none shrink-0"
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                <span>{loc.addedSuccess}</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4" />
                <span>{loc.btnTitle}</span>
              </>
            )}
          </button>
        </div>
        {showWebModal && renderWebModal()}
      </div>
    );
  }

  // 2. Prominent Pill / Button Variant (for tool headers & breadcrumbs)
  if (variant === 'pill' || variant === 'button') {
    if (justAdded) {
      return (
        <div
          className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl font-black text-xs transition-all duration-200 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-xs animate-in zoom-in-95 shrink-0 ${className}`}
        >
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
          <span className="hidden sm:inline">{loc.addedSuccess}</span>
          <span className="inline sm:hidden">{loc.btnShort}</span>
          <Smartphone className="w-3.5 h-3.5 opacity-80" />
        </div>
      );
    }

    return (
      <>
        <button
          type="button"
          onClick={handleAddToPhoneScreen}
          title={loc.btnTitle}
          aria-label={loc.btnTitle}
          className={`group/homebtn inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer active:scale-95 select-none bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white shadow-sm hover:shadow-md shadow-sky-600/25 border border-sky-400/30 shrink-0 ${className}`}
        >
          <div className="relative flex items-center justify-center">
            <Smartphone className="w-3.5 h-3.5 shrink-0 group-hover/homebtn:scale-110 transition-transform" />
            <Plus className="w-2 h-2 absolute -top-1 -right-1 text-white stroke-[4]" />
          </div>
          <span className="hidden sm:inline">{loc.btnTitle}</span>
          <span className="inline sm:hidden">{loc.btnShort}</span>
        </button>

        {showWebModal && renderWebModal()}
      </>
    );
  }

  // 2. Icon Variant (for compact bars and grids)
  return (
    <>
      <button
        type="button"
        onClick={handleAddToPhoneScreen}
        aria-label={loc.btnTitle}
        title={loc.btnTitle}
        className={`group/phonebtn relative p-2 rounded-xl transition-all duration-200 active:scale-75 select-none cursor-pointer text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 ${className}`}
      >
        <div className="relative">
          <Smartphone className={`${iconSize} transition-transform duration-200 group-hover/phonebtn:scale-110`} />
          <Plus className="w-2.5 h-2.5 absolute -top-1 -right-1 text-sky-500 stroke-[3]" />
        </div>

        {justAdded && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        )}
      </button>

      {showWebModal && renderWebModal()}
    </>
  );

  function renderWebModal() {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={() => setShowWebModal(false)}
      >
        <div
          dir={language === 'ur' || language === 'ar' ? 'rtl' : 'ltr'}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setShowWebModal(false)}
            aria-label={loc.close}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                {loc.modalTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {resolvedName}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {loc.modalDesc(resolvedName)}
          </p>

          <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <span className="font-bold text-sky-600 dark:text-sky-400">Android:</span>
              <span>{loc.androidStep}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-sky-600 dark:text-sky-400">iPhone:</span>
              <span>{loc.iosStep}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? loc.copied : loc.copyLink}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowWebModal(false)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              {loc.close}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
