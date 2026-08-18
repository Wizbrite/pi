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
  const { user, setUser } = useAuthStore();
  const handleLevelChange = (level: "Ordinary" | "Advanced") => {
    if (user) {
      setUser({ ...user, gceLevel: level });
    } else {
      setUser({
        id: "mock-1",
        name: "Student",
        email: "student@example.com",
        role: "student",
        gceLevel: level,
        createdAt: new Date().toISOString()
      });
    }
  };
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
      {/* Header with Countdown Pill and Level Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s your learning overview
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Level Switcher */}
          <div className="inline-flex items-center rounded-full bg-muted p-1">
            <button
              onClick={() => handleLevelChange("Ordinary")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                user?.gceLevel !== "Advanced"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              O-Level
            </button>
            <button
              onClick={() => handleLevelChange("Advanced")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                user?.gceLevel === "Advanced"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              A-Level
            </button>
          </div>

          {/* GCE Countdown Banner Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50/80 px-4 py-2 text-xs font-semibold text-violet-700 shadow-xs backdrop-blur-xs">
            <Calendar className="h-4 w-4 text-violet-600" />
            <span><strong className="font-extrabold text-violet-800">{daysUntilGce} Days</strong> until GCE Exams</span>
          </div>
        </div>
      </div>

      {/* AI Tutor Prominent Banner */}
      <AiTutorBanner onAsk={handleAskAi} />

      {/* Stats Grid with Actionable Empty States */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Subjects Enrolled */}
        <div className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:border-violet-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Courses Enrolled
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {subjectsCount > 0 ? subjectsCount : "0"}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-violet-500 to-teal-600 p-2.5 shadow-sm">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </div>
          {subjectsCount === 0 ? (
            <Link
              href="/student/courses"
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 transition-all hover:bg-violet-100 hover:text-violet-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Enroll in Courses
            </Link>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">Active courses</p>
          )}
        </div>

        {/* Mock Exams Taken */}
        <div className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:border-violet-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Mock Exams Taken
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {mockExamsCount}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-violet-500 to-orange-600 p-2.5 shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </div>
          {mockExamsCount === 0 ? (
            <Link
              href="/student/exams"
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 transition-all hover:bg-violet-100 hover:text-violet-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Take Mock
            </Link>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">Completed exams</p>
          )}
        </div>

        {/* Average Score */}
        <div className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:border-violet-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Average Score
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {averageScore}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-2.5 shadow-sm">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">No score data yet</p>
        </div>

        {/* Study Streak */}
        <div className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:border-violet-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Study Streak
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {studyStreak}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 p-2.5 shadow-sm">
              <Target className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Start studying today</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/student/courses"
          className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-violet-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-3">
              <BookOpen className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Browse Courses</h3>
              <p className="text-xs text-muted-foreground">
                Explore GCE courses and start studying
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/student/exams"
          className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-violet-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-3">
              <FileText className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Start Mock Exam</h3>
              <p className="text-xs text-muted-foreground">
                Practice with timed GCE-style questions
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/student/progress"
          className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-violet-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-3">
              <BarChart3 className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">View Progress</h3>
              <p className="text-xs text-muted-foreground">
                Track your improvement over time
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity & Guided Recommended Next Steps */}
      <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/50 py-6 text-center">
            <Clock className="h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              No activity yet
            </p>
            <p className="text-xs text-slate-400">
              Start studying or take a practice quiz below to track your progress here.
            </p>
          </div>
        </div>

        {/* Guided Recommended Next Steps */}
        <div className="pt-4 border-t border-border">
          <RecommendedNextSteps />
        </div>
      </div>

      {/* Floating Action Button (FAB) for AI Tutor */}
      <Link href="/student/ai-tutor"><AiTutorFab onClick={() => handleAskAi("Quick Help")} /></Link>
    </div>
  );
}

