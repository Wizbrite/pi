"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain, Zap, Sparkles, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, RefreshCw, Loader2, ArrowRight, BookOpen, Target, Flame,
  Award, ShieldAlert, ChevronRight, HelpCircle
} from "lucide-react";
import type { AIStudentReport } from "@/app/api/student/report/route";

const ratingColors = {
  excellent: {
    badge: "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/30",
    bar: "from-emerald-500 to-teal-500",
    label: "Excellent Preparation",
  },
  good: {
    badge: "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/30",
    bar: "from-blue-500 to-cyan-500",
    label: "Good Progress",
  },
  fair: {
    badge: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/30",
    bar: "from-amber-500 to-orange-500",
    label: "Moderate Pace",
  },
  "needs-improvement": {
    badge: "bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/30",
    bar: "from-rose-500 to-red-500",
    label: "Needs Focus",
  },
};

const urgencyBadges = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
};

export function StudentAIStudyReport() {
  const [report, setReport] = useState<AIStudentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const res = await fetch("/api/student/report");
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load report");
      setReport(data.report);
    } catch (e: any) {
      setError(e.message || "Something went wrong loading your study report.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-3xl border border-border/60 bg-card/50 p-8 text-center shadow-xs">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20">
          <Brain className="h-7 w-7 animate-pulse" />
          <Sparkles className="absolute -right-1 -top-1 h-4 w-4 animate-spin text-amber-300" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">Analyzing Your Study Data…</h3>
          <p className="text-xs text-muted-foreground">Evaluating your BKT mastery, study velocity, and weak areas</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-200 bg-rose-50/50 p-8 text-center dark:border-rose-900/40 dark:bg-rose-950/10">
        <AlertTriangle className="h-10 w-10 text-rose-500" />
        <h3 className="mt-3 text-base font-bold text-foreground">Unable to generate report</h3>
        <p className="mt-1 max-w-md text-xs text-muted-foreground">{error}</p>
        <button
          onClick={() => fetchReport()}
          className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Try Again
        </button>
      </div>
    );
  }

  const { badge, bar, label } = ratingColors[report.overallRating] || ratingColors.good;

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-200/80 bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-950 p-6 text-white shadow-xl dark:border-violet-800/40 sm:p-8">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-200 backdrop-blur-md">
                <Brain className="h-3.5 w-3.5 text-amber-300" /> AI Diagnostic Analysis
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${badge}`}>
                {label} ({report.overallRatingScore}%)
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              Your Personal AI Study Report
            </h2>

            <p className="text-xs leading-relaxed text-violet-200/90 sm:text-sm">
              {report.summary}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 sm:flex-row lg:flex-col lg:items-end">
            <button
              onClick={() => fetchReport(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Re-analyzing..." : "Refresh Report"}
            </button>
            <p className="text-[10px] text-violet-300/70">
              Updated {new Date(report.generatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Readiness Meter */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-violet-200 mb-1.5">
            <span>Overall GCE Readiness Score</span>
            <span className="font-bold text-white">{report.overallRatingScore}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-black/30 p-0.5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${bar} transition-all duration-1000`}
              style={{ width: `${report.overallRatingScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Key Study Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
            <Zap className="h-4 w-4" />
            <span className="text-xs font-bold text-muted-foreground">Consistency</span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{report.studyPattern.consistencyScore}%</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{report.studyPattern.avgSessionsPerWeek} active days/wk</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-bold text-muted-foreground">Study Hours</span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{report.studyPattern.totalStudyHours}h</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">~{report.studyPattern.avgDailyMinutes} mins/session</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Award className="h-4 w-4" />
            <span className="text-xs font-bold text-muted-foreground">Peak Practice</span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{report.studyPattern.mostActiveDay}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Most productive day</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Brain className="h-4 w-4" />
            <span className="text-xs font-bold text-muted-foreground">Strengths</span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{report.strengths.length}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Topics mastered (≥80%)</p>
        </div>
      </div>

      {/* Insights Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <TrendingUp className="h-4 w-4 text-emerald-500" /> Weekly Activity Insight
          </div>
          <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
            {report.weeklyInsight}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Target className="h-4 w-4 text-blue-500" /> Exam Practice Insight
          </div>
          <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
            {report.examInsight}
          </p>
        </div>
      </div>

      {/* Recommended Action Items */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" /> High-Impact Recommended Next Steps
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Prioritized study tasks customized for your maximum mark gain
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {report.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4 transition-all hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-xs font-black text-white">
                  #{rec.priority}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs font-bold text-foreground sm:text-sm">{rec.action}</h4>
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                      {rec.type}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{rec.reason}</p>
                </div>
              </div>

              <Link
                href={
                  rec.type === "review" || rec.type === "lesson"
                    ? "/student/courses"
                    : "/student/practice-hub"
                }
                className="flex items-center gap-1.5 shrink-0 self-start sm:self-center text-xs font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400"
              >
                Start Practice <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Strengths & Growth Areas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Mastered Strengths */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs sm:p-6">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Your Top Mastered Topics
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Topics where you have achieved high Bayesian mastery
          </p>

          <div className="mt-4 space-y-2.5">
            {report.strengths.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-4 text-center">
                Keep completing practice units to unlock topic strength badges.
              </p>
            ) : (
              report.strengths.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-3 dark:bg-emerald-500/5">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-foreground truncate">{s.topic}</p>
                    <p className="text-[10px] text-muted-foreground">{s.subject}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {s.masteryPercent}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Growth Focus Areas */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs sm:p-6">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" /> Growth & Revision Areas
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Targeted topics that require active practice to boost overall score
          </p>

          <div className="mt-4 space-y-2.5">
            {report.concerns.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-4 text-center">
                No critical weak areas detected! Excellent work keeping your mastery high.
              </p>
            ) : (
              report.concerns.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-foreground truncate">{c.topic}</p>
                      <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase ${urgencyBadges[c.urgency]}`}>
                        {c.urgency}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{c.subject}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-rose-600 dark:text-rose-400">
                    {c.masteryPercent}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
