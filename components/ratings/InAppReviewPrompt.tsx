'use client';

import React, { useState, useEffect } from 'react';
import { Star, X, Sparkles, Send, Heart } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { requestInAppReviewNative, isNativeAndroid } from '@/lib/native/android-bridge';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { submitLiveRating } from '@/lib/ratings/rating-service';

const REVIEW_LOCALES = {
  en: {
    title: 'How is your experience with Miftah Tools?',
    subtitle: 'Tap a star to rate our free productivity utilities',
    feedbackPrompt: 'Your feedback helps us continuously improve our 220+ tools.',
    feedbackPlaceholder: 'Share your thoughts, suggestions, or feature requests (optional)...',
    submitBtn: 'Submit Rating',
    submitting: 'Submitting...',
    feedbackSent: 'Thank you for your valuable feedback!',
    maybeLater: 'Maybe Later',
    dontAskAgain: "Don't ask again",
    thankYou: 'Thank you for your support!',
  },
  hi: {
    title: 'Miftah Tools के साथ आपका अनुभव कैसा रहा?',
    subtitle: 'टूल्स की रेटिंग के लिए स्टार पर टैप करें',
    feedbackPrompt: 'आपकी राय 220+ टूल्स को और बेहतर बनाने में मदद करती है।',
    feedbackPlaceholder: 'अपने सुझाव या राय यहाँ लिखें (वैकल्पिक)...',
    submitBtn: 'रेटिंग सबमिट करें',
    submitting: 'सबमिट हो रहा है...',
    feedbackSent: 'आपकी राय हमारे लिए अत्यंत मूल्यवान है, धन्यवाद!',
    maybeLater: 'बाद में',
    dontAskAgain: 'दोबारा न पूछें',
    thankYou: 'सहयोग के लिए धन्यवाद!',
  },
  ur: {
    title: 'مفتاح ٹولز کے ساتھ آپ کا تجربہ کیسا رہا؟',
    subtitle: 'درجہ بندی کے لیے ستارے پر کلک کریں',
    feedbackPrompt: 'آپ کی رائے ہمارے 220+ ٹولز کو مزید بہتر بنانے میں مدد دیتی ہے۔',
    feedbackPlaceholder: 'اپنی قیمتی رائے یا تجاویز درج کریں (اختیاری)...',
    submitBtn: 'ریٹنگ جمع کرائیں',
    submitting: 'جمع ہو رہا ہے...',
    feedbackSent: 'آپ کے تاثرات کا بہت شکریہ!',
    maybeLater: 'بعد میں',
    dontAskAgain: 'دوبارہ نہ پوچھیں',
    thankYou: 'آپ کے تعاون کا شکریہ!',
  },
  ar: {
    title: 'كيف كانت تجربتك مع أدوات مفتاح تولز؟',
    subtitle: 'انقر على النجوم لتقييم تجربتك',
    feedbackPrompt: 'ملاحظاتك تساعدنا على تحسين وتطوير أكثر من 220 أداة باستمرار.',
    feedbackPlaceholder: 'شاركنا اقتراحاتك أو ملاحظاتك (اختياري)...',
    submitBtn: 'إرسال التقييم',
    submitting: 'جاري الإرسال...',
    feedbackSent: 'شكراً جزيلاً لملاحظاتك القيمة!',
    maybeLater: 'لاحقاً',
    dontAskAgain: 'عدم السؤال مجدداً',
    thankYou: 'شكراً لدعمك المتواصل!',
  },
};

const STORAGE_KEYS = {
  COMPLETED_COUNT: 'miftah_completed_actions',
  LAST_REQUESTED: 'miftah_review_last_requested_at',
  NEVER_ASK: 'miftah_review_never_ask',
  SNOOZE_UNTIL: 'miftah_review_snooze_until',
};

// Cooldown period: minimum 14 days between review requests to respect quotas & user experience
const MIN_COOLDOWN_DAYS = 14;
const MIN_COOLDOWN_MS = MIN_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

// Minimum completed useful actions (conversions, compressions, etc.) before first prompt
const MIN_ACTIONS_THRESHOLD = 3;

export function InAppReviewPrompt() {
  const { language, isRTL } = useI18n();
  const { user } = useAuth();
  const loc = REVIEW_LOCALES[language] || REVIEW_LOCALES.en;

  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Frequency-control validation
  const checkShouldPrompt = (force = false): boolean => {
    if (typeof window === 'undefined') return false;
    if (force) return true;

    // 1. User opted out
    if (localStorage.getItem(STORAGE_KEYS.NEVER_ASK) === 'true') return false;

    // 2. Snoozed by user
    const snoozeUntil = parseInt(localStorage.getItem(STORAGE_KEYS.SNOOZE_UNTIL) || '0', 10);
    if (Date.now() < snoozeUntil) return false;

    // 3. Minimum 14-day frequency cooldown
    const lastRequested = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_REQUESTED) || '0', 10);
    if (Date.now() - lastRequested < MIN_COOLDOWN_MS) return false;

    // 4. Action threshold (minimum 3 completed tools)
    const count = parseInt(localStorage.getItem(STORAGE_KEYS.COMPLETED_COUNT) || '0', 10);
    return count >= MIN_ACTIONS_THRESHOLD;
  };

  useEffect(() => {
    // Listen for completion checkpoints (triggered after a file is successfully downloaded / converted)
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{ force?: boolean }>;
      const force = customEvent?.detail?.force || false;

      // 1.5s delay so user first receives and admires their downloaded file
      setTimeout(() => {
        if (!checkShouldPrompt(force)) return;

        if (isNativeAndroid()) {
          // Record prompt timestamp to enforce the 14-day cooldown
          localStorage.setItem(STORAGE_KEYS.LAST_REQUESTED, Date.now().toString());

          // Request official Google Play In-App Review API directly
          // Under Google Play Policy: If it fails or quota is exhausted, continue seamlessly without redirecting to Play Store!
          requestInAppReviewNative();
        } else {
          setIsOpen(true);
          triggerHaptic('medium');
        }
      }, 1500);
    };

    window.addEventListener('miftah:trigger-review-prompt', handleTrigger);

    return () => {
      window.removeEventListener('miftah:trigger-review-prompt', handleTrigger);
    };
  }, []);

  const handleSelectStar = (selected: number) => {
    setRating(selected);
    triggerHaptic('selection');
  };

  // Submit community rating (Web fallback only — native Android uses Google Play sheet)
  const handleSubmitRating = async () => {
    setIsSubmitting(true);
    triggerHaptic('medium');
    localStorage.setItem(STORAGE_KEYS.LAST_REQUESTED, Date.now().toString());

    try {
      await submitLiveRating({
        userName: user?.name || 'Community User',
        userEmail: user?.email || '',
        userId: user?.uid || '',
        rating: rating || 5,
        toolName: 'Miftah Tools Web App',
        toolSlug: 'miftah-app',
        comment: feedbackText.trim() || `Rated ${rating} stars`,
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch (e) {
      console.warn('Rating submission notice:', e);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // User clicked "Maybe Later" (snooze for 7 days)
  const handleSnooze = () => {
    triggerHaptic('selection');
    const snoozeTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEYS.SNOOZE_UNTIL, snoozeTime.toString());
    setIsOpen(false);
  };

  // User clicked "Don't ask again"
  const handleNeverAsk = () => {
    triggerHaptic('selection');
    localStorage.setItem(STORAGE_KEYS.NEVER_ASK, 'true');
    setIsOpen(false);
  };

  // Native Android uses the Google Play In-App Review dialog directly; Web dialog only renders on web when triggered
  if (isNativeAndroid() || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={handleSnooze}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Close"
          aria-label="Close review dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-8 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm animate-bounce">
              <Heart className="w-8 h-8 fill-current" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{loc.thankYou}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{loc.feedbackSent}</p>
          </div>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {loc.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {loc.subtitle}
              </p>
            </div>

            {/* Interactive 1-5 Star Selection (No Gating, Free User Choice) */}
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleSelectStar(star)}
                    className="p-1.5 transition-transform hover:scale-125 active:scale-95 focus:outline-hidden"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        isLit
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Optional Feedback Input */}
            <div className="space-y-2 text-left rtl:text-right">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {loc.feedbackPrompt}
              </p>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
                placeholder={loc.feedbackPlaceholder}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/40 resize-none transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitRating}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? loc.submitting : loc.submitBtn}</span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 px-1">
                <button
                  type="button"
                  onClick={handleSnooze}
                  className="hover:text-slate-600 dark:hover:text-slate-300 font-semibold"
                >
                  {loc.maybeLater}
                </button>
                <button
                  type="button"
                  onClick={handleNeverAsk}
                  className="hover:text-slate-600 dark:hover:text-slate-300 font-semibold"
                >
                  {loc.dontAskAgain}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Meaningful Task Checkpoint:
 * Called after a successful file conversion, compression, or download.
 * Enforces action threshold and frequency cooldown before triggering the review prompt.
 */
export function recordActionAndMaybePromptReview() {
  if (typeof window === 'undefined') return;

  const current = parseInt(localStorage.getItem(STORAGE_KEYS.COMPLETED_COUNT) || '0', 10);
  const next = current + 1;
  localStorage.setItem(STORAGE_KEYS.COMPLETED_COUNT, next.toString());

  // Check 14-day frequency cooldown
  const lastRequested = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_REQUESTED) || '0', 10);
  if (Date.now() - lastRequested < MIN_COOLDOWN_MS) {
    return;
  }

  // Trigger on meaningful milestones: 3rd successful tool run, 8th tool run, and every 15 thereafter
  if (next === 3 || next === 8 || (next > 8 && next % 15 === 0)) {
    window.dispatchEvent(new CustomEvent('miftah:trigger-review-prompt'));
  }
}
