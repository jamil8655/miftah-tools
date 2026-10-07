'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Upload,
  Square,
  Copy,
  Check,
  Share2,
  Download,
  FileText,
  RotateCcw,
  Sparkles,
  Volume2,
  AlertCircle,
  Clock,
  Globe,
  FileAudio,
  Trash2,
  ShieldCheck,
  Cpu,
  Radio,
  AlignLeft,
  AlignRight,
  Languages,
  Zap,
  Wand2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { shareFileNative, isNativeAndroid } from '@/lib/native/android-bridge';
import {
  transcribeAudioWithWhisper,
  formatTranscription,
} from '@/lib/voice/whisper-engine';
import { Document, Paragraph, TextRun, Packer, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TextToSpeechController } from '@/lib/translator/text-to-speech';
import { autoCorrectSpokenText } from '@/lib/translator/auto-correct';
import { SpeechRecognitionController, deduplicateSentenceStream } from '@/lib/translator/speech-recognition';

export const TOP_FLAGSHIP_LANGS = [
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

const LANGUAGES = [
  { code: 'ur', label: 'Urdu', flag: '🇵🇰', bcp47: 'ur-IN' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳', bcp47: 'hi-IN' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦', bcp47: 'ar-SA' },
  { code: 'en', label: 'English', flag: '🇺🇸', bcp47: 'en-US' },
  { code: 'bn', label: 'Bengali', flag: '🇧🇩', bcp47: 'bn-BD' },
  { code: 'fa', label: 'Persian', flag: '🇮🇷', bcp47: 'fa-IR' },
  { code: 'tr', label: 'Turkish', flag: '🇹🇷', bcp47: 'tr-TR' },
  { code: 'fr', label: 'French', flag: '🇫🇷', bcp47: 'fr-FR' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', bcp47: 'es-ES' },
  { code: 'de', label: 'German', flag: '🇩🇪', bcp47: 'de-DE' },
  { code: 'pa', label: 'Punjabi', flag: '🇵🇰', bcp47: 'pa-PK' },
];

const LOCALES = {
  en: {
    badge: 'Real-Time Voice to Text Studio',
    title: 'Voice to Text & Audio Transcriber',
    subtitle: 'Speak into your microphone or upload audio files to convert speech into accurate, punctuated text instantly.',
    tabRecord: 'Live Voice Recording',
    tabUpload: 'Upload Audio File',
    langLabel: 'Spoken Language',
    engineLabel: 'Client-Side AI Engine',
    enginePrivate: '100% On-Device & Private',
    readyToRecord: 'Tap the microphone and start speaking...',
    listening: 'Listening to your voice...',
    btnStart: 'Tap to Speak (Start Recording)',
    btnStop: 'Stop & Finalize Text',
    liveInterimBadge: 'Live Stream:',
    dropAudio: 'Click or drop audio file here',
    dropAudioSub: 'Supports MP3, WAV, M4A, AAC, OGG, WEBM, FLAC (Up to 50 MB)',
    btnTranscribeFile: 'Transcribe Audio with AI',
    outputTitle: 'Transcribed Text',
    placeholder: 'Your spoken words will appear here in real-time as text...',
    btnCopy: 'Copy Text',
    btnCopied: 'Copied!',
    btnShare: 'Share',
    btnFormat: 'Auto-Format Paragraphs',
    btnClear: 'Clear',
    btnTxt: 'Text (.txt)',
    btnWord: 'Word (.docx)',
    btnPdf: 'PDF (.pdf)',
    wordsCount: 'words',
    charsCount: 'chars',
    feature1Title: '100% Private & Free',
    feature1Desc: 'Runs locally inside your device memory with zero cloud recording.',
    feature2Title: 'Multi-Dialect Support',
    feature2Desc: 'Highly optimized for Urdu, Arabic, Hindi, and English accents.',
    feature3Title: 'Smart Paragraphs',
    feature3Desc: 'Automatically detects speech pauses to format neat sentences.',
    micErrorPermission: 'Microphone permission was denied. Please allow microphone access in your browser or device settings.',
  },
  ur: {
    badge: 'ریئل ٹائم وائس ٹو ٹیکسٹ اسٹوڈیو',
    title: 'بول کر لکھیں اور آڈیو کنورٹ کریں',
    subtitle: 'مائیک میں بولیں یا آڈیو فائل اپلوڈ کریں اور فوراً درست اردو، عربی، ہندی اور انگلش ٹیکسٹ حاصل کریں۔',
    tabRecord: 'مائیک سے لائیو بولیں',
    tabUpload: 'آڈیو فائل اپلوڈ کریں',
    langLabel: 'بولنے کی زبان منتخب کریں',
    engineLabel: 'آن ڈیوائس انجن',
    enginePrivate: '100% محفوظ اور آف لائن',
    readyToRecord: 'مائیک کا بٹن دبائیں اور بولنا شروع کریں...',
    listening: 'آپ کی آواز سنی جا رہی ہے...',
    btnStart: 'بولنا شروع کریں (Start Speaking)',
    btnStop: 'روکیں اور ٹیکسٹ حاصل کریں',
    liveInterimBadge: 'لائیو آواز:',
    dropAudio: 'یہاں آڈیو فائل منتخب کریں یا ڈراپ کریں',
    dropAudioSub: 'MP3, WAV, M4A, AAC, OGG, WEBM فارمیٹس کی سپورٹ (50 MB تک)',
    btnTranscribeFile: 'فائل کو ٹیکسٹ میں تبدیل کریں',
    outputTitle: 'حاصل شدہ ٹیکسٹ',
    placeholder: 'آپ کے بولے گئے الفاظ یہاں خود بخود حقیقی وقت میں تحریر ہو جائیں گے...',
    btnCopy: 'کاپی کریں',
    btnCopied: 'کاپی ہو گیا!',
    btnShare: 'شیئر کریں',
    btnFormat: 'پیراگراف درست کریں',
    btnClear: 'صاف کریں',
    btnTxt: 'ٹیکسٹ (.txt)',
    btnWord: 'ورڈ (.docx)',
    btnPdf: 'پی ڈی ایف (.pdf)',
    wordsCount: 'الفاظ',
    charsCount: 'حروف',
    feature1Title: '100% پرائیویٹ اور محفوظ',
    feature1Desc: 'آپ کی آواز کبھی کسی سرور پر اپلوڈ نہیں ہوتی، سارا کام موبائل کے اندر ہوتا ہے۔',
    feature2Title: 'اردو، عربی اور ہندی سپورٹ',
    feature2Desc: 'اردو، عربی، ہندی اور انگریزی لہجوں کی درست شناخت کے ساتھ۔',
    feature3Title: 'خودکار پیراگراف اور وقفے',
    feature3Desc: 'آواز کے وقفوں کو خود بخود پہچان کر جملوں کو ترتیب دیتا ہے۔',
    micErrorPermission: 'مائیکروفون کی اجازت نہیں ملی۔ براہ کرم براؤزر یا ایپ سیٹنگز میں مائیک کی اجازت دیں۔',
  },
  ar: {
    badge: 'استوديو تحويل الصوت إلى نص فوري',
    title: 'تحويل الصوت والملفات الصوتية إلى نصوص',
    subtitle: 'تحدث في الميكروفون أو ارفع ملفاً صوتياً لتحويل الكلام إلى نصوص دقيقة ومنسقة في الحال.',
    tabRecord: 'تسجيل صوتي مباشر',
    tabUpload: 'رفع ملف صوتي',
    langLabel: 'لغة التحدث',
    engineLabel: 'محرك المعالجة المحلي',
    enginePrivate: '100% أمان وخصوصية محلية',
    readyToRecord: 'اضغط على الميكروفون وابدأ التحدث...',
    listening: 'جاري الاستماع لصوتك...',
    btnStart: 'ابدأ التحدث (تسجيل مباشر)',
    btnStop: 'إيقاف واستخراج النص',
    liveInterimBadge: 'البث المباشر:',
    dropAudio: 'اضغط هنا أو اسحب الملف الصوتي',
    dropAudioSub: 'يدعم MP3, WAV, M4A, AAC, OGG, WEBM (حتى 50 ميجابايت)',
    btnTranscribeFile: 'تحويل الصوت إلى نص بالذكاء الاصطناعي',
    outputTitle: 'النص المكتوب',
    placeholder: 'ستظهر الكلمات المنطوقة هنا تلقائياً في الوقت الفعلي...',
    btnCopy: 'نسخ النص',
    btnCopied: 'تم النسخ!',
    btnShare: 'مشاركة',
    btnFormat: 'تنسيق الفقرات',
    btnClear: 'مسح',
    btnTxt: 'نص (.txt)',
    btnWord: 'وورد (.docx)',
    btnPdf: 'ملف (.pdf)',
    wordsCount: 'كلمة',
    charsCount: 'حرف',
    feature1Title: 'خصوصية وأمان 100%',
    feature1Desc: 'تتم المعالجة بالكامل داخل جهازك دون إرسال التسجيل لأي خادم.',
    feature2Title: 'دعم اللهجات واللغات',
    feature2Desc: 'دعم متكامل للعربية والأردية والهندية والإنجليزية.',
    feature3Title: 'تنسيق تلقائي للفقرات',
    feature3Desc: 'التعرف على فترات الصمت لتنسيق الجمل والفقرات تلقائياً.',
    micErrorPermission: 'تم رفض إذن الميكروفون. يرجى تفعيل إذن الميكروفون من إعدادات المتصفح أو التطبيق.',
  },
  hi: {
    badge: 'रीयल-टाइम वॉयस टू टेक्स्ट स्टूडियो',
    title: 'बोलकर लिखें व ऑडियो टेक्स्ट में बदलें',
    subtitle: 'माइक में बोलें या ऑडियो फ़ाइल अपलोड करें और तुरंत सटीक टेक्स्ट प्राप्त करें।',
    tabRecord: 'लाइव वॉयस टाइपिंग',
    tabUpload: 'ऑडियो फ़ाइल अपलोड',
    langLabel: 'बोलने की भाषा',
    engineLabel: 'ऑन-डिवाइस इंजन',
    enginePrivate: '100% सुरक्षित और ऑफ़लाइन',
    readyToRecord: 'माइक बटन दबाएं और बोलना शुरू करें...',
    listening: 'आपकी आवाज़ सुनी जा रही है...',
    btnStart: 'बोलना शुरू करें (Start Speaking)',
    btnStop: 'रोकें और टेक्स्ट प्राप्त करें',
    liveInterimBadge: 'लाइव आवाज़:',
    dropAudio: 'ऑडियो फ़ाइल यहां चुनें या ड्रैग करें',
    dropAudioSub: 'MP3, WAV, M4A, AAC, OGG, WEBM फ़ाइलों का समर्थन (50 MB तक)',
    btnTranscribeFile: 'ऑडियो को टेक्स्ट में बदलें',
    outputTitle: 'रूपांतरित टेक्स्ट',
    placeholder: 'आपके बोले गए शब्द यहां अपने आप रीयल-टाइम में टाइप हो जाएंगे...',
    btnCopy: 'कॉपी करें',
    btnCopied: 'कॉपी हो गया!',
    btnShare: 'शेयर करें',
    btnFormat: 'पैराग्राफ ठीक करें',
    btnClear: 'साफ़ करें',
    btnTxt: 'टेक्स्ट (.txt)',
    btnWord: 'वर्ड (.docx)',
    btnPdf: 'पीडीएफ (.pdf)',
    wordsCount: 'शब्द',
    charsCount: 'अक्षर',
    feature1Title: '100% निजी व सुरक्षित',
    feature1Desc: 'आपकी आवाज़ कभी किसी सर्वर पर अपलोड नहीं होती, सब कुछ डिवाइस में प्रोसेस होता है।',
    feature2Title: 'हिंदी, उर्दू व अंग्रेजी सपोर्ट',
    feature2Desc: 'हिंदी, उर्दू, अरबी और अंग्रेजी लहजों की सटीक पहचान।',
    feature3Title: 'स्मार्ट पैराग्राफ',
    feature3Desc: 'आवाज़ के ठहराव को पहचानकर अपने आप पैराग्राफ बनाता है।',
    micErrorPermission: 'माइक्रोफ़ोन की अनुमति अस्वीकार कर दी गई। कृपया सेटिंग्स में माइक की अनुमति दें।',
  },
};

export function VoiceToTextStudio() {
  const { language: currentLang } = useI18n();
  const loc = LOCALES[currentLang as keyof typeof LOCALES] || LOCALES.ur;

  // Tabs: 'record' or 'upload'
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');
  const [selectedLang, setSelectedLang] = useState<string>(currentLang === 'en' ? 'en' : currentLang === 'ar' ? 'ar' : currentLang === 'hi' ? 'hi' : 'ur');
  const [autoCorrectEnabled, setAutoCorrectEnabled] = useState<boolean>(true);

  // Recording states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [liveInterim, setLiveInterim] = useState<string>('');

  // Uploaded audio state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedAudioDuration, setUploadedAudioDuration] = useState<number | null>(null);

  // Processing states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [transcription, setTranscription] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Audio & Speech Recognition Refs
  const recognitionControllerRef = useRef<SpeechRecognitionController | null>(null);
  const liveFinalBufferRef = useRef<string[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      cleanupRecordingResources();
    };
  }, []);

  const cleanupRecordingResources = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recognitionControllerRef.current) {
      try {
        recognitionControllerRef.current.stop();
      } catch (_) {}
      recognitionControllerRef.current = null;
    }
    if (typeof window !== 'undefined' && (window as any).AndroidSpeech) {
      try {
        (window as any).AndroidSpeech.stopListening();
      } catch (_) {}
    }
  };

  const getBcp47Lang = (langCode: string): string => {
    const found = LANGUAGES.find((l) => l.code === langCode);
    return found?.bcp47 || 'ur-PK';
  };

  const isQuestionSentence = (sentence: string, lang: string): boolean => {
    const s = sentence.trim();
    if (/[?؟]$/.test(s)) return true;
    if (lang === 'ur') {
      return /(^|\s)(کیا|کیسے|کیسا|کیسی|کیوں|کہاں|کب|کتنا|کتنے|کتنی|کون|کدھر|کس\s*طرح|خیریت\s*سے\s*ہیں|کیسے\s*ہو)(\s|$)/i.test(s);
    }
    if (lang === 'hi') {
      return /(^|\s)(क्या|कैसे|कैसा|कैसी|क्यों|कहाँ|कहा|कब|कितना|कितने|कितनी|कौन|किधर|किस\s*तरह)(\s|$)/i.test(s);
    }
    if (lang === 'ar') {
      return /(^|\s)(هل|ماذا|ما|لماذا|كيف|أين|متى|كم|من|أيهما)(\s|$)/i.test(s);
    }
    if (lang === 'en') {
      return /^(what|how|why|where|when|who|which|whose|whom|is|are|can|could|will|would|do|does|did|have|has)\b/i.test(s);
    }
    return false;
  };

  const applySmartPunctuationAndParagraphs = (sentences: string[], lang: string): string => {
    const deduplicated = deduplicateSentenceStream(sentences);
    if (deduplicated.length === 0) return '';
    const isRtl = lang === 'ur' || lang === 'ar';
    const lines: string[] = [];

    deduplicated.forEach((sentence) => {
      let s = sentence.trim();
      if (!s) return;

      if (autoCorrectEnabled) {
        s = autoCorrectSpokenText(s, lang);
      }

      if (!isRtl && lang !== 'hi') {
        s = s.charAt(0).toUpperCase() + s.slice(1);
      }

      const isQuestion = isQuestionSentence(s, lang);

      if (!/[.!?۔،।؟]$/.test(s)) {
        if (lang === 'ur') {
          s += isQuestion ? '؟' : '۔';
        } else if (lang === 'hi') {
          s += isQuestion ? '?' : '।';
        } else if (lang === 'ar') {
          s += isQuestion ? '؟' : '.';
        } else {
          s += isQuestion ? '?' : '.';
        }
      }

      lines.push(s);
    });

    // Each completed sentence / statement cleanly on a new line
    return lines.join('\n\n');
  };

  // Start Live Microphone Recording & Real-time Recognition
  const handleStartRecording = () => {
    setMicError(null);
    setErrorMessage(null);
    setLiveInterim('');
    setTranscription('');
    liveFinalBufferRef.current = [];

    // Prompt native runtime permissions on Android
    if (typeof window !== 'undefined' && (window as any).AndroidDownloader?.requestAppPermissions) {
      try {
        (window as any).AndroidDownloader.requestAppPermissions();
      } catch (_) {}
    }

    const bcp47 = getBcp47Lang(selectedLang);

    if (!SpeechRecognitionController.isSupported()) {
      setMicError(loc.micErrorPermission || 'Live speech recognition is not supported in this browser. Please use Google Chrome, Edge or Safari.');
      return;
    }

    if (recognitionControllerRef.current) {
      try {
        recognitionControllerRef.current.stop();
      } catch (_) {}
      recognitionControllerRef.current = null;
    }

    const controller = new SpeechRecognitionController({
      onTranscriptUpdate: (finals: string[], interim: string) => {
        liveFinalBufferRef.current = finals;
        const correctedFinals = finals.map((s) =>
          autoCorrectEnabled ? autoCorrectSpokenText(s, selectedLang) : s
        );
        const formatted = applySmartPunctuationAndParagraphs(correctedFinals, selectedLang);

        const processedInterim = interim.trim()
          ? (autoCorrectEnabled ? autoCorrectSpokenText(interim.trim(), selectedLang) : interim.trim())
          : '';

        setLiveInterim(processedInterim);

        if (formatted && processedInterim) {
          setTranscription(`${formatted}\n\n${processedInterim}`);
        } else if (formatted) {
          setTranscription(formatted);
        } else if (processedInterim) {
          setTranscription(processedInterim);
        } else {
          setTranscription('');
        }
      },
      onError: (errMsg: string) => {
        console.warn('Speech Recognition error:', errMsg);
        setMicError(errMsg);
      },
      onAudioLevel: (level: number) => {
        setAudioLevel(level);
      },
      onStateChange: (listening: boolean) => {
        setIsRecording(listening);
      },
    });

    recognitionControllerRef.current = controller;
    controller.start(bcp47);
    setIsRecording(true);
    setRecordingSeconds(0);
    triggerHaptic('medium');

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  // Stop Live Recording
  const handleStopRecording = () => {
    triggerHaptic('medium');
    setIsRecording(false);
    setLiveInterim('');
    setAudioLevel(0);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (recognitionControllerRef.current) {
      try {
        recognitionControllerRef.current.stop();
      } catch (_) {}
      recognitionControllerRef.current = null;
    }

    if (liveFinalBufferRef.current.length > 0) {
      const formatted = applySmartPunctuationAndParagraphs(
        liveFinalBufferRef.current,
        selectedLang
      );
      setTranscription(formatted);
      triggerHaptic('success');
    }
  };

  // Handle Audio File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setErrorMessage(null);
      setTranscription('');

      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        setUploadedAudioDuration(audio.duration);
      };
      triggerHaptic('selection');
    }
  };

  // Process Audio (Blob or File) with Whisper Engine
  const processAudioForTranscription = async (fileOrBlob: File | Blob) => {
    setIsProcessing(true);
    setProgressPercent(10);
    setProgressStatus('Transcribing speech with AI model...');
    setErrorMessage(null);
    triggerHaptic('medium');

    try {
      const result = await transcribeAudioWithWhisper(fileOrBlob, {
        language: selectedLang === 'auto' ? undefined : selectedLang,
        model: 'Xenova/whisper-tiny',
        onProgress: (percent, status) => {
          setProgressStatus(status);
          setProgressPercent(percent);
        },
      });

      setProgressPercent(100);
      setProgressStatus('Done!');

      if (!result.text || result.text.trim().length === 0) {
        setErrorMessage('No speech detected in the audio recording.');
      } else {
        const { formattedText } = formatTranscription(result.text, selectedLang);
        setTranscription(formattedText);
        triggerHaptic('success');
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMessage(err.message || 'An error occurred during audio transcription.');
      triggerHaptic('error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format Paragraphs
  const handleAutoFormatText = () => {
    if (!transcription) return;
    const lines = transcription.split(/\n+/).filter(Boolean);
    const reformatted = applySmartPunctuationAndParagraphs(lines, selectedLang);
    setTranscription(reformatted);
    triggerHaptic('light');
  };

  // Copy
  const handleCopy = async () => {
    if (!transcription) return;
    try {
      await navigator.clipboard.writeText(transcription);
      setCopied(true);
      triggerHaptic('light');
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Share
  const handleShare = async () => {
    if (!transcription) return;
    triggerHaptic('light');

    if (isNativeAndroid()) {
      await shareFileNative(transcription, 'voice_transcription.txt', 'text/plain');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Voice to Text — Miftah Tools',
          text: transcription,
        });
      } catch (_) {}
    } else {
      handleCopy();
    }
  };

  // Download TXT
  const handleDownloadTxt = () => {
    if (!transcription) return;
    const blob = new Blob([transcription], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `miftah_transcription_${Date.now()}.txt`);
    triggerHaptic('success');
  };

  // Download DOCX
  const handleDownloadDocx = async () => {
    if (!transcription) return;
    triggerHaptic('medium');

    const isRtl = selectedLang === 'ur' || selectedLang === 'ar';
    const paragraphs = transcription
      .split(/\r?\n+/)
      .filter((p) => p.trim())
      .map(
        (para) =>
          new Paragraph({
            children: [
              new TextRun({
                text: para.trim(),
                size: 26,
                font: isRtl ? 'Amiri' : 'Arial',
                rightToLeft: isRtl,
              }),
            ],
            spacing: { after: 180, line: 360 },
            bidirectional: isRtl,
            alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
          })
      );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: 'Miftah Tools — Voice to Text',
              heading: 'Heading1',
              spacing: { after: 240 },
            }),
            ...paragraphs,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `miftah_transcription_${Date.now()}.docx`);
  };

  // Download PDF (100% Unicode & RTL safe for Urdu, Hindi, Arabic, Bengali, English)
  const handleDownloadPdf = async () => {
    if (!transcription) return;
    triggerHaptic('medium');

    const isRtl = selectedLang === 'ur' || selectedLang === 'ar';
    const langLabel = LANGUAGES.find((l) => l.code === selectedLang)?.label || 'Transcription';

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px';
    container.style.minHeight = '1123px';
    container.style.padding = '48px 56px';
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#0f172a';
    container.style.fontFamily = isRtl
      ? "'Noto Nastaliq Urdu', 'Amiri', 'Segoe UI', Tahoma, Arial, sans-serif"
      : selectedLang === 'hi'
      ? "'Noto Sans Devanagari', 'Mangal', 'Segoe UI', Tahoma, Arial, sans-serif"
      : "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    container.style.direction = isRtl ? 'rtl' : 'ltr';
    container.style.boxSizing = 'border-box';

    const paragraphsHtml = transcription
      .split(/\r?\n+/)
      .filter((p) => p.trim())
      .map(
        (p) =>
          `<p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.85; text-align: ${
            isRtl ? 'right' : 'left'
          }; color: #1e293b;">${p.trim()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>')}</p>`
      )
      .join('');

    container.innerHTML = `
      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; direction: ltr;">
        <div>
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a;">Voice to Text Transcription</h1>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Language: <strong>${langLabel}</strong> • Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; font-weight: 700; color: #2563eb; background: #eff6ff; padding: 4px 10px; border-radius: 9999px; border: 1px solid #bfdbfe;">Miftah Tools</span>
        </div>
      </div>
      <div style="direction: ${isRtl ? 'rtl' : 'ltr'};">
        ${paragraphsHtml}
      </div>
      <div style="border-top: 1px solid #f1f5f9; margin-top: 36px; padding-top: 12px; text-align: center; font-size: 10px; color: #94a3b8; direction: ltr;">
        Generated via Miftah Tools (miftahtools.com/voice-to-text) • 100% Private & Free
      </div>
    `;

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`miftah_transcription_${Date.now()}.pdf`);
      triggerHaptic('success');
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isRtlLang = selectedLang === 'ur' || selectedLang === 'ar';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* 1. Header Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-7 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/25 shrink-0">
              <Mic className={`w-7 h-7 text-white ${isRecording ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {loc.title}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                  {loc.enginePrivate}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-2 leading-relaxed">
                {loc.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Spoken Language Selector & Auto-Correct Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col gap-3.5">
          {/* Top 4 Flagship Languages + Auto-Correct Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Languages className="w-4 h-4 text-brand-400" />
              <span>{loc.langLabel}:</span>
            </div>

            {/* Auto-Correct Toggle */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setAutoCorrectEnabled(!autoCorrectEnabled);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-sm ${
                autoCorrectEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Wand2 className={`w-3.5 h-3.5 ${autoCorrectEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{autoCorrectEnabled ? 'الفاظ کی خودکار درستگی: فعال (ON)' : 'خودکار درستگی: بند (OFF)'}</span>
              <span className={`w-2 h-2 rounded-full ${autoCorrectEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            </button>
          </div>

          {/* Quick-Pick 4 Flagship Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">بنیادی زبانیں:</span>
            {TOP_FLAGSHIP_LANGS.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedLang(lang.code);
                    if (isRecording && recognitionControllerRef.current) {
                      recognitionControllerRef.current.setLanguage(getBcp47Lang(lang.code));
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/30 ring-2 ring-brand-400/50 scale-[1.02]'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping ml-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Other Languages */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400">دیگر زبانیں:</span>
            {LANGUAGES.filter(l => !TOP_FLAGSHIP_LANGS.some(f => f.code === l.code)).map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedLang(lang.code);
                    if (isRecording && recognitionControllerRef.current) {
                      recognitionControllerRef.current.setLanguage(getBcp47Lang(lang.code));
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm ring-1 ring-brand-400'
                      : 'bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="truncate">{lang.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Mode Selector: Record vs Upload */}
      <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1.5 border border-slate-200 dark:border-slate-700/80">
        <button
          type="button"
          onClick={() => {
            setActiveTab('record');
            triggerHaptic('light');
          }}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'record'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>{loc.tabRecord}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('upload');
            triggerHaptic('light');
          }}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>{loc.tabUpload}</span>
        </button>
      </div>

      {/* 3. Main Interactive Workspace Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">{errorMessage}</div>
          </div>
        )}

        {micError && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">{micError}</div>
          </div>
        )}

        {/* TAB 1: Live Voice Recording */}
        {activeTab === 'record' && (
          <div className="flex flex-col items-center justify-center py-4 sm:py-6 space-y-6">
            {/* Visualizer Waveform Equalizer */}
            <div className="w-full max-w-md h-20 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden p-3 relative shadow-inner">
              {isRecording ? (
                <div className="flex items-center justify-center gap-1.5 w-full h-full px-2">
                  {Array.from({ length: 28 }).map((_, idx) => {
                    const factor = Math.sin((idx / 28) * Math.PI);
                    const barHeight = Math.max(16, Math.min(95, (audioLevel * factor * 1.5) + ((idx % 3) * 12)));
                    return (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-brand-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-100"
                        style={{ height: `${barHeight}%` }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                  <Mic className="w-4 h-4 text-slate-400" />
                  <span>{loc.readyToRecord}</span>
                </div>
              )}
            </div>

            {/* Live Interim Speech Badge */}
            {isRecording && liveInterim && (
              <div className="w-full max-w-lg px-4 py-2.5 rounded-2xl bg-brand-50/90 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 text-xs text-brand-700 dark:text-brand-300 flex items-center gap-2.5 animate-pulse font-semibold shadow-xs">
                <Radio className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="truncate">{loc.liveInterimBadge} "{liveInterim}"</span>
              </div>
            )}

            {/* Glowing Microphone Button & Timer */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-2 font-mono text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
                <div className={`w-3.5 h-3.5 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-300'}`} />
                <span>{formatSeconds(recordingSeconds)}</span>
              </div>

              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-brand-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Mic className="w-5 h-5" />
                  <span>{loc.btnStart}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-rose-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Square className="w-5 h-5" />
                  <span>{loc.btnStop}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Upload Audio File */}
        {activeTab === 'upload' && (
          <div className="py-2 space-y-5">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-500 rounded-3xl p-8 sm:p-10 text-center transition-all bg-slate-50/50 dark:bg-slate-800/30">
              <input
                type="file"
                id="voice-file-upload"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm,.flac"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="voice-file-upload"
                className="flex flex-col items-center justify-center cursor-pointer space-y-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-800 shadow-xs">
                  <FileAudio className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white block">
                    {uploadedFile ? uploadedFile.name : loc.dropAudio}
                  </span>
                  <span className="text-xs text-slate-400 mt-1 block">
                    {loc.dropAudioSub}
                  </span>
                </div>
              </label>
            </div>

            {uploadedFile && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800">
                <div className="flex items-center gap-3">
                  <FileAudio className="w-5 h-5 text-brand-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block">
                      {uploadedFile.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      {uploadedAudioDuration && ` • ~${formatSeconds(Math.round(uploadedAudioDuration))}`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => processAudioForTranscription(uploadedFile)}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loc.btnTranscribeFile}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar during AI processing */}
        {isProcessing && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 animate-spin" />
                <span>{progressStatus}</span>
              </span>
              <span className="font-mono text-brand-600">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* 4. Transcription Result & Export Hub */}
        {transcription && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-600" />
                  <span>{loc.outputTitle}</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({transcription.trim().split(/\s+/).filter(Boolean).length} {loc.wordsCount} • {transcription.length} {loc.charsCount})
                </span>
              </div>

              {/* Formatting Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoFormatText}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{loc.btnFormat}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTranscription('')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-500 bg-white dark:bg-slate-800 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{loc.btnClear}</span>
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                dir={isRtlLang ? 'rtl' : 'ltr'}
                rows={9}
                className={`w-full p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-relaxed outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-sans ${
                  selectedLang === 'ur' ? 'font-urdu leading-[2.2]' : selectedLang === 'ar' ? 'font-arabic leading-[2.0]' : ''
                }`}
                placeholder={loc.placeholder}
              />
            </div>

            {/* Action Export Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  TextToSpeechController.speak(transcription, getBcp47Lang(selectedLang), 1.0);
                }}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-brand-600" />
                <span>Listen</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-brand-600" />}
                <span>{copied ? loc.btnCopied : loc.btnCopy}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-indigo-500" />
                <span>{loc.btnShare}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>{loc.btnTxt}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadDocx}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>{loc.btnWord}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-rose-500" />
                <span>{loc.btnPdf}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
