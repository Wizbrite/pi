"use client";

import { useState, useEffect } from "react";
import {
  Users, UserPlus, FileText, CheckCircle2, X, Send, Clock,
  Award, FileEdit, Loader2, Search, Mail, MessageSquare, ChevronRight
} from "lucide-react";
import { TeacherRequestModal } from "@/components/teacher/teacher-request-modal";

export default function StudentTeachersPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [acceptedTeachers, setAcceptedTeachers] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, aRes] = await Promise.all([
        fetch("/api/student/teacher-connections"),
        fetch("/api/student/assignments"),
      ]);

      if (cRes.ok) {
        const cData = await cRes.json();
        setConnections(cData.connections || []);
        const accepted = (cData.connections || []).filter((c: any) => c.status === "accepted");
        const pending = (cData.connections || []).filter((c: any) => c.status === "pending");
        setAcceptedTeachers(accepted);
        setPendingRequests(pending);
      }

      if (aRes.ok) {
        const aData = await aRes.json();
        setAssignments(aData.assignments || []);
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

  const handleSendRequest = async (teacherEmail: string, message?: string) => {
    const res = await fetch("/api/student/teacher-connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherEmail, message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send request");
    await loadData();
  };

  const handleRespondRequest = async (connectionId: string, action: "accepted" | "rejected") => {
    const res = await fetch("/api/student/teacher-connections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId, action }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to respond to request");
    await loadData();
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !answerText.trim()) return;

    try {
      setSubmitting(true);
      setErrorMsg("");
      const res = await fetch(`/api/student/assignments/${selectedTask._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerText: answerText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit answer");

      setSelectedTask(null);
      setAnswerText("");
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Teachers & Tasks</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect with your teachers, complete assigned exercises, and view correction notes
            </p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
          >
            <UserPlus className="h-4 w-4" /> Link Teacher
          </button>
        </div>

        {/* Pending Teacher Connection Requests Banner */}
        {pendingRequests.length > 0 && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/40 dark:bg-amber-950/10">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-bold text-foreground">Teacher Connection Requests ({pendingRequests.length})</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {pendingRequests.map((req) => {
                const tName = req.teacherId?.fullName || req.teacherId?.name || "Teacher";
                const isTeacherInitiated = req.initiatedBy === "teacher";

                return (
                  <div key={req.id || req._id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-bold text-foreground truncate">{tName}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{req.teacherId?.email}</p>
                      {req.message && <p className="text-[10px] text-muted-foreground italic mt-1">&quot;{req.message}&quot;</p>}
                    </div>

                    {isTeacherInitiated ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleRespondRequest(req._id || req.id, "accepted")}
                          className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req._id || req.id, "rejected")}
                          className="rounded-xl border border-border p-1.5 text-muted-foreground hover:bg-muted"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold text-muted-foreground">Sent (Pending)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 1: Assigned Tasks & Corrections */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-600" /> Assigned Exercises & Teacher Corrections
          </h2>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-xs font-bold text-foreground">No tasks assigned yet</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Once your teacher assigns exercises or corrections, they will show up here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => {
                const tName = a.teacherId?.fullName || a.teacherId?.name || "Teacher";
                const isAssigned = a.status === "assigned";
                const isSubmitted = a.status === "submitted";
                const isReviewed = a.status === "reviewed";

                return (
                  <div key={a._id} className="rounded-3xl border border-border bg-card p-5 shadow-xs transition-all hover:border-violet-300">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold uppercase text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                            {a.type}
                          </span>
                          <h3 className="text-sm font-bold text-foreground">{a.title}</h3>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Assigned by <span className="font-bold text-foreground">{tName}</span></p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
                          isSubmitted ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" :
                          isReviewed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" :
                          "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                        }`}>
                          {a.status}
                        </span>

                        {isAssigned && (
                          <button
                            onClick={() => {
                              setSelectedTask(a);
                              setAnswerText(a.studentSubmission?.answerText || "");
                            }}
                            className="flex items-center gap-1 rounded-xl bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
                          >
                            <FileEdit className="h-3.5 w-3.5" /> Submit Response
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl bg-muted/30 p-3.5 text-xs text-muted-foreground leading-relaxed">
                      {a.instructions}
                    </div>

                    {/* Student Response */}
                    {a.studentSubmission?.answerText && (
                      <div className="mt-3 rounded-2xl border border-violet-200 bg-violet-50/50 p-3 dark:border-violet-900/40 dark:bg-violet-950/20">
                        <p className="text-xs font-bold text-violet-900 dark:text-violet-200">Your Submitted Response:</p>
                        <p className="mt-1 text-xs text-violet-800 dark:text-violet-300 italic">&quot;{a.studentSubmission.answerText}&quot;</p>
                      </div>
                    )}

                    {/* Teacher Feedback */}
                    {a.teacherFeedback?.comments && (
                      <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Teacher Correction & Grade:</p>
                          {a.teacherFeedback.score != null && (
                            <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-xs font-black text-white">
                              Grade: {a.teacherFeedback.score}%
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

        {/* Section 2: Connected Teachers */}
        <div className="space-y-4 border-t border-border pt-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" /> Linked Teachers ({acceptedTeachers.length})
          </h2>

          {acceptedTeachers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-xs font-bold text-foreground">No teachers linked yet</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Link with your teachers to receive personalized corrections and practice tasks.</p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="mt-4 flex items-center gap-2 mx-auto rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-700"
              >
                <UserPlus className="h-4 w-4" /> Link Teacher
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {acceptedTeachers.map((t) => {
                const tName = t.teacherId?.fullName || t.teacherId?.name || "Teacher";
                const initials = tName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

                return (
                  <div key={t._id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">{tName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{t.teacherId?.email}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Answer Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">{selectedTask.title}</h3>
              <button onClick={() => setSelectedTask(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAnswer} className="mt-4 space-y-4">
              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/20">
                  {errorMsg}
                </div>
              )}

              <div className="rounded-2xl bg-muted/40 p-3 text-xs text-muted-foreground">
                <p className="font-bold text-foreground mb-1">Teacher Instructions:</p>
                <p>{selectedTask.instructions}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Your Solution / Response</label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your answer or solution text here..."
                  rows={5}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Submit Answer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <TeacherRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        role="student"
        onSend={handleSendRequest}
      />
    </>
  );
}
