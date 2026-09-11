"use client";

import { useState } from "react";
import { X, Send, FileEdit, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import type { AssignmentType } from "@/modules/teacher/models/teacher-assignment.model";

interface SendExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: { id: string; name: string }[];
  defaultStudentId?: string;
  onSend: (data: {
    studentId: string;
    type: AssignmentType;
    title: string;
    instructions: string;
    subjectTitle?: string;
    topicTitle?: string;
    dueDate?: string;
  }) => Promise<void>;
}

export function SendExerciseModal({
  isOpen,
  onClose,
  students,
  defaultStudentId,
  onSend,
}: SendExerciseModalProps) {
  const [studentId, setStudentId] = useState(defaultStudentId || (students[0]?.id ?? ""));
  const [type, setType] = useState<AssignmentType>("exercise");
  const [title, setTitle] = useState("");
  const [subjectTitle, setSubjectTitle] = useState("");
  const [topicTitle, setTopicTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setError("Please select a student.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!instructions.trim()) {
      setError("Please enter detailed instructions or questions.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onSend({
        studentId,
        type,
        title: title.trim(),
        instructions: instructions.trim(),
        subjectTitle: subjectTitle.trim() || undefined,
        topicTitle: topicTitle.trim() || undefined,
        dueDate: dueDate || undefined,
      });
      setTitle("");
      setInstructions("");
      setSubjectTitle("");
      setTopicTitle("");
      setDueDate("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to send assignment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
              <FileEdit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Send Task / Correction</h3>
              <p className="text-xs text-muted-foreground">Assign exercises, corrections, or study advice</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Select Student */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Select Student</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
              required
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignment Type Selector */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Task Category</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "exercise", label: "Exercise", desc: "Custom Task" },
                { id: "correction", label: "Correction", desc: "Exam Feedback" },
                { id: "recommendation", label: "Advice", desc: "Study Plan" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as AssignmentType)}
                  className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition-all ${
                    type === t.id
                      ? "border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 font-bold"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="text-xs">{t.label}</span>
                  <span className="text-[9px] opacity-70">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Title / Subject Line</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Physics Mechanics Revision Exercise 1"
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              required
            />
          </div>

          {/* Optional Subject & Topic */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Subject (Optional)</label>
              <input
                type="text"
                value={subjectTitle}
                onChange={(e) => setSubjectTitle(e.target.value)}
                placeholder="e.g. Chemistry"
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Topic (Optional)</label>
              <input
                type="text"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="e.g. Organic Synthesis"
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Instructions / Exercise Body */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Detailed Instructions, Questions or Corrections
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter the practice questions, correction notes, or topic review steps for the student..."
              rows={4}
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Due Date (Optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Send to Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
