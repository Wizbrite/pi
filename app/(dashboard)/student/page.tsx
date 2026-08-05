"use client";

import Link from "next/link";
import {
  BookOpen,
  FileText,
  BarChart3,
  Clock,
  TrendingUp,
  Target,
  Plus,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { AiTutorBanner, AiTutorFab } from "@/components/student/ai-tutor-banner";
import { RecommendedNextSteps } from "@/components/student/recommended-next-steps";

export default function StudentDashboard() {
  const { user } = useAuthStore();

  // Mock data state - easily connected to backend
  const subjectsCount = 0;
  const mockExamsCount = 0;
  const averageScore = "—";
  const studyStreak = "0 days";

  // Calculated Days to GCE Exam (target June 1st)
  const daysUntilGce = 280;

  const handleAskAi = (question: string) => {
    // Navigates or opens AI tutor chat session
    console.log("Asking AI Tutor:", question);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Countdown Pill */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {user?.gceLevel === "Advanced" ? "A Level" : "O Level"} •{" "}
            Here&apos;s your learning overview
          </p>
        </div>

        {/* GCE Countdown Banner Pill */}
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-2 text-xs font-semibold text-blue-700 shadow-xs backdrop-blur-xs sm:self-auto">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span><strong className="font-extrabold text-blue-800">{daysUntilGce} Days</strong> until GCE Exams</span>
        </div>
      </div>

      {/* AI Tutor Prominent Banner */}
      <AiTutorBanner onAsk={handleAskAi} />

      {/* Stats Grid with Actionable Empty States */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Subjects Enrolled */}
        <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-blue-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Subjects Enrolled
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {subjectsCount > 0 ? subjectsCount : "0"}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 shadow-sm">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </div>
          {subjectsCount === 0 ? (
            <Link
              href="/student/courses"
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100 hover:text-emerald-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Enroll in Subjects
            </Link>
          ) : (
            <p className="mt-3 text-xs text-slate-500">Active subjects</p>
          )}
        </div>

        {/* Mock Exams Taken */}
        <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-blue-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Mock Exams Taken
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {mockExamsCount}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </div>
          {mockExamsCount === 0 ? (
            <Link
              href="/student/exams"
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition-all hover:bg-amber-100 hover:text-amber-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Take Mock
            </Link>
          ) : (
            <p className="mt-3 text-xs text-slate-500">Completed exams</p>
          )}
        </div>

        {/* Average Score */}
        <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-blue-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Average Score
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {averageScore}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-2.5 shadow-sm">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">No score data yet</p>
        </div>

        {/* Study Streak */}
        <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-blue-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Study Streak
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {studyStreak}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 p-2.5 shadow-sm">
              <Target className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Start studying today</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/student/courses"
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Browse Subjects</h3>
              <p className="text-xs text-slate-500">
                Explore GCE subjects and start studying
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/student/exams"
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-3">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Start Mock Exam</h3>
              <p className="text-xs text-slate-500">
                Practice with timed GCE-style questions
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/student/progress"
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">View Progress</h3>
              <p className="text-xs text-slate-500">
                Track your improvement over time
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity & Guided Recommended Next Steps */}
      <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center">
            <Clock className="h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-medium text-slate-600">
              No activity yet
            </p>
            <p className="text-xs text-slate-400">
              Start studying or take a practice quiz below to track your progress here.
            </p>
          </div>
        </div>

        {/* Guided Recommended Next Steps */}
        <div className="pt-4 border-t border-slate-100">
          <RecommendedNextSteps />
        </div>
      </div>

      {/* Floating Action Button (FAB) for AI Tutor */}
      <AiTutorFab onClick={() => handleAskAi("Quick Help")} />
    </div>
  );
}

