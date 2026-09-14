"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { StudentRank } from "@/lib/leaderboard-data";
import { Trophy, Award, Loader2 } from "lucide-react";
import { LeaderboardPodium } from "../../../../components/leaderboard/LeaderboardPodium";
import {
  LeaderboardFilters,
  Timeframe,
  RankingType,
} from "../../../../components/leaderboard/LeaderboardFilters";
import { LeaderboardTable } from "../../../../components/leaderboard/LeaderboardTable";

export default function LeaderboardPage() {
  const { user } = useAuthStore();

  // States for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("All Time");
  const [rankingType, setRankingType] = useState<RankingType>("Global");

  // State for dynamic API data
  const [leaderboard, setLeaderboard] = useState<StudentRank[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<StudentRank | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch real leaderboard data from database API
  useEffect(() => {
    let isMounted = true;
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/student/leaderboard?timeframe=${encodeURIComponent(
            timeframe
          )}&subject=${encodeURIComponent(rankingType)}`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setLeaderboard(json.data.leaderboard || []);
            setCurrentUserRank(json.data.currentUserRank || null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLeaderboard();
    return () => {
      isMounted = false;
    };
  }, [timeframe, rankingType]);

  const filteredData = useMemo(() => {
    let data = [...leaderboard];

    if (searchQuery) {
      data = data.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return data;
  }, [leaderboard, searchQuery]);

  // Split into Top 3 and Rest
  const topThree = filteredData.slice(0, 3);
  const theRest = filteredData.slice(3);

  // Get current user stats for the header widget
  const currentUserObj = useMemo(() => {
    if (currentUserRank) return currentUserRank;
    if (user?.name) {
      const matched = leaderboard.find(
        (s) => s.name.toLowerCase() === user.name.toLowerCase()
      );
      if (matched) return matched;
    }
    return leaderboard[0] || null;
  }, [currentUserRank, user, leaderboard]);

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3">
          <Trophy className="w-8 h-8 text-violet-500" />
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          See where you stand among your peers! Climb the ranks by completing
          lessons and scoring high on Exams.
        </p>
      </div>

      {/* Current User Snapshot Widget */}
      <div className="bg-violet-600 dark:bg-[#131834] dark:border dark:border-white/10 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-2xl font-black shadow-inner">
            {currentUserObj?.name
              ? currentUserObj.name.charAt(0)
              : user?.name
              ? user.name.charAt(0)
              : "U"}
          </div>
          <div>
            <p className="text-xs text-violet-200 font-bold uppercase tracking-wider">
              Your Standing
            </p>
            <p className="text-xl font-black">
              {currentUserObj?.name || user?.name || "Student"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold backdrop-blur-sm">
                Rank: #{currentUserObj?.rank || "-"}
              </span>
              <span className="bg-violet-500/80 px-2 py-0.5 rounded text-xs font-semibold backdrop-blur-sm flex items-center gap-1">
                <Award className="w-3 h-3" />{" "}
                {currentUserObj?.badges[0] || "Novice"}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm w-full sm:w-auto text-center sm:text-right">
          <p className="text-xs text-violet-200 font-bold uppercase tracking-wider mb-0.5">
            Total XP
          </p>
          <p className="text-3xl font-black tracking-tighter text-white">
            {currentUserObj?.xp != null
              ? currentUserObj.xp.toLocaleString()
              : 0}
          </p>
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

      {/* Loading state indicator */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500 mb-2" />
          <p className="text-sm font-medium">Updating live rankings...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-16 px-4 bg-card border border-border rounded-2xl shadow-xs">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No Students on the Leaderboard Yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Complete lessons and take Exams to earn XP points and claim the #1 spot!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {!searchQuery && topThree.length >= 3 && (
            <LeaderboardPodium topThree={topThree} />
          )}

          {/* Main Table */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-foreground mb-4 pl-2 border-l-4 border-primary">
              Rankings
            </h3>
            <LeaderboardTable
              students={searchQuery ? filteredData : (topThree.length >= 3 ? theRest : filteredData)}
              currentUserId={currentUserObj?.id}
              allStudents={leaderboard}
            />
          </div>
        </>
      )}
    </div>
  );
}
