'use client';

// Miftah Tools Production Firestore & Firebase Storage Data Service
// Dedicated Project: studio-3108342384-2960a
// 100% Real Firebase Integration — No Mock or Demo Data

import { db, auth, storage } from './firebase-client';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  DocumentData,
  Unsubscribe,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

// 1. Users Schema
export interface FirestoreUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user' | 'guest';
  plan: 'free' | 'pro' | 'enterprise';
  toolsUsedCount?: number;
  totalStorageBytes?: number;
  createdAt: number;
  lastLoginAt: number;
  emailVerified?: boolean;
}

// 2. Tools Schema
export interface FirestoreToolMeta {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  maintenanceMode: boolean;
  totalExecutions?: number;
  lastUsedAt?: number;
  updatedAt?: number;
}

// 3. Jobs Schema
export interface FirestoreJobRecord {
  id: string;
  uid: string;
  toolId: string;
  toolName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  inputFileName?: string;
  inputFileSizeBytes?: number;
  outputFileUrl?: string;
  errorMessage?: string;
  createdAt: number;
  completedAt?: number;
}

// 4. System Settings Schema
export interface FirestoreSystemSettings {
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  maxUploadSizeBytes: number;
  rateLimitPerMinute: number;
  aiFeaturesEnabled: boolean;
  updatedAt: number;
  updatedBy: string;
}

// 5. User Sub-Item Schemas (Favorites, History, Downloads, Notifications)
export interface FirestoreFavorite {
  id: string;
  type: 'tool' | 'course';
  title: string;
  category: string;
  url: string;
  addedAt: number;
}

export interface FirestoreActivity {
  id: string;
  type: 'tool' | 'course' | 'conversion';
  title: string;
  url: string;
  timestamp: number;
  meta?: string;
}

export interface FirestoreDownload {
  id: string;
  name: string;
  size: string;
  type: string;
  timestamp: number;
  downloadUrl?: string;
}

export interface FirestoreNotification {
  id: string;
  title: string;
  message: string;
  type: 'course' | 'tool' | 'security' | 'system';
  timestamp: number;
  read: boolean;
  link?: string;
}

// ==================== REAL DATA METHODS ====================

// --- 1. USER PROFILE PHOTO UPLOAD (FIREBASE STORAGE) ---
export async function uploadUserProfilePhoto(uid: string, fileOrBlob: Blob | File): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!uid) return { success: false, error: 'User not authenticated' };

  try {
    if (storage) {
      const avatarRef = storageRef(storage, `users/${uid}/profile/avatar_${Date.now()}.jpg`);
      const snapshot = await uploadBytes(avatarRef, fileOrBlob, {
        contentType: 'image/jpeg',
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // Update Firebase Auth profile
      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: downloadUrl });
      }

      // Merge into Firestore users document
      if (db) {
        const userDoc = doc(db, 'users', uid);
        await setDoc(userDoc, { photoURL: downloadUrl, updatedAt: Date.now() }, { merge: true });
      }

      return { success: true, url: downloadUrl };
    }
  } catch (err: any) {
    console.warn('Firebase Storage upload notice, falling back to local storage:', err);
  }

  // Fallback to data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (db) {
        try {
          const userDoc = doc(db, 'users', uid);
          await setDoc(userDoc, { photoURL: dataUrl, updatedAt: Date.now() }, { merge: true });
        } catch (e) {}
      }
      resolve({ success: true, url: dataUrl });
    };
    reader.onerror = () => resolve({ success: false, error: 'Failed to read image file' });
    reader.readAsDataURL(fileOrBlob);
  });
}

// --- 2. USERS MANAGEMENT (REAL FIRESTORE) ---
export async function fetchAllUsers(): Promise<FirestoreUserProfile[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'users'), orderBy('lastLoginAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as FirestoreUserProfile));
  } catch (err) {
    console.warn('fetchAllUsers notice:', err);
    return [];
  }
}

export function subscribeToUsers(callback: (users: FirestoreUserProfile[]) => void): Unsubscribe {
  if (!db) return () => {};
  const q = query(collection(db, 'users'), orderBy('lastLoginAt', 'desc'), limit(100));
  return onSnapshot(
    q,
    (snap) => {
      const users = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as FirestoreUserProfile));
      callback(users);
    },
    (err) => {
      console.warn('Users listener notice:', err);
      callback([]);
    }
  );
}

// --- 3. TOOLS CONTROL (REAL FIRESTORE) ---
export async function updateToolStatus(toolId: string, enabled: boolean, maintenanceMode = false): Promise<boolean> {
  if (!db) return false;
  try {
    const toolRef = doc(db, 'tools', toolId);
    await setDoc(toolRef, { enabled, maintenanceMode, updatedAt: Date.now() }, { merge: true });
    return true;
  } catch (err) {
    console.error('updateToolStatus error:', err);
    return false;
  }
}

export function subscribeToTools(callback: (tools: FirestoreToolMeta[]) => void): Unsubscribe {
  if (!db) return () => {};
  const q = query(collection(db, 'tools'));
  return onSnapshot(
    q,
    (snap) => {
      const tools = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreToolMeta));
      callback(tools);
    },
    () => callback([])
  );
}

// --- 4. JOBS QUEUE (REAL FIRESTORE) ---
export async function createJobRecord(job: Omit<FirestoreJobRecord, 'id' | 'createdAt'>): Promise<string | null> {
  if (!db) return null;
  try {
    const jobRef = doc(collection(db, 'jobs'));
    const record: FirestoreJobRecord = {
      id: jobRef.id,
      ...job,
      createdAt: Date.now(),
    };
    await setDoc(jobRef, record);
    return jobRef.id;
  } catch (err) {
    console.error('createJobRecord error:', err);
    return null;
  }
}

export function subscribeToRecentJobs(callback: (jobs: FirestoreJobRecord[]) => void): Unsubscribe {
  if (!db) return () => {};
  const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snap) => {
      const jobs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreJobRecord));
      callback(jobs);
    },
    () => callback([])
  );
}

// --- 5. SYSTEM SETTINGS ---
export async function getSystemSettings(): Promise<FirestoreSystemSettings> {
  const defaultSettings: FirestoreSystemSettings = {
    maintenanceMode: false,
    allowNewRegistrations: true,
    maxUploadSizeBytes: 100 * 1024 * 1024,
    rateLimitPerMinute: 120,
    aiFeaturesEnabled: true,
    updatedAt: Date.now(),
    updatedBy: 'system',
  };

  if (!db) return defaultSettings;
  try {
    const snap = await getDoc(doc(db, 'settings', 'general'));
    if (snap.exists()) {
      return snap.data() as FirestoreSystemSettings;
    }
  } catch (e) {}
  return defaultSettings;
}

export async function updateSystemSettings(settings: Partial<FirestoreSystemSettings>): Promise<boolean> {
  if (!db) return false;
  try {
    const ref = doc(db, 'settings', 'general');
    await setDoc(
      ref,
      {
        ...settings,
        updatedAt: Date.now(),
        updatedBy: auth?.currentUser?.email || 'admin',
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('updateSystemSettings error:', err);
    return false;
  }
}

// --- 6. USER FAVORITES SYNC (REAL FIRESTORE) ---
export async function syncUserFavoriteFirestore(uid: string, item: FirestoreFavorite, isAdding: boolean): Promise<void> {
  if (!db || !uid) return;
  try {
    const favRef = doc(db, `users/${uid}/favorites`, item.id);
    if (isAdding) {
      await setDoc(favRef, item);
    } else {
      await deleteDoc(favRef);
    }
  } catch (err) {
    console.warn('syncUserFavoriteFirestore notice:', err);
  }
}

export async function fetchUserFavoritesFirestore(uid: string): Promise<FirestoreFavorite[]> {
  if (!db || !uid) return [];
  try {
    const snap = await getDocs(collection(db, `users/${uid}/favorites`));
    return snap.docs.map((d) => d.data() as FirestoreFavorite);
  } catch (err) {
    return [];
  }
}

// --- 7. USER HISTORY SYNC (REAL FIRESTORE) ---
export async function saveUserHistoryFirestore(uid: string, item: FirestoreActivity): Promise<void> {
  if (!db || !uid) return;
  try {
    const histRef = doc(db, `users/${uid}/history`, item.id);
    await setDoc(histRef, item);
  } catch (err) {
    console.warn('saveUserHistoryFirestore notice:', err);
  }
}

export async function fetchUserHistoryFirestore(uid: string): Promise<FirestoreActivity[]> {
  if (!db || !uid) return [];
  try {
    const q = query(collection(db, `users/${uid}/history`), orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FirestoreActivity);
  } catch (err) {
    return [];
  }
}

// --- 8. USER DOWNLOADS SYNC (REAL FIRESTORE) ---
export async function saveUserDownloadFirestore(uid: string, item: FirestoreDownload): Promise<void> {
  if (!db || !uid) return;
  try {
    const dlRef = doc(db, `users/${uid}/downloads`, item.id);
    await setDoc(dlRef, item);
  } catch (err) {
    console.warn('saveUserDownloadFirestore notice:', err);
  }
}

export async function fetchUserDownloadsFirestore(uid: string): Promise<FirestoreDownload[]> {
  if (!db || !uid) return [];
  try {
    const q = query(collection(db, `users/${uid}/downloads`), orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FirestoreDownload);
  } catch (err) {
    return [];
  }
}

// --- 9. USER NOTIFICATIONS (REAL FIRESTORE) ---
export function subscribeToUserNotifications(uid: string, callback: (notifications: FirestoreNotification[]) => void): Unsubscribe {
  if (!db || !uid) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, `users/${uid}/notifications`), orderBy('timestamp', 'desc'), limit(30));
  return onSnapshot(
    q,
    (snap) => {
      const notifs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreNotification));
      callback(notifs);
    },
    () => callback([])
  );
}

export async function markNotificationReadFirestore(uid: string, notifId: string): Promise<void> {
  if (!db || !uid) return;
  try {
    const notifRef = doc(db, `users/${uid}/notifications`, notifId);
    await updateDoc(notifRef, { read: true });
  } catch (err) {}
}
