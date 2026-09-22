'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { CameraScannerStudio } from '@/components/camera/CameraScannerStudio';
import { Camera, Zap, ShieldCheck, Lock, Layers } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const PAGE_LOCALES = {
  en: {
    badge: 'Mobile Camera Scanner & Doc Enhancer',
    title: 'Camera Document & Receipt Scanner',
    desc: 'Capture paper documents, multi-page book chapters, receipts, and ID cards with instant edge cropping, contrast boosting, and 1-click multi-page PDF export.',
    features: [
      { title: 'Multi-Page Scan', desc: 'Capture unlimited pages and compile directly into a single PDF.' },
      { title: 'Magic Color & B&W', desc: 'Sharpen text and strip paper background shadows automatically.' },
      { title: '100% In-Device Privacy', desc: 'Camera video stream stays strictly inside your device browser memory.' },
    ],
  },
  ur: {
    badge: 'موبائل کیمرا اسکینر و ڈاکومنٹ انہانسر',
    title: 'کیمرا ڈاکومنٹ و رسید اسکینر اسٹوڈیو',
    desc: 'موبائل کیمرے سے کاغذات، رسیدیں، کتابیں اور شناختی کارڈ اسکین کریں۔ خودکار بارڈر کراپنگ، میجک کلر اور فوری ملٹی پیج پی ڈی ایف ایکسپورٹ کے ساتھ۔',
    features: [
      { title: 'ملٹی پیج اسکیننگ', desc: 'جتنے مرضی صفحات اسکین کریں اور ایک ہی پی ڈی ایف فائل میں یکجا کریں۔' },
      { title: 'میجک کلر و بی اینڈ ڈبلیو', desc: 'دستاویز کی لکھائی کو نکھاریں اور کاغذ کے سائے فوراً ختم کریں۔' },
      { title: '100% مکمل رازداری', desc: 'کیمرے کی ویڈیو یا تصاویر کبھی بھی ڈیوائس سے باہر نہیں جاتیں۔' },
    ],
  },
  ar: {
    badge: 'ماسح المستندات الذكي بالكاميرا',
    title: 'ماسح المستندات والإيصالات التفاعلي بالكاميرا',
    desc: 'التقط المستندات الورقية والكتب والإيصالات وبطاقات الهوية مع تحسين تلقائي للتباين وتصدير فوري إلى ملف PDF عالي الدقة.',
    features: [
      { title: 'مسح متعدد الصفحات', desc: 'التقط صفحات غير محدودة واجمعها مباشرة في ملف PDF واحد.' },
      { title: 'ألوان سحرية وأبيض وأسود', desc: 'توضيح النصوص وإزالة ظلال الورق المزعجة تلقائياً.' },
      { title: 'خصوصية محلية 100%', desc: 'تتم معالجة بث الكاميرا والصور محلياً داخل جهازك بأمان تام.' },
    ],
  },
  hi: {
    badge: 'मोबाइल कैमरा स्कैनर व दस्तावेज़ संवर्द्धक',
    title: 'कैमरा डॉक्यूमेंट व रसीद स्कैनर स्टूडियो',
    desc: 'मोबाइल कैमरे से कागजात, रसीदें, किताबें और आईडी कार्ड स्कैन करें। मैजिक कलर, कंट्रास्ट एन्हांसमेंट और 1-क्लिक मल्टी-पेज PDF एक्सपोर्ट के साथ।',
    features: [
      { title: 'मल्टी-पेज स्कैनिंग', desc: 'असीमित पेज स्कैन करें और एक ही PDF फ़ाइल में जोड़ें।' },
      { title: 'मैजिक कलर व B&W', desc: 'टेक्स्ट को स्पष्ट करें और कागज़ के अवांछित साये तुरंत हटाएं।' },
      { title: '100% इन-डिवाइस प्राइवेसी', desc: 'कैमरा डेटा और फ़ोटो कभी भी आपके फोन से बाहर नहीं जाते।' },
    ],
  },
};

export default function CameraScannerPage() {
  const { language } = useI18n();
  const loc = PAGE_LOCALES[language as keyof typeof PAGE_LOCALES] || PAGE_LOCALES.en;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: loc.title }]} />

      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
          <Camera className="w-3.5 h-3.5" />
          <span>{loc.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center justify-center gap-2.5">
          <Camera className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          <span>{loc.title}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {loc.desc}
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
        <CameraScannerStudio />
      </div>

      {/* Feature Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {loc.features.map((feat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
              {idx === 0 ? <Layers className="w-4 h-4" /> : idx === 1 ? <Zap className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{feat.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
