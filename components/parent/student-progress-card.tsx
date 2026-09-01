"use client";

import Link from "next/link";
import {
  Zap,
  Flame,
  BookOpen,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";

interface StudentProgressCardProps {
  studentId: string;
  name: string;
  email: string;
  avatar?: string;
  gceLevel?: "Ordinary" | "Advanced";
  stats: {
    totalXp: number;
    currentStreak: number;
    lessonsCompleted: number;
    overallAccuracy: number;
  };
  overallMastery: number; // 0-100
  lastActiveAt?: string;
  connectedAt: string;
  onShareLink?: (studentId: string) => void;
}

function MasteryRing({ value, size = 56 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          className={`transition-all duration-700 ${
            value >= 80
              ? "text-green-500"
              : value >= 50
              ? "text-amber-500"
              : value > 0
              ? "text-blue-500"
              : "text-muted-foreground"
          }`}
        />
      </svg>
      <span
        className={`absolute text-[11px] font-black ${
          value >= 80
            ? "text-green-600"
            : value >= 50
            ? "text-amber-600"
            : "text-muted-foreground"
        }`}
      >
        {value}%
      </span>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function StudentProgressCard({
  studentId,
  name,
  email,
  gceLevel,
  stats,
  overallMastery,
  lastActiveAt,
  connectedAt,
  onShareLink,
}: StudentProgressCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="group rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 hover:border-violet-300/60 hover:shadow-md">
      <div className="p-5">
        {/* Top: Avatar + Info + Ring */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-base font-bold text-white shadow-sm">
              {initials}
              {/* Online dot - green if active today */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                  lastActiveAt &&
                  Date.now() - new Date(lastActiveAt).getTime() < 86400000
                    ? "bg-green-500"
                    : "bg-muted-foreground/30"
                }`}
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{name}</h3>
              <p className="text-xs text-muted-foreground">{email}</p>
              {gceLevel && (
                <span className="mt-1 inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-400">
                  {gceLevel === "Ordinary" ? "O-Level" : "A-Level"}
                </span>
              )}
            </div>
          </div>

          {/* Mastery Ring */}
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <MasteryRing value={overallMastery} />
            <p className="text-[9px] font-medium text-muted-foreground">
              Mastery
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-muted/50 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-sm font-black text-foreground">
                {stats.totalXp.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">XP</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-sm font-black text-foreground">
                {stats.currentStreak}d
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">Streak</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-sm font-black text-foreground">
                {stats.overallAccuracy}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">Accuracy</p>
          </div>
        </div>

        {/* Last Active */}
        <div className="mt-3 flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            {lastActiveAt
              ? `Last active ${formatTimeAgo(lastActiveAt)}`
              : "No activity yet"}
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            Connected {formatTimeAgo(connectedAt)}
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex border-t border-border">
        <Link
          href={`/parent/children/${studentId}`}
          className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/5"
        >
          <BookOpen className="h-3.5 w-3.5" />
          View Progress
          <ChevronRight className="h-3 w-3" />
        </Link>
        <button
          onClick={() => onShareLink?.(studentId)}
          className="flex items-center justify-center gap-1.5 border-l border-border px-4 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Share
        </button>
      </div>
    </div>
  );
}
