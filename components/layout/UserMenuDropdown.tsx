'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Wrench,
  Star,
  Clock,
  Download,
  Bell,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronDown,
  GraduationCap,
  Camera,
  LayoutDashboard,
  Sparkles,
  Languages,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useTheme } from '@/components/layout/ThemeContext';
import { useUserStore } from '@/lib/user/user-store';

interface UserMenuDropdownProps {
  userName?: string;
  userEmail?: string;
}

const USER_MENU_LOCALES = {
  en: {
    superAdmin: 'SUPER ADMIN',
    proMember: 'PRO MEMBER',
    changePhoto: 'Change Photo',
    uploadPhotoTitle: 'Upload Profile Photo',
    selectLanguage: 'Select Language',
    theme: 'THEME',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    systemMode: 'System Mode',
    profileAria: 'Open User Profile Menu',
  },
  ur: {
    superAdmin: 'سپر ایڈمن',
    proMember: 'پرو ممبر',
    changePhoto: 'تصویر تبدیل کریں',
    uploadPhotoTitle: 'پروفائل تصویر اپلوڈ کریں',
    selectLanguage: 'زبان منتخب کریں',
    theme: 'تھیم',
    lightMode: 'لائٹ موڈ',
    darkMode: 'ڈارک موڈ',
    systemMode: 'سسٹم موڈ',
    profileAria: 'صارف پروفائل مینو کھولیں',
  },
  ar: {
    superAdmin: 'المشرف الرئيسي',
    proMember: 'عضو مميز',
    changePhoto: 'تغيير الصورة',
    uploadPhotoTitle: 'تحميل صورة الملف الشخصي',
    selectLanguage: 'اختر اللغة',
    theme: 'المظهر',
    lightMode: 'الوضع الفاتح',
    darkMode: 'الوضع الداكن',
    systemMode: 'وضع النظام',
    profileAria: 'فتح قائمة الملف الشخصي',
  },
  hi: {
    superAdmin: 'सुपर एडमिन',
    proMember: 'प्रो सदस्य',
    changePhoto: 'फ़ोटो बदलें',
    uploadPhotoTitle: 'प्रोफ़ाइल फ़ोटो अपलोड करें',
    selectLanguage: 'भाषा चुनें',
    theme: 'थीम',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    systemMode: 'सिस्टम मोड',
    profileAria: 'उपयोगकर्ता प्रोफ़ाइल मेनू खोलें',
  },
};

export function UserMenuDropdown({
  userName,
  userEmail,
}: UserMenuDropdownProps) {
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const { profilePhoto, updateProfilePhoto } = useUserStore();
  const { language, setLanguage, t, isRTL } = useI18n();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loc = USER_MENU_LOCALES[language] || USER_MENU_LOCALES.en;
  const displayName = user?.name || userName || 'User';
  const displayEmail = user?.email || userEmail || '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push('/');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          updateProfilePhoto(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const menuItems = [
    { label: t.nav.myProfile || 'Dashboard & Profile', href: '/account', icon: LayoutDashboard },
    { label: t.courses.myCourses || 'My Courses', href: '/courses', icon: GraduationCap },
    { label: t.nav.allTools || 'Tools Directory', href: '/tools', icon: Wrench },
    { label: t.userDashboard.favoritesTitle || 'My Favorites', href: '/favorites', icon: Star },
    { label: t.userDashboard.historyTitle || 'Activity History', href: '/history', icon: Clock },
    { label: t.userDashboard.downloadsTitle || 'Downloads', href: '/downloads', icon: Download },
    { label: t.userDashboard.notificationsTitle || 'Notifications', href: '/notifications', icon: Bell },
    { label: t.nav.settings || 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden File Input for Avatar Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-2 border-brand-500/40 hover:border-brand-600 transition-all text-slate-800 dark:text-slate-100 font-bold text-xs shadow-md shadow-slate-200/50 dark:shadow-none focus:outline-hidden active:scale-95"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={loc.profileAria}
      >
        <div className="relative shrink-0">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Avatar"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover border-2 border-brand-500 shadow-xs"
            />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="hidden sm:flex flex-col items-start min-w-0 text-left rtl:text-right">
          <span className="max-w-[110px] truncate text-xs font-black text-slate-900 dark:text-white leading-tight">
            {displayName}
          </span>
          <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold leading-none">
            {isAdmin ? loc.superAdmin : loc.proMember}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-300 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          className={`absolute mt-2 w-80 max-w-[calc(100vw-20px)] rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isRTL ? 'left-0' : 'right-0'
          }`}
        >
          {/* User Info Header with 1-Click Photo Upload */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-brand-50/40 dark:from-slate-800/80 dark:to-brand-950/30">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative group shrink-0">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Avatar"
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-500 shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center text-base font-black shadow-md">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                  title={loc.uploadPhotoTitle}
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{displayEmail}</p>

                <div className="mt-1.5 flex items-center gap-2">
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[10px] font-black border border-purple-500/30">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{loc.superAdmin}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-700 dark:text-brand-300 text-[10px] font-black border border-brand-500/30">
                      <Sparkles className="w-3 h-3" />
                      <span>{loc.proMember}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 underline inline-flex items-center gap-0.5"
                  >
                    <Camera className="w-2.5 h-2.5" />
                    <span>{loc.changePhoto}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Language Selector Inside Profile Menu */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 dark:text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-brand-600" />
                <span>{loc.selectLanguage}</span>
              </span>
              <span className="uppercase text-[9px] font-mono bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 px-1.5 py-0.2 rounded font-black">
                {language}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'en', label: 'English' },
                { id: 'ur', label: 'اردو' },
                { id: 'ar', label: 'العربية' },
                { id: 'hi', label: 'हिन्दी' },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLanguage(l.id as any)}
                  className={`py-1.5 px-1 rounded-xl text-xs font-black text-center transition-all ${
                    language === l.id
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-500'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nav Items */}
          <div className="py-2 px-1.5 space-y-0.5 max-h-[300px] overflow-y-auto">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}

            {/* Admin Control Center Link if Admin */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors border border-purple-200/60 dark:border-purple-800/60 mt-1"
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
                <span>{t.nav.admin || 'Admin Control Center'}</span>
              </Link>
            )}
          </div>

          {/* Theme Quick Switcher & Logout Section */}
          <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{loc.theme}</span>
              <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-1 rounded-lg text-xs ${theme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400'}`}
                  title={loc.lightMode}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-1 rounded-lg text-xs ${theme === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-400'}`}
                  title={loc.darkMode}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`p-1 rounded-lg text-xs ${theme === 'system' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-400'}`}
                  title={loc.systemMode}
                >
                  <Laptop className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
            >
              <LogOut className={`w-4 h-4 shrink-0 ${isRTL ? '-scale-x-100' : ''}`} />
              <span>{t.nav.logout || 'Log Out'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
