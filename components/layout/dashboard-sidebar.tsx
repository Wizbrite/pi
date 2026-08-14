"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  BookOpen,
  BarChart3,
  Users,
  Settings,
  LogOut,
  GraduationCap,
  FileText,
  UserCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  User2,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/shared/logo";
import { useAuthStore, type UserRole } from "@/stores/auth-store";
import { HeaderStats } from "../student/header-stat";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const roleNavItems: Record<UserRole, NavItem[]> = {
  student: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "My Courses", href: "/student/courses", icon: BookOpen },
    { label: "Mock Exams", href: "/student/exams", icon: FileText },
    { label: "Progress", href: "/student/progress", icon: BarChart3 },
    { label: "Leaderboard", href: "/student/leaderboard", icon: Trophy },
    { label: "Profile", href: "/student/profile", icon: User },
  ],
  teacher: [
    { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { label: "My Classes", href: "/teacher/classes", icon: Users },
    { label: "Questions", href: "/teacher/questions", icon: FileText },
    { label: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
    { label: "Profile", href: "/teacher/profile", icon: User },
  ],
  parent: [
    { label: "Dashboard", href: "/parent", icon: LayoutDashboard },
    { label: "Children", href: "/parent/children", icon: UserCheck },
    { label: "Reports", href: "/parent/reports", icon: BarChart3 },
    { label: "Profile", href: "/parent/profile", icon: User },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Platform", href: "/admin/platform", icon: ShieldCheck },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Profile", href: "/admin/profile", icon: User },
  ],
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role || "student";
  const navItems = roleNavItems[role];

  return (
    <aside
      className={`flex h-full flex-col border-r border-border bg-card transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-64"
      }`}
    >
      {/* Logo & Collapse Toggle */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && <Logo size="sm" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${
            collapsed ? "mx-auto" : ""
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Progress / Stats Card - Completely Hidden When Collapsed */}
      {!collapsed && role === "student" && (
        <div className="p-3">
          <div className="bg-muted/50 border border-border rounded-lg p-3 overflow-hidden">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 truncate">
              Current Progress
            </p>
            <HeaderStats xp={150} streakDays={3} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-border p-3">
        {!collapsed && user && (
          <div className="mb-3 rounded-xl bg-muted/50 p-3 border border-border">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
              <GraduationCap className="h-3 w-3" />
              {role}
            </span>
          </div>
        )}
        <button
          onClick={logout}
          title={collapsed ? "Log out" : undefined}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;