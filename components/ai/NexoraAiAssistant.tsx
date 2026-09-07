'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Bot,
  ArrowRight,
  Workflow,
  Zap,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { UnifiedSearchModal } from '@/components/search/UnifiedSearchModal';

export function NexoraAiAssistant() {
  const router = useRouter();
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const samplePrompts = [
    { label: 'Reduce 20 MB PDF to under 2 MB', query: 'reduce pdf to under 2mb', category: 'PDF' },
    { label: 'Create 35x45 mm Passport Photo with White BG', query: 'passport photo 35x45', category: 'Photo' },
    { label: 'Extract Editable Word Doc from Scanned PDF', query: 'convert pdf to docx', category: 'OCR' },
    { label: 'Make Signature Photo Under 50 KB', query: 'make image 50kb', category: 'Image' },
    { label: 'Download Instagram Reel in HD Without Watermark', query: 'download reels', category: 'Media' },
    { label: 'Calculate Percentage & Price Discounts', query: 'percentage calculator', category: 'Calculator' },
  ];

  const handlePromptClick = (query: string) => {
    setActiveQuery(query);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 text-white shadow-xl space-y-5 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur-md shadow-md">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Miftah Tools AI Assistant
              </h2>
              <p className="text-xs text-brand-100">
                Tap any goal below or use Smart Search to launch instant in-browser workflows.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveQuery('');
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-white text-brand-700 hover:bg-brand-50 text-xs font-black rounded-2xl shadow-md flex items-center gap-1.5 shrink-0 self-start sm:self-auto hover:scale-105 active:scale-95 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Open Smart Search</span>
          </button>
        </div>

        {/* 1-Click Interactive Goal Chips */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-200">
            Suggested One-Click Goals:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {samplePrompts.map((sp) => (
              <button
                key={sp.label}
                type="button"
                onClick={() => handlePromptClick(sp.query)}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-left flex items-center justify-between gap-2 transition-all hover:scale-[1.02] group"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[10px] font-black uppercase text-brand-200">{sp.category}</div>
                  <div className="text-xs font-bold text-white truncate">{sp.label}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-brand-200 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Unified Search Modal */}
      <UnifiedSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialQuery={activeQuery}
      />
    </>
  );
}
