'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  GraduationCap,
  HelpCircle,
  Mail,
  FileText,
  CreditCard,
  AlertCircle,
  BookOpen,
  Globe2,
  Share2,
  Download,
  Smartphone,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { shareAppNative } from '@/lib/native/android-bridge';
import { triggerHaptic } from '@/lib/motion/motion-system';

const FOOTER_LOCALES = {
  en: {
    shareApp: 'Share App',
    getAndroidApp: 'Get on Google Play',
    officialAppDesc: 'Install the official Miftah Tools Android app for 100% offline document & media processing with zero data limits.',
    engineTitle: '500 MB Client-Side Engine',
    engineDesc: 'Transform massive documents & media smoothly in-browser.',
    privacyTitle: '100% In-Browser Privacy',
    privacyDesc: 'Files never touch external servers or get stored remotely.',
    toolsTitle: '220+ Free Digital Tools',
    toolsDesc: 'Fast, unlimited & 100% private in-browser utilities.',
    viewAllTools: 'Explore All 220+ Tools →',
    pdfToWord: 'PDF to Word (OCR)',
    pdfEditor: 'PDF Editor Studio',
    imageStudio: 'Image Studio Suite',
    ocrText: 'OCR Image to Text',
    textToPdf: 'Document Studio & Text to PDF',
  },
  ur: {
    shareApp: 'ایپ شیئر کریں',
    getAndroidApp: 'گوگل پلے پر حاصل کریں',
    officialAppDesc: 'مفتاح ٹولز کی آفیشل اینڈرائیڈ ایپ پلے اسٹور سے انسٹال کریں اور 100% آف لائن تیز رفتار پروسیسنگ حاصل کریں۔',
    engineTitle: '500 ایم بی کلائنٹ سائیڈ انجن',
    engineDesc: 'بڑی دستاویزات اور میڈیا کو براؤزر کے اندر آسانی سے پروسیس کریں۔',
    privacyTitle: '100% مکمل رازداری کی ضمانت',
    privacyDesc: 'آپ کی فائلیں کبھی بھی بیرونی سرور پر اپلوڈ نہیں ہوتیں۔',
    toolsTitle: '220+ مفت ڈیجیٹل ٹولز',
    toolsDesc: 'براؤزر میں تیز رفتار، لامحدود اور مکمل نجی استعمال۔',
    viewAllTools: 'تمام 220+ ٹولز دیکھیں ←',
    pdfToWord: 'پی ڈی ایف سے ورڈ (OCR)',
    pdfEditor: 'پی ڈی ایف ایڈیٹر اسٹوڈیو',
    imageStudio: 'امیج اسٹوڈیو سویٹ',
    ocrText: 'تصویر سے ٹیکسٹ نکالیں (OCR)',
    textToPdf: 'دستاویز اسٹوڈیو و ٹیکسٹ ٹو پی ڈی ایف',
  },
  ar: {
    shareApp: 'مشاركة التطبيق',
    getAndroidApp: 'تحميل من Google Play',
    officialAppDesc: 'حمل تطبيق مفتاح تولز الرسمي للأندرويد لمعالجة كافة المستندات والصور بدون اتصال بالإنترنت وبخصوصية تامة.',
    engineTitle: 'محرك محلي فائق بسعة 500 ميجابايت',
    engineDesc: 'معالجة المستندات والوسائط الضخمة مباشرة وبسلاسة في المتصفح.',
    privacyTitle: 'خصوصية وأمان محلي بنسبة 100%',
    privacyDesc: 'ملفاتك لا تغادر جهازك ولا يتم تخزينها على أي خادم خارجي.',
    toolsTitle: '220+ أداة رقمية مجانية',
    toolsDesc: 'معالجة فورية وغير محدودة بخصوصية تامة في المتصفح.',
    viewAllTools: 'استكشف جميع الأدوات 220+ ←',
    pdfToWord: 'تحويل PDF إلى Word (OCR)',
    pdfEditor: 'استوديو محرر PDF التفاعلي',
    imageStudio: 'استوديو معالجة وتحسين الصور',
    ocrText: 'استخراج النصوص من الصور (OCR)',
    textToPdf: 'استوديو المستندات وتحويل النص إلى PDF',
  },
  hi: {
    shareApp: 'ऐप शेयर करें',
    getAndroidApp: 'Google Play से डाउनलोड करें',
    officialAppDesc: 'मिफ़्ताह टूल्स का आधिकारिक एंड्रॉइड ऐप इंस्टॉल करें और 100% ऑफ़लाइन दस्तावेज़ व मीडिया फ़ाइलें प्रोसेस करें।',
    engineTitle: '500 MB क्लाइंट-साइड इंजन',
    engineDesc: 'ब्राउज़र में सीधे भारी दस्तावेज़ और मीडिया फ़ाइलें प्रोसेस करें।',
    privacyTitle: '100% इन-ब्राउज़र गोपनीयता',
    privacyDesc: 'आपकी फ़ाइलें कभी किसी बाहरी सर्वर पर अपलोड नहीं होती हैं।',
    toolsTitle: '220+ मुफ़्त डिजिटल टूल्स',
    toolsDesc: 'असीमित, तेज़ और 100% प्राइवेट इन-ब्राउज़र यूटिलिटीज।',
    viewAllTools: 'सभी 220+ टूल्स देखें →',
    pdfToWord: 'PDF से Word (OCR)',
    pdfEditor: 'PDF एडिटर स्टूडियो',
    imageStudio: 'इमेज स्टूडियो सूट',
    ocrText: 'फोटो से टेक्स्ट निकालें (OCR)',
    textToPdf: 'डॉक्यूमेंट स्टूडियो व टेक्स्ट टू PDF',
  },
};

export function Footer() {
  const { t, language, setLanguage, isRTL } = useI18n();
  const loc = FOOTER_LOCALES[language] || FOOTER_LOCALES.en;

  return (
    <footer
      dir={isRTL ? 'rtl' : 'ltr'}
      className="block w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 mt-12 sm:mt-20 transition-colors pb-16 lg:pb-8"
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
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{loc.toolsTitle}</p>
              <p className="text-[11px] text-slate-500">{loc.toolsDesc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand Col with Google Play Store badge */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 select-none">
              <span className="text-xl font-black tracking-tight text-brand-600 dark:text-brand-400">
                MIFTAH <span className="px-1.5 py-0.5 rounded-md bg-brand-600 text-white text-[10px] ml-0.5 uppercase font-black">TOOLS</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {t.footer.desc || 'High-performance, 100% private, client-side digital utilities running entirely in your browser with zero server file transfers.'}
            </p>

            {/* Official Google Play Store Download Card */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 max-w-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Official Android App</h4>
                  <p className="text-[10px] text-slate-400">100% Free • On-Device Privacy</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <a
                  href="https://play.google.com/store/apps/details?id=com.miftahtools.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700/80 transition-all shadow-md active:scale-95 group select-none"
                  aria-label="Get Miftah Tools on Google Play"
                >
                  <svg className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 512 512">
                    <path fill="#00D3FF" d="M30.4 17.8c-7.7 8.2-12.4 20.3-12.4 35.5v405.4c0 15.2 4.7 27.3 12.4 35.5l2.4 2.2 231-231v-5.8L32.8 15.6l-2.4 2.2z" />
                    <path fill="#FF3A44" d="M340.5 341.2l-76.7-76.7v-5.8l76.7-76.7 1.8 1 90.7 51.5c25.9 14.7 25.9 38.8 0 53.6l-90.7 51.5-1.8 1.6z" />
                    <path fill="#00E676" d="M342.3 342.8L263.8 264 32.8 495.2c8.5 9 22.7 10.1 38.6 1.1l270.9-153.5z" />
                    <path fill="#FFD400" d="M342.3 169.2L71.4 15.7C55.5 6.7 41.3 7.8 32.8 16.8L263.8 248l78.5-78.8z" />
                  </svg>
                  <div className="text-left rtl:text-right">
                    <div className="text-[9px] uppercase tracking-wider text-slate-300 font-bold leading-none">GET IT ON</div>
                    <div className="text-[13px] font-black tracking-tight text-white leading-none mt-1">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Language Quick Switcher */}
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
            </div>
          </div>

          {/* Section 1: PDF & Document Utilities */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-600" />
              <span>PDF & Documents</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/tools/pdf-to-docx" className="hover:text-brand-600 transition-colors">
                  {loc.pdfToWord}
                </Link>
              </li>
              <li>
                <Link href="/tools/compress-pdf" className="hover:text-brand-600 transition-colors">
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/merge-pdf" className="hover:text-brand-600 transition-colors">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf-editor" className="hover:text-brand-600 transition-colors">
                  {loc.pdfEditor}
                </Link>
              </li>
              <li>
                <Link href="/pdf-signer" className="hover:text-brand-600 transition-colors">
                  Sign & Stamp PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/text-to-pdf" className="hover:text-brand-600 transition-colors font-bold text-brand-600 dark:text-brand-400 inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{loc.textToPdf}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 2: Tools & Utilities */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>{t.footer.tools}</span>
            </h3>
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
                <Link href="/tools/text-to-pdf" className="hover:text-brand-600 transition-colors font-bold text-brand-600 dark:text-brand-400 inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{loc.textToPdf}</span>
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
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-600" />
              <span>{t.footer.helpSupport}</span>
            </h3>
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
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://play.google.com/store/apps/details?id=com.miftahtools.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline inline-flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Google Play Store</span>
            </a>
            <span className="text-slate-300 dark:text-slate-700">•</span>
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
