"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, FileText, BarChart3, Clock, BookOpen, ShieldAlert,
  UserPlus, Plus, ChevronRight, CheckCircle2, X, Zap, Flame,
  TrendingUp, Send, FileEdit, Award, Loader2, Search
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { TeacherRequestModal } from "@/components/teacher/teacher-request-modal";
import { SendExerciseModal } from "@/components/teacher/send-exercise-modal";
import type { AssignmentType } from "@/modules/teacher/models/teacher-assignment.model";

interface StudentConnection {
  id: string;
  _id?: string;
  studentId: {
    _id: string;
    id?: string;
    fullName?: string;
    name?: string;
    email: string;
    gceLevel?: string;
    createdAt?: string;
  };
  status: "pending" | "accepted" | "rejected";
  message?: string;
  initiatedBy: "teacher" | "student";
  createdAt: string;
}

interface StudentProgressSummary {
  studentId: string;
  name: string;
  email: string;
  gceLevel: string;
  totalXp: number;
  currentStreak: number;
  overallAccuracy: number;
  totalLessonsCompleted: number;
  totalExamsTaken: number;
}

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const isPending = user?.teacherApprovalStatus === "pending";

  const [connections, setConnections] = useState<StudentConnection[]>([]);
  const [acceptedStudents, setAcceptedStudents] = useState<StudentConnection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<StudentConnection[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [studentsProgress, setStudentsProgress] = useState<Record<string, StudentProgressSummary>>({});

  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      const [connRes, assignRes] = await Promise.all([
        fetch("/api/teacher/connections"),
        fetch("/api/teacher/assignments"),
      ]);

      if (connRes.ok) {
        const connData = await connRes.json();
        setConnections(connData.connections || []);
        const accepted = (connData.connections || []).filter((c: any) => c.status === "accepted");
        const pending = (connData.connections || []).filter((c: any) => c.status === "pending");
        setAcceptedStudents(accepted);
        setPendingRequests(pending);

        // Fetch detailed progress summaries for accepted students
        const progressMap: Record<string, StudentProgressSummary> = {};
        await Promise.all(
          accepted.map(async (c: StudentConnection) => {
            if (!c.studentId) return;
            const sId = c.studentId._id || c.studentId.id;
            try {
              const res = await fetch(`/api/teacher/students/${sId}`);
              if (res.ok) {
                const sData = await res.json();
                const prog = sData.progress;
                progressMap[sId] = {
                  studentId: sId,
                  name: sData.student.name,
                  email: sData.student.email,
                  gceLevel: sData.student.gceLevel || "Ordinary",
                  totalXp: prog?.overall?.totalXp || 0,
                  currentStreak: prog?.overall?.currentStreak || 0,
                  overallAccuracy: prog?.overall?.overallAccuracy || 0,
                  totalLessonsCompleted: prog?.overall?.totalLessonsCompleted || 0,
                  totalExamsTaken: prog?.overall?.totalExamsTaken || 0,
                };
              }
            } catch (e) {
              console.error(`Failed to fetch student ${sId} progress:`, e);
            }
          })
        );
        setStudentsProgress(progressMap);
      }

      if (assignRes.ok) {
        const assignData = await assignRes.json();
        setAssignments(assignData.assignments || []);
      }
    } catch (err) {
      console.error("Error loading teacher dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeacherData();
  }, []);

  const handleSendRequest = async (studentEmail: string, message?: string) => {
    const res = await fetch("/api/teacher/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentEmail, message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send request");
    await loadTeacherData();
  };

  const handleRespondRequest = async (connectionId: string, action: "accepted" | "rejected") => {
    const res = await fetch("/api/teacher/connections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId, action }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to respond");
    await loadTeacherData();
  };

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
    await loadTeacherData();
  };

  const filteredStudents = acceptedStudents.filter((c) => {
    const name = c.studentId.fullName || c.studentId.name || "";
    const email = c.studentId.email || "";
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  const pendingSubmissionsCount = assignments.filter((a) => a.status === "submitted").length;

  return (
    <>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Welcome back, {user?.name?.split(" ")[0] || "Teacher"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor student progress, assign exercises, and send personalized corrections
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition-all"
            >
              <UserPlus className="h-4 w-4" /> Link Student
            </button>
            
          </div>
        </div>

        {/* Pending Approval Banner */}
        {isPending && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h3 className="font-semibold">Account Pending Verification</h3>
              <p className="mt-1 text-xs">
                Your teacher account is under verification. You can link students, assign exercises, and track progress right away!
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Linked Students</p>
                <p className="mt-1 text-2xl font-black text-foreground">{acceptedStudents.length}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{pendingRequests.length} pending request{pendingRequests.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="rounded-xl bg-violet-600 p-2.5 text-white shadow-sm">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tasks Assigned</p>
                <p className="mt-1 text-2xl font-black text-foreground">{assignments.length}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Exercises & Corrections</p>
              </div>
              <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pending Reviews</p>
                <p className="mt-1 text-2xl font-black text-foreground">{pendingSubmissionsCount}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Student answers to grade</p>
              </div>
              <div className="rounded-xl bg-amber-500 p-2.5 text-white shadow-sm">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active Class Streak</p>
                <p className="mt-1 text-2xl font-black text-foreground">
                  {Object.values(studentsProgress).reduce((max, s) => Math.max(max, s.currentStreak), 0)}d
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Top student streak</p>
              </div>
              <div className="rounded-xl bg-orange-500 p-2.5 text-white shadow-sm">
                <Flame className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Incoming & Outgoing Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/40 dark:bg-amber-950/10">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-bold text-foreground">Pending Connection Requests ({pendingRequests.length})</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {pendingRequests.map((req) => {
                if (!req.studentId) return null;
                const reqId = req._id || req.id;
                const sName = req.studentId.fullName || req.studentId.name || "Student";
                const isStudentInitiated = req.initiatedBy === "student";

                return (
                  <div key={reqId} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-foreground truncate">{sName}</p>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                          {isStudentInitiated ? "Incoming" : "Sent"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{req.studentId.email}</p>
                      {req.message && <p className="text-[10px] text-muted-foreground italic mt-1">&quot;{req.message}&quot;</p>}
                    </div>

                    {isStudentInitiated ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleRespondRequest(reqId, "accepted")}
                          className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleRespondRequest(reqId, "rejected")}
                          className="rounded-xl border border-border p-1.5 text-muted-foreground hover:bg-muted"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold text-muted-foreground">Waiting...</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Linked Students List Section */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground sm:text-xl">My Connected Students</h2>
              <p className="text-xs text-muted-foreground">Track learning accuracy, XP, streaks, and send custom tasks</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-muted/30 py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground/30" />
              <h3 className="mt-3 text-base font-bold text-foreground">No linked students found</h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Send a connection request to your students to view their live progress and assign exercises.
              </p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="mt-4 flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-700"
              >
                <UserPlus className="h-4 w-4" /> Link Your First Student
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((conn) => {
                if (!conn.studentId) return null;
                const sId = conn.studentId._id || conn.studentId.id;
                const sName = conn.studentId.fullName || conn.studentId.name || "Student";
                const prog = studentsProgress[sId];
                const initials = sName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

                return (
                  <div key={conn._id || conn.id} className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-xs transition-all hover:border-violet-300 hover:shadow-md">
                    <div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-sm">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-foreground truncate">{sName}</h3>
                          <p className="text-[11px] text-muted-foreground truncate">{conn.studentId.email}</p>
                          <span className="mt-1 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                            {conn.studentId.gceLevel === "Ordinary" ? "O-Level" : "A-Level"}
                          </span>
                        </div>
                      </div>

                      {/* Stat chips */}
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl bg-muted/50 p-2">
                          <Zap className="mx-auto h-3.5 w-3.5 text-violet-600" />
                          <p className="mt-1 text-xs font-black text-foreground">{prog?.totalXp.toLocaleString() ?? "0"}</p>
                          <p className="text-[9px] text-muted-foreground">XP</p>
                        </div>
                        <div className="rounded-xl bg-muted/50 p-2">
                          <Flame className="mx-auto h-3.5 w-3.5 text-orange-500" />
                          <p className="mt-1 text-xs font-black text-foreground">{prog?.currentStreak ?? "0"}d</p>
                          <p className="text-[9px] text-muted-foreground">Streak</p>
                        </div>
                        <div className="rounded-xl bg-muted/50 p-2">
                          <TrendingUp className="mx-auto h-3.5 w-3.5 text-emerald-500" />
                          <p className="mt-1 text-xs font-black text-foreground">{prog?.overallAccuracy ?? "0"}%</p>
                          <p className="text-[9px] text-muted-foreground">Accuracy</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-3">
                      <Link
                        href={`/teacher/students/${sId}`}
                        className="flex items-center justify-center gap-1 rounded-xl bg-violet-50 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300"
                      >
                        <BarChart3 className="h-3.5 w-3.5" /> Progress
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedStudentId(sId);
                          setShowExerciseModal(true);
                        }}
                        className="flex items-center justify-center gap-1 rounded-xl border border-border bg-card py-2 text-xs font-bold text-foreground hover:bg-muted"
                      >
                        <FileEdit className="h-3.5 w-3.5" /> Task
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <TeacherRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        role="teacher"
        onSend={handleSendRequest}
      />

      <SendExerciseModal
        isOpen={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        students={acceptedStudents.map((c) => ({
          id: c.studentId._id,
          name: c.studentId.fullName || c.studentId.name || "Student",
        }))}
        defaultStudentId={selectedStudentId}
        onSend={handleSendExercise}
      />
    </>
  );
}
