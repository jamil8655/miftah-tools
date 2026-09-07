'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useUserStore } from '@/lib/user/user-store';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Award,
  Code,
  Terminal,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizTopic {
  id: string;
  title: string;
  category: string;
  icon: any;
  questions: QuizQuestion[];
}

const QUIZ_TOPICS: QuizTopic[] = [
  {
    id: 'web-dev',
    title: 'Full-Stack Web Development',
    category: 'Development',
    icon: Code,
    questions: [
      {
        id: 'w1',
        question: 'What is the primary benefit of React Server Components (RSC) in Next.js 14 App Router?',
        options: [
          'They run only on the client browser with large bundle sizes',
          'They reduce client bundle size and fetch data directly on the server without client waterfall',
          'They replace HTML Canvas for graphics rendering',
          'They disable all CSS styles automatically',
        ],
        correctIndex: 1,
        explanation: 'React Server Components execute entirely on the server, streaming zero JavaScript bundle overhead for static logic while enabling direct database queries.',
      },
      {
        id: 'w2',
        question: 'Which TypeScript utility type constructs a type with all properties of T set to optional?',
        options: ['Required<T>', 'Readonly<T>', 'Partial<T>', 'Record<K, T>'],
        correctIndex: 2,
        explanation: 'Partial<T> returns a type where every key of T is optional (? marker).',
      },
      {
        id: 'w3',
        question: 'Why is Tailwind CSS utility-first approach beneficial for modern web applications?',
        options: [
          'It automatically deletes server databases',
          'It enforces scoped, atomic styling that eliminates dead CSS bloat and accelerates design iterations',
          'It converts JavaScript into WebAssembly',
          'It disables browser caching completely',
        ],
        correctIndex: 1,
        explanation: 'Tailwind CSS compiles only the exact classes used in your templates into a minimal, purged production stylesheet.',
      },
    ],
  },
  {
    id: 'ai-prompt',
    title: 'Python & AI Prompt Engineering',
    category: 'AI & Data',
    icon: Terminal,
    questions: [
      {
        id: 'a1',
        question: 'What is the core purpose of Few-Shot Prompting when querying an LLM?',
        options: [
          'To generate random images',
          'To provide explicit input/output demonstration examples within the prompt to guide reasoning and formatting',
          'To limit token count to 1 word only',
          'To compress video files locally',
        ],
        correctIndex: 1,
        explanation: 'Few-shot prompting provides contextual demonstrations directly in the prompt context window, dramatically improving structured task accuracy.',
      },
      {
        id: 'a2',
        question: 'What does RAG (Retrieval-Augmented Generation) do?',
        options: [
          'Deletes vector embeddings',
          'Retrieves relevant documents from a vector store to ground LLM responses with factual, up-to-date context',
          'Encrypts audio files with AES-128',
          'Translates CSS to HTML',
        ],
        correctIndex: 1,
        explanation: 'RAG dynamically queries external vector databases or indexes, feeding relevant source context to the prompt to eliminate hallucinations.',
      },
    ],
  },
  {
    id: 'security-privacy',
    title: 'Cyber Security & Zero-Trust Privacy',
    category: 'Security',
    icon: ShieldCheck,
    questions: [
      {
        id: 's1',
        question: 'How does Miftah Tools achieve 100% in-browser document privacy?',
        options: [
          'By uploading all PDFs to an unencrypted public cloud server',
          'By utilizing WebAssembly (WASM) and client-side JavaScript APIs to process files inside the browser sandbox without server uploads',
          'By disabling user passwords completely',
          'By converting all files into plain text emails',
        ],
        correctIndex: 1,
        explanation: 'Miftah Tools processes documents locally in the user browser using WASM sandboxes, ensuring zero document data ever touches external servers.',
      },
      {
        id: 's2',
        question: 'What is the function of cryptographic Firebase Custom Claims for Admin authorization?',
        options: [
          'To show dummy UI buttons only',
          'To embed verified, cryptographically signed permission tokens ({ admin: true }) verified at both backend and database security rule layers',
          'To slow down user logins',
          'To track user browsing history publicly',
        ],
        correctIndex: 1,
        explanation: 'Firebase Custom Claims inject signed JWT attributes that Firestore and backend security rules cryptographically verify to enforce strict RBAC.',
      },
    ],
  },
];

export default function QuizPage() {
  const { t, isRtl } = useI18n();
  const { addHistory } = useUserStore();

  const [selectedTopicId, setSelectedTopicId] = useState<string>('web-dev');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const currentTopic = QUIZ_TOPICS.find((t) => t.id === selectedTopicId) || QUIZ_TOPICS[0];
  const questions = currentTopic.questions;
  const currentQuestion = questions[currentQuestionIdx];

  const handleSelectOption = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIdx]: optionIdx,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    addHistory({
      type: 'course',
      title: `Quiz: ${currentTopic.title} (Score: ${correctCount}/${questions.length})`,
      url: '/quiz',
      meta: 'Knowledge Check Assessment',
    });
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setIsSubmitted(false);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) correct++;
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
      passed: Math.round((correct / questions.length) * 100) >= 70,
    };
  };

  const scoreResult = isSubmitted ? calculateScore() : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-w-0">
      <Breadcrumbs items={[{ label: t.quiz.title }]} />

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Interactive Skill Checks</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">{t.quiz.title}</h1>
        <p className="text-xs sm:text-sm text-brand-100 max-w-xl leading-relaxed">
          {t.quiz.subtitle}
        </p>
      </div>

      {/* Topic Selector Tabs */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.quiz.selectQuiz}:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUIZ_TOPICS.map((topic) => {
            const Icon = topic.icon;
            const isSelected = topic.id === selectedTopicId;

            return (
              <button
                key={topic.id}
                onClick={() => {
                  setSelectedTopicId(topic.id);
                  handleRetake();
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-brand-600 shadow-md ring-2 ring-brand-500/20'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${
                  isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{topic.title}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{topic.questions.length} Questions</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Quiz Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        {!isSubmitted ? (
          <>
            {/* Progress Counter */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 pb-4">
              <span>
                {t.quiz.question} {currentQuestionIdx + 1} {t.quiz.of} {questions.length}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 text-[10px]">
                {currentTopic.category}
              </span>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {currentQuestion.question}
              </h2>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQuestionIdx] === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-4 rounded-2xl border text-xs font-bold text-left transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-600 text-brand-700 dark:text-brand-300 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${
                          isSelected ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIdx === 0}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                <span>{t.quiz.prevQuestion}</span>
              </button>

              {currentQuestionIdx < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestionIdx] === undefined}
                  className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-40"
                >
                  <span>{t.quiz.nextQuestion}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length < questions.length}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Award className="w-4 h-4" />
                  <span>{t.quiz.submitQuiz}</span>
                </button>
              )}
            </div>
          </>
        ) : (
          /* Results View */
          <div className="space-y-8 animate-in fade-in">
            <div className="text-center space-y-3 py-4">
              <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-lg ${
                scoreResult?.passed
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}>
                {scoreResult?.passed ? <Award className="w-8 h-8" /> : <RotateCcw className="w-8 h-8" />}
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {scoreResult?.passed ? t.quiz.passed : t.quiz.failed}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {scoreResult?.passed ? t.quiz.congratulations : t.quiz.tryAgain}
              </p>

              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white">
                <span>{t.quiz.score}:</span>
                <span className="text-brand-600">{scoreResult?.correct} / {scoreResult?.total}</span>
                <span className="text-xs font-mono text-slate-400">({scoreResult?.percentage}%)</span>
              </div>
            </div>

            {/* Answer Breakdown & Explanations */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Detailed Answers & Insights:</h3>
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border space-y-2.5 ${
                      isCorrect
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{idx + 1}. {q.question}</span>
                      </h4>
                    </div>

                    <div className="text-xs space-y-1 pl-6 text-slate-600 dark:text-slate-300">
                      <p>
                        <strong>{t.quiz.yourAnswer}:</strong>{' '}
                        <span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-rose-600 line-through'}>
                          {q.options[userAns]}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p>
                          <strong>{t.quiz.correctAnswer}:</strong>{' '}
                          <span className="text-emerald-600 font-bold">{q.options[q.correctIndex]}</span>
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-slate-700 ml-6">
                      <strong>{t.quiz.explanation}:</strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Retake Action */}
            <div className="flex items-center justify-center pt-4">
              <button
                onClick={handleRetake}
                className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.quiz.retake}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
