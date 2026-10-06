'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useTheme } from '@/components/layout/ThemeContext';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';
import {
  Settings,
  Languages,
  Sun,
  Moon,
  Laptop,
  Bell,
  Volume2,
  Vibrate,
  ShieldCheck,
  Database,
  Trash2,
  CheckCircle2,
  UserX,
  ChevronRight,
  Sparkles,
  Smartphone,
  HelpCircle,
  Mail,
  FileText,
  Lock,
  Info,
  HeartHandshake,
  Share2,
  SlidersHorizontal,
  Play,
} from 'lucide-react';
import { shareAppNative } from '@/lib/native/android-bridge';

// Web Audio API Pleasant Completion Chime
function playCompletionChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0.001, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.2, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.4);
    });
  } catch (_) {}
}

const SETTINGS_LOCALES = {
  en: {
    pageTitle: 'Settings',
    pageSubtitle: 'Manage your app preferences and personalization.',
    versionBadge: 'v1.0.7',

    // Section 1: Appearance & Language
    appearanceHeader: 'Appearance & Language',
    selectLang: 'App Language',
    autoDetectLang: 'Auto Detect',
    themeMode: 'Theme',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    systemTheme: 'System',

    // Section 2: Audio & System Response
    systemHeader: 'Notifications & Audio',
    toolCompleteAlert: 'Task Notifications',
    toolCompleteDesc: 'Notify when background conversions finish',
    hapticFeedback: 'Haptic Feedback',
    hapticDesc: 'Tactile vibration on buttons and sliders',
    soundEffects: 'Sound Effects',
    soundDesc: 'Play pleasant chime on task completion',
    testSound: 'Play',

    // Section 3: Tool Defaults
    toolDefaultsHeader: 'Export & Quality',
    imageQuality: 'Compression Quality',
    imageQualityHigh: 'Maximum',
    imageQualityMed: 'Balanced',
    imageQualityLow: 'Compact',
    autoDownload: 'Auto-Download Files',
    autoDownloadDesc: 'Save files automatically when tasks complete',

    // Section 4: Storage & Cache
    storageHeader: 'Storage & Cache',
    localUsage: 'Cached Data',
    clearCache: 'Clear Cache',
    clearCacheDesc: 'Clears temporary cache without affecting saved files.',
    clearCacheConfirm: 'Are you sure you want to clear temporary cache and history?',
    cacheCleared: 'Cache successfully cleared!',

    // Section 5: Share App
    shareAppTitle: 'Share App',
    shareAppDesc: 'Share Miftah Tools with friends and colleagues.',
    shareAppBtn: 'Share',

    // Section 6: Legal & About
    legalHeader: 'Legal & Support',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    privacyCenter: 'Privacy Center',
    disclaimer: 'Disclaimer',
    refundPolicy: 'Refund Policy',
    faq: 'FAQ & Help',
    accountDeletion: 'Account & Data Deletion',
    accountDeletionDesc: 'Permanently remove your account and stored data.',
    contactSupport: 'Contact Support',
  },
  ur: {
    pageTitle: 'سیٹنگز (Settings)',
    pageSubtitle: 'ایپ کی ترجیحات، زبان اور ظاہری شکل کا انتظام کریں۔',
    versionBadge: 'ورژن 1.0.7',

    // Section 1: Appearance & Language
    appearanceHeader: 'ظاہری شکل اور زبان',
    selectLang: 'ایپ کی زبان',
    autoDetectLang: 'خودکار زبان',
    themeMode: 'تھیم',
    lightTheme: 'روشن',
    darkTheme: 'تاریک',
    systemTheme: 'سسٹم',

    // Section 2: Audio & System Response
    systemHeader: 'اطلاعات اور صوتی اثرات',
    toolCompleteAlert: 'ٹاسک الرٹ',
    toolCompleteDesc: 'کام مکمل ہونے پر اطلاع دیں',
    hapticFeedback: 'ٹچ وائبریشن',
    hapticDesc: 'بٹن دبانے پر ہلکی وائبریشن',
    soundEffects: 'صوتی اثرات',
    soundDesc: 'فائل تیار ہونے پر آواز',
    testSound: 'آواز',

    // Section 3: Tool Defaults
    toolDefaultsHeader: 'کوالٹی اور فائلیں',
    imageQuality: 'امیج کوالٹی',
    imageQualityHigh: 'اعلیٰ',
    imageQualityMed: 'متوازن',
    imageQualityLow: 'کمپریسڈ',
    autoDownload: 'خودکار ڈاؤنلوڈ',
    autoDownloadDesc: 'مکمل ہوتے ہی فائل خود بخود ڈاؤنلوڈ ہو',

    // Section 4: Storage & Cache
    storageHeader: 'اسٹوریج اور کیشے',
    localUsage: 'عارضی میموری',
    clearCache: 'کیشے صاف کریں',
    clearCacheDesc: 'عارضی کیشے کو محفوظ طریقے سے خالی کریں۔',
    clearCacheConfirm: 'کیا آپ عارضی کیشے اور ہسٹری صاف کرنا چاہتے ہیں؟',
    cacheCleared: 'کیشے کامیابی سے صاف ہو گیا!',

    // Section 5: Share App
    shareAppTitle: 'ایپ شیئر کریں',
    shareAppDesc: 'مفتاح ٹولز دوستوں اور ساتھیوں کے ساتھ شیئر کریں۔',
    shareAppBtn: 'شیئر',

    // Section 6: Legal & About
    legalHeader: 'قانونی پالیسیاں اور سپورٹ',
    privacyPolicy: 'پرائیویسی پالیسی',
    termsOfService: 'شرائطِ استعمال',
    privacyCenter: 'پرائیویسی سینٹر',
    disclaimer: 'قانونی دستبرداری',
    refundPolicy: 'ریفنڈ پالیسی',
    faq: 'عمومی سوالات',
    accountDeletion: 'اکاؤنٹ ڈیلیشن پورٹل',
    accountDeletionDesc: 'اپنا ڈیٹا اور اکاؤنٹ مکمل حذف کریں۔',
    contactSupport: 'سپورٹ سے رابطہ',
  },
  ar: {
    pageTitle: 'الإعدادات',
    pageSubtitle: 'تخصيص المظهر، اللغة، الإشعارات والتخزين.',
    versionBadge: 'الإصدار 1.0.7',

    // Section 1: Appearance & Language
    appearanceHeader: 'المظهر واللغة',
    selectLang: 'لغة التطبيق',
    autoDetectLang: 'تلقائي',
    themeMode: 'المظهر',
    lightTheme: 'فاتح',
    darkTheme: 'داكن',
    systemTheme: 'النظام',

    // Section 2: Audio & System Response
    systemHeader: 'الإشعارات والأصوات',
    toolCompleteAlert: 'تنبيهات المهام',
    toolCompleteDesc: 'إشعار عند اكتمال معالجة الملفات',
    hapticFeedback: 'الاهتزاز اللمسي',
    hapticDesc: 'اهتزاز تفاعلي خفيف عند اللمس',
    soundEffects: 'المؤثرات الصوتية',
    soundDesc: 'نغمة هادئة عند انتهاء المهمة',
    testSound: 'تشغيل',

    // Section 3: Tool Defaults
    toolDefaultsHeader: 'الجودة والملفات',
    imageQuality: 'جودة المعالجة',
    imageQualityHigh: 'عالية',
    imageQualityMed: 'متوازنة',
    imageQualityLow: 'مضغوطة',
    autoDownload: 'تحميل تلقائي',
    autoDownloadDesc: 'حفظ الملفات تلقائياً عند انتهاء المعالجة',

    // Section 4: Storage & Cache
    storageHeader: 'التخزين والذاكرة المؤقتة',
    localUsage: 'الذاكرة المؤقتة',
    clearCache: 'مسح الذاكرة المؤقتة',
    clearCacheDesc: 'مسح الملفات المؤقتة دون حذف ملفاتك الأصلية.',
    clearCacheConfirm: 'هل تريد بالتأكيد مسح الذاكرة المؤقتة؟',
    cacheCleared: 'تم مسح الذاكرة المؤقتة بنجاح!',

    // Section 5: Share App
    shareAppTitle: 'مشاركة التطبيق',
    shareAppDesc: 'شارك مفتاح تولز مع أصدقائك وزملائك.',
    shareAppBtn: 'مشاركة',

    // Section 6: Legal & About
    legalHeader: 'الدعم والقانونية',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الخدمة',
    privacyCenter: 'مركز الخصوصية',
    disclaimer: 'إخلاء المسؤولية',
    refundPolicy: 'سياسة الاسترداد',
    faq: 'الأسئلة الشائعة',
    accountDeletion: 'حذف الحساب والبيانات',
    accountDeletionDesc: 'حذف بياناتك وحسابك نهائياً.',
    contactSupport: 'تواصل مع الدعم',
  },
  hi: {
    pageTitle: 'सेटिंग्स',
    pageSubtitle: 'ऐप की भाषा, थीम और प्राथमिकताओं को प्रबंधित करें।',
    versionBadge: 'v1.0.7',

    // Section 1: Appearance & Language
    appearanceHeader: 'थीम व भाषा',
    selectLang: 'ऐप की भाषा',
    autoDetectLang: 'ऑटो डिटेक्ट',
    themeMode: 'थीम',
    lightTheme: 'लाइट',
    darkTheme: 'डार्क',
    systemTheme: 'सिस्टम',

    // Section 2: Audio & System Response
    systemHeader: 'नोटिफिकेशन व साउंड',
    toolCompleteAlert: 'टास्क अलर्ट',
    toolCompleteDesc: 'फाइल प्रोसेस पूरा होने पर सूचित करें',
    hapticFeedback: 'टच वाइब्रेशन',
    hapticDesc: 'बटन व स्लाइडर पर हैप्टिक फीडबैक',
    soundEffects: 'साउंड इफेक्ट्स',
    soundDesc: 'टास्क पूरा होने पर मधुर ध्वनि',
    testSound: 'साउंड सुनें',

    // Section 3: Tool Defaults
    toolDefaultsHeader: 'एक्सपोर्ट व क्वालिटी',
    imageQuality: 'इमेज क्वालिटी',
    imageQualityHigh: 'उच्चतम',
    imageQualityMed: 'संतुलित',
    imageQualityLow: 'कंप्रेस्ड',
    autoDownload: 'ऑटो डाउनलोड',
    autoDownloadDesc: 'टास्क पूरा होते ही फाइल अपने आप सेव हो',

    // Section 4: Storage & Cache
    storageHeader: 'स्टोरेज व मेमोरी',
    localUsage: 'अस्थायी मेमोरी',
    clearCache: 'कैश साफ़ करें',
    clearCacheDesc: 'अस्थायी कैश साफ़ करें, आपकी फाइलें सुरक्षित रहेंगी।',
    clearCacheConfirm: 'क्या आप अस्थायी कैश साफ़ करना चाहते हैं?',
    cacheCleared: 'कैश सफलतापूर्वक साफ़ हो गया!',

    // Section 5: Share App
    shareAppTitle: 'ऐप शेयर करें',
    shareAppDesc: 'मिफ्ताह टूल्स को अपने दोस्तों और सहयोगियों के साथ शेयर करें।',
    shareAppBtn: 'शेयर करें',

    // Section 6: Legal & About
    legalHeader: 'सपोर्ट व कानूनी नीतियां',
    privacyPolicy: 'प्राइवेसी पॉलिसी',
    termsOfService: 'नियम व शर्तें',
    privacyCenter: 'प्राइवेसी सेंटर',
    disclaimer: 'अस्वीकरण',
    refundPolicy: 'रिफंड पॉलिसी',
    faq: 'एफएक्यू व सहायता',
    accountDeletion: 'खाता व डेटा विलोपन',
    accountDeletionDesc: 'अपना खाता और डेटा स्थायी रूप से हटाएं।',
    contactSupport: 'सपोर्ट से संपर्क करें',
  },
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, isRTL, autoDetectLanguage } = useI18n();
  const loc = SETTINGS_LOCALES[language] || SETTINGS_LOCALES.en;

  // Preferences
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);
  const [hapticFeedback, setHapticFeedback] = useState<boolean>(true);
  const [soundEffects, setSoundEffects] = useState<boolean>(true);
  const [imageQuality, setImageQuality] = useState<'high' | 'med' | 'low'>('high');
  const [autoDownload, setAutoDownload] = useState<boolean>(false);
  const [storageBytes, setStorageBytes] = useState<number>(0);
  const [cacheCleared, setCacheCleared] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedPush = localStorage.getItem('miftah_pref_push');
      if (savedPush !== null) setPushNotifications(savedPush === 'true');

      const savedHaptic = localStorage.getItem('miftah_pref_haptic');
      if (savedHaptic !== null) setHapticFeedback(savedHaptic === 'true');

      const savedSound = localStorage.getItem('miftah_pref_sound');
      if (savedSound !== null) setSoundEffects(savedSound === 'true');

      const savedQuality = localStorage.getItem('miftah_pref_quality');
      if (savedQuality) setImageQuality(savedQuality as 'high' | 'med' | 'low');

      const savedAutoDownload = localStorage.getItem('miftah_pref_autodownload');
      if (savedAutoDownload !== null) setAutoDownload(savedAutoDownload === 'true');

      let total = 0;
      for (const x in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, x)) {
          total += ((localStorage[x]?.length || 0) + x.length) * 2;
        }
      }
      setStorageBytes(total);
    } catch (_) {
      setStorageBytes(1024 * 32);
    }
  }, [cacheCleared]);

  const updatePreference = (key: string, value: string | boolean) => {
    try {
      localStorage.setItem(key, String(value));
    } catch (_) {}
  };

  const handleClearCache = useCallback(() => {
    triggerHaptic('medium');
    if (confirm(loc.clearCacheConfirm)) {
      try {
        localStorage.removeItem('nexora_history');
        localStorage.removeItem('nexora_downloads');
        localStorage.removeItem('miftah_recent_tools');
        localStorage.removeItem('miftah_saved_presets');
      } catch (_) {}
      setCacheCleared(true);
      setStorageBytes(1024 * 4);
      setTimeout(() => setCacheCleared(false), 3000);
    }
  }, [loc.clearCacheConfirm]);

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 animate-in fade-in duration-300 pb-28"
    >
      <div className="hidden sm:block">
        <Breadcrumbs items={[{ label: loc.pageTitle }]} />
      </div>

      {/* 1. Header Card */}
      <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-200 dark:border-brand-800">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {loc.pageTitle}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {loc.pageSubtitle}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold">
          {loc.versionBadge}
        </span>
      </div>

      {/* 2. Appearance & Language */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
          <Languages className="w-4 h-4 text-brand-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {loc.appearanceHeader}
          </h2>
        </div>

        <div className="p-4 space-y-4">
          {/* Language Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {loc.selectLang}
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  const detected = autoDetectLanguage();
                  setLanguage(detected as any);
                }}
                className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Smartphone className="w-3 h-3" />
                <span>{loc.autoDetectLang}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'en', label: 'English', flag: '🇬🇧' },
                { id: 'ur', label: 'اردو', flag: '🇵🇰' },
                { id: 'ar', label: 'العربية', flag: '🇸🇦' },
                { id: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
              ].map((l) => {
                const isSelected = language === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setLanguage(l.id as any);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Selector */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              {loc.themeMode}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: loc.lightTheme, icon: Sun },
                { id: 'dark', label: loc.darkTheme, icon: Moon },
                { id: 'system', label: loc.systemTheme, icon: Laptop },
              ].map((m) => {
                const isSelected = theme === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setTheme(m.id as any);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Notifications & Audio (Clean iOS-style Toggles) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {loc.systemHeader}
          </h2>
        </div>

        <div className="p-4 space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
          {/* Toggle 1: Push Notifications */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {loc.toolCompleteAlert}
              </p>
              <p className="text-[11px] text-slate-400">
                {loc.toolCompleteDesc}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                const next = !pushNotifications;
                setPushNotifications(next);
                updatePreference('miftah_pref_push', next);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
                pushNotifications ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                  pushNotifications ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Haptics */}
          <div className="flex items-center justify-between pt-3">
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {loc.hapticFeedback}
              </p>
              <p className="text-[11px] text-slate-400">
                {loc.hapticDesc}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                const next = !hapticFeedback;
                setHapticFeedback(next);
                updatePreference('miftah_pref_haptic', next);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
                hapticFeedback ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                  hapticFeedback ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Sound Effects */}
          <div className="flex items-center justify-between pt-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  {loc.soundEffects}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    playCompletionChime();
                  }}
                  className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>{loc.testSound}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                {loc.soundDesc}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                const next = !soundEffects;
                setSoundEffects(next);
                updatePreference('miftah_pref_sound', next);
                if (next) playCompletionChime();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
                soundEffects ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                  soundEffects ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Export Quality & Tool Defaults */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {loc.toolDefaultsHeader}
          </h2>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              {loc.imageQuality}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'high', label: loc.imageQualityHigh },
                { id: 'med', label: loc.imageQualityMed },
                { id: 'low', label: loc.imageQualityLow },
              ].map((q) => {
                const isSelected = imageQuality === q.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setImageQuality(q.id as any);
                      updatePreference('miftah_pref_quality', q.id);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {loc.autoDownload}
              </p>
              <p className="text-[11px] text-slate-400">
                {loc.autoDownloadDesc}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                const next = !autoDownload;
                setAutoDownload(next);
                updatePreference('miftah_pref_autodownload', next);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
                autoDownload ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                  autoDownload ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Storage & Cache */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {loc.storageHeader}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {formatStorage(storageBytes)}
          </span>
        </div>

        <div className="p-4 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {loc.clearCache}
            </p>
            <p className="text-[11px] text-slate-400">
              {loc.clearCacheDesc}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearCache}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1.5 shrink-0 active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loc.clearCache}</span>
          </button>
        </div>

        {cacheCleared && (
          <div className="mx-4 mb-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{loc.cacheCleared}</span>
          </div>
        )}
      </div>

      {/* 6. Legal, Policies & Support */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {loc.legalHeader}
          </h2>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[
            { label: loc.privacyPolicy, href: '/privacy', icon: Lock },
            { label: loc.termsOfService, href: '/terms', icon: FileText },
            { label: loc.privacyCenter, href: '/privacy-center', icon: ShieldCheck },
            { label: loc.disclaimer, href: '/disclaimer', icon: Info },
            { label: loc.refundPolicy, href: '/refund', icon: HeartHandshake },
            { label: loc.faq, href: '/faq', icon: HelpCircle },
            { label: loc.contactSupport, href: '/contact', icon: Mail },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => triggerHaptic('light')}
                className="px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
              </Link>
            );
          })}
        </div>

        {/* Account Deletion */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
              {loc.accountDeletion}
            </p>
            <p className="text-[11px] text-rose-600 dark:text-rose-400">
              {loc.accountDeletionDesc}
            </p>
          </div>

          <Link
            href="/account"
            onClick={() => triggerHaptic('medium')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            {loc.accountDeletion.split(' ')[0]}
          </Link>
        </div>
      </div>
    </div>
  );
}
