export interface LanguageOption {
  code: string;
  label: string;
  nativeName: string;
  flag: string;
  bcp47: string;
  isRTL?: boolean;
}

export interface TranslationSegment {
  id: string;
  speaker: 'user' | 'peer';
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
  isFinal: boolean;
  audioDuration?: number;
}

export interface TranslatorSettings {
  voiceOutput: boolean;
  autoDetect: boolean;
  conversationMode: boolean;
  speechSpeed: number; // 0.8, 1.0, 1.2
  displayMode: 'both' | 'translation' | 'original';
  autoTurnDetection: boolean;
}

export interface SpeechRecognitionResultState {
  interimText: string;
  finalText: string;
  isListening: boolean;
  confidence: number;
  error?: string;
}

export interface TranslationResponse {
  translatedText: string;
  detectedSourceLang?: string;
  provider: 'cache' | 'mymemory' | 'lingva' | 'google' | 'fallback';
}
