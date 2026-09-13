'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const TERMS_LOCALES = {
  en: {
    badge: 'Legal Agreement',
    title: 'Terms of Service',
    updated: 'Last updated: September 2026',
    s1Title: '1. Acceptance of Terms',
    s1Desc: 'By accessing, browsing, or using Miftah Tools (including all 220+ client-side digital utility tools, courses, workflows, and developer APIs), you agree to be bound by these Terms of Service. If you do not agree, please do not use the services.',
    s2Title: '2. 100% Free Core Tools & Learning Usage',
    s2Desc: 'All core utility tools and open learning materials provided on Miftah Tools are free for both personal and commercial use. You may convert, compress, edit, calculate, and download your files without subscription requirements.',
    s3Title: '3. Client-Side WebAssembly Processing & Ownership',
    s3Desc: 'All file transformations take place locally on your client device using in-browser WebAssembly. You retain 100% full ownership and intellectual property rights over all files, documents, images, and content you process. Miftah Tools does not claim any rights, access, or custody over your data.',
    s4Title: '4. Acceptable Use Policy',
    s4Desc: 'You agree not to use Miftah Tools for any illegal, malicious, or abusive activities, including the creation or dissemination of malware, unlawful copyright infringement, or attempting to compromise platform infrastructure.',
    s5Title: '5. Limitation of Liability',
    s5Desc: 'Miftah Tools is provided "as is" without warranty of any kind. While our tools undergo rigorous testing for precision and performance, we are not liable for any data loss, transformation inaccuracies, or service interruptions resulting from local device limitations.',
    footerPrompt: 'Questions about our terms?',
    contactBtn: 'Contact Support',
  },
  ur: {
    badge: 'قانونی معاہدہ',
    title: 'شرائط و ضوابط (Terms of Service)',
    updated: 'آخری تجدید: ستمبر 2026',
    s1Title: '1. شرائط کی قبولیت',
    s1Desc: 'مفتاح ٹولز (بشمول تمام 220+ کلائنٹ سائیڈ ڈیجیٹل ٹولز، کورسز، ورک فلوز اور APIs) استعمال کرنے پر آپ ان شرائط کے پابند ہونے کا اقرار کرتے ہیں۔ اگر آپ ان سے متفق نہیں ہیں تو براہ کرم سروسز استعمال نہ کریں۔',
    s2Title: '2. 100٪ مفت ٹولز اور تعلیمی مواد کا استعمال',
    s2Desc: 'مفتاح ٹولز پر فراہم کردہ تمام بنیادی یوٹیلیٹی ٹولز اور اوپن تعلیمی مواد ذاتی اور تجارتی دونوں مقاصد کے لیے 100٪ مفت ہیں۔ آپ بغیر کسی لازمی فیس یا سبسکرپشن کے فائلیں تبدیل اور ڈاؤن لوڈ کر سکتے ہیں۔',
    s3Title: '3. لوکل براؤزر پروسیسنگ اور فائلز کی ملکیت',
    s3Desc: 'تمام فائل پروسیسنگ ویب اسمبلی (WASM) کے ذریعے براہ راست آپ کے ڈیوائس پر ہوتی ہے۔ آپ اپنی تمام فائلوں، تصاویر، اور دستاویزات کے مکمل 100٪ قانونی مالک رہتے ہیں۔ مفتاح ٹولز آپ کے ڈیٹا پر کسی قسم کے تصرف کا دعویٰ نہیں کرتا۔',
    s4Title: '4. جائز اور قانونی استعمال کی پالیسی',
    s4Desc: 'آپ مفتاح ٹولز کو کسی غیر قانونی، نقصان دہ یا دھوکہ دہی پر مبنی مقاصد (جیسے وائرس بنانا، کاپی رائٹ کی خلاف ورزی یا پلیٹ فارم پر حملے) کے لیے استعمال نہ کرنے کے پابند ہیں۔',
    s5Title: '5. ذمہ داری کی حدود',
    s5Desc: 'مفتاح ٹولز بغیر کسی پوشیدہ وارنٹی کے "جیسا ہے" کی بنیاد پر فراہم کیا جاتا ہے۔ اگرچہ تمام ٹولز اعلیٰ جانچ سے گزرتے ہیں، لیکن مقامی ڈیوائس کے مسائل یا سسٹم خرابی سے ہونے والے نقصان کی ذمہ داری صارف پر ہوگی۔',
    footerPrompt: 'شرائط کے بارے میں کوئی سوال ہے؟',
    contactBtn: 'سپورٹ سے رابطہ کریں',
  },
  ar: {
    badge: 'اتفاقية الاستخدام القانونية',
    title: 'شروط الخدمة والاستخدام',
    updated: 'آخر تحديث: سبتمبر 2026',
    s1Title: '1. قبول الشروط والأحكام',
    s1Desc: 'باستخدامك لمنصة وتطبيق مفتاح تولز (بما في ذلك جميع الأدوات الـ 220+ والدورات وسير العمل)، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق، يرجى التوقف عن استخدام الخدمات.',
    s2Title: '2. الاستخدام المجاني 100٪ للأدوات والمناهج',
    s2Desc: 'كافة الأدوات الأساسية والمواد التعليمية المتاحة على المنصة مجانية 100٪ للاستخدام الشخصي والتجاري دون الحاجة إلى اشتراك مدفوع أو بطاقة ائتمان.',
    s3Title: '3. المعالجة المحلية وملكية البيانات التامة',
    s3Desc: 'تتم جميع تحويلات ومعالجة الملفات داخل جهازك محلياً عبر WebAssembly. تظل أنت المالك الحصري والقانوني بنسبة 100٪ لكافة مستنداتك وملفاتك وصورك، ولا تدعي المنصة أي حق أو وصول لملفاتك.',
    s4Title: '4. سياسة الاستخدام المقبول والمشروع',
    s4Desc: 'تتعهد بعدم استخدام أدوات مفتاح تولز في أي أنشطة غير قانونية أو احتيالية أو ضارة، مثل نشر البرمجيات الخبيثة أو انتهاك حقوق الملكية الفكرية أو محاولة اختراق البنية التحتية.',
    s5Title: '5. إخلاء وحدود المسؤولية',
    s5Desc: 'يتم تقديم خدمات مفتاح تولز "كما هي". على الرغم من خضوع الأدوات لاختبارات دقيقة للأداء والدقة، إلا أننا لا نتحمل مسؤولية أي فقدان للبيانات ناتج عن محدودية موارد الجهاز المحلي للمستخدم.',
    footerPrompt: 'هل لديك أي استفسار حول الشروط؟',
    contactBtn: 'تواصل مع الدعم القانوني',
  },
  hi: {
    badge: 'कानूनी समझौता',
    title: 'सेवा की शर्तें (Terms of Service)',
    updated: 'अंतिम अपडेट: सितंबर 2026',
    s1Title: '1. शर्तों की स्वीकृति',
    s1Desc: 'मिफ्ताह टूल्स (सभी 220+ क्लाइंट-साइड टूल्स, कोर्सेज और डेवलपर वर्कफ़्लो सहित) का उपयोग करके आप इन सेवा शर्तों से बंधे होने की सहमति देते हैं। यदि आप सहमत नहीं हैं, तो कृपया सेवाओं का उपयोग न करें।',
    s2Title: '2. 100% मुफ़्त कोर टूल्स व शिक्षा उपयोग',
    s2Desc: 'मिफ्ताह टूल्स पर उपलब्ध सभी मुख्य यूटिलिटी टूल्स और खुली शिक्षण सामग्री व्यक्तिगत व व्यावसायिक उपयोग दोनों के लिए 100% मुफ़्त हैं। आप बिना किसी सब्सक्रिप्शन के फाइलें प्रोसेस और डाउनलोड कर सकते हैं।',
    s3Title: '3. क्लाइंट-साइड प्रोसेसिंग व डेटा स्वामित्व',
    s3Desc: 'फाइल की सभी प्रोसेसिंग WebAssembly के माध्यम से आपके अपने फोन/कंप्यूटर पर स्थानीय रूप से होती है। आप अपनी सभी फाइलों, दस्तावेजों और तस्वीरों के 100% पूर्ण स्वामी रहते हैं। मिफ्ताह टूल्स आपके डेटा पर किसी स्वामित्व का दावा नहीं करता।',
    s4Title: '4. स्वीकार्य उपयोग नीति',
    s4Desc: 'आप मिफ्ताह टूल्स का उपयोग किसी भी अवैध, दुर्भावनापूर्ण या अनैतिक गतिविधि (जैसे मैलवेयर बनाना, कॉपीराइट उल्लंघन या सुरक्षा से छेड़छाड़) के लिए नहीं करने के लिए सहमत हैं।',
    s5Title: '5. देयता की सीमा',
    s5Desc: 'मिफ्ताह टूल्स "जैसा है" के आधार पर बिना किसी वारंटी के प्रदान किया जाता है। हालांकि हमारे टूल्स उच्च सटीकता के लिए परीक्षित हैं, लेकिन डिवाइस की तकनीकी सीमाओं से होने वाली किसी भी समस्या के लिए हम उत्तरदायी नहीं हैं।',
    footerPrompt: 'शर्तों के संबंध में कोई प्रश्न?',
    contactBtn: 'सपोर्ट से संपर्क करें',
  },
};

export default function TermsPage() {
  const { language } = useI18n();
  const loc = TERMS_LOCALES[language] || TERMS_LOCALES.en;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-200 dark:border-brand-800">
            <FileText className="w-3.5 h-3.5" />
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

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{loc.s4Title}</h3>
            <p>{loc.s4Desc}</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{loc.s5Title}</h3>
            <p>{loc.s5Desc}</p>
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
