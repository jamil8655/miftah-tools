'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  HelpCircle,
  Mail,
  FileText,
  CreditCard,
  AlertCircle,
  Globe2,
  Smartphone,
  Layers,
  Info,
  Scale,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const FOOTER_LOCALES = {
  en: {
    engineTitle: '500 MB Client-Side Engine',
    engineDesc: 'Transform massive documents & media smoothly in-browser.',
    privacyTitle: '100% In-Browser Privacy',
    privacyDesc: 'Files never touch external servers or get stored remotely.',
    toolsTitle: '220+ Free Digital Tools',
    toolsDesc: 'Fast, unlimited & 100% private in-browser utilities.',
    viewAllTools: 'Explore All 220+ Tools →',
    pdfDocsHeading: 'PDF & Documents',
    popularHeading: 'Popular Utilities',
    supportHeading: 'Help & Support',
    legalHeading: 'Legal & Privacy',
    pdfToWord: 'PDF to Word (OCR)',
    pdfCompress: 'Compress PDF',
    pdfMerge: 'Merge PDF',
    pdfEditor: 'PDF Editor Studio',
    pdfSign: 'Sign & Stamp PDF',
    textToPdf: 'Text to PDF Studio',
    imageStudio: 'Image Studio Suite',
    ocrText: 'OCR Image to Text',
    qrBarcode: 'QR & Barcode Generator',
    mediaTools: 'Media & Audio Tools',
    about: 'About Platform',
    faq: 'FAQs & Help',
    contact: 'Contact Support',
    guidelines: 'Usage Guidelines',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    refund: 'Refund Policy',
    disclaimer: 'Legal Disclaimer',
  },
  ur: {
    engineTitle: '500 ایم بی کلائنٹ سائیڈ انجن',
    engineDesc: 'بڑی دستاویزات اور میڈیا کو براؤزر کے اندر آسانی سے پروسیس کریں۔',
    privacyTitle: '100% مکمل رازداری کی ضمانت',
    privacyDesc: 'آپ کی فائلیں کبھی بھی بیرونی سرور پر اپلوڈ نہیں ہوتیں۔',
    toolsTitle: '220+ مفت ڈیجیٹل ٹولز',
    toolsDesc: 'براؤزر میں تیز رفتار، لامحدود اور مکمل نجی استعمال۔',
    viewAllTools: 'تمام 220+ ٹولز دیکھیں ←',
    pdfDocsHeading: 'پی ڈی ایف اور دستاویزات',
    popularHeading: 'مقبول ٹولز',
    supportHeading: 'مدد اور رہنمائی',
    legalHeading: 'قوانین و پرائیویسی',
    pdfToWord: 'پی ڈی ایف سے ورڈ (OCR)',
    pdfCompress: 'پی ڈی ایف کمپریس',
    pdfMerge: 'پی ڈی ایف یکجا کریں (Merge)',
    pdfEditor: 'پی ڈی ایف ایڈیٹر اسٹوڈیو',
    pdfSign: 'سائن و مہر پی ڈی ایف',
    textToPdf: 'ٹیکسٹ ٹو پی ڈی ایف اسٹوڈیو',
    imageStudio: 'امیج اسٹوڈیو سویٹ',
    ocrText: 'تصویر سے ٹیکسٹ نکالیں (OCR)',
    qrBarcode: 'کیو آر اور بارکوڈ میکر',
    mediaTools: 'میڈیا و آڈیو ٹولز',
    about: 'پلیٹ فارم کا تعارف',
    faq: 'اکثر پوچھے گئے سوالات',
    contact: 'رابطہ سپورٹ',
    guidelines: 'استعمال کے رہنما اصول',
    privacy: 'پرائیویسی پالیسی',
    terms: 'شرائط و ضوابط',
    refund: 'ریفنڈ پالیسی',
    disclaimer: 'قانونی اعلان',
  },
  ar: {
    engineTitle: 'محرك محلي فائق بسعة 500 ميجابايت',
    engineDesc: 'معالجة المستندات والوسائط الضخمة مباشرة وبسلاسة في المتصفح.',
    privacyTitle: 'خصوصية وأمان محلي بنسبة 100%',
    privacyDesc: 'ملفاتك لا تغادر جهازك ولا يتم تخزينها على أي خادم خارجي.',
    toolsTitle: '220+ أداة رقمية مجانية',
    toolsDesc: 'معالجة فورية وغير محدودة بخصوصية تامة في المتصفح.',
    viewAllTools: 'استكشف جميع الأدوات 220+ ←',
    pdfDocsHeading: 'PDF والمستندات',
    popularHeading: 'أدوات مميزة',
    supportHeading: 'المساعدة والدعم',
    legalHeading: 'السياسات والخصوصية',
    pdfToWord: 'تحويل PDF إلى Word (OCR)',
    pdfCompress: 'ضغط ملفات PDF',
    pdfMerge: 'دمج وتجميع PDF',
    pdfEditor: 'استوديو محرر PDF',
    pdfSign: 'توقيع وختم PDF',
    textToPdf: 'استوديو النص إلى PDF',
    imageStudio: 'استوديو تحرير الصور',
    ocrText: 'استخراج النصوص (OCR)',
    qrBarcode: 'توليد الرموز و QR',
    mediaTools: 'أدوات الصوت والوسائط',
    about: 'عن المنصة',
    faq: 'الأسئلة الشائعة',
    contact: 'الدعم الفني والاتصال',
    guidelines: 'إرشادات الاستخدام',
    privacy: 'سياسة الخصوصية',
    terms: 'شروط الخدمة',
    refund: 'سياسة الاسترجاع',
    disclaimer: 'إخلاء المسؤولية القانوني',
  },
  hi: {
    engineTitle: '500 MB क्लाइंट-साइड इंजन',
    engineDesc: 'ब्राउज़र में सीधे भारी दस्तावेज़ और मीडिया फ़ाइलें प्रोसेस करें।',
    privacyTitle: '100% इन-ब्राउज़र गोपनीयता',
    privacyDesc: 'आपकी फ़ाइलें कभी किसी बाहरी सर्वर पर अपलोड नहीं होती हैं।',
    toolsTitle: '220+ मुफ़्त डिजिटल टूल्स',
    toolsDesc: 'असीमित, तेज़ और 100% प्राइवेट इन-ब्राउज़र यूटिलिटीज।',
    viewAllTools: 'सभी 220+ टूल्स देखें →',
    pdfDocsHeading: 'PDF व दस्तावेज़',
    popularHeading: 'लोकप्रिय टूल्स',
    supportHeading: 'मदद और सहायता',
    legalHeading: 'कानूनी व गोपनीयता',
    pdfToWord: 'PDF से Word (OCR)',
    pdfCompress: 'PDF कंप्रेस करें',
    pdfMerge: 'PDF मर्ज करें',
    pdfEditor: 'PDF एडिटर स्टूडियो',
    pdfSign: 'हस्ताक्षर व स्टाम्प PDF',
    textToPdf: 'टेक्स्ट टू PDF स्टूडियो',
    imageStudio: 'इमेज स्टूडियो सूट',
    ocrText: 'फोटो से टेक्स्ट (OCR)',
    qrBarcode: 'QR व बारकोड जनरेटर',
    mediaTools: 'मीडिया व ऑडियो टूल्स',
    about: 'प्लेटफ़ॉर्म के बारे में',
    faq: 'अक्सर पूछे जाने वाले सवाल',
    contact: 'सपोर्ट से संपर्क करें',
    guidelines: 'उपयोग दिशानिर्देश',
    privacy: 'गोपनीयता नीति',
    terms: 'सेवा की शर्तें',
    refund: 'रिफंड नीति',
    disclaimer: 'कानूनी अस्वीकरण',
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center sm:text-left rtl:sm:text-right">
          <div className="flex items-center justify-center sm:justify-start gap-3 p-2 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 sm:bg-transparent">
            <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-800 shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-left rtl:text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{loc.engineTitle}</p>
              <p className="text-[11px] text-slate-500">{loc.engineDesc}</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 p-2 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 sm:bg-transparent">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-left rtl:text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{loc.privacyTitle}</p>
              <p className="text-[11px] text-slate-500">{loc.privacyDesc}</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 p-2 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 sm:bg-transparent">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-left rtl:text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{loc.toolsTitle}</p>
              <p className="text-[11px] text-slate-500">{loc.toolsDesc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
        {/* Main Columns Grid: Brand section on left/top, 2-Column Links on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand & App Card Section (Full width on mobile, 4-cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 select-none">
              <span className="text-xl font-black tracking-tight text-brand-600 dark:text-brand-400">
                MIFTAH <span className="px-1.5 py-0.5 rounded-md bg-brand-600 text-white text-[10px] ml-0.5 uppercase font-black">TOOLS</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {t.footer.desc || 'High-performance, 100% private, client-side digital utilities running entirely in your browser with zero server file transfers.'}
            </p>

            {/* Official Google Play Store Download Card */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 max-w-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Official Android App</h4>
                  <p className="text-[10px] text-slate-400">100% Free • On-Device Privacy</p>
                </div>
              </div>

              <div className="pt-0.5">
                <a
                  href="https://play.google.com/store/apps/details?id=com.miftahtools.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700/80 transition-all shadow-sm active:scale-95 group select-none w-full justify-center sm:w-auto sm:justify-start"
                  aria-label="Get Miftah Tools on Google Play"
                >
                  <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 512 512">
                    <path fill="#00D3FF" d="M30.4 17.8c-7.7 8.2-12.4 20.3-12.4 35.5v405.4c0 15.2 4.7 27.3 12.4 35.5l2.4 2.2 231-231v-5.8L32.8 15.6l-2.4 2.2z" />
                    <path fill="#FF3A44" d="M340.5 341.2l-76.7-76.7v-5.8l76.7-76.7 1.8 1 90.7 51.5c25.9 14.7 25.9 38.8 0 53.6l-90.7 51.5-1.8 1.6z" />
                    <path fill="#00E676" d="M342.3 342.8L263.8 264 32.8 495.2c8.5 9 22.7 10.1 38.6 1.1l270.9-153.5z" />
                    <path fill="#FFD400" d="M342.3 169.2L71.4 15.7C55.5 6.7 41.3 7.8 32.8 16.8L263.8 248l78.5-78.8z" />
                  </svg>
                  <div className="text-left rtl:text-right">
                    <div className="text-[8px] uppercase tracking-wider text-slate-300 font-bold leading-none">GET IT ON</div>
                    <div className="text-[12px] font-black tracking-tight text-white leading-none mt-0.5">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Language Quick Switcher */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2">
                <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                <div className="flex flex-wrap items-center gap-1 text-xs font-bold">
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
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Links Section: Exactly 2 Equal Columns on Mobile (बाएं / दाएं - 50/50), 3 Columns on Tablet/Desktop */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 pt-4 lg:pt-0 border-t border-slate-200 dark:border-slate-800 lg:border-t-0">
            
            {/* COLUMN 1: LEFT SIDE (बाएं) - PDF & Documents + Quick Tools */}
            <div className="space-y-6">
              {/* PDF Subgroup */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>{loc.pdfDocsHeading}</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <li>
                    <Link href="/tools/pdf-to-docx" className="hover:text-brand-600 transition-colors block">
                      {loc.pdfToWord}
                    </Link>
                  </li>
                  <li>
                    <Link href="/tools/compress-pdf" className="hover:text-brand-600 transition-colors block">
                      {loc.pdfCompress}
                    </Link>
                  </li>
                  <li>
                    <Link href="/tools/merge-pdf" className="hover:text-brand-600 transition-colors block">
                      {loc.pdfMerge}
                    </Link>
                  </li>
                  <li>
                    <Link href="/pdf-editor" className="hover:text-brand-600 transition-colors block">
                      {loc.pdfEditor}
                    </Link>
                  </li>
                  <li>
                    <Link href="/pdf-signer" className="hover:text-brand-600 transition-colors block">
                      {loc.pdfSign}
                    </Link>
                  </li>
                  <li>
                    <Link href="/tools/text-to-pdf" className="hover:text-brand-600 transition-colors font-bold text-brand-600 dark:text-brand-400 inline-flex items-center gap-1">
                      <span>{loc.textToPdf}</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Popular Media Subgroup */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-800/70 md:hidden">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>{loc.popularHeading}</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <li>
                    <Link href="/image-studio" className="hover:text-brand-600 transition-colors block">
                      {loc.imageStudio}
                    </Link>
                  </li>
                  <li>
                    <Link href="/ocr" className="hover:text-brand-600 transition-colors block">
                      {loc.ocrText}
                    </Link>
                  </li>
                  <li>
                    <Link href="/tools" className="text-brand-600 dark:text-brand-400 font-bold hover:underline block pt-1">
                      {loc.viewAllTools}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* COLUMN 2 (Desktop only middle col): Tools & Utilities */}
            <div className="space-y-3 hidden md:block">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>{loc.popularHeading}</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li>
                  <Link href="/image-studio" className="hover:text-brand-600 transition-colors block">
                    {loc.imageStudio}
                  </Link>
                </li>
                <li>
                  <Link href="/ocr" className="hover:text-brand-600 transition-colors block">
                    {loc.ocrText}
                  </Link>
                </li>
                <li>
                  <Link href="/tools" className="hover:text-brand-600 transition-colors block">
                    {loc.qrBarcode}
                  </Link>
                </li>
                <li>
                  <Link href="/tools" className="hover:text-brand-600 transition-colors block">
                    {loc.mediaTools}
                  </Link>
                </li>
                <li>
                  <Link href="/tools" className="text-brand-600 dark:text-brand-400 font-bold hover:underline block pt-2">
                    {loc.viewAllTools}
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 3: RIGHT SIDE (दाएं on mobile) - Help, Support & Legal Policies */}
            <div className="space-y-6">
              {/* Help & Support Subgroup */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>{loc.supportHeading}</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <li>
                    <Link href="/about" className="hover:text-brand-600 transition-colors block">
                      {loc.about}
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="hover:text-brand-600 transition-colors block">
                      {loc.faq}
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-brand-600 transition-colors block">
                      {loc.contact}
                    </Link>
                  </li>
                  <li>
                    <Link href="/guidelines" className="hover:text-brand-600 transition-colors block">
                      {loc.guidelines}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal & Policies Subgroup */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-800/70">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>{loc.legalHeading}</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <li>
                    <Link href="/privacy" className="hover:text-brand-600 transition-colors block">
                      {loc.privacy}
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-brand-600 transition-colors block">
                      {loc.terms}
                    </Link>
                  </li>
                  <li>
                    <Link href="/refund" className="hover:text-brand-600 transition-colors block">
                      {loc.refund}
                    </Link>
                  </li>
                  <li>
                    <Link href="/disclaimer" className="hover:text-brand-600 transition-colors block">
                      {loc.disclaimer}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-slate-400 text-center sm:text-left rtl:sm:text-right">
          <p>© 2026 Miftah Tools. {t.footer.rights}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://play.google.com/store/apps/details?id=com.miftahtools.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline inline-flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Google Play Store</span>
            </a>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
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
