import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  FileText,
  Layers,
  Clock,
  Laptop,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'MiftahTools vs Smallpdf vs iLovePDF vs TinyWow — Free Online Tools Comparison',
  description:
    'Compare MiftahTools with Smallpdf, iLovePDF, and TinyWow. Discover key differences in pricing, daily usage limits, client-side browser privacy, and tool counts.',
  alternates: {
    canonical: 'https://miftahtools.com/compare/',
  },
  openGraph: {
    title: 'MiftahTools vs Smallpdf vs iLovePDF vs TinyWow — Comparison',
    description:
      'Compare pricing, daily task limits, client-side browser privacy, and tool counts across major online file conversion platforms.',
    url: 'https://miftahtools.com/compare/',
    type: 'website',
  },
};

const COMPARISON_DATA = [
  {
    feature: 'Price & Subscription',
    miftah: { val: '100% Free', good: true, note: 'No paywalls or premium tiers' },
    smallpdf: { val: '$9 – $12 / mo', good: false, note: 'Free tier has strict caps' },
    ilovepdf: { val: '$4 – $7 / mo', good: false, note: 'Free tier limits batching' },
    tinywow: { val: 'Free / $5.99 / mo', good: true, note: 'Free with ads; paid removes ads' },
  },
  {
    feature: 'Daily Task Limits',
    miftah: { val: 'Unlimited', good: true, note: 'Process as many files as needed' },
    smallpdf: { val: '1 – 2 tasks / day', good: false, note: 'Enforces daily limit on free plan' },
    ilovepdf: { val: 'Limited Tasks & Batch Size', good: false, note: 'Caps files per batch on free tier' },
    tinywow: { val: 'Hourly Rate Limits', good: false, note: 'Queues & CAPTCHAs during peak load' },
  },
  {
    feature: 'File Privacy & Processing',
    miftah: { val: 'Client-Side (WASM/In-Browser)', good: true, note: 'Files remain on your device' },
    smallpdf: { val: 'Cloud Upload', good: false, note: 'Uploaded to servers; deleted after 1 hour' },
    ilovepdf: { val: 'Cloud Upload', good: false, note: 'Uploaded to servers; deleted after 2 hours' },
    tinywow: { val: 'Cloud Upload', good: false, note: 'Uploaded to servers; deleted after 1 hour' },
  },
  {
    feature: 'Registration / Sign-up',
    miftah: { val: 'Not Required', good: true, note: 'Immediate open access to all tools' },
    smallpdf: { val: 'Required After Limit', good: false, note: 'Prompted to create account' },
    ilovepdf: { val: 'Optional / Required for Large Files', good: false, note: 'Free account required for higher limits' },
    tinywow: { val: 'Not Required', good: true, note: 'Open access with CAPTCHAs' },
  },
  {
    feature: 'Watermarks on Free Downloads',
    miftah: { val: 'None', good: true, note: 'Clean output documents' },
    smallpdf: { val: 'None', good: true, note: 'Standard exports' },
    ilovepdf: { val: 'None (Some Tools Restricted)', good: true, note: 'OCR restricted to paid tier' },
    tinywow: { val: 'None', good: true, note: 'Clean output documents' },
  },
  {
    feature: 'Total Tool Count',
    miftah: { val: '220+ Tools', good: true, note: 'PDF, Image, OCR, Audio, Video, Dev Tools' },
    smallpdf: { val: '~30 Tools', good: false, note: 'Primarily PDF focused' },
    ilovepdf: { val: '~30 Tools', good: false, note: 'PDF and basic image suite' },
    tinywow: { val: '~200 Tools', good: true, note: 'PDF, image, and video utilities' },
  },
  {
    feature: 'Offline App Support',
    miftah: { val: 'Yes (PWA & Android App)', good: true, note: 'Installable on Desktop & Google Play' },
    smallpdf: { val: 'Desktop App (Paid Only)', good: false, note: 'Offline desktop requires Pro' },
    ilovepdf: { val: 'Desktop App (Paid / Limited)', good: false, note: 'Full desktop features require Pro' },
    tinywow: { val: 'Web Only', good: false, note: 'No standalone offline application' },
  },
];

const FAQS = [
  {
    question: 'How is MiftahTools completely free without daily task limits?',
    answer:
      'MiftahTools utilizes modern WebAssembly (WASM) and client-side JavaScript execution. Because file processing (compression, merging, conversion, OCR) runs directly within your device’s browser memory rather than demanding heavy server computing clusters, our operating costs remain negligible. We can offer unrestricted, unlimited file transformations without needing subscription walls or task meters.',
  },
  {
    question: 'Are my private documents and photos uploaded to your servers?',
    answer:
      'No. The vast majority of our utilities—including PDF Compression, PDF Merging, Split, Word Conversion, Image Optimization, and OCR—operate 100% locally on your machine via WebAssembly. Your sensitive business contracts, financial statements, and personal photos never leave your device.',
  },
  {
    question: 'What is the main difference between MiftahTools and Smallpdf or iLovePDF?',
    answer:
      'Smallpdf and iLovePDF rely on remote cloud servers to process your files, which requires them to enforce strict daily free limits (e.g., 1–2 tasks per day on Smallpdf) and monetize via $4–$12/month subscription plans. MiftahTools runs processing right inside your browser, offering unlimited free usage, immediate execution without upload latency, and superior privacy.',
  },
  {
    question: 'How does MiftahTools compare with TinyWow?',
    answer:
      'While TinyWow provides a broad collection of tools, it executes processing on remote cloud servers and frequently routes users through queue wait times and CAPTCHAs during peak hours. MiftahTools executes transformations locally in your browser with zero queue times, zero server storage, and no CAPTCHA interruptions.',
  },
  {
    question: 'Do I need to create an account or provide a credit card to use MiftahTools?',
    answer:
      'No account, email, or credit card is ever required. You can use every tool right away by dragging and dropping your files into the browser.',
  },
];

const KEY_TOOLS = [
  { slug: 'compress-pdf', name: 'Compress PDF', desc: 'Reduce PDF file size up to 90% without quality loss' },
  { slug: 'merge-pdf', name: 'Merge PDF', desc: 'Combine multiple PDFs into a single document' },
  { slug: 'split-pdf', name: 'Split PDF', desc: 'Separate or extract specific pages from PDF' },
  { slug: 'pdf-to-word', name: 'PDF to Word', desc: 'Convert PDF documents into editable Word DOCX' },
  { slug: 'word-to-pdf', name: 'Word to PDF', desc: 'Convert DOCX and DOC documents into clean PDF' },
  { slug: 'images-to-pdf', name: 'Images to PDF', desc: 'Convert JPG, PNG, and WebP images into PDF' },
  { slug: 'edit-pdf', name: 'Edit PDF', desc: 'Annotate, stamp, and organize PDF pages' },
  { slug: 'watermark-pdf', name: 'Watermark PDF', desc: 'Add customizable text or logo stamps anywhere on pages' },
  { slug: 'ocr-image', name: 'OCR Image to Text', desc: 'Extract multilingual text from scanned images and PDFs' },
  { slug: 'voice-to-text', name: 'Voice to Text', desc: 'Dictate speech into clean text in 40+ languages' },
];

export default function ComparePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://miftahtools.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Compare',
        item: 'https://miftahtools.com/compare/',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Header */}
          <header className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-black tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Independent Platform Comparison</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              MiftahTools vs Smallpdf vs iLovePDF vs TinyWow
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Looking for the best online PDF and file conversion tool suite? Here is an objective, verified breakdown
              of how MiftahTools compares against leading paid and freemium platforms in privacy, daily limits, speed,
              and pricing.
            </p>
          </header>

          {/* Quick Key Highlights Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Zero Server Uploads</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                While competitors upload documents to cloud servers, MiftahTools executes transformations inside your
                browser with WebAssembly. Files never leave your hardware.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">No Daily Task Caps</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Smallpdf and other tools restrict free users to 1–2 documents every 24 hours. MiftahTools gives you
                unlimited conversions without subscriptions or countdown timers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">No Signup or Account</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Access 220+ tools instantly with zero barriers. No credit cards, no email verification, and no
                annoying marketing popups.
              </p>
            </div>
          </section>

          {/* Full Comparison Table */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Detailed Feature Matrix
              </h2>
              <span className="text-xs text-slate-500 font-mono">Verified Oct 2026</span>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60">
                    <th className="py-4 px-4 font-black text-slate-700 dark:text-slate-300 w-1/4">Feature / Metric</th>
                    <th className="py-4 px-4 font-black text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30 w-1/4">
                      MiftahTools
                    </th>
                    <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300 w-1/6">Smallpdf</th>
                    <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300 w-1/6">iLovePDF</th>
                    <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300 w-1/6">TinyWow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {COMPARISON_DATA.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        {row.feature}
                      </td>
                      <td className="py-4 px-4 bg-rose-50/30 dark:bg-rose-950/20 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{row.miftah.val}</span>
                        </div>
                        <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 block mt-0.5">
                          {row.miftah.note}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                        <span className="font-semibold block">{row.smallpdf.val}</span>
                        <span className="text-[10px] text-slate-500 block">{row.smallpdf.note}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                        <span className="font-semibold block">{row.ilovepdf.val}</span>
                        <span className="text-[10px] text-slate-500 block">{row.ilovepdf.note}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                        <span className="font-semibold block">{row.tinywow.val}</span>
                        <span className="text-[10px] text-slate-500 block">{row.tinywow.note}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Key Tool Directory Links */}
          <section className="space-y-4 pt-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Try MiftahTools Free Online Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Transform your files instantly with zero waiting time and 100% privacy:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {KEY_TOOLS.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}/`}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-500 dark:hover:border-rose-500 transition-all hover:shadow-md flex flex-col justify-between gap-2 group"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {t.name}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {t.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    <span>Use Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-rose-500" />
                <span>Frequently Asked Questions</span>
              </h2>
              <p className="text-xs text-slate-500">
                Common questions about MiftahTools security, architecture, and competitor differences.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {faq.question}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
