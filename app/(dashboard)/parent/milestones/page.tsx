"use client";

import { useState } from "react";
import { Plus, Target, Filter, Search, CheckCircle2, Lock } from "lucide-react";
import { MilestoneCard, type Milestone } from "@/components/parent/milestone-card";
import { SetMilestoneModal } from "@/components/parent/set-milestone-modal";

const MOCK_STUDENTS = [
  { id: "student_1", name: "Favour Nkemdirim" },
  { id: "student_2", name: "Emmanuel Asante" },
];

const MOCK_MILESTONES: Milestone[] = [
  {
    id: "m1",
    studentId: "student_1",
    studentName: "Favour Nkemdirim",
    title: "Complete 15 Lessons",
    description: "Keep going! You're almost there.",
    type: "lessons_completed",
    targetValue: 15,
    currentValue: 12,
    isUnlocked: false,
    gift: { emoji: "🎮", title: "Gaming Voucher ($20)", description: "Any game on Steam", couponCode: "STEAM-XYZ-2025" },
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "m2",
    studentId: "student_2",
    studentName: "Emmanuel Asante",
    title: "Reach 1000 XP",
    type: "xp",
    targetValue: 1000,
    currentValue: 650,
    isUnlocked: false,
    gift: { emoji: "📱", title: "Airtime Top-up (500 FCFA)", description: "MTN airtime credit" },
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "m3",
    studentId: "student_1",
    studentName: "Favour Nkemdirim",
    title: "Maintain 7-Day Streak",
    type: "streak",
    targetValue: 7,
    currentValue: 7,
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    gift: { emoji: "🍕", title: "Pizza Night!", description: "One large pizza of your choice", externalLink: "https://dominos.com" },
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

type FilterType = "all" | "active" | "unlocked";

export default function MilestonesPage() {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_MILESTONES.filter((m) => {
    if (filter === "active" && m.isUnlocked) return false;
    if (filter === "unlocked" && !m.isUnlocked) return false;
    if (studentFilter !== "all" && m.studentId !== studentFilter) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.studentName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount = MOCK_MILESTONES.filter((m) => !m.isUnlocked).length;
  const unlockedCount = MOCK_MILESTONES.filter((m) => m.isUnlocked).length;

  return (
    <>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Milestones & Gifts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Set goals and lock rewards for your children
            </p>
          </div>
          <button
            id="new-milestone-btn"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> New Milestone
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-xs">
            <Target className="mx-auto h-5 w-5 text-blue-500 mb-2" />
            <p className="text-2xl font-black text-foreground">{MOCK_MILESTONES.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-xs">
            <Lock className="mx-auto h-5 w-5 text-violet-500 mb-2" />
            <p className="text-2xl font-black text-foreground">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="rounded-2xl border border-amber-200/50 bg-amber-50/50 p-4 text-center shadow-xs dark:border-amber-500/20 dark:bg-amber-500/10">
            <CheckCircle2 className="mx-auto h-5 w-5 text-amber-500 mb-2" />
            <p className="text-2xl font-black text-foreground">{unlockedCount}</p>
            <p className="text-xs text-muted-foreground">Unlocked 🎉</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search milestones…" className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex gap-2">
            {(["all", "active", "unlocked"] as FilterType[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all capitalize ${filter === f ? "bg-primary text-white" : "border border-border bg-card text-muted-foreground hover:text-foreground"}`}>
                {f}
              </button>
            ))}
          </div>
          <select value={studentFilter} onChange={(e) => setStudentFilter(e.target.value)} className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="all">All Children</option>
            {MOCK_STUDENTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 py-14 text-center">
            <Target className="h-10 w-10 text-muted-foreground/30" />
            <h3 className="mt-4 text-base font-bold text-foreground">No milestones found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Create your first milestone to motivate your child.</p>
            <button onClick={() => setShowModal(true)} className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Create Milestone
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((m) => <MilestoneCard key={m.id} milestone={m} />)}
          </div>
        )}
      </div>

      <SetMilestoneModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        students={MOCK_STUDENTS}
      />
    </>
  );
}
