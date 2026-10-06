export type PaperSize = 'a4' | 'letter' | 'legal';
export type PageOrientation = 'portrait' | 'landscape';
export type MarginPreset = 'normal' | 'narrow' | 'wide';
export type PageNumberPosition = 'none' | 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-right';

export interface DocumentPageSettings {
  paperSize: PaperSize;
  orientation: PageOrientation;
  marginPreset: MarginPreset;
  customMarginMm?: number;
  pageBgColor: string;
  headerText: string;
  footerText: string;
  pageNumberPosition: PageNumberPosition;
  includeHeaderFooter: boolean;
  showPageBorders: boolean;
}

export interface DocumentModel {
  id: string;
  title: string;
  contentHtml: string;
  createdAt: number;
  updatedAt: number;
  isRTL: boolean;
  fontFamily: string;
  fontSize: string;
  lineSpacing: string;
  settings: DocumentPageSettings;
}

export interface RecentDocumentMeta {
  id: string;
  title: string;
  updatedAt: number;
  wordCount: number;
  charCount: number;
  pageCount: number;
  previewSnippet: string;
  isRTL: boolean;
}

export const DEFAULT_PAGE_SETTINGS: DocumentPageSettings = {
  paperSize: 'a4',
  orientation: 'portrait',
  marginPreset: 'normal',
  pageBgColor: '#ffffff',
  headerText: '',
  footerText: '',
  pageNumberPosition: 'bottom-center',
  includeHeaderFooter: true,
  showPageBorders: true,
};

export const MARGIN_VALUES: Record<MarginPreset, { label: string; mm: number; css: string; pt: number }> = {
  normal: { label: 'Normal (1 in / 25.4mm)', mm: 25.4, css: '25.4mm', pt: 72 },
  narrow: { label: 'Narrow (0.5 in / 12.7mm)', mm: 12.7, css: '12.7mm', pt: 36 },
  wide: { label: 'Wide (1.5 in / 38.1mm)', mm: 38.1, css: '38.1mm', pt: 108 },
};

export const PAPER_DIMENSIONS: Record<PaperSize, { portrait: { widthMm: number; heightMm: number; widthPx: number; heightPx: number }; landscape: { widthMm: number; heightMm: number; widthPx: number; heightPx: number } }> = {
  a4: {
    portrait: { widthMm: 210, heightMm: 297, widthPx: 794, heightPx: 1123 },
    landscape: { widthMm: 297, heightMm: 210, widthPx: 1123, heightPx: 794 },
  },
  letter: {
    portrait: { widthMm: 215.9, heightMm: 279.4, widthPx: 816, heightPx: 1056 },
    landscape: { widthMm: 279.4, heightMm: 215.9, widthPx: 1056, heightPx: 816 },
  },
  legal: {
    portrait: { widthMm: 215.9, heightMm: 355.6, widthPx: 816, heightPx: 1344 },
    landscape: { widthMm: 355.6, heightMm: 215.9, widthPx: 1344, heightPx: 816 },
  },
};

export interface FontOptionItem {
  id: string;
  label: string;
  category: 'urdu' | 'arabic' | 'hindi' | 'english';
  family: string;
  defaultLineHeight: string;
  isRTL?: boolean;
}

export const FONT_OPTIONS: FontOptionItem[] = [
  // URDU FONTS (اردو)
  {
    id: 'urdu-nastaliq',
    label: 'اردو: خطِ نستعلیق (Urdu Nastaliq Calligraphic)',
    category: 'urdu',
    family: '"Noto Nastaliq Urdu", "Gulzar", "Jameel Noori Nastaleeq", "Noto Sans Arabic", serif',
    defaultLineHeight: '2.2',
    isRTL: true,
  },
  {
    id: 'urdu-naskh',
    label: 'اردو: خطِ نسخ جدید (Urdu Naskh Modern)',
    category: 'urdu',
    family: '"Noto Naskh Arabic", "Noto Sans Arabic", Tahoma, sans-serif',
    defaultLineHeight: '1.75',
    isRTL: true,
  },

  // ARABIC FONTS (العربية)
  {
    id: 'arabic-amiri',
    label: 'العربية: خط أميري كلاسيكي (Amiri Traditional Serif)',
    category: 'arabic',
    family: 'Amiri, "Times New Roman", serif',
    defaultLineHeight: '1.8',
    isRTL: true,
  },
  {
    id: 'arabic-cairo',
    label: 'العربية: خط كايرو الحديث (Cairo Modern)',
    category: 'arabic',
    family: 'Cairo, "Noto Sans Arabic", sans-serif',
    defaultLineHeight: '1.65',
    isRTL: true,
  },
  {
    id: 'arabic-tajawal',
    label: 'العربية: خط تجوال الأنيق (Tajawal Elegant)',
    category: 'arabic',
    family: 'Tajawal, "Noto Sans Arabic", sans-serif',
    defaultLineHeight: '1.65',
    isRTL: true,
  },
  {
    id: 'arabic-almarai',
    label: 'العربية: خط المراعي العصري (Almarai Clean)',
    category: 'arabic',
    family: 'Almarai, "Noto Sans Arabic", sans-serif',
    defaultLineHeight: '1.65',
    isRTL: true,
  },
  {
    id: 'arabic-naskh',
    label: 'العربية: خط النسخ الأصيل (Noto Naskh)',
    category: 'arabic',
    family: '"Noto Naskh Arabic", "Noto Sans Arabic", sans-serif',
    defaultLineHeight: '1.75',
    isRTL: true,
  },

  // HINDI FONTS (हिन्दी)
  {
    id: 'hindi-poppins',
    label: 'हिन्दी: पॉपिन्स मॉडर्न (Poppins Devanagari Modern)',
    category: 'hindi',
    family: 'Poppins, "Noto Sans Devanagari", sans-serif',
    defaultLineHeight: '1.65',
    isRTL: false,
  },
  {
    id: 'hindi-devanagari',
    label: 'हिन्दी: देवनागरी क्लासिक (Noto Sans Devanagari)',
    category: 'hindi',
    family: '"Noto Sans Devanagari", "Mangal", sans-serif',
    defaultLineHeight: '1.7',
    isRTL: false,
  },
  {
    id: 'hindi-tiro',
    label: 'हिन्दी: तिरो देवनागरी (Tiro Devanagari Serif)',
    category: 'hindi',
    family: '"Tiro Devanagari Hindi", serif',
    defaultLineHeight: '1.75',
    isRTL: false,
  },

  // ENGLISH & WESTERN FONTS
  {
    id: 'sans-jakarta',
    label: 'English: Plus Jakarta Sans (Modern Executive)',
    category: 'english',
    family: '"Plus Jakarta Sans", "Inter", sans-serif',
    defaultLineHeight: '1.5',
    isRTL: false,
  },
  {
    id: 'sans-inter',
    label: 'English: Inter (Clean Standard)',
    category: 'english',
    family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    defaultLineHeight: '1.5',
    isRTL: false,
  },
  {
    id: 'serif-merriweather',
    label: 'English: Merriweather (Editorial Serif)',
    category: 'english',
    family: 'Merriweather, Georgia, "Times New Roman", serif',
    defaultLineHeight: '1.65',
    isRTL: false,
  },
  {
    id: 'sans-outfit',
    label: 'English: Outfit (Geometric Display)',
    category: 'english',
    family: 'Outfit, "Plus Jakarta Sans", sans-serif',
    defaultLineHeight: '1.5',
    isRTL: false,
  },
  {
    id: 'mono',
    label: 'Code / Plain: Monospace (Courier New)',
    category: 'english',
    family: '"Courier New", Courier, Consolas, monospace',
    defaultLineHeight: '1.45',
    isRTL: false,
  },
];

export const FONT_SIZE_OPTIONS = [
  { label: '9 pt (Fine)', value: '12px', pt: 9 },
  { label: '10 pt (Small)', value: '13.3px', pt: 10 },
  { label: '11 pt (Body Small)', value: '14.5px', pt: 11 },
  { label: '12 pt (Standard Body)', value: '16px', pt: 12 },
  { label: '14 pt (Subtitle / Subhead)', value: '18.5px', pt: 14 },
  { label: '16 pt (Heading 3)', value: '21.3px', pt: 16 },
  { label: '18 pt (Heading 2)', value: '24px', pt: 18 },
  { label: '24 pt (Heading 1)', value: '32px', pt: 24 },
  { label: '30 pt (Title)', value: '40px', pt: 30 },
  { label: '36 pt (Main Title)', value: '48px', pt: 36 },
];

export const LINE_SPACING_OPTIONS = [
  { label: '1.15 (Standard / मानक)', value: '1.38' },
  { label: '1.35 (Comfortable)', value: '1.5' },
  { label: '1.5 (Relaxed / खुला)', value: '1.65' },
  { label: '1.75 (Open / واضح)', value: '1.85' },
  { label: '2.0 (Double / دوہرا)', value: '2.1' },
  { label: '2.2 (Nastaliq Optimal / خطِ نستعلیق)', value: '2.25' },
];

export interface DocumentTemplateItem {
  id: string;
  name: string;
  category: 'general' | 'business' | 'urdu' | 'arabic' | 'hindi';
  icon: string;
  desc: string;
  isRTL: boolean;
  fontFamily: string;
  defaultLineHeight: string;
  content: string;
}

export const DOCUMENT_TEMPLATES: DocumentTemplateItem[] = [
  {
    id: 'blank',
    name: 'Blank Document (خالی دستاویز / नया दस्तावेज़)',
    category: 'general',
    icon: '📄',
    desc: 'Clean paper page ready for typing, pasting, or importing.',
    isRTL: false,
    fontFamily: FONT_OPTIONS.find((f) => f.id === 'sans-jakarta')?.family || FONT_OPTIONS[0].family,
    defaultLineHeight: '1.5',
    content: '<h1>Untitled Document</h1><p>Start writing your document here or paste text from your clipboard. Format text, insert tables, images, and export to PDF or Word (.docx) with 100% privacy and high precision.</p>',
  },
  {
    id: 'urdu_formal',
    name: 'اردو: باضابطہ دفتری درخواست (Urdu Application)',
    category: 'urdu',
    icon: '✍️',
    desc: 'خوبصورت خطِ نستعلیق میں باضابطہ دفتری یا تعلیمی درخواست کا مکمل نمونہ۔',
    isRTL: true,
    fontFamily: FONT_OPTIONS.find((f) => f.id === 'urdu-nastaliq')?.family || FONT_OPTIONS[0].family,
    defaultLineHeight: '2.2',
    content: `<div dir="rtl" style="text-align: right; font-family: 'Noto Nastaliq Urdu', 'Gulzar', serif; line-height: 2.2;"><p><strong>بتاریخ:</strong> ${new Date().toLocaleDateString('en-GB')}</p><p><strong>بخدمت جناب:</strong> مینیجنگ ڈائریکٹر صاحب / ہیڈ آف ڈیپارٹمنٹ<br/>ادارہِ دستاویزات و ڈیجیٹل سروسز</p><p><strong>عنوان: باضابطہ درخواست برائے جدید ورڈ ڈاکومنٹ و پی ڈی ایف سروس</strong></p><p><strong>جنابِ عالی!</strong></p><p>نہایت ادب و احترام کے ساتھ گزارش ہے کہ ہم آپ کے معتبر پلیٹ فارم کے ذریعے مختلف دفتری خطوط، مضامین، رپورٹس اور تحریری مواد کو اعلیٰ کوالٹی میں پی ڈی ایف (PDF) اور مائیکروسافٹ ورڈ (Word DOCX) میں مرتب کر رہے ہیں۔</p><p>اس جدید ایڈیٹر میں اردو نستعلیق خط کی خوبصورت کشش، دائیں سے بائیں (RTL) خودکار ترتیب، اور لائیو ملٹی پیج فارمیٹنگ کی سہولت نے ہمارے کام کو انتہائی آسان اور معیاری بنا دیا ہے۔</p><p>امید ہے کہ آپ اس شاندار اور مکمل مفت سہولت کو ہمیشہ اسی اعلیٰ معیار کے ساتھ جاری رکھیں گے۔</p><p>ہم آپ کی اس مخلصانہ خدمت کے بے حد شکر گزار ہیں۔</p><p style="margin-top: 32px;"><strong>فقط العارض:</strong><br/>آپ کا مخلص خادم<br/>محمد جمیل الرحمن<br/><em>رابطہ ای میل: contact@miftahtools.com</em></p></div>`,
  },
  {
    id: 'arabic_formal',
    name: 'العربية: خطاب رسمي احترافي (Arabic Official Letter)',
    category: 'arabic',
    icon: '📜',
    desc: 'خطاب رسمي بالخط الأميري والنسخ مع تنسيق دقيق وديباجة متكاملة.',
    isRTL: true,
    fontFamily: FONT_OPTIONS.find((f) => f.id === 'arabic-amiri')?.family || FONT_OPTIONS[2].family,
    defaultLineHeight: '1.8',
    content: `<div dir="rtl" style="text-align: right; font-family: Amiri, Cairo, serif; line-height: 1.85;"><p><strong>التاريخ:</strong> ${new Date().toLocaleDateString('en-GB')}</p><p><strong>إلى سعادة:</strong> المدير العام / رئيس مجلس الإدارة المحترم<br/>إدارة المشاريع والحلول الرقمية</p><p><strong>الموضوع: مقترح التعاون المشترك وتطوير منظومة المستندات الرقمية</strong></p><p><strong>السلام عليكم ورحمة الله وبركاته، أما بعد:</strong></p><p>يطيب لنا أن نتقدم لسعادتكم بخالص التحية والتقدير، ونود الإعراب عن بالغ اهتمامنا بتعزيز التعاون المشترك في مجال إنتاج وتصدير المستندات الرقمية عالية الجودة.</p><p>إن توفير محرر متكامل يدعم الخطوط العربية الأصيلة، والتنسيق متعدد الصفحات، والتصدير الفوري إلى PDF و Word (DOCX) بأعلى درجات الدقة والخصوصية، يعد ركيزة أساسية لرفع كفاءة الأعمال المكتبية.</p><p>نتطلع إلى عقد اجتماع عمل لمناقشة الخطوات التنفيذية في أقرب وقت يناسب سعادتكم.</p><p>وتفضلوا بقبول فائق الاحترام والتقدير.</p><p style="margin-top: 32px;"><strong>مقدم الطلب:</strong><br/>إدارة التعاون والتطوير المؤسسي<br/><em>البريد الإلكتروني: contact@miftahtools.com</em></p></div>`,
  },
  {
    id: 'hindi_application',
    name: 'हिन्दी: औपचारिक प्रार्थना पत्र (Hindi Official Application)',
    category: 'hindi',
    icon: '🇮🇳',
    desc: 'देवनागरी फॉन्ट में औपचारिक प्रार्थना पत्र व कार्यालयी पत्राचार प्रारूप।',
    isRTL: false,
    fontFamily: FONT_OPTIONS.find((f) => f.id === 'hindi-poppins')?.family || FONT_OPTIONS[7].family,
    defaultLineHeight: '1.7',
    content: `<div style="font-family: Poppins, 'Noto Sans Devanagari', sans-serif; line-height: 1.75;"><p><strong>दिनांक:</strong> ${new Date().toLocaleDateString('en-GB')}</p><p><strong>सेवा में,</strong><br/>श्रीमान प्रबंधक महोदय / विभागाध्यक्ष महोदय,<br/>डिजिटल प्रौद्योगिकी एवं दस्तावेज़ प्रबंधन प्रभाग।</p><p><strong>विषय: उच्च स्तरीय दस्तावेज़ संपादन एवं पीडीएफ/वर्ड निर्यात हेतु प्रार्थना पत्र।</strong></p><p><strong>महोदय,</strong></p><p>सविनय निवेदन यह है कि हम आपके प्रतिष्ठित डिजिटल प्लेटफॉर्म का उपयोग नियमित रूप से विभिन्न आधिकारिक पत्रों, शैक्षणिक नोट्स और व्यावसायिक रिपोर्ट तैयार करने के लिए कर रहे हैं।</p><p>आपके नए मोबाइल-फ्रेंडली वर्ड एवं डॉक्स एडिटर की सहायता से अब हम सीधे हिंदी में टाइप करके, शीर्षक, टेबल, चित्र और रंगीन टेक्स्ट जोड़कर एक क्लिक में पीडीएफ (PDF) और वर्ड (DOCX) फाइल आसानी से तैयार कर पा रहे हैं।</p><p>अतः आपसे विनम्र अनुरोध है कि इस उत्कृष्ट निःशुल्क सेवा को सदैव इसी प्रकार उच्च गुणवत्ता के साथ जारी रखने की कृपा करें।</p><p>इसके लिए हम सदैव आपके आभारी रहेंगे।</p><p style="margin-top: 32px;"><strong>भवदीय,</strong><br/>जमील रहमान<br/><em>संपर्क सूत्र: contact@miftahtools.com</em></p></div>`,
  },
  {
    id: 'business_letter',
    name: 'English: Formal Business Letter (व्यावसायिक पत्र)',
    category: 'business',
    icon: '💼',
    desc: 'Standard corporate correspondence with header, date, subject, and signature.',
    isRTL: false,
    fontFamily: FONT_OPTIONS.find((f) => f.id === 'sans-jakarta')?.family || FONT_OPTIONS[0].family,
    defaultLineHeight: '1.5',
    content: `<p><strong>Executive Management Office</strong><br/>Suite 800, Innovation Towers, Technology Park<br/>Email: contact@organization.com | Phone: +1 (555) 019-2834</p><hr/><p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p><p><strong>To:</strong><br/>Recipient Name / Department Head<br/>Strategic Ventures Group Inc.</p><p><strong>Subject: Business Collaboration Proposal &amp; Partnership Terms</strong></p><p>Dear Sir / Madam,</p><p>I am writing to formally submit our project roadmap and terms of partnership for the upcoming fiscal period. Our organization delivers secure, client-side digital workflow solutions that prioritize complete user privacy and high operational efficiency.</p><p>We would welcome the opportunity to discuss key milestones in detail during a brief introductory conference at your earliest convenience.</p><p>Thank you very much for your time and consideration.</p><p>Sincerely,</p><p><strong>Managing Director</strong><br/>Enterprise Solutions</p>`,
  },
  {
    id: 'project_report',
    name: 'English: Executive Project Report (रिपोर्ट)',
    category: 'business',
    icon: '📊',
    desc: 'Structured report layout with summary, milestone table, and status indicators.',
    isRTL: false,
    fontFamily: FONT_OPTIONS.find((f) => f.id === 'sans-jakarta')?.family || FONT_OPTIONS[0].family,
    defaultLineHeight: '1.5',
    content: `<h1>Executive Project Performance Report</h1><p><em>Quarterly Review &bull; ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p><hr/><h2>1. Executive Summary</h2><p>This report outlines key performance indicators, engineering accomplishments, and deployment milestones achieved across platforms during the current review cycle.</p><h2>2. Milestone Deliverables</h2><table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin: 12px 0;"><thead><tr style="background-color: #f1f5f9;"><th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">Project Track</th><th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">Lead Owner</th><th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">Completion</th><th style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">Status</th></tr></thead><tbody><tr><td style="border: 1px solid #cbd5e1; padding: 10px;">Mobile Word/Docs Studio</td><td style="border: 1px solid #cbd5e1; padding: 10px;">Core Engineering</td><td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">100%</td><td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; color: #16a34a; font-weight: bold;">Completed</td></tr><tr><td style="border: 1px solid #cbd5e1; padding: 10px;">Multi-Page PDF &amp; DOCX Export</td><td style="border: 1px solid #cbd5e1; padding: 10px;">Core Dev Team</td><td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">100%</td><td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; color: #16a34a; font-weight: bold;">Verified</td></tr><tr><td style="border: 1px solid #cbd5e1; padding: 10px;">RTL Typography &amp; Nastaliq / Naskh</td><td style="border: 1px solid #cbd5e1; padding: 10px;">Design &amp; UX</td><td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">100%</td><td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; color: #16a34a; font-weight: bold;">Ready</td></tr></tbody></table><h2>3. Strategic Recommendations</h2><ul><li>Continue pure client-side processing to ensure absolute user data privacy.</li><li>Provide one-tap export to PDF and Word DOCX across all mobile platforms.</li></ul>`,
  },
];
