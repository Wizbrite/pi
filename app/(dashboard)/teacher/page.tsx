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
    gradient: "from-violet-500 to-teal-600",
  },
  {
    label: "Questions Created",
    value: "0",
    icon: FileText,
    gradient: "from-violet-500 to-orange-600",
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
    gradient: "from-violet-500 to-violet-600",
  },
];

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const isPending = user?.teacherApprovalStatus === "pending";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Welcome, {user?.name?.split(" ")[0] || "Teacher"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your classes and track student performance
        </p>
      </div>

      {/* Pending Approval Banner */}
      {isPending && (
        <div className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-5 text-violet-900">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
          <div>
            <h3 className="font-semibold text-violet-900">
              Account Pending Approval
            </h3>
            <p className="mt-1 text-sm text-violet-700">
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
              className="rounded-2xl border border-border bg-white p-5 shadow-xs transition-all duration-300 hover:border-violet-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`rounded-xl bg-gradient-to-br ${card.gradient} p-2.5 shadow-sm`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-muted-foreground">
            No activity yet. Create your first class to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
