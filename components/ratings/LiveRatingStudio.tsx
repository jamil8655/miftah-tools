'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  RatingReview,
  RatingStats,
  subscribeToLiveRatings,
  submitLiveRating,
  updateLiveRating,
  deleteLiveRating,
  formatFullDateTime,
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
  Calendar,
  Filter,
  Edit3,
  Trash2,
  AlertCircle,
  X,
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
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const [filterStar, setFilterStar] = useState<number | 'all'>('all');
  const [showForm, setShowForm] = useState(false);

  // Form State for New Review
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>('');
  const [authorEmail, setAuthorEmail] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<string>(initialToolName || 'Miftah Tools (Overall Platform)');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Edit Review Modal State
  const [editingReview, setEditingReview] = useState<RatingReview | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>('');
  const [editToolName, setEditToolName] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Delete Review Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      if (user.name && !authorName) setAuthorName(user.name);
      if (user.email && !authorEmail) setAuthorEmail(user.email);
    }
  }, [user]);

  // Subscribe to real-time live ratings from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToLiveRatings(
      (updatedReviews, updatedStats) => {
        setReviews(updatedReviews);
        setStats(updatedStats);
      },
      user?.uid,
      user?.email || undefined
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user]);

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
      setSubmitError('Please write your review feedback');
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
      }, 2000);
    } else {
      setSubmitError(result.error || 'Could not submit review. Please try again.');
    }
  };

  const handleOpenEdit = (review: RatingReview) => {
    triggerHaptic('selection');
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditToolName(review.toolName || 'Miftah Tools (Overall Platform)');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    if (!editComment.trim()) return;

    setIsUpdating(true);
    triggerHaptic('medium');

    const result = await updateLiveRating(editingReview.id, {
      rating: editRating,
      comment: editComment.trim(),
      toolName: editToolName,
    });

    setIsUpdating(false);

    if (result.success) {
      triggerHaptic('success');
      setEditingReview(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    setIsDeleting(true);
    triggerHaptic('light');

    await deleteLiveRating(reviewId);

    setIsDeleting(false);
    setDeletingId(null);
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterStar === 'all') return true;
    return Math.round(r.rating) === filterStar;
  });

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return 'Outstanding (5/5)';
      case 4:
        return 'Very Good (4/5)';
      case 3:
        return 'Good / Average (3/5)';
      case 2:
        return 'Needs Improvement (2/5)';
      case 1:
        return 'Poor (1/5)';
      default:
        return 'Outstanding (5/5)';
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Math.max(0, Date.now() - timestamp);
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header & Real Metrics */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Real Community Aggregate Score */}
          <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Real Live Community Ratings</span>
            </div>

            <div className="flex items-baseline justify-center lg:justify-start gap-3">
              <span className="text-5xl sm:text-6xl font-black text-[#182230] dark:text-white tracking-tight">
                {stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : '5.0'}
              </span>
              <div className="space-y-1 text-left">
                <div className="flex items-center text-amber-400 gap-1 text-lg">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={
                        s <= Math.round(stats.totalReviews > 0 ? stats.averageRating : 5)
                          ? 'text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs font-semibold text-[#687587] dark:text-slate-400">
                  {stats.totalReviews > 0 ? (
                    <>
                      Based on <strong className="text-[#182230] dark:text-white">{stats.totalReviews}</strong> live verified user review{stats.totalReviews > 1 ? 's' : ''}
                    </>
                  ) : (
                    <span>Real-time community reviews (No fake data)</span>
                  )}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-300 leading-relaxed">
              Have you tried our tools? Leave your real review, feedback, or rating below to help others and enhance our platform.
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
              Live Rating Breakdown
            </h4>
            {[5, 4, 3, 2, 1].map((starNum) => {
              const count = stats.distribution[starNum as 1 | 2 | 3 | 4 | 5] || 0;
              const percent = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;

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

                  <span className="w-12 text-right text-[11px] font-semibold text-[#687587] dark:text-slate-400 shrink-0">
                    {count} ({percent}%)
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* 2. Interactive Review Submission Form */}
      {showForm && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-[#0B79B7]/40 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between gap-3 border-b border-[#E1E7EC] dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#182230] dark:text-white">
                Share Your Live Rating & Review
              </h3>
              <p className="text-xs text-[#687587] dark:text-slate-400">
                Your review will be saved to Firebase and instantly visible to all users.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                Thank you! Your rating is now live!
              </h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Your genuine feedback has been published in real-time.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Star Rating Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#182230] dark:text-slate-200">
                  Select Rating Stars *
                </label>
                <div className="flex items-center gap-3">
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
                    placeholder="e.g. Tariq Ansari"
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
                  Your Review / Experience *
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with processing speed, features, or output quality..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7F9] dark:bg-slate-800 border border-[#E1E7EC] dark:border-slate-700 text-xs sm:text-sm text-[#182230] dark:text-white focus:outline-none focus:border-[#0B79B7] resize-none"
                />
              </div>

              {submitError && (
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{submitError}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#0B79B7] hover:bg-[#075B8C] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0B79B7]/20 active:scale-95 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Publishing to Firebase...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Live Review</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* 3. Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E1E7EC] dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#0B79B7]" />
                <h3 className="text-sm sm:text-base font-bold text-[#182230] dark:text-white">
                  Edit Your Review
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Star Picker */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#182230] dark:text-slate-200">
                  Update Rating Stars
                </label>
                <div className="flex items-center gap-1 text-2xl text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditRating(s)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <span className={s <= editRating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tool selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#182230] dark:text-slate-200">
                  Tool Used
                </label>
                <select
                  value={editToolName}
                  onChange={(e) => setEditToolName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7F9] dark:bg-slate-800 border border-[#E1E7EC] dark:border-slate-700 text-xs sm:text-sm text-[#182230] dark:text-white focus:outline-none focus:border-[#0B79B7]"
                >
                  {POPULAR_TOOLS.map((t) => (
                    <option key={t.slug} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#182230] dark:text-slate-200">
                  Review Feedback
                </label>
                <textarea
                  required
                  rows={3}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7F9] dark:bg-slate-800 border border-[#E1E7EC] dark:border-slate-700 text-xs sm:text-sm text-[#182230] dark:text-white focus:outline-none focus:border-[#0B79B7] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-[#0B79B7] hover:bg-[#075B8C] text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Live Community Reviews Feed */}
      <div className="space-y-4">
        
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E1E7EC] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#0B79B7]" />
            <h3 className="text-sm sm:text-base font-bold text-[#182230] dark:text-white">
              Real User Ratings & Reviews ({filteredReviews.length})
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
        {filteredReviews.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-[#E1E7EC] dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-[#182230] dark:text-white">
              No live reviews yet in this filter
            </h4>
            <p className="text-xs text-[#687587] dark:text-slate-400 max-w-md mx-auto">
              Be the first genuine user to share your rating and review for Miftah Tools!
            </p>
            <button
              type="button"
              onClick={() => {
                setShowForm(true);
                triggerHaptic('selection');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-[#0B79B7] text-white text-xs font-bold hover:bg-[#075B8C] transition-all inline-flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Leave First Review</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredReviews.map((rev) => {
              const initial = rev.userName.charAt(0).toUpperCase();

              return (
                <div
                  key={rev.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border ${
                    rev.isOwner
                      ? 'border-[#0B79B7] dark:border-[#0B79B7] ring-2 ring-[#0B79B7]/10'
                      : 'border-[#E1E7EC] dark:border-slate-800/80'
                  } shadow-xs hover:border-[#0B79B7]/50 transition-all flex flex-col justify-between space-y-3 relative overflow-hidden`}
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
                            {rev.isOwner && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-sky-50 dark:bg-sky-950/60 text-[#0B79B7] dark:text-sky-300 text-[9px] font-black border border-sky-200/50">
                                You
                              </span>
                            )}
                          </div>
                          {rev.userEmail && (
                            <p className="text-[10px] text-[#687587] dark:text-slate-400 truncate">
                              {rev.userEmail}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stars & Actions */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center text-amber-400 text-xs">
                          {[1, 2, 3, 4, 5].map((st) => (
                            <span key={st} className={st <= rev.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}>
                              ★
                            </span>
                          ))}
                        </div>

                        {rev.isOwner && (
                          <div className="flex items-center gap-1 pt-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(rev)}
                              className="p-1 rounded text-slate-400 hover:text-[#0B79B7] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Review"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(rev.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Review Comment */}
                    <p className="text-xs text-[#182230] dark:text-slate-200 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Footer metadata: Exact Date & Time */}
                  <div className="pt-2 border-t border-[#E1E7EC]/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#687587] dark:text-slate-400">
                    <span className="font-semibold text-[#0B79B7] dark:text-[#38a8f8] truncate max-w-[180px]">
                      🏷️ {rev.toolName || 'Miftah Tools'}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{rev.formattedDate || formatFullDateTime(rev.createdAt)}</span>
                      </div>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <div className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(rev.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
