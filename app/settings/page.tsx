'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useTheme } from '@/components/layout/ThemeContext';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { Settings, Languages, Sun, Moon, Laptop, Bell, Volume2, Vibrate, ShieldCheck, Database, Trash2, CheckCircle2, UserX, ChevronRight, Zap, Smartphone, ExternalLink, HelpCircle, Mail, FileText, Lock, Info, Layers, HeartHandshake, Share2 } from 'lucide-react';
import { shareAppNative } from '@/lib/native/android-bridge';

const SETTINGS_LOCALES = {
  en: {
    pageTitle: 'Settings & Preferences',
    pageSubtitle: 'Manage your app interface, on-device storage, notifications, and privacy options.',
    appBadge: 'Miftah Tools Studio Pro',
    engineStatus: '100% Client-Side Engine • Private & Offline',
    
    shareAppTitle: 'Share Miftah Tools with Friends',
    shareAppDesc: 'Help coworkers, friends, and students discover 220+ free, offline, and private productivity tools.',
    shareAppBtn: 'Share App Now',
    
    appearanceHeader: 'Look & Language',
    appearanceDesc: 'Customize theme lighting and app display language',
    selectLang: 'App Language',
    autoDetectLang: 'Auto Match Device Language',
    autoDetectDesc: 'Automatically switches to your phone / OS system language',
    themeMode: 'Theme Appearance',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    systemTheme: 'System',

    systemHeader: 'System, Haptics & Sound',
    systemDesc: 'Configure touch response and background alerts',
    toolCompleteAlert: 'Task Completion Alerts',
    toolCompleteDesc: 'Notify when large PDF or batch exports finish',
    hapticFeedback: 'Tactile Haptic Feedback',
    hapticDesc: 'Gentle vibration response on buttons and tools',
    soundEffects: 'Sound Effects (Audio Chimes)',
    soundDesc: 'Play pleasant chime on successful export',

    storageHeader: 'Device Memory & Privacy',
    storageDesc: 'Manage local caches and temporary work logs',
    localUsage: 'Estimated Local Storage',
    clearCache: 'Purge Local Cache',
    cacheCleared: 'Cache & local preferences successfully purged!',
    privacyBadge: 'Zero Cloud Uploads Guaranteed',
    privacyBadgeDesc: 'All document and image manipulations occur entirely in your device memory.',

    legalHeader: 'Legal, Compliance & Safety',
    legalDesc: 'Official disclosures, terms of use, and privacy rules',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    privacyCenter: 'Privacy Center & Consent',
    disclaimer: 'Legal Disclaimer',
    refundPolicy: 'Refund & Usage Policy',
    accountDeletion: 'Account & Data Deletion Portal',
    accountDeletionDesc: 'Permanently purge your profile and cloud sync data (Google Play Policy).',
    manageDeletion: 'Manage Deletion',

    aboutHeader: 'About & Support',
    faq: 'Help & FAQ',
    contactSupport: 'Contact Support',
    developerCredits: 'Engineered with Precision for Android & Web',
  },
  ur: {
    pageTitle: 'ترتیبات اور ترجیحات (Settings)',
    pageSubtitle: 'ایپ کا ڈسپلے، آف لائن کیشے، زبان، اور پرائیویسی سیٹنگز کا انتظام کریں۔',
    appBadge: 'مفتاح ٹولز اسٹوڈیو پرو',
    engineStatus: '100% آن ڈیوائس انجن • محفوظ اور آف لائن',

    shareAppTitle: 'دوستوں کے ساتھ مفتاح ٹولز شیئر کریں',
    shareAppDesc: 'اپنے دوستوں، ساتھیوں اور طلباء کو 220 سے زائد مفت، آف لائن اور پرائیویٹ ٹولز شیئر کریں۔',
    shareAppBtn: 'ابھی ایپ شیئر کریں',

    appearanceHeader: 'ظاہری شکل اور زبان (Appearance)',
    appearanceDesc: 'تھیم کا رنگ اور ایپ کی زبان تبدیل کریں',
    selectLang: 'ایپ کی زبان منتخب کریں',
    autoDetectLang: 'موبائل کے مطابق خودکار زبان (Auto Detect)',
    autoDetectDesc: 'آپ کے موبائل کی سسٹم زبان کے مطابق خودکار سیٹ ہو جائے گا',
    themeMode: 'تھیم کا موڈ',
    lightTheme: 'روشن (Light)',
    darkTheme: 'تاریک (Dark)',
    systemTheme: 'سسٹم (Auto)',

    systemHeader: 'سسٹم، ہیپٹکس اور آواز (System)',
    systemDesc: 'ٹچ وائبریشن اور اطلاعات کی ترتیبات',
    toolCompleteAlert: 'ٹاسک مکمل ہونے کا الرٹ',
    toolCompleteDesc: 'پی ڈی ایف یا امیج تیار ہونے پر مطلع کریں',
    hapticFeedback: 'ٹچ وائبریشن (Haptic Feedback)',
    hapticDesc: 'بٹن دبانے پر ہلکی وائبریشن کا احساس',
    soundEffects: 'صوتی اثرات (Sound Chimes)',
    soundDesc: 'فائل ایکسپورٹ ہونے پر خوشگوار آواز',

    storageHeader: 'ڈیوائس میموری اور پرائیویسی (Storage)',
    storageDesc: 'لوکل کیشے اور ہسٹری لاگز کا انتظام',
    localUsage: 'مقامی اسٹوریج کا استعمال',
    clearCache: 'کیشے اور ہسٹری صاف کریں',
    cacheCleared: 'کیشے اور مقامی ڈیٹا کامیابی سے صاف ہو گیا!',
    privacyBadge: '100% پرائیویٹ اور محفوظ پروسیسنگ',
    privacyBadgeDesc: 'آپ کی فائلیں کبھی کسی سرور پر اپلوڈ نہیں ہوتیں، سارا کام ڈیوائس میں ہوتا ہے۔',

    legalHeader: 'قانونی، پالیسیاں اور سیکیورٹی (Legal)',
    legalDesc: 'پرائیویسی پالیسی، شرائط و ضوابط اور سرکاری ڈسکلوزرز',
    privacyPolicy: 'پرائیویسی پالیسی (Privacy Policy)',
    termsOfService: 'شرائطِ استعمال (Terms of Service)',
    privacyCenter: 'پرائیویسی سینٹر (Privacy Center)',
    disclaimer: 'قانونی دستبرداری (Disclaimer)',
    refundPolicy: 'ریفنڈ اور سروس پالیسی',
    accountDeletion: 'اکاؤنٹ اور ڈیٹا ڈیلیشن پورٹل',
    accountDeletionDesc: 'گوگل پلے پالیسی کے مطابق اکاؤنٹ اور کلاؤڈ ڈیٹا مکمل طور پر حذف کریں۔',
    manageDeletion: 'ڈیلیٹ کریں',

    aboutHeader: 'معلومات اور رابطہ (About & Help)',
    faq: 'عمومی سوالات (FAQ)',
    contactSupport: 'ہم سے رابطہ کریں (Support)',
    developerCredits: 'تمام حقوق محفوظ ہیں • مفتاح ٹولز ٹیم',
  },
  ar: {
    pageTitle: 'الإعدادات والتفضيلات (Settings)',
    pageSubtitle: 'تخصيص الواجهة، والذاكرة المؤقتة، واللغة، وخيارات الخصوصية.',
    appBadge: 'مفتاح تولز ستوديو برو',
    engineStatus: 'معالجة محلية 100% • خصوصية تامة دون اتصال',

    shareAppTitle: 'مشاركة تطبيق مفتاح تولز مع الأصدقاء',
    shareAppDesc: 'ساعد زملاءك والطلاب في اكتشاف أكثر من 220 أداة مجانية وآمنة وسريعة دون إنترنت.',
    shareAppBtn: 'مشاركة التطبيق الآن',

    appearanceHeader: 'المظهر واللغة (Appearance)',
    appearanceDesc: 'تخصيص إضاءة المظهر ولغة عرض التطبيق',
    selectLang: 'لغة التطبيق',
    autoDetectLang: 'مطابقة لغة الهاتف تلقائياً (Auto Detect)',
    autoDetectDesc: 'التحويل التلقائي بحسب لغة نظام هاتفك الذكي',
    themeMode: 'وضع المظهر',
    lightTheme: 'فاتح',
    darkTheme: 'داكن',
    systemTheme: 'النظام',

    systemHeader: 'النظام والاهتزاز والصوت (System)',
    systemDesc: 'ضبط استجابة اللمس والإشعارات الفورية',
    toolCompleteAlert: 'تنبيه اكتمال المهام',
    toolCompleteDesc: 'إشعار فوري عند اكتمال تصدير الملفات',
    hapticFeedback: 'الاستجابة اللمسية (الاهتزاز)',
    hapticDesc: 'اهتزاز خفيف وذكي عند النقر على الأزرار',
    soundEffects: 'المؤثرات الصوتية',
    soundDesc: 'نغمة صوتية مريحة عند نجاح التصدير',

    storageHeader: 'ذاكرة الجهاز والخصوصية (Storage)',
    storageDesc: 'إدارة الذاكرة المؤقتة وسجلات الملفات',
    localUsage: 'الذاكرة المحلية المستخدمة',
    clearCache: 'مسح الذاكرة المؤقتة',
    cacheCleared: 'تم مسح الذاكرة المؤقتة والبيانات بنجاح!',
    privacyBadge: 'ضمان عدم رفع الملفات إلى أي خادم',
    privacyBadgeDesc: 'تتم كافة عمليات تعديل المستندات والصور داخل ذاكرة هاتفك فقط.',

    legalHeader: 'السياسات والامتثال والأمان (Legal)',
    legalDesc: 'الإفصاحات الرسمية وشروط الاستخدام وسياسة الخصوصية',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الخدمة',
    privacyCenter: 'مركز الخصوصية والموافقة',
    disclaimer: 'إخلاء المسؤولية القانوني',
    refundPolicy: 'سياسة الاسترداد والاستخدام',
    accountDeletion: 'بوابة حذف الحساب والبيانات',
    accountDeletionDesc: 'حذف الحساب والبيانات نهائياً وفق معايير Google Play.',
    manageDeletion: 'إدارة الحذف',

    aboutHeader: 'حول التطبيق والمساعدة (About)',
    faq: 'الأسئلة الشائعة',
    contactSupport: 'الدعم والمساعدة',
    developerCredits: 'تم التطوير باحترافية لنظامي أندرويد والويب',
  },
  hi: {
    pageTitle: 'सेटिंग्स व प्राथमिकताएं (Settings)',
    pageSubtitle: 'ऐप का इंटरफ़ेस, ऑफ़लाइन कैश, भाषा और गोपनीयता सेटिंग्स प्रबंधित करें।',
    appBadge: 'मिफ़्ताह टूल्स प्रो स्टूडियो',
    engineStatus: '100% ऑन-डिवाइस इंजन • सुरक्षित और ऑफ़लाइन',

    shareAppTitle: 'दोस्तों के साथ मिफ्ताह टूल्स शेयर करें',
    shareAppDesc: 'अपने दोस्तों, सहकर्मियों और छात्रों को 220+ मुफ़्त, ऑफ़लाइन व निजी टूल्स का लाभ उठाने में मदद करें।',
    shareAppBtn: 'अभी ऐप शेयर करें',

    appearanceHeader: 'दिखावट व भाषा (Appearance)',
    appearanceDesc: 'थीम लाइटिंग और ऐप की भाषा कस्टमाइज़ करें',
    selectLang: 'ऐप की भाषा चुनें',
    autoDetectLang: 'मोबाइल की भाषा के अनुसार चुनें (Auto Detect)',
    autoDetectDesc: 'आपके फ़ोन / सिस्टम की भाषा के अनुसार अपने आप सेट होगा',
    themeMode: 'थीम का स्वरूप',
    lightTheme: 'लाइट',
    darkTheme: 'डार्क',
    systemTheme: 'सिस्टम',

    systemHeader: 'सिस्टम, वाइब्रेशन व ध्वनि (System)',
    systemDesc: 'टच वाइब्रेशन और बैकग्राउंड अलर्ट कॉन्फ़िगर करें',
    toolCompleteAlert: 'कार्य पूरा होने का अलर्ट',
    toolCompleteDesc: 'फ़ाइल एक्सपोर्ट पूरी होने पर तुरंत सूचित करें',
    hapticFeedback: 'टच हैप्टिक फ़ीडबैक (वाइब्रेशन)',
    hapticDesc: 'बटन टैप पर हल्का वाइब्रेशन अनुभव',
    soundEffects: 'साउंड इफेक्ट्स (ऑडियो चाइम)',
    soundDesc: 'फ़ाइल तैयार होने पर मधुर ध्वनि',

    storageHeader: 'डिवाइस मेमोरी व गोपनीयता (Storage)',
    storageDesc: 'लोकल कैश और कार्य इतिहास का प्रबंधन',
    localUsage: 'लोकल स्टोरेज उपयोग',
    clearCache: 'कैश व डेटा साफ़ करें',
    cacheCleared: 'कैश और लोकल डेटा सफलतापूर्वक साफ़ हो गया!',
    privacyBadge: '100% निजी व सुरक्षित प्रोसेसिंग',
    privacyBadgeDesc: 'आपकी फ़ाइलें कभी किसी सर्वर पर अपलोड नहीं होतीं, सभी कार्य डिवाइस में होते हैं।',

    legalHeader: 'क़ानूनी नीतियां व सुरक्षा (Legal)',
    legalDesc: 'गोपनीयता नीति, सेवा की शर्तें और आधिकारिक नीतियां',
    privacyPolicy: 'प्राइवेसी पॉलिसी (Privacy Policy)',
    termsOfService: 'नियम व शर्तें (Terms of Service)',
    privacyCenter: 'प्राइवेसी सेंटर (Privacy Center)',
    disclaimer: 'क़ानूनी अस्वीकरण (Disclaimer)',
    refundPolicy: 'रिफंड व उपयोग नीति',
    accountDeletion: 'खाता व डेटा हटाने का पोर्टल',
    accountDeletionDesc: 'Google Play नीति के अनुसार खाता और डेटा स्थायी रूप से हटाएं।',
    manageDeletion: 'हटाना प्रबंधित करें',

    aboutHeader: 'जानकारी व सहायता (About & Help)',
    faq: 'अक्सर पूछे जाने वाले प्रश्न (FAQ)',
    contactSupport: 'सहायता व संपर्क',
    developerCredits: 'सर्वाधिकार सुरक्षित • मिफ़्ताह टूल्स टीम',
  },
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, autoDetectLanguage, isRTL } = useI18n();
  const loc = SETTINGS_LOCALES[language] || SETTINGS_LOCALES.en;

  const [cacheCleared, setCacheCleared] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [storageBytes, setStorageBytes] = useState<number>(0);

  useEffect(() => {
    // Calculate approximate localStorage size
    try {
      let total = 0;
      for (const x in localStorage) {
        if (localStorage.hasOwnProperty(x)) {
          total += ((localStorage[x]?.length || 0) + x.length) * 2;
        }
      }
      setStorageBytes(total);
    } catch (e) {
      setStorageBytes(1024 * 45); // default fallback
    }
  }, [cacheCleared]);

  const handleClearCache = () => {
    triggerHaptic('medium');
    if (confirm(language === 'ur' ? 'کیا آپ تمام لوکل ترجیحات اور ہسٹری کیشے صاف کرنا چاہتے ہیں؟' : 'Purge all local offline cache, history, and temporary preferences?')) {
      try {
        localStorage.removeItem('nexora_history');
        localStorage.removeItem('nexora_downloads');
        localStorage.removeItem('miftah_recent_tools');
      } catch (_) {}
      setCacheCleared(true);
      setStorageBytes(0);
      setTimeout(() => setCacheCleared(false), 3500);
    }
  };

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-9 space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-20"
    >
      {/* Breadcrumbs */}
      <div className="hidden sm:block">
        <Breadcrumbs items={[{ label: loc.pageTitle }]} />
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {loc.pageTitle}
            </h1>
            <p className="text-xs text-slate-400 line-clamp-1">
              {loc.pageSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Modular Premium Setting Cards */}
      <div className="space-y-6">

        {/* 1. APPEARANCE & LOCALIZATION */}
        <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/60 flex items-center justify-center shrink-0">
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  {loc.appearanceHeader}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {loc.appearanceDesc}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Language Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                  {loc.selectLang}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    const detected = autoDetectLanguage();
                    alert(
                      language === 'ur'
                        ? `سسٹم کی زبان خودکار طور پر شناخت کر لی گئی: ${detected.toUpperCase()}`
                        : language === 'ar'
                        ? `تم التعرف على لغة النظام تلقائياً: ${detected.toUpperCase()}`
                        : language === 'hi'
                        ? `सिस्टम भाषा अपने आप पहचान ली गई: ${detected.toUpperCase()}`
                        : `Device system language auto-detected: ${detected.toUpperCase()}`
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-600 dark:text-brand-400 border border-brand-200/80 dark:border-brand-800/60 text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{loc.autoDetectLang}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
                  { id: 'ur', label: 'Urdu', native: 'اردو', flag: '🇵🇰' },
                  { id: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦' },
                  { id: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
                ].map((lang) => {
                  const isSelected = language === lang.id;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setLanguage(lang.id as any);
                      }}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 active:scale-95 relative overflow-hidden ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/25 ring-2 ring-brand-500/30'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-brand-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{lang.flag}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-white bg-white text-brand-600'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full bg-brand-600" />}
                        </div>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm font-black tracking-tight">{lang.native}</p>
                        <p className={`text-[10px] font-medium ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>
                          {lang.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                {loc.themeMode}
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'light', label: loc.lightTheme, icon: Sun, iconColor: 'text-amber-500' },
                  { id: 'dark', label: loc.darkTheme, icon: Moon, iconColor: 'text-indigo-400' },
                  { id: 'system', label: loc.systemTheme, icon: Laptop, iconColor: 'text-slate-400' },
                ].map((m) => {
                  const isThemeSelected = theme === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setTheme(m.id as any);
                      }}
                      className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all duration-150 active:scale-95 ${
                        isThemeSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/25 ring-2 ring-brand-500/30'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-brand-500'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isThemeSelected ? 'text-white' : m.iconColor}`} />
                      <span className="text-xs font-bold">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 2. SYSTEM, HAPTICS & SOUNDS */}
        <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center shrink-0">
                <Vibrate className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  {loc.systemHeader}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {loc.systemDesc}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4 divide-y divide-slate-100 dark:divide-slate-800/60">
            {/* Toggle 1: Push Notifications */}
            <div className="flex items-center justify-between pt-1">
              <div className="space-y-0.5 max-w-sm">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-500" />
                  <span>{loc.toolCompleteAlert}</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {loc.toolCompleteDesc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setPushNotifications(!pushNotifications);
                }}
                className={`w-12 h-7 rounded-full transition-colors relative p-1 shrink-0 ${
                  pushNotifications ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    pushNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Haptic Vibration */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5 max-w-sm">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Vibrate className="w-4 h-4 text-emerald-500" />
                  <span>{loc.hapticFeedback}</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {loc.hapticDesc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  setHapticFeedback(!hapticFeedback);
                }}
                className={`w-12 h-7 rounded-full transition-colors relative p-1 shrink-0 ${
                  hapticFeedback ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    hapticFeedback ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Sound Effects */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5 max-w-sm">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-500" />
                  <span>{loc.soundEffects}</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {loc.soundDesc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setSoundEffects(!soundEffects);
                }}
                className={`w-12 h-7 rounded-full transition-colors relative p-1 shrink-0 ${
                  soundEffects ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    soundEffects ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 3. DEVICE MEMORY & PRIVACY CACHE */}
        <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  {loc.storageHeader}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {loc.storageDesc}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2.5 py-1 rounded-xl border border-brand-200 dark:border-brand-800">
                {formatStorage(storageBytes)}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {/* Clear Storage Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {loc.localUsage}: <span className="font-mono text-slate-500">{formatStorage(storageBytes)}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Clean up cached history, download logs, and recent tool queues.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClearCache}
                className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>{loc.clearCache}</span>
              </button>
            </div>

            {cacheCleared && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{loc.cacheCleared}</span>
              </div>
            )}
          </div>
        </div>

        {/* SHARE APP WITH FRIENDS & COMMUNITY */}
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 p-6 sm:p-7 text-white shadow-xl shadow-brand-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-1.5 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Community & Sharing</span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              {loc.shareAppTitle}
            </h2>
            <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed font-medium">
              {loc.shareAppDesc}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              shareAppNative(language);
            }}
            className="px-6 py-3.5 rounded-2xl bg-white text-brand-700 hover:bg-brand-50 text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-lg shadow-black/10 shrink-0 relative z-10"
          >
            <Share2 className="w-4 h-4 text-brand-600" />
            <span>{loc.shareAppBtn}</span>
          </button>
        </div>

        {/* 4. LEGAL, COMPLIANCE & SAFETY POLICIES */}
        <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  {loc.legalHeader}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {loc.legalDesc}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { label: loc.privacyPolicy, href: '/privacy', icon: Lock, color: 'text-emerald-500' },
                { label: loc.termsOfService, href: '/terms', icon: FileText, color: 'text-blue-500' },
                { label: loc.privacyCenter, href: '/privacy-center', icon: ShieldCheck, color: 'text-purple-500' },
                { label: loc.disclaimer, href: '/disclaimer', icon: Info, color: 'text-amber-500' },
                { label: loc.refundPolicy, href: '/refund', icon: HeartHandshake, color: 'text-rose-500' },
                { label: loc.faq, href: '/faq', icon: HelpCircle, color: 'text-teal-500' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => triggerHaptic('light')}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-brand-500 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition-all active:scale-95 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                );
              })}
            </div>

            {/* Google Play Compliant Account & Data Purge Portal */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center shrink-0">
                    <UserX className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-rose-950 dark:text-rose-200">
                      {loc.accountDeletion}
                    </h3>
                    <p className="text-[11px] text-rose-700/80 dark:text-rose-400">
                      {loc.accountDeletionDesc}
                    </p>
                  </div>
                </div>

                <Link
                  href="/account"
                  onClick={() => triggerHaptic('medium')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-center active:scale-95"
                >
                  <span>{loc.manageDeletion}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 5. APP FOOTER & CREDITS */}
        <div className="text-center space-y-2 pt-2 text-slate-400 text-xs">
          <p className="font-semibold text-slate-500 dark:text-slate-400">
            {loc.developerCredits}
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <Link href="/contact" className="hover:text-brand-500 transition-colors flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>{loc.contactSupport}</span>
            </Link>
            <span>•</span>
            <Link href="/faq" className="hover:text-brand-500 transition-colors flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>{loc.faq}</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
