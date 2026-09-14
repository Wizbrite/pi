"use client";

import { useState, use, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Zap, Flame, Clock, BookOpen, FileText,
  Target, TrendingUp, AlertTriangle, CheckCircle2,
  BarChart3, Award, Loader2, FileEdit, Send, ShieldAlert, Plus
} from "lucide-react";
import { SendExerciseModal } from "@/components/teacher/send-exercise-modal";
import type { AssignmentType } from "@/modules/teacher/models/teacher-assignment.model";

// ── Interfaces ──────────────────────────────────────────────────────────

interface StudentInfo {
  id: string;
  _id?: string;
  name: string;
  email: string;
  gceLevel: string;
  createdAt: string;
}

interface SubjectProgress {
  courseId: string;
  title: string;
  completedLessons: number;
  totalLessons: number;
  overallMastery: number;
}

interface ExamHistoryItem {
  attemptId: string;
  paperTitle: string;
  completedAt: string;
  percentage: number;
  score: number;
  totalMarks: number;
}

interface OverallProgress {
  totalXp?: number;
  currentStreak?: number;
  longestStreak?: number;
  overallAccuracy?: number;
  totalTimeSpentMinutes?: number;
}

interface FullProgressData {
  overall?: OverallProgress;
  subjects?: SubjectProgress[];
  examHistory?: ExamHistoryItem[];
}

interface WeakAreaItem {
  topicTitle: string;
  courseTitle: string;
  mastery: number;
}

interface StudentDetailResponse {
  success: boolean;
  student: StudentInfo;
  progress: FullProgressData;
  weakAreas: WeakAreaItem[];
}

interface TeacherAssignmentItem {
  _id: string;
  type: AssignmentType;
  title: string;
  instructions: string;
  status: string;
  studentSubmission?: {
    answerText?: string;
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="mt-1 text-xl font-black text-foreground sm:text-2xl">{value}</p>
          {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${color} shrink-0`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function TeacherStudentDetailView({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);

  const [studentData, setStudentData] = useState<StudentDetailResponse | null>(null);
  const [weakAreas, setWeakAreas] = useState<WeakAreaItem[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [activeTab, setActiveTab] = useState<"overview" | "weakness" | "assignments">("overview");
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refetch = useCallback(() => {
    setRefreshIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!studentId) return;
    let isCancelled = false;

    const fetchData = async () => {
      try {
        const [sRes, aRes] = await Promise.all([
          fetch(`/api/teacher/students/${studentId}`),
          fetch(`/api/teacher/assignments?studentId=${studentId}`),
        ]);

        const sJson = await sRes.json().catch(() => ({}));
        const aJson = await aRes.json().catch(() => ({}));

        if (isCancelled) return;

        if (!sRes.ok) throw new Error(sJson.message || "Failed to load student progress.");

        setStudentData(sJson);
        setWeakAreas(sJson.weakAreas || []);
        if (aRes.ok) {
          setAssignments(aJson.assignments || []);
        }
        setErrorMsg("");
      } catch (e: unknown) {
        if (isCancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load student.";
        setErrorMsg(msg);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [studentId, refreshIndex]);

  const handleSendExercise = async (data: {
    studentId: string;
    type: AssignmentType;
    title: string;
    instructions: string;
    subjectTitle?: string;
    topicTitle?: string;
    dueDate?: string;
  }) => {
    const res = await fetch("/api/teacher/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || "Failed to send exercise");
    refetch();
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (errorMsg || !studentData) {
    return (
      <div className="space-y-4 pb-12">
        <Link href="/teacher/students" className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Students
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
          <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" />
          <p className="mt-2 text-sm font-bold">{errorMsg || "Student not found"}</p>
        </div>
      </div>
    );
  }

  const { student, progress } = studentData;
  const overall = progress?.overall || {};
  const studentDbId = student._id || student.id;

  return (
    <>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/teacher/students" className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Students
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white shrink-0">
                {(student.name || "Student").trim().split(/\s+/).map((n: string) => n[0]).filter(Boolean).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">{student.name}</h1>
                <p className="text-xs text-muted-foreground">{student.email} · {student.gceLevel} Level</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowExerciseModal(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
          >
            <FileEdit className="h-4 w-4" /> Send Task / Correction
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl w-fit">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "weakness", label: "Weak Topics", icon: ShieldAlert },
            { id: "assignments", label: "Assigned Tasks", icon: FileText },
          ].map((t) => {
            const Icon = t.icon;
            const tabId = t.id as "overview" | "weakness" | "assignments";
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(tabId)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tabId ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard icon={Zap} label="Total XP" value={overall.totalXp ?? 0} sub="Points earned" color="bg-violet-600" />
              <StatCard icon={Flame} label="Study Streak" value={`${overall.currentStreak ?? 0} days`} sub={`Best: ${overall.longestStreak ?? 0}d`} color="bg-orange-500" />
              <StatCard icon={TrendingUp} label="Accuracy" value={`${overall.overallAccuracy ?? 0}%`} sub="Average score" color="bg-emerald-600" />
              <StatCard icon={Clock} label="Time Spent" value={`${Math.round(((overall.totalTimeSpentMinutes ?? 0) / 60) * 10) / 10}h`} sub="Active studying" color="bg-blue-600" />
            </div>

            {/* Subjects Progress */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs sm:p-6">
              <h3 className="text-base font-bold text-foreground mb-4">Subject Mastery & Progress</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {(progress?.subjects || []).map((sub: SubjectProgress) => (
                  <div key={sub.courseId} className="rounded-2xl border border-border bg-muted/30 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{sub.title}</h4>
                        <p className="text-[10px] text-muted-foreground">{sub.completedLessons}/{sub.totalLessons} lessons completed</p>
                      </div>
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{sub.overallMastery}%</span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-violet-600 transition-all duration-700" style={{ width: `${sub.overallMastery}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Attempt History */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs sm:p-6">
              <h3 className="text-base font-bold text-foreground mb-4">Mock Exam History</h3>
              {(!progress?.examHistory || progress.examHistory.length === 0) ? (
                <p className="text-xs text-muted-foreground italic">No Exams taken yet.</p>
              ) : (
                <div className="space-y-2">
                  {(progress.examHistory || []).map((exam: ExamHistoryItem) => (
                    <div key={exam.attemptId} className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                      <div>
                        <p className="text-xs font-bold text-foreground">{exam.paperTitle}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(exam.completedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold ${exam.percentage >= 50 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {exam.percentage}%
                        </span>
                        <p className="text-[10px] text-muted-foreground">{exam.score}/{exam.totalMarks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weak Topics Tab */}
        {activeTab === "weakness" && (
          <div className="rounded-3xl border border-border bg-card p-5 shadow-xs sm:p-6">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />Identified student Weak Topics
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">
              Low mastery topics
            </p>

            {weakAreas.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No weak topics recorded.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {weakAreas.map((w: WeakAreaItem, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4">
                    <div>
                      <p className="text-xs font-bold text-foreground">{w.topicTitle}</p>
                      <p className="text-[10px] text-muted-foreground">{w.courseTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-lg bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                        {w.mastery > 1 ? Math.round(w.mastery) : Math.round(w.mastery * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assigned Exercises & Corrections Tab */}
        {activeTab === "assignments" && (
          <div className="rounded-3xl border border-border bg-card p-5 shadow-xs sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground">Tasks Assigned to {student.name}</h3>
              <button
                onClick={() => setShowExerciseModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
              >
                <Plus className="h-3.5 w-3.5" /> Assign Task
              </button>
            </div>

            {assignments.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No exercises or corrections sent to this student yet.</p>
            ) : (
              <div className="space-y-3">
                {assignments.map((a: TeacherAssignmentItem) => (
                  <div key={a._id} className="rounded-2xl border border-border bg-background p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold uppercase text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                          {a.type}
                        </span>
                        <h4 className="text-xs font-bold text-foreground">{a.title}</h4>
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground capitalize">{a.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.instructions}</p>
                    {a.studentSubmission?.answerText && (
                      <div className="rounded-xl bg-muted/40 p-2.5 text-xs">
                        <p className="font-bold text-foreground">Student Answer:</p>
                        <p className="text-muted-foreground italic">&quot;{a.studentSubmission.answerText}&quot;</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <SendExerciseModal
        isOpen={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        students={[{ id: studentDbId, name: student.name }]}
        defaultStudentId={studentDbId}
        onSend={handleSendExercise}
      />
    </>
  );
}
