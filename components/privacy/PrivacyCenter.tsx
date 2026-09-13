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
import { useI18n } from '@/lib/i18n/i18n-context';
import { purgeAllLocalData } from '@/lib/storage/indexeddb-store';

const PRIVACY_CENTER_LOCALES = {
  en: {
    badge: '100% In-Browser Privacy Architecture • Zero Cloud Storage',
    title: 'Miftah Tools Privacy & Security Center',
    subtitle: 'We believe your files belong only to you. Learn about our client-side processing architecture, clean private metadata, or instantly purge local offline storage.',
    g1Title: '100% Local In-Browser Processing',
    g1Desc: 'All PDF conversions, image editing, audio cutting, and barcode generations execute entirely on your device using WebAssembly and HTML5 Canvas. Your documents never touch any server.',
    g2Title: 'Zero Tracking & No User Logging',
    g2Desc: 'We do not log file contents, filenames, or personally identifiable data. Everything stored in your local storage is encrypted inside your browser’s IndexedDB.',
    g3Title: 'Automatic 24-Hour TTL Expiration',
    g3Desc: 'Temporary cached blobs and conversion items automatically expire and are purged after 24 hours to prevent memory buildup and protect your offline privacy.',
    cleanerTitle: 'Instant Photo EXIF & GPS Metadata Cleaner',
    cleanerDesc: 'Strip GPS locations, device serials, camera settings, and hidden timestamps before sharing photos online.',
    dropPrompt: 'Select any photo to strip EXIF & GPS location metadata',
    strippedBadge: (name: string) => `Metadata Stripped: ${name}`,
    strippedSuccess: '✓ GPS Removed • ✓ Camera Model Cleared • ✓ Timestamps Neutralized',
    saveCleanBtn: 'Save Clean Photo',
    cleanAnotherBtn: 'Clean Another Photo',
    purgeTitle: 'Purge All Offline Storage & History',
    purgeDesc: 'Instantly clears all IndexedDB cached files, local conversion history, and favorites from this browser.',
    purgeConfirm: 'Are you sure you want to purge all local offline files, processing history, and cached data?',
    purgeBtn: 'Purge All Local Data',
    purgeSuccess: '✓ Storage Cleared!',
  },
  ur: {
    badge: '100٪ براؤزر پرائیویسی • زیرو کلاؤڈ اسٹوریج',
    title: 'مفتاح ٹولز پرائیویسی اور سیکیورٹی سینٹر',
    subtitle: 'آپ کی فائلیں صرف آپ کی ملکیت ہیں۔ کلائنٹ سائیڈ پروسیسنگ کو سمجھیں، تصاویر سے پرائیویٹ میٹا ڈیٹا صاف کریں، یا فوری طور پر لوکل ڈیٹا ختم کریں۔',
    g1Title: '100٪ لوکل ان-براؤزر پروسیسنگ',
    g1Desc: 'تمام پی ڈی ایف کنورژن، امیج ایڈیٹنگ، آڈیو کٹنگ اور کیو آر کوڈ جنریشن براہ راست آپ کے ڈیوائس پر ویب اسمبلی کے ذریعے ہوتی ہے۔ فائلز کبھی کسی سرور کو نہیں چھوتیں۔',
    g2Title: 'زیرو ٹریکنگ اور بغیر لاگ ان',
    g2Desc: 'ہم فائل کا مواد، نام یا کوئی ذاتی ڈیٹا لاگ نہیں کرتے۔ لوکل اسٹوریج میں رکھی گئی فائلز محفوظ IndexedDB میں رہتی ہیں۔',
    g3Title: 'خودکار 24 گھنٹے میں ڈیٹا صفائی',
    g3Desc: 'عارضی میموری اور پروسیسنگ فائلز 24 گھنٹے بعد خود بخود ختم ہو جاتی ہیں تاکہ فون کی میموری محفوظ رہے۔',
    cleanerTitle: 'تصاویر سے EXIF اور GPS لوکیشن ہٹانے کا ٹول',
    cleanerDesc: 'انٹرنیٹ پر تصویر شیئر کرنے سے قبل پوشیدہ GPS لوکیشن، کیمرہ ماڈل اور ٹائم اسٹیمپ مکمل ختم کریں۔',
    dropPrompt: 'تصویر منتخب کریں تاکہ GPS لوکیشن اور میٹا ڈیٹا صاف کیا جا سکے',
    strippedBadge: (name: string) => `میٹا ڈیٹا کامیابی سے صاف ہو گیا: ${name}`,
    strippedSuccess: '✓ جی پی ایس لوکیشن ختم • ✓ کیمرہ ماڈل صاف • ✓ ٹائم اسٹیمپ محفوظ',
    saveCleanBtn: 'محفوظ تصویر ڈاؤن لوڈ کریں',
    cleanAnotherBtn: 'دوسری تصویر صاف کریں',
    purgeTitle: 'تمام لوکل اسٹوریج اور ہسٹری ختم کریں',
    purgeDesc: 'براؤزر میں موجود تمام محفوظ کردہ کیش فائلز، ہسٹری اور پسندیدہ ٹولز کو فوری صاف کریں۔',
    purgeConfirm: 'کیا آپ واقعی تمام آف لائن ہسٹری اور محفوظ ڈیٹا ختم کرنا چاہتے ہیں؟',
    purgeBtn: 'تمام لوکل ڈیٹا ڈیلیٹ کریں',
    purgeSuccess: '✓ ڈیٹا مکمل صاف ہو گیا!',
  },
  ar: {
    badge: 'معمارية خصوصية محلية 100٪ داخل المتصفح • بدون تخزين سحابي',
    title: 'مركز الأمان والخصوصية في مفتاح تولز',
    subtitle: 'نؤمن بأن ملفاتك ملك لك وحدك. تعرف على تقنية المعالجة المحلية، وقم بتنظيف بيانات EXIF، أو امسح الذاكرة المؤقتة فوراً.',
    g1Title: 'معالجة محلية 100٪ داخل المتصفح',
    g1Desc: 'تتم كافة عمليات تحويل PDF وتحرير الصور وقص الصوت وتوليد الباركود محلياً على جهازك باستخدام WebAssembly و HTML5 Canvas دون أن تلمس ملفاتك أي خادم.',
    g2Title: 'انعدام التتبع وسجلات المستخدمين',
    g2Desc: 'لا نسجل أي محتوى للملفات أو الأسماء أو البيانات الشخصية. كل ما يتم تخزينه محلياً مشفر داخل IndexedDB لمتصفحك.',
    g3Title: 'حذف تلقائي للملفات المؤقتة بعد 24 ساعة',
    g3Desc: 'تنتهي صلاحية الملفات المؤقتة والذاكرة المخبأة تلقائياً بعد 24 ساعة لحماية خصوصيتك وتوفير مساحة جهازك.',
    cleanerTitle: 'أداة تنظيف بيانات EXIF ومواقع GPS من الصور',
    cleanerDesc: 'احذف إحداثيات GPS وسيريال الجهاز وتفاصيل الكاميرا والطوابع الزمنية قبل مشاركة صورك على الإنترنت.',
    dropPrompt: 'اختر أي صورة لإزالة بيانات الموقع GPS وبيانات EXIF الخفية فوراً',
    strippedBadge: (name: string) => `تم تنظيف البيانات بنجاح: ${name}`,
    strippedSuccess: '✓ تم حذف موقع GPS • ✓ تم مسح طراز الكاميرا • ✓ تمت حماية الخصوصية',
    saveCleanBtn: 'حفظ الصورة النظيفة',
    cleanAnotherBtn: 'تنظيف صورة أخرى',
    purgeTitle: 'مسح كافة البيانات المحلية والسجل بالكامل',
    purgeDesc: 'يمسح فوراً كافة الملفات المؤقتة وسجل العمليات والمفضلات من ذاكرة هذا المتصفح.',
    purgeConfirm: 'هل أنت متأكد من رغبتك في حذف كافة الملفات والبيانات المؤقتة المحفوظة محلياً؟',
    purgeBtn: 'حذف كافة البيانات المحلية',
    purgeSuccess: '✓ تم مسح الذاكرة بنجاح!',
  },
  hi: {
    badge: '100% इन-ब्राउज़र गोपनीयता आर्किटेक्चर • शून्य क्लाउड स्टोरेज',
    title: 'मिफ्ताह टूल्स प्राइवेसी व सिक्योरिटी सेंटर',
    subtitle: 'आपकी फाइलें केवल आपकी संपत्ति हैं। हमारी ऑन-डिवाइस प्रोसेसिंग समझें, फोटो से GPS मेटाडेटा हटाएं या लोकल स्टोरेज साफ़ करें।',
    g1Title: '100% ऑन-डिवाइस लोकल प्रोसेसिंग',
    g1Desc: 'सभी PDF कन्वर्जन, फोटो एडिटिंग, ऑडियो कटिंग और बारकोड जनरेशन WebAssembly द्वारा सीधे आपके डिवाइस में प्रोसेस होते हैं। फाइलें कभी सर्वर पर नहीं जातीं।',
    g2Title: 'शून्य ट्रैकिंग व कोई लॉगिंग नहीं',
    g2Desc: 'हम फ़ाइल सामग्री, नाम या कोई व्यक्तिगत डेटा लॉग नहीं करते। लोकल स्टोरेज में सुरक्षित डेटा केवल आपके ब्राउज़र के IndexedDB में रहता है।',
    g3Title: '24 घंटे में स्वतः डेटा समाप्ति',
    g3Desc: 'मेमोरी सुरक्षित रखने के लिए अस्थायी कैश और कन्वर्जन फाइलें 24 घंटे बाद स्वतः साफ़ हो जाती हैं।',
    cleanerTitle: 'फोटो से EXIF व GPS लोकेशन हटाने का टूल',
    cleanerDesc: 'फोटो ऑनलाइन शेयर करने से पहले गुप्त GPS लोकेशन, कैमरा मॉडल व टाइमस्टैम्प पूरी तरह साफ़ करें।',
    dropPrompt: 'EXIF व GPS लोकेशन मेटाडेटा हटाने के लिए कोई भी फोटो चुनें',
    strippedBadge: (name: string) => `मेटाडेटा साफ़ किया गया: ${name}`,
    strippedSuccess: '✓ GPS हटाया गया • ✓ कैमरा विवरण साफ़ • ✓ गोपनीयता सुरक्षित',
    saveCleanBtn: 'साफ़ फोटो डाउनलोड करें',
    cleanAnotherBtn: 'अन्य फोटो साफ़ करें',
    purgeTitle: 'सभी ऑफलाइन स्टोरेज व हिस्ट्री साफ़ करें',
    purgeDesc: 'ब्राउज़र में मौजूद सभी IndexedDB कैश फाइलों, हालिया हिस्ट्री और पसंदीदा टूल्स को तुरंत मिटाएं।',
    purgeConfirm: 'क्या आप वाकई सभी ऑफलाइन फाइलें, प्रोसेसिंग हिस्ट्री और कैश डेटा हटाना चाहते हैं?',
    purgeBtn: 'सभी लोकल डेटा साफ़ करें',
    purgeSuccess: '✓ स्टोरेज सफलतापूर्वक साफ़ किया गया!',
  },
};

export function PrivacyCenter() {
  const { language } = useI18n();
  const loc = PRIVACY_CENTER_LOCALES[language] || PRIVACY_CENTER_LOCALES.en;
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
    if (confirm(loc.purgeConfirm)) {
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
          <span>{loc.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {loc.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {loc.subtitle}
        </p>
      </div>

      {/* Core Privacy Guarantees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {loc.g1Title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {loc.g1Desc}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
            <EyeOff className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {loc.g2Title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {loc.g2Desc}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center font-bold">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {loc.g3Title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {loc.g3Desc}
          </p>
        </div>
      </div>

      {/* Interactive Tool: In-Browser EXIF & Metadata Stripper */}
      <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-brand-600" />
              <span>{loc.cleanerTitle}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {loc.cleanerDesc}
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
              {loc.dropPrompt}
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                  {loc.strippedBadge(photoFile.name)}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold">
                  {loc.strippedSuccess}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadCleaned}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{loc.saveCleanBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoFile(null)}
                className="px-3 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                {loc.cleanAnotherBtn}
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
            <span>{loc.purgeTitle}</span>
          </h4>
          <p className="text-xs text-rose-700 dark:text-rose-300">
            {loc.purgeDesc}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePurgeStorage}
          className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-rose-600/25 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          {purgedSuccess ? loc.purgeSuccess : loc.purgeBtn}
        </button>
      </div>
    </div>
  );
}
