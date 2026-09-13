'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const GUIDELINES_LOCALES = {
  en: {
    badge: 'Community & Safety',
    title: 'User & Community Guidelines',
    updated: 'Last updated: September 2026',
    s1Title: '1. Respectful Learning Environment',
    s1Desc: 'Miftah Tools courses and developer tools are built to empower students, engineers, and digital creators globally. Users must engage respectfully in all forum interactions, feedback comments, and code sharing.',
    s2Title: '2. Prohibited Content & Abuse',
    s2Items: [
      'Do not use tools to generate fraudulent documents, forged identification, or phishing collateral.',
      'Do not attempt to reverse-engineer closed APIs or exploit vulnerabilities for unauthorized data exfiltration.',
      'Do not use automated scraping bots that excessively disrupt platform performance for other users.',
    ],
    s3Title: '3. Ethical Code & AI Usage',
    s3Desc: 'When utilizing AI tools, OCR extractors, and code converters, verify outputs before deploying them into critical production or medical systems. Adhere to academic honesty when submitting coursework.',
    footerPrompt: 'Report a violation?',
    contactBtn: 'Contact Trust & Safety',
  },
  ur: {
    badge: 'کمیونٹی اور تحفظ کے اصول',
    title: 'صارفین اور کمیونٹی کے رہنما اصول (User Guidelines)',
    updated: 'آخری تجدید: ستمبر 2026',
    s1Title: '1. باوقار تعلیمی ماحول',
    s1Desc: 'مفتاح ٹولز کے کورسز اور ٹولز دنیا بھر کے طلباء، کوڈرز اور پروفیشنلز کو بااختیار بنانے کے لیے ہیں۔ تمام صارفین سے گزارش ہے کہ وہ باہمی احترام، مفید فیڈ بیک اور مثبت تعاون کا مظاہرہ کریں۔',
    s2Title: '2. ممنوعہ سرگرمیاں اور بدسلوکی',
    s2Items: [
      'جعلی دستاویزات، فریب کاری، یا غیر قانونی شناختی کارڈ وغیرہ بنانے کے لیے ٹولز کا استعمال سختی سے ممنوع ہے۔',
      'پلیٹ فارم کے سیکیورٹی نظام میں دخل اندازی یا غیر مجاز ڈیٹا نکالنے کی کوشش نہ کریں۔',
      'ایسے خودکار اسکریپنگ بوٹس استعمال نہ کریں جو دیگر صارفین کے لیے سروس کی رفتار کو متاثر کریں۔',
    ],
    s3Title: '3. اخلاقی کوڈ اور AI کا دانشمندانہ استعمال',
    s3Desc: 'اے آئی ٹولز، او سی آر اور کوڈ کنورٹرز سے حاصل ہونے والے نتائج کو اہم پیداواری یا میڈیکل سسٹمز میں لاگو کرنے سے قبل خود تصدیق کر لیں۔ تعلیمی ایمانداری کو ہمیشہ برقرار رکھیں۔',
    footerPrompt: 'کسی خلاف ورزی کی اطلاع دیں؟',
    contactBtn: 'ٹرسٹ اینڈ سیفٹی ٹیم سے رابطہ کریں',
  },
  ar: {
    badge: 'إرشادات المجتمع والأمان',
    title: 'إرشادات الاستخدام والمجتمع',
    updated: 'آخر تحديث: سبتمبر 2026',
    s1Title: '1. بيئة تعليمية محترمة وآمنة',
    s1Desc: 'تهدف دورات وأدوات مفتاح تولز إلى تمكين المطورين والطلاب والمهندسين عالمياً. يجب على جميع المستخدمين التعامل باحترام في كافة المشاركات والتعليقات ومشاركة الأكواد.',
    s2Title: '2. المحتوى المحظور وإساءة الاستخدام',
    s2Items: [
      'يُحظر تماماً استخدام الأدوات لتوليد مستندات مزورة أو وثائق احتيالية أو مواد تصيد.',
      'عدم محاولة اختراق الأنظمة البرمجية أو استغلال الثغرات لاستخراج البيانات بشكل غير مصرح به.',
      'عدم تشغيل روبوتات كشط البيانات التلقائية التي تؤثر سلباً على أداء المنصة للمستخدمين الآخرين.',
    ],
    s3Title: '3. الاستخدام الأخلاقي للبرمجيات والذكاء الاصطناعي',
    s3Desc: 'عند استخدام أدوات الذكاء الاصطناعي واستخراج OCR ومحولات الأكواد، تحقق دائماً من المخرجات قبل تطبيقها في بيئات الإنتاج الحساسة.',
    footerPrompt: 'الإبلاغ عن انتهاك؟',
    contactBtn: 'تواصل مع فريق الأمان والثقة',
  },
  hi: {
    badge: 'समुदाय व सुरक्षा दिशानिर्देश',
    title: 'उपयोगकर्ता व समुदाय दिशानिर्देश (Community Guidelines)',
    updated: 'अंतिम अपडेट: सितंबर 2026',
    s1Title: '1. सम्मानजनक शिक्षण वातावरण',
    s1Desc: 'मिफ्ताह टूल्स कोर्सेज और टूल्स विश्वभर के छात्रों, इंजीनियरों और क्रिएटर्स को सशक्त बनाने के लिए निर्मित हैं। उपयोगकर्ताओं को सभी संवादों और फीडबैक में परस्पर सम्मान बनाए रखना चाहिए।',
    s2Title: '2. निषिद्ध सामग्री व दुरुपयोग',
    s2Items: [
      'धोखाधड़ी वाले दस्तावेज़, जाली पहचान पत्र या फ़िशिंग सामग्री बनाने के लिए टूल्स का उपयोग पूरी तरह वर्जित है।',
      'प्लेटफॉर्म की सुरक्षा में सेंध लगाने या अनधिकृत डेटा निष्कर्षण का प्रयास न करें।',
      'ऐसे ऑटोमेटेड बॉट्स का उपयोग न करें जो अन्य उपयोगकर्ताओं के लिए प्लेटफॉर्म प्रदर्शन को बाधित करें।',
    ],
    s3Title: '3. नैतिक कोडिंग व AI का सही उपयोग',
    s3Desc: 'AI टूल्स, OCR टेक्स्ट एक्सट्रैक्टर और कोड कन्वर्टर्स का उपयोग करते समय संवेदनशील प्रणालियों में लागू करने से पहले आउटपुट की स्वतंत्र जांच करें।',
    footerPrompt: 'किसी उल्लंघन की रिपोर्ट करें?',
    contactBtn: 'ट्रस्ट व सेफ्टी टीम से संपर्क करें',
  },
};

export default function GuidelinesPage() {
  const { language } = useI18n();
  const loc = GUIDELINES_LOCALES[language] || GUIDELINES_LOCALES.en;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-200 dark:border-brand-800">
            <BookOpen className="w-3.5 h-3.5" />
            {loc.badge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {loc.title}
          </h1>
          <p className="text-xs text-slate-500">{loc.updated}</p>
        </div>

        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{loc.s1Title}</h3>
            <p>{loc.s1Desc}</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{loc.s2Title}</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              {loc.s2Items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{loc.s3Title}</h3>
            <p>{loc.s3Desc}</p>
          </section>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">{loc.footerPrompt}</span>
            <Link href="/contact" className="text-xs font-bold text-brand-600 hover:underline cursor-pointer">
              {loc.contactBtn}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
