'use client';

import { db } from '@/lib/firebase/firebase-client';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';

export interface RatingReview {
  id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  userPhoto?: string;
  rating: number; // 1 to 5
  toolSlug?: string;
  toolName?: string;
  comment: string;
  createdAt: number;
  updatedAt?: number;
  formattedDate?: string;
  verified: boolean;
  isOwner?: boolean;
  approved?: boolean; // Default false until admin approves
  status?: 'pending' | 'approved' | 'rejected';
}

export interface RatingStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

const LOCAL_STORAGE_KEY = 'miftah_live_ratings_cache_v3';
const MY_REVIEWS_STORAGE_KEY = 'miftah_my_authored_reviews';
const RATE_LIMIT_STORAGE_KEY = 'miftah_review_submission_timestamps';
const TOOL_SESSION_PROOF_KEY = 'miftah_tool_session_proof';
const MAX_REVIEWS_PER_24H = 3;

/**
 * Formats timestamp to readable Date and Time (e.g. "10 Oct 2026, 03:30 AM")
 */
export function formatFullDateTime(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Calculates aggregate stats strictly from real approved reviews
 */
export function calculateRatingStats(reviews: RatingReview[]): RatingStats {
  const approvedReviews = (reviews || []).filter((r) => r.approved !== false);
  if (!approvedReviews || approvedReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  for (const rev of approvedReviews) {
    const r = Math.max(1, Math.min(5, Math.round(rev.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[r] = (distribution[r] || 0) + 1;
    sum += rev.rating;
  }

  const avg = Number((sum / approvedReviews.length).toFixed(1));

  return {
    averageRating: avg,
    totalReviews: approvedReviews.length,
    distribution,
  };
}

/**
 * Records that a tool was executed in this browser session.
 * Used as anti-spam proof to ensure only genuine tool users can review.
 */
export function recordToolExecutionProof(toolSlug?: string) {
  if (typeof window === 'undefined') return;
  try {
    const proof = {
      timestamp: Date.now(),
      toolSlug: toolSlug || 'general',
      sessionToken: `tool_proof_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
    };
    sessionStorage.setItem(TOOL_SESSION_PROOF_KEY, JSON.stringify(proof));
  } catch (err) {
    console.warn('Error recording tool session proof:', err);
  }
}

/**
 * Checks whether the user has used a tool in this session or recently
 */
export function hasValidToolSessionProof(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // 1. Session proof
    const sessionRaw = sessionStorage.getItem(TOOL_SESSION_PROOF_KEY);
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (parsed && typeof parsed.timestamp === 'number') {
        return true;
      }
    }

    // 2. Local storage recent tools or completed actions fallback
    const recent = localStorage.getItem('nexora_recent_tools');
    if (recent) {
      const parsedRecent = JSON.parse(recent);
      if (Array.isArray(parsedRecent) && parsedRecent.length > 0) return true;
    }

    const completed = parseInt(localStorage.getItem('miftah_review_completed_actions') || '0', 10);
    if (completed > 0) return true;
  } catch (err) {
    console.warn('Error checking tool session proof:', err);
  }
  return false;
}

/**
 * Reads review submission timestamps from the last 24 hours
 */
export function getRecentSubmissions(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return parsed.filter((t: number) => typeof t === 'number' && t > oneDayAgo);
      }
    }
  } catch (err) {
    console.warn('Error reading rate limit timestamps:', err);
  }
  return [];
}

/**
 * Checks if another review can be submitted from this device/session (max 3 per 24h)
 */
export function canSubmitReview(): { allowed: boolean; remaining: number; resetInHours?: number } {
  const recent = getRecentSubmissions();
  if (recent.length >= MAX_REVIEWS_PER_24H) {
    const oldestInWindow = Math.min(...recent);
    const resetMs = (oldestInWindow + 24 * 60 * 60 * 1000) - Date.now();
    const resetHours = Math.max(1, Math.ceil(resetMs / (60 * 60 * 1000)));
    return {
      allowed: false,
      remaining: 0,
      resetInHours: resetHours,
    };
  }
  return {
    allowed: true,
    remaining: MAX_REVIEWS_PER_24H - recent.length,
  };
}

/**
 * Records a successful review submission timestamp for rate limiting
 */
export function recordReviewSubmission() {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentSubmissions();
    const updated = [Date.now(), ...recent].slice(0, 10);
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Error recording review submission timestamp:', err);
  }
}

/**
 * Helper to get list of review IDs authored on this device
 */
export function getMyAuthoredReviewIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MY_REVIEWS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Error reading authored review IDs:', err);
  }
  return [];
}

/**
 * Record a newly authored review ID locally
 */
export function saveMyAuthoredReviewId(id: string) {
  if (typeof window === 'undefined' || !id) return;
  try {
    const current = getMyAuthoredReviewIds();
    if (!current.includes(id)) {
      localStorage.setItem(MY_REVIEWS_STORAGE_KEY, JSON.stringify([id, ...current]));
    }
  } catch (err) {
    console.warn('Error saving authored review ID:', err);
  }
}

/**
 * Remove an authored review ID locally
 */
export function removeMyAuthoredReviewId(id: string) {
  if (typeof window === 'undefined' || !id) return;
  try {
    const current = getMyAuthoredReviewIds();
    localStorage.setItem(MY_REVIEWS_STORAGE_KEY, JSON.stringify(current.filter((i) => i !== id)));
  } catch (err) {
    console.warn('Error removing authored review ID:', err);
  }
}

/**
 * Loads cached reviews from localStorage (Zero fake reviews)
 */
export function getCachedReviews(): RatingReview[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading cached ratings:', err);
  }
  return [];
}

/**
 * Saves reviews to localStorage cache
 */
export function setCachedReviews(reviews: RatingReview[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.warn('Error saving cached ratings:', err);
  }
}

/**
 * Subscribes to live reviews from Firestore in real-time
 */
export function subscribeToLiveRatings(
  onUpdate: (reviews: RatingReview[], stats: RatingStats) => void,
  currentUserId?: string,
  currentUserEmail?: string
): Unsubscribe {
  // Start with locally cached real reviews
  const initial = getCachedReviews();
  onUpdate(initial, calculateRatingStats(initial));

  try {
    const ratingsRef = collection(db, 'ratings_reviews');
    const q = query(ratingsRef, orderBy('createdAt', 'desc'), limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreReviews: RatingReview[] = [];
        const myIds = getMyAuthoredReviewIds();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const docId = docSnap.id;
          const createdTimestamp = data.createdAt?.toMillis
            ? data.createdAt.toMillis()
            : (typeof data.createdAt === 'number' ? data.createdAt : Date.now());

          const isOwner =
            myIds.includes(docId) ||
            (Boolean(currentUserId) && data.userId === currentUserId) ||
            (Boolean(currentUserEmail) && data.rawUserEmail === currentUserEmail);

          const approved = data.approved ?? false;
          const status = data.status || (approved ? 'approved' : 'pending');

          // Strict Moderation Filter:
          // Public users only see approved reviews.
          // Authors can see their own review (with 'pending' moderation status).
          if (!approved && !isOwner) {
            return;
          }

          firestoreReviews.push({
            id: docId,
            userId: data.userId || '',
            userName: data.userName || 'Verified User',
            userEmail: data.userEmail || '',
            userPhoto: data.userPhoto || '',
            rating: Number(data.rating) || 5,
            toolSlug: data.toolSlug || '',
            toolName: data.toolName || 'Miftah Tools',
            comment: data.comment || '',
            createdAt: createdTimestamp,
            updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : data.updatedAt,
            formattedDate: formatFullDateTime(createdTimestamp),
            verified: data.verified ?? true,
            isOwner,
            approved,
            status,
          });
        });

        // Cache real reviews only
        setCachedReviews(firestoreReviews);
        onUpdate(firestoreReviews, calculateRatingStats(firestoreReviews));
      },
      (error) => {
        console.warn('Firestore ratings subscription warning:', error);
        const cached = getCachedReviews();
        onUpdate(cached, calculateRatingStats(cached));
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Could not connect to Firestore ratings collection:', err);
    return () => {};
  }
}

/**
 * Submits a new live rating to Firestore with anti-spam protections
 */
export async function submitLiveRating(params: {
  userName: string;
  userEmail?: string;
  userId?: string;
  userPhoto?: string;
  rating: number;
  toolSlug?: string;
  toolName?: string;
  comment: string;
  honeypot?: string;
  bypassToolCheck?: boolean;
}): Promise<{ success: boolean; review?: RatingReview; error?: string }> {
  try {
    // 1. Anti-spam honeypot detection
    if (params.honeypot && params.honeypot.trim().length > 0) {
      console.warn('Bot detected via honeypot');
      return { success: false, error: 'Spam submission detected.' };
    }

    // 2. Anti-spam rate limiting: max 3 reviews per 24 hours per device
    const rateCheck = canSubmitReview();
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Submission rate limit reached: You can submit up to ${MAX_REVIEWS_PER_24H} reviews per 24 hours. Please try again in ~${rateCheck.resetInHours} hour(s).`,
      };
    }

    // 3. Tool execution proof check (user must have actually used a tool)
    if (!params.bypassToolCheck && !hasValidToolSessionProof()) {
      return {
        success: false,
        error: 'Active tool usage required: Please use at least one tool on Miftah Tools before submitting a review.',
      };
    }

    // 4. Field validation & sanitization
    const trimmedName = (params.userName || '').trim().slice(0, 50) || 'Verified User';
    const trimmedComment = (params.comment || '').trim();

    if (trimmedComment.length < 5) {
      return { success: false, error: 'Review is too short. Please provide at least 5 characters of feedback.' };
    }
    if (trimmedComment.length > 500) {
      return { success: false, error: 'Review is too long. Comments are limited to 500 characters.' };
    }

    const cleanRating = Math.max(1, Math.min(5, Math.round(params.rating || 5)));
    const now = Date.now();

    // Mask email for public privacy (e.g. jam***@gmail.com)
    let maskedEmail = '';
    const rawEmail = (params.userEmail || '').trim();
    if (rawEmail && rawEmail.includes('@')) {
      const [local, domain] = rawEmail.split('@');
      const visiblePart = local.slice(0, Math.min(3, local.length));
      maskedEmail = `${visiblePart}***@${domain}`;
    }

    const reviewId = `rev_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const newReview: RatingReview = {
      id: reviewId,
      userId: params.userId || '',
      userName: trimmedName,
      userEmail: maskedEmail,
      userPhoto: params.userPhoto || '',
      rating: cleanRating,
      toolSlug: params.toolSlug || '',
      toolName: params.toolName || 'Miftah Tools',
      comment: trimmedComment,
      createdAt: now,
      formattedDate: formatFullDateTime(now),
      verified: true,
      isOwner: true,
      approved: false, // Default false until admin approves
      status: 'pending',
    };

    // Save author ownership token locally
    saveMyAuthoredReviewId(reviewId);

    // Record submission for rate limiting
    recordReviewSubmission();

    // Update local cache immediately so author can see it with "Under Moderation" badge
    const current = getCachedReviews();
    const updated = [newReview, ...current.filter((r) => r.id !== reviewId)];
    setCachedReviews(updated);

    // Save to Firestore with moderation defaults
    try {
      const docRef = doc(db, 'ratings_reviews', reviewId);
      await setDoc(docRef, {
        userId: params.userId || null,
        rawUserEmail: rawEmail || null,
        userName: trimmedName,
        userEmail: maskedEmail,
        userPhoto: params.userPhoto || null,
        rating: cleanRating,
        toolSlug: params.toolSlug || null,
        toolName: params.toolName || 'Miftah Tools',
        comment: trimmedComment,
        createdAt: serverTimestamp(),
        verified: true,
        approved: false, // Strict moderation default
        status: 'pending',
        submittedAt: new Date().toISOString(),
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : 'web',
      });
    } catch (dbErr) {
      console.warn('Firestore write sync error (cached locally):', dbErr);
    }

    return { success: true, review: newReview };
  } catch (err: any) {
    console.error('Failed to submit rating:', err);
    return { success: false, error: err.message || 'Failed to submit rating' };
  }
}

/**
 * Updates an existing rating review in Firestore
 */
export async function updateLiveRating(
  reviewId: string,
  params: {
    rating: number;
    comment: string;
    toolName?: string;
    userName?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanRating = Math.max(1, Math.min(5, Math.round(params.rating || 5)));
    const trimmedComment = (params.comment || '').trim();
    const now = Date.now();

    // Update local cache
    const current = getCachedReviews();
    const updated = current.map((r) => {
      if (r.id === reviewId) {
        return {
          ...r,
          rating: cleanRating,
          comment: trimmedComment,
          toolName: params.toolName || r.toolName,
          userName: params.userName || r.userName,
          updatedAt: now,
        };
      }
      return r;
    });
    setCachedReviews(updated);

    // Update Firestore
    try {
      const docRef = doc(db, 'ratings_reviews', reviewId);
      await updateDoc(docRef, {
        rating: cleanRating,
        comment: trimmedComment,
        ...(params.toolName ? { toolName: params.toolName } : {}),
        ...(params.userName ? { userName: params.userName } : {}),
        updatedAt: serverTimestamp(),
        lastEditedAt: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn('Firestore update error:', dbErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to update rating:', err);
    return { success: false, error: err.message || 'Failed to update rating' };
  }
}

/**
 * Deletes a rating review from Firestore
 */
export async function deleteLiveRating(reviewId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Remove from local cache
    const current = getCachedReviews();
    const updated = current.filter((r) => r.id !== reviewId);
    setCachedReviews(updated);
    removeMyAuthoredReviewId(reviewId);

    // Delete from Firestore
    try {
      const docRef = doc(db, 'ratings_reviews', reviewId);
      await deleteDoc(docRef);
    } catch (dbErr) {
      console.warn('Firestore delete error:', dbErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete rating:', err);
    return { success: false, error: err.message || 'Failed to delete rating' };
  }
}

/**
 * Approves a review (Admin moderation)
 */
export async function approveLiveRating(reviewId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'ratings_reviews', reviewId);
    await updateDoc(docRef, {
      approved: true,
      status: 'approved',
      moderatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Failed to approve rating:', err);
    return { success: false, error: err.message || 'Failed to approve rating' };
  }
}

/**
 * Rejects a review (Admin moderation)
 */
export async function rejectLiveRating(reviewId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'ratings_reviews', reviewId);
    await updateDoc(docRef, {
      approved: false,
      status: 'rejected',
      moderatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Failed to reject rating:', err);
    return { success: false, error: err.message || 'Failed to reject rating' };
  }
}

/**
 * Subscribes to all ratings including pending/unapproved for Admin Moderation
 */
export function subscribeToAllRatingsForAdmin(
  onUpdate: (reviews: RatingReview[]) => void
): Unsubscribe {
  try {
    const ratingsRef = collection(db, 'ratings_reviews');
    const q = query(ratingsRef, orderBy('createdAt', 'desc'), limit(200));

    return onSnapshot(
      q,
      (snapshot) => {
        const firestoreReviews: RatingReview[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const docId = docSnap.id;
          const createdTimestamp = data.createdAt?.toMillis
            ? data.createdAt.toMillis()
            : (typeof data.createdAt === 'number' ? data.createdAt : Date.now());

          firestoreReviews.push({
            id: docId,
            userId: data.userId || '',
            userName: data.userName || 'Verified User',
            userEmail: data.userEmail || '',
            userPhoto: data.userPhoto || '',
            rating: Number(data.rating) || 5,
            toolSlug: data.toolSlug || '',
            toolName: data.toolName || 'Miftah Tools',
            comment: data.comment || '',
            createdAt: createdTimestamp,
            updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : data.updatedAt,
            formattedDate: formatFullDateTime(createdTimestamp),
            verified: data.verified ?? true,
            approved: data.approved ?? false,
            status: data.status || (data.approved ? 'approved' : 'pending'),
          });
        });
        onUpdate(firestoreReviews);
      },
      (error) => {
        console.warn('Admin ratings subscription error:', error);
      }
    );
  } catch (err) {
    console.warn('Could not connect to admin ratings collection:', err);
    return () => {};
  }
}

