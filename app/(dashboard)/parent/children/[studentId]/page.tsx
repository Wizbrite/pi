"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Zap, Flame, Clock, BookOpen, FileText,
  Target, TrendingUp, AlertTriangle, CheckCircle2, Circle,
  ChevronDown, ChevronRight, ExternalLink, Copy, CheckCircle,
  BarChart3, Award, Calendar,
} from "lucide-react";
import { MilestoneCard, type Milestone } from "@/components/parent/milestone-card";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const STUDENT = {
  id: "student_1",
  name: "Favour Nkemdirim",
  email: "favour@school.edu",
  gceLevel: "Advanced",
  overallMastery: 72,
  connectedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  lastActiveAt: new Date(Date.now() - 2 * 3600000).toISOString(),
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
  ],
  examHistory: [
    { attemptId: "a1", paperTitle: "ICT 801 Paper 1 (June 2023)", percentage: 69, completedAt: "2025-08-27T16:00:00Z", score: 18, totalMarks: 26 },
    { attemptId: "a2", paperTitle: "Mathematics P1 (June 2023)", percentage: 75, completedAt: "2025-08-29T14:00:00Z", score: 45, totalMarks: 60 },
  ],
  weakAreas: [
    { topicId: "t1", topicTitle: "Network Concepts", courseTitle: "ICT", accuracy: 50 },
    { topicId: "t2", topicTitle: "Algebra & Functions", courseTitle: "Mathematics", accuracy: 67 },
  ],
};

const MILESTONES: Milestone[] = [
  {
    id: "m1",
    studentId: "student_1",
    studentName: "Favour Nkemdirim",
    title: "Complete 15 Lessons",
    type: "lessons_completed",
    targetValue: 15,
    currentValue: 12,
    isUnlocked: false,
    gift: { emoji: "🎮", title: "Gaming Voucher ($20)", description: "Any game on Steam", couponCode: "STEAM-XYZ" },
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
          {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function StudentProgressView({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params);
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "exams" | "milestones">("overview");
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const maxActivity = Math.max(...STUDENT.weeklyActivity.map((d) => d.lessonsCompleted), 1);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/parent-view/${studentId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back + Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/parent/children" className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Children
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
              {STUDENT.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{STUDENT.name}</h1>
              <p className="text-sm text-muted-foreground">{STUDENT.email} · {STUDENT.gceLevel} Level</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 self-start rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-muted"
        >
          {copied ? <><CheckCircle className="h-4 w-4 text-green-500" /> Link Copied!</> : <><Copy className="h-4 w-4" /> Share Progress Link</>}
        </button>
      </div>

      {/* Tab Nav */}
      <div className="flex items-center gap-1 overflow-x-auto bg-muted p-1 rounded-xl w-fit max-w-full">
        {(["overview", "subjects", "exams", "milestones"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard icon={Zap} label="Total XP" value={STUDENT.overall.totalXp} sub="Lifetime points" color="bg-primary" />
            <StatCard icon={Flame} label="Streak" value={`${STUDENT.overall.currentStreak}d`} sub={`Best: ${STUDENT.overall.longestStreak}d`} color="bg-orange-500" />
            <StatCard icon={Clock} label="Study Time" value={`${STUDENT.overall.totalTimeSpentMinutes}m`} sub="Total invested" color="bg-blue-500" />
            <StatCard icon={Target} label="Accuracy" value={`${STUDENT.overall.overallAccuracy}%`} sub="Across all quizzes" color="bg-green-500" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: BookOpen, val: STUDENT.overall.totalLessonsCompleted, label: "Lessons" },
              { icon: FileText, val: STUDENT.overall.totalExamsTaken, label: "Exams" },
              { icon: Award, val: STUDENT.overall.subjectsEnrolled, label: "Subjects" },
            ].map(({ icon: Icon, val, label }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-3 text-center shadow-xs">
                <Icon className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                <p className="text-lg font-black text-foreground">{val}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Weekly Activity */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Weekly Activity</h2>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Calendar className="h-3 w-3" /> Last 7 days</span>
            </div>
            <div className="flex items-end justify-between gap-2 h-24">
              {STUDENT.weeklyActivity.map((day, i) => {
                const h = (day.lessonsCompleted / maxActivity) * 100;
                const isToday = i === STUDENT.weeklyActivity.length - 1;
                return (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-foreground">{day.lessonsCompleted > 0 ? day.lessonsCompleted : ""}</span>
                    <div className="w-full bg-muted rounded-full h-20 flex items-end overflow-hidden">
                      <div className={`w-full rounded-full transition-all duration-500 ${isToday ? "bg-primary" : day.lessonsCompleted > 0 ? "bg-primary/50" : "bg-muted"}`} style={{ height: `${Math.max(h, 4)}%` }} />
                    </div>
                    <span className={`text-[10px] font-medium ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>{day.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weak Areas */}
          {STUDENT.weakAreas.length > 0 && (
            <div className="rounded-2xl border border-orange-200/50 bg-orange-50/50 p-5 shadow-xs dark:border-orange-500/20 dark:bg-orange-500/5">
              <h2 className="mb-3 text-base font-bold text-foreground">Areas Needing Attention</h2>
              <div className="space-y-2">
                {STUDENT.weakAreas.map((area) => (
                  <div key={area.topicId} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground">{area.topicTitle}</p>
                      <p className="text-[10px] text-muted-foreground">{area.courseTitle}</p>
                    </div>
                    <p className={`text-sm font-black ${area.accuracy < 60 ? "text-red-500" : "text-amber-600"}`}>{area.accuracy}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SUBJECTS TAB ─────────────────────────────── */}
      {activeTab === "subjects" && (
        <div className="space-y-3">
          {STUDENT.subjects.map((subj) => (
            <div key={subj.courseId} className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
              <button onClick={() => setExpandedSubject(expandedSubject === subj.courseId ? null : subj.courseId)} className="w-full text-left p-5 hover:bg-muted/20 transition">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-400">{subj.level}</span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">{subj.subject}</span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground truncate">{subj.title}</h3>
                    <p className="text-[11px] text-muted-foreground mt-1">{subj.completedLessons}/{subj.totalLessons} lessons · {subj.averageAccuracy}% accuracy</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-xl font-black text-foreground">{subj.overallMastery}%</p>
                      <p className="text-[10px] text-muted-foreground">Mastery</p>
                    </div>
                    {expandedSubject === subj.courseId ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full transition-all duration-500 ${subj.overallMastery >= 80 ? "bg-green-500" : subj.overallMastery >= 50 ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${subj.overallMastery}%` }} />
                </div>
              </button>
              {expandedSubject === subj.courseId && (
                <div className="border-t border-border p-4 bg-muted/20">
                  <p className="text-xs text-muted-foreground">Detailed topic breakdown available in full progress view.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── EXAMS TAB ─────────────────────────────────── */}
      {activeTab === "exams" && (
        <div className="space-y-3">
          {STUDENT.examHistory.map((exam) => (
            <div key={exam.attemptId} className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate">{exam.paperTitle}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatDate(exam.completedAt)}</p>
                  <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${exam.percentage >= 50 ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"}`}>
                    {exam.percentage >= 50 ? "Passed" : "Failed"}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-black text-foreground">{exam.percentage}%</p>
                  <p className="text-[10px] text-muted-foreground">{exam.score}/{exam.totalMarks}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MILESTONES TAB ───────────────────────────── */}
      {activeTab === "milestones" && (
        <div className="space-y-4">
          {MILESTONES.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 py-12 text-center">
              <Target className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No milestones set for this student yet.</p>
            </div>
          ) : (
            MILESTONES.map((m) => <MilestoneCard key={m.id} milestone={m} />)
          )}
        </div>
      )}
    </div>
  );
}
