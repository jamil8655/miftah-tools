'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileQuestion, 
  Home, 
  Search, 
  Sparkles, 
  FileText, 
  ScanText, 
  Image as ImageIcon,
  ArrowRight,
  Compass
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const NOT_FOUND_LOCALES = {
  en: {
    badge: '404 Error — Page Not Found',
    title: 'Looking for a Tool or Page?',
    subtitle: 'The page or tool URL you are looking for might have been moved, renamed, or is temporarily unavailable.',
    searchPlaceholder: 'Search 220+ free tools (e.g. PDF to Word, OCR, Compress Image)...',
    homeBtn: 'Back to Home',
    allToolsBtn: 'Explore All 220+ Tools',
    popularHeading: 'Popular Online Utilities You Might Need',
    pdfStudio: 'Document Studio (Text to PDF)',
    ocrStudio: 'OCR Image to Text',
    imageStudio: 'Image Studio Suite',
    pdfOrganizer: 'PDF Organizer Studio',
  },
  ur: {
    badge: 'خرابی 404 — صفحہ نہیں ملا',
    title: 'کیا آپ کوئی ٹول یا صفحہ تلاش کر رہے ہیں؟',
    subtitle: 'مطلوبہ صفحہ کا پتہ تبدیل ہو چکا ہے یا وہ عارضی طور پر دستیاب نہیں ہے۔',
    searchPlaceholder: '220+ مفت ٹولز تلاش کریں (مثلاً پی ڈی ایف، امیج کنورٹر، او سی آر)...',
    homeBtn: 'ہوم پیج پر جائیں',
    allToolsBtn: 'تمام 220+ ٹولز دیکھیں',
    popularHeading: 'مقبول ترین آن لائن ٹولز',
    pdfStudio: 'دستاویز اسٹوڈیو (ٹیکسٹ ٹو پی ڈی ایف)',
    ocrStudio: 'تصویر سے ٹیکسٹ نکالیں (OCR)',
    imageStudio: 'امیج اسٹوڈیو سویٹ',
    pdfOrganizer: 'پی ڈی ایف آرگنائزر اسٹوڈیو',
  },
  ar: {
    badge: 'خطأ 404 — الصفحة غير موجودة',
    title: 'هل تبحث عن أداة أو صفحة محددة؟',
    subtitle: 'قد يكون رابط الصفحة التي تبحث عنها قد تم نقله أو تغييره أو أنه غير متوفر حالياً.',
    searchPlaceholder: 'ابحث في أكثر من 220 أداة مجانية (مثل تحويل PDF، ضغط الصور، OCR)...',
    homeBtn: 'العودة للرئيسية',
    allToolsBtn: 'استعراض كافة الأدوات (220+)',
    popularHeading: 'الأدوات الشائعة التي قد تحتاجها',
    pdfStudio: 'استوديو المستندات (النص إلى PDF)',
    ocrStudio: 'استخراج النص من الصور (OCR)',
    imageStudio: 'استوديو تحرير ومعالجة الصور',
    pdfOrganizer: 'استوديو تنظيم وإدارة PDF',
  },
  hi: {
    badge: '404 त्रुटि — पृष्ठ नहीं मिला',
    title: 'क्या आप कोई टूल या पृष्ठ खोज रहे हैं?',
    subtitle: 'आप जिस पृष्ठ या टूल को खोज रहे हैं, उसका पता बदल दिया गया है या वह अनुपलब्ध है।',
    searchPlaceholder: '220+ मुफ़्त टूल्स में खोजें (उदा. PDF to Word, OCR, Image Compress)...',
    homeBtn: 'होम पेज पर जाएं',
    allToolsBtn: 'सभी 220+ टूल्स देखें',
    popularHeading: 'लोकप्रिय टूल्स जिनका आप उपयोग कर सकते हैं',
    pdfStudio: 'डॉक्यूमेंट स्टूडियो (टेक्स्ट टू PDF)',
    ocrStudio: 'फोटो से टेक्स्ट निकालें (OCR)',
    imageStudio: 'इमेज स्टूडियो सूट',
    pdfOrganizer: 'PDF ऑर्गनाइज़र स्टूडियो',
  },
};

export default function NotFound() {
  const { language, isRTL } = useI18n();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const loc = NOT_FOUND_LOCALES[language] || NOT_FOUND_LOCALES.en;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push('/tools');
    } else {
      router.push(`/tools?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950"
    >
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Icon & 404 Badge */}
        <div className="space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 flex items-center justify-center mx-auto shadow-lg shadow-brand-500/10">
            <FileQuestion className="w-10 h-10" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider border border-rose-200 dark:border-rose-900/60">
            <span>{loc.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {loc.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {loc.subtitle}
          </p>
        </div>

        {/* Search input to quickly recover */}
        <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={loc.searchPlaceholder}
            className={`w-full py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all ${
              isRTL ? 'pr-11 pl-24' : 'pl-11 pr-24'
            }`}
          />
          <button
            type="submit"
            className={`absolute top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
              isRTL ? 'left-2' : 'right-2'
            }`}
          >
            Search
          </button>
        </form>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md transition-all hover:opacity-90 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{loc.homeBtn}</span>
          </Link>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loc.allToolsBtn}</span>
          </Link>
        </div>

        {/* Popular Recovery Links */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {loc.popularHeading}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left rtl:text-right">
            <Link
              href="/tools/text-to-pdf"
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{loc.pdfStudio}</span>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
            </Link>

            <Link
              href="/ocr"
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                  <ScanText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{loc.ocrStudio}</span>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
            </Link>

            <Link
              href="/image-studio"
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{loc.imageStudio}</span>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
            </Link>

            <Link
              href="/pdf-editor"
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{loc.pdfOrganizer}</span>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
