'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  CheckCircle2, 
  UserX, 
  Trash2, 
  ArrowLeft, 
  FileText, 
  Server, 
  Camera, 
  FolderLock, 
  Mail, 
  AlertTriangle,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

export default function PrivacyPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-28">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 transition-all shadow-xs mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Miftah Tools Home</span>
          </Link>
          
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Google Play Policy &amp; Privacy Verified</span>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Privacy Policy &amp; Data Safety
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>App Name:</strong> Miftah Tools &nbsp;|&nbsp; <strong>Package:</strong> com.miftahtools.app &nbsp;|&nbsp; <strong>Last Updated:</strong> September 2026
          </p>
        </div>

        {/* Main Content Container */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          
          {/* Highlight Box: Core Zero-Server Privacy Principle */}
          <div className="p-5 sm:p-6 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/80 dark:border-emerald-800/80 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm sm:text-base">
              <Lock className="w-5 h-5 shrink-0" />
              <span>Core Privacy Architecture: 100% In-Device Memory Processing</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-900/90 dark:text-emerald-300/90 leading-normal">
              At <strong>Miftah Tools</strong>, your privacy is our foundational commitment. When you convert a PDF, merge documents, compress images, generate QR codes, or format code, the operations execute <strong>100% locally on your device</strong> using sandboxed WebAssembly and client-side JavaScript. <strong>Your documents, images, and files never leave your device and are never uploaded or stored on any remote servers.</strong>
            </p>
          </div>

          {/* Section 1: Overview */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-brand-600" />
              1. Overview of Miftah Tools
            </h2>
            <p>
              Miftah Tools is an all-in-one productivity suite offering high-performance offline document utilities, media converters, code formatters, and educational digital courses. This Privacy Policy governs your use of the Miftah Tools mobile application (Android Package: <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">com.miftahtools.app</code>) and web application.
            </p>
          </section>

          {/* Section 2: Data We Do NOT Collect */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-emerald-600" />
              2. Information We Do NOT Collect (डेटा जो हम कभी एकत्र नहीं करते)
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><strong>Zero Document Tracking:</strong> We do NOT inspect, read, transmit, or retain your uploaded PDFs, images, videos, audio, or text files.</li>
              <li><strong>Zero Location Tracking:</strong> We do NOT collect GPS coordinates or fine location data.</li>
              <li><strong>Zero Contact Scraping:</strong> We do NOT access or upload your address book, contacts, or call logs.</li>
              <li><strong>Zero Data Selling:</strong> We never sell, rent, monetize, or trade your personal information with data brokers, advertisers, or any third party.</li>
            </ul>
          </section>

          {/* Section 3: Information Collected for Account Features */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-brand-600" />
              3. Information Collected for Optional User Accounts
            </h2>
            <p>
              Most tools in Miftah Tools can be used completely anonymously without registration. If you choose to create an account, we use <strong>Google Firebase Authentication</strong> to securely manage your profile:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><strong>Account Credentials:</strong> Your Email Address, Display Name, and Firebase User ID (UID).</li>
              <li><strong>Profile Photo (Optional):</strong> If you choose to set a profile photo, it is stored in secure <strong>Firebase Cloud Storage</strong> (<code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">users/&#123;uid&#125;/profile/</code>) solely to display your avatar across app navigation.</li>
              <li><strong>Preferences &amp; Progress:</strong> Your bookmarked favorite tools, course progress, and theme selection are synced via <strong>Google Cloud Firestore</strong> for a seamless cross-device experience.</li>
            </ul>
          </section>

          {/* Section 4: Advertising & Analytics */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-600" />
              4. Advertising &amp; Third-Party SDKs (Google AdMob &amp; Firebase)
            </h2>
            <p>
              To keep our core productivity tools 100% free for all users worldwide, Miftah Tools displays non-intrusive advertisements served through <strong>Google AdMob</strong>. Google AdMob and Firebase may collect certain standard non-personal telemetry:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><strong>Google Mobile Ads SDK (AdMob):</strong> Collects device identifiers (such as the Google Advertising ID), network provider info, and coarse performance diagnostics to serve relevant ads, prevent ad fraud, and adhere to Google AdMob publisher policies.</li>
              <li><strong>Google Firebase Services:</strong> Provides secure authentication, crash diagnostics, and encrypted cloud storage. Review the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-600 font-bold underline inline-flex items-center gap-1">Google Privacy Policy <ExternalLink className="w-3 h-3" /></a> for more details.</li>
            </ul>
          </section>

          {/* Section 5: Device Permissions & Rationale */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-600" />
              5. Device Permissions &amp; Strict Justification
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white text-xs">📷 Camera Permission</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Used strictly when you scan QR codes/Barcodes or capture a profile photo. Camera frames are analyzed in real-time memory and never uploaded.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white text-xs">📁 Storage / Media Access</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Used exclusively when you select files, PDFs, or photos from your device for local editing, compression, or format conversion.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white text-xs">🌐 Internet &amp; Network State</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Required for Firebase user sign-in, profile synchronization, and displaying AdMob advertisements.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white text-xs">🔒 Scoped Storage Compliance</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Conforms to Google Play Scoped Storage guidelines for Android 14 and Android 15. The app cannot access any files outside what you explicitly select.</p>
              </div>
            </div>
          </section>

          {/* Section 6: Google Play Store Account & Data Deletion Compliance */}
          <section className="space-y-4 p-5 sm:p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40">
            <div className="flex items-center gap-2.5 text-rose-900 dark:text-rose-300 font-bold text-sm sm:text-base">
              <UserX className="w-5 h-5 text-rose-600 shrink-0" />
              <span>6. Account &amp; Data Deletion Policy (Google Play Policy Compliance / खाता और डेटा हटाने की नीति)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              In full compliance with <strong>Google Play Developer Data Safety Guidelines</strong>, every user has the absolute and unhindered right to completely and permanently erase their account, profile data, and all cloud records at any time:
            </p>
            
            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Method A: 1-Tap In-App Deletion (ऐप के अंदर से तुरंत हटाएं)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Open the <strong>Account</strong> page inside Miftah Tools and click <strong>&quot;Delete Account &amp; Wipe Data&quot;</strong>. Confirming this action immediately purges your Firebase Authentication record, deletes your uploaded avatar from Cloud Storage, and wipes your Firestore database document permanently.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-600" />
                  Method B: Email Deletion Request (ईमेल द्वारा स्थायी डिलीट अनुरोध)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  If you uninstalled the application or cannot log in, send an email to <a href="mailto:jrahmanansari132@gmail.com" className="font-mono font-bold text-brand-600 dark:text-brand-400 underline">jrahmanansari132@gmail.com</a> with the subject <em>&quot;Account &amp; Data Deletion Request - Miftah Tools&quot;</em>. Our team will verify and permanently delete all records associated with your email within <strong>24 to 48 hours</strong>.
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              <strong>Data Purged Upon Deletion:</strong> User credentials, display name, email, synced avatar photos in Cloud Storage, course enrollments, bookmarked tools, and local cached storage are permanently purged. No residual backup is retained.
            </div>
          </section>

          {/* Section 7: Children's Privacy */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              7. Children&apos;s Privacy (COPPA &amp; GDPR-K Compliance)
            </h2>
            <p>
              Miftah Tools is designed for general utility and developer education. We do not knowingly collect personal identifiable information from children under 13 years of age. If you believe a child has provided us with personal information, please contact us at <a href="mailto:jrahmanansari132@gmail.com" className="font-bold text-brand-600 underline">jrahmanansari132@gmail.com</a> and we will immediately remove such data.
            </p>
          </section>

          {/* Section 8: Security & Encryption */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-600" />
              8. Security Standards
            </h2>
            <p>
              All network transmissions are strictly secured using industry-standard HTTPS (TLS 1.3) encryption. Cleartext HTTP communication is prohibited. We do not bundle secret service account keys or private cryptographic tokens inside the client-side APK/AAB distribution.
            </p>
          </section>

          {/* Section 9: Contact & Developer Info */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Contact &amp; Data Protection Officer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              For any privacy inquiries, data deletion requests, or questions regarding this policy, contact our developer support team:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Jamil Rahman Ansari (Developer / Publisher)</p>
                <p className="text-xs text-slate-500">Miftah Tools Development Team</p>
                <p className="text-xs font-mono text-brand-600 dark:text-brand-400 font-semibold mt-0.5">jrahmanansari132@gmail.com</p>
              </div>
              <a
                href="mailto:jrahmanansari132@gmail.com?subject=Privacy%20Inquiry%20-%20Miftah%20Tools"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-all shadow-xs shrink-0"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Privacy Team</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

