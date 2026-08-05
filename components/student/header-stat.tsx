"use client";

import React from "react";
import { Flame, Zap } from "lucide-react";

interface HeaderStatsProps {
  xp?: number;
  streakDays?: number;
}

export function HeaderStats({ xp = 150, streakDays = 3 }: HeaderStatsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Daily Streak Indicator */}
      <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
        <Flame className="w-3.5 h-3.5 fill-amber-500" />
        <span>{streakDays}d</span>
      </div>

      {/* User XP Badge */}
      <div className="flex items-center gap-1.5 text-primary font-bold text-xs bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
        <Zap className="w-3.5 h-3.5 fill-primary" />
        <span>{xp} XP</span>
      </div>
    </div>
  );
}