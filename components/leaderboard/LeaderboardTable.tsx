import React from "react";
import { StudentRank } from "@/lib/leaderboard-data";
import { Zap, Medal } from "lucide-react";

interface LeaderboardTableProps {
  students: StudentRank[]; // Should be rank 4 and beyond
  currentUserId?: string;
  allStudents: StudentRank[]; // Needed to find the current user if they aren't in the filtered top list
}

export function LeaderboardTable({ students, currentUserId, allStudents }: LeaderboardTableProps) {
  
  // Find current user's rank
  const currentUserObj = allStudents.find(s => s.name === "Njini Favour" || s.id === currentUserId);
  const isCurrentUserInVisibleList = students.some(s => s.id === currentUserObj?.id);
  const isCurrentUserInTop3 = currentUserObj && currentUserObj.rank <= 3;

  const showStickyBanner = currentUserObj && !isCurrentUserInVisibleList && !isCurrentUserInTop3;

  const renderRow = (student: StudentRank, isSticky: boolean = false) => {
    const isMe = student.id === currentUserObj?.id;

    return (
      <div 
        key={isSticky ? `sticky-${student.id}` : student.id}
        className={`flex items-center justify-between p-4 mb-2 rounded-2xl border transition-all ${
          isMe
            ? "bg-primary/10 border-primary/30 shadow-sm"
            : "bg-card border-border hover:bg-muted/50"
        } ${isSticky ? "shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.1)] rounded-b-none border-b-0 absolute bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md pb-safe" : ""}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-8 text-center font-black ${isMe ? "text-primary" : "text-muted-foreground"}`}>
            #{student.rank}
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-background flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
            {student.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-bold ${isMe ? "text-primary" : "text-foreground"}`}>
              {student.name} {isMe && "(You)"}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {student.level} {student.badges.length > 0 && `• ${student.badges[0]}`}
            </span>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 font-black text-sm ${isMe ? "text-primary" : "text-foreground"}`}>
          <Zap className={`w-4 h-4 ${isMe ? "fill-primary text-primary" : "fill-amber-500 text-amber-500"}`} />
          {student.xp.toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div className="relative pb-20">
      <div className="flex flex-col">
        {students.length > 0 ? (
          students.map(student => renderRow(student))
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-2xl">
            No students found matching your criteria.
          </div>
        )}
      </div>

      {showStickyBanner && currentUserObj && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-40">
          <div className="md:max-w-4xl mx-auto">
             {renderRow(currentUserObj, true)}
          </div>
        </div>
      )}
    </div>
  );
}
