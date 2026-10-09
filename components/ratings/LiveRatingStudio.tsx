'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  RatingReview,
  RatingStats,
  subscribeToLiveRatings,
  submitLiveRating,
  calculateRatingStats,
} from '@/lib/ratings/rating-service';
import {
  Star,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Send,
  User,
  Clock,
  Filter,
  ThumbsUp,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/motion/motion-system';

interface LiveRatingStudioProps {
  initialToolName?: string;
  initialToolSlug?: string;
  compact?: boolean;
}

const POPULAR_TOOLS = [
  { name: 'Miftah Tools (Overall Platform)', slug: 'general' },
  { name: 'PDF to Word (OCR)', slug: 'pdf-to-docx' },
  { name: 'Live Speech Translator', slug: 'live-speech-translator' },
  { name: 'Voice to Text (AI)', slug: 'voice-to-text' },
  { name: 'Compress PDF', slug: 'compress-pdf' },
  { name: 'Image Studio Suite', slug: 'image-studio' },
  { name: 'Camera Doc Scanner', slug: 'camera-scanner' },
  { name: 'PDF Editor Studio', slug: 'pdf-editor' },
  { name: 'QR & Barcode Studio', slug: 'qr-barcode' },
  { name: 'Merge PDF', slug: 'merge-pdf' },
  { name: 'Word to PDF', slug: 'word-to-pdf' },
];

export function LiveRatingStudio({
  initialToolName,
  initialToolSlug,
  compact = false,
}: LiveRatingStudioProps) {
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState<RatingReview[]>([]);
  const [stats, setStats] = useState<RatingStats>({
    averageRating: 5.0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const [filterStar, setFilterStar] = useState<number | 'all'>('all');
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>('');
  const [authorEmail, setAuthorEmail] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<string>(initialToolName || 'Miftah Tools (Overall Platform)');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      if (user.name && !authorName) setAuthorName(user.name);
      if (user.email && !authorEmail) setAuthorEmail(user.email);
    }
  }, [user]);

  // Subscribe to real-time live ratings
  useEffect(() => {
    const unsubscribe = subscribeToLiveRatings((updatedReviews, updatedStats) => {
      setReviews(updatedReviews);
      setStats(updatedStats);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleStarClick = (rating: number) => {
    triggerHaptic('selection');
    setSelectedRating(rating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setSubmitError('Please enter your name');
      return;
    }
    if (!comment.trim()) {
      setSubmitError('Please write a short review or feedback');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    triggerHaptic('medium');

    const result = await submitLiveRating({
      userName: authorName.trim(),
      userEmail: authorEmail.trim() || user?.email || '',
      userId: user?.uid || '',
      userPhoto: user?.photoURL || '',
      rating: selectedRating,
      toolName: selectedTool,
      toolSlug: initialToolSlug || 'general',
      comment: comment.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitSuccess(true);
      triggerHaptic('success');
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
        setComment('');
      }, 2500);
    } else {
      setSubmitError(result.error || 'Could not submit rating. Please try again.');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterStar === 'all') return true;
    return Math.round(r.rating) === filterStar;
  });

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return 'Outstanding & Excellent';
      case 4:
        return 'Very Good';
      case 3:
        return 'Good / Average';
      case 2:
        return 'Needs Improvement';
      case 1:
        return 'Poor';
      default:
        return 'Excellent';
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Math.max(0, Date.now() - timestamp);
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 2) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header & Live Rating Metrics */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Big Average Score */}
          <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Real-Time Community Ratings</span>
            </div>

            <div className="flex items-baseline justify-center lg:justify-start gap-3">
              <span className="text-5xl sm:text-6xl font-black text-[#182230] dark:text-white tracking-tight">
                {stats.averageRating.toFixed(1)}
              </span>
              <div className="space-y-1 text-left">
                <div className="flex items-center text-amber-400 gap-1 text-lg">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={s <= Math.round(stats.averageRating) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs font-semibold text-[#687587] dark:text-slate-400">
                  Based on <strong className="text-[#182230] dark:text-white">{stats.totalReviews}</strong> verified ratings
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-300 leading-relaxed">
              Every review is genuine and submitted by users after using Miftah Tools digital utilities.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowForm(true);
                triggerHaptic('selection');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#0B79B7] hover:bg-[#075B8C] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0B79B7]/20 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>Write a Live Review</span>
            </button>
          </div>

          {/* Right Column: 5-Star Distribution Bars */}
          <div className="lg:col-span-7 space-y-2 border-t lg:border-t-0 lg:border-l border-[#E1E7EC] dark:border-slate-800 pt-5 lg:pt-0 lg:pl-8">
            <h4 className="text-xs font-bold text-[#182230] dark:text-white uppercase tracking-wider mb-3">
              Rating Breakdown
            </h4>
            {[5, 4, 3, 2, 1].map((starNum) => {
              const count = stats.distribution[starNum as 1 | 2 | 3 | 4 | 5] || 0;
              const percent = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : starNum === 5 ? 100 : 0;

              return (
                <div key={starNum} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-12 font-bold text-[#182230] dark:text-slate-200 shrink-0">
                    <span>{starNum}</span>
                    <span className="text-amber-400 text-sm">★</span>
                  </div>

                  <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        starNum >= 4 ? 'bg-amber-400' : starNum === 3 ? 'bg-amber-500' : 'bg-rose-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="w-10 text-right text-[11px] font-semibold text-[#687587] dark:text-slate-400 shrink-0">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* 2. Interactive Review Submission Form Modal / Box */}
      {showForm && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-[#0B79B7]/40 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between gap-3 border-b border-[#E1E7EC] dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#182230] dark:text-white">
                Share Your Genuine Experience
              </h3>
              <p className="text-xs text-[#687587] dark:text-slate-400">
                Your review helps improve Miftah Tools and displays live to the community.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
          </div>

          {submitSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                Thank you for your rating!
              </h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Your verified review is now live on Miftah Tools.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Star Rating Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#182230] dark:text-slate-200">
                  Select Rating Stars *
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-[#F5F7F9] dark:bg-slate-800/80 p-2 rounded-2xl border border-[#E1E7EC] dark:border-slate-700">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || selectedRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-2xl transition-transform hover:scale-125 active:scale-95 cursor-pointer focus:outline-none"
                        >
                          <span className={isFilled ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}>
                            ★
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {getRatingLabel(hoverRating || selectedRating)}
                  </span>
                </div>
              </div>

              {/* Name & Email Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#182230] dark:text-slate-200">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Farhan Ansari"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7F9] dark:bg-slate-800 border border-[#E1E7EC] dark:border-slate-700 text-xs sm:text-sm text-[#182230] dark:text-white focus:outline-none focus:border-[#0B79B7]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#182230] dark:text-slate-200">
                    Email Address (Masked for privacy)
                  </label>
                  <input
                    type="email"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7F9] dark:bg-slate-800 border border-[#E1E7EC] dark:border-slate-700 text-xs sm:text-sm text-[#182230] dark:text-white focus:outline-none focus:border-[#0B79B7]"
                  />
                </div>
              </div>

              {/* Tool Category Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#182230] dark:text-slate-200">
                  Which Tool did you use?
                </label>
                <select
                  value={selectedTool}
                  onChange={(e) => setSelectedTool(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7F9] dark:bg-slate-800 border border-[#E1E7EC] dark:border-slate-700 text-xs sm:text-sm text-[#182230] dark:text-white focus:outline-none focus:border-[#0B79B7]"
                >
                  {POPULAR_TOOLS.map((t) => (
                    <option key={t.slug} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Review Text */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#182230] dark:text-slate-200">
                  Your Review / Feedback *
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the tool speed, accuracy, or features? Share your thoughts..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7F9] dark:bg-slate-800 border border-[#E1E7EC] dark:border-slate-700 text-xs sm:text-sm text-[#182230] dark:text-white focus:outline-none focus:border-[#0B79B7] resize-none"
                />
              </div>

              {submitError && (
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#0B79B7] hover:bg-[#075B8C] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0B79B7]/20 active:scale-95 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Publishing Rating...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Live Rating</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* 3. Community Ratings Feed */}
      <div className="space-y-4">
        
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E1E7EC] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#0B79B7]" />
            <h3 className="text-sm sm:text-base font-bold text-[#182230] dark:text-white">
              Recent Live Reviews ({filteredReviews.length})
            </h3>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setFilterStar('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterStar === 'all'
                  ? 'bg-[#0B79B7] text-white shadow-xs'
                  : 'bg-[#F5F7F9] dark:bg-slate-800 text-[#687587] dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStar(s)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  filterStar === s
                    ? 'bg-[#0B79B7] text-white shadow-xs'
                    : 'bg-[#F5F7F9] dark:bg-slate-800 text-[#687587] dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{s}</span>
                <span className="text-amber-400">★</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredReviews.length === 0 ? (
            <div className="col-span-2 p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-[#E1E7EC] dark:border-slate-800 text-[#687587]">
              No reviews found for this star filter. Be the first to rate!
            </div>
          ) : (
            filteredReviews.map((rev) => {
              const initial = rev.userName.charAt(0).toUpperCase();

              return (
                <div
                  key={rev.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800/80 shadow-xs hover:border-[#0B79B7]/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    
                    {/* User Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0B79B7] to-sky-400 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-sm font-bold text-[#182230] dark:text-white truncate">
                              {rev.userName}
                            </h4>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-black border border-emerald-200/50">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>Verified</span>
                            </span>
                          </div>
                          {rev.userEmail && (
                            <p className="text-[10px] text-[#687587] dark:text-slate-400 truncate">
                              {rev.userEmail}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center text-amber-400 text-xs shrink-0">
                        {[1, 2, 3, 4, 5].map((st) => (
                          <span key={st} className={st <= rev.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Review Comment */}
                    <p className="text-xs text-[#182230] dark:text-slate-200 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Footer metadata */}
                  <div className="pt-2 border-t border-[#E1E7EC]/60 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-[#687587] dark:text-slate-400">
                    <span className="font-semibold text-[#0B79B7] dark:text-[#38a8f8] truncate max-w-[180px]">
                      🏷️ {rev.toolName || 'Miftah Tools'}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(rev.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
