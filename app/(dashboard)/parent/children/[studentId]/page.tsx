"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Zap, Flame, Clock, BookOpen, FileText,
  Target, TrendingUp, AlertTriangle, CheckCircle2, Circle,
  ChevronDown, ChevronRight, ExternalLink, Copy, CheckCircle,
  BarChart3, Award, Calendar, Loader2
} from "lucide-react";
import { MilestoneCard, type Milestone } from "@/components/parent/milestone-card";

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
  
  const [studentData, setStudentData] = useState<any>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [progRes, msRes] = await Promise.all([
          fetch(`/api/parent-view/${studentId}`),
          fetch(`/api/parent/milestones`)
        ]);

        const pData = await progRes.json();
        const mData = await msRes.json();

        if (!progRes.ok) throw new Error(pData.message || "Failed to load progress");
        
        setStudentData({
          id: studentId,
          name: pData.progress?.name || "Student",
          email: pData.progress?.email || "",
          gceLevel: pData.progress?.gceLevel || "Advanced",
          overall: pData.progress?.overall || {
            totalXp: 0, currentStreak: 0, longestStreak: 0,
            totalTimeSpentMinutes: 0, totalLessonsCompleted: 0,
            totalExamsTaken: 0, overallAccuracy: 0, subjectsEnrolled: 0
          },
          weeklyActivity: pData.progress?.weeklyActivity || [],
          subjects: pData.progress?.subjects || [],
          examHistory: pData.progress?.examHistory || [],
          weakAreas: pData.progress?.weakAreas || [],
        });

        if (mData.milestones) {
          // Filter milestones for this specific student
          const studentMs = mData.milestones.filter((m: any) => 
            (m.studentId._id === studentId) || (m.studentId === studentId)
          );
          setMilestones(studentMs);
        }

      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [studentId]);

  const maxActivity = studentData && studentData.weeklyActivity.length > 0 
    ? Math.max(...studentData.weeklyActivity.map((d: any) => d.lessonsCompleted), 1) 
    : 1;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/parent-view/${studentId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (errorMsg || !studentData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-foreground">Failed to load student</h2>
        <p className="text-muted-foreground mt-2">{errorMsg}</p>
        <Link href="/parent/children" className="mt-4 text-primary hover:underline">Back to Children</Link>
      </div>
    );
  }

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
              {studentData.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{studentData.name}</h1>
              <p className="text-sm text-muted-foreground">{studentData.email && `${studentData.email} · `}{studentData.gceLevel} Level</p>
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
            <StatCard icon={Zap} label="Total XP" value={studentData.overall.totalXp} sub="Lifetime points" color="bg-primary" />
            <StatCard icon={Flame} label="Streak" value={`${studentData.overall.currentStreak}d`} sub={`Best: ${studentData.overall.longestStreak}d`} color="bg-orange-500" />
            <StatCard icon={Clock} label="Study Time" value={`${studentData.overall.totalTimeSpentMinutes}m`} sub="Total invested" color="bg-blue-500" />
            <StatCard icon={Target} label="Accuracy" value={`${studentData.overall.overallAccuracy}%`} sub="Across all quizzes" color="bg-green-500" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: BookOpen, val: studentData.overall.totalLessonsCompleted, label: "Lessons" },
              { icon: FileText, val: studentData.overall.totalExamsTaken, label: "Exams" },
              { icon: Award, val: studentData.overall.subjectsEnrolled, label: "Subjects" },
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
            {studentData.weeklyActivity && studentData.weeklyActivity.length > 0 ? (
              <div className="flex items-end justify-between gap-2 h-24">
                {studentData.weeklyActivity.map((day: any, i: number) => {
                  const h = (day.lessonsCompleted / maxActivity) * 100;
                  const isToday = i === studentData.weeklyActivity.length - 1;
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
            ) : (
              <p className="text-sm text-muted-foreground">No weekly activity data available yet.</p>
            )}
          </div>

          {/* Weak Areas */}
          {studentData.weakAreas && studentData.weakAreas.length > 0 && (
            <div className="rounded-2xl border border-orange-200/50 bg-orange-50/50 p-5 shadow-xs dark:border-orange-500/20 dark:bg-orange-500/5">
              <h2 className="mb-3 text-base font-bold text-foreground">Areas Needing Attention</h2>
              <div className="space-y-2">
                {studentData.weakAreas.map((area: any) => (
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
          {studentData.subjects && studentData.subjects.length > 0 ? studentData.subjects.map((subj: any) => (
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
          )) : <p className="text-sm text-muted-foreground p-4">No subjects enrolled yet.</p>}
        </div>
      )}

      {/* ── EXAMS TAB ─────────────────────────────────── */}
      {activeTab === "exams" && (
        <div className="space-y-3">
          {studentData.examHistory && studentData.examHistory.length > 0 ? studentData.examHistory.map((exam: any) => (
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
          )) : <p className="text-sm text-muted-foreground p-4">No exam history available.</p>}
        </div>
      )}

      {/* ── MILESTONES TAB ───────────────────────────── */}
      {activeTab === "milestones" && (
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 py-12 text-center">
              <Target className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No milestones set for this student yet.</p>
            </div>
          ) : (
            milestones.map((m) => <MilestoneCard key={m.id} milestone={m} />)
          )}
        </div>
      )}
    </div>
  );
}
