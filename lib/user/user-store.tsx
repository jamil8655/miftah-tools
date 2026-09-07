'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  syncUserFavoriteFirestore,
  fetchUserFavoritesFirestore,
  saveUserHistoryFirestore,
  fetchUserHistoryFirestore,
  saveUserDownloadFirestore,
  fetchUserDownloadsFirestore,
  subscribeToUserNotifications,
  markNotificationReadFirestore,
  uploadUserProfilePhoto,
} from '@/lib/firebase/firestore-service';

export interface EnrolledCourseState {
  courseId: string;
  progress: number;
  completedLessons: string[];
  enrolledAt: number;
  lastAccessedAt: number;
}

export interface FavoriteItem {
  id: string;
  type: 'tool' | 'course';
  title: string;
  category: string;
  url: string;
  iconName?: string;
  addedAt: number;
}

export interface ActivityHistoryItem {
  id: string;
  type: 'tool' | 'course' | 'conversion';
  title: string;
  url: string;
  timestamp: number;
  meta?: string;
}

export interface DownloadItem {
  id: string;
  name: string;
  size: string;
  type: string;
  timestamp: number;
  downloadUrl?: string;
}

export interface RecentToolItem {
  toolId: string;
  toolName: string;
  category: string;
  icon: string;
  lastUsed: number;
  usageCount: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'course' | 'tool' | 'security' | 'system';
  timestamp: number;
  read: boolean;
  link?: string;
}

interface UserStoreContextType {
  profilePhoto: string | null;
  updateProfilePhoto: (dataUrlOrFile: string | File | Blob | null) => Promise<boolean>;

  recentTools: RecentToolItem[];
  recordToolUsage: (toolId: string, toolName: string, category: string, icon: string) => void;
  clearRecentTools: () => void;

  pinnedTools: string[];
  togglePinTool: (toolId: string) => void;
  isToolPinned: (toolId: string) => boolean;

  lastStudiedCourseId: string | null;
  setLastStudiedCourseId: (courseId: string) => void;

  enrolledCourses: Record<string, EnrolledCourseState>;
  enrollInCourse: (courseId: string) => void;
  unenrollCourse: (courseId: string) => void;
  markLessonComplete: (courseId: string, lessonId: string, totalLessons: number) => void;
  isEnrolled: (courseId: string) => boolean;
  getCourseProgress: (courseId: string) => number;

  favorites: FavoriteItem[];
  toggleFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  isFavorite: (id: string) => boolean;
  removeFavorite: (id: string) => void;

  history: ActivityHistoryItem[];
  addHistory: (item: Omit<ActivityHistoryItem, 'id' | 'timestamp'>) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;

  downloads: DownloadItem[];
  addDownload: (item: Omit<DownloadItem, 'id' | 'timestamp'>) => void;
  removeDownload: (id: string) => void;
  clearDownloads: () => void;

  notifications: AppNotification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

const UserStoreContext = createContext<UserStoreContextType | undefined>(undefined);

export function UserStoreProvider({ children }: { children: React.ReactNode }) {
  const { user, firebaseUser } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [pinnedTools, setPinnedTools] = useState<string[]>([]);
  const [recentTools, setRecentTools] = useState<RecentToolItem[]>([]);
  const [lastStudiedCourseId, setLastStudiedCourseIdState] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Record<string, EnrolledCourseState>>({});
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<ActivityHistoryItem[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // 1. Initialize local cache on mount
  useEffect(() => {
    try {
      const savedPhoto = localStorage.getItem('nexora_user_avatar');
      if (savedPhoto) setProfilePhoto(savedPhoto);

      const savedPinned = localStorage.getItem('nexora_pinned_tools');
      if (savedPinned) setPinnedTools(JSON.parse(savedPinned));

      const savedRecents = localStorage.getItem('nexora_recent_tools');
      if (savedRecents) setRecentTools(JSON.parse(savedRecents));

      const savedCourseId = localStorage.getItem('nexora_last_studied_course');
      if (savedCourseId) setLastStudiedCourseIdState(savedCourseId);

      const savedEnrollments = localStorage.getItem('nexora_enrolled_courses');
      if (savedEnrollments) setEnrolledCourses(JSON.parse(savedEnrollments));

      const savedFavs = localStorage.getItem('nexora_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedHistory = localStorage.getItem('nexora_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedDownloads = localStorage.getItem('nexora_downloads');
      if (savedDownloads) setDownloads(JSON.parse(savedDownloads));
    } catch (e) {
      console.warn('Failed to load local user cache:', e);
    }
  }, []);

  // 2. Real Firestore Cloud Synchronization when Authenticated
  useEffect(() => {
    if (!user?.uid) return;

    // Use Google or Firebase Auth photo if available
    if (user.photoURL) {
      setProfilePhoto(user.photoURL);
    }

    // Fetch cloud favorites
    fetchUserFavoritesFirestore(user.uid).then((cloudFavs) => {
      if (cloudFavs.length > 0) {
        setFavorites(cloudFavs);
        localStorage.setItem('nexora_favorites', JSON.stringify(cloudFavs));
      }
    });

    // Fetch cloud history
    fetchUserHistoryFirestore(user.uid).then((cloudHist) => {
      if (cloudHist.length > 0) {
        setHistory(cloudHist);
        localStorage.setItem('nexora_history', JSON.stringify(cloudHist));
      }
    });

    // Fetch cloud downloads
    fetchUserDownloadsFirestore(user.uid).then((cloudDownloads) => {
      if (cloudDownloads.length > 0) {
        setDownloads(cloudDownloads);
        localStorage.setItem('nexora_downloads', JSON.stringify(cloudDownloads));
      }
    });

    // Realtime Notifications Listener
    const unsubNotifs = subscribeToUserNotifications(user.uid, (cloudNotifs) => {
      setNotifications(cloudNotifs);
    });

    return () => unsubNotifs();
  }, [user?.uid, user?.photoURL]);

  // Update Profile Photo & Sync with Firebase Cloud
  const updateProfilePhoto = async (dataUrlOrFile: string | File | Blob | null): Promise<boolean> => {
    if (!dataUrlOrFile) {
      setProfilePhoto(null);
      localStorage.removeItem('miftah_user_avatar');
      localStorage.removeItem('nexora_user_avatar');
      if (user?.uid) {
        await uploadUserProfilePhoto(user.uid, '');
      }
      return true;
    }

    if (typeof dataUrlOrFile === 'string') {
      setProfilePhoto(dataUrlOrFile);
      localStorage.setItem('miftah_user_avatar', dataUrlOrFile);
    }

    if (user?.uid) {
      const res = await uploadUserProfilePhoto(user.uid, dataUrlOrFile);
      if (res.success && res.url) {
        setProfilePhoto(res.url);
        localStorage.setItem('miftah_user_avatar', res.url);
        return true;
      }
    }
    return true;
  };

  // Pinned Tools
  const togglePinTool = (toolId: string) => {
    setPinnedTools((prev) => {
      const next = prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId];
      localStorage.setItem('nexora_pinned_tools', JSON.stringify(next));
      return next;
    });
  };

  const isToolPinned = (toolId: string) => pinnedTools.includes(toolId);

  // Last Studied Course
  const setLastStudiedCourseId = (courseId: string) => {
    setLastStudiedCourseIdState(courseId);
    localStorage.setItem('nexora_last_studied_course', courseId);
  };

  // Course Enrollment & Progress
  const enrollInCourse = (courseId: string) => {
    setEnrolledCourses((prev) => {
      if (prev[courseId]) return prev;
      const next = {
        ...prev,
        [courseId]: {
          courseId,
          progress: 0,
          completedLessons: [],
          enrolledAt: Date.now(),
          lastAccessedAt: Date.now(),
        },
      };
      localStorage.setItem('nexora_enrolled_courses', JSON.stringify(next));
      return next;
    });
    setLastStudiedCourseId(courseId);
  };

  const unenrollCourse = (courseId: string) => {
    setEnrolledCourses((prev) => {
      const next = { ...prev };
      delete next[courseId];
      localStorage.setItem('nexora_enrolled_courses', JSON.stringify(next));
      return next;
    });
  };

  const markLessonComplete = (courseId: string, lessonId: string, totalLessons: number) => {
    setEnrolledCourses((prev) => {
      const current = prev[courseId] || {
        courseId,
        progress: 0,
        completedLessons: [],
        enrolledAt: Date.now(),
        lastAccessedAt: Date.now(),
      };
      const completed = Array.from(new Set([...current.completedLessons, lessonId]));
      const progress = Math.min(100, Math.round((completed.length / Math.max(1, totalLessons)) * 100));
      const next = {
        ...prev,
        [courseId]: {
          ...current,
          completedLessons: completed,
          progress,
          lastAccessedAt: Date.now(),
        },
      };
      localStorage.setItem('nexora_enrolled_courses', JSON.stringify(next));
      return next;
    });
  };

  const isEnrolled = (courseId: string) => Boolean(enrolledCourses[courseId]);

  const getCourseProgress = (courseId: string) => enrolledCourses[courseId]?.progress || 0;

  // Real Dynamic User-State: Record Recent Tool Usage
  const recordToolUsage = (toolId: string, toolName: string, category: string, icon: string) => {
    setRecentTools((prev) => {
      const existing = prev.find((t) => t.toolId === toolId);
      const usageCount = (existing?.usageCount || 0) + 1;
      const updatedItem: RecentToolItem = {
        toolId,
        toolName,
        category,
        icon,
        lastUsed: Date.now(),
        usageCount,
      };
      const filtered = prev.filter((t) => t.toolId !== toolId);
      const next = [updatedItem, ...filtered].slice(0, 10);
      localStorage.setItem('nexora_recent_tools', JSON.stringify(next));
      return next;
    });
  };

  const clearRecentTools = () => {
    setRecentTools([]);
    localStorage.removeItem('nexora_recent_tools');
  };

  // Favorites
  const toggleFavorite = (item: Omit<FavoriteItem, 'addedAt'>) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === item.id);
      let next: FavoriteItem[];
      if (exists) {
        next = prev.filter((f) => f.id !== item.id);
        if (user?.uid) syncUserFavoriteFirestore(user.uid, { ...item, addedAt: Date.now() }, false);
      } else {
        const fullItem: FavoriteItem = { ...item, addedAt: Date.now() };
        next = [fullItem, ...prev];
        if (user?.uid) syncUserFavoriteFirestore(user.uid, fullItem, true);
      }
      localStorage.setItem('nexora_favorites', JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (id: string) => favorites.some((f) => f.id === id);

  const removeFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id);
      localStorage.setItem('nexora_favorites', JSON.stringify(next));
      if (user?.uid) syncUserFavoriteFirestore(user.uid, { id, type: 'tool', title: '', category: '', url: '', addedAt: 0 }, false);
      return next;
    });
  };

  // Activity History
  const addHistory = (item: Omit<ActivityHistoryItem, 'id' | 'timestamp'>) => {
    const fullItem: ActivityHistoryItem = {
      ...item,
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };
    setHistory((prev) => {
      const next = [fullItem, ...prev.filter((h) => h.url !== item.url)].slice(0, 50);
      localStorage.setItem('nexora_history', JSON.stringify(next));
      return next;
    });
    if (user?.uid) {
      saveUserHistoryFirestore(user.uid, fullItem);
    }
  };

  const removeHistoryItem = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      localStorage.setItem('nexora_history', JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('nexora_history');
  };

  // Downloads
  const addDownload = (item: Omit<DownloadItem, 'id' | 'timestamp'>) => {
    const fullItem: DownloadItem = {
      ...item,
      id: 'dl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };
    setDownloads((prev) => {
      const next = [fullItem, ...prev].slice(0, 50);
      localStorage.setItem('nexora_downloads', JSON.stringify(next));
      return next;
    });
    if (user?.uid) {
      saveUserDownloadFirestore(user.uid, fullItem);
    }
  };

  const removeDownload = (id: string) => {
    setDownloads((prev) => {
      const next = prev.filter((d) => d.id !== id);
      localStorage.setItem('nexora_downloads', JSON.stringify(next));
      return next;
    });
  };

  const clearDownloads = () => {
    setDownloads([]);
    localStorage.removeItem('nexora_downloads');
  };

  // Notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (user?.uid) {
      markNotificationReadFirestore(user.uid, id);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (user?.uid) {
      notifications.forEach((n) => markNotificationReadFirestore(user.uid, n.id));
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <UserStoreContext.Provider
      value={{
        profilePhoto,
        updateProfilePhoto,
        recentTools,
        recordToolUsage,
        clearRecentTools,
        pinnedTools,
        togglePinTool,
        isToolPinned,
        lastStudiedCourseId,
        setLastStudiedCourseId,
        enrolledCourses,
        enrollInCourse,
        unenrollCourse,
        markLessonComplete,
        isEnrolled,
        getCourseProgress,
        favorites,
        toggleFavorite,
        isFavorite,
        removeFavorite,
        history,
        addHistory,
        removeHistoryItem,
        clearHistory,
        downloads,
        addDownload,
        removeDownload,
        clearDownloads,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
      }}
    >
      {children}
    </UserStoreContext.Provider>
  );
}

export function useUserStore(): UserStoreContextType {
  const context = useContext(UserStoreContext);
  if (!context) {
    throw new Error('useUserStore must be used within a UserStoreProvider');
  }
  return context;
}
