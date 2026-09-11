"use client";

import React, { useEffect, useState } from "react";
import { Flame, Zap } from "lucide-react";

interface HeaderStatsProps {
  xp?: number;
  streakDays?: number;
}

export function HeaderStats({ xp: initialXp, streakDays: initialStreak }: HeaderStatsProps) {
  const [xp, setXp] = useState<number | null>(initialXp ?? null);
  const [streakDays, setStreakDays] = useState<number | null>(initialStreak ?? null);

  useEffect(() => {
    let isMounted = true;
    if (initialXp !== undefined && initialStreak !== undefined) {
      setXp(initialXp);
      setStreakDays(initialStreak);
      return;
    }

    async function fetchStats() {
      try {
        const res = await fetch("/api/student/progress");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.overall && isMounted) {
            setXp(json.data.overall.totalXp ?? 0);
            setStreakDays(json.data.overall.currentStreak ?? 0);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sidebar header stats:", err);
      }
    }

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [initialXp, initialStreak]);

  const displayXp = xp ?? 0;
  const displayStreak = streakDays ?? 0;

  return (
    <div className="flex items-center gap-2">
      {/* Daily Streak Indicator */}
      <div className="flex items-center gap-1.5 text-primary/80 font-bold text-xs bg-primary/5 px-2.5 py-1 rounded-full border border-primary/20">
        <Flame className="w-3.5 h-3.5 fill-primary/80" />
        <span>{displayStreak}d</span>
      </div>

      {/* User XP Badge */}
      <div className="flex items-center gap-1.5 text-primary font-bold text-xs bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
        <Zap className="w-3.5 h-3.5 fill-primary" />
        <span>{displayXp} XP</span>
      </div>
    </div>
  );
}