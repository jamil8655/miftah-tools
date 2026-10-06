'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const REFUND_LOCALES = {
  en: {
    badge: 'Billing & Policy',
    title: 'Refund Policy & 100% Free Platform Guarantee',
    updated: 'Last updated: September 2026',
    s1Title: '1. 100% Free Core Platform Guarantee',
    s1Desc: 'All 220+ digital utility tools and educational course materials on Miftah Tools are provided 100% free of charge. No payment details, credit cards, or paid subscriptions are required to access full-featured PDF editing, image processing, OCR, or courses.',
    s2Title: '2. Future Enterprise Services & 14-Day Refund Guarantee',
    s2Desc: 'In the future, if specialized dedicated enterprise cloud workflows or custom support packages are introduced, all eligible paid transactions will include a 14-day no-questions-asked refund guarantee.',
    s3Title: '3. Support & Billing Contact',
    s3Desc: 'For any billing questions, service feedback, or inquiry regarding Miftah Tools, contact our support team at support@miftahtools.com. We reply within 24 business hours.',
    footerPrompt: 'Need help or have questions?',
    contactBtn: 'Contact Support Team',
  },
  ur: {
    badge: 'بلنگ اور پالیسی',
    title: 'ریفنڈ پالیسی اور 100٪ مفت پلیٹ فارم کی ضمانت',
    updated: 'آخری تجدید: ستمبر 2026',
    s1Title: '1. تمام ٹولز 100٪ مفت ہیں (کوئی فیس نہیں)',
    s1Desc: 'مفتاح ٹولز پر تمام 220+ ڈیجیٹل ٹولز اور کورسز کا مواد 100٪ مفت ہے۔ پی ڈی ایف ایڈیٹنگ، تصاویر کمپریس کرنے، ٹیکسٹ نکالنے اور سیکھنے کے لیے کسی کریڈٹ کارڈ یا ادائیگی کی ضرورت نہیں ہے۔',
    s2Title: '2. مستقبل کی انٹرپرائز سروسز پر 14 دن کی ریفنڈ پالیسی',
    s2Desc: 'مستقبل میں اگر کوئی کسٹم انٹرپرائز سپورٹ یا پریمیم کلاؤڈ فیچرز متعارف کرائے گئے تو ان پر 14 دن کی مکمل ریفنڈ پالیسی نافذ ہوگی۔',
    s3Title: '3. سپورٹ ٹیم سے رابطہ',
    s3Desc: 'کسی بھی استفسار یا رہنمائی کے لیے ہماری ٹیم کو support@miftahtools.com پر ای میل کریں۔ ہم 24 گھنٹے میں جواب دیتے ہیں۔',
    footerPrompt: 'کوئی سوال یا رہنمائی چاہیے؟',
    contactBtn: 'سپورٹ ٹیم سے رابطہ کریں',
  },
  ar: {
    badge: 'سياسة الفوترة والضمان',
    title: 'سياسة الاسترداد وضمان المنصة المجانية 100٪',
    updated: 'آخر تحديث: سبتمبر 2026',
    s1Title: '1. وصول مجاني بالكامل 100٪ لكافة الأدوات',
    s1Desc: 'جميع الأدوات الـ 220+ والمناهج التعليمية في مفتاح تولز مجانية بالكامل بنسبة 100٪. لا نطلب أي بيانات دفع أو بطاقات ائتمانية للاستفادة من تحرير PDF أو ضغط الصور أو OCR.',
    s2Title: '2. ضمان استرداد الأموال للخدمات المؤسسية المستقبلية',
    s2Desc: 'في المستقبل، في حال إطلاق أي خدمات سحابية مؤسسية أو دعم فني مخصص، سنقدم ضمان استرداد كامل للأموال لمدة 14 يوماً.',
    s3Title: '3. التواصل مع الدعم الفني',
    s3Desc: 'لأي استفسارات، يرجى مراسلة فريق الدعم الفني عبر: support@miftahtools.com.',
    footerPrompt: 'هل تحتاج إلى مساعدة؟',
    contactBtn: 'تواصل مع فريق الدعم',
  },
  hi: {
    badge: 'बिलिंग व नीति',
    title: 'रिफंड नीति व 100% मुफ़्त प्लेटफॉर्म गारंटी',
    updated: 'अंतिम अपडेट: सितंबर 2026',
    s1Title: '1. 100% मुफ़्त कोर प्लेटफॉर्म गारंटी',
    s1Desc: 'मिफ्ताह टूल्स पर सभी 220+ डिजिटल यूटिलिटी टूल्स और कोर्स सामग्री 100% मुफ़्त उपलब्ध कराई गई है। PDF एडिटिंग, इमेज प्रोसेसिंग या OCR के लिए किसी क्रेडिट कार्ड या भुगतान की आवश्यकता नहीं है।',
    s2Title: '2. भविष्य की एंटरप्राइज सेवाओं के लिए 14-दिवसीय रिफंड गारंटी',
    s2Desc: 'भविष्य में यदि कोई एंटरप्राइज सपोर्ट पैकेज पेश किए जाते हैं, तो हम 14 दिनों की पूर्ण रिफंड नीति प्रदान करेंगे।',
    s3Title: '3. सहायता व सपोर्ट संपर्क',
    s3Desc: 'किसी भी प्रश्न के लिए कृपया हमारी सहायता टीम से support@miftahtools.com पर संपर्क करें।',
    footerPrompt: 'सहायता चाहिए?',
    contactBtn: 'सपोर्ट से संपर्क करें',
  },
};

export default function RefundPage() {
  const { language } = useI18n();
  const loc = REFUND_LOCALES[language] || REFUND_LOCALES.en;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-200 dark:border-brand-800">
            <CreditCard className="w-3.5 h-3.5" />
            {loc.badge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {loc.title}
          </h1>
          <p className="text-xs text-slate-500">{loc.updated}</p>
        </div>

        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{loc.s1Title}</h2>
            <p>{loc.s1Desc}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{loc.s2Title}</h2>
            <p>{loc.s2Desc}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{loc.s3Title}</h2>
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
