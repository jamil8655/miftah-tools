'use client';

import React, { useState } from 'react';
import { Lock, Unlock, Key, Copy, Check, ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const CIPHER_LOCALES = {
  en: {
    modeEncrypt: 'Encrypt Plaintext',
    modeDecrypt: 'Decrypt Ciphertext',
    inputPlainLabel: 'Message to Encrypt (Plaintext)',
    inputCipherLabel: 'Encrypted Ciphertext (Base64)',
    passLabel: 'Passphrase / Key',
    passPlaceholder: 'Enter secret encryption password...',
    btnEncrypt: 'Encrypt with AES-GCM',
    btnDecrypt: 'Decrypt Ciphertext',
    resultLabel: 'Output Result',
    uuidTitle: 'Cryptographic UUID Generator',
    uuidBtn: 'Generate New UUID v4',
    copied: 'Copied!',
    errorDecrypt: 'Decryption failed: Incorrect password or corrupted ciphertext payload.',
  },
  ur: {
    modeEncrypt: 'ٹیکسٹ انکرپٹ کریں',
    modeDecrypt: 'انکرپٹڈ ٹیکسٹ کھولیں (Decrypt)',
    inputPlainLabel: 'انکرپٹ کرنے کے لیے میسج',
    inputCipherLabel: 'انکرپٹڈ کوڈ (Base64)',
    passLabel: 'خفیہ پاس ورڈ / کی',
    passPlaceholder: 'خفیہ پاس ورڈ درج کریں...',
    btnEncrypt: 'AES-GCM سے انکرپٹ کریں',
    btnDecrypt: 'ڈیکرپٹ کریں',
    resultLabel: 'نتیجہ',
    uuidTitle: 'کرپٹوگرافک UUID جنریٹر',
    uuidBtn: 'نیا UUID بنائیں',
    copied: 'کاپی ہو گیا!',
    errorDecrypt: 'ڈیکرپشن ناکام: پاس ورڈ غلط ہے یا ڈیٹا خراب ہے۔',
  },
  ar: {
    modeEncrypt: 'تشفير النص',
    modeDecrypt: 'فك تشفير النص',
    inputPlainLabel: 'الرسالة المراد تشفيرها',
    inputCipherLabel: 'النص المشفر (Base64)',
    passLabel: 'كلمة المرور / المفتاح السري',
    passPlaceholder: 'أدخل كلمة مرور التشفير السرية...',
    btnEncrypt: 'تشفير باستخدام AES-GCM',
    btnDecrypt: 'فك التشفير',
    resultLabel: 'النتيجة',
    uuidTitle: 'مولد المعرفات الفريدة UUID',
    uuidBtn: 'توليد UUID جديد',
    copied: 'تم النسخ!',
    errorDecrypt: 'فشل فك التشفير: كلمة المرور غير صحيحة أو البيانات تالفة.',
  },
  hi: {
    modeEncrypt: 'टेक्स्ट एन्क्रिप्ट करें',
    modeDecrypt: 'टेक्स्ट डिक्रिप्ट करें',
    inputPlainLabel: 'एन्क्रिप्ट करने के लिए संदेश',
    inputCipherLabel: 'एन्क्रिप्टेड कोड (Base64)',
    passLabel: 'गुप्त पासवर्ड / की (Key)',
    passPlaceholder: 'गुप्त एन्क्रिप्शन पासवर्ड दर्ज करें...',
    btnEncrypt: 'AES-GCM से एन्क्रिप्ट करें',
    btnDecrypt: 'डिक्रिप्ट करें',
    resultLabel: 'आउटपुट परिणाम',
    uuidTitle: 'क्रिप्टोग्राफिक UUID जनरेटर',
    uuidBtn: 'नया UUID v4 जनरेट करें',
    copied: 'कॉपी हो गया!',
    errorDecrypt: 'डिक्रिप्शन विफल: गलत पासवर्ड या दूषित डेटा।',
  },
};

export function TextCipherStudio() {
  const { language } = useI18n();
  const loc = CIPHER_LOCALES[language as keyof typeof CIPHER_LOCALES] || CIPHER_LOCALES.en;

  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [inputText, setInputText] = useState('Top Secret Miftah Tools Document Payload');
  const [passphrase, setPassphrase] = useState('MyStrongP@ssw0rd!2026');
  const [outputResult, setOutputResult] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [uuidList, setUuidList] = useState<string[]>([]);

  // Web Crypto API Key Derivation (PBKDF2 + AES-GCM)
  const getKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const handleEncrypt = async () => {
    setErrorMessage('');
    if (!inputText || !passphrase) return;

    try {
      const enc = new TextEncoder();
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const key = await getKey(passphrase, salt);

      const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv as any },
        key,
        enc.encode(inputText)
      );

      // Pack salt + iv + ciphertext into a single Base64 string
      const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

      let binary = '';
      for (let i = 0; i < combined.byteLength; i++) {
        binary += String.fromCharCode(combined[i]);
      }
      const base64 = btoa(binary);
      setOutputResult(base64);
    } catch (err: any) {
      setErrorMessage(err.message || 'Encryption failed');
    }
  };

  const handleDecrypt = async () => {
    setErrorMessage('');
    if (!inputText || !passphrase) return;

    try {
      const binary = atob(inputText.trim());
      const combined = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        combined[i] = binary.charCodeAt(i);
      }

      if (combined.length < 28) {
        throw new Error('Payload too short to be valid AES-GCM ciphertext');
      }

      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const ciphertext = combined.slice(28);

      const key = await getKey(passphrase, salt);
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as any },
        key,
        ciphertext as any
      );

      const dec = new TextDecoder();
      setOutputResult(dec.decode(decrypted));
    } catch (err: any) {
      setErrorMessage(loc.errorDecrypt);
      setOutputResult('');
    }
  };

  const generateUuid = () => {
    const newUuid = crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
    setUuidList((prev) => [newUuid, ...prev.slice(0, 4)]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Encryption / Decryption Mode Selector */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('encrypt');
              setOutputResult('');
              setErrorMessage('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              mode === 'encrypt'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{loc.modeEncrypt}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('decrypt');
              setOutputResult('');
              setErrorMessage('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              mode === 'decrypt'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Unlock className="w-4 h-4" />
            <span>{loc.modeDecrypt}</span>
          </button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {mode === 'encrypt' ? loc.inputPlainLabel : loc.inputCipherLabel}
          </label>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-brand-600" />
            <span>{loc.passLabel}</span>
          </label>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder={loc.passPlaceholder}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-slate-100"
          />
        </div>

        <button
          type="button"
          onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
          className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {mode === 'encrypt' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          <span>{mode === 'encrypt' ? loc.btnEncrypt : loc.btnDecrypt}</span>
        </button>
      </div>

      {/* Error Output */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
          {errorMessage}
        </div>
      )}

      {/* Cipher Result */}
      {outputResult && (
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{loc.resultLabel}</span>
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(outputResult)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? loc.copied : 'Copy'}</span>
            </button>
          </div>
          <textarea
            readOnly
            rows={3}
            value={outputResult}
            className="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all"
          />
        </div>
      )}

      {/* UUID Section */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>{loc.uuidTitle}</span>
          </h3>
          <button
            type="button"
            onClick={generateUuid}
            className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{loc.uuidBtn}</span>
          </button>
        </div>

        {uuidList.length > 0 && (
          <div className="space-y-2">
            {uuidList.map((u, i) => (
              <div
                key={i}
                onClick={() => copyToClipboard(u)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs flex items-center justify-between text-slate-800 dark:text-slate-200 cursor-pointer hover:border-brand-500 transition-colors"
              >
                <span>{u}</span>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
