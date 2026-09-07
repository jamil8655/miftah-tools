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
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const FOOTER_LOCALES = {
  en: {
    engineTitle: '500 MB Client-Side Engine',
    engineDesc: 'Transform massive documents & media smoothly in-browser.',
    privacyTitle: '100% In-Browser Privacy',
    privacyDesc: 'Files never touch external servers or get stored remotely.',
    learningTitle: 'Free & Open Learning Paths',
    learningDesc: 'Browse curriculums & lessons with zero forced locks.',
    webDev: 'Web Development Mastery',
    pythonAi: 'Python & AI Prompt Mastery',
    docEngineering: 'Document Engineering Mastery',
    cyberSec: 'Cyber Security & Encryption',
    viewAllCourses: 'Explore All Courses →',
    viewAllTools: 'Explore All 220+ Tools →',
  },
  ur: {
    engineTitle: '500 ایم بی کلائنٹ سائیڈ انجن',
    engineDesc: 'بڑی دستاویزات اور میڈیا کو براؤزر کے اندر آسانی سے پروسیس کریں۔',
    privacyTitle: '100% مکمل رازداری کی ضمانت',
    privacyDesc: 'آپ کی فائلیں کبھی بھی بیرونی سرور پر اپلوڈ نہیں ہوتیں۔',
    learningTitle: 'مفت اور کھلا تعلیمی نصاب',
    learningDesc: 'مکمل کورسز اور اسباق بغیر کسی رکاوٹ کے حاصل کریں۔',
    webDev: 'جدید ویب ڈویلپمنٹ ماسٹری',
    pythonAi: 'پائتھن اور اے آئی ایجنٹس',
    docEngineering: 'دستاویز اور پی ڈی ایف انجینئرنگ',
    cyberSec: 'سائبر سیکیورٹی اور انکرپشن',
    viewAllCourses: 'تمام کورسز دیکھیں ←',
    viewAllTools: 'تمام 220+ ٹولز دیکھیں ←',
  },
  ar: {
    engineTitle: 'محرك محلي فائق بسعة 500 ميجابايت',
    engineDesc: 'معالجة المستندات والوسائط الضخمة مباشرة وبسلاسة في المتصفح.',
    privacyTitle: 'خصوصية وأمان محلي بنسبة 100%',
    privacyDesc: 'ملفاتك لا تغادر جهازك ولا يتم تخزينها على أي خادم خارجي.',
    learningTitle: 'مسارات تعليمية مجانية ومفتوحة',
    learningDesc: 'استكشف المناهج والدروس التقنية الكاملة بحرية تامة.',
    webDev: 'احتراف تطوير الويب المتكامل',
    pythonAi: 'بايثون وهندسة الأوامر الذكية',
    docEngineering: 'هندسة وأتمتة مستندات PDF',
    cyberSec: 'الأمن السيبراني والتشفير',
    viewAllCourses: 'استكشف جميع الكورسات ←',
    viewAllTools: 'استكشف جميع الأدوات 220+ ←',
  },
  hi: {
    engineTitle: '500 MB क्लाइंट-साइड इंजन',
    engineDesc: 'ब्राउज़र में सीधे भारी दस्तावेज़ और मीडिया फ़ाइलें प्रोसेस करें।',
    privacyTitle: '100% इन-ब्राउज़र गोपनीयता',
    privacyDesc: 'आपकी फ़ाइलें कभी किसी बाहरी सर्वर पर अपलोड नहीं होती हैं।',
    learningTitle: 'निःशुल्क व खुला शिक्षण पाठ्यक्रम',
    learningDesc: 'बिना किसी रुकावट के सम्पूर्ण कोर्सेज और पाठ पढ़ें।',
    webDev: 'वेब डेवलपमेंट मास्टरी',
    pythonAi: 'पायथन व एआई प्रॉम्प्ट मास्टरी',
    docEngineering: 'दस्तावेज़ व PDF इंजीनियरिंग',
    cyberSec: 'साइबर सुरक्षा व एन्क्रिप्शन',
    viewAllCourses: 'सभी कोर्सेज देखें →',
    viewAllTools: 'सभी 220+ टूल्स देखें →',
  },
};

export function Footer() {
  const { t, language, setLanguage, isRTL } = useI18n();
  const loc = FOOTER_LOCALES[language] || FOOTER_LOCALES.en;

  return (
    <footer
      dir={isRTL ? 'rtl' : 'ltr'}
      className="hidden lg:block w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 mt-20 transition-colors"
    >
      {/* Top Banner Guarantees */}
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
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{loc.learningTitle}</p>
              <p className="text-[11px] text-slate-500">{loc.learningDesc}</p>
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

            {/* Language Quick Switcher */}
            <div className="flex items-center gap-2 pt-2">
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

          {/* Section 1: Master Courses & Learning */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-brand-600" />
              {t.footer.courses}
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/courses/modern-fullstack-web-mastery" className="hover:text-brand-600 transition-colors">
                  {loc.webDev}
                </Link>
              </li>
              <li>
                <Link href="/courses/python-ai-prompt-engineering-mastery" className="hover:text-brand-600 transition-colors">
                  {loc.pythonAi}
                </Link>
              </li>
              <li>
                <Link href="/courses/document-pdf-automation-mastery" className="hover:text-brand-600 transition-colors">
                  {loc.docEngineering}
                </Link>
              </li>
              <li>
                <Link href="/courses/cybersecurity-privacy-engineering" className="hover:text-brand-600 transition-colors">
                  {loc.cyberSec}
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-brand-600 transition-colors font-bold text-brand-600 dark:text-brand-400">
                  ⚡ {t.quiz?.title || 'Knowledge Quizzes'}
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
                  {loc.viewAllCourses}
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 2: Tools & Utilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              {t.footer.tools}
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/tools/pdf-to-docx" className="hover:text-brand-600 transition-colors">
                  PDF to Word (OCR)
                </Link>
              </li>
              <li>
                <Link href="/pdf-editor" className="hover:text-brand-600 transition-colors">
                  PDF Editor Studio
                </Link>
              </li>
              <li>
                <Link href="/image-studio" className="hover:text-brand-600 transition-colors">
                  Image Studio Suite
                </Link>
              </li>
              <li>
                <Link href="/ocr" className="hover:text-brand-600 transition-colors">
                  OCR Image to Text
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
