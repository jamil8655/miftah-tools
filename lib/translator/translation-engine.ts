import { TranslationResponse } from './types';

// In-memory LRU cache to prevent duplicate lookups
const translationCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

function getCacheKey(text: string, sourceLang: string, targetLang: string): string {
  return `${sourceLang.toLowerCase()}->${targetLang.toLowerCase()}:${text.trim().toLowerCase()}`;
}

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ');
}

/**
 * Provider 1: MyMemory Public Translation API (Free tier)
 */
async function translateWithMyMemory(
  text: string,
  sourceLang: string,
  targetLang: string,
  signal?: AbortSignal
): Promise<string> {
  const langPair = `${sourceLang}|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${encodeURIComponent(langPair)}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`MyMemory HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data?.responseData?.translatedText) {
    const result = decodeHtmlEntities(data.responseData.translatedText).trim();
    // Validate that MyMemory didn't return an error message as the translation
    if (result && !result.toLowerCase().startsWith('mymemory warning')) {
      return result;
    }
  }

  throw new Error('MyMemory translation payload empty');
}

/**
 * Provider 2: Google Web Translate Free API Fallback
 */
async function translateWithGoogleGtx(
  text: string,
  sourceLang: string,
  targetLang: string,
  signal?: AbortSignal
): Promise<string> {
  const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
  const tl = targetLang;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
    sl
  )}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Google GTX HTTP ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const combined = data[0]
      .map((chunk: any) => (Array.isArray(chunk) && typeof chunk[0] === 'string' ? chunk[0] : ''))
      .join('');
    if (combined) {
      return decodeHtmlEntities(combined).trim();
    }
  }

  throw new Error('Google GTX translation payload empty');
}

/**
 * Provider 3: Lingva / Free Public Instance Fallback
 */
async function translateWithLingva(
  text: string,
  sourceLang: string,
  targetLang: string,
  signal?: AbortSignal
): Promise<string> {
  const instances = [
    'https://lingva.ml/api/v1',
    'https://translate.plausibility.cloud/api/v1',
  ];

  for (const baseUrl of instances) {
    try {
      const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
      const url = `${baseUrl}/${encodeURIComponent(sl)}/${encodeURIComponent(
        targetLang
      )}/${encodeURIComponent(text)}`;
      const response = await fetch(url, { signal });
      if (response.ok) {
        const data = await response.json();
        if (data?.translation) {
          return decodeHtmlEntities(data.translation).trim();
        }
      }
    } catch {
      // continue to next instance
    }
  }

  throw new Error('Lingva instances unavailable');
}

/**
 * Main translation dispatcher with intelligent fallback & caching
 */
export async function translateSpeechText(
  text: string,
  sourceLang: string,
  targetLang: string,
  signal?: AbortSignal
): Promise<TranslationResponse> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { translatedText: '', provider: 'cache' };
  }

  // If source and target are identical
  if (sourceLang.toLowerCase() === targetLang.toLowerCase()) {
    return { translatedText: trimmed, provider: 'cache' };
  }

  const cacheKey = getCacheKey(trimmed, sourceLang, targetLang);
  if (translationCache.has(cacheKey)) {
    return {
      translatedText: translationCache.get(cacheKey)!,
      provider: 'cache',
    };
  }

  // Fallback waterfall: Google GTX -> MyMemory -> Lingva
  let translatedText = '';
  let usedProvider: TranslationResponse['provider'] = 'google';

  try {
    translatedText = await translateWithGoogleGtx(trimmed, sourceLang, targetLang, signal);
    usedProvider = 'google';
  } catch {
    try {
      translatedText = await translateWithMyMemory(trimmed, sourceLang, targetLang, signal);
      usedProvider = 'mymemory';
    } catch {
      try {
        translatedText = await translateWithLingva(trimmed, sourceLang, targetLang, signal);
        usedProvider = 'lingva';
      } catch (err) {
        // As a graceful last resort if offline or blocked, return original text
        console.warn('All translation providers failed:', err);
        return {
          translatedText: trimmed,
          provider: 'fallback',
        };
      }
    }
  }

  if (translatedText) {
    if (translationCache.size >= MAX_CACHE_SIZE) {
      const firstKey = translationCache.keys().next().value;
      if (firstKey) translationCache.delete(firstKey);
    }
    translationCache.set(cacheKey, translatedText);
  }

  return {
    translatedText,
    provider: usedProvider,
  };
}
