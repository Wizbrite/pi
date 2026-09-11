"use client";

import { useState } from "react";
import { X, CheckCircle2, Award, Loader2 } from "lucide-react";

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: {
    id: string;
    title: string;
    studentName: string;
    instructions: string;
    submissionText?: string;
  };
  onSave: (assignmentId: string, score?: number, comments?: string) => Promise<void>;
}

export function ReviewSubmissionModal({
  isOpen,
  onClose,
  assignment,
  onSave,
}: ReviewSubmissionModalProps) {
  const [score, setScore] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await onSave(
        assignment.id,
        score !== "" ? Number(score) : undefined,
        comments.trim() || undefined
      );
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Review Submission</h3>
              <p className="text-xs text-muted-foreground">{assignment.studentName}&apos;s work</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Submission Preview */}
          <div className="rounded-2xl border border-border bg-muted/30 p-3 space-y-1.5">
            <p className="text-xs font-bold text-foreground">{assignment.title}</p>
            <p className="text-[11px] text-muted-foreground italic">&quot;{assignment.submissionText || "No text answer attached."}&quot;</p>
          </div>

          {/* Grade / Score */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Score / Grade (0 - 100%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g. 85"
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Teacher Feedback / Comments */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Teacher Feedback & Correction Notes</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide constructive feedback, corrections, or praise..."
              rows={4}
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
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
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Save Review & Grade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
