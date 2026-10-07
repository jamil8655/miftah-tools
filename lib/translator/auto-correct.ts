/**
 * Miftah Tools — Smart Phonetic & Semantic Auto-Correct Engine
 * Real-time vocabulary & phonetic normalization for Urdu, Arabic, Hindi, and English speech recognition.
 */

// Common phonetic and speech-recognition mistranscriptions in Urdu
const URDU_CORRECTIONS: Record<string, string> = {
  // Religious & Greeting terms
  'اہجان': 'احسان',
  'احجان': 'احسان',
  'اہسان': 'احسان',
  'ازان': 'اذان',
  'آذان': 'اذان',
  'انشااللہ': 'ان شاء اللہ',
  'انشاءاللہ': 'ان شاء اللہ',
  'ماشااللہ': 'ما شاء اللہ',
  'ماشاءاللہ': 'ما شاء اللہ',
  'سبحاناللہ': 'سبحان اللہ',
  'الحمدللہ': 'الحمد للہ',
  'سلام علیکم': 'السلام علیکم',
  'اسلام علیکم': 'السلام علیکم',
  'اسلام و علیکم': 'السلام علیکم',
  'وعلیکم سلام': 'وعلیکم السلام',
  'وعلیکم اسسلام': 'وعلیکم السلام',
  'جزاک اللہ': 'جزاکم اللہ',
  'فیامان اللہ': 'فی امان اللہ',
  'فی اماناللہ': 'فی امان اللہ',
  
  // Common Conversational terms
  'باہت': 'بہت',
  'بوہت': 'بہت',
  'بہوت': 'بہت',
  'کیونکے': 'کیونکہ',
  'کیوںکے': 'کیونکہ',
  'کیوں کہ': 'کیونکہ',
  'چنانچے': 'چنانچہ',
  'حالانکے': 'حالانکہ',
  'بلکل': 'بالکل',
  'علحیدہ': 'علیحدہ',
  'الحدہ': 'علیحدہ',
  'ضرورط': 'ضرورت',
  'معلومات': 'معلومات',
  'شُکریہ': 'شکریہ',
  'شکریا': 'شکریہ',
  'مہربانی': 'مہربانی',
  'تکلیف': 'تکلیف',
  'موبائل': 'موبائل',
  'کمپیوٹر': 'کمپیوٹر',
  'انٹرنیٹ': 'انٹرنیٹ',
  'ویڈیو': 'ویڈیو',
  'آڈیو': 'آڈیو',
  'تصویر': 'تصویر',
  'ترجمہ': 'ترجمہ',
  'مفتاح': 'مفتاح',
  'ٹولز': 'ٹولز',
};

// Common Arabic speech-recognition mistranscriptions & orthography
const ARABIC_CORRECTIONS: Record<string, string> = {
  'شكرن': 'شكراً',
  'عفون': 'عفواً',
  'اهلن': 'أهلاً',
  'سهلن': 'سهلاً',
  'اهلاً وسهلاً': 'أهلاً وسهلاً',
  'انشاالله': 'إن شاء الله',
  'ان شاءالله': 'إن شاء الله',
  'ماشاالله': 'ما شاء الله',
  'الحمدلله': 'الحمد لله',
  'سبحانالله': 'سبحان الله',
  'جزاك الله خير': 'جزاك الله خيراً',
  'سلام عليكم': 'السلام عليكم',
  'وعليكم سلام': 'وعليكم السلام',
  'صباح خير': 'صباح الخير',
  'مساء خير': 'مساء الخير',
  'مع سلامه': 'مع السلامة',
  'مفتاح': 'مفتاح',
};

// Common Hindi speech-recognition mistranscriptions
const HINDI_CORRECTIONS: Record<string, string> = {
  'अहजान': 'एहसान',
  'अहसान': 'एहसान',
  'अज़ान': 'अज़ान',
  'नमसते': 'नमस्ते',
  'ध्न्यवाद': 'धन्यवाद',
  'क्रपया': 'कृपया',
  'क्रिपा': 'कृपा',
  'क्युंकी': 'क्योंकि',
  'क्युकी': 'क्योंकि',
  'क्योकि': 'क्योंकि',
  'हालान्कि': 'हालांकि',
  'अलविदा': 'अलविदा',
  'सुप्रभात': 'सुप्रभात',
  'शुभरात्री': 'शुभ रात्रि',
  'मिफ्ताह': 'मिफ़्ताह',
  'टूल्स': 'टूल्स',
};

// Common English speech recognition fixes
const ENGLISH_CORRECTIONS: Record<string, string> = {
  'gonna': 'going to',
  'wanna': 'want to',
  'gotta': 'got to',
  'cant': "can't",
  'dont': "don't",
  'wont': "won't",
  'didnt': "didn't",
  'isnt': "isn't",
  'arent': "aren't",
  'im': "I'm",
  'ive': "I've",
  'id': "I'd",
  'youre': "you're",
  'theyre': "they're",
  'weve': "we've",
  'miftah tools': 'Miftah Tools',
  'miftah': 'Miftah',
};

/**
 * Clean & smart auto-correct function for spoken text
 */
export function autoCorrectSpokenText(text: string, langCode: string): string {
  if (!text || !text.trim()) return '';

  let cleaned = text.trim();
  const normalizedLang = langCode.toLowerCase().split('-')[0];

  if (normalizedLang === 'ur') {
    // Apply multi-word corrections first
    for (const [wrong, right] of Object.entries(URDU_CORRECTIONS)) {
      const regex = new RegExp(`(^|\\s)${wrong}(\\s|$)`, 'gi');
      cleaned = cleaned.replace(regex, `$1${right}$2`);
    }

    // Word by word cleanup
    cleaned = cleaned
      .split(/\s+/)
      .map((w) => URDU_CORRECTIONS[w] || w)
      .join(' ');
  } else if (normalizedLang === 'ar') {
    for (const [wrong, right] of Object.entries(ARABIC_CORRECTIONS)) {
      const regex = new RegExp(`(^|\\s)${wrong}(\\s|$)`, 'gi');
      cleaned = cleaned.replace(regex, `$1${right}$2`);
    }

    cleaned = cleaned
      .split(/\s+/)
      .map((w) => ARABIC_CORRECTIONS[w] || w)
      .join(' ');
  } else if (normalizedLang === 'hi') {
    for (const [wrong, right] of Object.entries(HINDI_CORRECTIONS)) {
      const regex = new RegExp(`(^|\\s)${wrong}(\\s|$)`, 'gi');
      cleaned = cleaned.replace(regex, `$1${right}$2`);
    }

    cleaned = cleaned
      .split(/\s+/)
      .map((w) => HINDI_CORRECTIONS[w] || w)
      .join(' ');
  } else if (normalizedLang === 'en') {
    for (const [wrong, right] of Object.entries(ENGLISH_CORRECTIONS)) {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      cleaned = cleaned.replace(regex, right);
    }
  }

  // Remove multiple adjacent spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

  return cleaned;
}
