"use client";

import React, { useState, useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { MOCK_LEADERBOARD } from "@/lib/leaderboard-data";
import { Trophy, Award } from "lucide-react";
import { LeaderboardPodium } from "../../../../components/leaderboard/LeaderboardPodium";
import { LeaderboardFilters, Timeframe, RankingType } from "../../../../components/leaderboard/LeaderboardFilters";
import { LeaderboardTable } from "../../../../components/leaderboard/LeaderboardTable";

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  
  // States for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("This Week");
  const [rankingType, setRankingType] = useState<RankingType>("Global");

  // In a real app, you would fetch data here based on timeframe and rankingType.
  // We'll use the mock data and just simulate filtering/sorting.

  const filteredData = useMemo(() => {
    let data = [...MOCK_LEADERBOARD];

    // Simulate Subject Filtering (In mock data, we just randomize a bit or filter out some so the UI reacts)
    if (rankingType !== "Global") {
      // Dummy logic: just show half the students to simulate a different subject ranking
      data = data.filter((_, idx) => idx % 2 === 0);
      
      // Re-rank them based on the new array order to keep ranks sequential 1,2,3...
      data = data.map((student, idx) => ({ ...student, rank: idx + 1 }));
    }

    // Search filter
    if (searchQuery) {
      data = data.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return data;
  }, [searchQuery, rankingType, timeframe]);

  // Split into Top 3 and Rest
  const topThree = filteredData.slice(0, 3);
  const theRest = filteredData.slice(3);

  // Get current user stats for the header widget
  const currentUserObj = MOCK_LEADERBOARD.find(s => s.name === "Njini Favour") || MOCK_LEADERBOARD[5];

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3">
          <Trophy className="w-8 h-8 text-[#F59E0B]" />
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          See where you stand among your peers! Climb the ranks by completing lessons and scoring high on mock exams.
        </p>
      </div>

      {/* Current User Snapshot Widget */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4 w-full sm:w-auto">
           <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-2xl font-black shadow-inner">
             {currentUserObj?.name.charAt(0)}
           </div>
           <div>
             <p className="text-xs text-blue-200 font-bold uppercase tracking-wider">Your Standing</p>
             <p className="text-xl font-black">{currentUserObj?.name}</p>
             <div className="flex items-center gap-2 mt-1">
               <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold backdrop-blur-sm">
                 Global Rank: #{currentUserObj?.rank}
               </span>
               <span className="bg-[#F59E0B]/80 px-2 py-0.5 rounded text-xs font-semibold backdrop-blur-sm flex items-center gap-1">
                 <Award className="w-3 h-3" /> {currentUserObj?.badges[0] || "Novice"}
               </span>
             </div>
           </div>
        </div>
        <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm w-full sm:w-auto text-center sm:text-right">
          <p className="text-xs text-blue-200 font-bold uppercase tracking-wider mb-0.5">Total XP</p>
          <p className="text-3xl font-black tracking-tighter text-white">{currentUserObj?.xp.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <LeaderboardFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        rankingType={rankingType}
        setRankingType={setRankingType}
      />

      {/* Top 3 Podium */}
      {/* Hide podium if searching, since rank numbers won't make sense if filtered */}
      {!searchQuery && <LeaderboardPodium topThree={topThree} />}

      {/* Main Table */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-foreground mb-4 pl-2 border-l-4 border-primary">
          Rankings
        </h3>
        <LeaderboardTable 
          students={searchQuery ? filteredData : theRest} 
          currentUserId={currentUserObj?.id}
          allStudents={MOCK_LEADERBOARD} 
        />
      </div>

    </div>
  );
}
