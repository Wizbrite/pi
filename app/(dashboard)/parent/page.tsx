"use client";

import { Users, BarChart3, Clock, Bell } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const statCards = [
  {
    label: "Children Linked",
    value: "0",
    icon: Users,
    gradient: "from-violet-500 to-teal-600",
  },
  {
    label: "Weekly Reports",
    value: "0",
    icon: BarChart3,
    gradient: "from-violet-500 to-orange-600",
  },
  {
    label: "Notifications",
    value: "0",
    icon: Bell,
    gradient: "from-violet-500 to-purple-600",
  },
];

export default function ParentDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Welcome, {user?.name?.split(" ")[0] || "Parent"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor your children&apos;s learning progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:border-violet-300 hover:shadow-md"
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

      {/* Children Overview */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <h2 className="text-lg font-semibold text-foreground">
          Children&apos;s Progress
        </h2>
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-muted-foreground">
            No children linked yet. Link your child&apos;s account to start
            tracking their progress.
          </p>
        </div>
      </div>
    </div>
  );
}
