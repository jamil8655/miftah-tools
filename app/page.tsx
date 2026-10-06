'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  FileText,
  Minimize2,
  Combine,
  Image as ImageIcon,
  ScanText,
  QrCode,
  Layers,
  FileCheck,
  Type,
  Video,
  Bookmark,
  Terminal,
  ShieldCheck,
  Search,
  X,
  History,
  CheckCircle2,
  Sliders,
  RefreshCw,
  Calculator,
  Lock,
  Smartphone,
  ChevronRight,
  Check,
  Sparkles,
} from 'lucide-react';
import { TOOLS_LIST, CATEGORIES_CONFIG } from '@/lib/tools-config';
import { ToolCard } from '@/components/shared/ToolCard';
import { NativeFeedAd } from '@/components/ads/NativeFeedAd';
import { AdSlot } from '@/components/ads/AdSlot';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useUserStore } from '@/lib/user/user-store';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { getLocalizedTool, getLocalizedCategory } from '@/lib/i18n/catalog-translations';

const PAGE_LOCALES = {
  en: {
    heroEyebrow: 'MIFTAH TOOLS',
    heroHeading1: '220+ Digital Tools.',
    heroHeading2: 'One Simple Workspace.',
    heroSupporting: 'Convert, edit, compress and create with fast, privacy-focused tools designed for everyday digital work.',
    exploreAllCta: 'Explore All Tools →',
    downloadAppCta: 'Download Android App',
    searchPlaceholder: 'Search 220+ tools (e.g. PDF to Word, OCR, Compress, QR)...',
    valueTools: '220+ Tools',
    valueToolsDesc: 'Full Client-Side Suite',
    valueFast: 'Fast Processing',
    valueFastDesc: 'Ultra-Fast Local Engine',
    valuePrivate: 'Privacy-Focused',
    valuePrivateDesc: 'Local Processing Where Supported',
    valueFree: 'Free Access',
    valueFreeDesc: 'Zero Sign-In Required',
    popularHeading: 'Popular Tools',
    popularSubheading: 'Start with the tools people use most.',
    exploreCategoryHeading: 'Explore by Category',
    exploreCategorySubheading: 'Find the right tool for your specific task.',
    whyHeading: 'Why Miftah Tools?',
    whySubheading: 'Fast, private and modern digital utilities for everyday workflows.',
    recentToolsHeading: 'Recent Tools',
    allToolsTab: 'All Tools (220+)',
    toolsCount: (count: number) => `${count} tools`,
    noToolsFound: 'No tools found matching your search.',
    resetFilters: 'Reset filters',
    viewAllDirectoryTitle: 'Explore All 220+ Tools',
    viewAllDirectoryDesc: 'Find the right tool for PDF, documents, images, text, conversion and more.',
    viewAllDirectoryBtn: 'Explore All Tools →',
    appBadge: 'OFFICIAL ANDROID APP',
    appHeading: 'Miftah Tools on Android',
    appSupporting: 'Take your favorite tools with you. Process documents and media anywhere with on-device speed.',
    appBullet1: 'Free to use with zero data limits',
    appBullet2: 'On-device privacy protection',
    appBullet3: 'Fast offline tools where supported',
    whyFeatures: [
      {
        icon: Lock,
        title: 'Privacy-Focused',
        desc: 'Where supported, files are processed directly in your browser without unnecessary remote server storage.',
      },
      {
        icon: Zap,
        title: 'Fast Performance',
        desc: 'Optimized client-side WebAssembly engines deliver instant processing with zero upload delays.',
      },
      {
        icon: CheckCircle2,
        title: 'Free Access',
        desc: 'Access useful tools without subscription barriers, hidden paywalls, or mandatory account logins.',
      },
      {
        icon: Layers,
        title: '220+ Tools in One Place',
        desc: 'A growing, organized collection for PDFs, images, documents, audio, coding, and calculations.',
      },
    ],
    categories: [
      { id: 'pdf', name: 'PDF & Documents', count: 38, icon: FileText },
      { id: 'image', name: 'Images', count: 24, icon: ImageIcon },
      { id: 'text', name: 'Text & Writing', count: 18, icon: Type },
      { id: 'compress', name: 'Converters', count: 22, icon: RefreshCw },
      { id: 'media', name: 'Utilities', count: 14, icon: Sliders },
      { id: 'security', name: 'Security & Privacy', count: 12, icon: ShieldCheck },
      { id: 'dev', name: 'Developer Tools', count: 26, icon: Terminal },
      { id: 'calculator', name: 'Other Tools', count: 16, icon: Calculator },
    ],
    popularTools: [
      { id: 'pdf-to-docx', name: 'PDF to Word (OCR)', desc: 'Convert PDF files into editable Word documents.', href: '/tools/pdf-to-docx', icon: FileText },
      { id: 'compress-pdf', name: 'Compress PDF', desc: 'Reduce PDF file size without losing visual quality.', href: '/tools/compress-pdf', icon: Minimize2 },
      { id: 'merge-pdf', name: 'Merge PDF', desc: 'Combine multiple PDF files into one clean document.', href: '/tools/merge-pdf', icon: Combine },
      { id: 'pdf-editor', name: 'PDF Editor Studio', desc: 'Edit text, annotate, draw and fill PDF forms.', href: '/pdf-editor', icon: FileCheck },
      { id: 'pdf-signer', name: 'Sign & Stamp PDF', desc: 'Add digital signatures, stamps and verification.', href: '/pdf-signer', icon: ShieldCheck },
      { id: 'text-to-pdf', name: 'Text to PDF Studio', desc: 'Create formatted documents and convert text to PDF.', href: '/tools/text-to-pdf', icon: FileText },
      { id: 'image-studio', name: 'Image Studio', desc: 'Resize, convert, crop and optimize images locally.', href: '/image-studio', icon: ImageIcon },
      { id: 'ocr', name: 'OCR Image to Text', desc: 'Extract editable text from scanned documents and images.', href: '/ocr', icon: ScanText },
    ],
  },
  ur: {
    heroEyebrow: 'مفتاح ٹولز',
    heroHeading1: '220+ ڈیجیٹل ٹولز۔',
    heroHeading2: 'ایک سادہ ورک اسپیس۔',
    heroSupporting: 'روزمرہ ڈیجیٹل کام کے لیے تیز رفتار، نجی اور جدید ٹولز کے ذریعے فائلیں تبدیل کریں، ترمیم کریں، کمپریس کریں اور بنائیں بغیر سرور اپلوڈ کے۔',
    exploreAllCta: 'تمام ٹولز دیکھیں ←',
    downloadAppCta: 'اینڈرائیڈ ایپ حاصل کریں',
    searchPlaceholder: '220+ ٹولز تلاش کریں (مثلاً پی ڈی ایف، امیج، او سی آر، کیو آر)...',
    valueTools: '220+ ٹولز',
    valueToolsDesc: 'مکمل کلائنٹ سائیڈ سوئیٹ',
    valueFast: 'تیز رفتار پروسیسنگ',
    valueFastDesc: 'انتہائی تیز لوکل انجن',
    valuePrivate: 'پرائیویسی پر مبنی',
    valuePrivateDesc: 'جہاں ممکن ہو لوکل پروسیسنگ',
    valueFree: 'مفت رسائی',
    valueFreeDesc: 'بغیر سائن ان مکمل استعمال',
    popularHeading: 'مقبول ٹولز',
    popularSubheading: 'سب سے زیادہ استعمال ہونے والے ٹولز سے آغاز کریں۔',
    exploreCategoryHeading: 'اقسام کے لحاظ سے دیکھیں',
    exploreCategorySubheading: 'اپنے مخصوص کام کے لیے درست ٹول تلاش کریں۔',
    whyHeading: 'مفتاح ٹولز کیوں؟',
    whySubheading: 'روزمرہ کے ورک فلو کے لیے تیز، نجی اور جدید ڈیجیٹل یوٹیلیٹیز۔',
    recentToolsHeading: 'حالیہ استعمال شدہ ٹولز',
    allToolsTab: 'تمام ٹولز (220+)',
    toolsCount: (count: number) => `${count} ٹولز`,
    noToolsFound: 'آپ کی تلاش کے مطابق کوئی ٹول نہیں ملا۔',
    resetFilters: 'فلٹرز ری سیٹ کریں',
    viewAllDirectoryTitle: 'تمام 220+ ٹولز دریافت کریں',
    viewAllDirectoryDesc: 'پی ڈی ایف، دستاویزات، تصاویر، ٹیکسٹ اور دیگر تمام ضروریات کے لیے بہترین ٹول تلاش کریں۔',
    viewAllDirectoryBtn: 'تمام ٹولز دیکھیں ←',
    appBadge: 'آفیشل اینڈرائیڈ ایپ',
    appHeading: 'اینڈرائیڈ پر مفتاح ٹولز',
    appSupporting: 'اپنے پسندیدہ ٹولز اپنے ساتھ رکھیں اور آن ڈیوائس رفتار کے ساتھ فائلیں پروسیس کریں۔',
    appBullet1: 'لامحدود اور 100% مفت استعمال',
    appBullet2: 'مکمل پرائیویٹ آن ڈیوائس پروسیسنگ',
    appBullet3: 'تیز رفتار آف لائن ٹولز کی سہولت',
    whyFeatures: [
      {
        icon: Lock,
        title: 'پرائیویسی پر مبنی',
        desc: 'جہاں ممکن ہو، فائلیں بیرونی سرور پر اپلوڈ کیے بغیر براہ راست آپ کے براؤزر میں پروسیس ہوتی ہیں۔',
      },
      {
        icon: Zap,
        title: 'تیز ترین رفتار',
        desc: 'جدید کلائنٹ سائیڈ انجن بغیر اپلوڈ کے انتظار کے فوری پروسیسنگ فراہم کرتا ہے۔',
      },
      {
        icon: CheckCircle2,
        title: 'مکمل مفت رسائی',
        desc: 'بغیر کسی رکنیت، پوشیدہ فیس یا لازمی لاگ ان کے تمام ضروری ٹولز استعمال کریں۔',
      },
      {
        icon: Layers,
        title: '220+ ٹولز ایک جگہ',
        desc: 'پی ڈی ایف، تصاویر، دستاویزات، آڈیو اور کوڈنگ کے لیے جامع اور منظم مجموعہ۔',
      },
    ],
    categories: [
      { id: 'pdf', name: 'پی ڈی ایف اور دستاویزات', count: 38, icon: FileText },
      { id: 'image', name: 'تصاویر', count: 24, icon: ImageIcon },
      { id: 'text', name: 'ٹیکسٹ و تحریر', count: 18, icon: Type },
      { id: 'compress', name: 'کنورٹرز', count: 22, icon: RefreshCw },
      { id: 'media', name: 'یوٹیلیٹیز', count: 14, icon: Sliders },
      { id: 'security', name: 'سیکیورٹی و پرائیویسی', count: 12, icon: ShieldCheck },
      { id: 'dev', name: 'ڈویلپر ٹولز', count: 26, icon: Terminal },
      { id: 'calculator', name: 'دیگر ٹولز', count: 16, icon: Calculator },
    ],
    popularTools: [
      { id: 'pdf-to-docx', name: 'پی ڈی ایف سے ورڈ (OCR)', desc: 'پی ڈی ایف کو قابل ترمیم ورڈ فائلوں میں تبدیل کریں۔', href: '/tools/pdf-to-docx', icon: FileText },
      { id: 'compress-pdf', name: 'کمپریس پی ڈی ایف', desc: 'معیار برقرار رکھتے ہوئے فائل سائز کم کریں۔', href: '/tools/compress-pdf', icon: Minimize2 },
      { id: 'merge-pdf', name: 'پی ڈی ایف یکجا کریں', desc: 'متعدد پی ڈی ایف فائلوں کو ایک فائل میں جوڑیں۔', href: '/tools/merge-pdf', icon: Combine },
      { id: 'pdf-editor', name: 'پی ڈی ایف ایڈیٹر اسٹوڈیو', desc: 'پی ڈی ایف پر لکھیں، ڈرا کریں اور فارم پُر کریں۔', href: '/pdf-editor', icon: FileCheck },
      { id: 'pdf-signer', name: 'سائن و مہر پی ڈی ایف', desc: 'ڈیجیٹل دستخط اور سرکاری مہریں لگائیں۔', href: '/pdf-signer', icon: ShieldCheck },
      { id: 'text-to-pdf', name: 'ٹیکسٹ ٹو پی ڈی ایف اسٹوڈیو', desc: 'دستاویزات ڈیزائن کریں اور ٹیکسٹ پی ڈی ایف میں تبدیل کریں۔', href: '/tools/text-to-pdf', icon: FileText },
      { id: 'image-studio', name: 'امیج اسٹوڈیو', desc: 'تصاویر کا سائز تبدیل کریں، کروپ کریں اور کنورٹ کریں۔', href: '/image-studio', icon: ImageIcon },
      { id: 'ocr', name: 'تصویر سے ٹیکسٹ (OCR)', desc: 'اسکین شدہ دستاویزات اور تصاویر سے ٹیکسٹ نکالیں۔', href: '/ocr', icon: ScanText },
    ],
  },
  ar: {
    heroEyebrow: 'مفتاح تولز',
    heroHeading1: '220+ أداة رقمية.',
    heroHeading2: 'في مساحة عمل واحدة.',
    heroSupporting: 'قم بتحويل المستندات، وتعديلها، وضغطها، وإنشائها باستخدام أدوات سريعة وآمنة ومصممة للعمل اليومي المتقن.',
    exploreAllCta: 'استكشف جميع الأدوات ←',
    downloadAppCta: 'تحميل تطبيق أندرويد',
    searchPlaceholder: 'ابحث في 220+ أداة (مثل تحويل PDF، ضغط، OCR، QR)...',
    valueTools: '220+ أداة',
    valueToolsDesc: 'مجموعة أدوات متكاملة',
    valueFast: 'معالجة فائقة السرعة',
    valueFastDesc: 'محرك محلي فوري',
    valuePrivate: 'خصوصية وأمان',
    valuePrivateDesc: 'معالجة محلية على جهازك',
    valueFree: 'وصول مجاني',
    valueFreeDesc: 'بدون تسجيل دخول أو قيود',
    popularHeading: 'الأدوات الأكثر استخداماً',
    popularSubheading: 'ابدأ بالأدوات الأكثر شيوعاً واستخداماً.',
    exploreCategoryHeading: 'استكشف حسب التصنيف',
    exploreCategorySubheading: 'اعثر على الأداة المناسبة لمهامك المحددة.',
    whyHeading: 'لماذا تختار مفتاح تولز؟',
    whySubheading: 'أدوات رقمية حديثة، سريعة، وآمنة لإنتاجيتك اليومية.',
    recentToolsHeading: 'الأدوات المستخدمة مؤخراً',
    allToolsTab: 'جميع الأدوات (220+)',
    toolsCount: (count: number) => `${count} أداة`,
    noToolsFound: 'لم يتم العثور على أي أداة مطابقة لبحثك.',
    resetFilters: 'إعادة ضبط التصفية',
    viewAllDirectoryTitle: 'استكشف جميع الأدوات 220+',
    viewAllDirectoryDesc: 'اعثر على الأداة المثالية لمعالجة PDF والمستندات والصور والنصوص والمزيد.',
    viewAllDirectoryBtn: 'استكشف جميع الأدوات ←',
    appBadge: 'تطبيق أندرويد الرسمي',
    appHeading: 'مفتاح تولز على أندرويد',
    appSupporting: 'احتفظ بأدواتك المفضلة معك في كل مكان مع سرعة المعالجة على جهازك.',
    appBullet1: 'مجاني بالكامل وبدون حدود للبيانات',
    appBullet2: 'حماية كاملة للخصوصية على جهازك',
    appBullet3: 'أدوات سريعة تعمل بدون اتصال بالإنترنت',
    whyFeatures: [
      {
        icon: Lock,
        title: 'خصوصية وأمان',
        desc: 'تتم معالجة الملفات مباشرة داخل متصفحك دون رفعها إلى خوادم خارجية حيثما أمكن.',
      },
      {
        icon: Zap,
        title: 'أداء فائق السرعة',
        desc: 'محركات WebAssembly المحلية توفر معالجة فورية دون الحاجة إلى انتظار الرفع والتنزيل.',
      },
      {
        icon: CheckCircle2,
        title: 'استخدام مجاني تماماً',
        desc: 'وصول مباشر إلى كافة الأدوات دون اشتراكات مدفوعة أو تسجيل دخول إجباري.',
      },
      {
        icon: Layers,
        title: '220+ أداة في مكان واحد',
        desc: 'مجموعة شاملة ومنظمة تغطي كافة احتياجات المستندات والصور والأكواد والوسائط.',
      },
    ],
    categories: [
      { id: 'pdf', name: 'PDF والمستندات', count: 38, icon: FileText },
      { id: 'image', name: 'الصور', count: 24, icon: ImageIcon },
      { id: 'text', name: 'النصوص والكتابة', count: 18, icon: Type },
      { id: 'compress', name: 'محولات الصيغ', count: 22, icon: RefreshCw },
      { id: 'media', name: 'الأدوات المساعدة', count: 14, icon: Sliders },
      { id: 'security', name: 'الأمان والخصوصية', count: 12, icon: ShieldCheck },
      { id: 'dev', name: 'أدوات المطورين', count: 26, icon: Terminal },
      { id: 'calculator', name: 'أدوات أخرى', count: 16, icon: Calculator },
    ],
    popularTools: [
      { id: 'pdf-to-docx', name: 'تحويل PDF إلى Word (OCR)', desc: 'تحويل مستندات PDF إلى ملفات Word قابلة للتعديل.', href: '/tools/pdf-to-docx', icon: FileText },
      { id: 'compress-pdf', name: 'ضغط ملفات PDF', desc: 'تقليل حجم ملفات PDF مع الحفاظ على وضوحها.', href: '/tools/compress-pdf', icon: Minimize2 },
      { id: 'merge-pdf', name: 'دمج وتجميع PDF', desc: 'دمج ملفات PDF متعددة في مستند واحد منظم.', href: '/tools/merge-pdf', icon: Combine },
      { id: 'pdf-editor', name: 'استوديو محرر PDF', desc: 'تعديل النصوص وإضافة التوقيعات وملء النماذج.', href: '/pdf-editor', icon: FileCheck },
      { id: 'pdf-signer', name: 'توقيع وختم PDF', desc: 'إضافة التوقيعات الرقمية والأختام الرسمية.', href: '/pdf-signer', icon: ShieldCheck },
      { id: 'text-to-pdf', name: 'استوديو النص إلى PDF', desc: 'إنشاء المستندات المنسقة وتحويل النصوص إلى PDF.', href: '/tools/text-to-pdf', icon: FileText },
      { id: 'image-studio', name: 'استوديو الصور', desc: 'تغيير الحجم، القص، وضغط الصور محلياً.', href: '/image-studio', icon: ImageIcon },
      { id: 'ocr', name: 'استخراج النصوص (OCR)', desc: 'استخراج النصوص من الصور والمستندات الممسوحة ضوئياً.', href: '/ocr', icon: ScanText },
    ],
  },
  hi: {
    heroEyebrow: 'मिफ़्ताह टूल्स',
    heroHeading1: '220+ डिजिटल टूल्स।',
    heroHeading2: 'एक सरल वर्कस्पेस।',
    heroSupporting: 'फ़ाइलें कन्वर्ट, एडिट, कंप्रेस और क्रिएट करें — रोज़मर्रा के डिजिटल काम के लिए तेज़ और 100% सुरक्षित टूल्स।',
    exploreAllCta: 'सभी टूल्स देखें →',
    downloadAppCta: 'एंड्रॉइड ऐप डाउनलोड करें',
    searchPlaceholder: '220+ टूल्स खोजें (उदा. PDF से Word, OCR, कंप्रेस, QR)...',
    valueTools: '220+ टूल्स',
    valueToolsDesc: 'संपूर्ण क्लाइंट-साइड सूट',
    valueFast: 'फास्ट प्रोसेसिंग',
    valueFastDesc: 'अल्ट्रा-फास्ट लोकल इंजन',
    valuePrivate: 'गोपनीयता-केंद्रित',
    valuePrivateDesc: 'जहां संभव हो डिवाइस पर प्रोसेस',
    valueFree: 'मुफ़्त एक्सेस',
    valueFreeDesc: 'बिना लॉगिन तुरंत उपयोग',
    popularHeading: 'लोकप्रिय टूल्स',
    popularSubheading: 'उन टूल्स से शुरू करें जिनका लोग सबसे अधिक उपयोग करते हैं।',
    exploreCategoryHeading: 'श्रेणी के अनुसार खोजें',
    exploreCategorySubheading: 'अपने काम के लिए सही टूल तुरंत प्राप्त करें।',
    whyHeading: 'मिफ़्ताह टूल्स क्यों?',
    whySubheading: 'रोज़मर्रा के काम के लिए तेज़, सुरक्षित और आधुनिक डिजिटल यूटिलिटीज।',
    recentToolsHeading: 'हाल ही में उपयोग किए गए टूल्स',
    allToolsTab: 'सभी टूल्स (220+)',
    toolsCount: (count: number) => `${count} टूल्स`,
    noToolsFound: 'आपकी खोज से मेल खाता कोई टूल नहीं मिला।',
    resetFilters: 'फ़िल्टर रीसेट करें',
    viewAllDirectoryTitle: 'सभी 220+ टूल्स एक्सप्लोर करें',
    viewAllDirectoryDesc: 'PDF, दस्तावेज़, चित्र, टेक्स्ट, कन्वर्शन और बहुत कुछ के लिए सही टूल खोजें।',
    viewAllDirectoryBtn: 'सभी टूल्स देखें →',
    appBadge: 'आधिकारिक एंड्रॉइड ऐप',
    appHeading: 'एंड्रॉइड पर मिफ़्ताह टूल्स',
    appSupporting: 'अपने पसंदीदा टूल्स अपने साथ रखें और ऑन-डिवाइस स्पीड के साथ फ़ाइलें प्रोसेस करें।',
    appBullet1: 'बिना किसी सीमा के 100% मुफ़्त',
    appBullet2: 'ऑन-डिवाइस पूर्ण गोपनीयता सुरक्षा',
    appBullet3: 'तेज़ गति वाले ऑफ़लाइन टूल्स',
    whyFeatures: [
      {
        icon: Lock,
        title: 'गोपनीयता-केंद्रित',
        desc: 'फ़ाइलें बिना बाहरी सर्वर पर भेजे सीधे आपके ब्राउज़र में सुरक्षित रूप से प्रोसेस की जाती हैं।',
      },
      {
        icon: Zap,
        title: 'तेज़ परफॉर्मेंस',
        desc: 'स्थानीय WebAssembly इंजन बिना किसी देरी के तुरंत प्रोसेसिंग सुनिश्चित करते हैं।',
      },
      {
        icon: CheckCircle2,
        title: '100% मुफ़्त एक्सेस',
        desc: 'बिना किसी सब्सक्रिप्शन या अनिवार्य लॉगिन के सभी टूल्स का मुफ़्त उपयोग करें।',
      },
      {
        icon: Layers,
        title: '220+ टूल्स एक ही स्थान पर',
        desc: 'PDF, इमेज, दस्तावेज़, ऑडियो और कोडिंग के लिए एक विस्तृत और व्यवस्थित टूलकिट।',
      },
    ],
    categories: [
      { id: 'pdf', name: 'PDF व दस्तावेज़', count: 38, icon: FileText },
      { id: 'image', name: 'इमेज', count: 24, icon: ImageIcon },
      { id: 'text', name: 'टेक्स्ट व लेखन', count: 18, icon: Type },
      { id: 'compress', name: 'कन्वर्टर्स', count: 22, icon: RefreshCw },
      { id: 'media', name: 'यूटिलिटीज', count: 14, icon: Sliders },
      { id: 'security', name: 'सुरक्षा व गोपनीयता', count: 12, icon: ShieldCheck },
      { id: 'dev', name: 'डेवलपर टूल्स', count: 26, icon: Terminal },
      { id: 'calculator', name: 'अन्य टूल्स', count: 16, icon: Calculator },
    ],
    popularTools: [
      { id: 'pdf-to-docx', name: 'PDF से Word (OCR)', desc: 'PDF दस्तावेज़ों को संपादन योग्य Word फ़ाइलों में बदलें।', href: '/tools/pdf-to-docx', icon: FileText },
      { id: 'compress-pdf', name: 'PDF कंप्रेस करें', desc: 'क्वालिटी खोए बिना PDF फ़ाइल का आकार घटाएं।', href: '/tools/compress-pdf', icon: Minimize2 },
      { id: 'merge-pdf', name: 'PDF मर्ज करें', desc: 'कई PDF फ़ाइलों को एक साफ दस्तावेज़ में जोड़ें।', href: '/tools/merge-pdf', icon: Combine },
      { id: 'pdf-editor', name: 'PDF एडिटर स्टूडियो', desc: 'टेक्स्ट जोड़ें, एनोटेट करें और फ़ॉर्म भरें।', href: '/pdf-editor', icon: FileCheck },
      { id: 'pdf-signer', name: 'हस्ताक्षर व स्टाम्प PDF', desc: 'डिजिटल हस्ताक्षर और मुहर लगाएं।', href: '/pdf-signer', icon: ShieldCheck },
      { id: 'text-to-pdf', name: 'टेक्स्ट टू PDF स्टूडियो', desc: 'दस्तावेज़ बनाएं और टेक्स्ट को PDF में बदलें।', href: '/tools/text-to-pdf', icon: FileText },
      { id: 'image-studio', name: 'इमेज स्टूडियो', desc: 'इमेज का आकार बदलें, क्रॉप करें और कन्वर्ट करें।', href: '/image-studio', icon: ImageIcon },
      { id: 'ocr', name: 'फोटो से टेक्स्ट (OCR)', desc: 'स्कैन किए गए दस्तावेज़ों से संपादन योग्य टेक्स्ट निकालें।', href: '/ocr', icon: ScanText },
    ],
  },
};

export default function HomePage() {
  const { language, isRTL } = useI18n();
  const { recentTools: storeRecentTools } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const loc = PAGE_LOCALES[language] || PAGE_LOCALES.en;

  // Recent tools logic: only show if user has actual history items
  const recentTools = useMemo(() => {
    if (!storeRecentTools || storeRecentTools.length === 0) return [];
    const recentIds = storeRecentTools.slice(0, 5).map((h) => h.toolId);
    return TOOLS_LIST.filter((t) => recentIds.includes(t.id) || recentIds.includes(t.slug)).slice(0, 5);
  }, [storeRecentTools]);

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return TOOLS_LIST.filter((tool) => {
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      if (!matchesCategory) return false;

      if (!query) return true;

      const localized = getLocalizedTool(tool, language);
      const name = (localized?.name || tool.name).toLowerCase();
      const desc = (localized?.shortDesc || tool.shortDesc || tool.fullDesc || '').toLowerCase();
      const tags = (tool.tags || []).join(' ').toLowerCase();

      return name.includes(query) || desc.includes(query) || tags.includes(query) || tool.id.includes(query);
    });
  }, [searchQuery, activeCategory, language]);

  return (
    <div className="w-full bg-[#FAFBFC] dark:bg-[#121820] text-[#182230] dark:text-slate-100 min-h-screen transition-colors">
      
      {/* ==================================================
          1. HERO SECTION (WEBSITE HERO COMPOSITION)
          ================================================== */}
      <section className="relative overflow-hidden bg-white dark:bg-[#0c1017] border-b border-[#E1E7EC] dark:border-slate-800/80 pt-10 pb-12 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
        
        {/* Subtle geometric pattern background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#0B79B7_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B79B7]/10 dark:bg-[#0B79B7]/20 border border-[#0B79B7]/20 text-[#0B79B7] dark:text-[#38a8f8] text-[11px] sm:text-xs font-bold uppercase tracking-widest select-none">
            <span>{loc.heroEyebrow}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#182230] dark:text-white tracking-tight leading-[1.15] max-w-3xl mx-auto">
            <span>{loc.heroHeading1}</span>
            <span className="block text-[#0B79B7] dark:text-[#38a8f8] mt-1">{loc.heroHeading2}</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base md:text-lg text-[#687587] dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {loc.heroSupporting}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/tools"
              onClick={() => triggerHaptic('selection')}
              className="h-12 px-6 rounded-xl bg-[#0B79B7] hover:bg-[#075B8C] text-white font-bold text-sm shadow-md shadow-[#0B79B7]/20 active:scale-95 transition-all inline-flex items-center gap-2 select-none cursor-pointer"
            >
              <span>{loc.exploreAllCta}</span>
            </Link>

            <a
              href="#android-app"
              onClick={() => triggerHaptic('selection')}
              className="h-12 px-5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0B79B7] dark:text-[#38a8f8] border border-[#0B79B7]/40 dark:border-slate-700 font-bold text-sm shadow-xs active:scale-95 transition-all inline-flex items-center gap-2 select-none cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>{loc.downloadAppCta}</span>
            </a>
          </div>

          {/* Real-time Global Search Input */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative flex items-center shadow-sm rounded-2xl bg-[#F5F7F9] dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 focus-within:border-[#0B79B7] dark:focus-within:border-[#0B79B7] focus-within:bg-white transition-all">
              <Search className="w-5 h-5 text-[#0B79B7] dark:text-[#38a8f8] absolute left-4 rtl:left-auto rtl:right-4 pointer-events-none shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={loc.searchPlaceholder}
                className="w-full py-3.5 pl-12 pr-12 rtl:pl-12 rtl:pr-12 bg-transparent text-xs sm:text-sm text-[#182230] dark:text-white placeholder:text-[#687587] focus:outline-none rounded-2xl font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 rtl:right-auto rtl:left-4 p-1 rounded-lg text-[#687587] hover:text-[#182230] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================
          2. TRUST / VALUE STRIP (COMPACT 2x2 ON MOBILE, 4 IN A ROW ON DESKTOP)
          ================================================== */}
      <section className="border-b border-[#E1E7EC] dark:border-slate-800 bg-[#F5F7F9] dark:bg-[#0e141c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            
            {/* Value 1: 220+ Tools */}
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC]/80 dark:border-slate-800 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#182230] dark:text-white truncate">{loc.valueTools}</p>
                <p className="text-[10px] text-[#687587] dark:text-slate-400 truncate">{loc.valueToolsDesc}</p>
              </div>
            </div>

            {/* Value 2: Fast Processing */}
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC]/80 dark:border-slate-800 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#182230] dark:text-white truncate">{loc.valueFast}</p>
                <p className="text-[10px] text-[#687587] dark:text-slate-400 truncate">{loc.valueFastDesc}</p>
              </div>
            </div>

            {/* Value 3: Privacy-Focused */}
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC]/80 dark:border-slate-800 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#182230] dark:text-white truncate">{loc.valuePrivate}</p>
                <p className="text-[10px] text-[#687587] dark:text-slate-400 truncate">{loc.valuePrivateDesc}</p>
              </div>
            </div>

            {/* Value 4: Free Access */}
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC]/80 dark:border-slate-800 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#182230] dark:text-white truncate">{loc.valueFree}</p>
                <p className="text-[10px] text-[#687587] dark:text-slate-400 truncate">{loc.valueFreeDesc}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          3. RECENT TOOLS (ONLY IF USER HAS ACTUAL HISTORY)
          ================================================== */}
      {recentTools.length > 0 && !searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#182230] dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-[#0B79B7] dark:text-[#38a8f8]" />
                <span>{loc.recentToolsHeading}</span>
              </h2>
              <Link href="/history" className="text-[11px] font-bold text-[#0B79B7] dark:text-[#38a8f8] hover:underline">
                View All →
              </Link>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {recentTools.map((tool) => {
                const localized = getLocalizedTool(tool, language);
                return (
                  <Link
                    key={`recent-${tool.id}`}
                    href={`/tools/${tool.slug || tool.id}`}
                    className="px-3 py-1.5 rounded-xl bg-[#F5F7F9] dark:bg-slate-800 hover:bg-[#0B79B7]/10 text-xs font-bold text-[#182230] dark:text-slate-200 border border-[#E1E7EC] dark:border-slate-700 whitespace-nowrap transition-colors shrink-0"
                  >
                    {localized.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          4. POPULAR TOOLS SECTION (8 FLAGSHIP TOOLS, 4 COLS DESKTOP, 2 COLS MOBILE)
          ================================================== */}
      {!searchQuery && activeCategory === 'all' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#182230] dark:text-white tracking-tight">
                {loc.popularHeading}
              </h2>
              <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-400 mt-0.5">
                {loc.popularSubheading}
              </p>
            </div>
            <Link
              href="/tools"
              className="text-xs font-bold text-[#0B79B7] dark:text-[#38a8f8] hover:underline inline-flex items-center gap-1 self-start sm:self-auto pt-1"
            >
              <span>{loc.exploreAllCta}</span>
            </Link>
          </div>

          {/* 8 Flagship Tools Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {loc.popularTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  onClick={() => triggerHaptic('selection')}
                  className="group relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 hover:border-[#0B79B7]/50 dark:hover:border-[#0B79B7]/50 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between active:scale-[0.98] select-none"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-[#182230] dark:text-white group-hover:text-[#0B79B7] dark:group-hover:text-[#38a8f8] transition-colors line-clamp-1">
                        {tool.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#687587] dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E1E7EC]/60 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#0B79B7] dark:text-[#38a8f8]">
                    <span className="text-[10px] text-[#687587] font-normal uppercase">Free • In-Browser</span>
                    <span className={`transform transition-transform ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}>
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================================================
          5. CATEGORY NAVIGATION ("Explore by Category")
          ================================================== */}
      {!searchQuery && activeCategory === 'all' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#182230] dark:text-white tracking-tight">
              {loc.exploreCategoryHeading}
            </h2>
            <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-400 mt-0.5">
              {loc.exploreCategorySubheading}
            </p>
          </div>

          {/* 8 Category Cards with Real Tool Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {loc.categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setActiveCategory(cat.id);
                  }}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 hover:border-[#0B79B7]/50 dark:hover:border-[#0B79B7]/50 shadow-xs hover:shadow-sm transition-all flex items-center gap-3 text-left rtl:text-right group cursor-pointer active:scale-95 select-none"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5F7F9] dark:bg-slate-800 text-[#0B79B7] dark:text-[#38a8f8] flex items-center justify-center shrink-0 group-hover:bg-[#0B79B7] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-[#182230] dark:text-white truncate group-hover:text-[#0B79B7] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-[#687587] dark:text-slate-400 font-semibold mt-0.5">
                      {cat.count} Tools →
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================================================
          6. SEARCH RESULTS OR FILTERED DIRECTORY
          ================================================== */}
      {(searchQuery || activeCategory !== 'all') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-[#182230] dark:text-white uppercase tracking-wide">
                {searchQuery
                  ? 'Search Results'
                  : `${getLocalizedCategory(activeCategory, language)} Tools`}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px] font-bold text-[#182230] dark:text-slate-300">
                {loc.toolsCount(filteredTools.length)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-[#0B79B7] dark:text-[#38a8f8] hover:underline cursor-pointer"
            >
              {loc.resetFilters}
            </button>
          </div>

          {filteredTools.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-[#E1E7EC] dark:border-slate-800 p-8 space-y-3 shadow-xs">
              <Search className="w-8 h-8 text-[#687587] mx-auto" />
              <p className="text-sm font-bold text-[#687587]">{loc.noToolsFound}</p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#0B79B7] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#075B8C] transition-colors cursor-pointer"
              >
                {loc.resetFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ==================================================
          7. WHY MIFTAH TOOLS? (TRUST & VALUE PROPOSITION)
          ================================================== */}
      {!searchQuery && activeCategory === 'all' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#182230] dark:text-white tracking-tight">
              {loc.whyHeading}
            </h2>
            <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-400">
              {loc.whySubheading}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loc.whyFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#182230] dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[#687587] dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================================================
          8. ANDROID APP PROMOTION SECTION
          ================================================== */}
      <section id="android-app" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Text and Features */}
          <div className="space-y-4 max-w-xl text-left rtl:text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] text-[10px] font-extrabold uppercase tracking-wider">
              {loc.appBadge}
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-[#182230] dark:text-white tracking-tight">
              {loc.appHeading}
            </h2>

            <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-400 leading-relaxed">
              {loc.appSupporting}
            </p>

            <ul className="space-y-2 text-xs font-semibold text-[#182230] dark:text-slate-200">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{loc.appBullet1}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{loc.appBullet2}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{loc.appBullet3}</span>
              </li>
            </ul>
          </div>

          {/* Right Google Play Button Card */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=com.miftahtools.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700/80 transition-all shadow-md active:scale-95 group select-none"
              aria-label="Get Miftah Tools on Google Play"
            >
              <svg className="w-7 h-7 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 512 512">
                <path fill="#00D3FF" d="M30.4 17.8c-7.7 8.2-12.4 20.3-12.4 35.5v405.4c0 15.2 4.7 27.3 12.4 35.5l2.4 2.2 231-231v-5.8L32.8 15.6l-2.4 2.2z" />
                <path fill="#FF3A44" d="M340.5 341.2l-76.7-76.7v-5.8l76.7-76.7 1.8 1 90.7 51.5c25.9 14.7 25.9 38.8 0 53.6l-90.7 51.5-1.8 1.6z" />
                <path fill="#00E676" d="M342.3 342.8L263.8 264 32.8 495.2c8.5 9 22.7 10.1 38.6 1.1l270.9-153.5z" />
                <path fill="#FFD400" d="M342.3 169.2L71.4 15.7C55.5 6.7 41.3 7.8 32.8 16.8L263.8 248l78.5-78.8z" />
              </svg>
              <div className="text-left rtl:text-right">
                <div className="text-[9px] uppercase tracking-wider text-slate-300 font-bold leading-none">GET IT ON</div>
                <div className="text-base font-black tracking-tight text-white leading-none mt-1">Google Play</div>
              </div>
            </a>
            <p className="text-[11px] text-[#687587] text-center font-medium">100% Free • Official App</p>
          </div>

        </div>
      </section>

      {/* ==================================================
          9. ALL TOOLS DIRECTORY CTA BANNER
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0B79B7] to-[#075B8C] text-white shadow-lg space-y-4 text-center sm:text-left rtl:sm:text-right flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
              220+ Digital Tools
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white">
              {loc.viewAllDirectoryTitle}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              {loc.viewAllDirectoryDesc}
            </p>
          </div>

          <Link
            href="/tools"
            className="h-12 px-6 rounded-xl bg-white hover:bg-slate-50 text-[#0B79B7] font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all inline-flex items-center gap-2 shrink-0 select-none cursor-pointer"
          >
            <span>{loc.viewAllDirectoryBtn}</span>
          </Link>
        </div>
      </section>

      {/* Subtle Bottom Ad Placement */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <AdSlot placement="in-feed" />
      </section>

    </div>
  );
}
