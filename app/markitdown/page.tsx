'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { MarkItDownStudio } from '@/components/tools/MarkItDownStudio';
import { FileText, Cpu, Lock, Layers, Bot, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const PAGE_LOCALES = {
  en: {
    badge: 'Universal Document to Text Engine',
    title: 'Document to Text & Markdown Studio',
    desc: 'Instantly convert PDF, Office Word, Excel, PowerPoint, and Images into clean, structured text ready for ChatGPT, Claude, and Gemini.',
    features: [
      { title: '100% In-Device Privacy', desc: 'No files are sent to servers. Everything processes inside your local device memory.' },
      { title: 'Tables & Slides Preserved', desc: 'Preserves Excel spreadsheets, PowerPoint speaker notes, headings, and OCR text.' },
      { title: 'AI & ChatGPT Prompts', desc: 'One-click copy formatted prompts for summaries, Q&A, and translations.' },
    ],
  },
  ur: {
    badge: 'یونیورسل فائل ٹو ٹیکسٹ انجن',
    title: 'ڈاکومنٹ ٹو ٹیکسٹ و مارک ڈاؤن اسٹوڈیو',
    desc: 'پی ڈی ایف، ورڈ، ایکسل، پاورپوائنٹ اور تصاویر سے تحریر اور ٹیبلز نکال کر صاف ٹیکسٹ اور مارک ڈاؤن میں تبدیل کریں۔',
    features: [
      { title: '100% نجی اور محفوظ', desc: 'کوئی فائل سرور پر نہیں جاتی۔ تمام پروسیسنگ آپ کے ڈیوائس کی میموری میں ہوتی ہے۔' },
      { title: 'ٹیبلز اور سلائیڈز کا تحفظ', desc: 'ایکسل ٹیبلز، پاورپوائنٹ نوٹس، ہیڈنگز اور تصویری تحریر مکمل محفوظ رہتے ہیں۔' },
      { title: 'ChatGPT اور AI پرامپٹس', desc: 'ایک کلک میں خلاصہ، سوال جواب اور ترجمے کے لیے تیار پرامپٹ کاپی کریں۔' },
    ],
  },
  ar: {
    badge: 'المحرك الشامل لتحويل المستندات إلى نصوص',
    title: 'استوديو استخراج النصوص وMarkdown',
    desc: 'تحويل ملفات PDF وWord وExcel وPowerPoint والصور إلى نصوص منسقة جاهزة لنماذج ChatGPT والذكاء الاصطناعي.',
    features: [
      { title: 'خصوصية محلية 100%', desc: 'تتم المعالجة بالكامل داخل جهازك دون إرسال أي ملفات للسيرفر.' },
      { title: 'حفظ الجداول والشرائح', desc: 'يحافظ على جداول Excel ونصوص الصور والعناوين بدقة.' },
      { title: 'أوامر جاهزة للذكاء الاصطناعي', desc: 'نسخ فوري للأوامر المنظمة لملخصات المستندات ونظم ChatGPT.' },
    ],
  },
  hi: {
    badge: 'यूनिवर्सल डॉक्यूमेंट टू टेक्स्ट इंजन',
    title: 'डॉक्यूमेंट टू टेक्स्ट व मार्कडाउन स्टूडियो',
    desc: 'PDF, Word, Excel, PowerPoint और फोटो से टेक्स्ट व टेबल निकालकर साफ टेक्स्ट व मार्कडाउन में बदलें।',
    features: [
      { title: '100% निजी व सुरक्षित', desc: 'कोई भी फ़ाइल सर्वर पर नहीं भेजी जाती। सब कुछ आपके डिवाइस में प्रोसेस होता है।' },
      { title: 'टेबल्स व प्रेजेंटेशन सुरक्षा', desc: 'एक्सेल टेबल्स, पावरपॉइंट नोट्स और OCR टेक्स्ट को सुरक्षित रखता है।' },
      { title: 'AI व ChatGPT प्रॉम्प्ट्स', desc: 'एक क्लिक में सारांश, प्रश्न-उत्तर और अनुवाद के लिए तैयार प्रॉम्प्ट कॉपी करें।' },
    ],
  },
};

export default function MarkItDownPage() {
  const { language } = useI18n();
  const loc = PAGE_LOCALES[language as keyof typeof PAGE_LOCALES] || PAGE_LOCALES.en;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: loc.title }]} />

      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loc.badge}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center justify-center gap-2.5">
          <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-brand-600 dark:text-brand-400" />
          <span>{loc.title}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {loc.desc}
        </p>
      </div>

      <div className="p-4 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <MarkItDownStudio />
      </div>

      {/* Feature Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {loc.features.map((feat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs border border-brand-200 dark:border-brand-800">
              {idx === 0 ? <Lock className="w-4 h-4" /> : idx === 1 ? <Layers className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{feat.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
