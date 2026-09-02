"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, Plus, UserPlus, Search, CheckCircle2,
  Clock, Zap, Flame, TrendingUp, BarChart3, Target, ChevronRight, Copy, Loader2
} from "lucide-react";
import { ConnectionRequestModal } from "@/components/parent/connection-request-modal";
import { SetMilestoneModal } from "@/components/parent/set-milestone-modal";

interface ChildData {
  id: string;
  name: string;
  email: string;
  gceLevel: string;
  overallMastery: number;
  stats: {
    totalXp: number;
    currentStreak: number;
    lessonsCompleted: number;
    overallAccuracy: number;
    totalLessons: number;
    examsTaken: number;
  };
  lastActiveAt: string;
  connectedAt: string;
  activeMilestones: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(0, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ChildrenPage() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/parent/connections");
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load");

        const connections = data.connections || [];
        
        // Fetch progress for each accepted connection
        const loadedChildren: ChildData[] = await Promise.all(
          connections
            .filter((c: any) => c.status === "accepted" && c.studentId)
            .map(async (conn: any) => {
              const sId = conn.studentId._id || conn.studentId;
              let progressData: any = {};
              try {
                const pRes = await fetch(`/api/parent-view/${sId}`);
                const pData = await pRes.json();
                if (pData.progress) progressData = pData.progress;
              } catch (e) {
                console.warn("Failed to load progress for student", sId);
              }

              return {
                id: sId,
                name: conn.studentId.fullName || conn.studentId.name || "Student",
                email: conn.studentId.email || "",
                gceLevel: conn.studentId.gceLevel || "Advanced",
                overallMastery: progressData.overall?.overallAccuracy || 0,
                stats: {
                  totalXp: progressData.overall?.totalXp || 0,
                  currentStreak: progressData.overall?.currentStreak || 0,
                  lessonsCompleted: progressData.overall?.totalLessonsCompleted || 0,
                  overallAccuracy: progressData.overall?.overallAccuracy || 0,
                  totalLessons: progressData.overall?.totalLessonsCompleted || 10,
                  examsTaken: progressData.overall?.totalExamsTaken || 0,
                },
                lastActiveAt: new Date().toISOString(), // Mocking last active since not explicitly in progressData
                connectedAt: conn.createdAt || new Date().toISOString(),
                activeMilestones: 0, // Mock for now until we aggregate milestones
              };
            })
        );
        
        setChildren(loadedChildren);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = children.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/parent-view/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendRequest = async (email: string, message?: string) => {
    const res = await fetch("/api/parent/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentEmail: email, message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send request");
  };

  const handleSetMilestone = async (formData: any) => {
    const res = await fetch("/api/parent/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to set milestone");
  };

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Children</h1>
            <p className="mt-1 text-sm text-muted-foreground">{children.length} student{children.length !== 1 ? "s" : ""} linked</p>
          </div>
          <button onClick={() => setShowRequestModal(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Child
          </button>
        </div>

        {errorMsg && <p className="text-sm font-semibold text-red-500">{errorMsg}</p>}

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search children…" className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30" />
            <h3 className="mt-4 text-base font-bold text-foreground">No children linked yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">Send a parent request to start monitoring their progress.</p>
            <button onClick={() => setShowRequestModal(true)} className="mt-5 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90">
              <UserPlus className="h-4 w-4" /> Send First Request
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {filtered.map((child) => {
              const initials = child.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
              const isActiveToday = Date.now() - new Date(child.lastActiveAt).getTime() < 86400000;
              return (
                <div key={child.id} className="rounded-2xl border border-border bg-card shadow-xs transition-all hover:border-violet-300/60 hover:shadow-md">
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-base font-bold text-white shadow-sm">
                        {initials}
                        <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${isActiveToday ? "bg-green-500" : "bg-slate-300"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-foreground">{child.name}</h3>
                        <p className="text-xs text-muted-foreground">{child.email}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-400">{child.gceLevel === "Ordinary" ? "O-Level" : "A-Level"}</span>
                          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${isActiveToday ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isActiveToday ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                            {isActiveToday ? "Active today" : `${timeAgo(child.lastActiveAt)}`}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-2xl font-black ${child.overallMastery >= 80 ? "text-green-600" : child.overallMastery >= 50 ? "text-amber-600" : "text-muted-foreground"}`}>{child.overallMastery}%</p>
                        <p className="text-[10px] text-muted-foreground">Mastery</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Progress</span>
                        <span>{child.stats.lessonsCompleted}/{child.stats.totalLessons} lessons</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-700" style={{ width: `${(child.stats.lessonsCompleted / Math.max(child.stats.totalLessons, 1)) * 100}%` }} />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {[
                        { icon: Zap, val: child.stats.totalXp.toLocaleString(), label: "XP", cls: "text-primary" },
                        { icon: Flame, val: `${child.stats.currentStreak}d`, label: "Streak", cls: "text-orange-500" },
                        { icon: TrendingUp, val: `${child.stats.overallAccuracy}%`, label: "Accuracy", cls: "text-green-500" },
                        { icon: BarChart3, val: child.stats.examsTaken, label: "Exams", cls: "text-blue-500" },
                      ].map(({ icon: Icon, val, label, cls }) => (
                        <div key={label} className="rounded-xl bg-muted/50 p-2 text-center">
                          <Icon className={`mx-auto h-3.5 w-3.5 ${cls}`} />
                          <p className="mt-1 text-xs font-black text-foreground">{val}</p>
                          <p className="text-[9px] text-muted-foreground">{label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Connected {timeAgo(child.connectedAt)}</span>
                      {child.activeMilestones > 0 && (
                        <span className="flex items-center gap-1"><Target className="h-3 w-3" />{child.activeMilestones} milestone{child.activeMilestones !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 border-t border-border">
                    <Link href={`/parent/children/${child.id}`} className="col-span-2 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-primary hover:bg-primary/5">
                      <BarChart3 className="h-3.5 w-3.5" /> View Progress <ChevronRight className="h-3 w-3" />
                    </Link>
                    <button onClick={() => { setSelectedStudentId(child.id); setShowMilestoneModal(true); }} className="flex items-center justify-center border-l border-border py-3 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <Target className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleCopyLink(child.id)} className="flex items-center justify-center border-l border-border py-3 text-muted-foreground hover:bg-muted">
                      {copiedId === child.id ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConnectionRequestModal 
        isOpen={showRequestModal} 
        onClose={() => setShowRequestModal(false)} 
        onSend={handleSendRequest}
      />
      
      <SetMilestoneModal 
        isOpen={showMilestoneModal} 
        onClose={() => { setShowMilestoneModal(false); setSelectedStudentId(undefined); }} 
        students={children.map((c) => ({ id: c.id, name: c.name }))} 
        defaultStudentId={selectedStudentId} 
        onSave={handleSetMilestone}
      />
    </>
  );
}
