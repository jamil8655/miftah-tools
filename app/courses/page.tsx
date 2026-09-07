'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Search,
  BookOpen,
  Clock,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  Award,
} from 'lucide-react';
import { COURSES_CATALOG, Course } from '@/lib/courses/courses-data';
import { useUserStore } from '@/lib/user/user-store';
import { useI18n } from '@/lib/i18n/i18n-context';
import { getLocalizedCourse } from '@/lib/i18n/catalog-translations';
import { NativeVideoAd } from '@/components/ads/NativeVideoAd';

export default function CoursesPage() {
  const { t, isRtl, language } = useI18n();
  const { isEnrolled, getCourseProgress, enrollInCourse } = useUserStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const categories = [
    { id: 'all', label: t.courses.allCategories },
    { id: 'web-dev', label: 'Web Development' },
    { id: 'python-ai', label: 'AI & Data Science' },
    { id: 'document-mastery', label: 'Document Engineering' },
    { id: 'cyber-security', label: 'Cyber Security' },
    { id: 'cloud-devops', label: 'Cloud & DevOps' },
  ];

  const levels = [
    { id: 'all', label: t.courses.allLevels },
    { id: 'beginner', label: t.courses.beginner },
    { id: 'intermediate', label: t.courses.intermediate },
    { id: 'advanced', label: t.courses.advanced },
  ];

  const filteredCourses = useMemo(() => {
    return COURSES_CATALOG.map((c) => getLocalizedCourse(c, language)).filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;

      return matchesSearch && matchesCat && matchesLevel;
    });
  }, [searchQuery, selectedCategory, selectedLevel]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5" />
            {t.courses.title}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Learn Digital Skills by Building Real Systems
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.courses.subtitle}
          </p>
        </div>

        {/* Benefits Card (Non-compulsory explanation) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-brand-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 border border-brand-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                {t.courses.enrollmentBenefitsTitle}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t.courses.noEnrollmentRequired}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Progress Sync
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Free Previews
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Certificates
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Tool Projects
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filters Toolbar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.courses.searchCourses}
                className={`w-full py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all ${
                  isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                }`}
              />
            </div>

            {/* Level Selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {levels.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedLevel === lvl.id
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-brand-500'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.courses.noCoursesFound}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your keywords or selecting "All Categories".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedLevel('all');
              }}
              className="px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold hover:bg-brand-100"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, idx) => {
              const enrolled = isEnrolled(course.id);
              const progress = getCourseProgress(course.id);

              return (
                <React.Fragment key={course.id}>
                  <div
                    className="group flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 hover:shadow-xl hover:shadow-brand-500/5 hover:border-brand-500/30 transition-all"
                  >
                    <div className="space-y-4">
                      {/* Header Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-[11px] font-bold border border-brand-200/60 dark:border-brand-800/60">
                          {course.categoryLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          {course.level}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                      </div>

                      {/* Metadata Pill */}
                      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          {course.lessonsCount} {t.courses.lessons}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {course.rating}
                        </span>
                      </div>

                      {/* Progress Bar if enrolled */}
                      {enrolled && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-emerald-600 dark:text-emerald-400">{t.courses.progress}</span>
                            <span className="text-slate-900 dark:text-white">{progress}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">
                        {t.courses.freePreview}
                      </span>

                      <div className="flex items-center gap-2">
                        {!enrolled ? (
                          <button
                            onClick={() => enrollInCourse(course.id)}
                            className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-100 text-xs font-bold transition-all"
                          >
                            {t.courses.enrollFree}
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t.courses.enrolled}
                          </span>
                        )}

                        <Link
                          href={`/courses/${course.slug}`}
                          className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all flex items-center gap-1"
                        >
                          {t.courses.viewDetails}
                          <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                        </Link>
                      </div>
                    </div>
                  </div>
                  {(idx + 1) % 6 === 0 && <NativeVideoAd className="h-full" />}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
