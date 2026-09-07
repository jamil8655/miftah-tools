'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Workflow, Download, Settings } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';

/**
 * Standard Production Android Bottom Navigation Bar
 * 5 Canonical Tabs: Home | Tools | Workflows | Downloads | Settings
 */
export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { label: t.nav.home || 'Home', href: '/', icon: Home },
    { label: t.nav.allTools || 'Tools', href: '/tools', icon: Sparkles },
    { label: t.nav.workflows || 'Workflows', href: '/workflows', icon: Workflow },
    { label: t.userDashboard.downloadsTitle || 'Downloads', href: '/downloads', icon: Download },
    { label: t.nav.settings || 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 lg:hidden px-2 py-1.5 shadow-lg shadow-black/5 safe-bottom"
      aria-label="Android Bottom Navigation"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (!isActive) triggerHaptic('selection');
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-[10px] font-extrabold transition-all duration-150 active:scale-90 select-none ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50/90 dark:bg-brand-950/70 shadow-xs scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-4 h-4 mb-0.5 transition-transform duration-200 ${
                  isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'
                }`}
              />
              <span className="truncate max-w-[58px] text-center leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
