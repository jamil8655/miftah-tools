'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Mic,
  MicOff,
  Square,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Share2,
  Download,
  Trash2,
  Settings as SettingsIcon,
  ArrowLeftRight,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Users,
  User,
  Clock,
  AlertCircle,
  X,
  FileText,
  RotateCcw,
  Languages,
  Radio,
  Send,
  Wand2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { useUserStore } from '@/lib/user/user-store';
import { SUPPORTED_LANGUAGES, getLanguageOption, isRTLLanguage } from '@/lib/translator/languages';
import { translateSpeechText } from '@/lib/translator/translation-engine';
import { SpeechRecognitionController } from '@/lib/translator/speech-recognition';
import { TextToSpeechController } from '@/lib/translator/text-to-speech';
import { autoCorrectSpokenText } from '@/lib/translator/auto-correct';
import { TranslationSegment, TranslatorSettings } from '@/lib/translator/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const TOP_FLAGSHIP_LANGS = [
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

const TRANSLATOR_LOCALES = {
  en: {
    backBtn: 'Back',
    title: 'Live Speech Translator',
    subtitle: 'Speak naturally. Watch words convert to text and translate in real-time with smart auto-correct.',
    iSpeak: 'I speak',
    translateTo: 'Translate to',
    autoDetect: 'Auto Detect',
    tapToSpeak: 'Tap to Speak',
    speakNaturally: 'Press the microphone and speak naturally...',
    listening: 'Listening... (Speak now)',
    stopBtn: 'Stop Listening',
    voiceOutputOn: 'Voice: ON',
    voiceOutputOff: 'Voice: OFF',
    autoCorrectOn: 'Auto-Correct: ON',
    autoCorrectOff: 'Auto-Correct: OFF',
    singleMode: 'Single Speaker',
    convoMode: 'Conversation Mode',
    liveSpokenTitle: 'Live Spoken (Original)',
    liveTranslationTitle: 'Live Translation',
    translation: 'Translation',
    waitingForSpeech: 'Speak into microphone. Text will type here in real time...',
    translatingLive: 'Translation will appear live as you speak...',
    personA: 'Person A',
    personB: 'Person B',
    transcriptTitle: 'Conversation History',
    emptyTranscript: 'Completed sentences will be saved here with audio replay, copy, and export.',
    copyText: 'Copy',
    copiedText: 'Copied!',
    shareText: 'Share',
    speakAgain: 'Listen',
    exportTxt: 'Text (.txt)',
    exportPdf: 'PDF (.pdf)',
    copyAll: 'Copy All',
    clearChat: 'Clear History',
    confirmClearTitle: 'Clear Translation Session?',
    confirmClearDesc: 'This will remove all saved translation history in the current session.',
    cancel: 'Cancel',
    clearBtn: 'Clear',
    settingsTitle: 'Voice & Translation Settings',
    speechSpeed: 'Voice Output Speed',
    speedSlow: '0.8x Slow',
    speedNormal: '1.0x Normal',
    speedFast: '1.2x Fast',
    displayModeLabel: 'Display Mode',
    displayBoth: 'Original + Translation',
    displayTransOnly: 'Translation Only',
    displayOrigOnly: 'Original Only',
    autoTurnLabel: 'Auto Turn Detection',
    autoTurnDesc: 'Automatically switches speaker turns during conversation mode',
    privacyTitle: 'Privacy-First Architecture',
    privacyNote: 'Your speech is processed directly on your device with high accuracy and zero cloud storage.',
    browserNotSupported: 'Live speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.',
    manualInputPlaceholder: 'Or type text here to translate...',
    manualTranslateBtn: 'Translate',
    micErrorNotice: 'Microphone permission needed.',
    allowMicPrompt: 'Please allow microphone access in your browser to speak.',
  },
  ur: {
    backBtn: 'واپس',
    title: 'لائیو اسپیچ ٹرانسلیٹر',
    subtitle: 'آپ بولتے جائیں، الفاظ ساتھ ساتھ لکھتے جائیں گے اور خودکار درستگی کے ساتھ فوری لائیو ترجمہ ہوتا جائے گا۔',
    iSpeak: 'میری زبان',
    translateTo: 'ترجمہ کی زبان',
    autoDetect: 'خودکار شناخت',
    tapToSpeak: 'بولنے کے لیے ٹیپ کریں',
    speakNaturally: 'مائیکروفون دبائیں اور قدرتی انداز میں بولنا شروع کریں...',
    listening: 'آواز سنی جا رہی ہے... (اب بولیں)',
    stopBtn: 'روکیں',
    voiceOutputOn: 'آواز: آن',
    voiceOutputOff: 'آواز: آف',
    autoCorrectOn: 'خودکار درستگی: آن',
    autoCorrectOff: 'خودکار درستگی: آف',
    singleMode: 'انفرادی انداز',
    convoMode: 'مکالمہ / دو طرفہ گفتگو',
    liveSpokenTitle: 'لائیو اصل آواز (Original)',
    liveTranslationTitle: 'لائیو فوری ترجمہ (Live Translation)',
    translation: 'ترجمہ',
    waitingForSpeech: 'مائیک میں بولیں، الفاظ یہاں حقیقی وقت میں خود بخود ٹائپ ہوں گے...',
    translatingLive: 'بولتے ہی فوری لائیو ترجمہ یہاں سامنے آتا جائے گا...',
    personA: 'فرد اول (A)',
    personB: 'فرد دوم (B)',
    transcriptTitle: 'محفوظ شدہ گفتگو اور تاریخ',
    emptyTranscript: 'آپ کے مکمل جملے یہاں تاریخ میں آڈیو پلے اور کاپی کی سہولت کے ساتھ محفوظ ہوتے رہیں گے۔',
    copyText: 'کاپی',
    copiedText: 'کاپی ہو گیا!',
    shareText: 'شیئر',
    speakAgain: 'سنیں',
    exportTxt: 'ٹیکسٹ فائل (.txt)',
    exportPdf: 'پی ڈی ایف (.pdf)',
    copyAll: 'تمام کاپی کریں',
    clearChat: 'تاریخ صاف کریں',
    confirmClearTitle: 'کیا آپ سیشن صاف کرنا چاہتے ہیں؟',
    confirmClearDesc: 'اس سے موجودہ سیشن کے تمام محفوظ شدہ پیغامات ختم ہو جائیں گے۔',
    cancel: 'منسوخ',
    clearBtn: 'صاف کریں',
    settingsTitle: 'ٹرانسلیٹر سیٹنگز',
    speechSpeed: 'آواز کی رفتار',
    speedSlow: '0.8x دھیمی',
    speedNormal: '1.0x عام',
    speedFast: '1.2x تیز',
    displayModeLabel: 'ڈسپلے کا انداز',
    displayBoth: 'اصل + ترجمہ',
    displayTransOnly: 'صرف ترجمہ',
    displayOrigOnly: 'صرف اصل متن',
    autoTurnLabel: 'خودکار باری کی شناخت',
    autoTurnDesc: 'گفتگو کے دوران بولنے والے کی باری خود بخود تبدیل کریں',
    privacyTitle: 'مکمل محفوظ اور نجی نظام',
    privacyNote: 'آپ کی آواز اور متن بغیر کسی سرور پر محفوظ کیے فوری پروسیس ہوتے ہیں۔',
    browserNotSupported: 'اس براؤزر میں لائیو آواز کی شناخت دستیاب نہیں۔ براہ کرم گوگل کروم یا سفاری استعمال کریں۔',
    manualInputPlaceholder: 'یا یہاں ٹیکسٹ لکھ کر براہ راست ترجمہ کریں...',
    manualTranslateBtn: 'ترجمہ کریں',
    micErrorNotice: 'مائیکروفون کی اجازت درکار ہے۔',
    allowMicPrompt: 'براہ کرم براؤزر میں Allow کا بٹن دبائیں۔',
  },
  ar: {
    backBtn: 'رجوع',
    title: 'المترجم الصوتي المباشر',
    subtitle: 'تحدث بطبيعتك، وستتحول الكلمات إلى نص وترجمة مباشرة في الوقت الفعلي مع التصحيح الذكي.',
    iSpeak: 'أتحدث لغة',
    translateTo: 'الترجمة إلى',
    autoDetect: 'كشف تلقائي',
    tapToSpeak: 'اضغط للتحدث',
    speakNaturally: 'اضغط على الميكروفون وابدأ التحدث بطبيعتك...',
    listening: 'جاري الاستماع... (تحدث الآن)',
    stopBtn: 'إيقاف الاستماع',
    voiceOutputOn: 'الصوت: مفعّل',
    voiceOutputOff: 'الصوت: معطّل',
    autoCorrectOn: 'التصحيح التلقائي: مفعّل',
    autoCorrectOff: 'التصحيح التلقائي: معطّل',
    singleMode: 'متحدث فردي',
    convoMode: 'محادثة ثنائية',
    liveSpokenTitle: 'النص الصوتي المباشر (الأصل)',
    liveTranslationTitle: 'الترجمة الفورية المباشرة',
    translation: 'الترجمة',
    waitingForSpeech: 'تحدث في الميكروفون، ستتم الكتابة هنا مباشرة أثناء كلامك...',
    translatingLive: 'ستظهر الترجمة الفورية فور نطق الكلمات...',
    personA: 'الطرف الأول',
    personB: 'الطرف الثاني',
    transcriptTitle: 'سجل المحادثات والترجمة',
    emptyTranscript: 'ستظهر الجمل المكتملة هنا في السجل مع إمكانية الاستماع والنسخ والتصدير.',
    copyText: 'نسخ',
    copiedText: 'تم النسخ!',
    shareText: 'مشاركة',
    speakAgain: 'استماع',
    exportTxt: 'ملف نصي (.txt)',
    exportPdf: 'ملف PDF (.pdf)',
    copyAll: 'نسخ الكل',
    clearChat: 'مسح السجل',
    confirmClearTitle: 'هل تريد مسح سجل الجلسة؟',
    confirmClearDesc: 'سيتم مسح جميع النصوص المترجمة المحفوظة في هذه الجلسة.',
    cancel: 'إلغاء',
    clearBtn: 'مسح',
    settingsTitle: 'إعدادات الصوت والترجمة',
    speechSpeed: 'سرعة النطق الصوتي',
    speedSlow: '0.8x بطيء',
    speedNormal: '1.0x عادي',
    speedFast: '1.2x سريع',
    displayModeLabel: 'طريقة العرض',
    displayBoth: 'الأصل + الترجمة',
    displayTransOnly: 'الترجمة فقط',
    displayOrigOnly: 'الأصل فقط',
    autoTurnLabel: 'التبديل التلقائي للمتحدث',
    autoTurnDesc: 'تبديل دور المتحدث تلقائياً أثناء وضع المحادثة',
    privacyTitle: 'خصوصية وأمان 100%',
    privacyNote: 'تتم معالجة الصوت والنصوص مباشرة على جهازك دون حفظ أي بيانات على الخوادم.',
    browserNotSupported: 'التعرف الصوتي المباشر غير مدعوم في هذا المتصفح. يُرجى استخدام Google Chrome أو Safari.',
    manualInputPlaceholder: 'أو اكتب نصاً هنا للترجمة الفورية...',
    manualTranslateBtn: 'ترجمة',
    micErrorNotice: 'يلزم إعطاء إذن الميكروفون.',
    allowMicPrompt: 'يرجى السماح بالوصول إلى الميكروفون في المتصفح.',
  },
  hi: {
    backBtn: 'वापस',
    title: 'लाइव स्पीच ट्रांसलेटर',
    subtitle: 'आप बोलते जाएं, शब्द तुरंत टाइप होते जाएंगे और स्मार्ट ऑटो-करेक्ट के साथ रीयल-टाइम में अनुवाद होता जाएगा।',
    iSpeak: 'मेरी भाषा',
    translateTo: 'अनुवाद की भाषा',
    autoDetect: 'स्वतः पहचान',
    tapToSpeak: 'बोलने के लिए टैप करें',
    speakNaturally: 'माइक दबाएं और स्वाभाविक रूप से बोलना शुरू करें...',
    listening: 'आवाज़ सुनी जा रही है... (बोलिए)',
    stopBtn: 'रोकें',
    voiceOutputOn: 'आवाज़: चालू',
    voiceOutputOff: 'आवाज़: बंद',
    autoCorrectOn: 'ऑटो-करेक्ट: चालू',
    autoCorrectOff: 'ऑटो-करेक्ट: बंद',
    singleMode: 'सिंगल स्पीकर',
    convoMode: 'बातचीत (कन्वर्सेशन) मोड',
    liveSpokenTitle: 'लाइव बोली गई आवाज़ (मूल)',
    liveTranslationTitle: 'लाइव त्वरित अनुवाद (Live Translation)',
    translation: 'अनुवाद',
    waitingForSpeech: 'माइक में बोलें, शब्द यहाँ अपने आप रीयल-टाइम में टाइप होंगे...',
    translatingLive: 'बोलते ही तुरंत लाइव अनुवाद यहाँ सामने आता जाएगा...',
    personA: 'पहला व्यक्ति (A)',
    personB: 'दूसरा व्यक्ति (B)',
    transcriptTitle: 'बातचीत का इतिहास',
    emptyTranscript: 'पूरे हुए वाक्य यहाँ इतिहास में ऑडियो सुनने व कॉपी करने के लिए सेव होते रहेंगे।',
    copyText: 'कॉपी',
    copiedText: 'कॉपी हो गया!',
    shareText: 'शेयर',
    speakAgain: 'सुनें',
    exportTxt: 'टेक्स्ट फ़ाइल (.txt)',
    exportPdf: 'PDF फ़ाइल (.pdf)',
    copyAll: 'सभी कॉपी करें',
    clearChat: 'इतिहास साफ़ करें',
    confirmClearTitle: 'क्या आप बातचीत साफ़ करना चाहते हैं?',
    confirmClearDesc: 'यह वर्तमान सत्र के सभी संदेशों को हटा देगा।',
    cancel: 'रद्द करें',
    clearBtn: 'साफ़ करें',
    settingsTitle: 'ट्रांसलेटर सेटिंग्स',
    speechSpeed: 'आवाज़ की गति',
    speedSlow: '0.8x धीमी',
    speedNormal: '1.0x सामान्य',
    speedFast: '1.2x तेज़',
    displayModeLabel: 'दिखाने का तरीका',
    displayBoth: 'मूल + अनुवाद',
    displayTransOnly: 'केवल अनुवाद',
    displayOrigOnly: 'केवल मूल टेक्स्ट',
    autoTurnLabel: 'ऑटो टर्न डिटेक्शन',
    autoTurnDesc: 'बातचीत के दौरान बोलने वाले की बारी स्वचालित रूप से बदलें',
    privacyTitle: '100% सुरक्षित एवं निजी',
    privacyNote: 'आपकी आवाज़ और डेटा बिना किसी सर्वर पर स्टोर किए सीधे डिवाइस पर प्रोसेस होते हैं।',
    browserNotSupported: 'इस ब्राउज़र में लाइव स्पीच उपलब्ध नहीं है। कृपया Google Chrome या Safari का उपयोग करें।',
    manualInputPlaceholder: 'या यहाँ टाइप करके तुरंत अनुवाद करें...',
    manualTranslateBtn: 'अनुवाद करें',
    micErrorNotice: 'माइक्रोफ़ोन अनुमति आवश्यक है।',
    allowMicPrompt: 'कृपया ब्राउज़र में माइक की अनुमति दें।',
  },
};

export function LiveSpeechTranslator() {
  const { language, isRTL } = useI18n();
  const { recordToolUsage } = useUserStore();
  const loc = TRANSLATOR_LOCALES[language] || TRANSLATOR_LOCALES.en;

  // Language selectors state (Default Urdu -> English)
  const [sourceLang, setSourceLang] = useState<string>('ur');
  const [targetLang, setTargetLang] = useState<string>('en');

  // Real-time live speech state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [liveSpokenText, setLiveSpokenText] = useState<string>('');
  const [liveTranslatedText, setLiveTranslatedText] = useState<string>('');
  const [isLiveTranslating, setIsLiveTranslating] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentSpeaker, setCurrentSpeaker] = useState<'user' | 'peer'>('user');
  const [autoCorrectEnabled, setAutoCorrectEnabled] = useState<boolean>(true);

  // Conversation history
  const [transcript, setTranscript] = useState<TranslationSegment[]>([]);

  // Settings state
  const [settings, setSettings] = useState<TranslatorSettings>({
    voiceOutput: true,
    autoDetect: false,
    conversationMode: false,
    speechSpeed: 1.0,
    displayMode: 'both',
    autoTurnDetection: true,
  });

  // UI state
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [manualText, setManualText] = useState<string>('');
  const [isManualTranslating, setIsManualTranslating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionControllerRef = useRef<SpeechRecognitionController | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const interimDebounceRef = useRef<any>(null);
  const activeAbortControllerRef = useRef<AbortController | null>(null);
  const lastFinalTextRef = useRef<string>('');

  const sourceLangObj = useMemo(() => getLanguageOption(sourceLang), [sourceLang]);
  const targetLangObj = useMemo(() => getLanguageOption(targetLang), [targetLang]);

  // Check browser speech recognition capability
  useEffect(() => {
    setIsSupported(SpeechRecognitionController.isSupported());
  }, []);

  // Timer counter when active
  useEffect(() => {
    if (isListening) {
      setElapsedSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isListening]);

  // Record tool usage
  const markToolUsed = useCallback(() => {
    try {
      recordToolUsage('live-speech-translator', 'Live Speech Translator', 'text', 'Mic');
    } catch {}
  }, [recordToolUsage]);

  // Fast debounced real-time streaming translation as user speaks
  const triggerLiveTranslation = useCallback(
    (text: string) => {
      const cleanText = text.trim();
      if (!cleanText) {
        setLiveTranslatedText('');
        return;
      }

      const activeSrc = settings.conversationMode && currentSpeaker === 'peer' ? targetLang : sourceLang;
      const activeTgt = settings.conversationMode && currentSpeaker === 'peer' ? sourceLang : targetLang;

      if (interimDebounceRef.current) {
        clearTimeout(interimDebounceRef.current);
      }

      interimDebounceRef.current = setTimeout(async () => {
        if (activeAbortControllerRef.current) {
          activeAbortControllerRef.current.abort();
        }
        activeAbortControllerRef.current = new AbortController();

        setIsLiveTranslating(true);
        try {
          const response = await translateSpeechText(
            cleanText,
            activeSrc,
            activeTgt,
            activeAbortControllerRef.current.signal
          );
          if (response.translatedText) {
            setLiveTranslatedText(response.translatedText);
          }
        } catch {
          // Keep current or retry smoothly
        } finally {
          setIsLiveTranslating(false);
        }
      }, 140); // 140ms lightning-fast debounce for live translation stream
    },
    [sourceLang, targetLang, settings.conversationMode, currentSpeaker]
  );

  // Interim handler called as syllables/words are spoken
  const handleInterimSpeech = useCallback(
    (text: string) => {
      const activeSrc = settings.conversationMode && currentSpeaker === 'peer' ? targetLang : sourceLang;
      const processedText = autoCorrectEnabled ? autoCorrectSpokenText(text, activeSrc) : text;
      
      setLiveSpokenText(processedText);
      triggerLiveTranslation(processedText);
    },
    [triggerLiveTranslation, autoCorrectEnabled, settings.conversationMode, currentSpeaker, sourceLang, targetLang]
  );

  // Final committed sentence speech recognition handler
  const handleFinalSpeech = useCallback(
    async (finalText: string, confidence: number) => {
      const activeSrc = settings.conversationMode && currentSpeaker === 'peer' ? targetLang : sourceLang;
      const activeTgt = settings.conversationMode && currentSpeaker === 'peer' ? sourceLang : targetLang;
      const activeTgtObj = getLanguageOption(activeTgt);

      const cleanText = autoCorrectEnabled
        ? autoCorrectSpokenText(finalText.trim(), activeSrc)
        : finalText.trim();

      if (!cleanText) return;
      if (cleanText === lastFinalTextRef.current) return;
      lastFinalTextRef.current = cleanText;

      markToolUsed();

      // Update live displays
      setLiveSpokenText(cleanText);

      try {
        const response = await translateSpeechText(cleanText, activeSrc, activeTgt);
        const translated = response.translatedText || cleanText;

        setLiveTranslatedText(translated);

        const newSegment: TranslationSegment = {
          id: `seg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          speaker: currentSpeaker,
          originalText: cleanText,
          translatedText: translated,
          sourceLang: activeSrc,
          targetLang: activeTgt,
          timestamp: Date.now(),
          isFinal: true,
        };

        setTranscript((prev) => {
          if (prev.length > 0) {
            const lastSeg = prev[prev.length - 1];
            if (
              lastSeg.speaker === currentSpeaker &&
              (cleanText.startsWith(lastSeg.originalText) ||
                cleanText.includes(lastSeg.originalText) ||
                lastSeg.originalText.startsWith(cleanText))
            ) {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...lastSeg,
                originalText: cleanText,
                translatedText: translated,
                timestamp: Date.now(),
              };
              return updated;
            }
          }
          return [...prev, newSegment];
        });

        // Auto TTS playback
        if (settings.voiceOutput && translated) {
          TextToSpeechController.speak(translated, activeTgtObj.bcp47, settings.speechSpeed);
        }

        // Conversation mode auto-turn
        if (settings.conversationMode && settings.autoTurnDetection) {
          setCurrentSpeaker((prev) => (prev === 'user' ? 'peer' : 'user'));
          const nextLang = currentSpeaker === 'user' ? targetLangObj.bcp47 : sourceLangObj.bcp47;
          recognitionControllerRef.current?.setLanguage(nextLang);
        }
      } catch (err) {
        console.error('Final sentence error:', err);
      }
    },
    [
      sourceLang,
      targetLang,
      sourceLangObj,
      targetLangObj,
      settings.conversationMode,
      settings.autoTurnDetection,
      settings.voiceOutput,
      settings.speechSpeed,
      currentSpeaker,
      markToolUsed,
      autoCorrectEnabled,
    ]
  );

  // Start speech recognition
  const startListening = useCallback(() => {
    triggerHaptic('medium');
    setErrorMessage(null);
    setLiveSpokenText('');
    setLiveTranslatedText('');

    const activeBcp47 =
      settings.conversationMode && currentSpeaker === 'peer'
        ? targetLangObj.bcp47
        : sourceLangObj.bcp47;

    if (!recognitionControllerRef.current) {
      recognitionControllerRef.current = new SpeechRecognitionController({
        onInterim: handleInterimSpeech,
        onFinal: handleFinalSpeech,
        onError: (err) => {
          setErrorMessage(err);
          setIsListening(false);
        },
        onAudioLevel: (lvl) => setAudioLevel(lvl),
        onStateChange: (state) => setIsListening(state),
      });
    }

    recognitionControllerRef.current.start(activeBcp47);
  }, [
    handleInterimSpeech,
    handleFinalSpeech,
    settings.conversationMode,
    currentSpeaker,
    sourceLangObj.bcp47,
    targetLangObj.bcp47,
  ]);

  // Stop speech recognition
  const stopListening = useCallback(() => {
    triggerHaptic('light');
    if (recognitionControllerRef.current) {
      recognitionControllerRef.current.stop();
    }
    TextToSpeechController.stop();
    setIsListening(false);
    setAudioLevel(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionControllerRef.current) {
        recognitionControllerRef.current.stop();
      }
      if (interimDebounceRef.current) {
        clearTimeout(interimDebounceRef.current);
      }
      TextToSpeechController.stop();
    };
  }, []);

  // Quick switch source language
  const handleQuickSelectSource = (code: string) => {
    triggerHaptic('selection');
    setSourceLang(code);
    setLiveSpokenText('');
    setLiveTranslatedText('');
    if (isListening && recognitionControllerRef.current) {
      const newBcp = getLanguageOption(code).bcp47;
      recognitionControllerRef.current.setLanguage(newBcp);
    }
  };

  // Swap Source and Target Languages
  const handleSwapLanguages = () => {
    triggerHaptic('selection');
    const oldSource = sourceLang;
    const oldTarget = targetLang;
    setSourceLang(oldTarget);
    setTargetLang(oldSource);

    setLiveSpokenText('');
    setLiveTranslatedText('');

    if (isListening && recognitionControllerRef.current) {
      const newBcp = getLanguageOption(oldTarget).bcp47;
      recognitionControllerRef.current.setLanguage(newBcp);
    }
  };

  // Manual fallback translation for text typing
  const handleManualTranslate = async () => {
    if (!manualText.trim()) return;
    triggerHaptic('selection');
    setIsManualTranslating(true);
    markToolUsed();

    try {
      const activeSrc = sourceLang;
      const activeTgt = targetLang;
      const cleanManual = autoCorrectEnabled ? autoCorrectSpokenText(manualText.trim(), activeSrc) : manualText.trim();
      const response = await translateSpeechText(cleanManual, activeSrc, activeTgt);
      const translated = response.translatedText || cleanManual;

      setLiveSpokenText(cleanManual);
      setLiveTranslatedText(translated);

      const newSegment: TranslationSegment = {
        id: `seg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        speaker: 'user',
        originalText: cleanManual,
        translatedText: translated,
        sourceLang: activeSrc,
        targetLang: activeTgt,
        timestamp: Date.now(),
        isFinal: true,
      };

      setTranscript((prev) => [...prev, newSegment]);
      setManualText('');

      if (settings.voiceOutput && translated) {
        TextToSpeechController.speak(translated, targetLangObj.bcp47, settings.speechSpeed);
      }
    } catch {
      setErrorMessage('Translation failed. Please check your internet connection.');
    } finally {
      setIsManualTranslating(false);
    }
  };

  // Copy text helper
  const handleCopy = (text: string, id: string) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Speak text helper
  const handleSpeak = (text: string, langCode: string) => {
    triggerHaptic('light');
    const langObj = getLanguageOption(langCode);
    TextToSpeechController.speak(text, langObj.bcp47, settings.speechSpeed);
  };

  // Share helper
  const handleShareSegment = async (seg: TranslationSegment) => {
    triggerHaptic('light');
    const shareText = `Original (${seg.sourceLang.toUpperCase()}):\n${seg.originalText}\n\nTranslation (${seg.targetLang.toUpperCase()}):\n${seg.translatedText}\n\n— Translated via Miftah Tools (https://miftahtools.com/live-speech-translator)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Miftah Tools Speech Translation',
          text: shareText,
        });
      } catch {}
    } else {
      handleCopy(shareText, seg.id);
    }
  };

  // Copy all conversation text
  const handleCopyAll = () => {
    triggerHaptic('light');
    const allText = transcript
      .map(
        (s) =>
          `[${s.sourceLang.toUpperCase()}]: ${s.originalText}\n[${s.targetLang.toUpperCase()}]: ${s.translatedText}`
      )
      .join('\n\n');
    handleCopy(allText, 'all');
  };

  // Export as TXT
  const handleExportTxt = () => {
    triggerHaptic('selection');
    const content =
      `MIFTAH TOOLS — LIVE SPEECH TRANSLATION SESSION\nDate: ${new Date().toLocaleString()}\nLanguages: ${sourceLangObj.label} ⇄ ${targetLangObj.label}\n\n========================================\n\n` +
      transcript
        .map(
          (s, idx) =>
            `${idx + 1}. [${s.speaker === 'user' ? 'Person A' : 'Person B'}]\n${sourceLangObj.label}: ${s.originalText}\n${targetLangObj.label}: ${s.translatedText}\n`
        )
        .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `miftah-translation-${Date.now()}.txt`);
  };

  // Export as PDF (100% Unicode & RTL safe for Urdu, Hindi, Arabic, Bengali, English)
  const handleExportPdf = async () => {
    if (transcript.length === 0) return;
    triggerHaptic('medium');

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px';
    container.style.minHeight = '1123px';
    container.style.padding = '44px 48px';
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#0f172a';
    container.style.fontFamily = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    container.style.boxSizing = 'border-box';

    const getFontFamilyForLang = (lang: string) => {
      if (lang === 'ur' || lang === 'ar') {
        return "'Noto Nastaliq Urdu', 'Amiri', 'Segoe UI', Tahoma, Arial, sans-serif";
      }
      if (lang === 'hi') {
        return "'Noto Sans Devanagari', 'Mangal', 'Segoe UI', Tahoma, Arial, sans-serif";
      }
      return "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    };

    const segmentsHtml = transcript
      .map((s, idx) => {
        const srcRtl = isRTLLanguage(s.sourceLang);
        const tgtRtl = isRTLLanguage(s.targetLang);
        const srcFont = getFontFamilyForLang(s.sourceLang);
        const tgtFont = getFontFamilyForLang(s.targetLang);
        const srcLabel = getLanguageOption(s.sourceLang).label;
        const tgtLabel = getLanguageOption(s.targetLang).label;
        const speakerName = s.speaker === 'user' ? 'Speaker 1' : 'Speaker 2';

        const escapeHtml = (text: string) =>
          text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>');

        return `
          <div style="margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background-color: #ffffff; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 11px; color: #64748b; border-bottom: 1px dashed #f1f5f9; padding-bottom: 8px; direction: ltr;">
              <span style="font-weight: 700; color: #0284c7;">#${idx + 1} • ${speakerName}</span>
              <span>${new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            
            <div style="margin-bottom: 12px;">
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; direction: ltr;">
                ${srcLabel} (${s.sourceLang.toUpperCase()})
              </div>
              <p style="margin: 0; font-size: 15px; line-height: 1.8; color: #1e293b; direction: ${srcRtl ? 'rtl' : 'ltr'}; text-align: ${srcRtl ? 'right' : 'left'}; font-family: ${srcFont};">
                ${escapeHtml(s.originalText)}
              </p>
            </div>

            <div style="background-color: #f8fafc; border-radius: 8px; padding: 12px; border-left: 3px solid #0284c7;">
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #0284c7; margin-bottom: 4px; direction: ltr;">
                Translated to ${tgtLabel} (${s.targetLang.toUpperCase()})
              </div>
              <p style="margin: 0; font-size: 15px; line-height: 1.8; color: #0f172a; font-weight: 500; direction: ${tgtRtl ? 'rtl' : 'ltr'}; text-align: ${tgtRtl ? 'right' : 'left'}; font-family: ${tgtFont};">
                ${escapeHtml(s.translatedText)}
              </p>
            </div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; direction: ltr;">
        <div>
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a;">Live Speech Translation Record</h1>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">
            Pair: <strong>${sourceLangObj.label} ⇄ ${targetLangObj.label}</strong> • Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; font-weight: 700; color: #0284c7; background: #f0f9ff; padding: 4px 10px; border-radius: 9999px; border: 1px solid #bae6fd;">Miftah Tools</span>
        </div>
      </div>
      <div>
        ${segmentsHtml}
      </div>
      <div style="border-top: 1px solid #f1f5f9; margin-top: 32px; padding-top: 12px; text-align: center; font-size: 10px; color: #94a3b8; direction: ltr;">
        Generated via Miftah Tools (miftahtools.com/live-speech-translator) • Free & Real-Time Multilingual Speech
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

      pdf.save(`miftah-translation-${Date.now()}.pdf`);
      triggerHaptic('success');
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  };

  // Format elapsed time (MM:SS)
  const formattedTime = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [elapsedSeconds]);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5">
      
      {/* ==================================================
          1. HEADER BAR
          ================================================== */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E1E7EC] dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/tools"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#182230] dark:text-white transition-colors cursor-pointer"
            aria-label={loc.backBtn}
          >
            <RotateCcw className="w-4 h-4 rtl:rotate-180" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-[#182230] dark:text-white tracking-tight">
                {loc.title}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] text-[10px] font-extrabold uppercase">
                ⚡ Real-Time Auto-Correct
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-400">
              {loc.subtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setShowSettings(!showSettings);
          }}
          className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
            showSettings
              ? 'bg-[#0B79B7] text-white border-[#0B79B7]'
              : 'bg-white dark:bg-slate-900 text-[#182230] dark:text-white border-[#E1E7EC] dark:border-slate-800 hover:border-[#0B79B7]'
          }`}
          aria-label={loc.settingsTitle}
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start justify-between gap-3 text-rose-700 dark:text-rose-300 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <div className="text-xs sm:text-sm font-semibold leading-relaxed">
              <p className="font-bold">{loc.micErrorNotice}</p>
              <p className="text-xs opacity-90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==================================================
          2. LANGUAGE SELECTION BAR WITH 4 FLAGSHIP QUICK PILLS
          ================================================== */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-xs space-y-4">
        
        {/* Flagship 4-Language Quick Selector Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E1E7EC]/60 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#687587] dark:text-slate-400">
            <Languages className="w-4 h-4 text-[#0B79B7]" />
            <span>{loc.iSpeak}:</span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            {TOP_FLAGSHIP_LANGS.map((fl) => {
              const isSelected = sourceLang === fl.code;
              return (
                <button
                  key={fl.code}
                  type="button"
                  onClick={() => handleQuickSelectSource(fl.code)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-[#0B79B7] text-white shadow-xs ring-2 ring-[#0B79B7]/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{fl.flag}</span>
                  <span>{fl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Dual Dropdown Selector with Swap */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] items-center gap-3">
          
          {/* Source Language Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#687587] dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span>{loc.iSpeak}:</span>
              {sourceLangObj.isRTL && (
                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px]">RTL</span>
              )}
            </label>
            <div className="relative">
              <select
                value={sourceLang}
                onChange={(e) => handleQuickSelectSource(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl bg-[#F5F7F9] dark:bg-slate-800 border border-[#E1E7EC] dark:border-slate-700 text-sm font-bold text-[#182230] dark:text-white focus:outline-none focus:border-[#0B79B7] appearance-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={`src-${lang.code}`} value={lang.code}>
                    {lang.flag} {lang.label} ({lang.nativeName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#687587] absolute right-4 rtl:right-auto rtl:left-4 top-4 pointer-events-none" />
            </div>
          </div>

          {/* Swap Languages Button */}
          <div className="flex justify-center pt-2 sm:pt-6">
            <button
              type="button"
              onClick={handleSwapLanguages}
              className="w-12 h-12 rounded-2xl bg-[#0B79B7]/10 hover:bg-[#0B79B7] text-[#0B79B7] hover:text-white border border-[#0B79B7]/20 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xs cursor-pointer group"
              aria-label="Swap Languages"
            >
              <ArrowLeftRight className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* Target Language Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#687587] dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span>{loc.translateTo}:</span>
              {targetLangObj.isRTL && (
                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px]">RTL</span>
              )}
            </label>
            <div className="relative">
              <select
                value={targetLang}
                onChange={(e) => {
                  setTargetLang(e.target.value);
                  setLiveTranslatedText('');
                }}
                className="w-full h-12 px-4 rounded-2xl bg-[#F5F7F9] dark:bg-slate-800 border border-[#E1E7EC] dark:border-slate-700 text-sm font-bold text-[#182230] dark:text-white focus:outline-none focus:border-[#0B79B7] appearance-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={`tgt-${lang.code}`} value={lang.code}>
                    {lang.flag} {lang.label} ({lang.nativeName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#687587] absolute right-4 rtl:right-auto rtl:left-4 top-4 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Quick Mode & Feature Toggles Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E1E7EC]/60 dark:border-slate-800">
          <div className="flex items-center flex-wrap gap-2">
            {/* Auto-Correct Toggle */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setAutoCorrectEnabled(!autoCorrectEnabled);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                autoCorrectEnabled
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-[#687587] border-[#E1E7EC] dark:border-slate-700'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-600" />
              <span>{autoCorrectEnabled ? loc.autoCorrectOn : loc.autoCorrectOff}</span>
            </button>

            {/* Voice Output Toggle */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSettings((s) => ({ ...s, voiceOutput: !s.voiceOutput }));
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                settings.voiceOutput
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-[#687587] border-[#E1E7EC] dark:border-slate-700'
              }`}
            >
              {settings.voiceOutput ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{settings.voiceOutput ? loc.voiceOutputOn : loc.voiceOutputOff}</span>
            </button>

            {/* Conversation Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSettings((s) => ({ ...s, conversationMode: !s.conversationMode }));
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                settings.conversationMode
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-[#687587] border-[#E1E7EC] dark:border-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{settings.conversationMode ? loc.convoMode : loc.singleMode}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-[#687587]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>100% Free & Live</span>
          </div>
        </div>
      </div>

      {/* ==================================================
          3. SETTINGS DRAWER / PANEL
          ================================================== */}
      {showSettings && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#0B79B7]/40 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-[#E1E7EC] dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-[#182230] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-[#0B79B7]" />
              <span>{loc.settingsTitle}</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Speed Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#182230] dark:text-white">{loc.speechSpeed}</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { val: 0.8, label: loc.speedSlow },
                  { val: 1.0, label: loc.speedNormal },
                  { val: 1.2, label: loc.speedFast },
                ].map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => setSettings((st) => ({ ...st, speechSpeed: s.val }))}
                    className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                      settings.speechSpeed === s.val
                        ? 'bg-[#0B79B7] text-white border-[#0B79B7]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#E1E7EC] dark:border-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Mode Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#182230] dark:text-white">{loc.displayModeLabel}</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { mode: 'both', label: loc.displayBoth },
                  { mode: 'translation', label: loc.displayTransOnly },
                  { mode: 'original', label: loc.displayOrigOnly },
                ].map((d) => (
                  <button
                    key={d.mode}
                    type="button"
                    onClick={() => setSettings((st) => ({ ...st, displayMode: d.mode as any }))}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border truncate transition-colors cursor-pointer ${
                      settings.displayMode === d.mode
                        ? 'bg-[#0B79B7] text-white border-[#0B79B7]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#E1E7EC] dark:border-slate-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-2xl bg-[#0B79B7]/5 border border-[#0B79B7]/20 flex items-center gap-2.5 text-xs text-[#075B8C] dark:text-[#38a8f8]">
            <ShieldCheck className="w-5 h-5 shrink-0 text-[#0B79B7]" />
            <p className="font-medium">{loc.privacyNote}</p>
          </div>
        </div>
      )}

      {/* ==================================================
          4. MAIN LIVE MICROPHONE ACTION HERO
          ================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-md p-6 sm:p-8 text-center space-y-6">
        
        {/* Subtle glowing radial backdrop */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isListening ? 'opacity-100' : 'opacity-0'
        } bg-[radial-gradient(#0B79B7_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.05]`} />

        {/* Conversation Mode Speaker Indicator */}
        {settings.conversationMode && isListening && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-xs uppercase tracking-wider animate-pulse">
            <User className="w-3.5 h-3.5" />
            <span>
              {currentSpeaker === 'user' ? `${loc.personA} (${sourceLangObj.label})` : `${loc.personB} (${targetLangObj.label})`}
            </span>
          </div>
        )}

        {/* Big Microphone Action Button */}
        <div className="flex flex-col items-center justify-center space-y-4">
          {!isListening ? (
            <button
              type="button"
              onClick={startListening}
              className="group relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#0B79B7] to-[#075B8C] text-white flex flex-col items-center justify-center shadow-lg shadow-[#0B79B7]/30 hover:scale-105 active:scale-95 transition-all duration-300 select-none cursor-pointer"
              aria-label={loc.tapToSpeak}
            >
              <div className="absolute inset-0 rounded-full bg-[#0B79B7] animate-ping opacity-20 pointer-events-none" />
              <Mic className="w-12 h-12 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-wider">
                {loc.tapToSpeak}
              </span>
            </button>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              {/* Active Pulsing Mic Circle */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-rose-600 text-white flex flex-col items-center justify-center shadow-xl shadow-rose-600/30 animate-pulse">
                <Mic className="w-12 h-12 mb-1" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {formattedTime}
                </span>
              </div>

              {/* Stop Button */}
              <button
                type="button"
                onClick={stopListening}
                className="h-12 px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>{loc.stopBtn}</span>
              </button>
            </div>
          )}

          {/* Status Label & Wave Visualizer */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-bold text-[#687587] dark:text-slate-400">
              {isListening ? loc.listening : loc.speakNaturally}
            </p>

            {/* Live Audio Bars Wave Visualizer */}
            {isListening && (
              <div className="flex items-center justify-center gap-1.5 h-6">
                {[12, 28, 45, 70, 90, 60, 40, 75, 50, 20].map((h, i) => {
                  const dynamicHeight = Math.max(
                    6,
                    Math.round(h * (audioLevel > 10 ? audioLevel / 60 : 0.2))
                  );
                  return (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-[#0B79B7] dark:bg-[#38a8f8] transition-all duration-75"
                      style={{ height: `${Math.min(24, dynamicHeight)}px` }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            DUAL LIVE STREAMING WORKSPACE CARDS (REAL-TIME AS YOU SPEAK)
            ================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-2">
          
          {/* Card 1: Original Spoken Words Stream */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7F9] dark:bg-slate-800/80 border border-[#E1E7EC] dark:border-slate-700 flex flex-col justify-between space-y-3 min-h-[140px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 border-b border-[#E1E7EC]/60 dark:border-slate-700 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#182230] dark:text-slate-200 uppercase tracking-wider">
                  <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-slate-400'}`} />
                  <span>{loc.liveSpokenTitle}</span>
                  <span className="text-[#687587] font-normal">({sourceLangObj.label})</span>
                </div>
                {liveSpokenText && (
                  <button
                    type="button"
                    onClick={() => handleCopy(liveSpokenText, 'live-spoken')}
                    className="p-1 text-[#687587] hover:text-[#0B79B7] cursor-pointer"
                    title={loc.copyText}
                  >
                    {copiedId === 'live-spoken' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  liveSpokenText
                    ? 'font-bold text-[#182230] dark:text-white'
                    : 'text-[#687587]/70 dark:text-slate-500 italic'
                }`}
                dir={sourceLangObj.isRTL ? 'rtl' : 'ltr'}
              >
                {liveSpokenText || loc.waitingForSpeech}
              </p>
            </div>

            {liveSpokenText && (
              <div className="flex items-center justify-between pt-1">
                {autoCorrectEnabled && (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Corrected</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleSpeak(liveSpokenText, sourceLang)}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 text-[#0B79B7] border border-[#E1E7EC] dark:border-slate-700 cursor-pointer ml-auto rtl:mr-auto rtl:ml-0"
                  title="Listen"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Live Instant Translation Stream */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex flex-col justify-between space-y-3 min-h-[140px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 border-b border-blue-100 dark:border-blue-900/40 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#0B79B7] dark:text-[#38a8f8] uppercase tracking-wider">
                  <Zap className={`w-3.5 h-3.5 ${isLiveTranslating ? 'animate-bounce text-amber-500' : 'text-[#0B79B7]'}`} />
                  <span>{loc.liveTranslationTitle}</span>
                  <span className="text-[#687587] font-normal">({targetLangObj.label})</span>
                </div>
                {liveTranslatedText && (
                  <button
                    type="button"
                    onClick={() => handleCopy(liveTranslatedText, 'live-trans')}
                    className="p-1 text-[#687587] hover:text-[#0B79B7] cursor-pointer"
                    title={loc.copyText}
                  >
                    {copiedId === 'live-trans' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  liveTranslatedText
                    ? 'font-bold text-[#0B79B7] dark:text-[#38a8f8]'
                    : 'text-[#687587]/70 dark:text-slate-500 italic'
                }`}
                dir={targetLangObj.isRTL ? 'rtl' : 'ltr'}
              >
                {liveTranslatedText || loc.translatingLive}
              </p>
            </div>

            {liveTranslatedText && (
              <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleSpeak(liveTranslatedText, targetLang)}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 text-[#0B79B7] border border-blue-200 dark:border-blue-900 cursor-pointer"
                  title="Listen"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Manual Fallback Input (Type & Translate) */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-xs flex items-center gap-2">
        <input
          type="text"
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleManualTranslate();
          }}
          placeholder={loc.manualInputPlaceholder}
          className="flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm text-[#182230] dark:text-white placeholder:text-[#687587] focus:outline-none font-medium"
        />
        <button
          type="button"
          onClick={handleManualTranslate}
          disabled={!manualText.trim() || isManualTranslating}
          className="px-4 py-2 rounded-xl bg-[#0B79B7] hover:bg-[#075B8C] text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all cursor-pointer shrink-0 inline-flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isManualTranslating ? '...' : loc.manualTranslateBtn}</span>
        </button>
      </div>

      {/* ==================================================
          5. CONVERSATION HISTORY & TRANSCRIPT LOG
          ================================================== */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
        
        {/* Transcript Header with Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E1E7EC] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0B79B7]" />
            <h2 className="text-sm font-black text-[#182230] dark:text-white uppercase tracking-wider">
              {loc.transcriptTitle}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] text-[10px] font-extrabold">
              {transcript.length}
            </span>
          </div>

          {transcript.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAll}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-[#182230] dark:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                {copiedId === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'all' ? loc.copiedText : loc.copyAll}</span>
              </button>

              <button
                type="button"
                onClick={handleExportTxt}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-[#182230] dark:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{loc.exportTxt}</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-[#182230] dark:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{loc.exportPdf}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 transition-colors cursor-pointer"
                title={loc.clearChat}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Conversation Bubble List */}
        {transcript.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <Radio className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-400 max-w-sm mx-auto">
              {loc.emptyTranscript}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {transcript.map((item, idx) => {
              const segSrc = getLanguageOption(item.sourceLang);
              const segTgt = getLanguageOption(item.targetLang);
              const isPersonA = item.speaker === 'user';

              return (
                <div
                  key={item.id || idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isPersonA
                      ? 'bg-slate-50 dark:bg-slate-800/60 border-[#E1E7EC] dark:border-slate-700'
                      : 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/40'
                  }`}
                >
                  {/* Speaker & Timestamp Top Bar */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#687587] dark:text-slate-400 border-b border-[#E1E7EC]/60 dark:border-slate-700/60 pb-1.5 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isPersonA ? 'bg-[#0B79B7]' : 'bg-purple-600'}`} />
                      <span className="font-extrabold text-[#182230] dark:text-white">
                        {isPersonA ? loc.personA : loc.personB}
                      </span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSpeak(item.translatedText, item.targetLang)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0B79B7] cursor-pointer"
                        title={loc.speakAgain}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.translatedText, item.id)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-[#687587] cursor-pointer"
                        title={loc.copyText}
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareSegment(item)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-[#687587] cursor-pointer"
                        title={loc.shareText}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Content: Original + Translated */}
                  <div className="space-y-2 text-xs sm:text-sm">
                    {/* Original */}
                    {settings.displayMode !== 'translation' && (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-[#687587] uppercase tracking-wider">
                          {segSrc.label}:
                        </span>
                        <p
                          className="font-medium text-[#182230] dark:text-slate-200 leading-relaxed"
                          dir={segSrc.isRTL ? 'rtl' : 'ltr'}
                        >
                          {item.originalText}
                        </p>
                      </div>
                    )}

                    {/* Translation */}
                    {settings.displayMode !== 'original' && (
                      <div className="space-y-0.5 pt-1">
                        <span className="text-[10px] font-bold text-[#0B79B7] dark:text-[#38a8f8] uppercase tracking-wider">
                          {segTgt.label} ({loc.translation}):
                        </span>
                        <p
                          className="font-bold text-[#0B79B7] dark:text-[#38a8f8] leading-relaxed"
                          dir={segTgt.isRTL ? 'rtl' : 'ltr'}
                        >
                          {item.translatedText}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-[#182230] dark:text-white">
              {loc.confirmClearTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-400">
              {loc.confirmClearDesc}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-[#182230] dark:text-white transition-colors cursor-pointer"
              >
                {loc.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTranscript([]);
                  setLiveSpokenText('');
                  setLiveTranslatedText('');
                  setShowClearModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {loc.clearBtn}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
