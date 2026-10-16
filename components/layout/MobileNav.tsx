'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Workflow, ArrowDownToLine, Settings2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { isNativeAndroid } from '@/lib/native/android-bridge';

/**
 * Standard Production Android Bottom Navigation Bar
 * 5 Canonical Tabs: Home | Tools | Workflows | Downloads | Settings
 */
export function MobileNav() {
  const pathname = usePathname();
  const { t, isRTL } = useI18n();
  const [mounted, setMounted] = React.useState(false);
  const [isNativeApp, setIsNativeApp] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setIsNativeApp(isNativeAndroid());
  }, []);

  // Web users on mobile/desktop browsers will NEVER see the bottom tab bar.
  // It is 100% exclusive to the Android Native APK app.
  if (!mounted || !isNativeApp) {
    return null;
  }

  const navItems = [
    { label: t.nav.home || 'Home', href: '/', icon: Home },
    { label: t.nav.allTools || 'Tools', href: '/tools', icon: LayoutGrid },
    { label: t.nav.workflows || 'Workflows', href: '/workflows', icon: Workflow },
    { label: t.nav.downloads || 'Downloads', href: '/downloads', icon: ArrowDownToLine },
    { label: t.nav.settings || 'Settings', href: '/settings', icon: Settings2 },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 lg:hidden px-1.5 py-1.5 shadow-lg shadow-black/5 safe-bottom"
      aria-label="Android Bottom Navigation"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto gap-0.5">
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
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl text-[10px] font-bold transition-all duration-150 active:scale-95 select-none ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50/90 dark:bg-brand-950/70 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 transition-all duration-200 ${
                  isActive ? 'scale-105 text-brand-600 dark:text-brand-400' : 'scale-100 opacity-80'
                }`}
                strokeWidth={isActive ? 2.35 : 1.8}
              />
              <span className="truncate max-w-[62px] text-center leading-normal tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
