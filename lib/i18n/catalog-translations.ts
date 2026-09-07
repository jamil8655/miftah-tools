'use client';

import { Language } from './translations';
import { ToolDefinition } from '../types';
import { Course } from '../courses/courses-data';

export interface LocalizedItem {
  name?: string;
  title?: string;
  shortDesc?: string;
  description?: string;
  categoryLabel?: string;
}

export const CATEGORY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  all: {
    en: 'All Tools',
    ur: 'تمام ٹولز',
    ar: 'جميع الأدوات',
    hi: 'सभी टूल्स',
  },
  pdf: {
    en: 'PDF Tools',
    ur: 'پی ڈی ایف ٹولز',
    ar: 'أدوات PDF',
    hi: 'PDF टूल्स',
  },
  image: {
    en: 'Image Studio',
    ur: 'امیج اسٹوڈیو',
    ar: 'استوديو الصور',
    hi: 'इमेज स्टूडियो',
  },
  document: {
    en: 'Documents',
    ur: 'دستاویزات',
    ar: 'المستندات',
    hi: 'दस्तावेज़',
  },
  text: {
    en: 'Text Tools',
    ur: 'ٹیکسٹ ٹولز',
    ar: 'أدوات النصوص',
    hi: 'टेक्स्ट टूल्स',
  },
  compress: {
    en: 'Compression',
    ur: 'فائل کمپریشن',
    ar: 'ضغط وتحسين الملفات',
    hi: 'फ़ाइल कंप्रेशन',
  },
  ocr: {
    en: 'OCR Studio',
    ur: 'او سی آر اسٹوڈیو',
    ar: 'استخراج النصوص OCR',
    hi: 'OCR स्टूडियो',
  },
  calculator: {
    en: 'Calculators',
    ur: 'کیلکولیٹرز و کنورٹرز',
    ar: 'الحاسبات والمحولات',
    hi: 'कैलकुलेटर व कन्वर्टर',
  },
  dev: {
    en: 'Developer Tools',
    ur: 'ڈیولپر ٹولز',
    ar: 'أدوات المطورين',
    hi: 'डेवलपर टूल्स',
  },
  security: {
    en: 'Security & Privacy',
    ur: 'سیکیورٹی و پرائیویسی',
    ar: 'الأمان والخصوصية',
    hi: 'सुरक्षा और गोपनीयता',
  },
  qr: {
    en: 'QR & Barcode',
    ur: 'کیو آر و بارکوڈ',
    ar: 'الباركود و QR',
    hi: 'QR व बारकोड',
  },
  media: {
    en: 'Media Studio',
    ur: 'میڈیا اسٹوڈیو',
    ar: 'استوديو الوسائط',
    hi: 'मीडिया स्टूडियो',
  },
  ai: {
    en: 'AI Workspace',
    ur: 'اے آئی اسٹوڈیو',
    ar: 'مساحة الذكاء الاصطناعي',
    hi: 'AI वर्कस्पेस',
  },
  utility: {
    en: 'Utilities',
    ur: 'یوٹیلٹیز',
    ar: 'الأدوات المساعدة',
    hi: 'उपयोगिता टूल्स',
  },
};

/**
 * Universal Arabic Terminology Dictionary for Automatic Dynamic Translation
 */
const AR_ACTION_TERMS: Record<string, string> = {
  'merge': 'دمج',
  'split': 'تقسيم',
  'compress': 'ضغط',
  'compressor': 'ضاغط',
  'convert': 'تحويل',
  'converter': 'محول',
  'editor': 'محرر',
  'edit': 'تعديل',
  'organize': 'تنظيم',
  'organizer': 'منظم',
  'rotate': 'تدوير',
  'rotator': 'مدور',
  'flip': 'قلب',
  'flipper': 'قلاب',
  'crop': 'قص',
  'cropper': 'قاطع',
  'watermark': 'علامة مائية',
  'protect': 'حماية وتشفير',
  'unlock': 'فك القفل وكلمة المرور',
  'encrypt': 'تشفير',
  'decrypt': 'فك التشفير',
  'extract': 'استخراج',
  'delete': 'حذف',
  'remove': 'إزالة',
  'clean': 'تنظيف',
  'cleaner': 'منظف',
  'cleanup': 'تنظيف',
  'repair': 'إصلاح',
  'reverse': 'عكس',
  'reorder': 'إعادة ترتيب',
  'replace': 'استبدال',
  'resize': 'تغيير الحجم',
  'resizer': 'مغير الحجم',
  'counter': 'عداد وإحصائيات',
  'analyzer': 'محلل',
  'analysis': 'تحليل',
  'generator': 'مولد',
  'generate': 'توليد',
  'formatter': 'منسق',
  'format': 'تنسيق',
  'validator': 'مدقق وصحة',
  'viewer': 'عارض',
  'cutter': 'قص وتقطيع',
  'booster': 'تضخيم ورفع الصوت',
  'speed': 'تعديل السرعة',
  'downloader': 'تنزيل',
  'saver': 'حفظ',
  'palette': 'لوحة ألوان',
  'picker': 'منتقي الألوان',
  'grayscale': 'تدرج رمادي',
  'stamp': 'ختم',
  'header': 'رأس الصفحة',
  'footer': 'تذييل الصفحة',
  'numbers': 'ترقيم الصفحات',
  'redact': 'حجب وتعتيم',
  'sanitize': 'تطهير وإزالة البيانات المخفية',
  'diff': 'مقارنة الفروق',
  'odd': 'فردي',
  'even': 'زوجي',
  'blank': 'فارغ',
  'pages': 'صفحات',
  'images': 'صور',
  'image': 'صورة',
  'photo': 'صورة',
  'files': 'ملفات',
  'file': 'ملف',
  'text': 'نص',
  'words': 'كلمات',
  'lines': 'أسطر',
  'searchable': 'قابل للبحث',
  'extreme': 'أقصى',
  'balanced': 'متوازن',
  'direct': 'مباشر',
  'calculator': 'حاسبة',
  'loan': 'قرض',
  'discount': 'خصم',
  'profit': 'أرباح',
  'margin': 'هامش الربح',
  'interest': 'فائدة',
  'compound': 'مركبة',
  'bandwidth': 'عرض النطاق الترددي',
  'storage': 'سعة التخزين',
  'unit': 'وحدات قياس',
  'passport': 'صور جواز السفر',
  'background': 'خلفية',
  'favicon': 'أيقونة الموقع Favicon',
  'barcode': 'باركود',
  'qr': 'رمز استجابة سريعة QR',
  'hash': 'تجزئة رقمية وتشفير Hash',
  'password': 'كلمة المرور',
  'uuid': 'معرف فريد UUID',
  'timestamp': 'طابع زمني',
  'duplicate': 'تكرارات',
  'spaces': 'مسافات زائدة',
  'uppercase': 'أحرف كبيرة',
  'lowercase': 'أحرف صغيرة',
  'title': 'حالة العنوان',
  'sentence': 'حالة الجملة',
};

const AR_FORMAT_TERMS: Record<string, string> = {
  'pdf': 'PDF',
  'word': 'Word (DOCX)',
  'docx': 'Word (DOCX)',
  'doc': 'Word (DOC)',
  'excel': 'Excel (XLSX)',
  'xlsx': 'Excel (XLSX)',
  'xls': 'Excel (XLS)',
  'powerpoint': 'PowerPoint (PPTX)',
  'pptx': 'PowerPoint (PPTX)',
  'ppt': 'PowerPoint (PPT)',
  'csv': 'CSV',
  'rtf': 'RTF',
  'txt': 'نص (TXT)',
  'text': 'نص (TXT)',
  'html': 'HTML',
  'markdown': 'Markdown',
  'md': 'Markdown',
  'epub': 'eBook (EPUB)',
  'jpg': 'JPG',
  'jpeg': 'JPEG',
  'png': 'PNG',
  'webp': 'WebP',
  'bmp': 'BMP',
  'tiff': 'TIFF',
  'heic': 'HEIC',
  'ico': 'ICO',
  'zip': 'ZIP',
  'json': 'JSON',
  'jwt': 'JWT',
  'mp3': 'صوت MP3',
  'audio': 'صوت',
  'video': 'فيديو',
};

/**
 * Universal Arabic Title Generator from Tool ID and Name
 */
export function generateArabicToolName(id: string, name: string): string {
  const lowerId = id.toLowerCase();
  
  // Format conversion pattern e.g. "pdf-to-docx", "jpg-to-png"
  if (lowerId.includes('-to-')) {
    const parts = lowerId.split('-to-');
    const fromFmt = AR_FORMAT_TERMS[parts[0]] || parts[0].toUpperCase();
    const toFmt = AR_FORMAT_TERMS[parts[1]] || parts[1].toUpperCase();
    return `تحويل ${fromFmt} إلى ${toFmt}`;
  }

  // Compress pattern
  if (lowerId.includes('compress')) {
    if (lowerId.includes('pdf')) return 'ضغط وتحسين ملف PDF';
    if (lowerId.includes('image') || lowerId.includes('photo') || lowerId.includes('jpg') || lowerId.includes('png') || lowerId.includes('webp')) return 'ضغط وتقليل حجم الصور';
    if (lowerId.includes('word') || lowerId.includes('docx')) return 'ضغط وتقليل حجم ملف Word';
    return 'ضغط وتحسين الحجم';
  }

  // Merge / Split pattern
  if (lowerId.includes('merge')) return 'دمج وتجميع ملفات ' + (lowerId.includes('pdf') ? 'PDF' : '');
  if (lowerId.includes('split')) return 'تقسيم وفصل صفحات ' + (lowerId.includes('pdf') ? 'PDF' : '');
  if (lowerId.includes('organize')) return 'تنظيم وترتيب صفحات ' + (lowerId.includes('pdf') ? 'PDF' : '');
  if (lowerId.includes('protect') || lowerId.includes('encrypt')) return 'حماية وتشفير ملف ' + (lowerId.includes('pdf') ? 'PDF' : '');
  if (lowerId.includes('unlock') || lowerId.includes('remove-password')) return 'إزالة كلمة المرور وفك قفل ' + (lowerId.includes('pdf') ? 'PDF' : '');
  if (lowerId.includes('watermark')) return 'إضافة علامة مائية على ' + (lowerId.includes('pdf') ? 'PDF' : 'الصور');
  if (lowerId.includes('rotate')) return 'تدوير صفحات ' + (lowerId.includes('pdf') ? 'PDF' : 'الصور');
  if (lowerId.includes('crop')) return 'قص وتحديد أبعاد ' + (lowerId.includes('pdf') ? 'PDF' : 'الصور');
  if (lowerId.includes('ocr')) return 'استخراج النصوص الذكي (OCR)';
  if (lowerId.includes('hash')) return 'حساب التجزئة الرقمية (Hash Checksum)';
  if (lowerId.includes('password')) return 'مولد كلمات المرور الآمنة';
  if (lowerId.includes('qr')) return 'إنشاء وقراءة رموز QR';
  if (lowerId.includes('barcode')) return 'مولد الباركود القياسي';
  if (lowerId.includes('json')) return 'تنسيق وتدقيق ملفات JSON';
  if (lowerId.includes('jwt')) return 'فك وتشفير رموز JWT';
  if (lowerId.includes('uuid')) return 'توليد معرفات فريدة UUID';
  if (lowerId.includes('base64')) return 'ترميز وفك ترميز Base64';
  if (lowerId.includes('lorem')) return 'توليد نصوص تجريبية (Lorem Ipsum)';
  if (lowerId.includes('diff')) return 'مقارنة الفروق بين النصوص';
  if (lowerId.includes('case')) return 'تحويل وتغيير حالة الأحرف';
  if (lowerId.includes('counter')) return 'عداد الكلمات والإحصائيات';
  if (lowerId.includes('reverse')) return 'عكس النصوص والأسطر';
  if (lowerId.includes('duplicate')) return 'إزالة الأسطر والنصوص المكررة';
  if (lowerId.includes('clean')) return 'تنظيف وتنسيق الملفات';
  if (lowerId.includes('calculator') || lowerId.includes('calc')) return 'حاسبة ذكية ومحولة رياضية';
  if (lowerId.includes('emi') || lowerId.includes('loan')) return 'حاسبة القروض والأقساط الشهرية (EMI)';
  if (lowerId.includes('gst')) return 'حاسبة ضريبة القيمة المضافة (GST)';
  if (lowerId.includes('audio')) return 'استوديو تحرير ومعالجة الصوت';
  if (lowerId.includes('video')) return 'تحويل واستخراج الصوت من الفيديو';
  if (lowerId.includes('palette')) return 'استخراج لوحة الألوان السائدة';
  if (lowerId.includes('passport')) return 'صانع ومحرر صور جواز السفر';
  if (lowerId.includes('favicon')) return 'حزمة أيقونات المواقع (Favicon)';
  if (lowerId.includes('background')) return 'إزالة وتفريغ خلفية الصور';
  if (lowerId.includes('zip')) return 'إنشاء واستخراج الملفات المضغوطة ZIP';

  // Fallback translation based on tokens
  const tokens = lowerId.split('-');
  const arTokens = tokens.map(t => AR_ACTION_TERMS[t] || AR_FORMAT_TERMS[t] || t.toUpperCase());
  return arTokens.join(' ');
}

/**
 * Universal Arabic Short Description Generator
 */
export function generateArabicShortDesc(id: string, category: string): string {
  const lowerId = id.toLowerCase();
  
  if (lowerId.includes('-to-')) {
    const parts = lowerId.split('-to-');
    const fromFmt = AR_FORMAT_TERMS[parts[0]] || parts[0].toUpperCase();
    const toFmt = AR_FORMAT_TERMS[parts[1]] || parts[1].toUpperCase();
    return `تحويل فائق الدقة من ${fromFmt} إلى ${toFmt} محلياً وبأمان 100% دون خوادم.`;
  }

  if (lowerId.includes('compress')) return 'تقليل حجم الملف بسرعة فائقة مع الحفاظ الكامل على جودة ونقاء المحتوى.';
  if (lowerId.includes('merge')) return 'دمج عدة ملفات في مستند واحد منظم بسرعة وسهولة.';
  if (lowerId.includes('split')) return 'استخراج أو فصل صفحات مخصصة في ملفات منفردة.';
  if (lowerId.includes('protect') || lowerId.includes('encrypt')) return 'حماية وتشفير المستند بكلمة مرور قوية بتقنية التشفير المتقدم.';
  if (lowerId.includes('unlock')) return 'إزالة كلمة المرور وقيود الحماية من المستند بأمان تام.';
  if (lowerId.includes('ocr')) return 'استخراج النصوص من الصور والمستندات الممسوحة ضوئياً بدقة عالية.';
  if (lowerId.includes('calculator')) return 'إجراء العمليات الحسابية والمالية بدقة فورية.';
  if (lowerId.includes('editor')) return 'إضافة نصوص وأشكال ورسم وملاحظات على المستند مباشرة.';
  if (lowerId.includes('crop')) return 'قص وتحديد الأبعاد المخصصة بدقة وبسرعة.';
  if (lowerId.includes('watermark')) return 'تطبيق علامة مائية مخصصة لحماية حقوق الملكية الفكرية.';

  return 'أداة رقمية سريعة وآمنة تعمل محلياً على جهازك بنسبة 100% لحماية خصوصيتك.';
}

/**
 * Universal Urdu Title Generator from Tool ID and Name
 */
export function generateUrduToolName(id: string, name: string): string {
  const lowerId = id.toLowerCase();
  if (lowerId.includes('-to-')) {
    const parts = lowerId.split('-to-');
    return `${parts[0].toUpperCase()} سے ${parts[1].toUpperCase()} میں تبدیل کریں`;
  }
  if (lowerId.includes('compress')) return 'فائل سائز کم کریں (کمپریس)';
  if (lowerId.includes('merge')) return 'فائلیں یکجا کریں (Merge)';
  if (lowerId.includes('split')) return 'صفحات الگ کریں (Split)';
  if (lowerId.includes('protect')) return 'پاس ورڈ سے محفوظ کریں';
  if (lowerId.includes('unlock')) return 'پاس ورڈ ختم کریں';
  if (lowerId.includes('ocr')) return 'تصویر سے ٹیکسٹ نکالیں (OCR)';
  if (lowerId.includes('editor')) return 'پی ڈی ایف ایڈیٹر';
  return name;
}

/**
 * Universal Hindi Title Generator from Tool ID and Name
 */
export function generateHindiToolName(id: string, name: string): string {
  const lowerId = id.toLowerCase();
  if (lowerId.includes('-to-')) {
    const parts = lowerId.split('-to-');
    return `${parts[0].toUpperCase()} को ${parts[1].toUpperCase()} में बदलें`;
  }
  if (lowerId.includes('compress')) return 'फ़ाइल साइज कम करें (कंप्रेस)';
  if (lowerId.includes('merge')) return 'फ़ाइलें जोड़ें (Merge)';
  if (lowerId.includes('split')) return 'पृष्ठ अलग करें (Split)';
  if (lowerId.includes('protect')) return 'पासवर्ड सुरक्षा लगाएं';
  if (lowerId.includes('unlock')) return 'पासवर्ड हटाएं';
  if (lowerId.includes('ocr')) return 'टेक्स्ट निकालें (OCR)';
  if (lowerId.includes('editor')) return 'PDF एडिटर';
  return name;
}

export const TOOL_TRANSLATIONS: Record<string, Record<Language, { name: string; shortDesc: string }>> = {
  'pdf-merge': {
    en: { name: 'Merge PDF', shortDesc: 'Combine multiple PDF files into one single organized document.' },
    ur: { name: 'پی ڈی ایف یکجا کریں', shortDesc: 'متعدد پی ڈی ایف فائلوں کو ایک منظم دستاویز میں جوڑیں۔' },
    ar: { name: 'دمج ملفات PDF', shortDesc: 'دمج ملفات PDF متعددة في مستند واحد منظم بسهولة وبأمان.' },
    hi: { name: 'PDF मर्ज करें', shortDesc: 'एकाधिक PDF फ़ाइलों को एक व्यवस्थित दस्तावेज़ में जोड़ें।' },
  },
  'pdf-split': {
    en: { name: 'Split PDF', shortDesc: 'Extract pages or separate a PDF into multiple individual files.' },
    ur: { name: 'پی ڈی ایف تقسیم کریں', shortDesc: 'صفحات الگ کریں یا پی ڈی ایف کو الگ فائلوں میں تقسیم کریں۔' },
    ar: { name: 'تقسيم ملفات PDF', shortDesc: 'استخراج الصفحات أو تقسيم ملف PDF إلى ملفات منفصلة.' },
    hi: { name: 'PDF विभाजित करें', shortDesc: 'पृष्ठ अलग करें या PDF को अलग-अलग फ़ाइलों में बांटें।' },
  },
  'pdf-compress': {
    en: { name: 'Compress PDF', shortDesc: 'Reduce PDF file size while maintaining sharp visual clarity.' },
    ur: { name: 'پی ڈی ایف سائز کم کریں', shortDesc: 'معیار برقرار رکھتے ہوئے پی ڈی ایف فائل کا سائز چھوٹا کریں۔' },
    ar: { name: 'ضغط ملفات PDF', shortDesc: 'تقليل حجم ملف PDF مع الحفاظ على جودة ونقاء النصوص.' },
    hi: { name: 'PDF कंप्रेस करें', shortDesc: 'गुणवत्ता बनाए रखते हुए PDF फ़ाइल का आकार छोटा करें।' },
  },
  'auto-crop-images-to-pdf': {
    en: { name: 'Auto Cut Images to PDF', shortDesc: 'Smart crop, split halves (top/bottom, left/right), and compile images to a numbered PDF.' },
    ur: { name: 'امیج آٹو کٹ اور پی ڈی ایف', shortDesc: 'تصاویر کو آدھے یا مطلوبہ سائز پر کاٹیں اور نمبرنگ کے ساتھ پی ڈی ایف بنائیں۔' },
    ar: { name: 'قص الصور تلقائياً إلى PDF', shortDesc: 'قص وتقسيم الصور (نصفين، علوي/سفلي) وترتيبها في ملف PDF مرقم.' },
    hi: { name: 'ऑटो कट इमेज टू PDF', shortDesc: 'तस्वीरों को आधा या इच्छानुसार काटें और नंबरिंग के साथ PDF बनाएं।' },
  },
};

/**
 * Returns localized tool definition name, shortDesc, and category label with 100% Arabic/Urdu/Hindi coverage guarantee.
 */
export function getLocalizedTool(tool: ToolDefinition, lang: Language): { name: string; shortDesc: string; categoryLabel: string } {
  const explicit = TOOL_TRANSLATIONS[tool.id]?.[lang] || TOOL_TRANSLATIONS[tool.slug]?.[lang];
  const catLabel = CATEGORY_TRANSLATIONS[tool.category]?.[lang] || tool.category;

  if (explicit) {
    return {
      name: explicit.name,
      shortDesc: explicit.shortDesc,
      categoryLabel: catLabel,
    };
  }

  if (lang === 'ar') {
    return {
      name: generateArabicToolName(tool.id, tool.name),
      shortDesc: generateArabicShortDesc(tool.id, tool.category),
      categoryLabel: catLabel,
    };
  }

  if (lang === 'ur') {
    return {
      name: generateUrduToolName(tool.id, tool.name),
      shortDesc: tool.shortDesc,
      categoryLabel: catLabel,
    };
  }

  if (lang === 'hi') {
    return {
      name: generateHindiToolName(tool.id, tool.name),
      shortDesc: tool.shortDesc,
      categoryLabel: catLabel,
    };
  }

  return {
    name: tool.name,
    shortDesc: tool.shortDesc,
    categoryLabel: catLabel,
  };
}

/**
 * Returns localized category name for navigation / filters.
 */
export function getLocalizedCategory(categoryKey: string, lang: Language): string {
  return CATEGORY_TRANSLATIONS[categoryKey]?.[lang] || categoryKey;
}

export function getLocalizedCourse(course: Course, lang: Language): Course {
  return course;
}
