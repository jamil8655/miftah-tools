'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  FileText,
  Minimize2,
  Combine,
  Image as ImageIcon,
  ScanText,
  QrCode,
  Layers,
  FileCheck,
  Type,
  Video,
  Mic,
  Camera,
  Bookmark,
  Terminal,
  ShieldCheck,
  Search,
  X,
  History,
  CheckCircle2,
  Sliders,
  RefreshCw,
  Calculator,
  Lock,
  Smartphone,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
  HelpCircle,
  Cpu,
} from 'lucide-react';
import { TOOLS_LIST, CATEGORIES_CONFIG } from '@/lib/tools-config';
import { ToolCard } from '@/components/shared/ToolCard';
import { NativeFeedAd } from '@/components/ads/NativeFeedAd';
import { AdSlot } from '@/components/ads/AdSlot';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useUserStore } from '@/lib/user/user-store';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { getLocalizedTool, getLocalizedCategory } from '@/lib/i18n/catalog-translations';

/* ==================================================
   REAL STYLED MULTI-TONE ICONS FOR FLAGSHIP TOOLS
   ================================================== */
function RealPdfToWordIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="12" fill="#FEE2E2" />
      <path d="M12 9C12 7.89543 12.8954 7 14 7H24L31 14V33C31 34.1046 30.1046 35 29 35H14C12.8954 35 12 34.1046 12 33V9Z" fill="#DC2626" />
      <path d="M24 7V14H31" fill="#B91C1C" opacity="0.6" />
      <rect x="8" y="19" width="14" height="12" rx="3.5" fill="#B91C1C" />
      <text x="9.5" y="27.5" fill="white" fontSize="7.5" fontWeight="900" fontFamily="sans-serif">PDF</text>
      <path d="M21 25L24.5 25M23 23.5L25 25L23 26.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="23" y="19" width="14" height="12" rx="3.5" fill="#2563EB" />
      <text x="24.5" y="27.5" fill="white" fontSize="7.5" fontWeight="900" fontFamily="sans-serif">DOC</text>
    </svg>
  );
}

function RealVoiceToTextIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="12" fill="#F3E8FF" />
      <rect x="17" y="10" width="10" height="16" rx="5" fill="#7C3AED" />
      <path d="M12 19C12 24.5228 16.4772 29 22 29C27.5228 29 32 24.5228 32 19" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 29V34M17 34H27" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="31" cy="12" r="2.5" fill="#EC4899" />
      <circle cx="34" cy="17" r="1.5" fill="#8B5CF6" />
      <path d="M8 20C8 20 9.5 17 11 20C12.5 23 14 20 14 20" stroke="#C084FC" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function RealCompressPdfIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="12" fill="#D1FAE5" />
      <path d="M13 9C13 7.89543 13.8954 7 15 7H25L32 14V33C32 34.1046 31.1046 35 30 35H15C13.8954 35 13 34.1046 13 33V9Z" fill="#059669" />
      <path d="M25 7V14H32" fill="#047857" opacity="0.6" />
      <rect x="16" y="17" width="12" height="13" rx="3" fill="#047857" />
      <path d="M18 23.5H26M22 20L22 27M19.5 21.5L22 20L24.5 21.5M19.5 25.5L22 27L24.5 25.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RealImageStudioIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="12" fill="#E0F2FE" />
      <rect x="9" y="9" width="26" height="26" rx="6" fill="#0284C7" />
      <circle cx="17" cy="17" r="3" fill="#FDE047" />
      <path d="M9 28L16 21L23 28L28 23L35 28V31C35 32.6569 33.6569 34 32 34H12C10.3431 34 9 32.6569 9 31V28Z" fill="#38BDF8" />
      <rect x="25" y="7" width="11" height="11" rx="3" fill="#F59E0B" stroke="white" strokeWidth="1.5" />
      <path d="M28.5 12.5L32.5 12.5M30.5 10.5L30.5 14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function RealOcrIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="12" fill="#FEF3C7" />
      <path d="M10 16V12C10 10.8954 10.8954 10 12 10H16M28 10H32C33.1046 10 34 10.8954 34 12V16M34 28V32C34 33.1046 33.1046 34 32 34H28M16 34H12C10.8954 34 10 33.1046 10 32V28" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="14" y="14" width="16" height="16" rx="4" fill="#D97706" />
      <text x="17.5" y="26" fill="white" fontSize="12" fontWeight="900" fontFamily="sans-serif">A</text>
      <line x1="8" y1="22" x2="36" y2="22" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 2" />
    </svg>
  );
}

function RealCameraScannerIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="12" fill="#E0F2FE" />
      <path d="M10 14C10 12.8954 10.8954 12 12 12H16L18.5 9H25.5L28 12H32C33.1046 12 34 12.8954 34 14V32C34 33.1046 33.1046 34 32 34H12C10.8954 34 10 33.1046 10 32V14Z" fill="#0B79B7" />
      <circle cx="22" cy="23" r="7" fill="white" />
      <circle cx="22" cy="23" r="4.5" fill="#075B8C" />
      <circle cx="29" cy="16" r="1.5" fill="#38BDF8" />
    </svg>
  );
}

function RealMediaDownloaderIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="12" fill="#EEF2FF" />
      <rect x="8" y="11" width="28" height="20" rx="5" fill="#4F46E5" />
      <path d="M18 16L26 21L18 26V16Z" fill="white" />
      <circle cx="31" cy="30" r="8" fill="#10B981" stroke="white" strokeWidth="2" />
      <path d="M31 26V33M28.5 31L31 33.5L33.5 31" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RealQrBarcodeIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="12" fill="#CCFBF1" />
      <rect x="9" y="9" width="11" height="11" rx="2.5" fill="#0D9488" />
      <rect x="11.5" y="11.5" width="6" height="6" fill="white" />
      <rect x="13.5" y="13.5" width="2" height="2" fill="#0D9488" />
      <rect x="24" y="9" width="11" height="11" rx="2.5" fill="#0D9488" />
      <rect x="26.5" y="11.5" width="6" height="6" fill="white" />
      <rect x="28.5" y="13.5" width="2" height="2" fill="#0D9488" />
      <rect x="9" y="24" width="11" height="11" rx="2.5" fill="#0D9488" />
      <rect x="11.5" y="26.5" width="6" height="6" fill="white" />
      <rect x="13.5" y="28.5" width="2" height="2" fill="#0D9488" />
      <rect x="24" y="24" width="3" height="11" fill="#0D9488" rx="1" />
      <rect x="29" y="24" width="2.5" height="11" fill="#0D9488" rx="1" />
      <rect x="33" y="24" width="2" height="11" fill="#0D9488" rx="1" />
    </svg>
  );
}

function RealPdfEditorIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="12" fill="#CFFAFE" />
      <path d="M12 9C12 7.89543 12.8954 7 14 7H24L31 14V33C31 34.1046 30.1046 35 29 35H14C12.8954 35 12 34.1046 12 33V9Z" fill="#0891B2" />
      <path d="M24 7V14H31" fill="#0E7490" opacity="0.6" />
      <path d="M16 19H24M16 23H22M16 27H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="30" cy="30" r="8" fill="#F59E0B" stroke="white" strokeWidth="2" />
      <path d="M28 32L32 28M32 28L31 27L27 31V32H28Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RealMergePdfIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="12" fill="#FCE7F3" />
      <rect x="8" y="11" width="15" height="20" rx="3.5" fill="#F472B6" />
      <rect x="21" y="11" width="15" height="20" rx="3.5" fill="#DB2777" />
      <circle cx="22" cy="21" r="6" fill="white" />
      <path d="M19 21H25M22 18V24" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* Category Real Icons */
function RealPdfCategoryIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="#FEE2E2" />
      <path d="M11 7C11 5.89543 11.8954 5 13 5H21L26 10V29C26 30.1046 25.1046 31 24 31H13C11.8954 31 11 30.1046 11 29V7Z" fill="#DC2626" />
      <path d="M21 5V10H26" fill="#B91C1C" opacity="0.6" />
      <rect x="8" y="16" width="13" height="10" rx="2.5" fill="#991B1B" />
      <text x="9.5" y="23.5" fill="white" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">PDF</text>
    </svg>
  );
}

function RealImageCategoryIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="#E0F2FE" />
      <rect x="7" y="7" width="22" height="22" rx="5" fill="#0284C7" />
      <circle cx="13" cy="13" r="2.5" fill="#FDE047" />
      <path d="M7 23L13 17L19 23L23 19L29 24V26C29 27.1046 28.1046 28 27 28H9C7.89543 28 7 27.1046 7 26V23Z" fill="#38BDF8" />
    </svg>
  );
}

function RealTextCategoryIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="#F3E8FF" />
      <rect x="7" y="7" width="22" height="22" rx="5" fill="#7C3AED" />
      <text x="12" y="23" fill="white" fontSize="16" fontWeight="900" fontFamily="serif">T</text>
      <rect x="22" y="18" width="6" height="8" rx="1.5" fill="#EC4899" />
    </svg>
  );
}

function RealConverterCategoryIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="#D1FAE5" />
      <circle cx="18" cy="18" r="11" fill="#059669" />
      <path d="M14 15H22M22 15L19 12M22 21H14M14 21L17 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RealUtilityCategoryIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="#FEF3C7" />
      <rect x="7" y="7" width="22" height="22" rx="5" fill="#D97706" />
      <circle cx="13" cy="13" r="2.5" fill="white" />
      <line x1="13" y1="18" x2="13" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="23" cy="23" r="2.5" fill="white" />
      <line x1="23" y1="11" x2="23" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RealSecurityCategoryIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="#FEE2E2" />
      <path d="M18 6L9 10V18C9 23.5 13 28 18 30C23 28 27 23.5 27 18V10L18 6Z" fill="#DC2626" />
      <circle cx="18" cy="17" r="2.5" fill="white" />
      <rect x="16.5" y="17" width="3" height="4" fill="white" />
    </svg>
  );
}

function RealDevCategoryIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="#EEF2FF" />
      <rect x="6" y="8" width="24" height="20" rx="4" fill="#1E293B" />
      <path d="M12 16L15 18L12 20M18 20H22" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RealCalcCategoryIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="#E0E7FF" />
      <rect x="8" y="7" width="20" height="22" rx="4" fill="#4338CA" />
      <rect x="11" y="10" width="14" height="5" rx="1.5" fill="#A5B4FC" />
      <circle cx="13" cy="19" r="1.5" fill="white" />
      <circle cx="18" cy="19" r="1.5" fill="white" />
      <circle cx="23" cy="19" r="1.5" fill="white" />
      <circle cx="13" cy="24" r="1.5" fill="white" />
      <circle cx="18" cy="24" r="1.5" fill="white" />
      <circle cx="23" cy="24" r="1.5" fill="#F59E0B" />
    </svg>
  );
}

const PAGE_LOCALES = {
  en: {
    heroEyebrow: 'MIFTAH TOOLS',
    heroHeading1: '220+ Digital Tools.',
    heroHeading2: 'One Simple Workspace.',
    heroSupporting: 'Convert, edit, compress and create with fast, privacy-focused tools designed for everyday digital work.',
    exploreAllCta: 'Explore All Tools →',
    downloadAppCta: 'Download Android App',
    searchPlaceholder: 'Search 220+ tools (e.g. PDF to Word, OCR, Compress, QR)...',
    popularTagsLabel: 'Trending:',
    valueTools: '220+ Tools',
    valueToolsDesc: 'Full Client-Side Suite',
    valueFast: 'Fast Processing',
    valueFastDesc: 'Ultra-Fast Local Engine',
    valuePrivate: 'Privacy-Focused',
    valuePrivateDesc: 'Local Processing Where Supported',
    valueFree: 'Free Access',
    valueFreeDesc: 'Zero Sign-In Required',
    popularHeading: 'Popular Tools',
    popularSubheading: 'Start with the tools people use most across all categories.',
    exploreCategoryHeading: 'Explore by Category',
    exploreCategorySubheading: 'Find the right tool for your specific task.',
    whyHeading: 'Why Choose Miftah Tools?',
    whySubheading: 'Explore our core architectural advantages: privacy, performance, and simplicity.',
    faqHeading: 'Frequently Asked Questions',
    faqSubheading: 'Everything you need to know about Miftah Tools capabilities and security.',
    recentToolsHeading: 'Recent Tools',
    allToolsTab: 'All Tools (220+)',
    toolsCount: (count: number) => `${count} tools`,
    noToolsFound: 'No tools found matching your search.',
    resetFilters: 'Reset filters',
    viewAllDirectoryTitle: 'Explore All 220+ Tools',
    viewAllDirectoryDesc: 'Find the right tool for PDF, documents, images, text, conversion and more.',
    viewAllDirectoryBtn: 'Explore All Tools →',
    appBadge: 'OFFICIAL ANDROID APP',
    appHeading: 'Miftah Tools on Android',
    appSupporting: 'Take your favorite tools with you. Process documents and media anywhere with on-device speed.',
    appBullet1: 'Free to use with zero data limits',
    appBullet2: 'On-device privacy protection',
    appBullet3: 'Fast offline tools where supported',
    whyFeatures: [
      {
        icon: Lock,
        title: 'Privacy-Focused Architecture',
        desc: 'Files are processed directly in your browser without uploading to external cloud servers.',
        details: 'Unlike traditional web converters that upload your confidential PDFs and photos to third-party cloud servers, Miftah Tools utilizes browser WebAssembly to execute operations entirely on your local machine. Your documents never leave your device.',
      },
      {
        icon: Zap,
        title: 'Instant WebAssembly Speed',
        desc: 'Optimized local engines deliver instant processing with zero upload/download lag.',
        details: 'By eliminating the latency of uploading hundreds of megabytes over the internet, tasks like merging 50-page PDFs or batch resizing 100 images happen within seconds at native device speed.',
      },
      {
        icon: CheckCircle2,
        title: '100% Free Forever',
        desc: 'Zero subscriptions, hidden credit limits, or mandatory registration.',
        details: 'Access every single one of our 220+ digital tools without signing up, entering credit cards, or encountering artificial daily limits.',
      },
      {
        icon: Layers,
        title: 'Comprehensive 220+ Suite',
        desc: 'An organized ecosystem for PDF, images, OCR, audio, text, security, and developer code.',
        details: 'Stop juggling dozens of different single-purpose websites. Miftah Tools unifies full PDF suites, AI voice transcription, OCR text extraction, and media utilities in one intuitive workspace.',
      },
    ],
    faqItems: [
      {
        q: 'How does in-browser client-side processing protect my privacy?',
        a: 'When you drop a file into Miftah Tools, our WebAssembly engine loads into your browser memory and executes the mathematical transformations locally on your device CPU. No copies of your documents are transmitted to remote servers.',
      },
      {
        q: 'Are there any file size or daily conversion limits?',
        a: 'There are no artificial usage limits. You can convert, edit, and compress files freely as many times as you need, limited only by your computer or phone hardware capacity.',
      },
      {
        q: 'Do I need to install any software or browser extensions?',
        a: 'No installation required! Miftah Tools runs out of the box on Chrome, Safari, Firefox, and Edge on Windows, Mac, Linux, iOS, and Android.',
      },
      {
        q: 'Is there an official Android app available?',
        a: 'Yes, you can install the official Miftah Tools Android app directly from the Google Play Store for an optimized on-device experience.',
      },
      {
        q: 'Which languages are supported by OCR and Voice-to-Text tools?',
        a: 'Our OCR and Voice transcription models support English, Urdu, Arabic, Hindi, Spanish, French, and over 100+ global languages with high recognition accuracy.',
      },
    ],
    categories: [
      { id: 'pdf', name: 'PDF & Documents', count: 38, icon: RealPdfCategoryIcon },
      { id: 'image', name: 'Images', count: 24, icon: RealImageCategoryIcon },
      { id: 'text', name: 'Text & Writing', count: 18, icon: RealTextCategoryIcon },
      { id: 'compress', name: 'Converters', count: 22, icon: RealConverterCategoryIcon },
      { id: 'media', name: 'Utilities', count: 14, icon: RealUtilityCategoryIcon },
      { id: 'security', name: 'Security & Privacy', count: 12, icon: RealSecurityCategoryIcon },
      { id: 'dev', name: 'Developer Tools', count: 26, icon: RealDevCategoryIcon },
      { id: 'calculator', name: 'Other Tools', count: 16, icon: RealCalcCategoryIcon },
    ],
    popularTools: [
      {
        id: 'pdf-to-docx',
        name: 'PDF to Word (OCR)',
        desc: 'Convert PDF files into editable Word documents.',
        href: '/tools/pdf-to-docx',
        icon: RealPdfToWordIcon,
        tag: 'PDF & DOC',
        iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40',
        tagBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60',
      },
      {
        id: 'voice-to-text',
        name: 'Voice to Text (AI)',
        desc: 'Convert audio recordings and speech to clean text.',
        href: '/voice-to-text',
        icon: RealVoiceToTextIcon,
        tag: 'AI VOICE',
        iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40',
        tagBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60',
      },
      {
        id: 'compress-pdf',
        name: 'Compress PDF',
        desc: 'Reduce PDF file size without losing visual quality.',
        href: '/tools/compress-pdf',
        icon: RealCompressPdfIcon,
        tag: 'COMPRESS',
        iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40',
        tagBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60',
      },
      {
        id: 'image-studio',
        name: 'Image Studio Suite',
        desc: 'Resize, convert, crop and optimize images locally.',
        href: '/image-studio',
        icon: RealImageStudioIcon,
        tag: 'IMAGE',
        iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40',
        tagBg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/60',
      },
      {
        id: 'ocr',
        name: 'OCR Image to Text',
        desc: 'Extract editable text from scanned documents & images.',
        href: '/ocr',
        icon: RealOcrIcon,
        tag: 'OCR',
        iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40',
        tagBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60',
      },
      {
        id: 'camera-scanner',
        name: 'Camera Doc Scanner',
        desc: 'Scan physical papers into crisp high-res PDFs.',
        href: '/camera-scanner',
        icon: RealCameraScannerIcon,
        tag: 'SCANNER',
        iconBg: 'bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] border border-[#0B79B7]/20 dark:border-[#0B79B7]/30',
        tagBg: 'bg-blue-50 text-[#075B8C] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60',
      },
      {
        id: 'media-downloader',
        name: 'Media Downloader',
        desc: 'Save and convert video and audio from popular media.',
        href: '/media-downloader',
        icon: RealMediaDownloaderIcon,
        tag: 'MEDIA',
        iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40',
        tagBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60',
      },
      {
        id: 'qr-barcode',
        name: 'QR & Barcode Studio',
        desc: 'Generate custom stylized QR codes and barcodes.',
        href: '/qr-barcode',
        icon: RealQrBarcodeIcon,
        tag: 'UTILITIES',
        iconBg: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40',
        tagBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/60',
      },
      {
        id: 'pdf-editor',
        name: 'PDF Editor Studio',
        desc: 'Edit text, annotate, draw and fill PDF forms.',
        href: '/pdf-editor',
        icon: RealPdfEditorIcon,
        tag: 'EDITOR',
        iconBg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/40',
        tagBg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-900/60',
      },
      {
        id: 'merge-pdf',
        name: 'Merge PDF',
        desc: 'Combine multiple PDF files into one clean document.',
        href: '/tools/merge-pdf',
        icon: RealMergePdfIcon,
        tag: 'MERGE',
        iconBg: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-100 dark:border-pink-900/40',
        tagBg: 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/60 dark:border-pink-900/60',
      },
    ],
  },
  ur: {
    heroEyebrow: 'مفتاح ٹولز',
    heroHeading1: '220+ ڈیجیٹل ٹولز۔',
    heroHeading2: 'ایک سادہ ورک اسپیس۔',
    heroSupporting: 'روزمرہ ڈیجیٹل کام کے لیے تیز رفتار، نجی اور جدید ٹولز کے ذریعے فائلیں تبدیل کریں، ترمیم کریں، کمپریس کریں اور بنائیں بغیر سرور اپلوڈ کے۔',
    exploreAllCta: 'تمام ٹولز دیکھیں ←',
    downloadAppCta: 'اینڈرائیڈ ایپ حاصل کریں',
    searchPlaceholder: '220+ ٹولز تلاش کریں (مثلاً پی ڈی ایف، امیج، او سی آر، کیو آر)...',
    popularTagsLabel: 'مقبول ترین:',
    valueTools: '220+ ٹولز',
    valueToolsDesc: 'مکمل کلائنٹ سائیڈ سوئیٹ',
    valueFast: 'تیز رفتار پروسیسنگ',
    valueFastDesc: 'انتہائی تیز لوکل انجن',
    valuePrivate: 'پرائیویسی پر مبنی',
    valuePrivateDesc: 'جہاں ممکن ہو لوکل پروسیسنگ',
    valueFree: 'مفت رسائی',
    valueFreeDesc: 'بغیر سائن ان مکمل استعمال',
    popularHeading: 'مقبول فلیگ شپ ٹولز',
    popularSubheading: 'سب سے زیادہ استعمال ہونے والے تمام اقسام کے نمایاں ٹولز سے آغاز کریں۔',
    exploreCategoryHeading: 'اقسام کے لحاظ سے دیکھیں',
    exploreCategorySubheading: 'اپنے مخصوص کام کے لیے درست ٹول تلاش کریں۔',
    whyHeading: 'مفتاح ٹولز کا انتخاب کیوں کریں؟',
    whySubheading: 'ہماری اہم ترین خصوصیات اور رازداری کے نظام کو تفصیل سے جانیے۔',
    faqHeading: 'عام پوچھے جانے والے سوالات',
    faqSubheading: 'مفتاح ٹولز کی خصوصیات اور پرائیویسی سے متعلق اہم سوالات و جوابات۔',
    recentToolsHeading: 'حالیہ استعمال شدہ ٹولز',
    allToolsTab: 'تمام ٹولز (220+)',
    toolsCount: (count: number) => `${count} ٹولز`,
    noToolsFound: 'آپ کی تلاش کے مطابق کوئی ٹول نہیں ملا۔',
    resetFilters: 'فلٹرز ری سیٹ کریں',
    viewAllDirectoryTitle: 'تمام 220+ ٹولز دریافت کریں',
    viewAllDirectoryDesc: 'پی ڈی ایف، دستاویزات، تصاویر، ٹیکسٹ اور دیگر تمام ضروریات کے لیے بہترین ٹول تلاش کریں۔',
    viewAllDirectoryBtn: 'تمام ٹولز دیکھیں ←',
    appBadge: 'آفیشل اینڈرائیڈ ایپ',
    appHeading: 'اینڈرائیڈ پر مفتاح ٹولز',
    appSupporting: 'اپنے پسندیدہ ٹولز اپنے ساتھ رکھیں اور آن ڈیوائس رفتار کے ساتھ فائلیں پروسیس کریں۔',
    appBullet1: 'لامحدود اور 100% مفت استعمال',
    appBullet2: 'مکمل پرائیویٹ آن ڈیوائس پروسیسنگ',
    appBullet3: 'تیز رفتار آف لائن ٹولز کی سہولت',
    whyFeatures: [
      {
        icon: Lock,
        title: 'مکمل پرائیویٹ اور محفوظ سسٹم',
        desc: 'فائلیں بیرونی سرور پر اپلوڈ کیے بغیر براہ راست آپ کے براؤزر میں پروسیس ہوتی ہیں۔',
        details: 'مفتاح ٹولز جدید WebAssembly ٹیکنالوجی استعمال کرتا ہے جس کے ذریعے فائلیں آپ کے کمپیوٹر یا موبائل کے اندر ہی پروسیس ہوتی ہیں، کوئی فائل کسی بھی سرور پر محفوظ نہیں ہوتی۔',
      },
      {
        icon: Zap,
        title: 'انتہائی تیز رفتار پروسیسنگ',
        desc: 'جدید کلائنٹ سائیڈ انجن بغیر اپلوڈ کے انتظار کے فوری نتائج فراہم کرتا ہے۔',
        details: 'اپلوڈ اور ڈاؤنلوڈ کی تاخیر مکمل ختم ہو جاتی ہے، جس سے 100 صفحات کی پی ڈی ایف یا درجنوں تصاویر چند سیکنڈ میں تیار ہو جاتی ہیں۔',
      },
      {
        icon: CheckCircle2,
        title: 'ہمیشہ کے لیے 100% مفت',
        desc: 'بغیر کسی رکنیت، پوشیدہ فیس یا لازمی لاگ ان کے تمام ضروری ٹولز استعمال کریں۔',
        details: 'کوئی روزانہ کی حد یا ادائیگی کا مطالبہ نہیں ہے، تمام 220+ ٹولز تمام صارفین کے لیے مکمل آزادانہ دستیاب ہیں۔',
      },
      {
        icon: Layers,
        title: '220+ ٹولز ایک ہی جگہ',
        desc: 'پی ڈی ایف، تصاویر، دستاویزات، آڈیو اور کوڈنگ کے لیے جامع اور منظم مجموعہ۔',
        details: 'الگ الگ ویب سائٹس تلاش کرنے کی ضرورت نہیں، پی ڈی ایف سے لے کر آواز سے ٹیکسٹ اور کیو آر جنریٹر تک سب کچھ ایک جگہ موجود ہے۔',
      },
    ],
    faqItems: [
      {
        q: 'براؤزر پروسیسنگ سے میری فائلوں کی پرائیویسی کیسے محفوظ رہتی ہے؟',
        a: 'جب آپ فائل داخل کرتے ہیں تو انجن براؤزر میموری میں ہی کام انجام دیتا ہے، فائلیں انٹرنیٹ پر کسی سرور پر نہیں جاتیں۔',
      },
      {
        q: 'کیا روزانہ فائل کنورژن کی کوئی حد یا حد مقرر ہے؟',
        a: 'بالکل نہیں! آپ جتنی بار چاہیں جتنی مرضی فائلیں پروسیس کر سکتے ہیں، کوئی حد نہیں ہے۔',
      },
      {
        q: 'کیا مفتاح ٹولز استعمال کرنے کے لیے سافٹ ویئر انسٹال کرنا ضروری ہے؟',
        a: 'نہیں، یہ کروم، سفاری، ایج اور تمام براؤزرز پر براہ راست چلتا ہے۔',
      },
      {
        q: 'کیا موبائل کے لیے آفیشل اینڈرائیڈ ایپ دستیاب ہے؟',
        a: 'جی ہاں، آپ گوگل پلے اسٹور سے مفتاح ٹولز کی آفیشل ایپ حاصل کر سکتے ہیں۔',
      },
      {
        q: 'او سی آر اور آواز سے ٹیکسٹ کے ٹولز کن زبانوں کو سپورٹ کرتے ہیں؟',
        a: 'اردو، عربی، انگلش، ہندی سمیت 100 سے زائد عالمی زبانیں مکمل درستگی کے ساتھ سپورٹ کی جاتی ہیں۔',
      },
    ],
    categories: [
      { id: 'pdf', name: 'پی ڈی ایف اور دستاویزات', count: 38, icon: RealPdfCategoryIcon },
      { id: 'image', name: 'تصاویر', count: 24, icon: RealImageCategoryIcon },
      { id: 'text', name: 'ٹیکسٹ و تحریر', count: 18, icon: RealTextCategoryIcon },
      { id: 'compress', name: 'کنورٹرز', count: 22, icon: RealConverterCategoryIcon },
      { id: 'media', name: 'یوٹیلیٹیز', count: 14, icon: RealUtilityCategoryIcon },
      { id: 'security', name: 'سیکیورٹی و پرائیویسی', count: 12, icon: RealSecurityCategoryIcon },
      { id: 'dev', name: 'ڈویلپر ٹولز', count: 26, icon: RealDevCategoryIcon },
      { id: 'calculator', name: 'دیگر ٹولز', count: 16, icon: RealCalcCategoryIcon },
    ],
    popularTools: [
      {
        id: 'pdf-to-docx',
        name: 'پی ڈی ایف سے ورڈ (OCR)',
        desc: 'پی ڈی ایف کو قابل ترمیم ورڈ فائلوں میں تبدیل کریں۔',
        href: '/tools/pdf-to-docx',
        icon: RealPdfToWordIcon,
        tag: 'پی ڈی ایف',
        iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40',
        tagBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60',
      },
      {
        id: 'voice-to-text',
        name: 'آواز سے ٹیکسٹ (AI)',
        desc: 'آڈیو اور تقریر کو فوری طور پر درست تحریر میں تبدیل کریں۔',
        href: '/voice-to-text',
        icon: RealVoiceToTextIcon,
        tag: 'اے آئی وائس',
        iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40',
        tagBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60',
      },
      {
        id: 'compress-pdf',
        name: 'کمپریس پی ڈی ایف',
        desc: 'معیار برقرار رکھتے ہوئے فائل سائز فوری کم کریں۔',
        href: '/tools/compress-pdf',
        icon: RealCompressPdfIcon,
        tag: 'کمپریس',
        iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40',
        tagBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60',
      },
      {
        id: 'image-studio',
        name: 'امیج اسٹوڈیو',
        desc: 'تصاویر کا سائز تبدیل کریں، کروپ کریں اور کنورٹ کریں۔',
        href: '/image-studio',
        icon: RealImageStudioIcon,
        tag: 'تصاویر',
        iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40',
        tagBg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/60',
      },
      {
        id: 'ocr',
        name: 'تصویر سے ٹیکسٹ (OCR)',
        desc: 'اسکین شدہ کاغذات اور تصاویر سے اردو/انگلش ٹیکسٹ نکالیں۔',
        href: '/ocr',
        icon: RealOcrIcon,
        tag: 'او سی آر',
        iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40',
        tagBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60',
      },
      {
        id: 'camera-scanner',
        name: 'کیمرہ اسکینر',
        desc: 'موبائل کیمرے سے دستاویزات اسکین کر کے ایچ ڈی پی ڈی ایف بنائیں۔',
        href: '/camera-scanner',
        icon: RealCameraScannerIcon,
        tag: 'اسکینر',
        iconBg: 'bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] border border-[#0B79B7]/20 dark:border-[#0B79B7]/30',
        tagBg: 'bg-blue-50 text-[#075B8C] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60',
      },
      {
        id: 'media-downloader',
        name: 'میڈیا ڈاؤن لوڈر',
        desc: 'ویڈیوز اور آڈیو ڈاؤن لوڈ اور کنورٹ کریں۔',
        href: '/media-downloader',
        icon: RealMediaDownloaderIcon,
        tag: 'میڈیا',
        iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40',
        tagBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60',
      },
      {
        id: 'qr-barcode',
        name: 'کیو آر و بارکوڈ اسٹوڈیو',
        desc: 'کسٹم اسٹائلش کیو آر اور بار کوڈز تیار کریں۔',
        href: '/qr-barcode',
        icon: RealQrBarcodeIcon,
        tag: 'یوٹیلیٹیز',
        iconBg: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40',
        tagBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/60',
      },
      {
        id: 'pdf-editor',
        name: 'پی ڈی ایف ایڈیٹر اسٹوڈیو',
        desc: 'پی ڈی ایف پر لکھیں، ڈرا کریں اور فارم پُر کریں۔',
        href: '/pdf-editor',
        icon: RealPdfEditorIcon,
        tag: 'ایڈیٹر',
        iconBg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/40',
        tagBg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-900/60',
      },
      {
        id: 'merge-pdf',
        name: 'پی ڈی ایف یکجا کریں',
        desc: 'متعدد پی ڈی ایف فائلوں کو ایک فائل میں جوڑیں۔',
        href: '/tools/merge-pdf',
        icon: RealMergePdfIcon,
        tag: 'مرج',
        iconBg: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-100 dark:border-pink-900/40',
        tagBg: 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/60 dark:border-pink-900/60',
      },
    ],
  },
  ar: {
    heroEyebrow: 'مفتاح تولز',
    heroHeading1: '220+ أداة رقمية.',
    heroHeading2: 'في مساحة عمل واحدة.',
    heroSupporting: 'قم بتحويل المستندات، وتعديلها، وضغطها، وإنشائها باستخدام أدوات سريعة وآمنة ومصممة للعمل اليومي المتقن.',
    exploreAllCta: 'استكشف جميع الأدوات ←',
    downloadAppCta: 'تحميل تطبيق أندرويد',
    searchPlaceholder: 'ابحث في 220+ أداة (مثل تحويل PDF، ضغط، OCR، QR)...',
    popularTagsLabel: 'الأكثر شيوعاً:',
    valueTools: '220+ أداة',
    valueToolsDesc: 'مجموعة أدوات متكاملة',
    valueFast: 'معالجة فائقة السرعة',
    valueFastDesc: 'محرك محلي فوري',
    valuePrivate: 'خصوصية وأمان',
    valuePrivateDesc: 'معالجة محلية على جهازك',
    valueFree: 'وصول مجاني',
    valueFreeDesc: 'بدون تسجيل دخول أو قيود',
    popularHeading: 'الأدوات الأكثر استخداماً',
    popularSubheading: 'ابدأ بالأدوات الأكثر شيوعاً واستخداماً في كافة الفئات.',
    exploreCategoryHeading: 'استكشف حسب التصنيف',
    exploreCategorySubheading: 'اعثر على الأداة المناسبة لمهامك المحددة.',
    whyHeading: 'لماذا تختار مفتاح تولز؟',
    whySubheading: 'تعرف على مزايانا المعمارية في الأمان والسرعة والسهولة.',
    faqHeading: 'الأسئلة الشائعة',
    faqSubheading: 'كل ما تحتاج لمعرفته حول إمكانيات وأمان منصة مفتاح تولز.',
    recentToolsHeading: 'الأدوات المستخدمة مؤخراً',
    allToolsTab: 'جميع الأدوات (220+)',
    toolsCount: (count: number) => `${count} أداة`,
    noToolsFound: 'لم يتم العثور على أي أداة مطابقة لبحثك.',
    resetFilters: 'إعادة ضبط التصفية',
    viewAllDirectoryTitle: 'استكشف جميع الأدوات 220+',
    viewAllDirectoryDesc: 'اعثر على الأداة المثالية لمعالجة PDF والمستندات والصور والنصوص والمزيد.',
    viewAllDirectoryBtn: 'استكشف جميع الأدوات ←',
    appBadge: 'تطبيق أندرويد الرسمي',
    appHeading: 'مفتاح تولز على أندرويد',
    appSupporting: 'احتفظ بأدواتك المفضلة معك في كل مكان مع سرعة المعالجة على جهازك.',
    appBullet1: 'مجاني بالكامل وبدون حدود للبيانات',
    appBullet2: 'حماية كاملة للخصوصية على جهازك',
    appBullet3: 'أدوات سريعة تعمل بدون اتصال بالإنترنت',
    whyFeatures: [
      {
        icon: Lock,
        title: 'معمارية أمان وخصوصية تامة',
        desc: 'تتم معالجة الملفات مباشرة داخل متصفحك دون رفعها إلى خوادم خارجية.',
        details: 'تعتمد أدواتنا على تقنية WebAssembly المحلية لمعالجة مستنداتك وصورك مباشرة على وحدة المعالجة المركزية بجهازك دون اتصال بسيرفر خارجي.',
      },
      {
        icon: Zap,
        title: 'سرعة معالجة فورية',
        desc: 'محركات WebAssembly المحلية توفر معالجة فورية دون الحاجة إلى انتظار الرفع.',
        details: 'بإلغاء أوقات الرفع الطويلة عبر الإنترنت، تتم معالجة ملفات PDF الكبيرة والوسائط في ثوانٍ معدودة.',
      },
      {
        icon: CheckCircle2,
        title: 'مجاني 100% بدون قيود',
        desc: 'وصول مباشر إلى كافة الأدوات دون اشتراكات مدفوعة أو تسجيل دخول إجباري.',
        details: 'استخدم كافة الأدوات الـ 220+ بدون حسابات أو بطاقات ائتمان أو حدود يومية.',
      },
      {
        icon: Layers,
        title: 'مجموعة شاملة 220+ أداة',
        desc: 'مجموعة شاملة ومنظمة تغطي كافة احتياجات المستندات والصور والأكواد والوسائط.',
        details: 'مساحة عمل موحدة تغنيك عن تصفح عشرات المواقع المختلفة.',
      },
    ],
    faqItems: [
      {
        q: 'كيف تحمي المعالجة المحلية داخل المتصفح خصوصيتي؟',
        a: 'تتم كافة العمليات الحسابية داخل متصفحك دون إرسال نسخ من ملفاتك إلى أي سيرفر خارجي.',
      },
      {
        q: 'هل هناك حد أقصى لحجم الملفات أو عدد مرات التحويل اليومي؟',
        a: 'لا توجد أي قيود مصطنعة، يمكنك التحويل والمعالجة بحرية تامة وفق قدرة جهازك.',
      },
      {
        q: 'هل أحتاج لتثبيت أي برامج أو إضافات؟',
        a: 'لا، يعمل الموقع مباشرة على كافة المتصفحات الحديثة.',
      },
      {
        q: 'هل يتوفر تطبيق رسمي لأجهزة أندرويد؟',
        a: 'نعم، يتوفر تطبيق مفتاح تولز الرسمي مجاناً عبر متجر Google Play.',
      },
      {
        q: 'ما اللغات التي تدعمها أدوات التعرف الضوئي OCR والصوت؟',
        a: 'تدعم الأدوات أكثر من 100 لغة حول العالم بما فيها العربية والإنجليزية والأوردو وغيرها.',
      },
    ],
    categories: [
      { id: 'pdf', name: 'PDF والمستندات', count: 38, icon: RealPdfCategoryIcon },
      { id: 'image', name: 'الصور', count: 24, icon: RealImageCategoryIcon },
      { id: 'text', name: 'النصوص والكتابة', count: 18, icon: RealTextCategoryIcon },
      { id: 'compress', name: 'محولات الصيغ', count: 22, icon: RealConverterCategoryIcon },
      { id: 'media', name: 'الأدوات المساعدة', count: 14, icon: RealUtilityCategoryIcon },
      { id: 'security', name: 'الأمان والخصوصية', count: 12, icon: RealSecurityCategoryIcon },
      { id: 'dev', name: 'أدوات المطورين', count: 26, icon: RealDevCategoryIcon },
      { id: 'calculator', name: 'أدوات أخرى', count: 16, icon: RealCalcCategoryIcon },
    ],
    popularTools: [
      {
        id: 'pdf-to-docx',
        name: 'تحويل PDF إلى Word (OCR)',
        desc: 'تحويل مستندات PDF إلى ملفات Word قابلة للتعديل.',
        href: '/tools/pdf-to-docx',
        icon: RealPdfToWordIcon,
        tag: 'PDF',
        iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40',
        tagBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60',
      },
      {
        id: 'voice-to-text',
        name: 'تحويل الصوت إلى نص (AI)',
        desc: 'تحويل التسجيلات الصوتية والكلام إلى نصوص دقيقة فوراً.',
        href: '/voice-to-text',
        icon: RealVoiceToTextIcon,
        tag: 'ذكاء صوتي',
        iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40',
        tagBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60',
      },
      {
        id: 'compress-pdf',
        name: 'ضغط ملفات PDF',
        desc: 'تقليل حجم ملفات PDF مع الحفاظ على وضوحها.',
        href: '/tools/compress-pdf',
        icon: RealCompressPdfIcon,
        tag: 'ضغط',
        iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40',
        tagBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60',
      },
      {
        id: 'image-studio',
        name: 'استوديو الصور المتكامل',
        desc: 'تغيير الحجم، القص، وتحسين الصور محلياً.',
        href: '/image-studio',
        icon: RealImageStudioIcon,
        tag: 'صور',
        iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40',
        tagBg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/60',
      },
      {
        id: 'ocr',
        name: 'استخراج النصوص (OCR)',
        desc: 'استخراج النصوص من الصور والمستندات الممسوحة ضوئياً.',
        href: '/ocr',
        icon: RealOcrIcon,
        tag: 'OCR',
        iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40',
        tagBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60',
      },
      {
        id: 'camera-scanner',
        name: 'ماسح الكاميرا الضوئي',
        desc: 'مسح المستندات الورقية عبر الكاميرا وتحويلها إلى PDF عالي الجودة.',
        href: '/camera-scanner',
        icon: RealCameraScannerIcon,
        tag: 'ماسح',
        iconBg: 'bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] border border-[#0B79B7]/20 dark:border-[#0B79B7]/30',
        tagBg: 'bg-blue-50 text-[#075B8C] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60',
      },
      {
        id: 'media-downloader',
        name: 'تنزيل وتحويل الوسائط',
        desc: 'تنزيل وتحويل مقاطع الفيديو والتسجيلات الصوتية بسهولة.',
        href: '/media-downloader',
        icon: RealMediaDownloaderIcon,
        tag: 'وسائط',
        iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40',
        tagBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60',
      },
      {
        id: 'qr-barcode',
        name: 'استوديو QR والباركود',
        desc: 'إنشاء رموز QR وباركود احترافية ومخصصة.',
        href: '/qr-barcode',
        icon: RealQrBarcodeIcon,
        tag: 'أدوات',
        iconBg: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40',
        tagBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/60',
      },
      {
        id: 'pdf-editor',
        name: 'استوديو محرر PDF',
        desc: 'تعديل النصوص وإضافة التوقيعات وملء النماذج.',
        href: '/pdf-editor',
        icon: RealPdfEditorIcon,
        tag: 'محرر',
        iconBg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/40',
        tagBg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-900/60',
      },
      {
        id: 'merge-pdf',
        name: 'دمج وتجميع PDF',
        desc: 'دمج ملفات PDF متعددة في مستند واحد منظم.',
        href: '/tools/merge-pdf',
        icon: RealMergePdfIcon,
        tag: 'دمج',
        iconBg: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-100 dark:border-pink-900/40',
        tagBg: 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/60 dark:border-pink-900/60',
      },
    ],
  },
  hi: {
    heroEyebrow: 'मिफ़्ताह टूल्स',
    heroHeading1: '220+ डिजिटल टूल्स।',
    heroHeading2: 'एक सरल वर्कस्पेस।',
    heroSupporting: 'फ़ाइलें कन्वर्ट, एडिट, कंप्रेस और क्रिएट करें — रोज़मर्रा के डिजिटल काम के लिए तेज़ और 100% सुरक्षित टूल्स।',
    exploreAllCta: 'सभी टूल्स देखें →',
    downloadAppCta: 'एंड्रॉइड ऐप डाउनलोड करें',
    searchPlaceholder: '220+ टूल्स खोजें (उदा. PDF से Word, OCR, कंप्रेस, QR)...',
    popularTagsLabel: 'ट्रेंडिंग:',
    valueTools: '220+ टूल्स',
    valueToolsDesc: 'संपूर्ण क्लाइंट-साइड सूट',
    valueFast: 'फास्ट प्रोसेसिंग',
    valueFastDesc: 'अल्ट्रा-फास्ट लोकल इंजन',
    valuePrivate: 'गोपनीयता-केंद्रित',
    valuePrivateDesc: 'जहां संभव हो डिवाइस पर प्रोसेस',
    valueFree: 'मुफ़्त एक्सेस',
    valueFreeDesc: 'बिना लॉगिन तुरंत उपयोग',
    popularHeading: 'लोकप्रिय टूल्स',
    popularSubheading: 'सभी श्रेणियों में सबसे अधिक उपयोग किए जाने वाले प्रमुख टूल्स।',
    exploreCategoryHeading: 'श्रेणी के अनुसार खोजें',
    exploreCategorySubheading: 'अपने काम کے लिए सही टूल तुरंत प्राप्त करें।',
    whyHeading: 'मिफ़्ताह टूल्स क्यों चुनें?',
    whySubheading: 'हमारी कोर विशेषताओं, सुरक्षा और हाई-स्पीड आर्किटेक्चर को विस्तार से समझें।',
    faqHeading: 'अक्सर पूछे जाने वाले प्रश्न',
    faqSubheading: 'मिफ़्ताह टूल्स की क्षमताओं और डेटा सुरक्षा से जुड़े सभी उत्तर।',
    recentToolsHeading: 'हाल ही में उपयोग किए गए टूल्स',
    allToolsTab: 'सभी टूल्स (220+)',
    toolsCount: (count: number) => `${count} टूल्स`,
    noToolsFound: 'आपकी खोज से मेल खाता कोई टूल नहीं मिला।',
    resetFilters: 'फ़िल्टर रीसेट करें',
    viewAllDirectoryTitle: 'सभी 220+ टूल्स एक्सप्लोر करें',
    viewAllDirectoryDesc: 'PDF, दस्तावेज़, चित्र, टेक्स्ट, कन्वर्शन और बहुत कुछ के लिए सही टूल खोजें।',
    viewAllDirectoryBtn: 'सभी टूल्स देखें →',
    appBadge: 'आधिकारिक एंड्रॉइड ऐप',
    appHeading: 'एंड्रॉइड पर मिफ़्ताह टूल्स',
    appSupporting: 'अपने पसंदीदा टूल्स अपने साथ रखें और ऑन-डिवाइस स्पीड के साथ फ़ाइलें प्रोसेस करें।',
    appBullet1: 'बिना किसी सीमा के 100% मुफ़्त',
    appBullet2: 'ऑन-डिवाइस पूर्ण गोपनीयता सुरक्षा',
    appBullet3: 'तेज़ गति वाले ऑफ़लाइन टूल्स',
    whyFeatures: [
      {
        icon: Lock,
        title: 'गोपनीयता-केंद्रित आर्किटेक्चर',
        desc: 'फ़ाइलें बिना बाहरी सर्वर पर भेजे सीधे आपके ब्राउज़र में प्रोसेस होती हैं।',
        details: 'मिफ़्ताह टूल्स उन्नत WebAssembly तकनीक का उपयोग करता है जिससे फ़ाइलें आपके कंप्यूटर या फ़ोन पर ही प्रोसेस होती हैं, कोई भी फ़ाइल क्लाउड सर्वर पर नहीं जाती।',
      },
      {
        icon: Zap,
        title: 'अल्ट्रा-फ़ास्ट स्पीड',
        desc: 'स्थानीय इंजन बिना किसी अपलोड व डाउनलोड इंतज़ार के तुरंत प्रोसेसिंग करते हैं।',
        details: 'इंटरनेट पर अपलोड की देरी पूरी तरह समाप्त हो जाती है, जिससे बड़े दस्तावेज़ तुरंत प्रोसेस होते हैं।',
      },
      {
        icon: CheckCircle2,
        title: 'हमेशा के लिए 100% मुफ़्त',
        desc: 'बिना किसी सब्सक्रिप्शन या अनिवार्य लॉगिन के सभी टूल्स का मुफ़्त उपयोग करें।',
        details: 'कोई छुपा हुआ शुल्क या दैनिक सीमा नहीं है, सभी 220+ टूल्स पूरी तरह स्वतंत्र उपलब्ध हैं।',
      },
      {
        icon: Layers,
        title: '220+ टूल्स एक ही स्थान पर',
        desc: 'PDF, इमेज, दस्तावेज़, ऑडियो और कोडिंग کے लिए एक विस्तृत टूलकिट।',
        details: 'अलग-अलग वेबसाइट खोजने की आवश्यकता नहीं, सभी आवश्यक उपयोगिताएं एक ही स्थान पर उपलब्ध हैं।',
      },
    ],
    faqItems: [
      {
        q: 'ब्राउज़र प्रोसेसिंग से मेरी फ़ाइलों की गोपनीयता कैसे सुरक्षित रहती है?',
        a: 'फ़ाइलें सीधे आपके डिवाइस की मेमोरी में प्रोसेस होती हैं और किसी भी सर्वर पर अपलोड नहीं की जातीं।',
      },
      {
        q: 'क्या कोई फ़ाइल साइज़ या दैनिक सीमा है?',
        a: 'कोई कृत्रिम सीमा नहीं है, आप जितनी चाहें फ़ाइलें प्रोसेस कर सकते हैं।',
      },
      {
        q: 'क्या कोई ऐप या एक्सटेंशन इंस्टॉल करना ज़रूरी है?',
        a: 'नहीं, यह सभी आधुनिक ब्राउज़रों पर सीधे काम करता है।',
      },
      {
        q: 'क्या आधिकारिक एंड्रॉइड ऐप उपलब्ध है?',
        a: 'हाँ, आप Google Play Store से आधिकारिक मिफ़्ताह टूल्स ऐप डाउनलोड कर सकते हैं।',
      },
      {
        q: 'OCR और वॉइस टूल्स किन भाषाओं को सपोर्ट करते हैं?',
        a: 'हिंदी, उर्दू, अंग्रेज़ी, अरबी सहित 100+ वैश्विक भाषाएं पूर्ण सटीकता के साथ समर्थित हैं।',
      },
    ],
    categories: [
      { id: 'pdf', name: 'PDF व दस्तावेज़', count: 38, icon: RealPdfCategoryIcon },
      { id: 'image', name: 'इमेज', count: 24, icon: RealImageCategoryIcon },
      { id: 'text', name: 'टेक्स्ट व लेखन', count: 18, icon: RealTextCategoryIcon },
      { id: 'compress', name: 'कन्वर्टर्स', count: 22, icon: RealConverterCategoryIcon },
      { id: 'media', name: 'यूटिलिटीज', count: 14, icon: RealUtilityCategoryIcon },
      { id: 'security', name: 'सुरक्षा व गोपनीयता', count: 12, icon: RealSecurityCategoryIcon },
      { id: 'dev', name: 'डेवलपर टूल्स', count: 26, icon: RealDevCategoryIcon },
      { id: 'calculator', name: 'अन्य टूल्स', count: 16, icon: RealCalcCategoryIcon },
    ],
    popularTools: [
      {
        id: 'pdf-to-docx',
        name: 'PDF से Word (OCR)',
        desc: 'PDF दस्तावेज़ों को संपादन योग्य Word फ़ाइलों में बदलें।',
        href: '/tools/pdf-to-docx',
        icon: RealPdfToWordIcon,
        tag: 'PDF व डॉक',
        iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40',
        tagBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60',
      },
      {
        id: 'voice-to-text',
        name: 'वॉइस से टेक्स्ट (AI)',
        desc: 'ऑडियो और अपनी आवाज़ को तुरंत सटीक टेक्स्ट में बदलें।',
        href: '/voice-to-text',
        icon: RealVoiceToTextIcon,
        tag: 'AI वॉइस',
        iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40',
        tagBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60',
      },
      {
        id: 'compress-pdf',
        name: 'PDF कंप्रेस करें',
        desc: 'क्वालिटी खोए बिना PDF फ़ाइल का साइज़ तुरंत घटाएं।',
        href: '/tools/compress-pdf',
        icon: RealCompressPdfIcon,
        tag: 'कंप्रेस',
        iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40',
        tagBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60',
      },
      {
        id: 'image-studio',
        name: 'इमेज स्टूडियो सूट',
        desc: 'इमेज का साइज़ बदलें, क्रॉप करें और कन्वर्ट करें।',
        href: '/image-studio',
        icon: RealImageStudioIcon,
        tag: 'इमेज',
        iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40',
        tagBg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/60',
      },
      {
        id: 'ocr',
        name: 'फोटो से टेक्स्ट (OCR)',
        desc: 'स्कैन किए गए दस्तावेज़ों से संपादन योग्य टेक्स्ट निकालें।',
        href: '/ocr',
        icon: RealOcrIcon,
        tag: 'OCR',
        iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40',
        tagBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60',
      },
      {
        id: 'camera-scanner',
        name: 'कैमरा स्कैनर',
        desc: 'कैमरे से सीधे दस्तावेज़ स्कैन करके HD PDF बनाएं।',
        href: '/camera-scanner',
        icon: RealCameraScannerIcon,
        tag: 'स्कैनर',
        iconBg: 'bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] border border-[#0B79B7]/20 dark:border-[#0B79B7]/30',
        tagBg: 'bg-blue-50 text-[#075B8C] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60',
      },
      {
        id: 'media-downloader',
        name: 'मीडिया डाउनलोडर',
        desc: 'वीडियो और ऑडियो फ़ाइलें आसानी से डाउनलोड व कन्वर्ट करें।',
        href: '/media-downloader',
        icon: RealMediaDownloaderIcon,
        tag: 'मीडिया',
        iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40',
        tagBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60',
      },
      {
        id: 'qr-barcode',
        name: 'QR व बारकोड स्टूडियो',
        desc: 'कस्टम और स्टाइलिश QR कोड व बारकोड जनरेट करें।',
        href: '/qr-barcode',
        icon: RealQrBarcodeIcon,
        tag: 'यूटिलिटीज',
        iconBg: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40',
        tagBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/60',
      },
      {
        id: 'pdf-editor',
        name: 'PDF एडिटर स्टूडियो',
        desc: 'टेक्स्ट जोड़ें, एनोटेट करें और PDF फ़ॉर्म भरें।',
        href: '/pdf-editor',
        icon: RealPdfEditorIcon,
        tag: 'एडिटर',
        iconBg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/40',
        tagBg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-900/60',
      },
      {
        id: 'merge-pdf',
        name: 'PDF मर्ज करें',
        desc: 'कई PDF फ़ाइलों को एक साफ़ दस्तावेज़ में जोड़ें।',
        href: '/tools/merge-pdf',
        icon: RealMergePdfIcon,
        tag: 'मर्ज',
        iconBg: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-100 dark:border-pink-900/40',
        tagBg: 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/60 dark:border-pink-900/60',
      },
    ],
  },
};
export default function HomePage() {
  const { language, isRTL } = useI18n();
  const { recentTools: storeRecentTools } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openWhyIndex, setOpenWhyIndex] = useState<number | null>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const loc = PAGE_LOCALES[language] || PAGE_LOCALES.en;

  // Recent tools logic: only show if user has actual history items
  const recentTools = useMemo(() => {
    if (!storeRecentTools || storeRecentTools.length === 0) return [];
    const recentIds = storeRecentTools.slice(0, 5).map((h) => h.toolId);
    return TOOLS_LIST.filter((t) => recentIds.includes(t.id) || recentIds.includes(t.slug)).slice(0, 5);
  }, [storeRecentTools]);

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return TOOLS_LIST.filter((tool) => {
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      if (!matchesCategory) return false;

      if (!query) return true;

      const localized = getLocalizedTool(tool, language);
      const name = (localized?.name || tool.name).toLowerCase();
      const desc = (localized?.shortDesc || tool.shortDesc || tool.fullDesc || '').toLowerCase();
      const tags = (tool.tags || []).join(' ').toLowerCase();

      return name.includes(query) || desc.includes(query) || tags.includes(query) || tool.id.includes(query);
    });
  }, [searchQuery, activeCategory, language]);

  return (
    <div className="w-full bg-[#FAFBFC] dark:bg-[#121820] text-[#182230] dark:text-slate-100 min-h-screen transition-colors">
      
      {/* ==================================================
          1. HERO SECTION (ENHANCED MODERN PRODUCT COMPOSITION)
          ================================================== */}
      <section className="relative overflow-hidden bg-white dark:bg-[#0c1017] border-b border-[#E1E7EC] dark:border-slate-800/80 pt-10 pb-12 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
        
        {/* Subtle geometric pattern background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#0B79B7_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Soft atmospheric gradient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-[#0B79B7]/5 dark:bg-[#0B79B7]/10 blur-[100px] pointer-events-none -z-0" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          
          {/* Eyebrow Badge with Micro Pulse */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B79B7]/10 dark:bg-[#0B79B7]/20 border border-[#0B79B7]/20 text-[#0B79B7] dark:text-[#38a8f8] text-[11px] sm:text-xs font-bold uppercase tracking-widest select-none shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#0B79B7] animate-pulse" />
            <span>{loc.heroEyebrow}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#182230] dark:text-white tracking-tight leading-[1.15] max-w-3xl mx-auto">
            <span>{loc.heroHeading1}</span>
            <span className="block text-[#0B79B7] dark:text-[#38a8f8] mt-1">{loc.heroHeading2}</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base md:text-lg text-[#687587] dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {loc.heroSupporting}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/tools"
              onClick={() => triggerHaptic('selection')}
              className="h-12 px-6 rounded-xl bg-[#0B79B7] hover:bg-[#075B8C] text-white font-bold text-sm shadow-md shadow-[#0B79B7]/20 active:scale-95 transition-all inline-flex items-center gap-2 select-none cursor-pointer"
            >
              <span>{loc.exploreAllCta}</span>
            </Link>

            <a
              href="#android-app"
              onClick={() => triggerHaptic('selection')}
              className="h-12 px-5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0B79B7] dark:text-[#38a8f8] border border-[#0B79B7]/40 dark:border-slate-700 font-bold text-sm shadow-xs active:scale-95 transition-all inline-flex items-center gap-2 select-none cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>{loc.downloadAppCta}</span>
            </a>
          </div>

          {/* Real-time Global Search Input */}
          <div className="max-w-2xl mx-auto pt-3 space-y-3">
            <div className="relative flex items-center shadow-xs rounded-2xl bg-[#F5F7F9] dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 focus-within:border-[#0B79B7] dark:focus-within:border-[#0B79B7] focus-within:bg-white transition-all">
              <Search className="w-5 h-5 text-[#0B79B7] dark:text-[#38a8f8] absolute left-4 rtl:left-auto rtl:right-4 pointer-events-none shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={loc.searchPlaceholder}
                className="w-full py-3.5 pl-12 pr-12 rtl:pl-12 rtl:pr-12 bg-transparent text-xs sm:text-sm text-[#182230] dark:text-white placeholder:text-[#687587] focus:outline-none rounded-2xl font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 rtl:right-auto rtl:left-4 p-1 rounded-lg text-[#687587] hover:text-[#182230] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Trending Quick Shortcut Tags */}
            <div className="flex items-center justify-center flex-wrap gap-1.5 pt-1 text-[11px] text-[#687587]">
              <span className="font-bold text-[#182230] dark:text-slate-300">{loc.popularTagsLabel}</span>
              <Link href="/tools/pdf-to-docx" className="px-2.5 py-1 rounded-lg bg-[#F5F7F9] dark:bg-slate-900 hover:bg-[#0B79B7]/10 hover:text-[#0B79B7] border border-[#E1E7EC] dark:border-slate-800 transition-colors">
                📄 PDF to Word
              </Link>
              <Link href="/voice-to-text" className="px-2.5 py-1 rounded-lg bg-[#F5F7F9] dark:bg-slate-900 hover:bg-[#0B79B7]/10 hover:text-[#0B79B7] border border-[#E1E7EC] dark:border-slate-800 transition-colors">
                🎙️ Voice to Text
              </Link>
              <Link href="/tools/compress-pdf" className="px-2.5 py-1 rounded-lg bg-[#F5F7F9] dark:bg-slate-900 hover:bg-[#0B79B7]/10 hover:text-[#0B79B7] border border-[#E1E7EC] dark:border-slate-800 transition-colors">
                🗜️ Compress PDF
              </Link>
              <Link href="/image-studio" className="px-2.5 py-1 rounded-lg bg-[#F5F7F9] dark:bg-slate-900 hover:bg-[#0B79B7]/10 hover:text-[#0B79B7] border border-[#E1E7EC] dark:border-slate-800 transition-colors">
                🖼️ Image Studio
              </Link>
              <Link href="/camera-scanner" className="px-2.5 py-1 rounded-lg bg-[#F5F7F9] dark:bg-slate-900 hover:bg-[#0B79B7]/10 hover:text-[#0B79B7] border border-[#E1E7EC] dark:border-slate-800 transition-colors">
                📷 Scanner
              </Link>
              <Link href="/qr-barcode" className="px-2.5 py-1 rounded-lg bg-[#F5F7F9] dark:bg-slate-900 hover:bg-[#0B79B7]/10 hover:text-[#0B79B7] border border-[#E1E7EC] dark:border-slate-800 transition-colors">
                📱 QR Studio
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================
          2. TRUST / VALUE STRIP (COMPACT 2x2 ON MOBILE, 4 IN A ROW ON DESKTOP)
          ================================================== */}
      <section className="border-b border-[#E1E7EC] dark:border-slate-800 bg-[#F5F7F9] dark:bg-[#0e141c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            
            {/* Value 1: 220+ Tools */}
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC]/80 dark:border-slate-800 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#182230] dark:text-white truncate">{loc.valueTools}</p>
                <p className="text-[10px] text-[#687587] dark:text-slate-400 truncate">{loc.valueToolsDesc}</p>
              </div>
            </div>

            {/* Value 2: Fast Processing */}
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC]/80 dark:border-slate-800 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#182230] dark:text-white truncate">{loc.valueFast}</p>
                <p className="text-[10px] text-[#687587] dark:text-slate-400 truncate">{loc.valueFastDesc}</p>
              </div>
            </div>

            {/* Value 3: Privacy-Focused */}
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC]/80 dark:border-slate-800 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#182230] dark:text-white truncate">{loc.valuePrivate}</p>
                <p className="text-[10px] text-[#687587] dark:text-slate-400 truncate">{loc.valuePrivateDesc}</p>
              </div>
            </div>

            {/* Value 4: Free Access */}
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC]/80 dark:border-slate-800 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#182230] dark:text-white truncate">{loc.valueFree}</p>
                <p className="text-[10px] text-[#687587] dark:text-slate-400 truncate">{loc.valueFreeDesc}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          3. RECENT TOOLS (ONLY IF USER HAS ACTUAL HISTORY)
          ================================================== */}
      {recentTools.length > 0 && !searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#182230] dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-[#0B79B7] dark:text-[#38a8f8]" />
                <span>{loc.recentToolsHeading}</span>
              </h2>
              <Link href="/history" className="text-[11px] font-bold text-[#0B79B7] dark:text-[#38a8f8] hover:underline">
                View All →
              </Link>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {recentTools.map((tool) => {
                const localized = getLocalizedTool(tool, language);
                return (
                  <Link
                    key={`recent-${tool.id}`}
                    href={`/tools/${tool.slug || tool.id}`}
                    className="px-3 py-1.5 rounded-xl bg-[#F5F7F9] dark:bg-slate-800 hover:bg-[#0B79B7]/10 text-xs font-bold text-[#182230] dark:text-slate-200 border border-[#E1E7EC] dark:border-slate-700 whitespace-nowrap transition-colors shrink-0"
                  >
                    {localized.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          4. POPULAR TOOLS SECTION (10 FLAGSHIP REAL ICONS, 5 COLS DESKTOP, 2 COLS MOBILE)
          ================================================== */}
      {!searchQuery && activeCategory === 'all' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#182230] dark:text-white tracking-tight">
                {loc.popularHeading}
              </h2>
              <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-400 mt-0.5">
                {loc.popularSubheading}
              </p>
            </div>
            <Link
              href="/tools"
              className="text-xs font-bold text-[#0B79B7] dark:text-[#38a8f8] hover:underline inline-flex items-center gap-1 self-start sm:self-auto pt-1"
            >
              <span>{loc.exploreAllCta}</span>
            </Link>
          </div>

          {/* 10 Flagship Tools Grid across all key categories */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {loc.popularTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  onClick={() => triggerHaptic('selection')}
                  className="group relative p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 hover:border-[#0B79B7]/50 dark:hover:border-[#0B79B7]/50 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between active:scale-[0.98] select-none"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-10 h-10" />
                      </div>
                      {tool.tag && (
                        <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md ${tool.tagBg || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'} uppercase tracking-wider truncate`}>
                          {tool.tag}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-[#182230] dark:text-white group-hover:text-[#0B79B7] dark:group-hover:text-[#38a8f8] transition-colors line-clamp-1">
                        {tool.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#687587] dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 mt-2.5 border-t border-[#E1E7EC]/60 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#0B79B7] dark:text-[#38a8f8]">
                    <span className="text-[10px] text-[#687587] font-semibold uppercase">Free • Local</span>
                    <span className={`transform transition-transform ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}>
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================================================
          5. CATEGORY NAVIGATION ("Explore by Category")
          ================================================== */}
      {!searchQuery && activeCategory === 'all' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#182230] dark:text-white tracking-tight">
              {loc.exploreCategoryHeading}
            </h2>
            <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-400 mt-0.5">
              {loc.exploreCategorySubheading}
            </p>
          </div>

          {/* 8 Category Cards with Real Tool Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {loc.categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setActiveCategory(cat.id);
                  }}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 hover:border-[#0B79B7]/50 dark:hover:border-[#0B79B7]/50 shadow-xs hover:shadow-sm transition-all flex items-center gap-3 text-left rtl:text-right group cursor-pointer active:scale-95 select-none"
                >
                  <div className="shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-10 h-10" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-[#182230] dark:text-white truncate group-hover:text-[#0B79B7] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-[#687587] dark:text-slate-400 font-semibold mt-0.5">
                      {cat.count} Tools →
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================================================
          6. SEARCH RESULTS OR FILTERED DIRECTORY
          ================================================== */}
      {(searchQuery || activeCategory !== 'all') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-[#182230] dark:text-white uppercase tracking-wide">
                {searchQuery
                  ? 'Search Results'
                  : `${getLocalizedCategory(activeCategory, language)} Tools`}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px] font-bold text-[#182230] dark:text-slate-300">
                {loc.toolsCount(filteredTools.length)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-[#0B79B7] dark:text-[#38a8f8] hover:underline cursor-pointer"
            >
              {loc.resetFilters}
            </button>
          </div>

          {filteredTools.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-[#E1E7EC] dark:border-slate-800 p-8 space-y-3 shadow-xs">
              <Search className="w-8 h-8 text-[#687587] mx-auto" />
              <p className="text-sm font-bold text-[#687587]">{loc.noToolsFound}</p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#0B79B7] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#075B8C] transition-colors cursor-pointer"
              >
                {loc.resetFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ==================================================
          7. WHY MIFTAH TOOLS? (INTERACTIVE ACCORDION / DROPDOWN)
          ================================================== */}
      {!searchQuery && activeCategory === 'all' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#182230] dark:text-white tracking-tight">
              {loc.whyHeading}
            </h2>
            <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-400">
              {loc.whySubheading}
            </p>
          </div>

          {/* Interactive Accordion Cards for Why Miftah Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-5xl mx-auto">
            {loc.whyFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              const isOpen = openWhyIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white dark:bg-slate-900 ${
                    isOpen
                      ? 'border-[#0B79B7] shadow-md ring-1 ring-[#0B79B7]/20'
                      : 'border-[#E1E7EC] dark:border-slate-800 hover:border-[#0B79B7]/40 shadow-xs'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setOpenWhyIndex(isOpen ? null : idx);
                    }}
                    className="w-full p-4 sm:p-5 text-left rtl:text-right flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? 'bg-[#0B79B7] text-white'
                          : 'bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8]'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-[#182230] dark:text-white truncate">
                          {feat.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-[#687587] dark:text-slate-400 line-clamp-1">
                          {feat.desc}
                        </p>
                      </div>
                    </div>

                    <div className={`p-1.5 rounded-lg transition-transform shrink-0 ${isOpen ? 'rotate-180 text-[#0B79B7]' : 'text-[#687587]'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && feat.details && (
                    <div className="px-5 pb-5 pt-1 border-t border-[#E1E7EC]/60 dark:border-slate-800/80 animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-300 leading-relaxed bg-[#F5F7F9] dark:bg-slate-800/50 p-3.5 rounded-xl border border-[#E1E7EC]/60 dark:border-slate-800">
                        {feat.details}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================================================
          8. FREQUENTLY ASKED QUESTIONS (EXPANDABLE DROPDOWN FAQ)
          ================================================== */}
      {!searchQuery && activeCategory === 'all' && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-5">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] text-[10px] font-bold uppercase tracking-wider">
              <HelpCircle className="w-3 h-3" />
              <span>FAQ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#182230] dark:text-white tracking-tight">
              {loc.faqHeading}
            </h2>
            <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-400">
              {loc.faqSubheading}
            </p>
          </div>

          <div className="space-y-2.5">
            {loc.faqItems.map((item, idx) => {
              const isFaqOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white dark:bg-slate-900 ${
                    isFaqOpen
                      ? 'border-[#0B79B7]/60 shadow-xs'
                      : 'border-[#E1E7EC] dark:border-slate-800 hover:border-[#0B79B7]/30'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setOpenFaqIndex(isFaqOpen ? null : idx);
                    }}
                    className="w-full p-4 sm:p-4.5 text-left rtl:text-right flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#182230] dark:text-white">
                      {item.q}
                    </span>
                    <div className={`p-1 rounded-lg text-[#687587] transition-transform shrink-0 ${isFaqOpen ? 'rotate-180 text-[#0B79B7]' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isFaqOpen && (
                    <div className="px-4.5 pb-4 pt-1 border-t border-[#E1E7EC]/60 dark:border-slate-800 text-xs sm:text-sm text-[#687587] dark:text-slate-300 leading-relaxed animate-in fade-in duration-150">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================================================
          9. ANDROID APP PROMOTION SECTION
          ================================================== */}
      <section id="android-app" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Text and Features */}
          <div className="space-y-4 max-w-xl text-left rtl:text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] text-[10px] font-extrabold uppercase tracking-wider">
              {loc.appBadge}
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-[#182230] dark:text-white tracking-tight">
              {loc.appHeading}
            </h2>

            <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-400 leading-relaxed">
              {loc.appSupporting}
            </p>

            <ul className="space-y-2 text-xs font-semibold text-[#182230] dark:text-slate-200">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{loc.appBullet1}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{loc.appBullet2}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{loc.appBullet3}</span>
              </li>
            </ul>
          </div>

          {/* Right Google Play Button Card */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=com.miftahtools.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700/80 transition-all shadow-md active:scale-95 group select-none cursor-pointer"
              aria-label="Get Miftah Tools on Google Play"
            >
              <svg className="w-7 h-7 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 512 512">
                <path fill="#00D3FF" d="M30.4 17.8c-7.7 8.2-12.4 20.3-12.4 35.5v405.4c0 15.2 4.7 27.3 12.4 35.5l2.4 2.2 231-231v-5.8L32.8 15.6l-2.4 2.2z" />
                <path fill="#FF3A44" d="M340.5 341.2l-76.7-76.7v-5.8l76.7-76.7 1.8 1 90.7 51.5c25.9 14.7 25.9 38.8 0 53.6l-90.7 51.5-1.8 1.6z" />
                <path fill="#00E676" d="M342.3 342.8L263.8 264 32.8 495.2c8.5 9 22.7 10.1 38.6 1.1l270.9-153.5z" />
                <path fill="#FFD400" d="M342.3 169.2L71.4 15.7C55.5 6.7 41.3 7.8 32.8 16.8L263.8 248l78.5-78.8z" />
              </svg>
              <div className="text-left rtl:text-right">
                <div className="text-[9px] uppercase tracking-wider text-slate-300 font-bold leading-none">GET IT ON</div>
                <div className="text-base font-black tracking-tight text-white leading-none mt-1">Google Play</div>
              </div>
            </a>
            <p className="text-[11px] text-[#687587] text-center font-medium">100% Free • Official App</p>
          </div>

        </div>
      </section>

      {/* ==================================================
          10. ALL TOOLS DIRECTORY CTA BANNER
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0B79B7] to-[#075B8C] text-white shadow-lg space-y-4 text-center sm:text-left rtl:sm:text-right flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
              220+ Digital Tools
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white">
              {loc.viewAllDirectoryTitle}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              {loc.viewAllDirectoryDesc}
            </p>
          </div>

          <Link
            href="/tools"
            className="h-12 px-6 rounded-xl bg-white hover:bg-slate-50 text-[#0B79B7] font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all inline-flex items-center gap-2 shrink-0 select-none cursor-pointer"
          >
            <span>{loc.viewAllDirectoryBtn}</span>
          </Link>
        </div>
      </section>

      {/* Subtle Bottom Ad Placement */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <AdSlot placement="in-feed" />
      </section>

    </div>
  );
}
