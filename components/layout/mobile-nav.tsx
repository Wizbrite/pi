"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  BarChart3,
  User,
  Users,
  UserCheck,
  ShieldCheck,
  Target,
  Trophy,
} from "lucide-react";
import { useAuthStore, type UserRole } from "@/stores/auth-store";
import { HeaderStats } from "../student/header-stat"; // Named import matching your component export

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const roleNavItems: Record<UserRole, NavItem[]> = {
  student: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "Courses", href: "/student/courses", icon: BookOpen },
    { label: "Exams", href: "/student/exams", icon: FileText },
    { label: "Practice", href: "/student/practice-hub", icon: Target },
    { label: "Progress", href: "/student/progress", icon: BarChart3 },
    { label: "Ranks", href: "/student/leaderboard", icon: Trophy },
    { label: "Profile", href: "/student/profile", icon: User },
  ],
  teacher: [
    { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { label: "Classes", href: "/teacher/classes", icon: Users },
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

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = user?.role || "student";

  const navItems = roleNavItems[role];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background/85 px-2 backdrop-blur-md pb-safe touch-action-manipulation md:hidden">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== `/${role}` && pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-all active:scale-95 ${
              isActive
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="relative">
              <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </div>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileTopHeader() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-md md:hidden">
      <div className="flex items-center gap-2 truncate">
        <span className="text-base font-bold tracking-tight text-foreground truncate">
          Pi Learning
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Real-time XP & Streak Stats */}
        <HeaderStats />

        {/* User Profile Avatar Icon */}
        {user && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
            {user.name?.charAt(0) || "U"}
          </div>
        )}
      </div>
    </header>
  );
}
