'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/layout/ThemeContext';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { useUserStore } from '@/lib/user/user-store';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  User,
  ShieldCheck,
  Languages,
  Sparkles,
  LogIn,
  LogOut,
  Mail,
  CheckCircle2,
  Clock,
  Star,
  Download,
  Bell,
  Settings as SettingsIcon,
  HelpCircle,
  FileText,
  Trash2,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  Camera,
  Upload,
  Info,
  Key,
  Shield,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  X,
  History as HistoryIcon,
  Check,
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { user, firebaseUser, isAuthenticated, isAdmin, logout, deleteAccount } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const {
    profilePhoto,
    updateProfilePhoto,
    favorites,
    history,
    downloads,
    unreadCount,
    clearHistory,
    clearDownloads,
  } = useUserStore();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
    const savedBio = localStorage.getItem('nexora_user_bio') || '';
    setBio(savedBio);
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Please select a JPG, PNG, or WEBP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 256, 256);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          updateProfilePhoto(compressed);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('nexora_user_bio', bio);
    setProfileSaved(true);
    setTimeout(() => {
      setProfileSaved(false);
      setIsEditProfileOpen(false);
    }, 1500);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutDialogOpen(false);
    await logout();
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      if (isAuthenticated) {
        const res = await deleteAccount();
        if (!res.success) {
          setDeleteError(res.error || 'Failed to delete account.');
          setIsDeleting(false);
          return;
        }
      }
      clearHistory();
      clearDownloads();
      updateProfilePhoto('');
      localStorage.clear();
      sessionStorage.clear();
      setIsDeleteAccountDialogOpen(false);
      setIsDeleting(false);
      alert('Account and all associated local & cloud data deleted successfully.');
    } catch (err: any) {
      setDeleteError(err.message || 'Error occurred while deleting data.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 pb-24 min-w-0">
      {/* 1. TOP PROFILE HEADER */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-full bg-linear-to-tr from-brand-600 via-indigo-600 to-purple-600 p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-brand-600 text-white shadow-md hover:bg-brand-500 active:scale-95 transition-all"
              title="Upload photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 dark:text-white truncate">
                {isAuthenticated ? user?.name || 'Valued User' : 'Miftah Tools Guest'}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-[10px] font-extrabold border border-brand-200 dark:border-brand-800">
                {isAdmin ? 'ADMIN PRO' : isAuthenticated ? 'PRO USER' : 'FREE PLAN'}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">
              {isAuthenticated ? user?.email : 'Sign in to sync your tools, cloud history, and certificates'}
            </p>
          </div>
        </div>

        {photoError && <p className="text-xs text-rose-500 font-medium">{photoError}</p>}

        <div className="flex items-center gap-2 pt-1">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold active:scale-95 transition-all shadow-md shadow-brand-500/25 flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}

          <Link
            href="/settings"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 active:scale-95 transition-all"
            title="App Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 2. ACTIVITY SECTION */}
      <div className="space-y-2">
        <h2 className="px-1 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Activity & Workspace
        </h2>
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
          <Link
            href="/downloads"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:bg-slate-100"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Downloads</h3>
                <p className="text-[11px] text-slate-500">{downloads.length} generated files in storage</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/history"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:bg-slate-100"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <HistoryIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Processing History</h3>
                <p className="text-[11px] text-slate-500">{history.length} conversions logged</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/tools"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:bg-slate-100"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">All 220+ Tools Library</h3>
                <p className="text-[11px] text-slate-500">PDF, Word, Excel, Images, OCR, Text</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 3. PREFERENCES & SETTINGS */}
      <div className="space-y-2">
        <h2 className="px-1 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Preferences
        </h2>
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
          <Link
            href="/settings"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:bg-slate-100"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">App Settings</h3>
                <p className="text-[11px] text-slate-500">Theme, Language, Offline Cache, Notifications</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 capitalize">{theme} • {language.toUpperCase()}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </Link>

          <Link
            href="/notifications"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:bg-slate-100"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                <p className="text-[11px] text-slate-500">Updates, system alerts and tool status</p>
              </div>
            </div>
            {unreadCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-extrabold">
                {unreadCount}
              </span>
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </Link>
        </div>
      </div>

      {/* 4. HELP & SUPPORT */}
      <div className="space-y-2">
        <h2 className="px-1 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Help & Support
        </h2>
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
          <Link
            href="/faq"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:bg-slate-100"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">FAQ & User Guide</h3>
                <p className="text-[11px] text-slate-500">Frequently asked questions and tutorials</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/contact"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:bg-slate-100"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Contact & Report a Problem</h3>
                <p className="text-[11px] text-slate-500">Direct developer support and feature requests</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 5. LEGAL & PRIVACY */}
      <div className="space-y-2">
        <h2 className="px-1 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Legal & Privacy
        </h2>
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
          <Link
            href="/privacy"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:bg-slate-100"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Privacy Policy</h3>
                <p className="text-[11px] text-slate-500">100% on-device memory privacy guarantee</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/terms"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:bg-slate-100"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Terms & Conditions</h3>
                <p className="text-[11px] text-slate-500">End-user licensing and acceptable use</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/disclaimer"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:bg-slate-100"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Legal Disclaimer</h3>
                <p className="text-[11px] text-slate-500">Open-source libraries and warranty disclosures</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 6. ABOUT & APP VERSION */}
      <div className="space-y-2">
        <h2 className="px-1 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          About App
        </h2>
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Miftah Tools Pro</h3>
              <p className="text-[11px] text-slate-500">Document & Productivity Engine</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">v2.4.0-native</span>
        </div>
      </div>

      {/* 7. ACCOUNT ACTIONS (LOGOUT / DELETE) */}
      <div className="space-y-2.5 pt-2">
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => setIsLogoutDialogOpen(true)}
            className="w-full p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Log Out of Account</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setDeleteError('');
            setIsDeleteAccountDialogOpen(true);
          }}
          className="w-full p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <Trash2 className="w-4 h-4" />
          <span>{isAuthenticated ? 'Delete Account & Wipe Cloud Data' : 'Clear All Local Device Data'}</span>
        </button>

        <p className="text-[10px] text-center text-slate-400">
          Google Play Compliance: Permanent deletion of user account, cloud &amp; device data.
        </p>
      </div>

      {/* --- DIALOGS & BOTTOM SHEETS --- */}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bio / Headline</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="e.g. Document specialist & productivity enthusiast"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-hidden"
                />
              </div>

              {profileSaved && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Log out of Miftah Tools?</h3>
            <p className="text-xs text-slate-500">You will need to sign back in to access your cloud-synced files.</p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutDialogOpen(false)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Dialog */}
      {isDeleteAccountDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isAuthenticated ? 'Permanently Delete Account?' : 'Clear All Local Device Data?'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAuthenticated
                ? 'This will permanently erase your Firebase user account, profile records, and all locally cached tools data. This action cannot be undone.'
                : 'This will wipe all locally cached downloads, processing history, and custom presets on this device.'}
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold text-left">
                {deleteError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteAccountDialogOpen(false)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteAccount}
                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isAuthenticated ? 'Delete Account' : 'Clear Data'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
