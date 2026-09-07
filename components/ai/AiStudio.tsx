'use client';

import React, { useState } from 'react';
import { executeAiTask, AiTaskType } from '@/lib/ai/ai-engine';
import { Sparkles, FileText, Check, Copy, Settings, RefreshCw, AlertCircle, Key } from 'lucide-react';
import { downloadSingleFile } from '@/lib/utils/download';

export function AiStudio() {
  const [task, setTask] = useState<AiTaskType>('summarize');
  const [tone, setTone] = useState<'professional' | 'casual' | 'concise' | 'academic'>('professional');
  const [content, setContent] = useState<string>(
    `Miftah Tools is an all-in-one productivity super app providing 60+ utilities for PDF editing, image conversion, multi-language OCR, cryptographic security tools, and developer utilities. Built with a privacy-first architecture, it performs all processing locally inside browser memory using WebAssembly.`
  );
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultOutput, setResultOutput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showKeyConfig, setShowKeyConfig] = useState<boolean>(false);

  const handleRunAi = async () => {
    if (!content.trim()) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await executeAiTask({
        task,
        content,
        tone,
        customPrompt: customQuestion,
        apiKey: apiKey || undefined,
      });
      setResultOutput(res.output);
    } catch (err: any) {
      setErrorMsg(err.message || 'AI request failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Task Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'summarize', label: 'Summarize Document' },
            { id: 'keypoints', label: 'Key Points & Actions' },
            { id: 'grammar', label: 'Fix Grammar & Style' },
            { id: 'rewrite', label: 'Rewrite & Polish' },
            { id: 'qa', label: 'Ask Questions (Q&A)' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTask(t.id as AiTaskType)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                task === t.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowKeyConfig(!showKeyConfig)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-brand-600 flex items-center gap-1.5"
        >
          <Key className="w-3.5 h-3.5" />
          <span>API Key Config</span>
        </button>
      </div>

      {/* Optional Gemini API Key Drawer */}
      {showKeyConfig && (
        <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800 space-y-2 text-xs">
          <label className="font-bold text-slate-800 dark:text-slate-200 block">
            Google Gemini API Key (Optional)
          </label>
          <p className="text-slate-500">
            Enter your personal Gemini API key for unlimited AI inference. If omitted, built-in intelligent processing will be used.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              localStorage.setItem('nexora_ai_key', e.target.value);
            }}
            placeholder="AIzaSy..."
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
          />
        </div>
      )}

      {/* Input Workspace */}
      <div className="space-y-4">
        {task === 'qa' && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Your Question About the Document
            </label>
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="e.g. What are the key terms in section 3?"
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Document Content or Text
          </label>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your text or document here..."
            className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tone:</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
            >
              <option value="professional">Professional</option>
              <option value="concise">Concise & Direct</option>
              <option value="academic">Academic / Formal</option>
              <option value="casual">Casual & Friendly</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleRunAi}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Analyzing...' : 'Generate with AI'}</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* AI Output Result */}
      {resultOutput && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>AI Output Result</span>
            </span>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {resultOutput}
          </div>
        </div>
      )}
    </div>
  );
}
