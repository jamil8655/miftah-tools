'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Sparkles,
  HelpCircle,
  Scale,
  Plus,
  Minus,
  Smartphone,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const FOOTER_LOCALES = {
  en: {
    brandDesc: '220+ fast, useful and privacy-focused digital tools running directly in your browser.',
    engineTitle: '500 MB Client-Side Engine',
    engineDesc: 'Transform massive documents & media smoothly in-browser.',
    privacyTitle: '100% In-Browser Privacy',
    privacyDesc: 'Files never touch external servers or get stored remotely.',
    toolsTitle: '220+ Free Digital Tools',
    toolsDesc: 'Fast, unlimited & 100% private in-browser utilities.',
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
    viewAllTools: 'Explore All 220+ Tools →',
    about: 'About Platform',
    faq: 'FAQs & Help',
    contact: 'Contact Support',
    guidelines: 'Usage Guidelines',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    refund: 'Refund Policy',
    disclaimer: 'Legal Disclaimer',
    rights: 'All rights reserved.',
    poweredBy: '100% Client-Side In-Memory Engine.',
  },
  ur: {
    brandDesc: 'براؤزر کے اندر براہ راست چلنے والے 220 سے زائد تیز، مفید اور پرائیویٹ ڈیجیٹل ٹولز۔',
    engineTitle: '500 ایم بی کلائنٹ سائیڈ انجن',
    engineDesc: 'بڑی دستاویزات اور میڈیا کو براؤزر کے اندر آسانی سے پروسیس کریں۔',
    privacyTitle: '100% مکمل رازداری کی ضمانت',
    privacyDesc: 'آپ کی فائلیں کبھی بھی بیرونی سرور پر اپلوڈ نہیں ہوتیں۔',
    toolsTitle: '220+ مفت ڈیجیٹل ٹولز',
    toolsDesc: 'براؤزر میں تیز رفتار، لامحدود اور مکمل نجی استعمال۔',
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
    viewAllTools: 'تمام 220+ ٹولز دیکھیں ←',
    about: 'پلیٹ فارم کا تعارف',
    faq: 'اکثر پوچھے گئے سوالات',
    contact: 'رابطہ سپورٹ',
    guidelines: 'استعمال کے رہنما اصول',
    privacy: 'پرائیویسی پالیسی',
    terms: 'شرائط و ضوابط',
    refund: 'ریفنڈ پالیسی',
    disclaimer: 'قانونی اعلان',
    rights: 'جملہ حقوق محفوظ ہیں۔',
    poweredBy: '100% کلائنٹ سائیڈ محفوظ انجن۔',
  },
  ar: {
    brandDesc: 'أكثر من 220 أداة رقمية سريعة ومجانية تعمل مباشرة في متصفحك بخصوصية تامة.',
    engineTitle: 'محرك محلي فائق بسعة 500 ميجابايت',
    engineDesc: 'معالجة المستندات والوسائط الضخمة مباشرة وبسلاسة في المتصفح.',
    privacyTitle: 'خصوصية وأمان محلي بنسبة 100%',
    privacyDesc: 'ملفاتك لا تغادر جهازك ولا يتم تخزينها على أي خادم خارجي.',
    toolsTitle: '220+ أداة رقمية مجانية',
    toolsDesc: 'معالجة فورية وغير محدودة بخصوصية تامة في المتصفح.',
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
    viewAllTools: 'استكشف جميع الأدوات 220+ ←',
    about: 'عن المنصة',
    faq: 'الأسئلة الشائعة',
    contact: 'الدعم الفني والاتصال',
    guidelines: 'إرشادات الاستخدام',
    privacy: 'سياسة الخصوصية',
    terms: 'شروط الخدمة',
    refund: 'سياسة الاسترجاع',
    disclaimer: 'إخلاء المسؤولية القانوني',
    rights: 'جميع الحقوق محفوظة.',
    poweredBy: 'محرك معالجة محلي خاص بنسبة 100%.',
  },
  hi: {
    brandDesc: 'ब्राउज़र में सीधे चलने वाले 220+ तेज़, उपयोगी और 100% प्राइवेट डिजिटल टूल्स।',
    engineTitle: '500 MB क्लाइंट-साइड इंजन',
    engineDesc: 'ब्राउज़र में सीधे भारी दस्तावेज़ और मीडिया फ़ाइलें प्रोसेस करें।',
    privacyTitle: '100% इन-ब्राउज़र गोपनीयता',
    privacyDesc: 'आपकी फ़ाइलें कभी किसी बाहरी सर्वर पर अपलोड नहीं होती हैं।',
    toolsTitle: '220+ मुफ़्त डिजिटल टूल्स',
    toolsDesc: 'असीमित, तेज़ और 100% प्राइवेट इन-ब्राउज़र यूटिलिटीज।',
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
    viewAllTools: 'सभी 220+ टूल्स देखें →',
    about: 'प्लेटफ़ॉर्म के बारे में',
    faq: 'अक्सर पूछे जाने वाले सवाल',
    contact: 'सपोर्ट से संपर्क करें',
    guidelines: 'उपयोग दिशानिर्देश',
    privacy: 'गोपनीयता नीति',
    terms: 'सेवा की शर्तें',
    refund: 'रिफंड नीति',
    disclaimer: 'कानूनी अस्वीकरण',
    rights: 'सर्वाधिकार सुरक्षित।',
    poweredBy: '100% क्लाइंट-साइड सुरक्षित इंजन।',
  },
};

export function Footer() {
  const { language, isRTL } = useI18n();
  const loc = FOOTER_LOCALES[language] || FOOTER_LOCALES.en;

  // Mobile Accordion open state (collapsed by default as requested in prompt)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    pdf: false,
    tools: false,
    support: false,
    legal: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const sections = [
    {
      key: 'pdf',
      title: loc.pdfDocsHeading,
      icon: FileText,
      links: [
        { label: loc.pdfToWord, href: '/tools/pdf-to-docx' },
        { label: loc.pdfCompress, href: '/tools/compress-pdf' },
        { label: loc.pdfMerge, href: '/tools/merge-pdf' },
        { label: loc.pdfEditor, href: '/pdf-editor' },
        { label: loc.pdfSign, href: '/pdf-signer' },
        { label: loc.textToPdf, href: '/tools/text-to-pdf' },
      ],
    },
    {
      key: 'tools',
      title: loc.popularHeading,
      icon: Sparkles,
      links: [
        { label: loc.imageStudio, href: '/image-studio' },
        { label: loc.ocrText, href: '/ocr' },
        { label: loc.qrBarcode, href: '/tools' },
        { label: loc.mediaTools, href: '/tools' },
        { label: loc.viewAllTools, href: '/tools', isHighlight: true },
      ],
    },
    {
      key: 'support',
      title: loc.supportHeading,
      icon: HelpCircle,
      links: [
        { label: loc.about, href: '/about' },
        { label: loc.faq, href: '/faq' },
        { label: loc.contact, href: '/contact' },
        { label: loc.guidelines, href: '/guidelines' },
      ],
    },
    {
      key: 'legal',
      title: loc.legalHeading,
      icon: Scale,
      links: [
        { label: loc.privacy, href: '/privacy' },
        { label: loc.terms, href: '/terms' },
        { label: loc.refund, href: '/refund' },
        { label: loc.disclaimer, href: '/disclaimer' },
      ],
    },
  ];

  return (
    <footer
      dir={isRTL ? 'rtl' : 'ltr'}
      className="block w-full border-t border-[#E1E7EC] dark:border-slate-800 bg-[#F5F7F9] dark:bg-[#0c1017] text-[#687587] dark:text-slate-400 mt-12 sm:mt-20 transition-colors pb-16 lg:pb-8"
    >
      {/* 3 Core Trust Badges */}
      <div className="border-b border-[#E1E7EC] dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left rtl:text-right">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F5F7F9]/80 dark:bg-slate-800/40 border border-[#E1E7EC]/80 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#182230] dark:text-white">{loc.engineTitle}</p>
              <p className="text-[11px] text-[#687587] dark:text-slate-400">{loc.engineDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F5F7F9]/80 dark:bg-slate-800/40 border border-[#E1E7EC]/80 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#182230] dark:text-white">{loc.privacyTitle}</p>
              <p className="text-[11px] text-[#687587] dark:text-slate-400">{loc.privacyDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F5F7F9]/80 dark:bg-slate-800/40 border border-[#E1E7EC]/80 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#182230] dark:text-white">{loc.toolsTitle}</p>
              <p className="text-[11px] text-[#687587] dark:text-slate-400">{loc.toolsDesc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* MOBILE VIEW: Accordion Style (< md) */}
        <div className="md:hidden space-y-3">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isOpen = !!openSections[sec.key];

            return (
              <div
                key={sec.key}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(sec.key)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left rtl:text-right text-xs font-bold text-[#182230] dark:text-white select-none active:bg-slate-50 dark:active:bg-slate-800/60"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#0B79B7] dark:text-[#38a8f8]" />
                    <span>{sec.title}</span>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#687587] flex items-center justify-center shrink-0">
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#E1E7EC]/60 dark:border-slate-800 animate-in fade-in-50 duration-150">
                    <ul className="space-y-2.5 text-xs text-[#687587] dark:text-slate-400">
                      {sec.links.map((link) => (
                        <li key={link.href + link.label}>
                          <Link
                            href={link.href}
                            className={`block transition-colors ${
                              link.isHighlight
                                ? 'text-[#0B79B7] dark:text-[#38a8f8] font-bold hover:underline pt-1'
                                : 'hover:text-[#0B79B7] dark:hover:text-[#38a8f8]'
                            }`}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* TABLET / DESKTOP VIEW: Multi-Column Grid (>= md) */}
        <div className="hidden md:grid md:grid-cols-4 gap-8">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div key={sec.key} className="space-y-3.5">
                <h3 className="text-xs font-black text-[#182230] dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#0B79B7] dark:text-[#38a8f8]" />
                  <span>{sec.title}</span>
                </h3>
                <ul className="space-y-2 text-xs text-[#687587] dark:text-slate-400">
                  {sec.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className={`transition-colors ${
                          link.isHighlight
                            ? 'text-[#0B79B7] dark:text-[#38a8f8] font-bold hover:underline block pt-1'
                            : 'hover:text-[#0B79B7] dark:hover:text-[#38a8f8] block'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Section 14: FOOTER BRAND AREA */}
        <div className="pt-8 border-t border-[#E1E7EC] dark:border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left rtl:sm:text-right">
            
            {/* Brand Title & Statement */}
            <div className="space-y-1">
              <Link href="/" className="inline-flex items-center gap-1.5 select-none">
                <span className="font-black text-lg tracking-tight text-[#0B79B7] dark:text-[#38a8f8]">
                  MIFTAH
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-[#0B79B7] text-white text-[9px] font-black uppercase">
                  TOOLS
                </span>
              </Link>
              <p className="text-xs text-[#687587] dark:text-slate-400 max-w-md">
                {loc.brandDesc}
              </p>
            </div>

            {/* Official Google Play Store Button */}
            <div className="shrink-0">
              <a
                href="https://play.google.com/store/apps/details?id=com.miftahtools.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700/80 transition-all shadow-xs active:scale-95 group select-none"
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
                  <div className="text-xs font-black tracking-tight text-white leading-none mt-0.5">Google Play</div>
                </div>
              </a>
            </div>
          </div>

          {/* Minimal Bottom Bar */}
          <div className="pt-4 border-t border-[#E1E7EC]/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#687587] dark:text-slate-500 text-center sm:text-left rtl:sm:text-right">
            <p>© 2026 Miftah Tools. {loc.rights}</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <Link href="/privacy" className="hover:text-[#0B79B7] transition-colors">{loc.privacy}</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-[#0B79B7] transition-colors">{loc.terms}</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-[#0B79B7] transition-colors">{loc.contact}</Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
