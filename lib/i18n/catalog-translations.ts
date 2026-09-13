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

// ==================== URDU TRANSLATION DICTIONARIES ====================
const UR_ACTION_TERMS: Record<string, string> = {
  'merge': 'یکجا کرنا (دمج)',
  'split': 'تقسیم کرنا (فصل)',
  'compress': 'سائز کم کرنا',
  'compressor': 'کمپریسر',
  'convert': 'تبدیل کرنا',
  'converter': 'کنورٹر',
  'editor': 'ایڈیٹر',
  'edit': 'ترمیم',
  'organize': 'منظم کریں',
  'organizer': 'آرگنائزر',
  'rotate': 'گھمائیں',
  'rotator': 'روٹیٹر',
  'flip': 'پلٹیں',
  'flipper': 'فلپر',
  'crop': 'کراپ (کاٹیں)',
  'cropper': 'کراپر',
  'watermark': 'واٹر مارک',
  'protect': 'پاس ورڈ لگانا',
  'unlock': 'پاس ورڈ ہٹانا',
  'encrypt': 'انکرپٹ',
  'decrypt': 'ڈی کرپٹ',
  'extract': 'نکالیں',
  'delete': 'حذف کریں',
  'remove': 'ہٹائیں',
  'clean': 'صاف کریں',
  'cleaner': 'کلینر',
  'cleanup': 'صفائی',
  'repair': 'مرمت',
  'reverse': 'الٹائیں',
  'reorder': 'ترتیب بدلیں',
  'replace': 'تبدیل کریں',
  'resize': 'سائز بدلیں',
  'resizer': 'ری سائز',
  'counter': 'گنتی / اعداد و شمار',
  'analyzer': 'تجزیہ کار',
  'analysis': 'تجزیہ',
  'generator': 'جنریٹر',
  'generate': 'بنانا',
  'formatter': 'فارمیٹر',
  'format': 'فارمیٹ',
  'validator': 'چیکر / تصدیق',
  'viewer': 'دیکھنے والا',
  'cutter': 'کٹر (کاٹیں)',
  'booster': 'آواز بڑھائیں (بوسٹر)',
  'speed': 'رفتار تبدیل کریں',
  'downloader': 'ڈاؤنلوڈر',
  'saver': 'محفوظ کریں',
  'palette': 'کلر پیلیٹ',
  'picker': 'رنگ چنیں',
  'grayscale': 'سیاہ و سفید',
  'stamp': 'مہر / اسٹیمپ',
  'header': 'ہیڈر',
  'footer': 'فوٹر',
  'numbers': 'صفحہ نمبر',
  'redact': 'خفیہ کریں / سنسر',
  'sanitize': 'ڈیٹا صاف کریں',
  'diff': 'موازنہ / فرق',
  'odd': 'طاق (Odd)',
  'even': 'جفت (Even)',
  'blank': 'خالی',
  'pages': 'صفحات',
  'images': 'تصاویر',
  'image': 'تصویر',
  'photo': 'تصویر',
  'files': 'فائلیں',
  'file': 'فائل',
  'text': 'ٹیکسٹ',
  'words': 'الفاظ',
  'lines': 'سطور',
  'searchable': 'تلاش کے قابل',
  'calculator': 'کیلکولیٹر',
  'loan': 'قرض',
  'discount': 'رعایت',
  'profit': 'منافع',
  'margin': 'مارجن',
  'interest': 'سود / شرح',
  'bandwidth': 'انٹرنیٹ اسپیڈ',
  'storage': 'اسٹوریج',
  'unit': 'اکائی کنورٹر',
  'passport': 'پاسپورٹ سائز تصویر',
  'background': 'بیک گراؤنڈ',
  'favicon': 'ویب سائٹ آئیکن Favicon',
  'barcode': 'بارکوڈ',
  'qr': 'کیو آر کوڈ QR',
  'hash': 'ہیش چیک سم Hash',
  'password': 'پاس ورڈ',
  'uuid': 'یو یو آئی ڈی UUID',
  'timestamp': 'ٹائم اسٹیمپ',
  'duplicate': 'ڈپلیکیٹ',
  'spaces': 'اضافی اسپیس',
  'uppercase': 'بڑے حروف',
  'lowercase': 'چھوٹے حروف',
  'title': 'ٹائٹل کیس',
  'sentence': 'جملہ کیس',
};

const UR_FORMAT_TERMS: Record<string, string> = {
  'pdf': 'پی ڈی ایف (PDF)',
  'word': 'ورڈ (DOCX)',
  'docx': 'ورڈ (DOCX)',
  'doc': 'ورڈ (DOC)',
  'excel': 'ایکسل (XLSX)',
  'xlsx': 'ایکسل (XLSX)',
  'xls': 'ایکسل (XLS)',
  'powerpoint': 'پاورپوائنٹ (PPTX)',
  'pptx': 'پاورپوائنٹ (PPTX)',
  'ppt': 'پاورپوائنٹ (PPT)',
  'csv': 'سی ایس وی (CSV)',
  'rtf': 'آر ٹی ایف (RTF)',
  'txt': 'ٹیکسٹ (TXT)',
  'text': 'ٹیکسٹ (TXT)',
  'html': 'ایچ ٹی ایم ایل (HTML)',
  'markdown': 'مارک ڈاؤن (Markdown)',
  'md': 'مارک ڈاؤن',
  'epub': 'ای بک (EPUB)',
  'jpg': 'جے پی جی (JPG)',
  'jpeg': 'جے پی ای جی (JPEG)',
  'png': 'پی این جی (PNG)',
  'webp': 'ویب پی (WebP)',
  'bmp': 'بی ایم پی (BMP)',
  'tiff': 'ٹف (TIFF)',
  'heic': 'ایچ ای آئی سی (HEIC)',
  'ico': 'آئیکن (ICO)',
  'zip': 'زپ (ZIP)',
  'json': 'جے سن (JSON)',
  'jwt': 'جے ڈبلیو ٹی (JWT)',
  'mp3': 'آڈیو MP3',
  'audio': 'آڈیو',
  'video': 'ویڈیو',
};

// ==================== HINDI TRANSLATION DICTIONARIES ====================
const HI_ACTION_TERMS: Record<string, string> = {
  'merge': 'जोड़ें (Merge)',
  'split': 'अलग करें (Split)',
  'compress': 'साइज़ कम करें',
  'compressor': 'कंप्रेसर',
  'convert': 'बदलें',
  'converter': 'कन्वर्टर',
  'editor': 'संपादक (Editor)',
  'edit': 'संपादित करें',
  'organize': 'व्यवस्थित करें',
  'organizer': 'ऑर्गनाइज़र',
  'rotate': 'घुमाएँ (Rotate)',
  'rotator': 'रोटेटर',
  'flip': 'पलटें (Flip)',
  'crop': 'काटें (Crop)',
  'watermark': 'वॉटरमार्क लगाएं',
  'protect': 'पासवर्ड सुरक्षा',
  'unlock': 'पासवर्ड हटाएं',
  'encrypt': 'एन्क्रिप्ट',
  'decrypt': 'डिक्रिप्ट',
  'extract': 'निकालें',
  'delete': 'हटाएं',
  'remove': 'हटाएं',
  'clean': 'साफ़ करें',
  'repair': 'सुधारें',
  'reverse': 'उलटें',
  'reorder': 'क्रम बदलें',
  'resize': 'आकार बदलें',
  'counter': 'गिनती व आंकड़े',
  'generator': 'जनरेटर',
  'generate': 'बनाएं',
  'formatter': 'फॉर्मेटर',
  'viewer': 'दर्शक (Viewer)',
  'cutter': 'ऑडियो कटर',
  'booster': 'ध्वनि बूस्टर',
  'speed': 'गति बदलें',
  'downloader': 'डाउनलोडर',
  'palette': 'रंग पैलेट',
  'grayscale': 'ब्लैक एंड व्हाइट',
  'passport': 'पासपोर्ट फोटो',
  'background': 'बैकग्राउंड हटाएं',
  'favicon': 'फेविकॉन बनाएं',
  'barcode': 'बारकोड जनरेटर',
  'qr': 'QR कोड जनरेटर',
  'hash': 'हैश चेकसम (Hash)',
  'password': 'मजबूत पासवर्ड जनरेटर',
  'uuid': 'UUID जनरेटर',
  'timestamp': 'टाइमस्टैम्प',
  'duplicate': 'डुप्लिकेट हटाएं',
  'calculator': 'कैलकुलेटर',
  'loan': 'ऋण / लोन (EMI)',
  'bandwidth': 'इंटरनेट स्पीड',
  'storage': 'स्टोरेज यूनिट्स',
};

const HI_FORMAT_TERMS: Record<string, string> = {
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
  'txt': 'टेक्स्ट (TXT)',
  'text': 'टेक्स्ट (TXT)',
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
  'mp3': 'ऑडियो MP3',
  'audio': 'ऑडियो',
  'video': 'वीडियो',
};

const AR_ACTION_TERMS: Record<string, string> = {
  'compress': 'ضغط',
  'compressor': 'أداة الضغط',
  'convert': 'تحويل',
  'converter': 'محول',
  'editor': 'محرر (Editor)',
  'edit': 'تعديل',
  'organize': 'ترتيب وتنظيم',
  'organizer': 'منظم',
  'rotate': 'تدوير (Rotate)',
  'rotator': 'أداة التدوير',
  'flip': 'عكس (Flip)',
  'crop': 'قص (Crop)',
  'watermark': 'علامة مائية',
  'protect': 'حماية وتشفير',
  'unlock': 'فك القفل وكلمة المرور',
  'encrypt': 'تشفير',
  'decrypt': 'فك التشفير',
  'extract': 'استخراج',
  'delete': 'حذف',
  'remove': 'إزالة',
  'clean': 'تنظيف',
  'repair': 'إصلاح',
  'reverse': 'عكس',
  'reorder': 'إعادة ترتيب',
  'resize': 'تغيير الحجم والأبعاد',
  'counter': 'عداد وإحصائيات',
  'generator': 'توليد وإنشاء',
  'generate': 'توليد',
  'formatter': 'منسق (Formatter)',
  'viewer': 'عارض (Viewer)',
  'cutter': 'قص وتقطيع',
  'booster': 'مضخم الصوت',
  'speed': 'تغيير السرعة',
  'downloader': 'تنزيل وحفظ',
  'palette': 'لوحة الألوان',
  'grayscale': 'أبيض وأسود',
  'passport': 'صور جواز السفر',
  'background': 'إزالة الخلفية',
  'favicon': 'أيقونات المواقع',
  'barcode': 'مولد الباركود',
  'qr': 'مولد وقارئ QR',
  'hash': 'التجزئة الرقمية (Hash)',
  'password': 'مولد كلمات المرور',
  'uuid': 'معرفات فريدة UUID',
  'timestamp': 'طابع زمني Timestamp',
  'duplicate': 'إزالة التكرار',
  'calculator': 'حاسبة ذكية',
  'loan': 'حاسبة القروض (EMI)',
  'bandwidth': 'سرعة الإنترنت',
  'storage': 'وحدات التخزين',
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
  'epub': 'كتاب إلكتروني (EPUB)',
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
  
  if (lowerId.includes('-to-')) {
    const parts = lowerId.split('-to-');
    const fromFmt = AR_FORMAT_TERMS[parts[0]] || parts[0].toUpperCase();
    const toFmt = AR_FORMAT_TERMS[parts[1]] || parts[1].toUpperCase();
    return `تحويل ${fromFmt} إلى ${toFmt}`;
  }

  if (lowerId.includes('compress')) {
    if (lowerId.includes('pdf')) return 'ضغط وتحسين ملف PDF';
    if (lowerId.includes('image') || lowerId.includes('photo') || lowerId.includes('jpg') || lowerId.includes('png') || lowerId.includes('webp')) return 'ضغط وتقليل حجم الصور';
    if (lowerId.includes('word') || lowerId.includes('docx')) return 'ضغط وتقليل حجم ملف Word';
    return 'ضغط وتحسين الحجم';
  }

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
    const fromFmt = UR_FORMAT_TERMS[parts[0]] || parts[0].toUpperCase();
    const toFmt = UR_FORMAT_TERMS[parts[1]] || parts[1].toUpperCase();
    return `${fromFmt} کو ${toFmt} میں تبدیل کریں`;
  }
  if (lowerId.includes('compress')) return 'فائل سائز کم کریں (کمپریس)';
  if (lowerId.includes('merge')) return 'فائلیں یکجا کریں (Merge)';
  if (lowerId.includes('split')) return 'صفحات الگ کریں (Split)';
  if (lowerId.includes('protect')) return 'پاس ورڈ سے محفوظ کریں';
  if (lowerId.includes('unlock')) return 'پاس ورڈ ختم کریں';
  if (lowerId.includes('ocr')) return 'تصویر سے ٹیکسٹ نکالیں (OCR)';
  if (lowerId.includes('editor')) return 'پی ڈی ایف ایڈیٹر اسٹوڈیو';
  if (lowerId.includes('qr')) return 'کیو آر کوڈ جنریٹر';
  if (lowerId.includes('barcode')) return 'بارکوڈ جنریٹر';
  if (lowerId.includes('calculator')) return 'اسمارٹ کیلکولیٹر';
  if (lowerId.includes('audio')) return 'آڈیو ایڈیٹر و کٹر';
  if (lowerId.includes('video')) return 'ویڈیو ٹولز و ڈاؤنلوڈر';
  if (lowerId.includes('background')) return 'امیج بیک گراؤنڈ ہٹائیں';
  if (lowerId.includes('resize')) return 'امیج ری سائز کریں';
  if (lowerId.includes('crop')) return 'امیج کراپ کریں';
  if (lowerId.includes('watermark')) return 'واٹر مارک لگائیں';
  if (lowerId.includes('json')) return 'جے سن (JSON) فارمیٹر';
  if (lowerId.includes('hash')) return 'ہیش چیک سم جنریٹر';
  if (lowerId.includes('password')) return 'مضبوط پاس ورڈ جنریٹر';

  const tokens = lowerId.split('-');
  const urTokens = tokens.map(t => UR_ACTION_TERMS[t] || UR_FORMAT_TERMS[t] || t.toUpperCase());
  return urTokens.join(' ');
}

/**
 * Universal Urdu Short Description Generator
 */
export function generateUrduShortDesc(id: string, category: string): string {
  const lowerId = id.toLowerCase();
  if (lowerId.includes('-to-')) {
    const parts = lowerId.split('-to-');
    const fromFmt = UR_FORMAT_TERMS[parts[0]] || parts[0].toUpperCase();
    const toFmt = UR_FORMAT_TERMS[parts[1]] || parts[1].toUpperCase();
    return `${fromFmt} سے ${toFmt} میں اعلیٰ کوالٹی کے ساتھ 100% پرائیویٹ تبدیلی۔`;
  }
  if (lowerId.includes('compress')) return 'فائل کا سائز تیزی سے چھوٹا کریں اور اوریجنل کوالٹی برقرار رکھیں۔';
  if (lowerId.includes('merge')) return 'متعدد فائلوں کو ایک منظم دستاویز میں فوری طور پر جوڑیں۔';
  if (lowerId.includes('split')) return 'مخصوص صفحات کو الگ الگ فائلوں میں آسانی سے تقسیم کریں۔';
  if (lowerId.includes('protect')) return 'اپنی فائل کو مضبوط پاس ورڈ اور اعلیٰ انکرپشن کے ساتھ محفوظ کریں۔';
  if (lowerId.includes('unlock')) return 'محفوظ شدہ فائل سے پاس ورڈ ہٹائیں اور پابندیاں ختم کریں۔';
  if (lowerId.includes('ocr')) return 'تصاویر اور اسکین شدہ دستاویزات سے قابل تدوین ٹیکسٹ نکالیں۔';
  if (lowerId.includes('calculator')) return 'تمام حسابی اور مالیاتی پیمائشیں فوری اور درست انداز میں کریں۔';
  return 'تیز رفتار، محفوظ اور مکمل نجی ٹول جو براہ راست آپ کے براؤزر میں کام کرتا ہے۔';
}

/**
 * Universal Hindi Title Generator from Tool ID and Name
 */
export function generateHindiToolName(id: string, name: string): string {
  const lowerId = id.toLowerCase();
  if (lowerId.includes('-to-')) {
    const parts = lowerId.split('-to-');
    const fromFmt = HI_FORMAT_TERMS[parts[0]] || parts[0].toUpperCase();
    const toFmt = HI_FORMAT_TERMS[parts[1]] || parts[1].toUpperCase();
    return `${fromFmt} को ${toFmt} में बदलें`;
  }
  if (lowerId.includes('compress')) return 'फ़ाइल साइज़ कम करें (कंप्रेस)';
  if (lowerId.includes('merge')) return 'फ़ाइलें जोड़ें (Merge)';
  if (lowerId.includes('split')) return 'पृष्ठ अलग करें (Split)';
  if (lowerId.includes('protect')) return 'पासवर्ड सुरक्षा लगाएं';
  if (lowerId.includes('unlock')) return 'पासवर्ड हटाएं';
  if (lowerId.includes('ocr')) return 'टेक्स्ट निकालें (OCR)';
  if (lowerId.includes('editor')) return 'PDF एडिटर स्टूडियो';
  if (lowerId.includes('qr')) return 'QR कोड जनरेटर';
  if (lowerId.includes('barcode')) return 'बारकोड जनरेटर';
  if (lowerId.includes('calculator')) return 'स्मार्ट कैलकुलेटर';
  if (lowerId.includes('audio')) return 'ऑडियो कटर व एडिटर';
  if (lowerId.includes('video')) return 'वीडियो टूल्स';
  if (lowerId.includes('background')) return 'फोटो बैकग्राउंड हटाएं';
  if (lowerId.includes('resize')) return 'इमेज रिसाइज़ करें';
  if (lowerId.includes('crop')) return 'इमेज क्रॉप करें';
  if (lowerId.includes('watermark')) return 'वॉटरमार्क लगाएं';
  if (lowerId.includes('json')) return 'JSON फॉर्मेटर';
  if (lowerId.includes('hash')) return 'हैश चेकसम जनरेटर';
  if (lowerId.includes('password')) return 'मजबूत पासवर्ड जनरेटर';

  const tokens = lowerId.split('-');
  const hiTokens = tokens.map(t => HI_ACTION_TERMS[t] || HI_FORMAT_TERMS[t] || t.toUpperCase());
  return hiTokens.join(' ');
}

/**
 * Universal Hindi Short Description Generator
 */
export function generateHindiShortDesc(id: string, category: string): string {
  const lowerId = id.toLowerCase();
  if (lowerId.includes('-to-')) {
    const parts = lowerId.split('-to-');
    const fromFmt = HI_FORMAT_TERMS[parts[0]] || parts[0].toUpperCase();
    const toFmt = HI_FORMAT_TERMS[parts[1]] || parts[1].toUpperCase();
    return `${fromFmt} से ${toFmt} में उच्च गुणवत्ता के साथ 100% सुरक्षित रूपांतरण।`;
  }
  if (lowerId.includes('compress')) return 'गुणवत्ता बनाए रखते हुए फ़ाइल का साइज़ तेजी से छोटा करें।';
  if (lowerId.includes('merge')) return 'एकाधिक फ़ाइलों को एक व्यवस्थित दस्तावेज़ में आसानी से जोड़ें।';
  if (lowerId.includes('split')) return 'पृष्ठों को अलग-अलग फ़ाइलों में आसानी से विभाजित करें।';
  if (lowerId.includes('protect')) return 'अपनी फ़ाइल को मजबूत पासवर्ड और सुरक्षा के साथ सुरक्षित करें।';
  if (lowerId.includes('unlock')) return 'सुरक्षित फ़ाइल से पासवर्ड और सुरक्षा प्रतिबंध हटाएं।';
  if (lowerId.includes('ocr')) return 'तस्वीरों और स्कैन किए गए दस्तावेज़ों से टेक्स्ट निकालें।';
  if (lowerId.includes('calculator')) return 'त्वरित और सटीक गणितीय व वित्तीय गणनाएं करें।';
  return 'तेज़, सुरक्षित और 100% निजी टूल जो सीधे आपके डिवाइस में काम करता है।';
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
      shortDesc: generateUrduShortDesc(tool.id, tool.category),
      categoryLabel: catLabel,
    };
  }

  if (lang === 'hi') {
    return {
      name: generateHindiToolName(tool.id, tool.name),
      shortDesc: generateHindiShortDesc(tool.id, tool.category),
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

const COURSE_TRANSLATIONS: Record<string, Record<Language, { title: string; subtitle: string; description: string }>> = {
  'modern-fullstack-web-mastery': {
    en: {
      title: 'Modern Full-Stack Web Mastery (Next.js, TypeScript & Cloud)',
      subtitle: 'Complete zero-to-hero engineering guide to building hyper-performant client-side and fullstack applications.',
      description: 'Master React 18, Next.js 14 App Router, TypeScript, Tailwind CSS, WebAssembly, and state architecture with real production projects.',
    },
    ur: {
      title: 'جدید فل اسٹیک ویب ڈویلپمنٹ ماسٹری (Next.js & TypeScript)',
      subtitle: 'تیز رفتار کلائنٹ سائیڈ اور فل اسٹیک ویب ایپلیکیشنز بنانے کا مکمل زیرو ٹو ہیرو گائیڈ۔',
      description: 'ری ایکٹ 18، نیکسٹ جے ایس 14 ایپ راؤٹر، ٹائپ اسکرپٹ، ٹیل ونڈ سی ایس ایس اور ویب اسمبلی میں حقیقی پروجیکٹس بنا کر مہارت حاصل کریں۔',
    },
    ar: {
      title: 'احتراف تطوير الويب المتكامل (Next.js و TypeScript)',
      subtitle: 'دليل هندسي شامل لبناء تطبيقات ويب فائقة السرعة والأداء والأمان.',
      description: 'أتقن React 18 و Next.js 14 و TypeScript و Tailwind CSS و WebAssembly مع مشاريع حية وحقيقية.',
    },
    hi: {
      title: 'आधुनिक फुल-स्टैक वेब डेवलपमेंट मास्टरी (Next.js & TypeScript)',
      subtitle: 'अत्यधिक तेज़ और सुरक्षित क्लाइंट-साइड व फुलस्टैक ऐप्स बनाने की संपूर्ण हैंडबुक।',
      description: 'React 18, Next.js 14 App Router, TypeScript, Tailwind CSS और WebAssembly में वास्तविक प्रोजेक्ट्स बनाकर विशेषज्ञता हासिल करें।',
    },
  },
  'python-ai-prompt-engineering-mastery': {
    en: {
      title: 'Python & Generative AI Prompt Engineering Mastery',
      subtitle: 'Build autonomous agents, generative workflows, and high-performance Python utilities.',
      description: 'Master Python 3.12, LangChain, OpenAI & Gemini APIs, structured outputs, embeddings, and automated tool builders.',
    },
    ur: {
      title: 'پائتھن اور جنریٹو اے آئی پرامپٹ انجینئرنگ ماسٹری',
      subtitle: 'خودکار AI ایجنٹس، جدید ورک فلوز اور تیز رفتار پائتھن یوٹیلٹیز تیار کرنا سیکھیں۔',
      description: 'پائتھن 3.12، جیمنی اور اوپن اے آئی ای پی آئی، اسٹرکچرڈ ڈیٹا اور خودکار ٹولز کی تعمیر میں مہارت حاصل کریں۔',
    },
    ar: {
      title: 'احتراف بايثون وهندسة الأوامر الذكية (Generative AI)',
      subtitle: 'بناء الوكلاء الأذكياء وسير العمل التوليدي وأدوات بايثون المتقدمة.',
      description: 'أتقن بايثون 3.12، وواجهات برمجة Gemini و OpenAI، والمخرجات المنظمة، وبناء أدوات الذكاء الاصطناعي المستقلة.',
    },
    hi: {
      title: 'पायथन व जनरेटिव एआई प्रॉम्प्ट इंजीनियरिंग मास्टरी',
      subtitle: 'स्वायत्त AI एजेंट्स, आधुनिक वर्कफ़्लो और शक्तिशाली पायथन टूल्स बनाना सीखें।',
      description: 'Python 3.12, Gemini और OpenAI APIs, स्ट्रक्चर्ड आउटपुट और स्वचालित टूल्स के निर्माण में दक्षता प्राप्त करें।',
    },
  },
  'document-pdf-automation-mastery': {
    en: {
      title: 'Document Engineering & PDF Automation Mastery',
      subtitle: 'In-browser binary manipulation, OCR parsing, client-side encryption, and format conversion pipelines.',
      description: 'Deep dive into PDF specifications, WebAssembly binary engines, Tesseract OCR, XLSX parsing, and client-side encryption.',
    },
    ur: {
      title: 'دستاویز انجینئرنگ اور پی ڈی ایف آٹومیشن ماسٹری',
      subtitle: 'براؤزر میں بائنری پروسیسنگ، OCR، کلائنٹ سائیڈ انکرپشن اور فائل کنورژن۔',
      description: 'پی ڈی ایف اسپیکس، ویب اسمبلی، ٹیسیریکٹ او سی آر، ایکسل پارسنگ اور محفوظ دستاویزات کا مکمل نظام سیکھیں۔',
    },
    ar: {
      title: 'هندسة المستندات وأتمتة ملفات PDF الاحترافية',
      subtitle: 'معالجة الملفات الثنائية في المتصفح، واستخراج OCR، والتشفير المحلي وتحويل التنسيقات.',
      description: 'تعمق في مواصفات PDF، ومحركات WebAssembly، و Tesseract OCR، وتحليل Excel، وتشفير المستندات المحلي.',
    },
    hi: {
      title: 'दस्तावेज़ इंजीनियरिंग व PDF ऑटोमेशन मास्टरी',
      subtitle: 'ब्राउज़र में बाइनरी फ़ाइल प्रोसेसिंग, OCR टेक्स्ट निष्कर्षण, लोकल एन्क्रिप्शन और फ़ाइल कन्वर्शन।',
      description: 'PDF संरचना, WebAssembly इंजन, Tesseract OCR, Excel विश्लेषण और सुरक्षित दस्तावेज़ निर्माण में महारत हासिल करें।',
    },
  },
  'cybersecurity-privacy-engineering': {
    en: {
      title: 'Cybersecurity, Cryptography & Privacy Engineering',
      subtitle: 'Zero-knowledge architectures, AES-GCM encryption, JWT verification, and secure client-side computing.',
      description: 'Learn enterprise-grade cryptography, hash algorithms (SHA-256, SHA-512), secure random generation, and privacy-first engineering.',
    },
    ur: {
      title: 'سائبر سیکیورٹی، کرپٹوگرافی اور پرائیویسی انجینئرنگ',
      subtitle: 'زیرو نالج سیکیورٹی، AES انکرپشن، JWT ویریفکیشن اور محفوظ کلائنٹ سائیڈ کمپیوٹنگ۔',
      description: 'انٹرپرائز سطح کی کرپٹوگرافی، SHA-256 ہیش الگورتھم، پاس ورڈ سیکیورٹی اور پرائیویسی انجینئرنگ سیکھیں۔',
    },
    ar: {
      title: 'الأمن السيبراني، التشفير وهندسة الخصوصية الرقمية',
      subtitle: 'هندسة أمان المعرفة الصفرية، وتشفير AES-GCM، والتحقق من JWT، والحوسبة المحلية الآمنة.',
      description: 'تعلم التشفير المتقدم، وخوارزميات التجزئة (SHA-256, SHA-512)، وحماية البيانات وحصانتها من الاختراق.',
    },
    hi: {
      title: 'साइबर सुरक्षा, क्रिप्टोग्राफी व गोपनीयता इंजीनियरिंग',
      subtitle: 'ज़ीरो-नॉलेज आर्किटेक्चर, AES-GCM एन्क्रिप्शन, JWT सत्यापन और सुरक्षित लोकल कंप्यूटिंग।',
      description: 'उन्नत क्रिप्टोग्राफी, SHA-256 हैश एल्गोरिदम, पासवर्ड सुरक्षा और गोपनीयता-प्रथम इंजीनियरिंग में महारत हासिल करें।',
    },
  },
  'ui-ux-design-systems-mastery': {
    en: {
      title: 'Modern UI/UX Design Systems & Motion Engineering',
      subtitle: 'Design accessible, high-conversion interfaces with Tailwind CSS, Framer Motion, and design tokens.',
      description: 'Master responsive layouts, micro-interactions, dark mode color science, typography hierarchy, and accessibility standards.',
    },
    ur: {
      title: 'جدید UI/UX ڈیزائن سسٹمز اور موشن انجینئرنگ',
      subtitle: 'ٹیل ونڈ سی ایس ایس اور جدید اینیمیشنز کے ساتھ قابل رسائی اور خوبصورت انٹرفیس بنائیں۔',
      description: 'ریسپانسیو لے آؤٹ، مائیکرو انٹرایکشنز، ڈارک موڈ کلر سائنس، ٹائپوگرافی اور قابل رسائی معیارات میں مہارت حاصل کریں۔',
    },
    ar: {
      title: 'نظم تصميم واجهات المستخدم UI/UX وهندسة الحركة التفاعلية',
      subtitle: 'تصميم واجهات سهلة الوصول وعالية التفاعل باستخدام Tailwind CSS والتأثيرات الحركية.',
      description: 'أتقن التصميم المتجاوب، والتفاعلات الدقيقة، وعلوم ألوان الوضع الليلي، والتسلسل الهرمي للخطوط.',
    },
    hi: {
      title: 'आधुनिक UI/UX डिज़ाइन सिस्टम्स व मोशन इंजीनियरिंग',
      subtitle: 'Tailwind CSS और आधुनिक एनिमेशन के साथ आकर्षक और सुलभ यूजर इंटरफेस तैयार करें।',
      description: 'रिस्पॉन्सिव लेआउट, माइक्रो-इंटरैक्शन, डार्क मोड कलर साइंस, टाइपोग्राफी और एक्सेसिबिलिटी मानकों में महारत हासिल करें।',
    },
  },
};

export function getLocalizedCourse(course: Course, lang: Language): Course {
  const trans = COURSE_TRANSLATIONS[course.id]?.[lang];
  if (!trans) return course;
  return {
    ...course,
    title: trans.title,
    description: trans.description,
  };
}
