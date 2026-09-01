"use client";

import { useState } from "react";
import {
  Target,
  Flame,
  Zap,
  BookOpen,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { GiftBadge } from "./gift-badge";

export interface Milestone {
  id: string;
  studentName: string;
  studentId: string;
  title: string;
  description?: string;
  type: "lessons_completed" | "exam_score" | "streak" | "accuracy" | "xp";
  targetValue: number;
  currentValue: number;
  gift: {
    emoji: string;
    title: string;
    description: string;
    couponCode?: string;
    externalLink?: string;
  };
  isUnlocked: boolean;
  unlockedAt?: string;
  createdAt: string;
}

const typeConfig = {
  lessons_completed: {
    icon: BookOpen,
    label: "Lessons Completed",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    unit: "lessons",
  },
  exam_score: {
    icon: FileText,
    label: "Exam Score",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    unit: "%",
  },
  streak: {
    icon: Flame,
    label: "Day Streak",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    unit: "days",
  },
  accuracy: {
    icon: Target,
    label: "Overall Accuracy",
    color: "text-green-500",
    bg: "bg-green-500/10",
    unit: "%",
  },
  xp: {
    icon: Zap,
    label: "XP Earned",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    unit: "XP",
  },
};

interface MilestoneCardProps {
  milestone: Milestone;
  onEdit?: (milestone: Milestone) => void;
  onDelete?: (id: string) => void;
}

export function MilestoneCard({
  milestone,
  onEdit,
  onDelete,
}: MilestoneCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const config = typeConfig[milestone.type];
  const Icon = config.icon;

  const progress = Math.min(
    (milestone.currentValue / milestone.targetValue) * 100,
    100
  );
  const progressRounded = Math.round(progress);

  return (
    <div
      className={`relative rounded-2xl border bg-card shadow-xs transition-all duration-300 hover:shadow-md ${
        milestone.isUnlocked
          ? "border-amber-300/50 ring-1 ring-amber-300/30"
          : "border-border"
      }`}
    >
      {/* Unlocked banner */}
      {milestone.isUnlocked && (
        <div className="absolute -top-px left-0 right-0 flex items-center justify-center gap-1.5 rounded-t-2xl bg-gradient-to-r from-amber-400 to-orange-400 py-1">
          <CheckCircle2 className="h-3 w-3 text-white" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">
            Milestone Achieved! 🎉
          </span>
        </div>
      )}

      <div className={`p-5 ${milestone.isUnlocked ? "pt-8" : ""}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`rounded-xl p-2.5 ${config.bg}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground">
                {milestone.title}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                For{" "}
                <span className="font-semibold text-foreground">
                  {milestone.studentName}
                </span>{" "}
                · {config.label}
              </p>
              {milestone.description && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {milestone.description}
                </p>
              )}
            </div>
          </div>

          {/* Action menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 min-w-[120px] rounded-xl border border-border bg-card shadow-lg">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit?.(milestone);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.(milestone.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-bold text-foreground">
              {milestone.currentValue.toLocaleString()} /{" "}
              {milestone.targetValue.toLocaleString()} {config.unit}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                milestone.isUnlocked
                  ? "bg-gradient-to-r from-amber-400 to-orange-400"
                  : progress >= 75
                  ? "bg-gradient-to-r from-violet-500 to-purple-500"
                  : progress >= 40
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                  : "bg-gradient-to-r from-slate-400 to-slate-500"
              }`}
              style={{ width: `${progressRounded}%` }}
            />
          </div>
          <p className="text-right text-[10px] font-semibold text-muted-foreground">
            {progressRounded}% complete
          </p>
        </div>

        {/* Gift Section */}
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Reward
          </p>
          <GiftBadge
            emoji={milestone.gift.emoji}
            title={milestone.gift.title}
            description={milestone.gift.description}
            couponCode={milestone.gift.couponCode}
            externalLink={milestone.gift.externalLink}
            isUnlocked={milestone.isUnlocked}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
