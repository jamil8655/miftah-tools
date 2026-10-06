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
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { useUserStore } from '@/lib/user/user-store';
import { SUPPORTED_LANGUAGES, getLanguageOption, isRTLLanguage } from '@/lib/translator/languages';
import { translateSpeechText } from '@/lib/translator/translation-engine';
import { SpeechRecognitionController } from '@/lib/translator/speech-recognition';
import { TextToSpeechController } from '@/lib/translator/text-to-speech';
import { TranslationSegment, TranslatorSettings } from '@/lib/translator/types';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

const TRANSLATOR_LOCALES = {
  en: {
    backBtn: 'Back',
    title: 'Live Speech Translator',
    subtitle: 'Speak naturally. Translate instantly in real time.',
    iSpeak: 'I speak',
    translateTo: 'Translate to',
    autoDetect: 'Auto Detect',
    tapToSpeak: 'Tap to Speak',
    speakNaturally: 'Speak naturally into your microphone...',
    listening: 'Listening to your voice...',
    stopBtn: 'Stop',
    voiceOutputOn: 'Voice Output: ON',
    voiceOutputOff: 'Voice Output: OFF',
    singleMode: 'Single Speaker',
    convoMode: 'Conversation Mode',
    youSaid: 'You said',
    translation: 'Translation',
    personA: 'Person A',
    personB: 'Person B',
    transcriptTitle: 'Live Conversation Transcript',
    emptyTranscript: 'Your translated conversation will appear here in real time as you speak.',
    copyText: 'Copy',
    copiedText: 'Copied!',
    shareText: 'Share',
    speakAgain: 'Speak',
    exportTxt: 'Text (.txt)',
    exportPdf: 'PDF (.pdf)',
    copyAll: 'Copy All',
    clearChat: 'Clear Conversation',
    confirmClearTitle: 'Clear Translation Session?',
    confirmClearDesc: 'This will erase all messages in the current session. This action cannot be undone.',
    cancel: 'Cancel',
    clearBtn: 'Clear',
    settingsTitle: 'Translator Settings',
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
    privacyNote: 'Your microphone is used only for real-time speech recognition. Audio is never stored on servers.',
    browserNotSupported: 'Live speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.',
    manualInputPlaceholder: 'Type a message to translate...',
    manualTranslateBtn: 'Translate Text',
    micErrorNotice: 'Microphone permission required for voice translation.',
    allowMicPrompt: 'Please allow microphone access when prompted by your browser.',
  },
  ur: {
    backBtn: 'واپس',
    title: 'لائیو اسپیچ ٹرانسلیٹر',
    subtitle: 'قدرتی انداز میں بولیں اور فوری ریئل ٹائم ترجمہ پائیں۔',
    iSpeak: 'میری زبان',
    translateTo: 'ترجمہ کی زبان',
    autoDetect: 'خودکار شناخت',
    tapToSpeak: 'بولنے کے لیے ٹیپ کریں',
    speakNaturally: 'مائیکروفون میں قدرتی انداز میں بولیں...',
    listening: 'آپ کی آواز سنی جا رہی ہے...',
    stopBtn: 'روکیں',
    voiceOutputOn: 'آواز میں سنیں: آن',
    voiceOutputOff: 'آواز میں سنیں: آف',
    singleMode: 'انفرادی انداز',
    convoMode: 'مکالمہ / گفتگو موڈ',
    youSaid: 'آپ نے کہا',
    translation: 'ترجمہ',
    personA: 'فرد اول (A)',
    personB: 'فرد دوم (B)',
    transcriptTitle: 'لائیو گفتگو کا متن',
    emptyTranscript: 'آپ کے بولے گئے جملوں کا ترجمہ یہاں حقیقی وقت میں ظاہر ہوگا۔',
    copyText: 'کاپی',
    copiedText: 'کاپی ہو گیا!',
    shareText: 'شیئر',
    speakAgain: 'دوبارہ سنیں',
    exportTxt: 'ٹیکسٹ فائل (.txt)',
    exportPdf: 'پی ڈی ایف (.pdf)',
    copyAll: 'تمام کاپی کریں',
    clearChat: 'گفتگو صاف کریں',
    confirmClearTitle: 'کیا آپ گفتگو صاف کرنا چاہتے ہیں؟',
    confirmClearDesc: 'اس سے موجودہ سیشن کے تمام پیغامات ختم ہو جائیں گے۔',
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
    privacyNote: 'آپ کا مائیک صرف فوری آواز کی شناخت کے لیے استعمال ہوتا ہے، کوئی آڈیو محفوظ نہیں کی جاتی۔',
    browserNotSupported: 'اس براؤزر میں لائیو آواز کی شناخت دستیاب نہیں۔ براہ کرم گوگل کروم یا سفاری استعمال کریں۔',
    manualInputPlaceholder: 'ترجمہ کے لیے ٹیکسٹ لکھیں...',
    manualTranslateBtn: 'ترجمہ کریں',
    micErrorNotice: 'آواز کے ذریعے ترجمے کے لیے مائیکروفون کی اجازت درکار ہے۔',
    allowMicPrompt: 'براہ کرم براؤزر کی اجازت پر Allow دبائیں۔',
  },
  ar: {
    backBtn: 'رجوع',
    title: 'المترجم الصوتي المباشر',
    subtitle: 'تحدث بطبيعتك واحصل على ترجمة فورية في الوقت الفعلي.',
    iSpeak: 'أتحدث لغة',
    translateTo: 'الترجمة إلى',
    autoDetect: 'كشف تلقائي',
    tapToSpeak: 'اضغط للتحدث',
    speakNaturally: 'تحدث بطبيعتك في الميكروفون...',
    listening: 'جاري الاستماع لصوتك...',
    stopBtn: 'إيقاف',
    voiceOutputOn: 'النطق الصوتي: مفعّل',
    voiceOutputOff: 'النطق الصوتي: معطّل',
    singleMode: 'المتحدث الفردي',
    convoMode: 'وضع المحادثة الثنائية',
    youSaid: 'قلت أنت',
    translation: 'الترجمة',
    personA: 'الطرف الأول',
    personB: 'الطرف الثاني',
    transcriptTitle: 'سجل المحادثة المباشرة',
    emptyTranscript: 'ستظهر محادثاتك المترجمة هنا في الوقت الفعلي أثناء التحدث.',
    copyText: 'نسخ',
    copiedText: 'تم النسخ!',
    shareText: 'مشاركة',
    speakAgain: 'استماع مجدداً',
    exportTxt: 'ملف نصي (.txt)',
    exportPdf: 'ملف PDF (.pdf)',
    copyAll: 'نسخ الكل',
    clearChat: 'مسح المحادثة',
    confirmClearTitle: 'هل تريد مسح جلسة الترجمة؟',
    confirmClearDesc: 'سيؤدي هذا الإجراء إلى حذف جميع النصوص المترجمة الحالية.',
    cancel: 'إلغاء',
    clearBtn: 'مسح',
    settingsTitle: 'إعدادات المترجم',
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
    privacyTitle: 'حماية كاملة للخصوصية',
    privacyNote: 'يُستخدم الميكروفون للتعرف على الصوت مباشرة، ولا يتم حفظ أي تسجيلات على الخوادم.',
    browserNotSupported: 'التعرف الصوتي المباشر غير مدعوم في هذا المتصفح. يُرجى استخدام Google Chrome أو Safari.',
    manualInputPlaceholder: 'اكتب نصاً للترجمة المباشرة...',
    manualTranslateBtn: 'ترجمة النص',
    micErrorNotice: 'يلزم إعطاء إذن الميكروفون للترجمة الصوتية.',
    allowMicPrompt: 'يرجى السماح بالوصول إلى الميكروفون عندما يطلب المتصفح ذلك.',
  },
  hi: {
    backBtn: 'वापस',
    title: 'लाइव स्पीच ट्रांसलेटर',
    subtitle: 'स्वाभाविक रूप से बोलें और तुरंत रियल-टाइम अनुवाद प्राप्त करें।',
    iSpeak: 'मेरी भाषा',
    translateTo: 'अनुवाद की भाषा',
    autoDetect: 'स्वतः पहचान',
    tapToSpeak: 'बोलने के लिए टैप करें',
    speakNaturally: 'माइक्रोफ़ोन में स्वाभाविक रूप से बोलें...',
    listening: 'आपकी आवाज़ सुनी जा रही है...',
    stopBtn: 'रोकें',
    voiceOutputOn: 'आवाज़ आउटपुट: चालू',
    voiceOutputOff: 'आवाज़ आउटपुट: बंद',
    singleMode: 'सिंगल स्पीकर',
    convoMode: 'बातचीत (कन्वर्सेशन) मोड',
    youSaid: 'आपने कहा',
    translation: 'अनुवाद',
    personA: 'पहला व्यक्ति (A)',
    personB: 'दूसरा व्यक्ति (B)',
    transcriptTitle: 'लाइव बातचीत का विवरण',
    emptyTranscript: 'आपके द्वारा बोले गए वाक्यों का अनुवाद यहाँ वास्तविक समय में दिखाई देगा।',
    copyText: 'कॉपी',
    copiedText: 'कॉपी हो गया!',
    shareText: 'शेयर',
    speakAgain: 'दोबारा सुनें',
    exportTxt: 'टेक्स्ट फ़ाइल (.txt)',
    exportPdf: 'PDF फ़ाइल (.pdf)',
    copyAll: 'सभी कॉपी करें',
    clearChat: 'बातचीत साफ़ करें',
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
    privacyNote: 'माइक्रोफ़ोन केवल तुरंत आवाज़ पहचानने के लिए उपयोग होता है, कोई भी ऑडियो सर्वर पर सेव नहीं होता।',
    browserNotSupported: 'इस ब्राउज़र में लाइव स्पीच उपलब्ध नहीं है। कृपया Google Chrome या Safari का उपयोग करें।',
    manualInputPlaceholder: 'अनुवाद के लिए टेक्स्ट लिखें...',
    manualTranslateBtn: 'अनुवाद करें',
    micErrorNotice: 'आवाज़ से अनुवाद के लिए माइक्रोफ़ोन की अनुमति आवश्यक है।',
    allowMicPrompt: 'कृपया ब्राउज़र पूछे जाने पर Allow बटन दबाएं।',
  },
};

export function LiveSpeechTranslator() {
  const { language, isRTL } = useI18n();
  const { recordToolUsage } = useUserStore();
  const loc = TRANSLATOR_LOCALES[language] || TRANSLATOR_LOCALES.en;

  // Language selectors state
  const [sourceLang, setSourceLang] = useState<string>('ur');
  const [targetLang, setTargetLang] = useState<string>('en');

  // Speech & listening state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimSpeech, setInterimSpeech] = useState<string>('');
  const [interimTranslation, setInterimTranslation] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentSpeaker, setCurrentSpeaker] = useState<'user' | 'peer'>('user');

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
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastTranslatedPhraseRef = useRef<string>('');

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

  // Record tool usage in recent tools when user translates
  const markToolUsed = useCallback(() => {
    try {
      recordToolUsage(
        'live-speech-translator',
        'Live Speech Translator',
        'text',
        'Mic'
      );
    } catch {}
  }, [recordToolUsage]);

  // Real-time translation of interim speech debounced
  const handleInterimSpeech = useCallback(
    async (text: string) => {
      setInterimSpeech(text);
      if (!text.trim() || text.length < 3) return;

      const activeSrc = settings.conversationMode && currentSpeaker === 'peer' ? targetLang : sourceLang;
      const activeTgt = settings.conversationMode && currentSpeaker === 'peer' ? sourceLang : targetLang;

      // Abort previous interim request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const response = await translateSpeechText(
          text,
          activeSrc,
          activeTgt,
          abortControllerRef.current.signal
        );
        if (response.translatedText) {
          setInterimTranslation(response.translatedText);
        }
      } catch {}
    },
    [sourceLang, targetLang, settings.conversationMode, currentSpeaker]
  );

  // Final committed sentence speech recognition handler
  const handleFinalSpeech = useCallback(
    async (finalText: string, confidence: number) => {
      const cleanText = finalText.trim();
      if (!cleanText || cleanText === lastTranslatedPhraseRef.current) return;
      lastTranslatedPhraseRef.current = cleanText;

      markToolUsed();

      const activeSrc = settings.conversationMode && currentSpeaker === 'peer' ? targetLang : sourceLang;
      const activeTgt = settings.conversationMode && currentSpeaker === 'peer' ? sourceLang : targetLang;

      const activeTgtObj = getLanguageOption(activeTgt);

      try {
        const response = await translateSpeechText(cleanText, activeSrc, activeTgt);
        const translated = response.translatedText || cleanText;

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

        setTranscript((prev) => [...prev, newSegment]);
        setInterimSpeech('');
        setInterimTranslation('');

        // Trigger TTS voice output if enabled
        if (settings.voiceOutput && translated) {
          TextToSpeechController.speak(
            translated,
            activeTgtObj.bcp47,
            settings.speechSpeed
          );
        }

        // Handle Auto-turn detection in conversation mode
        if (settings.conversationMode && settings.autoTurnDetection) {
          setCurrentSpeaker((prev) => (prev === 'user' ? 'peer' : 'user'));
          // Update recognition language for the other speaker
          const nextLang = currentSpeaker === 'user' ? targetLangObj.bcp47 : sourceLangObj.bcp47;
          recognitionControllerRef.current?.setLanguage(nextLang);
        }
      } catch (err) {
        console.error('Final translation error:', err);
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
    ]
  );

  // Start speech recognition
  const startListening = useCallback(() => {
    triggerHaptic('medium');
    setErrorMessage(null);
    setInterimSpeech('');
    setInterimTranslation('');

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

  // Stop speech recognition completely
  const stopListening = useCallback(() => {
    triggerHaptic('light');
    if (recognitionControllerRef.current) {
      recognitionControllerRef.current.stop();
    }
    TextToSpeechController.stop();
    setIsListening(false);
    setAudioLevel(0);
    setInterimSpeech('');
    setInterimTranslation('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionControllerRef.current) {
        recognitionControllerRef.current.stop();
      }
      TextToSpeechController.stop();
    };
  }, []);

  // Swap Source and Target Languages
  const handleSwapLanguages = () => {
    triggerHaptic('selection');
    const oldSource = sourceLang;
    const oldTarget = targetLang;
    setSourceLang(oldTarget);
    setTargetLang(oldSource);

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
      const response = await translateSpeechText(manualText.trim(), activeSrc, activeTgt);
      const translated = response.translatedText || manualText.trim();

      const newSegment: TranslationSegment = {
        id: `seg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        speaker: 'user',
        originalText: manualText.trim(),
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
    } catch (err) {
      setErrorMessage('Translation failed. Please check your connection.');
    } finally {
      setIsManualTranslating(false);
    }
  };

  // Copy single segment
  const handleCopySegment = (seg: TranslationSegment) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(seg.translatedText);
    setCopiedId(seg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Speak single segment translation
  const handleSpeakSegment = (seg: TranslationSegment) => {
    triggerHaptic('light');
    const tgtObj = getLanguageOption(seg.targetLang);
    TextToSpeechController.speak(seg.translatedText, tgtObj.bcp47, settings.speechSpeed);
  };

  // Share single segment
  const handleShareSegment = async (seg: TranslationSegment) => {
    triggerHaptic('light');
    const shareText = `Original (${seg.sourceLang.toUpperCase()}):\n${seg.originalText}\n\nTranslation (${seg.targetLang.toUpperCase()}):\n${seg.translatedText}\n\n— Translated via Miftah Tools (https://miftahtools.com)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Miftah Tools Translation',
          text: shareText,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedId(seg.id);
      setTimeout(() => setCopiedId(null), 2000);
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
    navigator.clipboard.writeText(allText);
    setCopiedId('all');
    setTimeout(() => setCopiedId(null), 2000);
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

  // Export as PDF
  const handleExportPdf = () => {
    triggerHaptic('selection');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Miftah Tools — Live Speech Translation Session', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
    doc.text(`Language Pair: ${sourceLangObj.label} -> ${targetLangObj.label}`, 14, 31);
    doc.line(14, 35, 196, 35);

    let y = 43;
    doc.setFontSize(11);
    doc.setTextColor(30);

    transcript.forEach((s, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}. [${s.sourceLang.toUpperCase()}]: ${s.originalText}`, 14, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`   [${s.targetLang.toUpperCase()}]: ${s.translatedText}`, 14, y);
      y += 10;
    });

    doc.save(`miftah-translation-${Date.now()}.pdf`);
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
                Free • Live
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
          2. LANGUAGE SELECTION BAR (WITH PROMINENT SWAP)
          ================================================== */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-xs space-y-4">
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
                onChange={(e) => {
                  setSourceLang(e.target.value);
                  if (isListening && recognitionControllerRef.current) {
                    const newBcp = getLanguageOption(e.target.value).bcp47;
                    recognitionControllerRef.current.setLanguage(newBcp);
                  }
                }}
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
                onChange={(e) => setTargetLang(e.target.value)}
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

        {/* Quick Mode & Voice Output Toggles Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E1E7EC]/60 dark:border-slate-800">
          <div className="flex items-center gap-2">
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
            <span>100% Free & Private</span>
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
          4. MAIN LIVE MICROPHONE STAGE (THE HERO ACTION CARD)
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

        {/* Live Interim Speech Bubble (As user speaks) */}
        {(interimSpeech || interimTranslation) && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7F9] dark:bg-slate-800 border border-[#E1E7EC] dark:border-slate-700 text-left space-y-3 animate-in fade-in">
            {interimSpeech && (
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#687587]">
                  {loc.youSaid}:
                </span>
                <p
                  className="text-sm sm:text-base font-semibold text-[#182230] dark:text-white"
                  dir={sourceLangObj.isRTL ? 'rtl' : 'ltr'}
                >
                  {interimSpeech}
                </p>
              </div>
            )}

            {interimTranslation && (
              <div className="pt-2 border-t border-[#E1E7EC] dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B79B7] dark:text-[#38a8f8]">
                  {loc.translation}:
                </span>
                <p
                  className="text-sm sm:text-base font-bold text-[#0B79B7] dark:text-[#38a8f8]"
                  dir={targetLangObj.isRTL ? 'rtl' : 'ltr'}
                >
                  {interimTranslation}
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Manual Fallback Input (For typing or unsupported browsers) */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-xs flex items-center gap-2">
        <input
          type="text"
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleManualTranslate();
          }}
          placeholder={loc.manualInputPlaceholder}
          className="flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm text-[#182230] dark:text-white placeholder:text-[#687587] focus:outline-none"
        />
        <button
          type="button"
          onClick={handleManualTranslate}
          disabled={!manualText.trim() || isManualTranslating}
          className="px-4 py-2 rounded-xl bg-[#0B79B7] hover:bg-[#075B8C] text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all cursor-pointer shrink-0"
        >
          {isManualTranslating ? '...' : loc.manualTranslateBtn}
        </button>
      </div>

      {/* ==================================================
          5. LIVE CONVERSATION TRANSCRIPT & HISTORY
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                aria-label={loc.clearChat}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Transcript Messages List */}
        {transcript.length === 0 ? (
          <div className="text-center py-12 space-y-2 text-[#687587]">
            <Globe className="w-8 h-8 mx-auto opacity-40 text-[#0B79B7]" />
            <p className="text-xs sm:text-sm font-medium max-w-sm mx-auto">
              {loc.emptyTranscript}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
            {transcript.map((seg) => {
              const srcLang = getLanguageOption(seg.sourceLang);
              const tgtLang = getLanguageOption(seg.targetLang);
              const isPeer = seg.speaker === 'peer';

              return (
                <div
                  key={seg.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                    isPeer
                      ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/80 dark:border-purple-900/40'
                      : 'bg-[#F5F7F9] dark:bg-slate-800/60 border-[#E1E7EC] dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isPeer
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                        : 'bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8]'
                    }`}>
                      {isPeer ? `${loc.personB} (${srcLang.label})` : `${loc.personA} (${srcLang.label})`}
                    </span>

                    {/* Bubble Action Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSpeakSegment(seg)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-[#0B79B7] border border-[#E1E7EC] dark:border-slate-700 shadow-xs cursor-pointer"
                        title={loc.speakAgain}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopySegment(seg)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-[#0B79B7] border border-[#E1E7EC] dark:border-slate-700 shadow-xs cursor-pointer"
                        title={loc.copyText}
                      >
                        {copiedId === seg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareSegment(seg)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-[#0B79B7] border border-[#E1E7EC] dark:border-slate-700 shadow-xs cursor-pointer"
                        title={loc.shareText}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Original Spoken Text */}
                  {(settings.displayMode === 'both' || settings.displayMode === 'original') && (
                    <div className="space-y-0.5">
                      <p
                        className="text-sm sm:text-base font-semibold text-[#182230] dark:text-slate-200 leading-relaxed"
                        dir={srcLang.isRTL ? 'rtl' : 'ltr'}
                      >
                        {seg.originalText}
                      </p>
                    </div>
                  )}

                  {/* Translated Output Text */}
                  {(settings.displayMode === 'both' || settings.displayMode === 'translation') && (
                    <div className="pt-2 border-t border-[#E1E7EC]/60 dark:border-slate-700/60 space-y-0.5">
                      <span className="text-[10px] font-bold text-[#0B79B7] dark:text-[#38a8f8] uppercase">
                        {tgtLang.label} {loc.translation}:
                      </span>
                      <p
                        className="text-sm sm:text-base font-bold text-[#0B79B7] dark:text-[#38a8f8] leading-relaxed"
                        dir={tgtLang.isRTL ? 'rtl' : 'ltr'}
                      >
                        {seg.translatedText}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#182230] dark:text-white">
              {loc.confirmClearTitle}
            </h3>
            <p className="text-xs text-[#687587] dark:text-slate-400 leading-relaxed">
              {loc.confirmClearDesc}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-[#182230] dark:text-white hover:bg-slate-200 cursor-pointer"
              >
                {loc.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  setTranscript([]);
                  setShowClearModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
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
