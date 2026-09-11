"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, UserPlus, Search, BarChart3, FileEdit, Zap, Flame,
  TrendingUp, Loader2, ChevronRight
} from "lucide-react";
import { TeacherRequestModal } from "@/components/teacher/teacher-request-modal";
import { SendExerciseModal } from "@/components/teacher/send-exercise-modal";
import type { AssignmentType } from "@/modules/teacher/models/teacher-assignment.model";

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/teacher/connections");
      if (res.ok) {
        const data = await res.json();
        const accepted = (data.connections || []).filter((c: any) => c.status === "accepted");
        setStudents(accepted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendRequest = async (studentEmail: string, message?: string) => {
    const res = await fetch("/api/teacher/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentEmail, message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send request");
    await loadData();
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
    await loadData();
  };

  const filtered = students.filter((c) => {
    const name = c.studentId.fullName || c.studentId.name || "";
    const email = c.studentId.email || "";
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  return (
    <>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Students</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {students.length} student{students.length !== 1 ? "s" : ""} linked to your teacher account
            </p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
          >
            <UserPlus className="h-4 w-4" /> Link Student
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name or email..."
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-muted/30 py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30" />
            <h3 className="mt-4 text-base font-bold text-foreground">No students linked yet</h3>
            <p className="mt-2 max-w-sm text-xs text-muted-foreground">
              Send a request to your students to start viewing their progress and assigning custom exercises.
            </p>
            <button
              onClick={() => setShowRequestModal(true)}
              className="mt-5 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-700"
            >
              <UserPlus className="h-4 w-4" /> Link Student
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((conn) => {
              const sId = conn.studentId._id;
              const sName = conn.studentId.fullName || conn.studentId.name || "Student";
              const initials = sName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

              return (
                <div key={conn.id} className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-xs transition-all hover:border-violet-300 hover:shadow-md">
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
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-3">
                    <Link
                      href={`/teacher/students/${sId}`}
                      className="flex items-center justify-center gap-1 rounded-xl bg-violet-50 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300"
                    >
                      <BarChart3 className="h-3.5 w-3.5" /> Full Progress
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedStudentId(sId);
                        setShowExerciseModal(true);
                      }}
                      className="flex items-center justify-center gap-1 rounded-xl border border-border bg-card py-2 text-xs font-bold text-foreground hover:bg-muted"
                    >
                      <FileEdit className="h-3.5 w-3.5" /> Send Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
        students={students.map((c) => ({
          id: c.studentId._id,
          name: c.studentId.fullName || c.studentId.name || "Student",
        }))}
        defaultStudentId={selectedStudentId}
        onSend={handleSendExercise}
      />
    </>
  );
}
