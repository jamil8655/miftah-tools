'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  ShieldCheck,
  Zap,
  Lock,
  Workflow,
  HelpCircle,
  Mail,
  FileText,
  CreditCard,
  AlertCircle,
  BookOpen,
  Globe2,
  Share2,
  Layers,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { shareAppNative } from '@/lib/native/android-bridge';
import { triggerHaptic } from '@/lib/motion/motion-system';

const FOOTER_LOCALES = {
  en: {
    shareApp: 'Share App with Friends',
    engineTitle: '500 MB Client-Side Engine',
    engineDesc: 'Transform massive documents & media smoothly in-browser.',
    privacyTitle: '100% In-Browser Privacy',
    privacyDesc: 'Files never touch external servers or get stored remotely.',
    toolsBadgeTitle: '220+ Client-Side Utilities',
    toolsBadgeDesc: 'PDF, Image, Video, OCR, Code & Math Tools.',
    categoriesTitle: 'Popular Categories',
    pdfTools: 'PDF Tools & Editor',
    imageTools: 'Image Tools & Studio',
    ocrTools: 'OCR & Text Extractors',
    workflowTools: 'Automated Workflows',
    viewAllCategories: 'Explore All 220+ Tools →',
    viewAllTools: 'Explore All 220+ Tools →',
    pdfToWord: 'PDF to Word (OCR)',
    pdfEditor: 'PDF Editor Studio',
    imageStudio: 'Image Studio Suite',
    ocrText: 'OCR Image to Text',
    markItDown: 'MarkItDown AI Studio',
  },
  ur: {
    shareApp: 'دوستوں کے ساتھ ایپ شیئر کریں',
    engineTitle: '500 ایم بی کلائنٹ سائیڈ انجن',
    engineDesc: 'بڑی دستاویزات اور میڈیا کو براؤزر کے اندر آسانی سے پروسیس کریں۔',
    privacyTitle: '100% مکمل رازداری کی ضمانت',
    privacyDesc: 'آپ کی فائلیں کبھی بھی بیرونی سرور پر اپلوڈ نہیں ہوتیں۔',
    toolsBadgeTitle: '220+ کلائنٹ سائیڈ ٹولز',
    toolsBadgeDesc: 'پی ڈی ایف، تصاویر، او سی آر، کوڈ اور ریاضی کے ٹولز۔',
    categoriesTitle: 'مقبول ٹولز کیٹگریز',
    pdfTools: 'پی ڈی ایف ٹولز و ایڈیٹر',
    imageTools: 'امیج ٹولز و اسٹوڈیو',
    ocrTools: 'او سی آر و ٹیکسٹ ایکسٹریکٹر',
    workflowTools: 'خودکار ورک فلوز',
    viewAllCategories: 'تمام 220+ ٹولز دیکھیں ←',
    viewAllTools: 'تمام 220+ ٹولز دیکھیں ←',
    pdfToWord: 'پی ڈی ایف سے ورڈ (OCR)',
    pdfEditor: 'پی ڈی ایف ایڈیٹر اسٹوڈیو',
    imageStudio: 'امیج اسٹوڈیو سویٹ',
    ocrText: 'تصویر سے ٹیکسٹ نکالیں (OCR)',
    markItDown: 'مارک اِٹ ڈاؤن اے آئی اسٹوڈیو',
  },
  ar: {
    shareApp: 'مشاركة التطبيق مع الأصدقاء',
    engineTitle: 'محرك محلي فائق بسعة 500 ميجابايت',
    engineDesc: 'معالجة المستندات والوسائط الضخمة مباشرة وبسلاسة في المتصفح.',
    privacyTitle: 'خصوصية وأمان محلي بنسبة 100%',
    privacyDesc: 'ملفاتك لا تغادر جهازك ولا يتم تخزينها على أي خادم خارجي.',
    toolsBadgeTitle: '220+ أداة محلية متطورة',
    toolsBadgeDesc: 'أدوات PDF، الصور، OCR، البرمجة والحاسبات.',
    categoriesTitle: 'التصنيفات الشائعة',
    pdfTools: 'أدوات ومحرر PDF',
    imageTools: 'استوديو معالجة الصور',
    ocrTools: 'استخراج النصوص OCR',
    workflowTools: 'أتمتة سير العمل',
    viewAllCategories: 'استكشف جميع الأدوات 220+ ←',
    viewAllTools: 'استكشف جميع الأدوات 220+ ←',
    pdfToWord: 'تحويل PDF إلى Word (OCR)',
    pdfEditor: 'استوديو محرر PDF التفاعلي',
    imageStudio: 'استوديو معالجة وتحسين الصور',
    ocrText: 'استخراج النصوص من الصور (OCR)',
    markItDown: 'استوديو MarkItDown للذكاء الاصطناعي',
  },
  hi: {
    shareApp: 'दोस्तों के साथ ऐप शेयर करें',
    engineTitle: '500 MB क्लाइंट-साइड इंजन',
    engineDesc: 'ब्राउज़र में सीधे भारी दस्तावेज़ और मीडिया फ़ाइलें प्रोसेस करें।',
    privacyTitle: '100% इन-ब्राउज़र गोपनीयता',
    privacyDesc: 'आपकी फ़ाइलें कभी किसी बाहरी सर्वर पर अपलोड नहीं होती हैं।',
    toolsBadgeTitle: '220+ क्लाइंट-साइड टूल्स',
    toolsBadgeDesc: 'PDF, इमेज, वीडियो, OCR, कोडिंग व गणित टूल्स।',
    categoriesTitle: 'लोकप्रिय श्रेणियां',
    pdfTools: 'PDF टूल्स व एडिटर',
    imageTools: 'इमेज टूल्स व स्टूडियो',
    ocrTools: 'OCR व टेक्स्ट एक्सट्रैक्टर',
    workflowTools: 'स्वचालित वर्कफ़्लो',
    viewAllCategories: 'सभी 220+ टूल्स देखें →',
    viewAllTools: 'सभी 220+ टूल्स देखें →',
    pdfToWord: 'PDF से Word (OCR)',
    pdfEditor: 'PDF एडिटर स्टूडियो',
    imageStudio: 'इमेज स्टूडियो सूट',
    ocrText: 'इमेज से टेक्स्ट निकालें (OCR)',
    markItDown: 'MarkItDown AI स्टूडियो',
  },
};

export function Footer() {
  const { t, language, setLanguage, isRTL } = useI18n();
  const loc = FOOTER_LOCALES[language] || FOOTER_LOCALES.en;

  return (
    <footer
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 mt-10 sm:mt-20 transition-colors"
    >
      {/* 3 Core Trust Badges */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left rtl:sm:text-right">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-800 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{loc.engineTitle}</p>
              <p className="text-[11px] text-slate-500">{loc.engineDesc}</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{loc.privacyTitle}</p>
              <p className="text-[11px] text-slate-500">{loc.privacyDesc}</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{loc.toolsBadgeTitle}</p>
              <p className="text-[11px] text-slate-500">{loc.toolsBadgeDesc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 select-none">
              <span className="text-xl font-black tracking-tight text-brand-600 dark:text-brand-400">
                MIFTAH <span className="px-1.5 py-0.5 rounded-md bg-brand-600 text-white text-[10px] ml-0.5 uppercase font-black">TOOLS</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {t.footer.desc}
            </p>

            {/* Language Quick Switcher & Share App Trigger */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-slate-400" />
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'ur', label: 'اردو' },
                    { id: 'ar', label: 'العربية' },
                    { id: 'hi', label: 'हिन्दी' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLanguage(l.id as any)}
                      className={`px-2 py-0.5 rounded-md text-[11px] transition-all ${
                        language === l.id
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    shareAppNative(language);
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-brand-50 dark:bg-slate-800 dark:hover:bg-brand-950/50 text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all active:scale-95 shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>{loc.shareApp}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Categories & Key Hubs */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-600" />
              {loc.categoriesTitle}
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/tools?category=pdf" className="hover:text-brand-600 transition-colors">
                  {loc.pdfTools}
                </Link>
              </li>
              <li>
                <Link href="/tools?category=image" className="hover:text-brand-600 transition-colors">
                  {loc.imageTools}
                </Link>
              </li>
              <li>
                <Link href="/ocr" className="hover:text-brand-600 transition-colors">
                  {loc.ocrTools}
                </Link>
              </li>
              <li>
                <Link href="/workflows" className="hover:text-brand-600 transition-colors">
                  {loc.workflowTools}
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
                  {loc.viewAllCategories}
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 2: Tools & Utilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-brand-600" />
              {t.footer.tools}
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/tools/pdf-to-docx" className="hover:text-brand-600 transition-colors">
                  {loc.pdfToWord}
                </Link>
              </li>
              <li>
                <Link href="/pdf-editor" className="hover:text-brand-600 transition-colors">
                  {loc.pdfEditor}
                </Link>
              </li>
              <li>
                <Link href="/image-studio" className="hover:text-brand-600 transition-colors">
                  {loc.imageStudio}
                </Link>
              </li>
              <li>
                <Link href="/ocr" className="hover:text-brand-600 transition-colors">
                  {loc.ocrText}
                </Link>
              </li>
              <li>
                <Link href="/markitdown" className="hover:text-brand-600 transition-colors font-bold text-brand-600 dark:text-brand-400">
                  🤖 {loc.markItDown}
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
                  {loc.viewAllTools}
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Information & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-600" />
              {t.footer.helpSupport}
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/about" className="hover:text-brand-600 transition-colors">
                  {t.footer.aboutPlatform}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand-600 transition-colors">
                  {t.footer.faq}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-600 transition-colors">
                  {t.footer.contactUs}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-600 transition-colors">
                  {t.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-600 transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-brand-600 transition-colors">
                  {t.footer.refundPolicy}
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover:text-brand-600 transition-colors">
                  {t.footer.userGuidelines}
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-brand-600 transition-colors">
                  {t.footer.disclaimer}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 Miftah Tools. {t.footer.rights}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.footer.poweredBy}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
