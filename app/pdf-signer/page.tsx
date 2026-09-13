'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { PdfSignatureStudio } from '@/components/pdf/PdfSignatureStudio';
import { PenTool, ShieldCheck, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const PAGE_LOCALES = {
  en: {
    badge: 'Live PDF Signature & Stamp Studio',
    title: 'PDF Digital Signer & Annotation Studio',
    desc: 'Sign contracts, official forms, and PDF documents directly in your browser. Draw handwritten signatures, place verified date stamps, and download 100% locally.',
    features: [
      { title: 'Handwritten & Typed Signatures', desc: 'Draw with smooth bezier curves or type elegant cursive signatures in blue, black, or red ink.' },
      { title: 'Official Approval Stamps', desc: 'Stamp APPROVED, CONFIDENTIAL, VERIFIED, or current calendar date instantly.' },
      { title: 'Zero Cloud Storage', desc: 'Your private documents never leave your browser. Processing executes 100% inside client memory.' },
    ],
  },
  ur: {
    badge: 'لائیو پی ڈی ایف سگنیچر اسٹوڈیو',
    title: 'پی ڈی ایف ڈیجیٹل دستخط و اینوٹیشن اسٹوڈیو',
    desc: 'معاہدات، فارمز اور دفتری پی ڈی ایف دستاویزات پر براہ راست ڈیجیٹل دستخط کریں۔ ہاتھ سے دستخط بنائیں، مہر اور تاریخ لگائیں، اور فوری ڈاؤن لوڈ کریں۔',
    features: [
      { title: 'ہاتھ سے اور ٹائپ شدہ دستخط', desc: 'انگلی یا اسٹائلس سے دستخط بنائیں یا خوبصورت خط میں نام لکھ کر لگائیں۔' },
      { title: 'سرکاری منظوری کی مہریں', desc: 'منظور شدہ (APPROVED)، خفیہ (CONFIDENTIAL) اور تاریخ کے ریڈی میڈ اسٹیمپس۔' },
      { title: '100% رازداری اور تحفظ', desc: 'دستاویزات کسی سرور پر نہیں جاتیں، سارا عمل آپ کے براؤزر کی میموری میں ہوتا ہے۔' },
    ],
  },
  ar: {
    badge: 'استوديو التوقيع الرقمي لمستندات PDF',
    title: 'استوديو التوقيع الرقمي والأختام التفاعلية لـ PDF',
    desc: 'توقيع العقود والاستمارات الرسمية ومستندات PDF مباشرة في المتصفح. ارسم توقيعك باليد وأضف الأختام وتاريخ اليوم بخصوصية تامة 100%.',
    features: [
      { title: 'توقيع يدوي ومكتوب', desc: 'ارسم التوقيع بسلاسة أو اكتب اسمك بخط مميز باللون الأسود أو الأزرق أو الأحمر.' },
      { title: 'أختام اعتماد رسمية', desc: 'أختام فورية معتمدة وموثقة وعلامات التاريخ.' },
      { title: 'أمان وخصوصية محلية 100%', desc: 'ملفاتك لا تغادر المتصفح أبداً وتتم جميع العمليات محلياً.' },
    ],
  },
  hi: {
    badge: 'लाइव PDF डिजिटल सिग्नेचर स्टूडियो',
    title: 'PDF डिजिटल सिग्नेचर व एनोटेशन स्टूडियो',
    desc: 'अनुबंधों, फॉर्मों और आधिकारिक PDF दस्तावेजों पर सीधे डिजिटल हस्ताक्षर करें। हाथ से हस्ताक्षर बनाएं, स्टैम्प व तारीख लगाएं और तुरंत डाउनलोड करें।',
    features: [
      { title: 'हस्तलिखित व टाइप किए गए हस्ताक्षर', desc: 'उंगली से सहज हस्ताक्षर बनाएं या कर्सिव फॉन्ट में अपना नाम लिखें।' },
      { title: 'आधिकारिक अप्रूवल स्टैम्प्स', desc: 'APPROVED, CONFIDENTIAL और तारीख के तैयार स्टैम्प्स तुरंत जोड़ें।' },
      { title: '100% स्थानीय सुरक्षा', desc: 'दस्तावेज़ कभी भी आपके ब्राउज़र से बाहर नहीं जाते, सब कुछ लोकल चलता है।' },
    ],
  },
};

export default function PdfSignerPage() {
  const { language } = useI18n();
  const loc = PAGE_LOCALES[language as keyof typeof PAGE_LOCALES] || PAGE_LOCALES.en;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: loc.title }]} />

      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
          <PenTool className="w-3.5 h-3.5" />
          <span>{loc.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center justify-center gap-2.5">
          <PenTool className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          <span>{loc.title}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {loc.desc}
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
        <PdfSignatureStudio />
      </div>

      {/* Feature Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {loc.features.map((feat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
              {idx === 0 ? <PenTool className="w-4 h-4" /> : idx === 1 ? <Sparkles className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{feat.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
