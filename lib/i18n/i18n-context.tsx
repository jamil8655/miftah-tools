'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS, Translations } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  autoDetectLanguage: () => Language;
  t: Translations;
  dir: 'ltr' | 'rtl';
  isRtl: boolean;
  isRTL: boolean;
}

/**
 * Automatically detects the user's mobile device / OS language
 * Supports Urdu (ur), Arabic (ar), Hindi (hi), and English (en)
 */
export function detectDeviceSystemLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  const candidates: string[] = [];

  if (Array.isArray(navigator.languages)) {
    candidates.push(...navigator.languages);
  }
  if (navigator.language) {
    candidates.push(navigator.language);
  }
  if ((navigator as any).userLanguage) {
    candidates.push((navigator as any).userLanguage);
  }
  if ((navigator as any).browserLanguage) {
    candidates.push((navigator as any).browserLanguage);
  }

  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue;
    const code = raw.toLowerCase().trim();

    // Urdu (Pakistan, India, Global)
    if (code === 'ur' || code.startsWith('ur-') || code.startsWith('ur_')) {
      return 'ur';
    }

    // Arabic (Saudi Arabia, Egypt, UAE, Gulf, North Africa, Global)
    if (code === 'ar' || code.startsWith('ar-') || code.startsWith('ar_')) {
      return 'ar';
    }

    // Hindi (India, Global)
    if (code === 'hi' || code.startsWith('hi-') || code.startsWith('hi_')) {
      return 'hi';
    }

    // English (US, UK, India, Global)
    if (code === 'en' || code.startsWith('en-') || code.startsWith('en_')) {
      return 'en';
    }
  }

  return 'en';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // 1. Check if user previously chose an explicit language
    const saved = localStorage.getItem('nexora_lang_v2') as Language;
    if (saved && ['en', 'ar', 'ur', 'hi'].includes(saved)) {
      setLanguageState(saved);
    } else {
      // 2. Automatically detect device / system language
      const detected = detectDeviceSystemLanguage();
      setLanguageState(detected);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexora_lang_v2', lang);
    }
    const dir = lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.className = document.documentElement.className
      .replace(/\blang-(en|ur|ar|hi)\b/g, '')
      .trim() + ` lang-${lang}`;
  };

  const autoDetectLanguage = (): Language => {
    const detected = detectDeviceSystemLanguage();
    setLanguage(detected);
    return detected;
  };

  useEffect(() => {
    const dir = language === 'ar' || language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
    document.documentElement.className = document.documentElement.className
      .replace(/\blang-(en|ur|ar|hi)\b/g, '')
      .trim() + ` lang-${language}`;
  }, [language]);

  const dir = language === 'ar' || language === 'ur' ? 'rtl' : 'ltr';
  const isRtl = dir === 'rtl';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <I18nContext.Provider value={{ language, setLanguage, autoDetectLanguage, t, dir, isRtl, isRTL: isRtl }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
