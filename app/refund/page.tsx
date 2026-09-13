'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const REFUND_LOCALES = {
  en: {
    badge: 'Billing & Policy',
    title: 'Refund & Billing Policy',
    updated: 'Last updated: September 2026',
    s1Title: '1. Free Core Platform Access',
    s1Desc: 'All 220+ core digital utility tools and educational course materials on Miftah Tools are provided 100% free of charge. No payment details or credit cards are required to access full-featured PDF editing, image processing, OCR, or course modules.',
    s2Title: '2. Future Paid Tier & Subscription Architecture',
    s2Desc: 'In the future, when premium automated cloud workers, specialized enterprise team workflows, or dedicated support subscriptions are introduced, we will offer a transparent 14-day no-questions-asked refund policy on all eligible purchases.',
    s3Title: '3. How to Request Billing Support',
    s3Desc: 'For any billing inquiries, invoice requests, or payment concerns regarding future premium services, please contact our support team at jrahmanansari132@gmail.com with your registered email and account UID.',
    footerPrompt: 'Need billing help?',
    contactBtn: 'Contact Billing Support',
  },
  ur: {
    badge: 'بلنگ اور ریفنڈ پالیسی',
    title: 'ریفنڈ اور ادائیگی کی پالیسی (Refund Policy)',
    updated: 'آخری تجدید: ستمبر 2026',
    s1Title: '1. پلیٹ فارم کے تمام ٹولز مفت ہیں',
    s1Desc: 'مفتاح ٹولز پر تمام 220+ ڈیجیٹل ٹولز اور کورسز کا تعلیمی مواد 100٪ مفت فراہم کیا گیا ہے۔ پی ڈی ایف ایڈیٹنگ، تصاویر کمپریس کرنے، ٹیکسٹ نکالنے اور سیکھنے کے لیے کسی کریڈٹ کارڈ یا ادائیگی کی ضرورت نہیں ہے۔',
    s2Title: '2. مستقبل کی پریمیم سروسز اور ریفنڈ کی سہولت',
    s2Desc: 'مستقبل میں اگر کوئی پریمیم کلاؤڈ سروس، کسٹم انٹرپرائز سپورٹ یا خصوصی فیچرز متعارف کرائے گئے تو ان پر 14 دن کی بغیر کسی سوال کے مکمل ریفنڈ پالیسی نافذ ہوگی۔',
    s3Title: '3. بلنگ سپورٹ سے رابطہ کیسے کریں',
    s3Desc: 'بلنگ، رسید یا کسی بھی قسم کی ادائیگی کے متعلق استفسار کے لیے ہماری ٹیم کو jrahmanansari132@gmail.com پر ای میل کریں۔',
    footerPrompt: 'بلنگ کے بارے میں مدد چاہیے؟',
    contactBtn: 'بلنگ سپورٹ سے رابطہ کریں',
  },
  ar: {
    badge: 'سياسة الفوترة والاسترداد',
    title: 'سياسة الاسترداد والمدفوعات',
    updated: 'آخر تحديث: سبتمبر 2026',
    s1Title: '1. وصول مجاني 100٪ لكافة الأدوات',
    s1Desc: 'جميع الأدوات الـ 220+ والمناهج التعليمية في مفتاح تولز مجانية بالكامل بنسبة 100٪. لا نطلب أي بيانات دفع أو بطاقات ائتمانية للاستفادة من تحرير PDF أو ضغط الصور أو OCR.',
    s2Title: '2. سياسة استرداد الأموال للخدمات المدفوعة مستقبلاً',
    s2Desc: 'في المستقبل، عند إطلاق أي اشتراكات سحابية مؤسسية أو دعم فني مخصص، سنقدم سياسة استرداد كاملة لمدة 14 يوماً دون أي تعقيدات أو شروط مسبقة.',
    s3Title: '3. كيفية طلب الدعم المالي والفوترة',
    s3Desc: 'لأي استفسارات حول الفواتير أو المدفوعات للخدمات المؤسسية المستقبلية، يرجى مراسلة فريق الدعم المالي عبر: jrahmanansari132@gmail.com.',
    footerPrompt: 'هل تحتاج إلى مساعدة مالية؟',
    contactBtn: 'تواصل مع الدعم المالي',
  },
  hi: {
    badge: 'बिलिंग व रिफंड नीति',
    title: 'रिफंड और बिलिंग नीति (Refund Policy)',
    updated: 'अंतिम अपडेट: सितंबर 2026',
    s1Title: '1. संपूर्ण मुफ़्त प्लेटफॉर्म पहुंच',
    s1Desc: 'मिफ्ताह टूल्स पर सभी 220+ डिजिटल यूटिलिटी टूल्स और कोर्स सामग्री 100% मुफ़्त उपलब्ध कराई गई है। PDF एडिटिंग, इमेज प्रोसेसिंग या OCR के लिए किसी क्रेडिट कार्ड या भुगतान की आवश्यकता नहीं है।',
    s2Title: '2. भविष्य की सशुल्क सेवाओं के लिए रिफंड नीति',
    s2Desc: 'भविष्य में यदि कोई प्रीमियम क्लाउड फीचर्स या एंटरप्राइज सपोर्ट पैकेज पेश किए जाते हैं, तो हम 14 दिनों की बिना किसी शर्त पूर्ण रिफंड नीति प्रदान करेंगे।',
    s3Title: '3. बिलिंग सहायता कैसे प्राप्त करें',
    s3Desc: 'भविष्य की सेवाओं के बिलिंग प्रश्नों या इनवॉइस अनुरोधों के लिए कृपया हमारी सहायता टीम से jrahmanansari132@gmail.com पर संपर्क करें।',
    footerPrompt: 'बिलिंग में सहायता चाहिए?',
    contactBtn: 'बिलिंग सपोर्ट से संपर्क करें',
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
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{loc.s1Title}</h3>
            <p>{loc.s1Desc}</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{loc.s2Title}</h3>
            <p>{loc.s2Desc}</p>
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
