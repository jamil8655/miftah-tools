'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  Command,
  ArrowRight,
  Clock,
  Zap,
  Layers,
  CheckCircle2,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  Code,
  Shield,
  Calculator,
  Workflow,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { getLocalizedTool, getLocalizedCategory } from '@/lib/i18n/catalog-translations';
import { Language } from '@/lib/i18n/translations';
import { TOOLS_LIST } from '@/lib/tools-config';
import { ToolDefinition } from '@/lib/types';
import { ToolIcon } from '@/components/shared/ToolIcon';
import { useAuth } from '@/lib/auth/auth-context';

interface IntentMapping {
  keywords: string[];
  toolId: string;
  recommendedReason: Record<Language, string>;
  workflowSteps?: { toolName: Record<Language, string>; purpose: Record<Language, string> }[];
}

const NATURAL_LANGUAGE_INTENTS: IntentMapping[] = [
  {
    keywords: [
      'make pdf smaller',
      'compress pdf',
      'reduce pdf size',
      'shrink pdf',
      'compress my pdf',
      'pdf under 1mb',
      'pdf mb to kb',
      'reduce pdf',
      'پی ڈی ایف سائز کم کریں',
      'پی ڈی ایف چھوٹا کریں',
      'پی ڈی ایف کمپریس',
      'ضغط pdf',
      'تصغير حجم pdf',
      'تقليل حجم pdf',
      'pdf साइज कम करें',
      'pdf कंप्रेस करें',
      'pdf छोटा करें',
    ],
    toolId: 'compress-pdf',
    recommendedReason: {
      en: 'Best for reducing PDF file size without quality loss',
      ur: 'معیار کھوئے بغیر پی ڈی ایف کا سائز کم کرنے کے لیے بہترین',
      ar: 'الأفضل لتقليل حجم ملفات PDF مع الحفاظ على النقاء والجودة',
      hi: 'क्वालिटी बनाए रखते हुए PDF का आकार घटाने के लिए सबसे उत्तम',
    },
  },
  {
    keywords: [
      'pdf to editable word',
      'pdf to docx',
      'convert pdf to word',
      'ocr pdf',
      'pdf to doc',
      'scan to word',
      'extract text from pdf',
      'پی ڈی ایف سے ورڈ',
      'پی ڈی ایف تا ورڈ',
      'تحويل pdf إلى word',
      'تحويل المستند إلى وورد',
      'pdf से word बनाएं',
      'pdf से docx कनवर्टर',
    ],
    toolId: 'pdf-to-docx',
    recommendedReason: {
      en: 'Best for extracting text and layout into editable Word DOCX',
      ur: 'ایڈٹ کے قابل ورڈ فائل (DOCX) میں تبدیل کرنے کے لیے بہترین',
      ar: 'الأفضل لتحويل ملفات PDF إلى مستندات Word DOCX قابلة للتعديل',
      hi: 'संपादन योग्य Word DOCX में परिवर्तित करने के लिए सर्वश्रेष्ठ',
    },
  },
  {
    keywords: [
      'make image 50kb',
      'make image 100kb',
      'resize image to 100kb',
      'image under 100kb',
      'shrink photo',
      'passport signature resize',
      'image mb to kb',
      'image exactly 100kb',
      'make photo smaller',
      'تصویر 100 کے بی',
      'تصویر 50 کے بی',
      'تصویر کا سائز کم کریں',
      'تصغير الصورة 100kb',
      'تغيير حجم الصورة',
      'फोटो 100 kb बनाएं',
      'इमेज साइज कम करें',
      'फोटो रीसाइज 50kb',
    ],
    toolId: 'image-resizer',
    recommendedReason: {
      en: 'Best for resizing photos to exact KB/MB official limits',
      ur: 'سرکاری امتحانات اور داخلوں کے لیے مخصوص سائز (KB) میں تبدیل کریں',
      ar: 'الأفضل لضبط حجم الصور بدقة لمطابقة متطلبات التقديم الرسمية',
      hi: 'सरकारी फॉर्म व पोर्टल्स के लिए सटीक KB/MB में फोटो आकार बदलें',
    },
  },
  {
    keywords: [
      'remove background',
      'transparent png',
      'erase background',
      'photo cutout',
      'remove bg',
      'white background photo',
      'بیک گراؤنڈ ہٹائیں',
      'تصویر کا پس منظر صاف کریں',
      'ازالة الخلفية',
      'حذف خلفية الصورة',
      'फोटो बैकग्राउंड हटाएं',
      'ट्रांसपेरेंट इमेज बनाएं',
    ],
    toolId: 'background-remover',
    recommendedReason: {
      en: 'Best for in-browser AI background cutout with zero uploads',
      ur: 'مکمل رازداری کے ساتھ خودکار بیک گراؤنڈ ہٹانے کے لیے بہترین',
      ar: 'الأفضل لإزالة خلفية الصور بالذكاء الاصطناعي محلياً بدون رفع الملفات',
      hi: 'बिना किसी अपलोड के AI द्वारा फोटो बैकग्राउंड हटाने के लिए सर्वश्रेष्ठ',
    },
    workflowSteps: [
      {
        toolName: { en: 'Background Cutout', ur: 'بیک گراؤنڈ ریموور', ar: 'إزالة الخلفية', hi: 'बैकग्राउंड हटाएं' },
        purpose: { en: 'Transparent PNG', ur: 'شفاف پی این جی', ar: 'PNG شفاف', hi: 'पारदर्शी PNG' },
      },
      {
        toolName: { en: 'Image Resizer', ur: 'امیج ری سائزر', ar: 'تغيير حجم الصورة', hi: 'इमेज रिसाइज़र' },
        purpose: { en: 'Target Size (<50KB)', ur: 'ہدف سائز (<50KB)', ar: 'الحجم المطلوب (<50KB)', hi: 'लक्षित आकार (<50KB)' },
      },
    ],
  },
  {
    keywords: [
      'passport size photo',
      'passport photo maker',
      '3.5x4.5 cm',
      '35x45',
      '2x2 visa photo',
      'upsc photo with date',
      '8 photos print sheet',
      'create passport photo',
      'پاسپورٹ سائز تصویر',
      'پاسپورٹ فوٹو میکر',
      'صورة جواز السفر',
      'صورة فيزا 2x2',
      'पासपोर्ट साइज फोटो',
      'पासपोर्ट फोटो मेकर',
    ],
    toolId: 'passport-photo-maker',
    recommendedReason: {
      en: 'Best for official passport dimensions & printable multi-photo sheets',
      ur: 'سرکاری پاسپورٹ سائز اور 8 تصاویر کی پرنٹ شیٹ بنانے کے لیے بہترین',
      ar: 'الأفضل لإنشاء صور جواز السفر الرسمية وطباعة أوراق صور متعددة',
      hi: 'आधिकारिक पासपोर्ट साइज फोटो और प्रिंटेबल 8-फोटो शीट तैयार करें',
    },
    workflowSteps: [
      {
        toolName: { en: 'Background Cutout', ur: 'سفید پس منظر', ar: 'خلفية بيضاء', hi: 'सफेद बैकग्राउंड' },
        purpose: { en: 'White Studio Backdrop', ur: 'اسٹوڈیو وائٹ بیک گراؤنڈ', ar: 'خلفية استوديو بيضاء', hi: 'स्टूडियो व्हाइट बैकग्राउंड' },
      },
      {
        toolName: { en: 'Passport Cropper', ur: 'پاسپورٹ سائز فریم', ar: 'إطار جواز السفر', hi: 'पासपोर्ट फ्रेम (3.5x4.5cm)' },
        purpose: { en: 'Exact 3.5x4.5cm Frame', ur: 'صحیح 3.5x4.5 سینٹی میٹر', ar: 'مقاس 3.5x4.5 سم بدقة', hi: 'सटीक 3.5x4.5cm फ्रेम' },
      },
      {
        toolName: { en: 'Print Sheet', ur: 'پرنٹ شیٹ', ar: 'ورقة الطباعة', hi: 'प्रिंट शीट' },
        purpose: { en: '8 Photos on 4x6" Sheet', ur: '4x6 انچ شیٹ پر 8 تصاویر', ar: '8 صور على ورقة 4x6 إنش', hi: '4x6" शीट पर 8 फोटो' },
      },
    ],
  },
  {
    keywords: [
      'convert picture to webp',
      'convert image to webp',
      'png to webp',
      'jpg to webp',
      'webp converter',
      'ویب پی میں تبدیل کریں',
      'تحويل الى webp',
      'webp कनवर्टर',
    ],
    toolId: 'image-converter',
    recommendedReason: {
      en: 'Best for next-gen lossless WebP conversion with 80% smaller size',
      ur: '80 فیصد چھوٹی اور تیز ترین ویب پی (WebP) تصاویر کے لیے بہترین',
      ar: 'الأفضل للتحويل إلى صيغة WebP الحديثة مع توفير 80% من المساحة',
      hi: '80% कम साइज के साथ आधुनिक WebP फॉर्मेट में बदलने के लिए सर्वश्रेष्ठ',
    },
  },
  {
    keywords: [
      'extract audio from video',
      'video to mp3',
      'mp4 to mp3',
      'video to audio',
      'convert video to song',
      'ویڈیو سے آڈیو',
      'ویڈیو تا ایم پی 3',
      'تحويل الفيديو الى mp3',
      'فصل الصوت من الفيديو',
      'वीडियो से mp3 बनाएं',
      'वीडियो टू ऑडियो',
    ],
    toolId: 'video-to-mp3',
    recommendedReason: {
      en: 'Best for high-speed 320kbps MP3 audio extraction',
      ur: 'ویڈیو سے انتہائی اعلیٰ معیار کی MP3 آڈیو نکالنے کے لیے بہترین',
      ar: 'الأفضل لاستخراج الصوت بجودة 320kbps عالية النقاء من مقاطع الفيديو',
      hi: 'उच्च गुणवत्ता वाली 320kbps MP3 ऑडियो निकालने के लिए सबसे उपयुक्त',
    },
  },
  {
    keywords: [
      'combine pdfs',
      'join pdf',
      'merge documents',
      'merge pdf',
      'merge these documents',
      'پی ڈی ایف جوڑیں',
      'پی ڈی ایف یکجا کریں',
      'دمج ملفات pdf',
      'جمع ملفات pdf',
      'pdf जोड़ें',
      'pdf मर्ज करें',
    ],
    toolId: 'merge-pdf',
    recommendedReason: {
      en: 'Best for combining multiple PDF files into one clean document',
      ur: 'متعدد پی ڈی ایف فائلوں کو ایک فائل میں یکجا کرنے کے لیے بہترین',
      ar: 'الأفضل لدمج مستندات PDF المتعددة في ملف واحد منظم',
      hi: 'कई PDF फ़ाइलों को एक साफ़ दस्तावेज़ में मिलाने के लिए सर्वश्रेष्ठ',
    },
  },
  {
    keywords: ['generate qr code', 'qr code', 'make qr', 'barcode generator', 'create qr code', 'کیو آر کوڈ بنائیں', 'انشاء رمز qr', 'QR कोड बनाएं'],
    toolId: 'qr-code-generator',
    recommendedReason: {
      en: 'Best for generating high-res QR codes and barcodes with custom styling',
      ur: 'اعلیٰ کوالٹی کے کیو آر اور بارکوڈ بنانے کے لیے بہترین',
      ar: 'الأفضل لإنشاء رموز QR والباركود بجودة عالية وتخصيص كامل للألوان',
      hi: 'कस्टम स्टाइल के साथ हाई-रेज़ोल्यूशन QR कोड व बारकोड बनाएं',
    },
  },
  {
    keywords: ['percentage calculator', 'calculate percentage', 'math calculator', 'discount calc', 'فیصد کیلکولیٹر', 'حاسبة النسبة المئوية', 'प्रतिशत कैलकुलेटर'],
    toolId: 'percentage-calculator',
    recommendedReason: {
      en: 'Best for calculating percentages, discounts, and ratio increases',
      ur: 'فیصد، رعایت اور تناسب کا فوری حساب لگانے کے لیے بہترین',
      ar: 'الأفضل لحساب النسب المئوية والخصومات والزيادات بسهولة',
      hi: 'प्रतिशत, छूट और अनुपात की तुरंत गणना करने के लिए उपयुक्त',
    },
  },
  {
    keywords: ['json formatter', 'format json', 'beautify json', 'json validator', 'جے سن فارمیٹر', 'تنسيق json', 'JSON फॉर्मेटर'],
    toolId: 'json-formatter',
    recommendedReason: {
      en: 'Best for validating and beautifying raw JSON structures',
      ur: 'جے سن ڈیٹا کو درست اور خوبصورت بنانے کے لیے بہترین',
      ar: 'الأفضل للتحقق من صحة وتنسيق بيانات JSON البرمجية',
      hi: 'JSON डेटा को मान्य और व्यवस्थित करने के लिए सबसे अच्छा',
    },
  },
  {
    keywords: ['password generator', 'password strength', 'strong password', 'secure password', 'پاس ورڈ بنائیں', 'مولد كلمات المرور', 'पासवर्ड जनरेटर'],
    toolId: 'password-generator',
    recommendedReason: {
      en: 'Best for generating cryptographic high-entropy passwords',
      ur: 'انتہائی محفوظ اور مضبوط پاس ورڈ تیار کرنے کے لیے بہترین',
      ar: 'الأفضل لتوليد كلمات مرور قوية ومعقدة غير قابلة للاختراق',
      hi: 'अत्यधिक सुरक्षित व मजबूत पासवर्ड बनाने के लिए सर्वोत्तम',
    },
  },
];

const SEARCH_LOCALES: Record<Language, {
  placeholder: string;
  bestMatch: string;
  recommended: string;
  launch: string;
  workflow: string;
  openWorkflow: string;
  adminCenter: string;
  adminDesc: string;
  adminOnly: string;
  matchingTools: string;
  popularTools: string;
  inBrowser: string;
  noMatch: string;
  trySearching: string;
  footerPrivacy: string;
  totalTools: string;
}> = {
  en: {
    placeholder: 'What do you want to do? (e.g. Compress PDF, Make image 100 KB, Passport photo)...',
    bestMatch: 'Best Match for Your Goal',
    recommended: 'RECOMMENDED',
    launch: 'Launch',
    workflow: 'Automated Workflow',
    openWorkflow: 'Open Workflow ➔',
    adminCenter: 'Miftah Tools Admin Control Center',
    adminDesc: 'System Telemetry, User Roles, and Tool Switches',
    adminOnly: 'ADMIN ONLY',
    matchingTools: 'Matching Tools',
    popularTools: 'Popular Tools',
    inBrowser: '100% In-Browser',
    noMatch: 'No exact tool matched',
    trySearching: 'Try searching for:',
    footerPrivacy: 'Type your goal in plain words • 100% In-Browser Privacy',
    totalTools: '220+ Utilities',
  },
  ur: {
    placeholder: 'آپ کیا کرنا چاہتے ہیں؟ (مثلاً پی ڈی ایف کمپریس، تصویر 100 کے بی، پاسپورٹ فوٹو)...',
    bestMatch: 'آپ کے مقصد کے لیے بہترین ٹول',
    recommended: 'تجویز کردہ',
    launch: 'شروع کریں',
    workflow: 'خودکار ورک فلو',
    openWorkflow: 'ورک فلو کھولیں ➔',
    adminCenter: 'نیکزورا ایڈمن کنٹرول سینٹر',
    adminDesc: 'سسٹم ٹیلی میٹری، صارف کے کردار اور ٹول سوئچز',
    adminOnly: 'صرف ایڈمن',
    matchingTools: 'ملتے جلتے ٹولز',
    popularTools: 'مقبول ٹولز',
    inBrowser: '100% براؤزر کے اندر محفوظ',
    noMatch: 'کوئی ٹول نہیں ملا',
    trySearching: 'یہ تلاش کرنے کی کوشش کریں:',
    footerPrivacy: 'سادہ الفاظ میں اپنا مقصد لکھیں • 100% آف لائن پرائیویسی',
    totalTools: '220+ ٹولز',
  },
  ar: {
    placeholder: 'ما الذي تريد القيام به؟ (مثال: ضغط PDF، تصغير الصورة إلى 100 كيلوبايت، صورة جواز السفر)...',
    bestMatch: 'الخيار الأفضل لهدفك',
    recommended: 'موصى به',
    launch: 'تشغيل',
    workflow: 'سير عمل مؤتمت',
    openWorkflow: 'فتح سير العمل ➔',
    adminCenter: 'مركز التحكم الإداري لـ Miftah Tools',
    adminDesc: 'بيانات النظام، أدوار المستخدمين ومفاتيح الأدوات',
    adminOnly: 'للإدارة فقط',
    matchingTools: 'الأدوات المطابقة',
    popularTools: 'الأدوات الشائعة',
    inBrowser: '100% داخل المتصفح بأمان',
    noMatch: 'لم يتم العثور على أداة مطابقة لـ',
    trySearching: 'جرب البحث عن:',
    footerPrivacy: 'اكتب هدفك بكلمات بسيطة • خصوصية تامة 100% داخل جهازك',
    totalTools: '220+ أداة',
  },
  hi: {
    placeholder: 'आप क्या करना चाहते हैं? (उदा. PDF कंप्रेस करें, फोटो 100 KB बनाएं, पासपोर्ट फोटो)...',
    bestMatch: 'आपके कार्य के लिए सबसे सटीक टूल',
    recommended: 'अनुशंसित',
    launch: 'शुरू करें',
    workflow: 'स्वचालित वर्कफ़्लो',
    openWorkflow: 'वर्कफ़्लो खोलें ➔',
    adminCenter: 'Miftah Tools एडमिन कंट्रोल सेंटर',
    adminDesc: 'सिस्टम मेट्रिक्स, यूज़र रोल्स व टूल स्विच',
    adminOnly: 'केवल एडमिन',
    matchingTools: 'प्रासंगिक टूल्स',
    popularTools: 'लोकप्रिय टूल्स',
    inBrowser: '100% ब्राउज़र में सुरक्षित',
    noMatch: 'कोई सटीक टूल नहीं मिला',
    trySearching: 'इन्हें खोज कर देखें:',
    footerPrivacy: 'सरल शब्दों में अपना लक्ष्य लिखें • 100% गोपनीयता',
    totalTools: '220+ टूल्स',
  },
};
interface UnifiedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function UnifiedSearchModal({
  isOpen,
  onClose,
  initialQuery = '',
}: UnifiedSearchModalProps) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { language, isRTL } = useI18n();
  const loc = SEARCH_LOCALES[language] || SEARCH_LOCALES.en;
  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialQuery]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // 1. Natural Language Intent Match
  const matchedIntent = normalizedQuery
    ? NATURAL_LANGUAGE_INTENTS.find((item) =>
        item.keywords.some((kw) => normalizedQuery.includes(kw.toLowerCase()) || kw.toLowerCase().includes(normalizedQuery))
      )
    : null;

  // 2. Direct Tools Search (Multilingual + English)
  const matchingTools = normalizedQuery
    ? TOOLS_LIST.filter((tool) => {
        const localized = getLocalizedTool(tool, language);
        const localizedCat = getLocalizedCategory(tool.category, language);
        const nameMatch = tool.name.toLowerCase().includes(normalizedQuery) || localized.name.toLowerCase().includes(normalizedQuery);
        const descMatch = tool.shortDesc.toLowerCase().includes(normalizedQuery) || localized.shortDesc.toLowerCase().includes(normalizedQuery);
        const tagMatch = tool.tags.some((t) => t.toLowerCase().includes(normalizedQuery));
        const catMatch = tool.category.toLowerCase().includes(normalizedQuery) || localizedCat.toLowerCase().includes(normalizedQuery);
        return nameMatch || descMatch || tagMatch || catMatch;
      }).slice(0, 8)
    : TOOLS_LIST.filter((t) => t.popular).slice(0, 6);

  // 3. Matched Primary Tool
  const primaryTool = matchedIntent
    ? TOOLS_LIST.find((t) => t.id === matchedIntent.toolId || t.slug === matchedIntent.toolId)
    : null;
  const primaryToolLocalized = primaryTool ? getLocalizedTool(primaryTool, language) : null;

  // 4. Admin Search Inclusion (Only for verified admin)
  const showAdminOption = isAdmin && (normalizedQuery.includes('admin') || normalizedQuery.includes('ایڈمن') || normalizedQuery.includes('إدارة') || normalizedQuery.includes('एडमिन'));

  const handleSelectTool = (tool: ToolDefinition) => {
    router.push(`/tools/${tool.slug || tool.id}`);
    onClose();
  };

  const handleNavigateWorkflow = () => {
    router.push('/workflows');
    onClose();
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Search Input */}
        <div className="relative flex items-center px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search className={`w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={loc.placeholder}
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base font-semibold focus:outline-none"
          />

          <div className="flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* A. AI Intent Best Match Card */}
          {primaryTool && matchedIntent && primaryToolLocalized && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/40 dark:to-indigo-950/40 border border-brand-200 dark:border-brand-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>{loc.bestMatch}</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-brand-600 text-white">
                  {loc.recommended}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {primaryToolLocalized.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {matchedIntent.recommendedReason[language] || matchedIntent.recommendedReason.en}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTool(primaryTool)}
                  className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
                >
                  <span>{loc.launch}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Multi-step Workflow Suggestion if intent matches multi-tool */}
              {matchedIntent.workflowSteps && (
                <div className="pt-2 border-t border-brand-200/60 dark:border-brand-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold">
                    <Workflow className="w-3.5 h-3.5" />
                    <span>
                      {loc.workflow}:{' '}
                      {matchedIntent.workflowSteps
                        .map((s) => s.toolName[language] || s.toolName.en)
                        .join(' ➔ ')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNavigateWorkflow}
                    className="font-bold text-purple-600 dark:text-purple-400 hover:underline text-[11px]"
                  >
                    {loc.openWorkflow}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* B. Admin Center Match (Only for verified Admin) */}
          {showAdminOption && (
            <div
              onClick={() => {
                router.push('/admin');
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-bold text-xs">{loc.adminCenter}</div>
                  <div className="text-[10px] text-slate-400">{loc.adminDesc}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-600 text-white">
                {loc.adminOnly}
              </span>
            </div>
          )}

          {/* C. Matching Tools List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              <span>{query ? `${loc.matchingTools} (${matchingTools.length})` : loc.popularTools}</span>
              <span>{loc.inBrowser}</span>
            </div>

            {matchingTools.length === 0 && !primaryTool ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {loc.noMatch} &ldquo;{query}&rdquo;
                </p>
                <p className="text-[11px] text-slate-400">
                  {loc.trySearching}{' '}
                  <span className="text-brand-600 font-semibold cursor-pointer" onClick={() => setQuery('compress pdf')}>
                    Compress PDF
                  </span>
                  ,{' '}
                  <span className="text-brand-600 font-semibold cursor-pointer" onClick={() => setQuery('passport photo')}>
                    Passport Photo
                  </span>
                  ,{' '}
                  <span className="text-brand-600 font-semibold cursor-pointer" onClick={() => setQuery('remove background')}>
                    Remove Background
                  </span>
                  .
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchingTools.map((tool) => {
                  const localized = getLocalizedTool(tool, language);
                  return (
                    <div
                      key={tool.id}
                      onClick={() => handleSelectTool(tool)}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ToolIcon name={tool.icon} className="w-4 h-4 text-brand-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-brand-600">
                            {localized.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {localized.shortDesc}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 ${isRTL ? 'group-hover:-translate-x-0.5 rotate-180 mr-2' : 'group-hover:translate-x-0.5 ml-2'} transition-all shrink-0`} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Guidance */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>{loc.footerPrivacy}</span>
          </div>
          <span className="font-semibold text-brand-600 dark:text-brand-400">{loc.totalTools}</span>
        </div>
      </div>
    </div>
  );
}

