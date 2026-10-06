import { LanguageOption } from './types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇺🇸', bcp47: 'en-US' },
  { code: 'ur', label: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', bcp47: 'ur-PK', isRTL: true },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', bcp47: 'ar-SA', isRTL: true },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', bcp47: 'hi-IN' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', bcp47: 'bn-BD' },
  { code: 'tr', label: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', bcp47: 'tr-TR' },
  { code: 'fa', label: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', bcp47: 'fa-IR', isRTL: true },
  { code: 'fr', label: 'French', nativeName: 'Français', flag: '🇫🇷', bcp47: 'fr-FR' },
  { code: 'es', label: 'Spanish', nativeName: 'Español', flag: '🇪🇸', bcp47: 'es-ES' },
  { code: 'de', label: 'German', nativeName: 'Deutsch', flag: '🇩🇪', bcp47: 'de-DE' },
  { code: 'id', label: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', bcp47: 'id-ID' },
  { code: 'ms', label: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', bcp47: 'ms-MY' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', bcp47: 'pa-IN' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', bcp47: 'ta-IN' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', bcp47: 'te-IN' },
  { code: 'ru', label: 'Russian', nativeName: 'Русский', flag: '🇷🇺', bcp47: 'ru-RU' },
  { code: 'zh', label: 'Chinese', nativeName: '中文', flag: '🇨🇳', bcp47: 'zh-CN' },
  { code: 'ja', label: 'Japanese', nativeName: '日本語', flag: '🇯🇵', bcp47: 'ja-JP' },
  { code: 'ko', label: 'Korean', nativeName: '한국어', flag: '🇰🇷', bcp47: 'ko-KR' },
  { code: 'it', label: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', bcp47: 'it-IT' },
  { code: 'pt', label: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', bcp47: 'pt-BR' },
];

export function getLanguageOption(code: string): LanguageOption {
  return (
    SUPPORTED_LANGUAGES.find((lang) => lang.code.toLowerCase() === code.toLowerCase()) ||
    SUPPORTED_LANGUAGES[0]
  );
}

export function isRTLLanguage(code: string): boolean {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase());
  return !!lang?.isRTL;
}
