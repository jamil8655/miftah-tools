'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  GraduationCap,
  Cpu,
  Layers,
  CheckCircle2,
  ArrowRight,
  Code,
  Globe2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const ABOUT_LOCALES = {
  en: {
    badge: 'About Miftah Tools Platform',
    heroTitle: 'The Privacy-First Digital Utility & Productivity Suite',
    heroSubtitle: 'Miftah Tools offers 220+ high-performance client-side digital utilities running entirely inside your browser. Transform files instantly with 100% local privacy, zero file uploads, and zero subscription walls.',
    allToolsBtn: 'Explore All 220+ Tools',
    workflowsBtn: 'Smart Workflows',
    pillar1Title: '100% Client-Side Privacy',
    pillar1Desc: 'Every PDF, image, and document is processed directly in your browser using WebAssembly (WASM). Your sensitive files are never uploaded to any remote server.',
    pillar2Title: 'Blazing Fast Execution',
    pillar2Desc: 'Zero network latency on file transformations. Compress, merge, extract text, and calculate at hardware-accelerated speeds.',
    pillar3Title: 'Zero Cost & Open Access',
    pillar3Desc: 'All 220+ tools and utilities are 100% free and open for everyone with zero registration barriers, no payment required, and no hidden file limits.',
    stackTitle: 'What Powers Miftah Tools?',
    stackSubtitle: 'A modern technology stack designed for privacy, resilience, and speed.',
    features: [
      { title: '220+ Client-Side Tools', desc: 'PDF, Image Studio, OCR, QR/Barcode, Dev Toolkit, and Calculators.' },
      { title: 'WebAssembly (WASM) Engine', desc: 'Native binary execution inside the browser memory sandbox.' },
      { title: 'Tesseract OCR Vision', desc: 'Multilingual text extraction directly on your local GPU/CPU.' },
      { title: 'Offline-Ready PWA', desc: 'Install Miftah Tools as an app on Windows, macOS, Android, and iOS.' },
      { title: 'Official Google Play App', desc: 'Native Android application for fast offline processing on mobile devices.' },
      { title: 'Full 4-Language Localization', desc: 'Seamless instant switching between English, Urdu, Arabic, and Hindi with RTL.' },
    ],
    ctaTitle: 'Ready to experience next-generation private tools?',
    ctaSubtitle: 'All 220+ tools and workflows are 100% free and open for everyone. No credit card, no sign-up barrier.',
    ctaBtn: 'Start Using Tools Now',
  },
  ur: {
    badge: 'مفتاح ٹولز پلیٹ فارم کا تعارف',
    heroTitle: 'پرائیویسی پر مبنی جدید ڈیجیٹل ٹولز اور یوٹیلیٹیز',
    heroSubtitle: 'مفتاح ٹولز بغیر کسی سرور اپلوڈ کے 100٪ آپ کے اپنے ڈیوائس پر تیز رفتار فائل پروسیسنگ مہیا کرتا ہے۔ مکمل پرائیویسی کے ساتھ فائلز تبدیل کریں، دستاویزات بنائیں اور حساب کتاب کریں۔',
    allToolsBtn: 'تمام 220+ ٹولز دیکھیں',
    workflowsBtn: 'اسمارٹ ورک فلوز',
    pillar1Title: '100٪ لوکل کلائنٹ سائیڈ پرائیویسی',
    pillar1Desc: 'ہر پی ڈی ایف، تصویر اور دستاویز ویب اسمبلی (WASM) کے ذریعے براہ راست آپ کے براؤزر میں پروسیس ہوتی ہے۔ آپ کا حساس ڈیٹا کسی سرور پر اپلوڈ نہیں ہوتا۔',
    pillar2Title: 'انتہائی تیز رفتار کارکردگی',
    pillar2Desc: 'فائل پروسیسنگ میں بغیر کسی انٹرنیٹ تاخیر کے۔ کمپریس کریں، فائلیں جوڑیں، ٹیکسٹ نکالیں اور ہارڈویئر سپیڈ پر نتائج حاصل کریں۔',
    pillar3Title: '100٪ مفت اور کھلی رسائی',
    pillar3Desc: 'تمام 220+ ٹولز اور یوٹیلیٹیز بغیر کسی فیس یا رجسٹریشن رکاوٹ کے سب کے لیے بالکل مفت دستیاب ہیں۔',
    stackTitle: 'مفتاح ٹولز کو کیا چیز طاقتور بناتی ہے؟',
    stackSubtitle: 'ایک جدید ٹیکنالوجی اسٹیک جو پرائیویسی، پائیداری اور رفتار کے لیے تیار کیا گیا ہے۔',
    features: [
      { title: '220+ کلائنٹ سائیڈ ٹولز', desc: 'پی ڈی ایف، امیج اسٹوڈیو، OCR، کیو آر کوڈ، کوڈنگ یوٹیلیٹیز اور کیلکولیٹرز۔' },
      { title: 'ویب اسمبلی (WASM) انجن', desc: 'براؤزر میموری سینڈ باکس میں نیٹو رفتار کے ساتھ ایگزیکیوشن۔' },
      { title: 'ٹیسیریکٹ OCR ویژن', desc: 'براہ راست آپ کے GPU/CPU پر کثیر لسانی متن نکالنے کی صلاحیت۔' },
      { title: 'آف لائن PWA ایپ', desc: 'مفتاح ٹولز کو اینڈرائیڈ، ونڈوز، میک اور آئی فون پر بطور ایپ انسٹال کریں۔' },
      { title: 'آفیشل گوگل پلے ایپ', desc: 'موبائل پر آف لائن دستاویز پروسیسنگ کے لیے اینڈرائیڈ ایپ۔' },
      { title: '4 زبانوں میں مکمل ترجمہ', desc: 'انگریزی، اردو، عربی اور ہندی میں فوری تبدیلی بمعہ RTL سپورٹ۔' },
    ],
    ctaTitle: 'کیا آپ اگلی نسل کے ٹولز استعمال کرنے کے لیے تیار ہیں؟',
    ctaSubtitle: 'تمام 220+ ٹولز سب کے لیے 100٪ مفت اور کھلے ہیں۔ نہ کریڈٹ کارڈ کی ضرورت ہے نہ لازمی رجسٹریشن کی۔',
    ctaBtn: 'ابھی ٹولز استعمال کرنا شروع کریں',
  },
  ar: {
    badge: 'عن منصة مفتاح تولز',
    heroTitle: 'المنظومة الرقمية الرائدة في الخصوصية والأدوات الذكية',
    heroSubtitle: 'تجمع منصة مفتاح تولز أكثر من 220 أداة رقمية عالية الأداء تعمل محلياً داخل متصفحك بنسبة 100٪ دون رفع الملفات إلى أي خادم خارجي.',
    allToolsBtn: 'استكشاف جميع الأدوات 220+',
    workflowsBtn: 'مسارات العمل الذكية',
    pillar1Title: 'خصوصية تامة 100٪ على جهازك',
    pillar1Desc: 'تتم معالجة كافة ملفات PDF والصور والمستندات مباشرة في متصفحك عبر تقنية WebAssembly (WASM). لا يتم رفع أي ملف إلى أي خادم خارجي أبداً.',
    pillar2Title: 'سرعة معالجة فائقة وخاطفة',
    pillar2Desc: 'بدون أي تأخير في الشبكة أو رفع وتنزيل بطيء. اضغط، ادمج، استخرج النصوص واحسب بأقصى سرعة لجهازك.',
    pillar3Title: 'مجاني ومفتوح بالكامل',
    pillar3Desc: 'كافة الأدوات والخدمات مجانية 100٪ ومتاحة للجميع دون قيود أو اشتراكات أو تسجيل إجباري.',
    stackTitle: 'التقنيات التي تدعم منصة مفتاح تولز',
    stackSubtitle: 'بنية برمجية حديثة مصممة خصيصاً للخصوصية والأمان والسرعة الفائقة.',
    features: [
      { title: '220+ أداة محلية متطورة', desc: 'أدوات PDF، استوديو الصور، OCR، قارئ QR، أدوات البرمجة والحاسبات.' },
      { title: 'محرك WebAssembly (WASM)', desc: 'تنفيذ العمليات المعقدة داخل بيئة المتصفح الآمنة بسرعة الأجهزة الأصلية.' },
      { title: 'تقنية التعرف الضوئي Tesseract OCR', desc: 'استخراج النصوص من الصور والمستندات محلياً دون اتصال.' },
      { title: 'تطبيق ويب تقدمي (PWA) أوفلاين', desc: 'تثبيت التطبيق على أندرويد، ويندوز، ماك، وآيفون للعمل دون إنترنت.' },
      { title: 'تطبيق رسمي على Google Play', desc: 'تطبيق أصلي للأندرويد لمعالجة الملفات أوفلاين بسرعة فائقة.' },
      { title: 'تعريب وترجمة كاملة بـ 4 لغات', desc: 'تبديل فوري وسلس بين العربية، الأردية، الهندية والإنجليزية مع دعم RTL.' },
    ],
    ctaTitle: 'هل أنت مستعد لتجربة الجيل القادم من الأدوات الرقمية؟',
    ctaSubtitle: 'جميع الأدوات الـ 220+ مجانية 100٪ ومتاحة للجميع دون الحاجة لبطاقة ائتمان.',
    ctaBtn: 'ابدأ باستخدام الأدوات الآن',
  },
  hi: {
    badge: 'मिफ्ताह टूल्स प्लेटफॉर्म का परिचय',
    heroTitle: 'गोपनीयता-प्रथम डिजिटल यूटिलिटी व उत्पादकता सुइट',
    heroSubtitle: 'मिफ्ताह टूल्स 220+ शक्तिशाली टूल्स सीधे आपके ब्राउज़र में प्रदान करता है। बिना किसी सर्वर अपलोड के फ़ाइलों को कस्टमाइज़ करें और 100% ऑन-डिवाइस प्राइवेसी का अनुभव करें।',
    allToolsBtn: 'सभी 220+ टूल्स देखें',
    workflowsBtn: 'स्मार्ट वर्कफ़्लोज़',
    pillar1Title: '100% क्लाइंट-साइड गोपनीयता',
    pillar1Desc: 'प्रत्येक PDF, फोटो और दस्तावेज़ WebAssembly (WASM) के माध्यम से आपके अपने फोन/कंप्यूटर में प्रोसेस होता है। फाइलें कभी सर्वर पर अपलोड नहीं होतीं।',
    pillar2Title: 'अत्यंत तीव्र गति से निष्पादन',
    pillar2Desc: 'फाइल प्रोसेसिंग में नेटवर्क की कोई देरी नहीं। कंप्रेस करें, मर्ज करें, टेक्स्ट निकालें और हार्डवेयर गति से परिणाम प्राप्त करें।',
    pillar3Title: '100% मुफ़्त व खुला एक्सेस',
    pillar3Desc: 'सभी 220+ टूल्स और यूटिलिटीज बिना किसी सब्सक्रिप्शन, अनिवार्य लॉगिन या शुल्क के सभी के लिए मुफ़्त हैं।',
    stackTitle: 'मिफ्ताह टूल्स को क्या खास बनाता है?',
    stackSubtitle: 'गोपनीयता, विश्वसनीयता और उच्च गति के लिए डिज़ाइन किया गया आधुनिक टेक्नोलॉजी स्टैक।',
    features: [
      { title: '220+ क्लाइंट-साइड टूल्स', desc: 'PDF, इमेज स्टूडियो, OCR, QR कोड, कोडिंग यूटिलिटीज और कैलकुलेटर।' },
      { title: 'WebAssembly (WASM) इंजन', desc: 'ब्राउज़र मेमोरी में नेटिव गति के साथ सुरक्षित प्रोसेसिंग।' },
      { title: 'टेसेरैक्ट OCR विज़न', desc: 'स्थानीय GPU/CPU पर बहुभाषी टेक्स्ट निष्कर्षण की सुविधा।' },
      { title: 'ऑफलाइन सक्षम PWA ऐप', desc: 'मिफ्ताह टूल्स को एंड्रॉइड, विंडोज, मैक और iOS पर ऐप के रूप में इंस्टॉल करें।' },
      { title: 'आधिकारिक Google Play ऐप', desc: 'मोबाइल पर ऑफ़लाइन दस्तावेज़ प्रोसेसिंग के लिए एंड्रॉइड ऐप।' },
      { title: '4 भाषाओं में पूर्ण स्थानीयकरण', desc: 'अंग्रेजी, उर्दू, अरबी और हिंदी में तत्काल भाषा परिवर्तन व RTL सपोर्ट।' },
    ],
    ctaTitle: 'क्या आप अगली पीढ़ी के टूल्स इस्तेमाल करने के लिए तैयार हैं?',
    ctaSubtitle: 'सभी 220+ टूल्स सभी के लिए 100% मुफ़्त और खुले हैं। कोई क्रेडिट कार्ड या अनिवार्य शुल्क नहीं।',
    ctaBtn: 'अभी टूल्स का उपयोग शुरू करें',
  },
};

export default function AboutPage() {
  const { language, isRtl } = useI18n();
  const loc = ABOUT_LOCALES[language] || ABOUT_LOCALES.en;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            {loc.badge}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-3xl mx-auto">
            {loc.heroTitle}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {loc.heroSubtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/tools"
              className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {loc.allToolsBtn}
            </Link>
            <Link
              href="/workflows"
              className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-brand-600" />
              {loc.workflowsBtn}
            </Link>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="space-y-6">
          <h2 className="sr-only">Core Platform Pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{loc.pillar1Title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {loc.pillar1Desc}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{loc.pillar2Title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {loc.pillar2Desc}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{loc.pillar3Title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {loc.pillar3Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Feature Capabilities */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {loc.stackTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {loc.stackSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loc.features.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white text-center space-y-6 shadow-xl shadow-brand-500/10">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {loc.ctaTitle}
          </h2>
          <p className="text-sm sm:text-base text-brand-100 max-w-xl mx-auto leading-relaxed">
            {loc.ctaSubtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tools"
              className="px-6 py-3 rounded-2xl bg-white text-brand-600 hover:bg-brand-50 font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {loc.ctaBtn}
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
