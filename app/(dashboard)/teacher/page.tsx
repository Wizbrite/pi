"use client";

import {
  Users,
  FileText,
  BarChart3,
  Clock,
  BookOpen,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const statCards = [
  {
    label: "My Classes",
    value: "0",
    icon: Users,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    label: "Questions Created",
    value: "0",
    icon: FileText,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    label: "Students Tracked",
    value: "0",
    icon: BarChart3,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    label: "Resources Shared",
    value: "0",
    icon: BookOpen,
    gradient: "from-cyan-500 to-blue-600",
  },
];

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const isPending = user?.teacherApprovalStatus === "pending";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Welcome, {user?.name?.split(" ")[0] || "Teacher"} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your classes and track student performance
        </p>
      </div>

      {/* Pending Approval Banner */}
      {isPending && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <h3 className="font-semibold text-amber-300">
              Account Pending Approval
            </h3>
            <p className="mt-1 text-sm text-amber-400/70">
              Your teacher account is awaiting admin verification. You&apos;ll
              have full access once approved. In the meantime, you can explore
              the dashboard.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
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
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-10 w-10 text-slate-700" />
          <p className="mt-3 text-sm text-slate-500">
            No activity yet. Create your first class to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
