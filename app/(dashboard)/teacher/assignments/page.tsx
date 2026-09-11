"use client";

import { useState, useEffect } from "react";
import {
  FileText, Plus, CheckCircle2, Award, Clock, FileEdit,
  Loader2, Search, User
} from "lucide-react";
import { SendExerciseModal } from "@/components/teacher/send-exercise-modal";
import { ReviewSubmissionModal } from "@/components/teacher/review-submission-modal";
import type { AssignmentType } from "@/modules/teacher/models/teacher-assignment.model";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showSendModal, setShowSendModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);

  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const loadData = async () => {
    try {
      setLoading(true);
      const [aRes, cRes] = await Promise.all([
        fetch("/api/teacher/assignments"),
        fetch("/api/teacher/connections"),
      ]);

      if (aRes.ok) {
        const aData = await aRes.json();
        setAssignments(aData.assignments || []);
      }

      if (cRes.ok) {
        const cData = await cRes.json();
        const accepted = (cData.connections || []).filter((c: any) => c.status === "accepted");
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
    if (!res.ok) throw new Error(resData.message || "Failed to send assignment");
    await loadData();
  };

  const handleSaveReview = async (assignmentId: string, score?: number, comments?: string) => {
    const res = await fetch(`/api/teacher/assignments/${assignmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, comments }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to save review");
    await loadData();
  };

  const filtered = assignments.filter((a) => {
    if (filterType !== "all" && a.type !== filterType) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Exercises & Corrections</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage exercises, homework, corrections, and review student answers
            </p>
          </div>
          <button
            onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" /> Create New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
            {["all", "exercise", "correction", "recommendation"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filterType === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
            {["all", "assigned", "submitted", "reviewed"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filterStatus === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-muted/30 py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/30" />
            <h3 className="mt-4 text-base font-bold text-foreground">No tasks found</h3>
            <p className="mt-2 max-w-sm text-xs text-muted-foreground">
              Send practice exercises, corrections, or study advice to your linked students.
            </p>
            {students.length > 0 && (
              <button
                onClick={() => setShowSendModal(true)}
                className="mt-5 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-700"
              >
                <Plus className="h-4 w-4" /> Create First Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((a) => {
              const sName = a.studentId?.fullName || a.studentId?.name || "Student";
              const isSubmitted = a.status === "submitted";
              const isReviewed = a.status === "reviewed";

              return (
                <div key={a._id} className="rounded-3xl border border-border bg-card p-5 shadow-xs transition-all hover:border-violet-300">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                          {a.type}
                        </span>
                        <h3 className="text-sm font-bold text-foreground">{a.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-violet-600" /> Student: <span className="font-bold text-foreground">{sName}</span>
                        {a.subjectTitle && <span>· {a.subjectTitle}</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
                        isSubmitted ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" :
                        isReviewed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {a.status}
                      </span>

                      {isSubmitted && (
                        <button
                          onClick={() => {
                            setSelectedAssignment({
                              id: a._id,
                              title: a.title,
                              studentName: sName,
                              instructions: a.instructions,
                              submissionText: a.studentSubmission?.answerText,
                            });
                            setShowReviewModal(true);
                          }}
                          className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                        >
                          <Award className="h-3.5 w-3.5" /> Grade & Review
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed">
                    {a.instructions}
                  </div>

                  {a.studentSubmission?.answerText && (
                    <div className="mt-3 rounded-2xl border border-violet-200 bg-violet-50/50 p-3 dark:border-violet-900/40 dark:bg-violet-950/20">
                      <p className="text-xs font-bold text-violet-900 dark:text-violet-200">Student Response:</p>
                      <p className="mt-1 text-xs text-violet-800 dark:text-violet-300 italic">&quot;{a.studentSubmission.answerText}&quot;</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">Submitted {new Date(a.studentSubmission.submittedAt).toLocaleDateString()}</p>
                    </div>
                  )}

                  {a.teacherFeedback?.comments && (
                    <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Teacher Review & Feedback:</p>
                        {a.teacherFeedback.score != null && (
                          <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-xs font-black text-white">
                            Score: {a.teacherFeedback.score}%
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">{a.teacherFeedback.comments}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SendExerciseModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        students={students.map((c) => ({
          id: c.studentId._id,
          name: c.studentId.fullName || c.studentId.name || "Student",
        }))}
        onSend={handleSendExercise}
      />

      {selectedAssignment && (
        <ReviewSubmissionModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          assignment={selectedAssignment}
          onSave={handleSaveReview}
        />
      )}
    </>
  );
}
