"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  Flame,
  Clock,
  BookOpen,
  FileText,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Award,
  Calendar,
  Loader2,
  Shield,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";

// ─── MOCK DATA (would be fetched from backend using token) ───────────────────

const STUDENT_DATA = {
  name: "Favour Nkemdirim",
  gceLevel: "Advanced",
  overall: {
    totalXp: 1240,
    currentStreak: 5,
    longestStreak: 12,
    totalTimeSpentMinutes: 342,
    totalLessonsCompleted: 12,
    totalExamsTaken: 4,
    overallAccuracy: 74,
    subjectsEnrolled: 3,
  },
  weeklyActivity: [
    { date: "Mon", lessonsCompleted: 2, xpEarned: 100 },
    { date: "Tue", lessonsCompleted: 1, xpEarned: 50 },
    { date: "Wed", lessonsCompleted: 3, xpEarned: 250 },
    { date: "Thu", lessonsCompleted: 0, xpEarned: 0 },
    { date: "Fri", lessonsCompleted: 1, xpEarned: 50 },
    { date: "Sat", lessonsCompleted: 2, xpEarned: 200 },
    { date: "Sun", lessonsCompleted: 1, xpEarned: 50 },
  ],
  subjects: [
    {
      courseId: "c1",
      title: "ICT (Upper Sixth)",
      subject: "ICT",
      level: "A-Level",
      completedLessons: 6,
      totalLessons: 10,
      overallMastery: 72,
      averageAccuracy: 74,
    },
    {
      courseId: "c2",
      title: "Mathematics (Pure)",
      subject: "Mathematics",
      level: "A-Level",
      completedLessons: 6,
      totalLessons: 8,
      overallMastery: 80,
      averageAccuracy: 82,
    },
    {
      courseId: "c3",
      title: "Physics",
      subject: "Physics",
      level: "A-Level",
      completedLessons: 0,
      totalLessons: 12,
      overallMastery: 0,
      averageAccuracy: 0,
    },
  ],
  examHistory: [
    {
      attemptId: "a1",
      paperTitle: "ICT 801 Paper 1 (June 2023)",
      percentage: 69,
      completedAt: "2025-08-27T16:00:00Z",
      score: 18,
      totalMarks: 26,
    },
    {
      attemptId: "a2",
      paperTitle: "Mathematics P1 (June 2023)",
      percentage: 75,
      completedAt: "2025-08-29T14:00:00Z",
      score: 45,
      totalMarks: 60,
    },
    {
      attemptId: "a3",
      paperTitle: "ICT 801 Paper 2 (June 2023)",
      percentage: 60,
      completedAt: "2025-08-30T17:00:00Z",
      score: 12,
      totalMarks: 20,
    },
  ],
  weakAreas: [
    {
      topicId: "t1",
      topicTitle: "Network Concepts",
      courseTitle: "ICT",
      accuracy: 50,
    },
    {
      topicId: "t2",
      topicTitle: "Algebra & Functions",
      courseTitle: "Mathematics",
      accuracy: 67,
    },
  ],
};

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getMasteryColor(v: number) {
  if (v >= 80) return "bg-green-500";
  if (v >= 50) return "bg-amber-500";
  if (v > 0) return "bg-blue-500";
  return "bg-muted";
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
          {sub && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
          )}
        </div>
        <div className={`rounded-xl p-2.5 ${iconBg}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function ParentViewPage({
  params,
}: {
  params: { token: string };
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Simulate loading - in production, fetch using params.token
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [params.token]);

  const maxActivity = Math.max(
    ...STUDENT_DATA.weeklyActivity.map((d) => d.lessonsCompleted),
    1
  );

  const initials = STUDENT_DATA.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading progress report…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo size="sm" />
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5">
            <Shield className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-[11px] font-bold text-muted-foreground">
              Read-Only Progress View
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 pb-16">
        {/* Student Identity Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl">
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-xl font-black text-white backdrop-blur-sm">
              {initials}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Student Progress Report
              </p>
              <h1 className="text-2xl font-black text-white">
                {STUDENT_DATA.name}
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-bold text-white">
                  {STUDENT_DATA.gceLevel} Level
                </span>
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-bold text-white">
                  {STUDENT_DATA.overall.subjectsEnrolled} subjects
                </span>
              </div>
            </div>
          </div>

          {/* Quick snapshot */}
          <div className="relative mt-5 grid grid-cols-3 gap-3">
            {[
              { label: "Total XP", value: STUDENT_DATA.overall.totalXp.toLocaleString() },
              { label: "Streak", value: `${STUDENT_DATA.overall.currentStreak}d` },
              { label: "Accuracy", value: `${STUDENT_DATA.overall.overallAccuracy}%` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl bg-white/15 p-3 text-center backdrop-blur-sm"
              >
                <p className="text-lg font-black text-white">{value}</p>
                <p className="text-[10px] font-medium text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={Zap}
            label="Total XP"
            value={STUDENT_DATA.overall.totalXp}
            sub="Lifetime points"
            iconBg="bg-primary"
          />
          <StatCard
            icon={Flame}
            label="Streak"
            value={`${STUDENT_DATA.overall.currentStreak}d`}
            sub={`Best: ${STUDENT_DATA.overall.longestStreak}d`}
            iconBg="bg-orange-500"
          />
          <StatCard
            icon={Clock}
            label="Study Time"
            value={`${STUDENT_DATA.overall.totalTimeSpentMinutes}m`}
            sub="Total invested"
            iconBg="bg-blue-500"
          />
          <StatCard
            icon={Target}
            label="Accuracy"
            value={`${STUDENT_DATA.overall.overallAccuracy}%`}
            sub="Across all quizzes"
            iconBg="bg-green-500"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: BookOpen, val: STUDENT_DATA.overall.totalLessonsCompleted, label: "Lessons Done" },
            { icon: FileText, val: STUDENT_DATA.overall.totalExamsTaken, label: "Exams Taken" },
            { icon: Award, val: STUDENT_DATA.overall.subjectsEnrolled, label: "Subjects" },
          ].map(({ icon: Icon, val, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-card p-3 text-center shadow-xs"
            >
              <Icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
              <p className="text-lg font-black text-foreground">{val}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Weekly Activity Chart */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              This Week&apos;s Activity
            </h2>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" /> Last 7 days
            </span>
          </div>
          <div className="flex h-28 items-end justify-between gap-2">
            {STUDENT_DATA.weeklyActivity.map((day, i) => {
              const h = (day.lessonsCompleted / maxActivity) * 100;
              const isToday = i === STUDENT_DATA.weeklyActivity.length - 1;
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-foreground">
                    {day.lessonsCompleted > 0 ? day.lessonsCompleted : ""}
                  </span>
                  <div className="flex h-20 w-full items-end overflow-hidden rounded-full bg-muted">
                    <div
                      className={`w-full rounded-full transition-all duration-500 ${
                        isToday
                          ? "bg-primary"
                          : day.lessonsCompleted > 0
                          ? "bg-primary/50"
                          : "bg-muted"
                      }`}
                      style={{ height: `${Math.max(h, 4)}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-medium ${
                      isToday ? "font-bold text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Progress */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-foreground">
            Subject Progress
          </h2>
          <div className="space-y-3">
            {STUDENT_DATA.subjects.map((subj) => (
              <div
                key={subj.courseId}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
              >
                <button
                  onClick={() =>
                    setExpandedSubject(
                      expandedSubject === subj.courseId ? null : subj.courseId
                    )
                  }
                  className="w-full p-5 text-left transition hover:bg-muted/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-400">
                          {subj.level}
                        </span>
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                          {subj.subject}
                        </span>
                      </div>
                      <h3 className="truncate text-sm font-bold text-foreground">
                        {subj.title}
                      </h3>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {subj.completedLessons}/{subj.totalLessons} lessons ·{" "}
                        {subj.averageAccuracy}% accuracy
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="text-right">
                        <p className="text-xl font-black text-foreground">
                          {subj.overallMastery}%
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Mastery
                        </p>
                      </div>
                      {expandedSubject === subj.courseId ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getMasteryColor(subj.overallMastery)}`}
                      style={{ width: `${subj.overallMastery}%` }}
                    />
                  </div>
                </button>

                {expandedSubject === subj.courseId && (
                  <div className="border-t border-border bg-muted/20 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-card p-3 text-center">
                        <p className="text-lg font-black text-foreground">
                          {subj.completedLessons}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Lessons Completed
                        </p>
                      </div>
                      <div className="rounded-xl bg-card p-3 text-center">
                        <p
                          className={`text-lg font-black ${
                            subj.averageAccuracy >= 80
                              ? "text-green-600"
                              : subj.averageAccuracy >= 60
                              ? "text-amber-600"
                              : "text-red-500"
                          }`}
                        >
                          {subj.averageAccuracy}%
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Avg Accuracy
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Exam History */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-foreground">
            Exam History
          </h2>
          <div className="space-y-3">
            {STUDENT_DATA.examHistory.map((exam) => (
              <div
                key={exam.attemptId}
                className="rounded-2xl border border-border bg-card p-4 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-xs font-bold text-foreground">
                      {exam.paperTitle}
                    </h4>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatDate(exam.completedAt)}
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        exam.percentage >= 50
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                      }`}
                    >
                      {exam.percentage >= 50 ? "✓ Passed" : "✗ Failed"}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-black text-foreground">
                      {exam.percentage}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {exam.score}/{exam.totalMarks}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Areas */}
        {STUDENT_DATA.weakAreas.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Areas Needing Attention
            </h2>
            <div className="space-y-3">
              {STUDENT_DATA.weakAreas.map((area) => (
                <div
                  key={area.topicId}
                  className="flex items-center gap-3 rounded-2xl border border-orange-200/50 bg-orange-50/50 p-4 shadow-xs dark:border-orange-500/20 dark:bg-orange-500/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground">
                      {area.topicTitle}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {area.courseTitle}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-lg font-black ${
                        area.accuracy < 60 ? "text-red-500" : "text-amber-600"
                      }`}
                    >
                      {area.accuracy}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      accuracy
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="rounded-2xl border border-border bg-muted/30 p-5 text-center">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 text-violet-500" />
            <p className="text-xs font-semibold text-muted-foreground">
              This is a read-only progress report shared by a parent.
            </p>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Generated by{" "}
            <span className="font-bold text-primary">Pi Learning</span> · GCE
            Exam Preparation Platform
          </p>
        </div>
      </main>
    </div>
  );
}
