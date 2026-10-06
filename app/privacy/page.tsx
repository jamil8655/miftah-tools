'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  CheckCircle2, 
  UserX, 
  ArrowLeft, 
  Server, 
  Camera, 
  FolderLock, 
  Mail, 
  Smartphone,
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
    s4Title: '4. Advertising & Telemetry (Web & Mobile App)',
    s4Intro: 'To keep all 220+ tools permanently 100% free for users worldwide, Miftah Tools uses standard advertising and analytics:',
    s4Items: [
      'Document Processing Isolation: 100% local in-browser / on-device. Your documents and photos are NEVER transmitted to ad networks or analytics.',
      'Website Data Practices: The website uses essential local storage for user preferences (dark mode, selected language), Google Analytics (GA4) for aggregate visitor metrics, and Google AdSense for web ads.',
      'Android Mobile App: The Android app uses Google Mobile Ads (AdMob) compliant with Google Play Families Policy for non-intrusive banner and interstitial ads.',
      'Third-Party Providers: Trusted services include Google AdMob, Google AdSense, Google Analytics 4, and Google Fonts.',
    ],
    s5Title: '5. Device Permissions & Strict Rationale',
    permCamera: '📷 Camera Permission: Used exclusively when scanning QR & Barcodes. Frames are processed live in memory and never recorded or uploaded.',
    permStorage: '📁 Storage & Media: Used exclusively when you explicitly select files or images for local compression, conversion, or editing.',
    permInternet: '🌐 Internet State: Required solely for Google AdMob/AdSense ad delivery, analytics, and web assets.',
    permScoped: '🔒 Scoped Storage: Complies with Android 14 & 15 Scoped Storage rules. The app cannot access files outside your explicit selection.',
    s6Title: '6. Data Safety & Instant Local Cache Deletion',
    s6Intro: 'Since Miftah Tools does not maintain user databases on servers, you have immediate and permanent control over all local data:',
    methodATitle: 'Method A: 1-Tap In-App Data Purge',
    methodADesc: 'You can purge all cached history, recent tools, and offline assets instantly in Settings > "Clear Cache & History" or in the Privacy Center.',
    methodBTitle: 'Method B: Direct Support & Verification',
    methodBDesc: 'If you have any questions regarding privacy or data verification, email our support team directly at support@miftahtools.com. We reply within 24 hours.',
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
    s4Title: '4. اشتہارات اور اینالیٹکس کی پالیسی (ویب و موبائل ایپ)',
    s4Intro: 'تمام 220+ ٹولز کو دنیا بھر کے تمام صارفین کے لیے ہمیشہ 100٪ مفت رکھنے کے لیے پلیٹ فارم پر محفوظ اشتہارات دکھائے جاتے ہیں:',
    s4Items: [
      'دستاویزات کی پروسیسنگ: 100٪ لوکل براؤزر میموری میں ہوتی ہے۔ آپ کی فائلیں کبھی کسی اشتہاری سروس کو نہیں بھیجی جاتیں۔',
      'ویب سائٹ ڈیٹا: ویب براؤزر میں صارف کی ترجیحات (تھیم، زبان) اور گمنام ٹریفک کے لیے Google Analytics اور Google AdSense استعمال ہوتا ہے۔',
      'اینڈرائیڈ موبائل ایپ: موبائل ایپ میں Google AdMob کے محفوظ اور فیملی فرینڈلی اشتہارات دکھائے جاتے ہیں۔',
      'تھرڈ پارٹیز: Google AdMob, Google AdSense, Google Analytics 4, اور Google Fonts۔',
    ],
    s5Title: '5. ڈیوائس کی اجازتیں اور ان کی وجوہات',
    permCamera: '📷 کیمرے کی اجازت: صرف کیو آر کوڈ اور بارکوڈ اسکین کرتے وقت استعمال ہوتی ہے۔ لائیو فریم صرف ریم میں پروسیس ہوتے ہیں اور کہیں محفوظ نہیں ہوتے۔',
    permStorage: '📁 اسٹوریج اور میڈیا: صرف اس وقت استعمال ہوتی ہے جب آپ خود کوئی فائل یا تصویر پروسیسنگ کے لیے منتخب کرتے ہیں۔',
    permInternet: '🌐 انٹرنیٹ کنکشن: صرف اشتہارات دکھانے اور ٹول ڈاکومنٹیشن لوڈ کرنے کے لیے درکار ہے۔',
    permScoped: '🔒 اسکوپڈ اسٹوریج: اینڈرائیڈ 14 اور 15 کے سیکیورٹی قوانین کے مطابق، ایپ آپ کی منتخب فائل کے علاوہ کسی دوسری فائل تک رسائی حاصل نہیں کر سکتی۔',
    s6Title: '6. ڈیٹا کی حفاظت اور لوکل کیش ڈیلیٹ کرنے کی پالیسی',
    s6Intro: 'چونکہ مفتاح ٹولز سرورز پر کوئی صارف ڈیٹا نہیں رکھتا، اس لیے آپ اپنے ڈیوائس کے لوکل ڈیٹا پر مکمل اور فوری کنٹرول رکھتے ہیں:',
    methodATitle: 'طریقہ A: ایپ کے اندر سے 1-کلک ڈیٹا ڈیلیٹ',
    methodADesc: 'آپ سیٹنگز > "Clear Cache & History" یا پرائیویسی سینٹر میں جا کر ایک کلک سے تمام ہسٹری اور محفوظ ڈیٹا ختم کر سکتے ہیں۔',
    methodBTitle: 'طریقہ B: سپورٹ ٹیم سے رابطہ',
    methodBDesc: 'پرائیویسی سے متعلق کسی بھی سوال کے لیے ہماری ٹیم کو براہ راست ای میل کریں: support@miftahtools.com۔ ہم 24 گھنٹے میں جواب دیتے ہیں۔',
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
      'عدم تتبع المستندات: لا نقوم بقراءة أو نقل أو حفظ ملفاتك على أي خادم سحابي.',
      'عدم تتبع الموقع الجغرافي: لا نصل إطلاقاً إلى إحداثيات GPS أو موقعك.',
      'عدم فحص جهات الاتصال أو المعرض: لا نصل لسجل المكالمات أو الرسائل أو جهات الاتصال.',
      'عدم بيع البيانات: لا نقوم ببيع أو تأجير بيانات المستخدمين لأي طرف ثالث.',
    ],
    s3Title: '3. وصول مجاني بنسبة 100٪ دون تسجيل',
    s3Intro: 'منصة مفتاح تولز مفتوحة ومجانية تماماً لجميع الأدوات دون الحاجة لحسابات إجبارية:',
    s3Items: [
      'لا يلزم وجود حساب: لا توجد كلمات مرور أو بطاقات ائتمان إجبارية.',
      'لا يوجد تتبع شخصي: لا نقوم بإنشاء ملفات شخصية للمستخدمين.',
      'تخزين محلي 100٪: تظل الأدوات المفضلة والسجل محفوظة على جهازك فقط.',
    ],
    s4Title: '4. سياسة الإعلانات والتحليلات (الويب والتطبيق)',
    s4Intro: 'للحفاظ على مجانية الأدوات لكافة المستخدمين، نستخدم إعلانات وتحليلات قياسية آمنة:',
    s4Items: [
      'عزل المستندات: تتم المعالجة محلياً داخل المتصفح، ولا ترسل الملفات لشبكات الإعلانات.',
      'موقع الويب: يستخدم التخزين المحلي لتفضيلات المستخدم (المظهر واللغة)، مع Google Analytics و Google AdSense.',
      'تطبيق أندرويد: يستخدم إعلانات Google AdMob المتوافقة مع سياسات عائلة Google Play.',
      'الجهات الخارجية: Google AdMob و Google AdSense و Google Analytics 4 و Google Fonts.',
    ],
    s5Title: '5. أذونات الجهاز وأسباب طلبها',
    permCamera: '📷 إذن الكاميرا: يُطلب حصرياً لمسح رموز QR والباركود، وتتم المعالجة في الذاكرة دون تخزين.',
    permStorage: '📁 إذن التخزين: يُستخدم فقط عند تحديدك للملفات المراد معالجتها أو تحويلها محلياً.',
    permInternet: '🌐 الاتصال بالإنترنت: مخصص فقط لعرض الإعلانات وتحميل أصول الويب والتوثيق.',
    permScoped: '🔒 التخزين المحدد (Scoped Storage): متوافق مع Android 14 و 15 لمنع الوصول لملفاتك الأخرى.',
    s6Title: '6. أمان البيانات والحذف الفوري للذاكرة المؤقتة',
    s6Intro: 'بما أننا لا نحتفظ بقواعد بيانات سحابية، فإنك تملك السيطرة الكاملة على بياناتك المحلية:',
    methodATitle: 'الطريقة الأولى: مسح البيانات بضغطة زر',
    methodADesc: 'يمكنك مسح السجل والذاكرة المؤقتة فوراً من الإعدادات > "مسح الذاكرة المؤقتة والسجل".',
    methodBTitle: 'الطريقة الثانية: التواصل مع فريق الدعم',
    methodBDesc: 'لأي استفسارات حول الخصوصية، يرجى مراسلة فريق الدعم عبر: support@miftahtools.com. نرد خلال 24 ساعة.',
    s6ZeroCloud: 'ضمان الحذف التام: يؤدي إلغاء تثبيت التطبيق إلى إزالة كافة ملفاته والذاكرة المؤقتة من جهازك فوراً.',
    s7Title: '7. خصوصية الأطفال (توافق COPPA و GDPR-K)',
    s7Desc: 'تم تصميم منصة مفتاح تولز للاستخدام العام والتعليمي، ولا نجمع معلومات من الأطفال دون 13 عاماً.',
    s8Title: '8. معايير الأمان والتشفير',
    s8Desc: 'تستخدم جميع الاتصالات تشفير TLS 1.3 المتطور، ولا توجد أي مفاتيح سرية في التطبيق.',
    dpoTitle: 'التواصل مع مسؤول حماية البيانات',
    dpoDesc: 'لأي استفسارات حول سياسة البيانات أو الخصوصية، يرجى التواصل مع فريق التطوير:',
    devName: 'جميل الرحمن أنصاري (المطور والناشر)',
    devTeam: 'فريق تطوير منصة مفتاح تولز',
    contactBtn: 'تواصل مع فريق الخصوصية',
  },
  hi: {
    backBtn: 'मिफ्ताह टूल्स होम पर वापस जाएं',
    badge: 'Google Play नीति व गोपनीयता प्रमाणित',
    title: 'गोपनीयता नीति व डेटा सुरक्षा',
    meta: 'ऐप नाम: Miftah Tools | पैकेज: com.miftahtools.app | अंतिम अपडेट: सितंबर 2026',
    highlightTitle: 'मूल गोपनीयता सिद्धांत: 100% ऑन-डिवाइस लोकल प्रोसेसिंग',
    highlightDesc: 'मिफ्ताह टूल्स (Miftah Tools) में आपकी गोपनीयता और डेटा सुरक्षा हमारी सर्वोच्च प्राथमिकता है। जब आप PDF कन्वर्ट करते हैं, फाइलें जोड़ते हैं, फोटो कंप्रेस करते हैं या कोड फॉर्मेट करते हैं, तो यह सभी कार्य 100% आपके फोन या कंप्यूटर ब्राउज़र में होता है। आपकी फाइलें कभी भी किसी बाहरी सर्वर पर अपलोड या स्टोर नहीं की जाती हैं।',
    s1Title: '1. मिफ्ताह टूल्स का परिचय',
    s1Desc: 'मिफ्ताह टूल्स एक ऑल-इन-वन डिजिटल यूटिलिटी और लर्निंग प्लेटफॉर्म है जिसमें 220+ क्लाइंट-साइड टूल्स शामिल हैं। यह नीति एंड्रॉइड ऐप और वेब एप्लिकेशन दोनों पर लागू होती है।',
    s2Title: '2. डेटा जो हम कभी एकत्र या स्टोर नहीं करते',
    s2Items: [
      'ज़ीरो डॉक्यूमेंट ट्रैकिंग: हम आपकी PDF, फोटो, वीडियो या टेक्स्ट फाइलों को किसी बाहरी सर्वर पर नहीं भेजते।',
      'ज़ीरो लोकेशन ट्रैकिंग: हम आपकी GPS लोकेशन कभी एक्सेस या लॉग नहीं करते।',
      'ज़ीरो कॉन्टैक्ट व मीडिया स्क्रैपिंग: हम आपके संपर्कों, कॉल लॉग या गैलरी को एक्सेस नहीं करते।',
      'ज़ीरो डेटा बिक्री: हम उपयोगकर्ता डेटा किसी तीसरे पक्ष या विज्ञापनदाता को कभी नहीं बेचते।',
    ],
    s3Title: '3. 100% लॉगिन व पंजीकरण मुक्त पहुंच',
    s3Intro: 'मिफ्ताह टूल्स बिना किसी अनिवार्य खाते या लॉगिन के पूरी तरह खुला और मुफ़्त है:',
    s3Items: [
      'किसी खाते की आवश्यकता नहीं: कोई पासवर्ड या क्रेडिट कार्ड नहीं।',
      'कोई व्यक्तिगत ट्रैकिंग नहीं: कोई व्यक्तिगत प्रोफ़ाइल निर्माण नहीं।',
      '100% लोकल डिवाइस स्टोरेज: आपके बुकमार्क और कन्वर्शन इतिहास केवल आपके डिवाइस में सुरक्षित रहते हैं।',
    ],
    s4Title: '4. विज्ञापन व एनालिटिक्स नीति (वेब व मोबाइल ऐप)',
    s4Intro: 'सभी 220+ टूल्स को मुफ़्त बनाए रखने के लिए गैर-दखल देने वाले विज्ञापन व एनालिटिक्स उपयोग किए जाते हैं:',
    s4Items: [
      'दस्तावेज़ सुरक्षा: फाइलों की प्रोसेसिंग शत-प्रतिशत आपके डिवाइस में होती है, फाइलें कभी विज्ञापनों को नहीं भेजी जातीं।',
      'वेबसाइट डेटा: वेबसाइट उपयोगकर्ता प्राथमिकताओं (थीम, भाषा) के लिए लोकल स्टोरेज, Google Analytics 4 और Google AdSense का उपयोग करती है।',
      'एंड्रॉइड ऐप: मोबाइल ऐप Google Play परिवार नीति के अनुरूप Google AdMob विज्ञापनों का उपयोग करता है।',
      'तृतीय पक्ष सेवाएं: Google AdMob, Google AdSense, Google Analytics 4, और Google Fonts।',
    ],
    s5Title: '5. डिवाइस अनुमतियाँ और उनके कारण',
    permCamera: '📷 कैमरा अनुमति: विशेष रूप से QR कोड और बारकोड स्कैन करने के लिए उपयोग की जाती है।',
    permStorage: '📁 स्टोरेज व मीडिया: केवल तभी उपयोग की जाती है जब आप स्वयं प्रोसेसिंग के लिए फाइल चुनते हैं।',
    permInternet: '🌐 इंटरनेट स्थिति: विज्ञापनों और वेब दस्तावेज़ीकरण को लोड करने के लिए आवश्यक है।',
    permScoped: '🔒 स्कोप्ड स्टोरेज: एंड्रॉइड 14 व 15 नियमों के अनुरूप केवल चुनी गई फाइल तक पहुंच सीमित रखता है।',
    s6Title: '6. डेटा सुरक्षा व त्वरित लोकल कैश निष्कासन',
    s6Intro: 'चूंकि हम सर्वर पर कोई डेटाबेस नहीं रखते, आप अपने डिवाइस के डेटा पर पूर्ण नियंत्रण रखते हैं:',
    methodATitle: 'तरीका A: 1-टैप इन-ऐप डेटा साफ़ करें',
    methodADesc: 'आप सेटिंग्स > "Clear Cache & History" में जाकर तुरंत सारा कैश डेटा हटा सकते हैं।',
    methodBTitle: 'तरीका B: सपोर्ट टीम से सहायता',
    methodBDesc: 'गोपनीयता संबंधी किसी भी प्रश्न के लिए हमारी सपोर्ट टीम को सीधे ईमेल करें: support@miftahtools.com। हम 24 घंटों में उत्तर देते हैं।',
    s6ZeroCloud: '100% ज़ीरो-क्लाउड गारंटी: ऐप अनइंस्टॉल करने से सभी लोकल फाइल्स तुरंत फोन से हट जाती हैं।',
    s7Title: '7. बच्चों की गोपनीयता (COPPA व GDPR-K अनुपालन)',
    s7Desc: 'मिफ्ताह टूल्स सामान्य उपयोगिता के लिए है। हम 13 वर्ष से कम आयु के बच्चों से कोई व्यक्तिगत डेटा एकत्र नहीं करते।',
    s8Title: '8. सुरक्षा व एन्क्रिप्शन मानक',
    s8Desc: 'सभी नेटवर्क संचार TLS 1.3 एन्क्रिप्शन का उपयोग करते हैं।',
    dpoTitle: 'डेवलपर व डेटा सुरक्षा अधिकारी संपर्क',
    dpoDesc: 'गोपनीयता प्रश्नों के लिए हमारी विकास टीम से संपर्क करें:',
    devName: 'जमीलुर्रहमान अंसारी (डेवलपर व प्रकाशक)',
    devTeam: 'मिफ्ताह टूल्स डेवलपमेंट टीम',
    contactBtn: 'सपोर्ट टीम से संपर्क करें',
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
            <h2 className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-300 font-bold text-sm sm:text-base">
              <UserX className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{loc.s6Title}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {loc.s6Intro}
            </p>
            
            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {loc.methodATitle}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {loc.methodADesc}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-600" />
                  {loc.methodBTitle}
                </h3>
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
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{loc.dpoTitle}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {loc.dpoDesc}
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{loc.devName}</p>
                <p className="text-xs text-slate-500">{loc.devTeam}</p>
                <p className="text-xs font-mono text-brand-600 dark:text-brand-400 font-semibold mt-0.5">support@miftahtools.com</p>
              </div>
              <a
                href="mailto:support@miftahtools.com?subject=Privacy%20Inquiry%20-%20Miftah%20Tools"
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
