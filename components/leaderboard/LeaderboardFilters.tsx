"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export type Timeframe = "This Week" | "This Month" | "All Time";
export type RankingType = "Global" | "Mathematics" | "Physics" | "Biology";

interface LeaderboardFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  rankingType: RankingType;
  setRankingType: (rt: RankingType) => void;
}

export function LeaderboardFilters({
  searchQuery,
  setSearchQuery,
  timeframe,
  setTimeframe,
  rankingType,
  setRankingType,
}: LeaderboardFiltersProps) {
  
  const timeframes: Timeframe[] = ["This Week", "This Month", "All Time"];
  const rankingTypes: RankingType[] = ["Global", "Mathematics", "Physics", "Biology"];

  return (
    <div className="flex flex-col gap-4 mt-6 mb-8 w-full">
      {/* Top Row: Search and Timeframe */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Find a student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-card border-border"
          />
        </div>

        {/* Timeframe Tabs */}
        <div className="flex items-center bg-muted p-1 rounded-xl w-full sm:w-auto">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tf
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Row: Subject Ranking Types */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {rankingTypes.map((rt) => (
          <button
            key={rt}
            onClick={() => setRankingType(rt)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap ${
              rankingType === rt
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {rt}
          </button>
        ))}
      </div>
    </div>
  );
}
