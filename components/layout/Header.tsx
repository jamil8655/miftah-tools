'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Sparkles,
  Smartphone,
  Workflow,
  GraduationCap,
  Bell,
  LogIn,
  Info,
  HelpCircle,
  Menu,
  X,
  User,
  Settings as SettingsIcon,
  ShieldCheck,
  Download,
  History,
  FileText,
  Star,
  ChevronRight,
  Globe2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { useUserStore } from '@/lib/user/user-store';
import { UnifiedSearchModal } from '@/components/search/UnifiedSearchModal';
import { UserMenuDropdown } from './UserMenuDropdown';
import { AuthModal } from '@/components/auth/AuthModal';

const HEADER_LOCALES = {
  en: {
    tagline: '220+ Client-Side Document & Productivity Tools',
    installApp: 'Install App',
    search: 'Search',
    searchTooltip: 'Quick Search (⌘K)',
    navigationSection: 'Navigation',
    supportSection: 'Support & Legal',
    allTools: 'All 220+ Tools',
    workflows: 'Workflows Studio',
    downloads: 'Downloads Storage',
    history: 'Conversion History',
    settings: 'App Settings',
    account: 'My Account & Profile',
    signInCreate: 'Sign In / Create Account',
    faq: 'FAQ & User Guide',
    contact: 'Contact Developer',
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    language: 'Language',
    logout: 'Log Out',
    versionLabel: 'v2.4.0 Native Edition',
  },
  ur: {
    tagline: '220+ کلائنٹ سائیڈ دستاویز اور پیداواری ٹولز',
    installApp: 'ایپ انسٹال کریں',
    search: 'تلاش کریں',
    searchTooltip: 'فوری تلاش (⌘K)',
    navigationSection: 'نیویگیشن',
    supportSection: 'معاونت اور قانونی',
    allTools: 'تمام 220+ ٹولز',
    workflows: 'ورک فلوز اسٹوڈیو',
    downloads: 'ڈاؤن لوڈز اسٹوریج',
    history: 'تبدیلی کی ہسٹری',
    settings: 'ایپ سیٹنگز',
    account: 'میرا اکاؤنٹ و پروفائل',
    signInCreate: 'سائن ان / نیا اکاؤنٹ بنائیں',
    faq: 'عمومی سوالات و رہنمائی',
    contact: 'ڈویلپر سے رابطہ',
    privacy: 'پرائیویسی پالیسی',
    terms: 'شرائط و ضوابط',
    language: 'زبان منتخب کریں',
    logout: 'لاگ آؤٹ',
    versionLabel: 'v2.4.0 نیٹو ایڈیشن',
  },
  ar: {
    tagline: '220+ أداة محلية متطورة للمستندات والإنتاجية',
    installApp: 'تثبيت التطبيق',
    search: 'بحث',
    searchTooltip: 'بحث سريع (⌘K)',
    navigationSection: 'التنقل',
    supportSection: 'الدعم والمعلومات القانونية',
    allTools: 'جميع الأدوات 220+',
    workflows: 'استوديو سير العمل',
    downloads: 'مساحة التنزيلات',
    history: 'سجل العمليات',
    settings: 'إعدادات التطبيق',
    account: 'حسابي والملف الشخصي',
    signInCreate: 'تسجيل الدخول / إنشاء حساب',
    faq: 'الأسئلة الشائعة والدليل',
    contact: 'الاتصال بالمطور',
    privacy: 'سياسة الخصوصية',
    terms: 'الشروط والأحكام',
    language: 'اللغة',
    logout: 'تسجيل الخروج',
    versionLabel: 'v2.4.0 الإصدار الأصلي',
  },
  hi: {
    tagline: '220+ क्लाइंट-साइड दस्तावेज़ व उत्पादकता टूल्स',
    installApp: 'ऐप इंस्टॉल करें',
    search: 'खोजें',
    searchTooltip: 'त्वरित खोज (⌘K)',
    navigationSection: 'नेविगेशन',
    supportSection: 'सहायता व कानूनी',
    allTools: 'सभी 220+ टूल्स',
    workflows: 'वर्कफ़्लो स्टूडियो',
    downloads: 'डाउनलोड स्टोरेज',
    history: 'कन्वर्शन इतिहास',
    settings: 'ऐप सेटिंग्स',
    account: 'मेरा खाता व प्रोफ़ाइल',
    signInCreate: 'साइन इन / खाता बनाएं',
    faq: 'अक्सर पूछे जाने वाले प्रश्न',
    contact: 'डेवलपर से संपर्क करें',
    privacy: 'गोपनीयता नीति',
    terms: 'नियम व शर्तें',
    language: 'भाषा चुनें',
    logout: 'लॉग आउट',
    versionLabel: 'v2.4.0 नेटिव संस्करण',
  },
};

export function Header() {
  const pathname = usePathname();
  const { t, language, setLanguage, isRTL } = useI18n();
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useUserStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const loc = HEADER_LOCALES[language] || HEADER_LOCALES.en;

  useEffect(() => {
    const isNative =
      typeof window !== 'undefined' &&
      (!!(window as any).Capacitor?.isNativePlatform?.() ||
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        window.location.protocol === 'capacitor:');
    setIsNativeApp(isNative);

    if (isNative) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install: Tap "Share" or "Menu" in your browser and select "Add to Home Screen".');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Quick keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { label: t.nav.allTools || loc.allTools, href: '/tools', icon: Sparkles },
    { label: t.nav.courses || 'Courses', href: '/courses', icon: GraduationCap },
    { label: t.quiz?.title || 'Quizzes', href: '/quiz', icon: HelpCircle },
    { label: t.nav.workflows || loc.workflows, href: '/workflows', icon: Workflow },
    { label: t.footer.aboutPlatform || 'About', href: '/about', icon: Info },
  ];

  return (
    <>
      <header
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`sticky top-0 z-40 w-full max-w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-md'
            : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Left Area: Official Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-6 min-w-0 shrink">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-2.5 group transition-transform active:scale-95 shrink-0"
              aria-label="Miftah Tools Home"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-linear-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform shrink-0 border border-white/20">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 dark:text-white">
                    MIFTAH
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-brand-600 text-white text-[8px] sm:text-[9px] font-black tracking-wider uppercase shadow-xs">
                    TOOLS
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold hidden md:inline leading-none truncate">
                  {loc.tagline}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-2 rtl:mr-2 rtl:ml-0">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar (Search + Notification + Menu Button / Profile) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
            {/* Desktop Install App Trigger */}
            {!isNativeApp && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all shadow-xs shrink-0"
                title={loc.installApp}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{loc.installApp}</span>
              </button>
            )}

            {/* Global Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-medium shrink-0 shadow-xs active:scale-95"
              title={loc.searchTooltip}
              aria-label={loc.search}
            >
              <Search className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span className="hidden md:inline font-bold">{loc.search}</span>
            </button>

            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shrink-0 shadow-xs active:scale-95"
              title={t.userDashboard.notificationsTitle}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-brand-600 ring-2 ring-white dark:ring-slate-900" />
              )}
            </Link>

            {/* Desktop User Menu Dropdown */}
            {isAuthenticated ? (
              <div className="hidden lg:block shrink-0">
                <UserMenuDropdown />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs transition-all shadow-md shadow-brand-600/20 active:scale-95 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="text-xs">{t.nav.login || 'Log In'}</span>
              </button>
            )}

            {/* Mobile & Android Menu (☰) Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsMenuDrawerOpen(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all flex items-center justify-center shrink-0 shadow-xs"
              aria-label="Open App Menu"
            >
              <Menu className="w-5 h-5 text-slate-800 dark:text-slate-100" />
            </button>
          </div>
        </div>
      </header>

      {/* Android Slide-over Navigation Drawer */}
      {isMenuDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Click Dismiss */}
          <div
            onClick={() => setIsMenuDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          <div
            dir={isRTL ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-10 w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between p-5 overflow-y-auto animate-in duration-200 ${
              isRTL ? 'slide-in-from-left' : 'slide-in-from-right'
            }`}
          >
            <div className="space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Miftah Tools</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">{loc.versionLabel}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMenuDrawerOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* User Status Card */}
              {isAuthenticated ? (
                <Link
                  href="/account"
                  onClick={() => setIsMenuDrawerOpen(false)}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || loc.account}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full p-3.5 rounded-2xl bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loc.signInCreate}</span>
                </button>
              )}

              {/* Navigation Links Group */}
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">{loc.navigationSection}</p>
                {[
                  { label: loc.allTools, href: '/tools', icon: Sparkles },
                  { label: loc.workflows, href: '/workflows', icon: Workflow },
                  { label: loc.downloads, href: '/downloads', icon: Download },
                  { label: loc.history, href: '/history', icon: History },
                  { label: loc.settings, href: '/settings', icon: SettingsIcon },
                  { label: loc.account, href: '/account', icon: User },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuDrawerOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold active:bg-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                  );
                })}
              </div>

              {/* Help & Support Group */}
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">{loc.supportSection}</p>
                {[
                  { label: loc.faq, href: '/faq', icon: HelpCircle },
                  { label: loc.contact, href: '/contact', icon: Info },
                  { label: loc.privacy, href: '/privacy', icon: ShieldCheck },
                  { label: loc.terms, href: '/terms', icon: FileText },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuDrawerOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium active:bg-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Language Switcher & Sign Out */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5" /> {loc.language}
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'en', label: 'EN' },
                    { id: 'ur', label: 'UR' },
                    { id: 'hi', label: 'HI' },
                    { id: 'ar', label: 'AR' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLanguage(l.id as any)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        language === l.id
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    logout();
                  }}
                  className="w-full py-2 text-rose-500 text-xs font-bold text-center hover:underline"
                >
                  {loc.logout}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Unified Intent Search Modal */}
      <UnifiedSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
