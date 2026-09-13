'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  CheckCircle2, 
  UserX, 
  Trash2, 
  ArrowLeft, 
  FileText, 
  Server, 
  Camera, 
  FolderLock, 
  Mail, 
  AlertTriangle,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const PRIVACY_LOCALES = {
  en: {
    backBtn: 'Back to Miftah Tools Home',
    badge: 'Google Play Policy & Privacy Verified',
    title: 'Privacy Policy & Data Safety',
    meta: 'App Name: Miftah Tools | Package: com.miftahtools.app | Last Updated: September 2026',
    highlightTitle: 'Core Privacy Principle: 100% On-Device Processing',
    highlightDesc: 'At Miftah Tools, your privacy and security are our highest priority. When you convert PDFs, merge files, compress photos, generate QR codes, or format code, all computation executes 100% locally in your phone or browser memory. Your files, photos, and documents are NEVER uploaded, stored, or processed on any remote server.',
    s1Title: '1. About Miftah Tools',
    s1Desc: 'Miftah Tools is an all-in-one utility and digital learning ecosystem featuring 220+ client-side tools (PDF manipulation, image studio, converters, audio/video tools, developer utilities, and skill courses). This Privacy Policy applies to the Android App (Package: com.miftahtools.app) and Web Application.',
    s2Title: '2. Information We NEVER Collect',
    s2Items: [
      'Zero Document Tracking: We never read, transmit, or store your PDFs, photos, videos, or documents on external servers.',
      'Zero Location Tracking: We never access or log your GPS coordinates or geographical location.',
      'Zero Contact / Media Scraping: We never access your contacts list, call logs, SMS, or personal media galleries.',
      'Zero Data Selling: We never sell, lease, or monetize user data with third-party data brokers or advertisers.',
    ],
    s3Title: '3. 100% Login-Free & Registration-Free',
    s3Intro: 'Miftah Tools is completely open, free, and accessible without mandatory user accounts or logins. For all 220+ tools:',
    s3Items: [
      'No Account Required: No passwords, credit cards, or mandatory emails.',
      'No User Tracking: No personal profile creation or intrusive session telemetry.',
      '100% Local Device Storage: Your recent tools, bookmarks, and conversion history stay strictly on your device.',
    ],
    s4Title: '4. Advertising Policy & Google AdMob Compliance',
    s4Intro: 'To keep all 220+ tools permanently 100% free for users worldwide, the mobile app displays non-intrusive Google AdMob advertisements:',
    s4Items: [
      'App Open Ads: Displayed briefly on startup with a clear skip button.',
      'Bottom Banner Ads: Non-intrusive, safe banner ads placed at the bottom of non-critical screens.',
      'Interstitial & Rewarded Ads: Shown between separate tool workflows with rate-limiting.',
      'AdMob Compliance: All ads comply strictly with Google Play Family and Child Safety policies.',
    ],
    s5Title: '5. Device Permissions & Strict Rationale',
    permCamera: '📷 Camera Permission: Used exclusively when scanning QR & Barcodes. Frames are processed live in memory and never recorded or uploaded.',
    permStorage: '📁 Storage & Media: Used exclusively when you explicitly select files or images for local compression, conversion, or editing.',
    permInternet: '🌐 Internet State: Required solely for Google AdMob ad delivery and web documentation assets.',
    permScoped: '🔒 Scoped Storage: Complies with Android 14 & 15 Scoped Storage rules. The app cannot access files outside your explicit selection.',
    s6Title: '6. Data Safety & Instant Local Cache Deletion',
    s6Intro: 'Since Miftah Tools does not maintain user databases on servers, you have immediate and permanent control over all local data:',
    methodATitle: 'Method A: 1-Tap In-App Data Purge',
    methodADesc: 'You can purge all cached history, recent tools, and offline assets instantly in Settings > "Clear Cache & History" or in the Privacy Center.',
    methodBTitle: 'Method B: Direct Developer Support & Verification',
    methodBDesc: 'If you have any questions regarding privacy or data verification, email our lead developer directly at jrahmanansari132@gmail.com. We reply within 24 hours.',
    s6ZeroCloud: '100% Zero-Cloud Guarantee: Uninstalling the application immediately and completely removes all local app files and cache from your device.',
    s7Title: '7. Children’s Privacy (COPPA & GDPR-K Compliance)',
    s7Desc: 'Miftah Tools is designed for general utility and technical education. We do not knowingly collect personal identifiable information from children under 13 years of age.',
    s8Title: '8. Security & Encryption Standards',
    s8Desc: 'All network transmissions utilize TLS 1.3 encryption. No secret keys or private tokens are distributed in client APK packages.',
    dpoTitle: 'Developer & Data Protection Officer Contact',
    dpoDesc: 'For privacy inquiries, audit questions, or data policy clarification, contact our development team:',
    devName: 'Jamil Rahman Ansari (Developer & Publisher)',
    devTeam: 'Miftah Tools Development Team',
    contactBtn: 'Contact Privacy Team',
  },
  ur: {
    backBtn: 'مفتاح ٹولز ہوم پر واپس جائیں',
    badge: 'گوگل پلے پالیسی اور پرائیویسی سے تصدیق شدہ',
    title: 'پرائیویسی پالیسی اور ڈیٹا کی حفاظت',
    meta: 'ایپ کا نام: مفتاح ٹولز | پیکیج: com.miftahtools.app | آخری تجدید: ستمبر 2026',
    highlightTitle: 'بنیادی پرائیویسی اصول: 100٪ آن-ڈیوائس لوکل پروسیسنگ',
    highlightDesc: 'مفتاح ٹولز (Miftah Tools) میں آپ کی پرائیویسی اور ڈیٹا کا تحفظ ہماری سب سے پہلی ترجیح ہے۔ جب آپ پی ڈی ایف کنورٹ کرتے ہیں، فائلیں جوڑتے ہیں، تصاویر کمپریس کرتے ہیں یا کوڈ فارمیٹ کرتے ہیں تو یہ تمام کام 100٪ آپ کے اپنے فون یا کمپیوٹر کے براؤزر میں ہوتا ہے۔ آپ کی کوئی بھی فائل یا تصویر کسی بھی بیرونی سرور پر اپلوڈ یا محفوظ نہیں کی جاتی۔',
    s1Title: '1. مفتاح ٹولز کا تعارف',
    s1Desc: 'مفتاح ٹولز ایک ہمہ جہت ڈیجیٹل یوٹیلیٹی اور تعلیمی پلیٹ فارم ہے جس میں 220 سے زائد کلائنٹ سائیڈ ٹولز (پی ڈی ایف، امیج اسٹوڈیو، کنورٹرز، ویڈیو و آڈیو ٹولز، کوڈنگ یوٹیلیٹیز اور کورسز) شامل ہیں۔ یہ پالیسی اینڈرائیڈ ایپ اور ویب دونوں پر لاگو ہوتی ہے۔',
    s2Title: '2. وہ ڈیٹا جو ہم کبھی جمع یا اسٹور نہیں کرتے',
    s2Items: [
      'زیرو ڈاکومنٹ ٹریکنگ: ہم آپ کی کسی بھی پی ڈی ایف، تصویر، ویڈیو یا ٹیکسٹ فائل کو نہ پڑھتے ہیں اور نہ کسی سرور پر بھیجتے ہیں۔',
      'زیرو لوکیشن ٹریکنگ: ہم آپ کی GPS لوکیشن یا جغرافیائی معلومات کبھی نہیں لیتے۔',
      'زیرو کانٹیکٹ و میڈیا اسکریپنگ: ہم آپ کے رابطوں، فون لاگز، پیغامات یا ذاتی گیلری کو کبھی ایکسیس نہیں کرتے۔',
      'زیرو ڈیٹا فروخت: ہم صارفین کا کوئی بھی ڈیٹا کسی تھرڈ پارٹی، اشتہاری کمپنی یا ڈیٹا بروکر کو فروخت نہیں کرتے۔',
    ],
    s3Title: '3. 100٪ بغیر لاگ ان اور بغیر رجسٹریشن',
    s3Intro: 'مفتاح ٹولز مکمل طور پر آزاد، مفت اور بغیر کسی اکاؤنٹ کے کام کرتا ہے۔ تمام 220+ ٹولز کے لیے:',
    s3Items: [
      'اکاؤنٹ کی کوئی ضرورت نہیں: نہ کوئی پاس ورڈ نہ کوئی لازمی ای میل۔',
      'کوئی ذاتی ٹریکنگ نہیں: نہ پروفائل بنانے کی ضرورت نہ سیشنز کی غیر ضروری نگرانی۔',
      '100٪ لوکل ڈیوائس اسٹوریج: آپ کے حالیہ ٹولز، بک مارکس اور ہسٹری صرف آپ کے فون میں محفوظ رہتے ہیں۔',
    ],
    s4Title: '4. اشتہارات کی پالیسی اور گوگل ایڈموب کا تحفظ',
    s4Intro: 'تمام 220+ ٹولز کو دنیا بھر کے تمام صارفین کے لیے ہمیشہ 100٪ مفت رکھنے کے لیے ایپ میں محفوظ گوگل ایڈموب اشتہارات دکھائے جاتے ہیں:',
    s4Items: [
      'ایپ اوپن ایڈز: ایپ کھلتے وقت مختصر وقت کے لیے واضح اسکیپ بٹن کے ساتھ۔',
      'نیچے بینر ایڈز: اسکرین کے نیچے غیر پریشان کن اور محفوظ بینر اشتہارات۔',
      'انٹرسٹیشل اور ریوارڈڈ ایڈز: کام مکمل ہونے کے بعد محفوظ وقفوں کے ساتھ۔',
      'ایڈموب پالیسی: تمام اشتہارات گوگل پلے فیملی پالیسی اور بچوں کے تحفظ کے معیار کے مطابق ہیں۔',
    ],
    s5Title: '5. ڈیوائس کی اجازتیں اور ان کی وجوہات',
    permCamera: '📷 کیمرے کی اجازت: صرف کیو آر کوڈ اور بارکوڈ اسکین کرتے وقت استعمال ہوتی ہے۔ لائیو فریم صرف ریم میں پروسیس ہوتے ہیں اور کہیں محفوظ نہیں ہوتے۔',
    permStorage: '📁 اسٹوریج اور میڈیا: صرف اس وقت استعمال ہوتی ہے جب آپ خود کوئی فائل یا تصویر پروسیسنگ کے لیے منتخب کرتے ہیں۔',
    permInternet: '🌐 انٹرنیٹ کنکشن: صرف ایڈموب اشتہارات دکھانے اور ٹول ڈاکومنٹیشن لوڈ کرنے کے لیے درکار ہے۔',
    permScoped: '🔒 اسکوپڈ اسٹوریج: اینڈرائیڈ 14 اور 15 کے سیکیورٹی قوانین کے مطابق، ایپ آپ کی منتخب فائل کے علاوہ کسی دوسری فائل تک رسائی حاصل نہیں کر سکتی۔',
    s6Title: '6. ڈیٹا کی حفاظت اور لوکل کیش ڈیلیٹ کرنے کی پالیسی',
    s6Intro: 'چونکہ مفتاح ٹولز سرورز پر کوئی صارف ڈیٹا نہیں رکھتا، اس لیے آپ اپنے ڈیوائس کے لوکل ڈیٹا پر مکمل اور فوری کنٹرول رکھتے ہیں:',
    methodATitle: 'طریقہ A: ایپ کے اندر سے 1-کلک ڈیٹا ڈیلیٹ',
    methodADesc: 'آپ سیٹنگز > "Clear Cache & History" یا پرائیویسی سینٹر میں جا کر ایک کلک سے تمام ہسٹری اور محفوظ ڈیٹا ختم کر سکتے ہیں۔',
    methodBTitle: 'طریقہ B: ڈویلپر سے براہ راست سپورٹ',
    methodBDesc: 'پرائیویسی سے متعلق کسی بھی سوال کے لیے ہمارے ڈویلپر کو براہ راست ای میل کریں: jrahmanansari132@gmail.com۔ ہم 24 گھنٹے میں جواب دیتے ہیں۔',
    s6ZeroCloud: '100٪ زیرو کلاؤڈ گارنٹی: ایپ کو ان انسٹال کرنے سے تمام لوکل فائلز اور کیش آپ کے فون سے فوری اور مکمل طور پر ختم ہو جاتی ہے۔',
    s7Title: '7. بچوں کی پرائیویسی (COPPA و GDPR-K پالیسی)',
    s7Desc: 'مفتاح ٹولز عام افادیت اور تکنیکی تعلیم کے لیے ہے۔ ہم 13 سال سے کم عمر بچوں سے کوئی ذاتی معلومات دانستہ طور پر جمع نہیں کرتے۔',
    s8Title: '8. سیکیورٹی اور انکرپشن کے معیارات',
    s8Desc: 'تمام نیٹ ورک ٹریفک جدید TLS 1.3 انکرپشن سے محفوظ ہے۔ کلائنٹ پیکیج میں کوئی حساس پرائیویٹ کیز شامل نہیں کی گئی ہیں۔',
    dpoTitle: 'ڈویلپر اور ڈیٹا پروٹیکشن آفیسر سے رابطہ',
    dpoDesc: 'پرائیویسی سے متعلق کسی بھی سوال یا رہنمائی کے لیے ہماری ٹیم سے رابطہ کریں:',
    devName: 'جمیل الرحمن انصاری (ڈویلپر و پبلشر)',
    devTeam: 'مفتاح ٹولز ڈیولپمنٹ ٹیم',
    contactBtn: 'پرائیویسی ٹیم سے رابطہ کریں',
  },
  ar: {
    backBtn: 'العودة للرئيسية',
    badge: 'معتمد وموثق وفق سياسات Google Play للخصوصية',
    title: 'سياسة الخصوصية وأمان البيانات',
    meta: 'اسم التطبيق: Miftah Tools | الحزمة: com.miftahtools.app | آخر تحديث: سبتمبر 2026',
    highlightTitle: 'المبدأ الأساسي للخصوصية: معالجة محلية 100٪ داخل جهازك',
    highlightDesc: 'في منصة مفتاح تولز (Miftah Tools)، خصوصيتك وأمان بياناتك هما أولويتنا القصوى. عند تحويل ملفات PDF، دمج الملفات، ضغط الصور، إنشاء رموز QR أو تنسيق الأكواد، تتم جميع العمليات بنسبة 100٪ داخل ذاكرة هاتفك أو متصفحك. لا يتم رفع أو حفظ أي ملف أو صورة أو مستند على أي خادم خارجي على الإطلاق.',
    s1Title: '1. نبذة عن منصة وتطبيق مفتاح تولز',
    s1Desc: 'تطبيق مفتاح تولز هو منظومة أدوات رقمية وتعليمية شاملة تحتوي على أكثر من 220 أداة محلية (PDF، استوديو الصور، المحولات، أدوات الصوت والفيديو، البرمجة والدورات التعليمية). تنطبق هذه السياسة على تطبيق أندرويد وموقع الويب.',
    s2Title: '2. البيانات التي لا نقوم بجمعها أو تخزينها أبداً',
    s2Items: [
      'انعدام تتبع المستندات: لا نقرأ أو ننقل أو نخزن أي ملف PDF أو صورة أو فيديو على أي خادم خارجي.',
      'انعدام تتبع الموقع الجغرافي: لا نصل أبداً إلى إحداثيات GPS أو موقعك الجغرافي.',
      'انعدام الوصول للأسماء والرسائل: لا نطلب الوصول لجهات الاتصال أو سجل المكالمات أو الرسائل الخاصة.',
      'انعدام بيع البيانات: لا نقوم ببيع أو تأجير أي بيانات مستخدم لأي طرف ثالث أو وسطاء بيانات.',
    ],
    s3Title: '3. استخدام مجاني 100٪ دون تسجيل أو تسجيل دخول',
    s3Intro: 'يعمل مفتاح تولز بشكل مفتوح ومجاني تماماً دون إلزامك بإنشاء حساب أو تسجيل دخول. لجميع الأدوات الـ 220+:',
    s3Items: [
      'لا يلزم حساب: لا حاجة لكلمات مرور أو بطاقات ائتمان أو بريد إلكتروني إجباري.',
      'لا تتبع للمستخدم: لا يتم إنشاء ملفات تعريف أو تتبع جلساتك.',
      'تخزين محلي 100٪ على جهازك: تظل أدواتك الأخيرة والمفضلة وسجل التنزيلات داخل هاتفك فقط.',
    ],
    s4Title: '4. سياسة الإعلانات والتوافق مع معايير Google AdMob',
    s4Intro: 'للحفاظ على مجانية كافة الأدوات الـ 220+ لجميع المستخدمين، يعرض التطبيق إعلانات آمنة ومطابقة لمعايير Google AdMob:',
    s4Items: [
      'إعلانات فتح التطبيق (App Open): تظهر لوقت قصير عند بدء التطبيق مع زر تخطي واضح.',
      'إعلانات البانر السفلية: إعلانات بانر هادئة وغير مزعجة أسفل الشاشات غير الحساسة.',
      'الإعلانات البينية والمكافآت: تظهر بفواصل زمنية آمنة بعد إتمام المهام.',
      'توافق AdMob: تخضع جميع الإعلانات بدقة لسياسات Google Play لحماية العائلة والأطفال.',
    ],
    s5Title: '5. أذونات الجهاز ومبرراتها الصارمة',
    permCamera: '📷 إذن الكاميرا: يُستخدم حصرياً عند مسح رموز QR والباركود، وتعالج الصور في الذاكرة الحية فوراً دون حفظ.',
    permStorage: '📁 إذن التخزين والوسائط: يُستخدم فقط عندما تختار ملفاً أو صورة بنفسك للمعالجة أو التحويل.',
    permInternet: '🌐 حالة الإنترنت: مطلوبة فقط لعرض إعلانات AdMob وتحميل وثائق الأدوات.',
    permScoped: '🔒 توافق Scoped Storage: متوافق تماماً مع معايير أندرويد 14 و 15، لا يمكن للتطبيق الوصول لأي ملف خارج اختيارك الصريح.',
    s6Title: '6. أمان البيانات والحذف الفوري للذاكرة المؤقتة',
    s6Intro: 'نظراً لأننا لا نحتفظ بقواعد بيانات للمستخدمين على خوادم، فإنك تتمتع بالتحكم الكامل والمطلق في بياناتك المخزنة محلياً:',
    methodATitle: 'الطريقة أ: حذف البيانات بضغطة زر واحدة داخل التطبيق',
    methodADesc: 'يمكنك مسح السجل المحلي والملفات المؤقتة فوراً من خلال الإعدادات > "Clear Cache & History" أو من مركز الخصوصية.',
    methodBTitle: 'الطريقة ب: التواصل المباشر مع المطور',
    methodBDesc: 'لأي استفسار بخصوص الأمان والخصوصية، يمكنك مراسلة المطور مباشرة على: jrahmanansari132@gmail.com والرد خلال 24 ساعة.',
    s6ZeroCloud: 'ضمان انعدام التخزين السحابي: عند إلغاء تثبيت التطبيق، يتم حذف كافة الملفات المؤقتة والبيانات تماماً من جهازك.',
    s7Title: '7. خصوصية الأطفال (التوافق مع COPPA و GDPR-K)',
    s7Desc: 'تم تصميم التطبيق للأغراض التعليمية والأدوات العامة. نحن لا نجمع أي معلومات تعريف شخصية من الأطفال دون سن 13 عاماً.',
    s8Title: '8. معايير الأمان والتشفير',
    s8Desc: 'تتم كافة الاتصالات الشبكية المشروعة عبر تشفير TLS 1.3 المتطور. التطبيق خالٍ من أي مفاتيح سرية غير آمنة.',
    dpoTitle: 'بيانات التواصل مع مسؤول حماية البيانات والمطور',
    dpoDesc: 'لأي استفسارات قانونية أو فنية تتعلق بسياسة الخصوصية:',
    devName: 'جميل الرحمن أنصاري (المطور والناشر)',
    devTeam: 'فريق تطوير مفتاح تولز',
    contactBtn: 'التواصل مع فريق الخصوصية',
  },
  hi: {
    backBtn: 'मिफ्ताह टूल्स होम पर वापस जाएं',
    badge: 'गूगल प्ले पॉलिसी व गोपनीयता प्रमाणित',
    title: 'गोपनीयता नीति और डेटा सुरक्षा (Privacy Policy)',
    meta: 'ऐप नाम: Miftah Tools | पैकेज: com.miftahtools.app | अंतिम अपडेट: सितंबर 2026',
    highlightTitle: 'बुनियादी प्राइवेसी नीति: 100% ऑन-डिवाइस लोकल प्रोसेसिंग',
    highlightDesc: 'मिफ्ताह टूल्स (Miftah Tools) में आपकी प्राइवेसी और सुरक्षा हमारी सर्वोच्च प्राथमिकता है। जब आप PDF कन्वर्ट करते हैं, फाइल मर्ज करते हैं, फोटो कंप्रेस करते हैं, QR कोड बनाते हैं या कोड फॉर्मेट करते हैं, तो यह सारा काम 100% आपके अपने फोन/कंप्यूटर के ब्राउज़र मेमोरी में ही होता है। आपकी कोई भी फाइल, फोटो या डॉक्यूमेंट किसी भी बाहरी सर्वर पर अपलोड या सेव नहीं होती है।',
    s1Title: '1. मिफ्ताह टूल्स का परिचय',
    s1Desc: 'मिफ्ताह टूल्स एक संपूर्ण ऑल-इन-वन डिजिटल यूटिलिटी और लर्निंग प्लेटफॉर्म है जिसमें 220+ क्लाइंट-साइड टूल्स (PDF टूल्स, इमेज स्टूडियो, कन्वर्टर्स, ऑडियो/वीडियो टूल्स, कोडिंग यूटिलिटीज और स्किल्स कोर्सेज) शामिल हैं। यह प्राइवेसी पॉलिसी एंड्रॉइड ऐप और वेब ऐप दोनों पर लागू होती है।',
    s2Title: '2. डेटा जो हम कभी भी एकत्र या स्टोर नहीं करते',
    s2Items: [
      'Zero Document Tracking: आपकी किसी भी PDF, फोटो, वीडियो, ऑडियो या टेक्स्ट फाइल को हम न तो पढ़ते हैं, न ही किसी सर्वर पर भेजते हैं।',
      'Zero Location Tracking: हम आपकी GPS लोकेशन या भौगोलिक स्थान की जानकारी कभी नहीं लेते।',
      'Zero Contact / Media Scraping: हम आपकी कांटेक्ट लिस्ट, कॉल लॉग्स, मैसेज या निजी फोटो गैलरी को कभी एक्सेस नहीं करते।',
      'Zero Data Selling: हम यूजर का कोई भी डेटा किसी थर्ड-पार्टी, विज्ञापन कंपनी या डेटा ब्रोकर को कभी नहीं बेचते।',
    ],
    s3Title: '3. 100% लॉगिन-मुक्त और बिना रजिस्ट्रेशन',
    s3Intro: 'मिफ्ताह टूल्स पूरी तरह से खुला, मुफ़्त और बिना किसी अकाउंट या लॉगिन के काम करता है। सभी 220+ टूल्स के लिए:',
    s3Items: [
      'खाता बनाने की कोई आवश्यकता नहीं: न कोई पासवर्ड, न कोई अनिवार्य ईमेल।',
      'कोई व्यक्तिगत ट्रैकिंग नहीं: न कोई प्रोफाइल निर्माण और न कोई गुप्त टेलीमेट्री।',
      '100% लोकल डिवाइस स्टोरेज: आपके हालिया टूल्स, पसंदीदा टूल्स और डाउनलोड हिस्ट्री केवल आपके अपने फोन के लोकल कैश में सुरक्षित रहते हैं।',
    ],
    s4Title: '4. विज्ञापन नीति और Google AdMob अनुपालन',
    s4Intro: 'सभी 220+ टूल्स को सभी यूज़र्स के लिए हमेशा 100% मुफ़्त रखने हेतु ऐप में Google AdMob द्वारा सुरक्षित विज्ञापन दिखाए जाते हैं:',
    s4Items: [
      'App Open Ad: ऐप खुलते समय 5 सेकंड के टाइमर और स्किप बटन के साथ।',
      'Bottom Banner Ad: स्क्रीन के नीचे गैर-बाधक और सुरक्षित बैनर ऐड।',
      'Interstitial & Rewarded Ads: कार्य पूरा होने पर सुरक्षित अंतराल के साथ दिखने वाले विज्ञापन।',
      'AdMob Compliance: सभी विज्ञापन Google Play Family व बच्चों की सुरक्षा नीतियों के पूर्ण अनुकूल हैं।',
    ],
    s5Title: '5. डिवाइस परमिशन और उनकी स्पष्ट आवश्यकता',
    permCamera: '📷 कैमरा परमिशन: केवल QR कोड और बारकोड स्कैनिंग टूल्स के लिए इस्तेमाल होती है। फ्रेम्स मेमोरी में प्रोसेस होते हैं और कभी अपलोड नहीं होते।',
    permStorage: '📁 स्टोरेज / मीडिया एक्सेस: केवल तभी इस्तेमाल होती है जब आप खुद एडिटिंग, कंप्रेशन या कन्वर्जन के लिए फाइल चुनते हैं।',
    permInternet: '🌐 इंटरनेट व नेटवर्क स्टेट: केवल AdMob विज्ञापन और टूल डॉक्यूमेंटेशन लोड करने के लिए आवश्यक है।',
    permScoped: '🔒 Scoped Storage अनुपालन: एंड्रॉइड 14 व 15 की नीतियों के अनुसार ऐप आपके द्वारा चुनी गई फाइल के बाहर किसी अन्य डेटा को एक्सेस नहीं कर सकता।',
    s6Title: '6. डेटा सुरक्षा और स्थानीय डेटा डिलीट नीति',
    s6Intro: 'चूँकि मिफ्ताह टूल्स सर्वर पर कोई डेटाबेस नहीं रखता, इसलिए आपके स्थानीय डेटा पर आपका 100% पूर्ण नियंत्रण है:',
    methodATitle: 'विधि A: 1-क्लिक इन-ऐप डेटा डिलीट',
    methodADesc: 'आप Settings > "Clear Cache & History" या Privacy Center में जाकर तुरंत सारा ऑफलाइन इतिहास और कैश डेटा डिलीट कर सकते हैं।',
    methodBTitle: 'विधि B: डेवलपर से सीधा संपर्क',
    methodBDesc: 'प्राइवेसी संबंधी किसी भी प्रश्न के लिए हमारे डेवलपर को ईमेल करें: jrahmanansari132@gmail.com। हम 24 घंटों में उत्तर देते हैं।',
    s6ZeroCloud: '100% जीरो-क्लाउड गारंटी: ऐप को अनइंस्टॉल करते ही सभी ऐप-संबंधित फाइलें और कैश डेटा आपके डिवाइस से पूरी तरह स्वतः मिट जाता है।',
    s7Title: '7. बच्चों की गोपनीयता (COPPA व GDPR-K अनुपालन)',
    s7Desc: 'मिफ्ताह टूल्स सामान्य उपयोग और तकनीकी शिक्षा के लिए है। हम 13 वर्ष से कम आयु के बच्चों की व्यक्तिगत जानकारी जानबूझकर एकत्र नहीं करते हैं।',
    s8Title: '8. सुरक्षा व एन्क्रिप्शन मानक',
    s8Desc: 'सभी नेटवर्क संचार उद्योग-मानक TLS 1.3 एन्क्रिप्शन द्वारा सुरक्षित हैं। क्लाइंट APK में कोई संवेदनशील सीक्रेट की शामिल नहीं हैं।',
    dpoTitle: 'डेवलपर व डेटा सुरक्षा अधिकारी संपर्क',
    dpoDesc: 'प्राइवेसी प्रश्नों, डेटा डिलीशन या ऑडिट संबंधी प्रश्नों के लिए संपर्क करें:',
    devName: 'जमीलुर्रहमान अंसारी (डेवलपर व प्रकाशक)',
    devTeam: 'मिफ्ताह टूल्स डेवलपमेंट टीम',
    contactBtn: 'प्राइवेसी टीम से संपर्क करें',
  },
};

export default function PrivacyPage() {
  const { language } = useI18n();
  const loc = PRIVACY_LOCALES[language] || PRIVACY_LOCALES.en;

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-28">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 transition-all shadow-xs mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{loc.backBtn}</span>
          </Link>
          
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>{loc.badge}</span>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {loc.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {loc.meta}
          </p>
        </div>

        {/* Main Content Container */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          
          {/* Highlight Box: Core Zero-Server Privacy Principle */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/80 dark:border-emerald-800/80 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm sm:text-base">
              <Lock className="w-5 h-5 shrink-0" />
              <span>{loc.highlightTitle}</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-900/90 dark:text-emerald-300/90 leading-normal">
              {loc.highlightDesc}
            </p>
          </div>

          {/* Section 1: Overview */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-brand-600" />
              {loc.s1Title}
            </h2>
            <p>{loc.s1Desc}</p>
          </section>

          {/* Section 2: Data We Do NOT Collect */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-emerald-600" />
              {loc.s2Title}
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              {loc.s2Items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Section 3: 100% Login-Free & Registration-Free */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-brand-600" />
              {loc.s3Title}
            </h2>
            <p>{loc.s3Intro}</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              {loc.s3Items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Section 4: Advertising Policy */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-600" />
              {loc.s4Title}
            </h2>
            <p>{loc.s4Intro}</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              {loc.s4Items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Section 5: Device Permissions & Rationale */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-600" />
              {loc.s5Title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white text-xs">{loc.permCamera}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white text-xs">{loc.permStorage}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white text-xs">{loc.permInternet}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white text-xs">{loc.permScoped}</span>
              </div>
            </div>
          </section>

          {/* Section 6: Data Deletion & Local Cache Purge */}
          <section className="space-y-4 p-5 sm:p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
            <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-300 font-bold text-sm sm:text-base">
              <UserX className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{loc.s6Title}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {loc.s6Intro}
            </p>
            
            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {loc.methodATitle}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {loc.methodADesc}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-600" />
                  {loc.methodBTitle}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {loc.methodBDesc}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              {loc.s6ZeroCloud}
            </div>
          </section>

          {/* Section 7: Children's Privacy */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {loc.s7Title}
            </h2>
            <p>{loc.s7Desc}</p>
          </section>

          {/* Section 8: Security & Encryption */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-600" />
              {loc.s8Title}
            </h2>
            <p>{loc.s8Desc}</p>
          </section>

          {/* Section 9: Contact & Developer Info */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{loc.dpoTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {loc.dpoDesc}
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{loc.devName}</p>
                <p className="text-xs text-slate-500">{loc.devTeam}</p>
                <p className="text-xs font-mono text-brand-600 dark:text-brand-400 font-semibold mt-0.5">jrahmanansari132@gmail.com</p>
              </div>
              <a
                href="mailto:jrahmanansari132@gmail.com?subject=Privacy%20Inquiry%20-%20Miftah%20Tools"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{loc.contactBtn}</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

