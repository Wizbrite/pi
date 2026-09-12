"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, BarChart3, Bell, Plus, Target, Gift,
  ChevronRight, UserPlus, CheckCircle2, Clock, Zap,
  Flame, TrendingUp, Shield, Send, ExternalLink, Loader2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { ConnectionRequestModal } from "@/components/parent/connection-request-modal";
import { SetMilestoneModal } from "@/components/parent/set-milestone-modal";

function StatCard({
  icon: Icon, label, value, sublabel, gradient, href,
}: {
  icon: React.ElementType; label: string; value: string | number;
  sublabel?: string; gradient: string; href?: string;
}) {
  const content = (
    <div className="group rounded-2xl border border-border bg-card p-4 shadow-xs transition-all duration-300 hover:border-violet-300/60 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{value}</p>
          {sublabel && <p className="mt-0.5 text-[11px] text-muted-foreground">{sublabel}</p>}
        </div>
        <div className={`rounded-xl bg-gradient-to-br ${gradient} p-2.5 shadow-sm shrink-0`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [connRes, mileRes, notifRes] = await Promise.all([
        fetch("/api/parent/connections"),
        fetch("/api/parent/milestones"),
        fetch("/api/notifications"),
      ]);

      let connectionsData: any = { connections: [], pending: [] };
      if (connRes.ok) connectionsData = await connRes.json();
      let milestonesData: any = { milestones: [] };
      if (mileRes.ok) milestonesData = await mileRes.json();
      let notificationsData: any = { notifications: [] };
      if (notifRes.ok) notificationsData = await notifRes.json();

      const acceptedConnections = connectionsData.connections?.filter(
        (c: any) => c.status === "accepted" && c.studentId
      ) || [];

      const loadedChildren = await Promise.all(
        acceptedConnections.map(async (conn: any) => {
          const sId = conn.studentId._id || conn.studentId;
          let progressData: any = {};
          try {
            const pRes = await fetch(`/api/parent-view/${sId}`);
            if (pRes.ok) {
              const pData = await pRes.json();
              if (pData.progress) progressData = pData.progress;
            }
          } catch (e) { console.error(e); }
          return {
            id: sId,
            name: conn.studentId.fullName || conn.studentId.name || "Student",
            email: conn.studentId.email || "",
            gceLevel: conn.studentId.gceLevel || "Ordinary",
            overallMastery: progressData.overall?.overallAccuracy || 0,
            stats: {
              totalXp: progressData.overall?.totalXp || 0,
              currentStreak: progressData.overall?.currentStreak || 0,
              overallAccuracy: progressData.overall?.overallAccuracy || 0,
            },
            lastActiveAt: new Date().toISOString(),
          };
        })
      );

      setChildren(loadedChildren);
      setPendingRequests(
        (connectionsData.connections || [])
          .filter((c: any) => c.status === "pending")
          .map((c: any) => ({
            id: c._id,
            studentName: c.studentId?.fullName || c.studentId?.name || "Student",
            studentEmail: c.studentId?.email || "",
          }))
      );
      setMilestones(milestonesData.milestones || []);
      setNotifications(notificationsData.notifications || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSendRequest = async (email: string, message?: string) => {
    const res = await fetch("/api/parent/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentEmail: email, message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send request");
    await loadData();
  };

  const handleSetMilestone = async (formData: any) => {
    const res = await fetch("/api/parent/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to set milestone");
    await loadData();
  };

  function timeAgo(dateStr: string): string {
    if (!dateStr) return "just now";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${Math.max(0, mins)}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const firstName = user?.name?.split(" ")[0] || "Parent";
  const totalUnlocked = milestones.filter((m) => m.isUnlocked).length;
  const activeMilestones = milestones.filter((m) => !m.isUnlocked);

  if (loading && children.length === 0) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <div className="space-y-6 pb-12">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Welcome, {firstName} 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor your children's learning progress and set milestone rewards.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              <Plus className="h-4 w-4" /> Add Child
            </button>
           
          </div>
        </div>

        {/* ── Stats Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={Users} label="Children Linked" value={children.length} sublabel="Active connections" gradient="from-violet-500 to-purple-600" href="/parent/children" />
          <StatCard icon={Target} label="Active Milestones" value={activeMilestones.length} sublabel="Goals in progress" gradient="from-blue-500 to-cyan-600" href="/parent/milestones" />
          <StatCard icon={Gift} label="Gifts Unlocked" value={totalUnlocked} sublabel={`of ${milestones.length} total`} gradient="from-amber-500 to-orange-500" href="/parent/milestones" />
          <StatCard icon={Bell} label="Pending Requests" value={pendingRequests.length} sublabel="Awaiting response" gradient="from-rose-500 to-pink-600" href="/parent/requests" />
        </div>

        {/* ── Children Overview ───────────────────────────────────────── */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground sm:text-lg">Children's Overview</h2>
            <Link href="/parent/children" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {children.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center sm:py-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted sm:h-16 sm:w-16">
                <Users className="h-7 w-7 text-muted-foreground/40 sm:h-8 sm:w-8" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-foreground sm:text-base">No children linked yet</h3>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                Send a parent request to your child's student account to start monitoring their progress.
              </p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90"
              >
                <UserPlus className="h-4 w-4" /> Send First Request
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {children.map((child) => {
                const initials = child.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                const isRecentlyActive = child.lastActiveAt && Date.now() - new Date(child.lastActiveAt).getTime() < 86400000;
                return (
                  <div key={child.id} className="rounded-2xl border border-border bg-card shadow-xs transition-all hover:border-violet-300/60 hover:shadow-md">
                    <div className="p-4 sm:p-5">
                      {/* Child header */}
                      <div className="flex items-start gap-3">
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white sm:h-12 sm:w-12">
                          {initials}
                          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${isRecentlyActive ? "bg-green-500" : "bg-slate-300"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{child.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{child.email}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-400">
                              {child.gceLevel === "Ordinary" ? "O-Level" : "A-Level"}
                            </span>
                            <span className={`flex items-center gap-0.5 text-[10px] font-medium ${isRecentlyActive ? "text-green-600" : "text-muted-foreground"}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isRecentlyActive ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                              {isRecentlyActive ? "Active today" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xl font-black text-foreground">{child.overallMastery}%</p>
                          <p className="text-[10px] text-muted-foreground">Mastery</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-700" style={{ width: `${child.overallMastery}%` }} />
                      </div>

                      {/* Mini stats */}
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="rounded-lg bg-muted/50 p-2 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <Zap className="h-3 w-3 text-primary" />
                            <span className="text-xs font-black text-foreground">{child.stats.totalXp}</span>
                          </div>
                          <p className="text-[9px] text-muted-foreground">XP</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span className="text-xs font-black text-foreground">{child.stats.currentStreak}d</span>
                          </div>
                          <p className="text-[9px] text-muted-foreground">Streak</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-black text-foreground">{child.stats.overallAccuracy}%</span>
                          </div>
                          <p className="text-[9px] text-muted-foreground">Accuracy</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions — wrap on very small screens */}
                    <div className="flex border-t border-border">
                      <Link href={`/parent/children/${child.id}`} className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/5">
                        <BarChart3 className="h-3.5 w-3.5" /> View Progress
                      </Link>
                      <button
                        onClick={() => setShowMilestoneModal(true)}
                        className="flex items-center justify-center gap-1.5 border-l border-border px-4 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Target className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const link = `${window.location.origin}/parent-view/${child.id}`;
                          navigator.clipboard.writeText(link);
                        }}
                        className="flex items-center justify-center gap-1.5 border-l border-border px-4 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Bottom two-column section ────────────────────────────────── */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Active Milestones */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground sm:text-base">Active Milestones</h2>
              <Link href="/parent/milestones" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                Manage <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {activeMilestones.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Target className="h-8 w-8 text-muted-foreground/30" />
                <p className="mt-2 text-xs text-muted-foreground">No active milestones. Set one to motivate your child!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeMilestones.slice(0, 3).map((m: any) => {
                  const progress = Math.min(100, Math.round((m.currentValue / m.targetValue) * 100));
                  return (
                    <div key={m._id} className="rounded-xl border border-border bg-muted/30 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{m.title}</p>
                          <p className="text-[10px] text-muted-foreground">{m.studentId?.fullName || m.studentId?.name || "Student"}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-lg">{m.gift?.emoji || "🎁"}</span>
                          <span className="text-xs font-bold text-foreground">{progress}%</span>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-700" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">{(m.currentValue ?? 0).toLocaleString()} / {(m.targetValue ?? 0).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending + Activity */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground sm:text-base">Pending Requests</h2>
                <Link href="/parent/requests" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  View all <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {pendingRequests.length === 0 ? (
                <p className="text-xs text-muted-foreground">No pending requests.</p>
              ) : (
                <div className="space-y-2">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="flex items-center gap-3 rounded-xl border border-amber-200/50 bg-amber-50/50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                        <Send className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">{req.studentName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{req.studentEmail}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">Pending</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
              <h2 className="mb-3 text-sm font-bold text-foreground sm:text-base">Recent Activity</h2>
              {notifications.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recent activity.</p>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 5).map((n) => (
                    <div key={n._id} className="flex items-start gap-3">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${n.type === "alert" || n.type === "request_rejected" ? "bg-red-500/10" : "bg-green-500/10"}`}>
                        {n.type === "alert" || n.type === "request_rejected"
                          ? <Clock className="h-3.5 w-3.5 text-red-500" />
                          : <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ───────────────────────────────────────────── */}
        <div>
          <h2 className="mb-3 text-base font-bold text-foreground sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button onClick={() => setShowRequestModal(true)} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-xs transition-all hover:border-violet-300/60 hover:shadow-md sm:p-4">
              <div className="rounded-xl bg-violet-500/10 p-2 sm:p-2.5"><UserPlus className="h-4 w-4 text-violet-500 sm:h-5 sm:w-5" /></div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground sm:text-sm">Add Child</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">Send a request</p>
              </div>
            </button>
            <button onClick={() => setShowMilestoneModal(true)} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-xs transition-all hover:border-blue-300/60 hover:shadow-md sm:p-4">
              <div className="rounded-xl bg-blue-500/10 p-2 sm:p-2.5"><Target className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" /></div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground sm:text-sm">Set Milestone</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">Create a goal + gift</p>
              </div>
            </button>
            <Link href="/parent/children" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs transition-all hover:border-green-300/60 hover:shadow-md sm:p-4">
              <div className="rounded-xl bg-green-500/10 p-2 sm:p-2.5"><BarChart3 className="h-4 w-4 text-green-500 sm:h-5 sm:w-5" /></div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground sm:text-sm">View Progress</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">Detailed reports</p>
              </div>
            </Link>
            <Link href="/parent/requests" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs transition-all hover:border-amber-300/60 hover:shadow-md sm:p-4">
              <div className="rounded-xl bg-amber-500/10 p-2 sm:p-2.5"><Shield className="h-4 w-4 text-amber-500 sm:h-5 sm:w-5" /></div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground sm:text-sm">Manage Requests</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">Sent &amp; received</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <ConnectionRequestModal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} onSend={handleSendRequest} />
      <SetMilestoneModal isOpen={showMilestoneModal} onClose={() => setShowMilestoneModal(false)} students={children.map((c) => ({ id: c.id, name: c.name }))} onSave={handleSetMilestone} />
    </>
  );
}
