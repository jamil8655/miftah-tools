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
 * Calculates aggregate stats from purely real reviews
 */
export function calculateRatingStats(reviews: RatingReview[]): RatingStats {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  for (const rev of reviews) {
    const r = Math.max(1, Math.min(5, Math.round(rev.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[r] = (distribution[r] || 0) + 1;
    sum += rev.rating;
  }

  const avg = Number((sum / reviews.length).toFixed(1));

  return {
    averageRating: avg,
    totalReviews: reviews.length,
    distribution,
  };
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
 * Submits a new live rating to Firestore
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
}): Promise<{ success: boolean; review?: RatingReview; error?: string }> {
  try {
    const trimmedName = (params.userName || '').trim() || 'Verified User';
    const trimmedComment = (params.comment || '').trim();
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
    };

    // Save author ownership token locally
    saveMyAuthoredReviewId(reviewId);

    // Update local cache immediately
    const current = getCachedReviews();
    const updated = [newReview, ...current.filter((r) => r.id !== reviewId)];
    setCachedReviews(updated);

    // Save to Firestore
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
