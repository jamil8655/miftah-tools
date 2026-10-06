'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Sparkles,
  Workflow,
  HelpCircle,
  Menu,
  X,
  FileText,
  Star,
  ChevronRight,
  ChevronDown,
  Globe2,
  Download,
  History,
  Info,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { UnifiedSearchModal } from '@/components/search/UnifiedSearchModal';
import { triggerHaptic } from '@/lib/motion/motion-system';

const HEADER_LOCALES = {
  en: {
    tagline: '220+ Digital Tools. One Simple Workspace.',
    search: 'Search',
    searchTooltip: 'Search tools (⌘K)',
    navigationSection: 'Navigation',
    supportSection: 'Support & Legal',
    allTools: 'All 220+ Tools',
    workflows: 'Workflows Studio',
    downloads: 'Downloads Storage',
    history: 'Conversion History',
    favorites: 'Saved & Bookmarks',
    faq: 'FAQ & User Guide',
    contact: 'Contact Support',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    language: 'Language',
    versionLabel: '220+ Client-Side Tools',
  },
  ur: {
    tagline: '220+ ڈیجیٹل ٹولز۔ ایک سادہ ورک اسپیس۔',
    search: 'تلاش کریں',
    searchTooltip: 'فوری تلاش (⌘K)',
    navigationSection: 'نیویگیشن',
    supportSection: 'معاونت اور قانونی',
    allTools: 'تمام 220+ ٹولز',
    workflows: 'ورک فلوز اسٹوڈیو',
    downloads: 'ڈاؤن لوڈز اسٹوریج',
    history: 'تبدیلی کی ہسٹری',
    favorites: 'محفوظ شدہ ٹولز',
    faq: 'عمومی سوالات و رہنمائی',
    contact: 'ڈویلپر سے رابطہ',
    privacy: 'پرائیویسی پالیسی',
    terms: 'شرائط و ضوابط',
    language: 'زبان منتخب کریں',
    versionLabel: '220+ آف لائن ٹولز',
  },
  ar: {
    tagline: '220+ أداة رقمية في مساحة عمل واحدة.',
    search: 'بحث',
    searchTooltip: 'بحث سريع (⌘K)',
    navigationSection: 'التنقل',
    supportSection: 'الدعم والمعلومات القانونية',
    allTools: 'جميع الأدوات 220+',
    workflows: 'استوديو سير العمل',
    downloads: 'مساحة التنزيلات',
    history: 'سجل العمليات',
    favorites: 'الأدوات المحفوظة',
    faq: 'الأسئلة الشائعة والدليل',
    contact: 'الاتصال بالدعم',
    privacy: 'سياسة الخصوصية',
    terms: 'الشروط والأحكام',
    language: 'اللغة',
    versionLabel: '220+ أداة محلية',
  },
  hi: {
    tagline: '220+ डिजिटल टूल्स। एक सरल वर्कस्पेस।',
    search: 'खोजें',
    searchTooltip: 'त्वरित खोज (⌘K)',
    navigationSection: 'नेविगेशन',
    supportSection: 'सहायता व कानूनी',
    allTools: 'सभी 220+ टूल्स',
    workflows: 'वर्कफ़्लो स्टूडियो',
    downloads: 'डाउनलोड स्टोरेज',
    history: 'कन्वर्शन इतिहास',
    favorites: 'बुकमार्क किए गए टूल्स',
    faq: 'अक्सर पूछे जाने वाले प्रश्न',
    contact: 'सपोर्ट से संपर्क करें',
    privacy: 'गोपनीयता नीति',
    terms: 'नियम व शर्तें',
    language: 'भाषा चुनें',
    versionLabel: '220+ ऑफ़लाइन टूल्स',
  },
};

const LANGUAGES = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'ur', label: 'Urdu', native: 'اردو' },
  { id: 'ar', label: 'Arabic', native: 'العربية' },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

export function Header() {
  const pathname = usePathname();
  const { t, language, setLanguage, isRTL } = useI18n();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const loc = HEADER_LOCALES[language] || HEADER_LOCALES.en;

  const currentLangObj = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

  // Close language dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut listener for ⌘K / Ctrl+K
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
    { label: loc.allTools, href: '/tools', icon: Sparkles },
    { label: loc.workflows, href: '/workflows', icon: Workflow },
    { label: loc.faq, href: '/faq', icon: HelpCircle },
    { label: loc.contact, href: '/contact', icon: Info },
  ];

  return (
    <>
      <header
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`sticky top-0 z-40 w-full max-w-full transition-all duration-200 safe-pt-header ${
          isScrolled
            ? 'bg-[#FAFBFC]/95 dark:bg-[#121820]/95 backdrop-blur-md border-b border-[#E1E7EC] dark:border-slate-800 shadow-sm'
            : 'bg-[#FAFBFC] dark:bg-[#121820] border-b border-[#E1E7EC] dark:border-slate-800/80'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[70px] flex items-center justify-between gap-3 min-w-0">
          
          {/* LEFT: MIFTAH TOOLS Logo */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0 shrink">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-transform active:scale-95 shrink-0 select-none py-1"
              aria-label="Miftah Tools Home"
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl sm:text-2xl tracking-tight text-[#0B79B7] dark:text-[#38a8f8] font-sans">
                    MIFTAH
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#0B79B7] text-white text-[9px] sm:text-[10px] font-black tracking-widest uppercase shadow-xs">
                    TOOLS
                  </span>
                </div>
                <span className="text-[10px] text-[#687587] dark:text-slate-400 font-medium hidden md:inline leading-none truncate mt-0.5">
                  {loc.tagline}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-4 rtl:mr-4 rtl:ml-0">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#0B79B7]/10 text-[#0B79B7] dark:bg-[#0B79B7]/20 dark:text-[#38a8f8] font-bold shadow-xs'
                        : 'text-[#182230] hover:text-[#0B79B7] dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#0B79B7] dark:text-[#38a8f8]" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* RIGHT: Language Selector + Search + Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            
            {/* 1. Language Dropdown Selector (Clean 🌐 English ▾) */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setIsLangDropdownOpen((prev) => !prev);
                }}
                className="h-10 px-2.5 sm:px-3 rounded-xl bg-white dark:bg-slate-900 text-[#182230] dark:text-slate-200 border border-[#E1E7EC] dark:border-slate-800 hover:border-[#0B79B7]/40 dark:hover:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-xs active:scale-95 select-none"
                aria-label="Select Language"
                aria-expanded={isLangDropdownOpen}
              >
                <Globe2 className="w-4 h-4 text-[#0B79B7] dark:text-[#38a8f8] shrink-0" />
                <span className="hidden sm:inline">{currentLangObj.native}</span>
                <span className="sm:hidden font-bold uppercase">{currentLangObj.id}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#687587] transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Language Dropdown Menu */}
              {isLangDropdownOpen && (
                <div
                  className={`absolute top-full mt-2 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    isRTL ? 'left-0' : 'right-0'
                  }`}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-[#687587] dark:text-slate-400 uppercase tracking-wider border-b border-[#E1E7EC]/60 dark:border-slate-800">
                    {loc.language}
                  </div>
                  {LANGUAGES.map((lang) => {
                    const isSelected = language === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('selection');
                          setLanguage(lang.id as any);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left rtl:text-right text-xs font-medium flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] font-bold'
                            : 'text-[#182230] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{lang.native}</span>
                          <span className="text-[10px] text-[#687587] dark:text-slate-500">({lang.label})</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#0B79B7] dark:text-[#38a8f8]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Global Search Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setIsSearchOpen(true);
              }}
              className="h-10 px-3 sm:px-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#182230] dark:text-slate-200 border border-[#E1E7EC] dark:border-slate-800 transition-all flex items-center gap-2 text-xs font-semibold shrink-0 shadow-xs active:scale-95"
              title={loc.searchTooltip}
              aria-label={loc.search}
            >
              <Search className="w-4 h-4 text-[#0B79B7] dark:text-[#38a8f8]" />
              <span className="hidden md:inline text-xs font-medium text-[#687587] dark:text-slate-400">{loc.search} (⌘K)</span>
            </button>

            {/* 3. Mobile Menu (☰) Drawer Trigger */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setIsMenuDrawerOpen(true);
              }}
              className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#182230] dark:text-slate-100 border border-[#E1E7EC] dark:border-slate-800 active:scale-95 transition-all flex items-center justify-center shrink-0 shadow-xs"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-[#182230] dark:text-slate-100" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Navigation Drawer */}
      {isMenuDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsMenuDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          <div
            dir={isRTL ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-10 w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between p-5 pt-[max(1.25rem,env(safe-area-inset-top,1.25rem))] pb-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))] overflow-y-auto animate-in duration-200 ${
              isRTL ? 'slide-in-from-left' : 'slide-in-from-right'
            }`}
          >
            <div className="space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between border-b border-[#E1E7EC] dark:border-slate-800 pb-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-lg tracking-tight text-[#0B79B7] dark:text-[#38a8f8] font-sans">
                      MIFTAH
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-[#0B79B7] text-white text-[9px] font-black tracking-wider uppercase shadow-xs">
                      TOOLS
                    </span>
                  </div>
                  <p className="text-[10px] text-[#687587] font-semibold mt-0.5">{loc.versionLabel}</p>
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

              {/* Google Play Store Card in Drawer */}
              <a
                href="https://play.google.com/store/apps/details?id=com.miftahtools.app"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuDrawerOpen(false)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-white text-xs font-bold active:scale-98 transition-all shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-white shadow-xs">
                    <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 512 512">
                      <path fill="#00D3FF" d="M30.4 17.8c-7.7 8.2-12.4 20.3-12.4 35.5v405.4c0 15.2 4.7 27.3 12.4 35.5l2.4 2.2 231-231v-5.8L32.8 15.6l-2.4 2.2z" />
                      <path fill="#FF3A44" d="M340.5 341.2l-76.7-76.7v-5.8l76.7-76.7 1.8 1 90.7 51.5c25.9 14.7 25.9 38.8 0 53.6l-90.7 51.5-1.8 1.6z" />
                      <path fill="#00E676" d="M342.3 342.8L263.8 264 32.8 495.2c8.5 9 22.7 10.1 38.6 1.1l270.9-153.5z" />
                      <path fill="#FFD400" d="M342.3 169.2L71.4 15.7C55.5 6.7 41.3 7.8 32.8 16.8L263.8 248l78.5-78.8z" />
                    </svg>
                  </div>
                  <div className="text-left rtl:text-right">
                    <div className="text-[9px] uppercase tracking-wider text-slate-300 font-bold leading-none">GET IT ON</div>
                    <div className="text-xs font-black tracking-tight text-white leading-none mt-1">Google Play Store</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-white ${isRTL ? 'rotate-180' : ''}`} />
              </a>

              {/* Navigation Links Group */}
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#687587] px-2">{loc.navigationSection}</p>
                {[
                  { label: loc.allTools, href: '/tools', icon: Sparkles },
                  { label: loc.workflows, href: '/workflows', icon: Workflow },
                  { label: loc.downloads, href: '/downloads', icon: Download },
                  { label: loc.history, href: '/history', icon: History },
                  { label: loc.favorites, href: '/favorites', icon: Star },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuDrawerOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[#182230] dark:text-slate-200 text-xs font-bold active:bg-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#0B79B7] dark:text-[#38a8f8]" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-[#687587] ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                  );
                })}
              </div>

              {/* Help & Support Group */}
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#687587] px-2">{loc.supportSection}</p>
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
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[#687587] dark:text-slate-300 text-xs font-medium active:bg-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#687587]" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-[#687587] ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Copyright info */}
            <div className="pt-4 border-t border-[#E1E7EC] dark:border-slate-800 text-[11px] text-[#687587] text-center">
              © 2026 Miftah Tools
            </div>
          </div>
        </div>
      )}

      {/* Global Unified Intent Search Modal */}
      <UnifiedSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
