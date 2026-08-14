import React from "react";
import { StudentRank } from "@/lib/leaderboard-data";
import { Medal, Trophy, Zap } from "lucide-react";

interface PodiumProps {
  topThree: StudentRank[];
}

export function LeaderboardPodium({ topThree }: PodiumProps) {
  if (topThree.length < 3) return null;

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <div className="flex flex-row items-end justify-center gap-2 sm:gap-4 md:gap-6 mt-12 mb-8 relative">
      
      {/* 2nd Place */}
      <div className="flex flex-col items-center relative top-3 sm:top-4 transition-transform hover:-translate-y-2 w-[30%] sm:w-auto">
        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-slate-200 border-[3px] sm:border-4 border-[#9CA3AF] flex items-center justify-center text-lg sm:text-xl md:text-2xl font-black text-slate-500 shadow-lg relative z-10">
          {second.name.charAt(0)}
          <div className="absolute -bottom-2 -right-2 bg-[#9CA3AF] text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-md">
            2nd
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex flex-col items-center bg-card border border-border px-1 sm:px-4 pt-4 sm:pt-5 pb-2 sm:pb-3 rounded-t-lg sm:rounded-t-xl shadow-xs w-full sm:w-32 md:w-40 z-0 -mt-3 sm:-mt-4 relative">
          <p className="text-xs sm:text-sm font-bold text-foreground truncate w-full text-center">{second.name}</p>
          <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wide truncate w-full text-center">{second.level}</span>
          <div className="flex items-center gap-0.5 sm:gap-1 mt-1 sm:mt-2 text-[#9CA3AF] font-black text-xs sm:text-sm">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#9CA3AF]" />
            {second.xp.toLocaleString()}
          </div>
        </div>
        <div className="w-full sm:w-32 md:w-40 h-16 sm:h-24 md:h-32 bg-gradient-to-t from-[#9CA3AF]/20 to-[#9CA3AF]/10 rounded-b-lg sm:rounded-b-xl border border-t-0 border-[#9CA3AF]/30" />
      </div>

      {/* 1st Place */}
      <div className="flex flex-col items-center transition-transform hover:-translate-y-2 z-20 w-[35%] sm:w-auto">
        <div className="relative mb-1 sm:mb-2 animate-bounce">
          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-[#F59E0B] mx-auto absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 drop-shadow-md" />
        </div>
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-amber-100 border-[3px] sm:border-4 border-[#F59E0B] flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-black text-amber-600 shadow-xl relative z-10">
          {first.name.charAt(0)}
          <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-[9px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg border border-amber-300">
            1st
          </div>
        </div>
        <div className="mt-3 sm:mt-4 flex flex-col items-center bg-card border-2 border-[#F59E0B]/30 px-1 sm:px-5 pt-5 sm:pt-6 pb-2 sm:pb-4 rounded-t-lg sm:rounded-t-xl shadow-md w-full sm:w-36 md:w-48 z-0 -mt-4 sm:-mt-5 relative">
          <p className="text-sm sm:text-base font-black text-foreground truncate w-full text-center">{first.name}</p>
          <span className="text-[8px] sm:text-xs text-amber-600 font-semibold uppercase tracking-wide truncate w-full text-center">{first.level}</span>
          <div className="flex items-center gap-0.5 sm:gap-1 mt-1 sm:mt-2 text-[#F59E0B] font-black text-sm sm:text-lg">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 fill-[#F59E0B]" />
            {first.xp.toLocaleString()}
          </div>
        </div>
        <div className="w-full sm:w-36 md:w-48 h-24 sm:h-32 md:h-40 bg-gradient-to-t from-[#F59E0B]/30 to-[#F59E0B]/10 rounded-b-lg sm:rounded-b-xl border-2 border-t-0 border-[#F59E0B]/30 shadow-inner flex items-center justify-center">
            <div className="text-2xl sm:text-4xl font-black text-[#F59E0B]/30">#1</div>
        </div>
      </div>

      {/* 3rd Place */}
      <div className="flex flex-col items-center relative top-6 sm:top-8 transition-transform hover:-translate-y-2 w-[30%] sm:w-auto">
        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-orange-50 border-[3px] sm:border-4 border-[#D97706] flex items-center justify-center text-lg sm:text-xl md:text-2xl font-black text-orange-600 shadow-lg relative z-10">
          {third.name.charAt(0)}
          <div className="absolute -bottom-2 -left-2 bg-[#D97706] text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-md">
            3rd
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex flex-col items-center bg-card border border-border px-1 sm:px-4 pt-4 sm:pt-5 pb-2 sm:pb-3 rounded-t-lg sm:rounded-t-xl shadow-xs w-full sm:w-32 md:w-40 z-0 -mt-3 sm:-mt-4 relative">
          <p className="text-xs sm:text-sm font-bold text-foreground truncate w-full text-center">{third.name}</p>
          <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wide truncate w-full text-center">{third.level}</span>
          <div className="flex items-center gap-0.5 sm:gap-1 mt-1 sm:mt-2 text-[#D97706] font-black text-xs sm:text-sm">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#D97706]" />
            {third.xp.toLocaleString()}
          </div>
        </div>
        <div className="w-full sm:w-32 md:w-40 h-10 sm:h-16 md:h-24 bg-gradient-to-t from-[#D97706]/20 to-[#D97706]/10 rounded-b-lg sm:rounded-b-xl border border-t-0 border-[#D97706]/30" />
      </div>

    </div>
  );
}
