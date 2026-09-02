"use client";

import { useState, useEffect } from "react";
import {
  Target, Gift, Zap, Flame, BookOpen, FileText, TrendingUp,
  CheckCircle2, Lock, Loader2, ChevronRight
} from "lucide-react";
import Link from "next/link";

const typeConfig: Record<string, { icon: React.ElementType; label: string; unit: string; color: string; bg: string }> = {
  xp:               { icon: Zap,      label: "XP Earned",         unit: "XP",      color: "text-yellow-500", bg: "bg-yellow-500/10" },
  lessons_completed:{ icon: BookOpen, label: "Lessons Completed",  unit: "lessons", color: "text-blue-500",   bg: "bg-blue-500/10"   },
  streak:           { icon: Flame,    label: "Day Streak",         unit: "days",    color: "text-orange-500", bg: "bg-orange-500/10" },
  accuracy:         { icon: TrendingUp,label: "Overall Accuracy",  unit: "%",       color: "text-green-500",  bg: "bg-green-500/10"  },
  exam_score:       { icon: FileText, label: "Exam Score",         unit: "%",       color: "text-purple-500", bg: "bg-purple-500/10" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export default function StudentMilestonesPage() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/parent/milestones");
        if (res.ok) {
          const data = await res.json();
          setMilestones(data.milestones || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const active = milestones.filter((m) => !m.isUnlocked);
  const unlocked = milestones.filter((m) => m.isUnlocked);

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Milestones</h1>
        <p className="mt-1 text-sm text-muted-foreground">Goals set by your parents — achieve them to unlock rewards!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-xs">
          <Target className="mx-auto h-5 w-5 text-blue-500 mb-2" />
          <p className="text-2xl font-black text-foreground">{milestones.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-xs">
          <Lock className="mx-auto h-5 w-5 text-violet-500 mb-2" />
          <p className="text-2xl font-black text-foreground">{active.length}</p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </div>
        <div className="rounded-2xl border border-amber-200/50 bg-amber-50/50 p-4 text-center shadow-xs dark:border-amber-500/20 dark:bg-amber-500/10">
          <CheckCircle2 className="mx-auto h-5 w-5 text-amber-500 mb-2" />
          <p className="text-2xl font-black text-foreground">{unlocked.length}</p>
          <p className="text-xs text-muted-foreground">Unlocked 🎉</p>
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center">
          <Gift className="h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-base font-bold text-foreground">No milestones yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            Ask your parent to set milestones for you. Once they do, your goals and rewards will appear here!
          </p>
        </div>
      ) : (
        <>
          {/* Active milestones */}
          {active.length > 0 && (
            <section>
              <h2 className="mb-4 text-base font-bold text-foreground">🎯 Goals In Progress</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {active.map((m) => {
                  const cfg = typeConfig[m.type] || typeConfig.xp;
                  const Icon = cfg.icon;
                  const current = m.currentValue ?? 0;
                  const target = m.targetValue ?? 1;
                  const progress = Math.min(100, Math.round((current / target) * 100));
                  const remaining = Math.max(0, target - current);

                  return (
                    <div key={m._id} className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-xl p-2.5 ${cfg.bg}`}>
                            <Icon className={`h-5 w-5 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-foreground">{m.title}</h3>
                            {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-xl font-black text-foreground">{progress}%</span>
                            <p className="text-[10px] text-muted-foreground">done</p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4 space-y-1.5">
                          <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>{current.toLocaleString()} {cfg.unit}</span>
                            <span>Goal: {target.toLocaleString()} {cfg.unit}</span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                progress >= 75 ? "bg-gradient-to-r from-violet-500 to-purple-500"
                                : progress >= 40 ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                                : "bg-gradient-to-r from-slate-400 to-slate-500"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {remaining > 0
                              ? <span className="font-semibold text-foreground">{remaining.toLocaleString()} {cfg.unit}</span>
                              : null}{remaining > 0 ? " more to unlock!" : "Almost there! Keep going 🔥"}
                          </p>
                        </div>

                        {/* Reward */}
                        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
                          <span className="text-2xl">{m.gift?.emoji || "🎁"}</span>
                          <div>
                            <p className="text-xs font-bold text-foreground">{m.gift?.title}</p>
                            {m.gift?.description && <p className="text-[11px] text-muted-foreground">{m.gift.description}</p>}
                          </div>
                          <Lock className="ml-auto h-4 w-4 shrink-0 text-muted-foreground/50" />
                        </div>
                      </div>

                      {/* Motivational footer */}
                      <div className={`px-5 py-2.5 text-center text-[11px] font-semibold ${
                        progress >= 75 ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                        : progress >= 40 ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-muted/50 text-muted-foreground"
                      }`}>
                        {progress >= 75 ? "🚀 So close! Push through!"
                        : progress >= 40 ? "💪 Great progress, keep it up!"
                        : "🌱 Every lesson brings you closer!"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Unlocked milestones */}
          {unlocked.length > 0 && (
            <section>
              <h2 className="mb-4 text-base font-bold text-foreground">🎉 Achievements Unlocked</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {unlocked.map((m) => (
                  <div key={m._id} className="relative rounded-2xl border border-amber-300/50 bg-card shadow-xs ring-1 ring-amber-300/30 overflow-hidden">
                    <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-400 py-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white">Milestone Achieved!</span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{m.gift?.emoji || "🎁"}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-foreground">{m.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Achieved {m.unlockedAt ? timeAgo(m.unlockedAt) : ""}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 rounded-xl bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 p-3">
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-300">🎁 Your Reward</p>
                        <p className="text-sm font-bold text-foreground mt-1">{m.gift?.title}</p>
                        {m.gift?.description && <p className="text-xs text-muted-foreground">{m.gift.description}</p>}
                        {m.gift?.couponCode && (
                          <div className="mt-2 rounded-lg bg-white dark:bg-muted border border-border px-3 py-1.5 font-mono text-sm font-bold tracking-widest text-primary">
                            {m.gift.couponCode}
                          </div>
                        )}
                        {m.gift?.externalLink && (
                          <a href={m.gift.externalLink} target="_blank" rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                            Redeem reward <ChevronRight className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Link to notifications */}
      <div className="rounded-2xl border border-border bg-muted/30 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Stay updated</p>
          <p className="text-xs text-muted-foreground">You'll be notified when a milestone is unlocked or a new goal is set.</p>
        </div>
        <Link href="/student/notifications" className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          Notifications <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
