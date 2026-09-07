'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useI18n } from '@/lib/i18n/i18n-context';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase-client';
import { Language } from '@/lib/i18n/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup' | 'forgot';
}

const AUTH_LOCALES: Record<Language, {
  subtitle: string;
  enterEmailPassword: string;
  enterAllFields: string;
  registrationFailed: string;
  enterEmailForReset: string;
  fullNamePlaceholder: string;
  passwordPlaceholder: string;
  resetLinkSentSuccess: string;
  sendResetFailed: string;
}> = {
  en: {
    subtitle: '100% Client-Side Secure Authentication',
    enterEmailPassword: 'Please enter both email and password.',
    enterAllFields: 'Please enter your full name, email, and password.',
    registrationFailed: 'Registration failed. Please try again.',
    enterEmailForReset: 'Please enter your email address to receive the password reset link.',
    fullNamePlaceholder: 'Full Name',
    passwordPlaceholder: 'At least 6 characters',
    resetLinkSentSuccess: 'Password reset link sent! Check your inbox.',
    sendResetFailed: 'Failed to send password reset link.',
  },
  ur: {
    subtitle: '100% کلائنٹ سائیڈ محفوظ اکاؤنٹ تصدیق',
    enterEmailPassword: 'براہ کرم ای میل اور پاس ورڈ دونوں درج کریں۔',
    enterAllFields: 'براہ کرم اپنا پورا نام، ای میل اور پاس ورڈ درج کریں۔',
    registrationFailed: 'رجسٹریشن ناکام ہو گئی۔ دوبارہ کوشش کریں۔',
    enterEmailForReset: 'ری سیٹ لنک حاصل کرنے کے لیے اپنا ای میل درج کریں۔',
    fullNamePlaceholder: 'پورا نام',
    passwordPlaceholder: 'کم از کم 6 حروف',
    resetLinkSentSuccess: 'پاس ورڈ ری سیٹ لنک ای میل کر دیا گیا ہے!',
    sendResetFailed: 'پاس ورڈ ری سیٹ لنک بھیجنے میں خرابی۔',
  },
  ar: {
    subtitle: 'تسجيل دخول آمن محلياً بنسبة 100%',
    enterEmailPassword: 'يرجى إدخال البريد الإلكتروني وكلمة المرور معاً.',
    enterAllFields: 'يرجى إدخال الاسم الكامل والبريد الإلكتروني وكلمة المرور.',
    registrationFailed: 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.',
    enterEmailForReset: 'يرجى إدخال بريدك الإلكتروني لتلقي رابط إعادة التعيين.',
    fullNamePlaceholder: 'الاسم الكامل',
    passwordPlaceholder: '6 أحرف على الأقل',
    resetLinkSentSuccess: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك!',
    sendResetFailed: 'تعذر إرسال رابط إعادة التعيين.',
  },
  hi: {
    subtitle: '100% सुरक्षित क्लाइंट-साइड प्रमाणीकरण',
    enterEmailPassword: 'कृपया ईमेल और पासवर्ड दोनों दर्ज करें।',
    enterAllFields: 'कृपया अपना पूरा नाम, ईमेल और पासवर्ड दर्ज करें।',
    registrationFailed: 'पंजीकरण विफल। कृपया पुनः प्रयास करें।',
    enterEmailForReset: 'पासवर्ड रीसेट लिंक प्राप्त करने के लिए ईमेल दर्ज करें।',
    fullNamePlaceholder: 'पूरा नाम',
    passwordPlaceholder: 'कम से कम 6 अक्षर',
    resetLinkSentSuccess: 'पासवर्ड रीसेट लिंक भेज दिया गया है!',
    sendResetFailed: 'रीसेट लिंक भेजने में विफल।',
  },
};

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = 'signin',
}: AuthModalProps) {
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const { t, language, isRtl, isRTL } = useI18n();
  const loc = AUTH_LOCALES[language] || AUTH_LOCALES.en;
  const isRightToLeft = isRTL || isRtl;
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>(defaultTab);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const resetState = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    resetState();
    setIsLoading(true);
    const res = await loginWithGoogle();
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg(t.auth.loginSuccess);
      setTimeout(() => onClose(), 600);
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    if (!email.trim() || !password) {
      setErrorMsg(loc.enterEmailPassword);
      return;
    }
    setIsLoading(true);
    const res = await loginWithEmail(email.trim(), password);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg(t.auth.loginSuccess);
      setTimeout(() => onClose(), 600);
    } else {
      setErrorMsg(t.auth.invalidCredentials);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    if (!email.trim() || !password || !name.trim()) {
      setErrorMsg(loc.enterAllFields);
      return;
    }
    if (password.length < 6) {
      setErrorMsg(t.auth.passwordMinLength);
      return;
    }
    setIsLoading(true);
    const res = await signupWithEmail(email.trim(), password, name.trim());
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg(t.auth.accountCreatedSuccess);
      setTimeout(() => onClose(), 800);
    } else {
      setErrorMsg(res.error || loc.registrationFailed);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    if (!email.trim()) {
      setErrorMsg(loc.enterEmailForReset);
      return;
    }
    setIsLoading(true);
    try {
      if (auth) {
        await sendPasswordResetEmail(auth, email.trim());
        setSuccessMsg(loc.resetLinkSentSuccess);
      }
    } catch (err: any) {
      setErrorMsg(err.message || loc.sendResetFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-brand-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {tab === 'signin'
                  ? t.auth.signIn
                  : tab === 'signup'
                  ? t.auth.signUp
                  : t.auth.resetPassword}
              </h2>
              <p className="text-[11px] text-slate-400">Miftah Tools Firebase Auth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab !== 'forgot' && (
            <>
              {/* Google 1-Click OAuth */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-xs transition-all flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{t.auth.continueWithGoogle}</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                <span className="text-[11px] font-bold text-slate-400 uppercase">{t.auth.orEmail}</span>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              </div>
            </>
          )}

          {/* Form */}
          {tab === 'signin' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.auth.emailAddress}</label>
                <div className="relative">
                  <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden ${
                      isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.auth.password}</label>
                  <button
                    type="button"
                    onClick={() => {
                      resetState();
                      setTab('forgot');
                    }}
                    className="text-[11px] font-bold text-brand-600 hover:underline"
                  >
                    {t.auth.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden ${
                      isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${isRtl ? 'left-3' : 'right-3'}`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded-md border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>{t.auth.rememberMe}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? t.common.loading : t.auth.signIn}
              </button>

              <p className="text-xs text-center text-slate-500">
                {t.auth.dontHaveAccount}{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetState();
                    setTab('signup');
                  }}
                  className="font-bold text-brand-600 hover:underline"
                >
                  {t.auth.createAccount}
                </button>
              </p>
            </form>
          )}

          {tab === 'signup' && (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.auth.fullName}</label>
                <div className="relative">
                  <User className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className={`w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden ${
                      isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.auth.emailAddress}</label>
                <div className="relative">
                  <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden ${
                      isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.auth.password}</label>
                <div className="relative">
                  <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className={`w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden ${
                      isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${isRtl ? 'left-3' : 'right-3'}`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? t.common.loading : t.auth.createAccount}
              </button>

              <p className="text-xs text-center text-slate-500">
                {t.auth.alreadyHaveAccount}{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetState();
                    setTab('signin');
                  }}
                  className="font-bold text-brand-600 hover:underline"
                >
                  {t.auth.signIn}
                </button>
              </p>
            </form>
          )}

          {tab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  resetState();
                  setTab('signin');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                <span>{t.common.back} to {t.auth.signIn}</span>
              </button>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.auth.emailAddress}</label>
                <div className="relative">
                  <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden ${
                      isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isLoading ? t.common.loading : t.auth.sendResetLink}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
