"use client";

import { useEffect, useState } from "react";
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
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { AiTutorBanner, AiTutorFab } from "@/components/student/ai-tutor-banner";
import { RecommendedNextSteps } from "@/components/student/recommended-next-steps";
import { ParentRequestNotification } from "@/components/student/parent-request-notification";
import type { ProgressData } from "@/lib/types/progress";

export default function StudentDashboard() {
  const { user, setUser } = useAuthStore();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [connRes, progRes] = await Promise.all([
          fetch("/api/parent/connections"),
          fetch("/api/student/progress"),
        ]);

        if (connRes.ok) {
          const data = await connRes.json();
          if (data.pending) {
            setPendingRequests(
              data.pending.map((p: any) => ({
                id: p._id,
                parentName: p.parentId?.fullName || p.parentId?.name || "A parent",
                parentEmail: p.parentId?.email || "",
                message: p.message || "I would like to monitor your progress.",
                sentAt: p.createdAt,
              }))
            );
          }
        }

        if (progRes.ok) {
          const progJson = await progRes.json();
          if (progJson.success && progJson.data) {
            setProgressData(progJson.data);
          }
        }
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setIsLoadingProgress(false);
      }
    }

    loadDashboardData();
  }, []);

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
        createdAt: new Date().toISOString(),
      });
    }
  };

  // Real stats from database via progress API
  console.log(progressData);
  const subjectsCount = progressData?.overall?.subjectsEnrolled ?? 0;
  const mockExamsCount = progressData?.overall?.totalExamsTaken ?? 0;
  const averageScore =
    progressData?.overall?.overallAccuracy != null && progressData.overall.overallAccuracy > 0
      ? `${progressData.overall.overallAccuracy}%`
      : "—";
  const studyStreak =
    progressData?.overall?.currentStreak != null
      ? `${progressData.overall.currentStreak} ${
          progressData.overall.currentStreak === 1 ? "day" : "days"
        }`
      : "0 days";

  // Calculated Days to GCE Exam (target June 1st) (still to implement calcuation logic)
  const daysUntilGce = 280;

  const handleAskAi = (question: string) => {
    console.log("Asking AI Tutor:", question);
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      const res = await fetch(`/api/parent/connections/${id}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept: true }),
      });
      if (res.ok) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      const res = await fetch(`/api/parent/connections/${id}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept: false }),
      });
      if (res.ok) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Extract recent activities (exams or completed lessons)
  const recentExams = progressData?.examHistory?.slice(0, 3) || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Countdown Pill and Level Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s your learning overview from your database records
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
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary shadow-xs backdrop-blur-xs">
            <Calendar className="h-4 w-4 text-primary" />
            <span>
              <strong className="font-extrabold text-primary">{daysUntilGce} Days</strong> until
              GCE Exams
            </span>
          </div>
        </div>
      </div>

      {/* Parent Connection Requests (if any pending) */}
      {pendingRequests.length > 0 && (
        <ParentRequestNotification
          requests={pendingRequests}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
        />
      )}

      {/* AI Tutor Prominent Banner
      <AiTutorBanner onAsk={handleAskAi} /> */}

      {/* Stats Grid with Live DB Data */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Subjects Enrolled */}
        <div className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Courses Enrolled</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{subjectsCount}</p>
            </div>
            <div className="rounded-xl bg-teal-500 p-2.5 shadow-sm">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </div>
          {subjectsCount === 0 ? (
            <Link
              href="/student/courses"
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/20 hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              Enroll in Courses
            </Link>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">Active enrolled courses</p>
          )}
        </div>

        {/* Exams Taken */}
        <div className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Exams Taken</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{mockExamsCount}</p>
            </div>
            <div className="rounded-xl bg-orange-500 p-2.5 shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </div>
          {mockExamsCount === 0 ? (
            <Link
              href="/student/exams"
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/20 hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              Take Mock
            </Link>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">Completed Exams</p>
          )}
        </div>

        {/* Average Score */}
        <div className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Average Score</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{averageScore}</p>
            </div>
            <div className="rounded-xl bg-purple-500 p-2.5 shadow-sm">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Overall quiz & exam accuracy</p>
        </div>

        {/* Study Streak */}
        <div className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Study Streak</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{studyStreak}</p>
            </div>
            <div className="rounded-xl bg-rose-500 p-2.5 shadow-sm">
              <Target className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Continuous daily study streak</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/student/courses"
          className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Browse Courses</h3>
              <p className="text-xs text-muted-foreground">Explore GCE courses and start studying</p>
            </div>
          </div>
        </Link>

        <Link
          href="/student/exams"
          className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Start Mock Exam</h3>
              <p className="text-xs text-muted-foreground">Practice with timed GCE-style questions</p>
            </div>
          </div>
        </Link>

        <Link
          href="/student/progress"
          className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">View Progress</h3>
              <p className="text-xs text-muted-foreground">Track your improvement over time</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity & Guided Recommended Next Steps */}
      <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          {recentExams.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/50 py-6 text-center">
              <Clock className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">No recent exams taken</p>
              <p className="text-xs text-slate-400">
                Start studying or take a practice quiz below to log your activities.
              </p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
              {recentExams.map((exam) => (
                <div key={exam.attemptId} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{exam.paperTitle}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Completed: {new Date(exam.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-foreground">{exam.percentage}%</span>
                    <span className="block text-[10px] text-muted-foreground">
                      {exam.score}/{exam.totalMarks} marks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guided Recommended Next Steps */}
        <div className="pt-4 border-t border-border">
          <RecommendedNextSteps />
        </div>
      </div>

      {/* Floating Action Button (FAB) for AI Tutor */}
      <Link href="/student/ai-tutor">
        <AiTutorFab onClick={() => handleAskAi("Quick Help")} />
      </Link>
    </div>
  );
}
