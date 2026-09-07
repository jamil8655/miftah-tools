'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Star,
  CheckCircle2,
  Lock,
  Play,
  FileText,
  Share2,
  Sparkles,
  ArrowLeft,
  Award,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { Course, Lesson } from '@/lib/courses/courses-data';
import { useUserStore } from '@/lib/user/user-store';
import { useI18n } from '@/lib/i18n/i18n-context';
import { getLocalizedCourse } from '@/lib/i18n/catalog-translations';

export default function CourseDetailClient({ course: rawCourse }: { course: Course }) {
  const { t, isRtl, language } = useI18n();
  const course = getLocalizedCourse(rawCourse, language);
  const { isEnrolled, enrollInCourse, unenrollCourse, markLessonComplete, enrolledCourses } = useUserStore();

  const enrolled = isEnrolled(course.id);
  const enrolledData = enrolledCourses[course.id];
  const completedLessons = enrolledData?.completedLessons || [];
  const progress = enrolledData?.progress || 0;

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({ 0: true, 1: true });

  const toggleSection = (index: number) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleOpenLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  const handleToggleLessonComplete = (lessonId: string) => {
    markLessonComplete(course.id, lessonId, course.lessonsCount);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {t.courses.browse}
          </Link>
        </div>

        {/* Hero Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-200/60 dark:border-brand-800/60">
                  {course.categoryLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  {course.level}
                </span>
                {course.badge && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-xs font-bold">
                    ★ {course.badge}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {course.description}
              </p>

              {/* Instructor & Metrics */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                    {course.instructor.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{course.instructor}</p>
                    <p className="text-[10px] text-slate-400">{course.instructorRole}</p>
                  </div>
                </div>

                <span className="text-slate-300 dark:text-slate-700">•</span>

                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  {course.rating} ({course.reviewsCount} reviews)
                </div>

                <span className="text-slate-300 dark:text-slate-700">•</span>

                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {course.duration}
                </div>

                <span className="text-slate-300 dark:text-slate-700">•</span>

                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  {course.lessonsCount} {t.courses.lessons}
                </div>
              </div>
            </div>

            {/* Enroll CTA Panel */}
            <div className="w-full lg:w-72 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4 shrink-0">
              <div className="space-y-1 text-center">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100% Free</span>
                <p className="text-[11px] text-slate-500">{t.courses.noEnrollmentRequired}</p>
              </div>

              {!enrolled ? (
                <button
                  onClick={() => enrollInCourse(course.id)}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {t.courses.enrollFree}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-600">{t.courses.enrolled}</span>
                    <span className="text-slate-900 dark:text-white">{progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <button
                    onClick={() => unenrollCourse(course.id)}
                    className="w-full py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all"
                  >
                    Unenroll from Course
                  </button>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Free previews available
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Interactive code & tools
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-indigo-500" />
                  Verified certificate upon finish
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum & Lessons Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              {t.courses.curriculum}
            </h2>
            <span className="text-xs text-slate-500">
              {completedLessons.length} of {course.lessonsCount} {t.courses.completed}
            </span>
          </div>

          <div className="space-y-4">
            {course.curriculum.map((section, sIdx) => {
              const isOpen = openSections[sIdx] !== false;

              return (
                <div
                  key={sIdx}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => toggleSection(sIdx)}
                    className="w-full px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-left hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {section.sectionTitle}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">
                        {section.lessons.length} {t.courses.lessons}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {section.lessons.map((lesson) => {
                        const isCompleted = completedLessons.includes(lesson.id);

                        return (
                          <div
                            key={lesson.id}
                            className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => enrolled && handleToggleLessonComplete(lesson.id)}
                                disabled={!enrolled}
                                className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                  isCompleted
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-brand-500'
                                }`}
                              >
                                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>

                              <div className="space-y-1">
                                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                  {lesson.title}
                                </p>
                                <p className="text-[11px] text-slate-500 line-clamp-1">
                                  {lesson.summary}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                              <span className="text-[11px] text-slate-400 font-mono">
                                {lesson.duration}
                              </span>

                              <button
                                onClick={() => handleOpenLesson(lesson)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  lesson.isPreview || enrolled
                                    ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-100'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}
                              >
                                <Play className="w-3 h-3 fill-current" />
                                {lesson.isPreview ? t.courses.freePreview : t.courses.resume}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate Preview Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-indigo-500 to-purple-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-500/10">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
              <Award className="w-4 h-4" />
              {t.courses.certificate}
            </div>
            <h3 className="text-xl font-bold">{t.courses.certificateDesc}</h3>
            <p className="text-xs text-indigo-100 max-w-xl">
              Complete all interactive lessons to generate a cryptographically signed verifiable PDF completion certificate for your resume and LinkedIn.
            </p>
          </div>

          <div className="shrink-0">
            <span className="px-5 py-2.5 rounded-2xl bg-white text-indigo-700 font-bold text-xs shadow-md">
              Included with Free Enrollment
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Lesson Modal */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-brand-600 text-white text-[10px] font-bold">
                  {activeLesson.duration}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {activeLesson.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveLesson(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Lesson Summary & Learning Goals:
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeLesson.summary}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Interactive Practice & Code Walkthrough:
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  This lesson covers the core architecture of the concept. You can test your code live inside Miftah Tools Developer Tools, or process test datasets with our WebAssembly engine.
                </p>

                <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                  <code>
                    {`// Example Code Sample for ${activeLesson.title}\nimport { initEngine } from '@miftah/core';\n\nconst engine = await initEngine({\n  wasmWorker: true,\n  clientSideOnly: true,\n});\nconsole.log('Engine ready:', engine.status);`}
                  </code>
                </div>
              </div>

              {enrolled && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Track your progress:</span>
                  <button
                    onClick={() => {
                      handleToggleLessonComplete(activeLesson.id);
                      setActiveLesson(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      completedLessons.includes(activeLesson.id)
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {completedLessons.includes(activeLesson.id) ? 'Completed' : 'Mark as Complete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
