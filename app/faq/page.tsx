'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, Search, ChevronDown, ChevronUp, Sparkles, ShieldCheck, FileText, GraduationCap } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const FAQ_LOCALES = {
  en: {
    badge: 'FAQ & User Guide',
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about Miftah Tools, privacy guarantees, courses, and offline capabilities.',
    searchPlaceholder: 'Search questions...',
    stillQuestions: 'Still have questions?',
    supportPrompt: 'Our support team is always here to assist you.',
    contactBtn: 'Contact Support',
    items: [
      {
        q: 'Are all 220+ tools really 100% free with no hidden charges?',
        a: 'Yes, absolutely. All core conversion, PDF manipulation, audio/video downloading, image compression, OCR, and developer utilities are 100% free and open for public use.',
        category: 'General',
      },
      {
        q: 'How does client-side WebAssembly (WASM) protect my privacy?',
        a: 'Unlike traditional web converters that upload your PDFs and photos to unknown third-party cloud servers, Miftah Tools compiles transformation binaries directly into your web browser. Your data never leaves your computer.',
        category: 'Privacy & Security',
      },
      {
        q: 'Is course enrollment compulsory to view course lessons?',
        a: 'No! You can freely browse all curriculums, read lesson overviews, and study course material without any mandatory enrollment. Enrolling is optional and provides personal progress tracking, saved history, and digital completion certificates.',
        category: 'Courses & Learning',
      },
      {
        q: 'Can I install Miftah Tools as an offline desktop or mobile app?',
        a: 'Yes! Miftah Tools is an offline-ready Progressive Web App (PWA). Click the "Install App" button or tap "Add to Home Screen" in your browser menu on Android, iOS, Windows, or macOS.',
        category: 'PWA & Offline',
      },
      {
        q: 'What is the maximum file size supported by Miftah Tools?',
        a: 'Miftah Tools client-side engine supports large files up to 500 MB directly inside your browser memory without crashing.',
        category: 'Tools & Processing',
      },
      {
        q: 'How do I switch the application language to Urdu, Arabic, or Hindi?',
        a: 'Use the language selector dropdown in the top navigation bar or go to Settings ➔ Language. The entire interface, navigation, buttons, and layout direction (RTL/LTR) will update instantly.',
        category: 'Language & Settings',
      },
    ],
  },
  ur: {
    badge: 'عمومی سوالات و رہنمائی',
    title: 'اکثر پوچھے جانے والے سوالات',
    subtitle: 'مفتاح ٹولز، پرائیویسی کی ضمانتوں، کورسز اور آف لائن صلاحیتوں کے بارے میں سب کچھ جانیں۔',
    searchPlaceholder: 'سوالات تلاش کریں...',
    stillQuestions: 'کیا آپ کا کوئی اور سوال ہے؟',
    supportPrompt: 'ہماری سپورٹ ٹیم آپ کی رہنمائی اور مدد کے لیے ہر وقت حاضر ہے۔',
    contactBtn: 'سپورٹ سے رابطہ کریں',
    items: [
      {
        q: 'کیا تمام 220+ ٹولز واقعی بغیر کسی پوشیدہ فیس کے 100٪ مفت ہیں؟',
        a: 'جی ہاں، بالکل! تمام پی ڈی ایف ٹولز، امیج کنورٹرز، ویڈیو و آڈیو ٹولز، او سی آر، اور ڈویلپر یوٹیلیٹیز 100٪ مفت اور کھلے عام استعمال کے لیے دستیاب ہیں۔',
        category: 'عمومی',
      },
      {
        q: 'کلائنٹ سائیڈ ویب اسمبلی (WASM) میری پرائیویسی کی کیسے حفاظت کرتی ہے؟',
        a: 'روایتی ویب کنورٹرز کے برعکس جو آپ کی پی ڈی ایف اور تصاویر کو نامعلوم کلاؤڈ سرورز پر اپلوڈ کرتے ہیں، مفتاح ٹولز تمام پروسیسنگ براہ راست آپ کے براؤزر میموری میں کرتا ہے۔ آپ کی فائل کبھی آپ کے ڈیوائس سے باہر نہیں جاتی۔',
        category: 'پرائیویسی اور سیکیورٹی',
      },
      {
        q: 'کیا کورس کے اسباق پڑھنے کے لیے رجسٹریشن لازمی ہے؟',
        a: 'نہیں! آپ تمام کورسز، نصاب اور اسباق بغیر کسی رجسٹریشن یا فیس کے آزادانہ پڑھ سکتے ہیں۔ رجسٹریشن اختیاری ہے اور آپ کی پروگریس محفوظ رکھنے کے لیے ہے۔',
        category: 'کورسز اور تعلیم',
      },
      {
        q: 'کیا میں مفتاح ٹولز کو آف لائن ایپ کے طور پر انسٹال کر سکتا ہوں؟',
        a: 'جی ہاں! مفتاح ٹولز ایک جدید PWA ایپ ہے۔ آپ براؤزر کے مینو میں "Add to Home Screen" یا "Install App" دبا کر اینڈرائیڈ، ونڈوز یا میک پر انسٹال کر سکتے ہیں۔',
        category: 'آف لائن PWA',
      },
      {
        q: 'مفتاح ٹولز میں فائل کا زیادہ سے زیادہ سائز کتنا ہو سکتا ہے؟',
        a: 'مفتاح ٹولز کا لوکل کلائنٹ انجن 500 ایم بی تک کی بڑی فائلوں کو بغیر کریش ہوئے باآسانی پروسیس کر سکتا ہے۔',
        category: 'ٹولز اور پروسیسنگ',
      },
      {
        q: 'میں ایپ کی زبان اردو، عربی یا ہندی میں کیسے تبدیل کروں؟',
        a: 'اوپر نیویگیشن بار میں موجود لینگویج سلیکٹر پر کلک کریں یا سیٹنگز میں جا کر زبان تبدیل کریں۔ پورا انٹرفیس فوری طور پر منتخب زبان میں بدل جائے گا۔',
        category: 'زبان اور سیٹنگز',
      },
    ],
  },
  ar: {
    badge: 'الأسئلة الشائعة ودليل الاستخدام',
    title: 'الأسئلة الأكثر شيوعاً',
    subtitle: 'كل ما تحتاج لمعرفته حول منصة مفتاح تولز وضمانات الخصوصية والدورات التعليمية.',
    searchPlaceholder: 'ابحث في الأسئلة...',
    stillQuestions: 'هل ما زال لديك أي استفسار؟',
    supportPrompt: 'فريق الدعم الفني متواجد دائماً لمساعدتك والإجابة عن تساؤلاتك.',
    contactBtn: 'تواصل مع الدعم الفني',
    items: [
      {
        q: 'هل جميع الأدوات الـ 220+ مجانية حقاً دون أي رسوم خفية؟',
        a: 'نعم، بالتأكيد! جميع أدوات PDF، وتحويل الصور، واستخراج النصوص OCR، وأدوات المطورين مجانية 100٪ ومتاحة للاستخدام المفتوح.',
        category: 'عام',
      },
      {
        q: 'كيف تحمي تقنية WebAssembly (WASM) المحلية خصوصيتي؟',
        a: 'على عكس المواقع التقليدية التي ترفع ملفاتك إلى خوادم خارجية غير معروفة، تقوم منصة مفتاح تولز بمعالجة الملفات مباشرة داخل متصفحك. لا تغادر بياناتك جهازك أبداً.',
        category: 'الخصوصية والأمان',
      },
      {
        q: 'هل التسجيل إلزامي للاطلاع على دروس الدورات التعليمية؟',
        a: 'كلا! يمكنك تصفح كافة المناهج وقراءة الدروس والتعلم بحرية تامة دون أي قيود أو تسجيل إجباري.',
        category: 'الدورات والتعليم',
      },
      {
        q: 'هل يمكنني تثبيت التطبيق والعمل به دون اتصال بالإنترنت؟',
        a: 'نعم! تطبيق مفتاح تولز يدعم تقنية PWA، يمكنك تثبيته على أندرويد، ويندوز، ماك وآيفون بضغطة زر والعمل دون اتصال.',
        category: 'التطبيق والعمل بدون إنترنت',
      },
      {
        q: 'ما هو الحد الأقصى لحجم الملفات المدعومة في الأدوات؟',
        a: 'يدعم المحرك المحلي لمنصة مفتاح تولز ملفات ضخمة تصل إلى 500 ميجابايت مباشرة في ذاكرة المتصفح دون أي انهيار.',
        category: 'الأدوات والمعالجة',
      },
      {
        q: 'كيف يمكنني تبديل لغة التطبيق إلى العربية أو الأردية أو الهندية؟',
        a: 'من خلال قائمة اختيار اللغة في الشريط العلوي أو من شاشة الإعدادات. ستتغير كامل واجهة التطبيق والاتجاهات فوراً.',
        category: 'اللغة والإعدادات',
      },
    ],
  },
  hi: {
    badge: 'अक्सर पूछे जाने वाले प्रश्न व गाइड',
    title: 'अक्सर पूछे जाने वाले प्रश्न (FAQ)',
    subtitle: 'मिफ्ताह टूल्स, गोपनीयता गारंटी, ऑनलाइन कोर्सेज और ऑफलाइन क्षमताओं के बारे में संपूर्ण जानकारी।',
    searchPlaceholder: 'प्रश्न खोजें...',
    stillQuestions: 'क्या आपका कोई अन्य प्रश्न है?',
    supportPrompt: 'हमारी सहायता टीम आपकी मदद के लिए सदैव उपलब्ध है।',
    contactBtn: 'सपोर्ट से संपर्क करें',
    items: [
      {
        q: 'क्या सभी 220+ टूल्स वास्तव में 100% मुफ़्त हैं?',
        a: 'हाँ, बिल्कुल! सभी PDF टूल्स, इमेज कन्वर्टर्स, OCR टेक्स्ट एक्सट्रैक्टर और कोडिंग यूटिलिटीज 100% मुफ़्त और सार्वजनिक उपयोग के लिए खुली हैं।',
        category: 'सामान्य',
      },
      {
        q: 'क्लाइंट-साइड WebAssembly मेरी गोपनीयता की रक्षा कैसे करती है?',
        a: 'पारंपरिक वेबसाइटों के विपरीत जो आपकी फाइलें सर्वर पर अपलोड करती हैं, मिफ्ताह टूल्स फाइलों को आपके ब्राउज़र में ही प्रोसेस करता है। आपकी फाइलें कभी डिवाइस से बाहर नहीं जातीं।',
        category: 'गोपनीयता व सुरक्षा',
      },
      {
        q: 'क्या कोर्स के पाठ पढ़ने के लिए रजिस्ट्रेशन अनिवार्य है?',
        a: 'नहीं! आप बिना किसी अनिवार्य रजिस्ट्रेशन के सभी कोर्स पाठ्यक्रम और पाठ पूरी तरह मुफ़्त पढ़ सकते हैं।',
        category: 'कोर्सेज व शिक्षा',
      },
      {
        q: 'क्या मैं मिफ्ताह टूल्स को ऑफलाइन ऐप के रूप में इंस्टॉल कर सकता हूँ?',
        a: 'हाँ! मिफ्ताह टूल्स एक आधुनिक PWA ऐप है। आप ब्राउज़र मेनू से "Add to Home Screen" चुनकर इसे एंड्रॉइड, विंडोज या मैक पर इंस्टॉल कर सकते हैं।',
        category: 'PWA व ऑफलाइन',
      },
      {
        q: 'मिफ्ताह टूल्स में अधिकतम फाइल साइज़ सीमा क्या है?',
        a: 'मिफ्ताह टूल्स का लोकल इंजन 500 MB तक की बड़ी फाइलों को ब्राउज़र मेमोरी में बिना किसी रुकावट के प्रोसेस कर सकता है।',
        category: 'टूल्स व प्रोसेसिंग',
      },
      {
        q: 'मैं ऐप की भाषा हिंदी, उर्दू या अरबी में कैसे बदलूं?',
        a: 'शीर्ष नेविगेशन बार में दिए गए भाषा चयनकर्ता या सेटिंग्स में जाकर भाषा बदलें। संपूर्ण इंटरफेस तुरंत अपडेट हो जाएगा।',
        category: 'भाषा व सेटिंग्स',
      },
    ],
  },
};

export default function FaqPage() {
  const { language, isRtl } = useI18n();
  const loc = FAQ_LOCALES[language] || FAQ_LOCALES.en;
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({ 0: true, 1: true });

  const filteredFaqs = loc.items.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-200 dark:border-brand-800">
            <HelpCircle className="w-3.5 h-3.5" />
            {loc.badge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {loc.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {loc.subtitle}
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={loc.searchPlaceholder}
            className={`w-full py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all ${
              isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaqs[idx] !== false;

            return (
              <div
                key={idx}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:px-6 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <div className="space-y-1 pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {faq.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {faq.q}
                    </h3>
                  </div>
                  <div className="shrink-0 text-slate-400">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions? */}
        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{loc.stillQuestions}</h4>
          <p className="text-xs text-slate-500">{loc.supportPrompt}</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {loc.contactBtn}
          </Link>
        </div>
      </div>
    </div>
  );
}
