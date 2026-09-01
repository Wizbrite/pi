"use client";

import { useState } from "react";
import { X, Target, BookOpen, Flame, FileText, Zap, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MilestoneFormData {
  studentId: string;
  title: string;
  description: string;
  type: "lessons_completed" | "exam_score" | "streak" | "accuracy" | "xp";
  targetValue: number;
  gift: {
    emoji: string;
    title: string;
    description: string;
    couponCode?: string;
    externalLink?: string;
  };
}

interface Student {
  id: string;
  name: string;
}

interface SetMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  defaultStudentId?: string;
  onSave?: (data: MilestoneFormData) => Promise<void>;
}

const MILESTONE_TYPES = [
  { value: "lessons_completed", label: "Lessons Completed", icon: BookOpen, placeholder: "e.g. 10", unit: "lessons" },
  { value: "exam_score", label: "Exam Score", icon: FileText, placeholder: "e.g. 80", unit: "%" },
  { value: "streak", label: "Day Streak", icon: Flame, placeholder: "e.g. 7", unit: "days" },
  { value: "accuracy", label: "Overall Accuracy", icon: Target, placeholder: "e.g. 75", unit: "%" },
  { value: "xp", label: "XP Earned", icon: Zap, placeholder: "e.g. 1000", unit: "XP" },
] as const;

const GIFT_EMOJIS = ["🎁", "🏆", "⭐", "🎮", "📱", "💻", "🎓", "🍕", "🎬", "🎵", "💰", "🛍️"];

export function SetMilestoneModal({
  isOpen,
  onClose,
  students,
  defaultStudentId,
  onSave,
}: SetMilestoneModalProps) {
  const [step, setStep] = useState<"milestone" | "gift" | "saving" | "success">("milestone");
  const [form, setForm] = useState<MilestoneFormData>({
    studentId: defaultStudentId || (students[0]?.id ?? ""),
    title: "",
    description: "",
    type: "lessons_completed",
    targetValue: 10,
    gift: { emoji: "🎁", title: "", description: "", couponCode: "", externalLink: "" },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const selectedType = MILESTONE_TYPES.find((t) => t.value === form.type)!;

  const validateMilestone = () => {
    const e: Record<string, string> = {};
    if (!form.studentId) e.studentId = "Select a student";
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.targetValue || form.targetValue <= 0) e.targetValue = "Target must be greater than 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateGift = () => {
    const e: Record<string, string> = {};
    if (!form.gift.title.trim()) e.giftTitle = "Gift title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateMilestone()) setStep("gift");
  };

  const handleSave = async () => {
    if (!validateGift()) return;
    setStep("saving");
    try {
      if (onSave) await onSave(form);
      else await new Promise((r) => setTimeout(r, 1200));
      setStep("success");
    } catch {
      setErrors({ submit: "Failed to save. Please try again." });
      setStep("gift");
    }
  };

  const handleClose = () => {
    setStep("milestone");
    setForm({
      studentId: defaultStudentId || (students[0]?.id ?? ""),
      title: "",
      description: "",
      type: "lessons_completed",
      targetValue: 10,
      gift: { emoji: "🎁", title: "", description: "", couponCode: "", externalLink: "" },
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative my-auto w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {step === "gift" ? "Set Reward Gift" : "Set Milestone"}
            </h2>
            <div className="mt-1 flex gap-1">
              {["milestone", "gift"].map((s, i) => (
                <div
                  key={s}
                  className={`h-1 w-12 rounded-full transition-colors ${
                    (step === "milestone" && i === 0) ||
                    (step === "gift" && i <= 1) ||
                    step === "saving" ||
                    step === "success"
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          {step === "success" ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-4xl">
                {form.gift.emoji}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Milestone Set! 🎯</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  The student will see their progress toward this milestone, and the gift will unlock automatically when they achieve it.
                </p>
              </div>
              <Button onClick={handleClose} className="w-full">Done</Button>
            </div>
          ) : step === "milestone" ? (
            <div className="space-y-4">
              {/* Student */}
              {students.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">For Student *</label>
                  <div className="relative">
                    <select
                      value={form.studentId}
                      onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
                      className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {errors.studentId && <p className="text-xs text-red-500">{errors.studentId}</p>}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Milestone Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Complete 10 lessons this month"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Description <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Add a motivating message for the student..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Milestone Type *</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {MILESTONE_TYPES.map((t) => {
                    const Icon = t.icon;
                    const selected = form.type === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-[10px] font-semibold leading-tight">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Target Value * <span className="font-normal text-muted-foreground">({selectedType.unit})</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.targetValue}
                  onChange={(e) => setForm((f) => ({ ...f, targetValue: Number(e.target.value) }))}
                  placeholder={selectedType.placeholder}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.targetValue && <p className="text-xs text-red-500">{errors.targetValue}</p>}
              </div>

              <Button onClick={handleNext} className="w-full">
                Next: Set Reward →
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Emoji picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Gift Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {GIFT_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setForm((f) => ({ ...f, gift: { ...f.gift, emoji: e } }))}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border text-lg transition-all ${
                        form.gift.emoji === e
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gift title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Gift Title *</label>
                <input
                  type="text"
                  value={form.gift.title}
                  onChange={(e) => setForm((f) => ({ ...f, gift: { ...f.gift, title: e.target.value } }))}
                  placeholder="e.g. Amazon Gift Card ($10)"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.giftTitle && <p className="text-xs text-red-500">{errors.giftTitle}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Gift Description <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.gift.description}
                  onChange={(e) => setForm((f) => ({ ...f, gift: { ...f.gift, description: e.target.value } }))}
                  placeholder="e.g. Use this to buy any book of your choice"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Coupon Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Coupon / Voucher Code <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.gift.couponCode}
                  onChange={(e) => setForm((f) => ({ ...f, gift: { ...f.gift, couponCode: e.target.value } }))}
                  placeholder="e.g. GIFT-2025-ABC123"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* External Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Claim Link <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="url"
                  value={form.gift.externalLink}
                  onChange={(e) => setForm((f) => ({ ...f, gift: { ...f.gift, externalLink: e.target.value } }))}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {errors.submit && <p className="text-xs text-red-500">{errors.submit}</p>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("milestone")} className="flex-1">
                  ← Back
                </Button>
                <Button onClick={handleSave} disabled={step === "saving"} className="flex-1 gap-2">
                  {step === "saving" ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                  ) : (
                    "Save Milestone 🎯"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
