'use client';

import React, { useState, useEffect } from 'react';
import { Star, X, Sparkles, Send, ExternalLink, Heart, MessageSquareHeart } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { requestInAppReviewNative, openPlayStorePageNative, isNativeAndroid } from '@/lib/native/android-bridge';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { submitLiveRating } from '@/lib/ratings/rating-service';

const REVIEW_LOCALES = {
  en: {
    title: 'Enjoying Miftah Tools?',
    subtitle: 'Tap a star to rate your experience',
    greatHeader: 'Thank you so much!',
    greatDesc:
      'We are delighted Miftah Tools helped you! Would you mind taking 10 seconds to leave a 5-star review on Google Play? It helps us keep all 220+ tools free forever.',
    rateOnPlayStore: 'Rate on Google Play Store',
    improveHeader: 'How can we improve?',
    improveDesc: 'We are sorry your experience was not ideal. Please tell us what we can do better:',
    feedbackPlaceholder: 'Write your thoughts, missing features, or suggestions...',
    sendFeedback: 'Send Feedback',
    sending: 'Sending...',
    feedbackSent: 'Thank you! Your feedback helps us improve.',
    maybeLater: 'Maybe Later',
    dontAskAgain: "Don't ask again",
    thankYou: 'Thank you for your support!',
  },
  hi: {
    title: 'क्या आपको Miftah Tools पसंद आ रहा है?',
    subtitle: 'अपना अनुभव साझा करने के लिए स्टार पर टैप करें',
    greatHeader: 'आपका बहुत-बहुत धन्यवाद!',
    greatDesc:
      'हमें खुशी है कि Miftah Tools आपके काम आया! क्या आप Google Play पर 5-स्टार रिव्यू देकर हमारा हौसला बढ़ाएंगे? इससे सभी 220+ टूल्स हमेशा मुफ़्त रहेंगे।',
    rateOnPlayStore: 'Google Play पर रिव्यू दें',
    improveHeader: 'हम इसे और बेहतर कैसे बनाएं?',
    improveDesc: 'हमें खेद है कि आपका अनुभव मनमुताबिक नहीं रहा। कृपया बताएं कि हम क्या सुधार कर सकते हैं:',
    feedbackPlaceholder: 'अपने सुझाव, समस्या या मनपसंद फ़ीचर यहाँ लिखें...',
    sendFeedback: 'फीडबैक भेजें',
    sending: 'भेजा जा रहा है...',
    feedbackSent: 'धन्यवाद! आपकी राय हमारे लिए बहुत मूल्यवान है।',
    maybeLater: 'बाद में याद दिलाएं',
    dontAskAgain: 'दोबारा न पूछें',
    thankYou: 'आपके सहयोग के लिए धन्यवाद!',
  },
  ur: {
    title: 'کیا آپ کو مفتاح ٹولز پسند آیا؟',
    subtitle: 'اپنے تجربے کی درجہ بندی کے لیے ستارے پر ٹیپ کریں',
    greatHeader: 'آپ کا بہت بہت شکریہ!',
    greatDesc:
      'ہمیں خوشی ہے کہ مفتاح ٹولز آپ کے کام آیا! کیا آپ گوگل پلے پر 5 اسٹار ریویو دے کر ہماری حوصلہ افزائی کریں گے؟ اس سے تمام 220+ ٹولز ہمیشہ مفت رہیں گے۔',
    rateOnPlayStore: 'گوگل پلے پر ریویو دیں',
    improveHeader: 'ہم اسے مزید بہتر کیسے بنائیں؟',
    improveDesc: 'ہمیں افسوس ہے کہ آپ کا تجربہ توقع کے مطابق نہیں رہا۔ براہ کرم بتائیں کہ ہم کیا بہتری لا سکتے ہیں:',
    feedbackPlaceholder: 'اپنی رائے، مسئلہ یا تجاویز یہاں لکھیں...',
    sendFeedback: 'رائے بھیجیں',
    sending: 'بھیجا جا رہا ہے...',
    feedbackSent: 'شکریہ! آپ کی رائے ہمارے لیے بہت قیمتی ہے۔',
    maybeLater: 'بعد میں',
    dontAskAgain: 'دوبارہ نہ پوچھیں',
    thankYou: 'آپ کے تعاون کا شکریہ!',
  },
  ar: {
    title: 'هل يعجبك تطبيق مفتاح تولز؟',
    subtitle: 'انقر على نجمة لتقييم تجربتك',
    greatHeader: 'شكراً جزيلاً لك!',
    greatDesc:
      'يسعدنا أن التطبيق ساعدك! هل تمانع في تخصيص 10 ثوانٍ لترك تقييم 5 نجوم على متجر جوجل بلاي؟ هذا يساعدنا على إبقاء جميع الأدوات مجانية للجميع.',
    rateOnPlayStore: 'التقييم على متجر جوجل بلاي',
    improveHeader: 'كيف يمكننا التحسين؟',
    improveDesc: 'نعتذر إذا لم تكن التجربة مثالية. يرجى إخبارنا بما يمكننا فعله لتحسين التطبيق:',
    feedbackPlaceholder: 'اكتب اقتراحاتك أو ملاحظاتك هنا...',
    sendFeedback: 'إرسال الملاحظات',
    sending: 'جاري الإرسال...',
    feedbackSent: 'شكراً لك! ملاحظاتك تساعدنا على التطور دائماً.',
    maybeLater: 'لاحقاً',
    dontAskAgain: 'عدم السؤال مجدداً',
    thankYou: 'شكراً لدعمك المتواصل!',
  },
};

const STORAGE_KEYS = {
  COMPLETED_COUNT: 'miftah_completed_actions',
  REVIEW_DONE: 'miftah_review_completed',
  NEVER_ASK: 'miftah_review_never_ask',
  SNOOZE_UNTIL: 'miftah_review_snooze_until',
};

export function InAppReviewPrompt() {
  const { language, isRTL } = useI18n();
  const { user } = useAuth();
  const loc = REVIEW_LOCALES[language] || REVIEW_LOCALES.en;

  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check if review prompt should be shown
  const checkShouldPrompt = (force = false): boolean => {
    if (typeof window === 'undefined') return false;
    if (force) return true;

    // If user already reviewed or chose never ask again, don't show
    if (localStorage.getItem(STORAGE_KEYS.REVIEW_DONE) === 'true') return false;
    if (localStorage.getItem(STORAGE_KEYS.NEVER_ASK) === 'true') return false;

    // If snoozed ("Later"), check if snooze period (3 days) has elapsed
    const snoozeUntil = parseInt(localStorage.getItem(STORAGE_KEYS.SNOOZE_UNTIL) || '0', 10);
    if (Date.now() < snoozeUntil) return false;

    // Check action threshold (at least 2 actions completed)
    const count = parseInt(localStorage.getItem(STORAGE_KEYS.COMPLETED_COUNT) || '0', 10);
    return count >= 2;
  };

  useEffect(() => {
    // 1. Listen for global review trigger events from downloads / tool completions
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{ force?: boolean }>;
      const force = customEvent?.detail?.force || false;

      // Small delay so user finishes admiring their downloaded file before prompt appears
      setTimeout(() => {
        if (checkShouldPrompt(force)) {
          if (isNativeAndroid()) {
            // Directly trigger official Google Play In-App Review API without any web UI
            const triggered = requestInAppReviewNative();
            if (!triggered) {
              openPlayStorePageNative();
            }
            localStorage.setItem(STORAGE_KEYS.REVIEW_DONE, 'true');
          } else {
            setIsOpen(true);
            triggerHaptic('medium');
          }
        }
      }, 1200);
    };

    window.addEventListener('miftah:trigger-review-prompt', handleTrigger);

    // 2. Also check on mount after initial session activity
    const timer = setTimeout(() => {
      if (checkShouldPrompt(false)) {
        if (isNativeAndroid()) {
          requestInAppReviewNative();
          localStorage.setItem(STORAGE_KEYS.REVIEW_DONE, 'true');
        } else {
          setIsOpen(true);
        }
      }
    }, 12000);

    return () => {
      window.removeEventListener('miftah:trigger-review-prompt', handleTrigger);
      clearTimeout(timer);
    };
  }, []);

  const handleSelectStar = (selected: number) => {
    setRating(selected);
    triggerHaptic('selection');
  };

  // User clicked "Rate on Google Play"
  const handleRateOnPlayStore = () => {
    triggerHaptic('success');
    localStorage.setItem(STORAGE_KEYS.REVIEW_DONE, 'true');

    // If on native Android app: trigger in-app review or direct Play Store intent
    if (isNativeAndroid()) {
      const nativeTriggered = requestInAppReviewNative();
      if (!nativeTriggered) {
        openPlayStorePageNative();
      }
    } else {
      openPlayStorePageNative();
    }

    // Record review in Firestore as verified 5-star rating
    submitLiveRating({
      userName: user?.name || 'Verified App User',
      userEmail: user?.email || '',
      userId: user?.uid || '',
      rating: 5,
      toolName: 'Miftah Tools Mobile App',
      toolSlug: 'android-app',
      comment: 'Rated 5 stars on Google Play Store!',
    }).catch(() => {});

    setIsSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 2000);
  };

  // User clicked "Send Feedback" (for 1-3 stars)
  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return;
    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      await submitLiveRating({
        userName: user?.name || 'Feedback User',
        userEmail: user?.email || '',
        userId: user?.uid || '',
        rating: rating || 3,
        toolName: 'Miftah Tools User Feedback',
        toolSlug: 'app-feedback',
        comment: feedbackText.trim(),
      });
      localStorage.setItem(STORAGE_KEYS.REVIEW_DONE, 'true');
      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 2500);
    } catch (e) {
      console.warn('Feedback save note:', e);
      localStorage.setItem(STORAGE_KEYS.REVIEW_DONE, 'true');
      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  // User clicked "Maybe Later" (हटा दिया / बाद में)
  const handleSnooze = () => {
    triggerHaptic('selection');
    // Snooze for 3 days (3 * 24 * 60 * 60 * 1000 ms)
    const snoozeTime = Date.now() + 3 * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEYS.SNOOZE_UNTIL, snoozeTime.toString());
    setIsOpen(false);
  };

  // User clicked "Don't ask again"
  const handleNeverAsk = () => {
    triggerHaptic('selection');
    localStorage.setItem(STORAGE_KEYS.NEVER_ASK, 'true');
    setIsOpen(false);
  };

  // Close with top X button
  const handleDismiss = () => {
    handleSnooze();
  };

  if (isNativeAndroid() || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
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
            {/* Mascot / Icon Badge */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>

            {/* Header Text */}
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {rating >= 4 ? loc.greatHeader : rating > 0 && rating <= 3 ? loc.improveHeader : loc.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {rating >= 4 ? loc.greatDesc : rating > 0 && rating <= 3 ? loc.improveDesc : loc.subtitle}
              </p>
            </div>

            {/* Interactive 5-Star Rating Buttons */}
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
                    className="p-1 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                        isLit
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'fill-slate-100 text-slate-300 dark:fill-slate-800 dark:text-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Conditional Branch Based on Selected Stars */}
            {rating >= 4 ? (
              /* Positive Review Branch (4-5 Stars) -> Google Play Store In-App Review / Direct Link */
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleRateOnPlayStore}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{loc.rateOnPlayStore}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSnooze}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  {loc.maybeLater}
                </button>
              </div>
            ) : rating > 0 && rating <= 3 ? (
              /* Constructive Feedback Branch (1-3 Stars) -> Direct in-app feedback to improve */
              <div className="space-y-3 pt-1 text-left rtl:text-right">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={loc.feedbackPlaceholder}
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  disabled={isSubmitting || !feedbackText.trim()}
                  onClick={handleSubmitFeedback}
                  className="w-full py-3 px-4 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? loc.sending : loc.sendFeedback}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSnooze}
                  className="w-full py-2 text-center text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {loc.maybeLater}
                </button>
              </div>
            ) : (
              /* Initial State (No star tapped yet) */
              <div className="flex items-center justify-between pt-3 text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
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
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Global trigger utility that any tool or download modal can invoke
 */
export function recordActionAndMaybePromptReview() {
  if (typeof window === 'undefined') return;
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.COMPLETED_COUNT) || '0', 10);
  const next = current + 1;
  localStorage.setItem(STORAGE_KEYS.COMPLETED_COUNT, next.toString());

  // Prompt on 2nd, 5th, 10th action, etc.
  if (next === 2 || next === 5 || next % 10 === 0) {
    window.dispatchEvent(new CustomEvent('miftah:trigger-review-prompt'));
  }
}
