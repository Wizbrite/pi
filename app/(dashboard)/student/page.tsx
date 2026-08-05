"use client";

import {
  BookOpen,
  FileText,
  BarChart3,
  Clock,
  TrendingUp,
  Target,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const statCards = [
  {
    label: "Subjects Enrolled",
    value: "—",
    icon: BookOpen,
    gradient: "from-emerald-500 to-teal-600",
    change: "Start by adding subjects",
  },
  {
    label: "Mock Exams Taken",
    value: "0",
    icon: FileText,
    gradient: "from-amber-500 to-orange-600",
    change: "Take your first mock",
  },
  {
    label: "Average Score",
    value: "—",
    icon: TrendingUp,
    gradient: "from-violet-500 to-purple-600",
    change: "No data yet",
  },
  {
    label: "Study Streak",
    value: "0 days",
    icon: Target,
    gradient: "from-rose-500 to-pink-600",
    change: "Start studying today",
  },
];

export default function StudentDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Welcome back, {user?.name?.split(" ")[0] || "Student"} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {user?.gceLevel === "Advanced" ? "A Level" : "O Level"} •{" "}
          Here&apos;s your learning overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`rounded-xl bg-gradient-to-br ${card.gradient} p-2.5 shadow-lg`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-3">
              <BookOpen className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Browse Subjects</h3>
              <p className="text-xs text-slate-500">
                Explore GCE subjects and start studying
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-3">
              <FileText className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Start Mock Exam</h3>
              <p className="text-xs text-slate-500">
                Practice with timed GCE-style questions
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/10 p-3">
              <BarChart3 className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">View Progress</h3>
              <p className="text-xs text-slate-500">
                Track your improvement over time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity placeholder */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-10 w-10 text-slate-700" />
          <p className="mt-3 text-sm text-slate-500">
            No activity yet. Start studying to see your progress here.
          </p>
        </div>
      </div>
    </div>
  );
}
