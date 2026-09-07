'use client';

import React, { useState } from 'react';
import { Gift, Sparkles, ExternalLink, PlayCircle, CheckCircle2, Award } from 'lucide-react';
import { adConfig } from '@/config/ads';
import { adManager } from '@/lib/ads/AdManager';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';
import confetti from 'canvas-confetti';

const REWARD_LOCALES = {
  en: {
    rewardBadge: 'REWARD PERK',
    title: 'Unlock Ultra HD & Max Speed',
    desc: 'Watch a quick 5-sec sponsor ad to unlock highest conversion fidelity and VIP speed.',
    watchCta: 'Watch Ad for Perk',
    watching: 'Loading Ad...',
    unlocked: 'VIP Perk Active: Maximum Speed & 100% HD Quality!',
  },
  ur: {
    rewardBadge: 'انعامی سہولت',
    title: 'الٹرا ایچ ڈی کوالٹی اور تیز رفتار حاصل کریں',
    desc: 'ایک مختصر ویڈیو اشتہار دیکھ کر بہترین کوالٹی اور وی آئی پی رفتار انلاک کریں۔',
    watchCta: 'اشتہار دیکھ کر انلاک کریں',
    watching: 'اشتہار لوڈ ہو رہا ہے...',
    unlocked: 'مبارک ہو! وی آئی پی اسپیڈ اور بہترین کوالٹی فعال ہو چکی ہے۔',
  },
  ar: {
    rewardBadge: 'مكافأة مميزة',
    title: 'احصل على دقة فائقة وسرعة قصوى',
    desc: 'شاهد إعلاناً قصيراً لفتح أعلى دقة تحويل وسرعة VIP للملفات.',
    watchCta: 'شاهد الإعلان للفتح',
    watching: 'جاري تحميل الإعلان...',
    unlocked: 'تم تفعيل الميزة بنجاح: أقصى سرعة ودقة كاملة!',
  },
  hi: {
    rewardBadge: 'रिवॉर्ड लाभ',
    title: 'अल्ट्रा HD और अधिकतम स्पीड अनलॉक करें',
    desc: 'एक छोटा विज्ञापन देखकर उच्चतम क्वालिटी और VIP स्पीड प्राप्त करें।',
    watchCta: 'विज्ञापन देखकर अनलॉक करें',
    watching: 'विज्ञापन लोड हो रहा है...',
    unlocked: 'VIP लाभ सक्रिय: अधिकतम स्पीड और 100% HD क्वालिटी!',
  },
};

export function ResultRewardAd() {
  const { language, isRTL } = useI18n();
  const loc = REWARD_LOCALES[language] || REWARD_LOCALES.en;
  const [isWatching, setIsWatching] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (!adConfig.enabled) return null;

  const handleWatchRewardAd = async () => {
    setIsWatching(true);
    triggerHaptic('medium');
    try {
      const shown = await adManager.showRewardedAd((reward) => {
        setIsUnlocked(true);
        triggerHaptic('success');
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      });

      if (!shown) {
        // Web / Direct fallback: grant perk gracefully
        setIsUnlocked(true);
        triggerHaptic('success');
      }
    } catch (err) {
      console.error('Reward ad error:', err);
      setIsUnlocked(true);
    } finally {
      setIsWatching(false);
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-brand-500/5 to-purple-500/10 dark:from-emerald-950/30 dark:via-slate-900 dark:to-purple-950/30 p-3.5 sm:p-4 my-3 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Icon & Text */}
        <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto flex-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            {isUnlocked ? (
              <Award className="w-5 h-5 text-white" />
            ) : (
              <Gift className="w-5 h-5 text-white" />
            )}
          </div>

          <div className="min-w-0 text-left rtl:text-right flex-1">
            <div className="flex items-center gap-1.5">
              <span className={`px-1.5 py-0.5 rounded text-white font-black text-[9px] uppercase tracking-wider ${isUnlocked ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                {loc.rewardBadge}
              </span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {isUnlocked ? 'VIP Status Active' : 'Special Offer'}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
              {isUnlocked ? loc.unlocked : loc.title}
            </h4>
            {!isUnlocked && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {loc.desc}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 w-full sm:w-auto flex justify-end">
          {isUnlocked ? (
            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Activated</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleWatchRewardAd}
              disabled={isWatching}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-transform"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{isWatching ? loc.watching : loc.watchCta}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

