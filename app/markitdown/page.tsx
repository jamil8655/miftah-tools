'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { MarkItDownStudio } from '@/components/tools/MarkItDownStudio';
import { Sparkles, FileText, Cpu, Lock, Layers, Zap, Bot } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const PAGE_LOCALES = {
  en: {
    badge: 'Microsoft MarkItDown Core Engine',
    title: 'Universal AI Document to Markdown Studio',
    desc: 'Instantly convert PDF, Office Word (.docx), PowerPoint (.pptx), Excel (.xlsx), CSV, JSON, XML, Images (OCR), and ZIP archives into clean, structured Markdown ready for ChatGPT, Claude, Gemini & LLM RAG pipelines.',
    features: [
      { title: '100% In-Device WASM', desc: 'No files are sent to servers. Everything executes inside your local browser memory.' },
      { title: 'Multi-Format Tables & Slides', desc: 'Preserves tables, slide speaker notes, headers, lists, and OCR text.' },
      { title: 'AI & LLM Ready Prompts', desc: 'One-click copy formatted prompts for executive summaries, RAG context, and Q&A.' },
    ],
  },
  ur: {
    badge: 'مائیکروسافٹ مارک اِٹ ڈاؤن انٹیلی جنس',
    title: 'یونیورسل اے آئی ڈاکومنٹ ٹو مارک ڈاؤن اسٹوڈیو',
    desc: 'پی ڈی ایف، ایم ایس ورڈ، پاورپوائنٹ، ایکسل، سی ایس وی، جے سن، تصاویر (OCR) اور زپ پیکجز کو جدید اور منظم مارک ڈاؤن میں تبدیل کریں جو چیٹ جی پی ٹی، کلاڈ اور جیمنائی کے لیے 100% تیار ہے۔',
    features: [
      { title: '100% ڈیوائس پر پروسیسنگ', desc: 'کوئی فائل سرور پر اپ لوڈ نہیں ہوتی۔ تمام پروسیسنگ آپ کے براؤزر کے اندر محفوظ طریقے سے ہوتی ہے۔' },
      { title: 'ٹیبلز اور سلائیڈز کا تحفظ', desc: 'ایکسل ٹیبلز، پاورپوائنٹ اسپیکر نوٹس، ہیڈنگز اور تصویری تحریر مکمل محفوظ رہتے ہیں۔' },
      { title: 'اے آئی و ایل ایل ایم پرامپٹس', desc: 'ایک کلک میں خلاصہ، سوال و جواب اور RAG سرچ کے لیے تیار پرامپٹ کاپی کریں۔' },
    ],
  },
  ar: {
    badge: 'محرك مايكروسوفت MarkItDown المتطور',
    title: 'استوديو التحويل الشامل إلى ماركداون للذكاء الاصطناعي',
    desc: 'تحويل ملفات PDF وWord وPowerPoint وExcel وCSV وJSON والصور (OCR) وملفات ZIP المضغوطة إلى كود Markdown عالي الهيكلية ومُهيأ للذكاء الاصطناعي وخطوط أنابيب RAG.',
    features: [
      { title: 'معالجة محلية 100% داخل المتصفح', desc: 'لا يتم إرسال أي ملفات إلى السيرفر. تتم كل العمليات داخل ذاكرة جهازك بأمان تام.' },
      { title: 'حفظ الجداول والشرائح التقديمية', desc: 'يحافظ على جداول Excel وملاحظات PowerPoint والعناوين والنصوص المستخرجة من الصور.' },
      { title: 'أوامر جاهزة لنماذج الذكاء الاصطناعي', desc: 'نسخ فوري للأوامر المنظمة لملخصات المستندات ونظم RAG والإجابة عن الأسئلة.' },
    ],
  },
  hi: {
    badge: 'माइक्रोसॉफ्ट MarkItDown कोर इंजन',
    title: 'यूनिवर्सल AI डॉक्यूमेंट टू मार्कडाउन स्टूडियो',
    desc: 'PDF, Word, PowerPoint, Excel, CSV, JSON, इमेजेस (OCR) और ZIP फाइलों को तुरंत स्वच्छ, संरचित Markdown में बदलें जो ChatGPT, Claude और Gemini के लिए तैयार है।',
    features: [
      { title: '100% इन-डिवाइस WASM प्रोसेसिंग', desc: 'कोई भी फ़ाइल सर्वर पर नहीं भेजी जाती। सब कुछ आपके ब्राउज़र मेमोरी में सुरक्षित रूप से चलता है।' },
      { title: 'टेबल्स व प्रेजेंटेशन संरक्षण', desc: 'एक्सेल टेबल्स, पावरपॉइंट स्पीकर नोट्स, हेडिंग्स और OCR टेक्स्ट को सुरक्षित रखता है।' },
      { title: 'AI व LLM रेडी प्रॉम्प्ट्स', desc: 'एक क्लिक में सारांश, प्रश्न-उत्तर और RAG संदर्भ के लिए अनुकूलित प्रॉम्प्ट कॉपी करें।' },
    ],
  },
};

export default function MarkItDownPage() {
  const { language } = useI18n();
  const loc = PAGE_LOCALES[language as keyof typeof PAGE_LOCALES] || PAGE_LOCALES.en;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'AI Workspace', href: '/workflows' }, { label: loc.title }]} />

      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loc.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center justify-center gap-2.5">
          <Bot className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          <span>{loc.title}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {loc.desc}
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
        <MarkItDownStudio />
      </div>

      {/* Feature Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {loc.features.map((feat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
              {idx === 0 ? <Lock className="w-4 h-4" /> : idx === 1 ? <Layers className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{feat.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
