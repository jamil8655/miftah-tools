'use client';

import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const CONTACT_LOCALES = {
  en: {
    badge: 'Contact Support & Team',
    title: 'We’d Love to Hear From You',
    subtitle: 'Have a question, feedback, feature request, or custom integration inquiry? Get in touch with our team.',
    emailCardTitle: 'Email Support',
    emailCardDesc: 'jrahmanansari132@gmail.com',
    responseCardTitle: 'Response Time',
    responseCardDesc: 'We typically reply to all inquiries within 12-24 business hours.',
    privacyCardTitle: 'Privacy Guarantee',
    privacyCardDesc: 'Your email address will never be shared with advertisers or third parties.',
    successTitle: 'Message Sent Successfully!',
    successDesc: (name: string) => `Thank you for reaching out, ${name}. Our technical support team has received your message and will respond shortly.`,
    sendAnother: 'Send Another Message',
    nameLabel: 'Your Full Name',
    namePlaceholder: 'e.g. Jamilurrahman',
    emailLabel: 'Email Address',
    emailPlaceholder: 'you@example.com',
    subjectLabel: 'Subject',
    subjects: {
      general: 'General Inquiry',
      bug: 'Bug Report / Tool Issue',
      feature: 'Feature / Tool Request',
      course: 'Course & Learning Question',
      enterprise: 'Enterprise & Custom Workflows',
    },
    messageLabel: 'Your Message',
    messagePlaceholder: 'Describe how we can assist you...',
    sendBtn: 'Send Message',
  },
  ur: {
    badge: 'معاونت اور ٹیم سے رابطہ',
    title: 'ہم آپ کے تاثرات اور پیغامات کے منتظر ہیں',
    subtitle: 'کیا آپ کا کوئی سوال، تجویز، نئی فیچر کی درخواست یا رابطہ ہے؟ ہماری ٹیم سے رابطہ کریں۔',
    emailCardTitle: 'ای میل سپورٹ',
    emailCardDesc: 'jrahmanansari132@gmail.com',
    responseCardTitle: 'جواب کا وقت',
    responseCardDesc: 'ہم عموماً 12 سے 24 کاروباری گھنٹوں کے اندر تمام پیغامات کا جواب دیتے ہیں۔',
    privacyCardTitle: 'پرائیویسی کی ضمانت',
    privacyCardDesc: 'آپ کا ای میل ایڈریس کبھی کسی اشتہاری کمپنی یا تیسرے فریق کو نہیں دیا جائے گا۔',
    successTitle: 'پیغام کامیابی سے بھیج دیا گیا!',
    successDesc: (name: string) => `ہم سے رابطہ کرنے کا شکریہ، ${name}۔ ہماری ٹیکنیکل ٹیم کو آپ کا پیغام مل گیا ہے اور ہم جلد جواب دیں گے۔`,
    sendAnother: 'ایک اور پیغام بھیجیں',
    nameLabel: 'آپ کا مکمل نام',
    namePlaceholder: 'مثلاً: جمیل الرحمن',
    emailLabel: 'ای میل ایڈریس',
    emailPlaceholder: 'you@example.com',
    subjectLabel: 'موضوع',
    subjects: {
      general: 'عمومی معلومات و استفسار',
      bug: 'خرابی یا ٹول میں مسئلہ کی اطلاع',
      feature: 'نئے ٹول یا فیچر کی درخواست',
      course: 'کورس اور تعلیمی سوال',
      enterprise: 'انٹرپرائز اور کسٹم ورک فلوز',
    },
    messageLabel: 'آپ کا پیغام',
    messagePlaceholder: 'تفصیل سے لکھیں کہ ہم آپ کی کیسے مدد کر سکتے ہیں...',
    sendBtn: 'پیغام بھیجیں',
  },
  ar: {
    badge: 'الدعم الفني والتواصل',
    title: 'يسعدنا دائماً الاستماع إليك والتواصل معك',
    subtitle: 'هل لديك أي استفسار أو ملاحظة أو اقتراح لأداة جديدة؟ تواصل مباشرة مع فريق العمل.',
    emailCardTitle: 'الدعم عبر البريد',
    emailCardDesc: 'jrahmanansari132@gmail.com',
    responseCardTitle: 'وقت الاستجابة',
    responseCardDesc: 'نقوم بالرد على جميع الرسائل عادة خلال 12 إلى 24 ساعة عمل.',
    privacyCardTitle: 'ضمان الخصوصية',
    privacyCardDesc: 'لن تتم مشاركة بريدك الإلكتروني مع أي جهة خارجية أو معلنين على الإطلاق.',
    successTitle: 'تم إرسال رسالتك بنجاح!',
    successDesc: (name: string) => `شكراً لتواصلك معنا، ${name}. تلقى فريق الدعم الفني رسالتك وسنقوم بالرد عليك في أقرب وقت.`,
    sendAnother: 'إرسال رسالة أخرى',
    nameLabel: 'الاسم الكامل',
    namePlaceholder: 'مثال: جميل الرحمن',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'you@example.com',
    subjectLabel: 'الموضوع',
    subjects: {
      general: 'استفسار عام',
      bug: 'الإبلاغ عن مشكلة في أداة',
      feature: 'طلب ميزة أو أداة جديدة',
      course: 'استفسار حول الدورات التعليمية',
      enterprise: 'حلول الأعمال وسير العمل المخصص',
    },
    messageLabel: 'نص الرسالة',
    messagePlaceholder: 'يرجى كتابة تفاصيل استفسارك وكيف يمكننا مساعدتك...',
    sendBtn: 'إرسال الرسالة',
  },
  hi: {
    badge: 'सपोर्ट व टीम से संपर्क',
    title: 'हम आपसे संवाद करने के लिए सदैव तत्पर हैं',
    subtitle: 'क्या आपका कोई प्रश्न, सुझाव, नए टूल का अनुरोध या कोई समस्या है? हमारी टीम से संपर्क करें।',
    emailCardTitle: 'ईमेल सपोर्ट',
    emailCardDesc: 'jrahmanansari132@gmail.com',
    responseCardTitle: 'प्रतिक्रिया समय',
    responseCardDesc: 'हम आमतौर पर 12 से 24 कार्य घंटों के भीतर सभी प्रश्नों का उत्तर देते हैं।',
    privacyCardTitle: 'गोपनीयता गारंटी',
    privacyCardDesc: 'आपका ईमेल पता किसी भी तीसरे पक्ष या विज्ञापनदाता के साथ साझा नहीं किया जाएगा।',
    successTitle: 'संदेश सफलतापूर्वक भेजा गया!',
    successDesc: (name: string) => `हमसे संपर्क करने के लिए धन्यवाद, ${name}। हमारी तकनीकी टीम को आपका संदेश प्राप्त हो गया है।`,
    sendAnother: 'एक और संदेश भेजें',
    nameLabel: 'आपका पूरा नाम',
    namePlaceholder: 'उदा. जमीलुर्रहमान',
    emailLabel: 'ईमेल पता',
    emailPlaceholder: 'you@example.com',
    subjectLabel: 'विषय',
    subjects: {
      general: 'सामान्य पूछताछ',
      bug: 'बग रिपोर्ट / टूल समस्या',
      feature: 'नए टूल / फीचर का अनुरोध',
      course: 'कोर्स व शिक्षा संबंधी प्रश्न',
      enterprise: 'एंटरप्राइज व कस्टम वर्कफ़्लो',
    },
    messageLabel: 'आपका संदेश',
    messagePlaceholder: 'विस्तार से बताएं कि हम आपकी किस प्रकार सहायता कर सकते हैं...',
    sendBtn: 'संदेश भेजें',
  },
};

export default function ContactPage() {
  const { language } = useI18n();
  const loc = CONTACT_LOCALES[language] || CONTACT_LOCALES.en;
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: loc.subjects.general,
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-200 dark:border-brand-800">
            <Mail className="w-3.5 h-3.5" />
            {loc.badge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {loc.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            {loc.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Side Cards */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{loc.emailCardTitle}</h4>
              <p className="text-[11px] text-slate-500 font-mono">{loc.emailCardDesc}</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{loc.responseCardTitle}</h4>
              <p className="text-[11px] text-slate-500">{loc.responseCardDesc}</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{loc.privacyCardTitle}</h4>
              <p className="text-[11px] text-slate-500">{loc.privacyCardDesc}</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {loc.successTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {loc.successDesc(formData.name)}
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: loc.subjects.general, message: '' });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-all cursor-pointer"
                >
                  {loc.sendAnother}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.nameLabel}</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={loc.namePlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.emailLabel}</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={loc.emailPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.subjectLabel}</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  >
                    <option value={loc.subjects.general}>{loc.subjects.general}</option>
                    <option value={loc.subjects.bug}>{loc.subjects.bug}</option>
                    <option value={loc.subjects.feature}>{loc.subjects.feature}</option>
                    <option value={loc.subjects.course}>{loc.subjects.course}</option>
                    <option value={loc.subjects.enterprise}>{loc.subjects.enterprise}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.messageLabel}</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={loc.messagePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {loc.sendBtn}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
