'use client';

import React, { useState, useRef } from 'react';
import { Award, Download, Share2, Zap, CheckCircle2, User, Calendar, ShieldCheck, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { downloadSingleFile } from '@/lib/utils/download';

interface CertificateProps {
  courseOrQuizTitle: string;
  defaultRecipientName?: string;
  scorePercentage?: number;
  category?: string;
}

const CERT_LOCALES = {
  en: {
    badge: 'Official Verified Credential',
    title: 'Generate Certificate of Completion',
    sub: 'Celebrate your learning achievement! Enter your name to generate an official, high-resolution PDF certificate.',
    nameLabel: 'Your Full Name (As you want it printed):',
    namePlaceholder: 'Enter your name (e.g. Alex Johnson)',
    downloadPdf: 'Download Official PDF Certificate',
    generating: 'Generating PDF...',
    certHeader: 'MIFTAH PRODUCTIVITY ACADEMY',
    certSubHeader: 'OFFICIAL CERTIFICATE OF COMPLETION',
    certPresented: 'THIS IS PROUDLY PRESENTED TO',
    certFor: 'For successfully mastering the course curriculum & assessment in',
    certDate: 'Date of Issue:',
    certId: 'Credential ID:',
    certVerified: 'VERIFIED & AUTHENTICATED',
  },
  ur: {
    badge: 'آفیشل تصدیق شدہ اسناد',
    title: 'تکمیل کورس کا سرٹیفکیٹ بنائیں',
    sub: 'اپنی کامیابی کا جشن منائیں! پرنٹ کے لیے اپنا نام درج کریں اور فوراً ہائی ریزولیوشن پی ڈی ایف سرٹیفکیٹ ڈاؤن لوڈ کریں۔',
    nameLabel: 'آپ کا پورا نام (جیسا پرنٹ پر چاہتے ہیں):',
    namePlaceholder: 'اپنا نام لکھیں...',
    downloadPdf: 'آفیشل PDF سرٹیفکیٹ ڈاؤن لوڈ کریں',
    generating: 'سرٹیفکیٹ تیار ہو رہا ہے...',
    certHeader: 'مفتاح پروڈکٹیویٹی اکیڈمی',
    certSubHeader: 'تکمیل کورس کی باضابطہ سند',
    certPresented: 'یہ سند فخر کے ساتھ پیش کی جاتی ہے برائے',
    certFor: 'کامیابی کے ساتھ نصاب اور کوئز پاس کرنے پر برائے',
    certDate: 'تاریخ اجراء:',
    certId: 'تصدیقی آئی ڈی:',
    certVerified: 'تصدیق شدہ اور محفوظ',
  },
  ar: {
    badge: 'شهادة إتمام رسمية وموثقة',
    title: 'إصدار شهادة الإتمام والاجتياز',
    sub: 'احتفل بإنجازك التعليمي! أدخل اسمك الكامل لإنشاء شهادة PDF رسمية عالية الدقة والوضوح.',
    nameLabel: 'اسمك الكامل (كما ترغب في طباعته):',
    namePlaceholder: 'أدخل اسمك...',
    downloadPdf: 'تحميل شهادة PDF الرسمية',
    generating: 'جاري إصدار الشهادة...',
    certHeader: 'أكاديمية مفتاح للإنتاجية والتقنية',
    certSubHeader: 'شهادة إتمام واجتياز رسمية',
    certPresented: 'تُمنح هذه الشهادة بكل فخر إلى',
    certFor: 'لاجتيازه بنجاح المنهج التعليمي والاختبار في',
    certDate: 'تاريخ الإصدار:',
    certId: 'معرف الشهادة:',
    certVerified: 'معتمدة وموثقة رسمياً',
  },
  hi: {
    badge: 'आधिकारिक सत्यापित प्रमाणपत्र',
    title: 'कोर्स पूर्णता प्रमाणपत्र बनाएं',
    sub: 'अपनी सीखने की उपलब्धि का जश्न मनाएं! आधिकारिक हाई-रेज़ोल्यूशन PDF सर्टिफिकेट बनाने के लिए अपना नाम दर्ज करें।',
    nameLabel: 'आपका पूरा नाम (प्रिंट के लिए):',
    namePlaceholder: 'अपना नाम लिखें...',
    downloadPdf: 'आधिकारिक PDF सर्टिफिकेट डाउनलोड करें',
    generating: 'प्रमाणपत्र बन रहा है...',
    certHeader: 'मिफ्ताह प्रोडक्टिविटी एकेडमी',
    certSubHeader: 'कोर्स पूर्णता का आधिकारिक प्रमाणपत्र',
    certPresented: 'यह प्रमाणपत्र गर्व से प्रदान किया जाता है',
    certFor: 'सफलतापूर्वक पाठ्यक्रम और मूल्यांकन पूरा करने के लिए',
    certDate: 'जारी करने की तारीख:',
    certId: 'सत्यापन आईडी:',
    certVerified: 'सत्यापित व प्रामाणिक',
  },
};

export function CertificateGenerator({
  courseOrQuizTitle,
  defaultRecipientName = 'Student Participant',
  scorePercentage = 100,
  category = 'Engineering',
}: CertificateProps) {
  const { language, isRTL } = useI18n();
  const loc = CERT_LOCALES[language as keyof typeof CERT_LOCALES] || CERT_LOCALES.en;

  const [recipientName, setRecipientName] = useState<string>(defaultRecipientName);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const certId = useRef<string>(
    `MFT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  ).current;

  // Generate High-Res Printable Certificate via Canvas & jsPDF
  const handleDownloadCertificate = async () => {
    if (!recipientName.trim()) return;
    setIsGenerating(true);
    triggerHaptic('medium');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1130;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Background Fill
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1600, 1130);

      // 2. Elegant Border Pattern
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, 1540, 1070);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 50, 1500, 1030);

      // 3. Header Institution
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(loc.certHeader, 800, 140);

      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(loc.certSubHeader, 800, 210);

      // 4. Decorative Ribbon Line
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(600, 240, 400, 4);

      // 5. "This is presented to"
      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 24px Georgia, serif';
      ctx.fillText(loc.certPresented, 800, 320);

      // 6. Recipient Name
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold italic 56px Georgia, serif';
      ctx.fillText(recipientName.trim(), 800, 420);

      // Underline for name
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(400, 445);
      ctx.lineTo(1200, 445);
      ctx.stroke();

      // 7. Course Achievement Detail
      ctx.fillStyle = '#475569';
      ctx.font = '22px sans-serif';
      ctx.fillText(loc.certFor, 800, 520);

      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`"${courseOrQuizTitle}"`, 800, 590);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`Score: ${scorePercentage}% • Honors Distinction`, 800, 650);

      // 8. Official Gold Stamp / Seal
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(800, 800, 75, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('OFFICIAL SEAL', 800, 790);
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('VERIFIED 2026', 800, 815);

      // 9. Footer Info: Issue Date & Credential ID
      const issueDate = new Date().toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      ctx.fillStyle = '#64748b';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${loc.certDate} ${issueDate}`, 100, 1010);

      ctx.textAlign = 'right';
      ctx.fillText(`${loc.certId} ${certId}`, 1500, 1010);

      // 10. Compile to Landscape A4 PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, 842, 595);

      const pdfBlob = pdf.output('blob');
      await downloadSingleFile(pdfBlob, `Certificate_${recipientName.replace(/\s+/g, '_')}.pdf`);
    } catch (err: any) {
      alert(`Certificate error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/5 via-white to-brand-500/10 dark:from-amber-950/20 dark:via-slate-900 dark:to-brand-950/30 border border-amber-500/30 shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
            {loc.badge}
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
            {loc.title}
          </h3>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        {loc.sub}
      </p>

      {/* Recipient Name Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-brand-600" />
          <span>{loc.nameLabel}</span>
        </label>
        <input
          type="text"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder={loc.namePlaceholder}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 shadow-inner"
        />
      </div>

      {/* Action Download Button */}
      <button
        type="button"
        disabled={isGenerating || !recipientName.trim()}
        onClick={handleDownloadCertificate}
        className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-600 via-brand-600 to-indigo-600 hover:opacity-95 text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
      >
        {isGenerating ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>{isGenerating ? loc.generating : loc.downloadPdf}</span>
      </button>
    </div>
  );
}
