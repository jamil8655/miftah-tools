'use client';

import React from 'react';
import Link from 'next/link';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { AdminGuard } from '@/lib/auth/admin-guard';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6 space-y-6 min-w-0 overflow-x-hidden">
      <AdminGuard>
        <Breadcrumbs items={[{ label: 'System Admin Dashboard' }]} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-xs self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4 text-brand-600" />
            <span>← Back to Miftah Tools Workspace</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4" />
            <span>Node 24.19 Runtime • Zero-Leakage Architecture</span>
          </div>
        </div>

        <AdminAnalytics />
      </AdminGuard>
    </div>
  );
}
