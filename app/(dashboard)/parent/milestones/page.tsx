"use client";

import { useState, useEffect } from "react";
import { Plus, Target, Search, CheckCircle2, Lock, Loader2 } from "lucide-react";
import { MilestoneCard, type Milestone } from "@/components/parent/milestone-card";
import { SetMilestoneModal } from "@/components/parent/set-milestone-modal";

type FilterType = "all" | "active" | "unlocked";

export default function MilestonesPage() {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [mileRes, connRes] = await Promise.all([
        fetch("/api/parent/milestones"),
        fetch("/api/parent/connections"),
      ]);

      if (mileRes.ok) {
        const mileData = await mileRes.json();
        // Normalize API shape → MilestoneCard's Milestone type
        const normalized: Milestone[] = (mileData.milestones || []).map((m: any) => ({
          id: m._id,
          studentId: m.studentId?._id || m.studentId || "",
          studentName: m.studentId?.fullName || m.studentId?.name || "Student",
          title: m.title,
          description: m.description,
          type: m.type,
          targetValue: m.targetValue,
          currentValue: m.currentValue || 0,
          isUnlocked: m.isUnlocked || false,
          unlockedAt: m.unlockedAt,
          gift: m.gift,
          createdAt: m.createdAt,
        }));
        setMilestones(normalized);
      }

      if (connRes.ok) {
        const connData = await connRes.json();
        const accepted = (connData.connections || []).filter(
          (c: any) => c.status === "accepted" && c.studentId
        );
        setStudents(
          accepted.map((c: any) => ({
            id: c.studentId._id || c.studentId,
            name: c.studentId.fullName || c.studentId.name || "Student",
          }))
        );
      }
    } catch (e) {
      console.error("Failed to load milestones", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSetMilestone = async (formData: any) => {
    const res = await fetch("/api/parent/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create milestone");
    await loadData(); // Refresh list
  };

  const filtered = milestones.filter((m) => {
    if (filter === "active" && m.isUnlocked) return false;
    if (filter === "unlocked" && !m.isUnlocked) return false;
    if (studentFilter !== "all" && m.studentId !== studentFilter) return false;
    if (
      search &&
      !m.title.toLowerCase().includes(search.toLowerCase()) &&
      !m.studentName.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const activeCount = milestones.filter((m) => !m.isUnlocked).length;
  const unlockedCount = milestones.filter((m) => m.isUnlocked).length;

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Milestones &amp; Gifts
            </h1>
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
            <p className="text-2xl font-black text-foreground">{milestones.length}</p>
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
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search milestones…"
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "active", "unlocked"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all capitalize ${
                  filter === f
                    ? "bg-primary text-white"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Children</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 py-14 text-center">
            <Target className="h-10 w-10 text-muted-foreground/30" />
            <h3 className="mt-4 text-base font-bold text-foreground">
              {milestones.length === 0
                ? "No milestones yet"
                : "No milestones match your filters"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {milestones.length === 0
                ? "Create your first milestone to motivate your child."
                : "Try adjusting your search or filters."}
            </p>
            {milestones.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Create Milestone
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((m) => (
              <MilestoneCard key={m.id} milestone={m} />
            ))}
          </div>
        )}
      </div>

      <SetMilestoneModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        students={students}
        onSave={handleSetMilestone}
      />
    </>
  );
}
