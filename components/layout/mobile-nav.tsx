"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
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
  MoreHorizontal,
  X,
  Bell,
  Shield,
  Gift,
} from "lucide-react";
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
    { label: "Courses", href: "/student/courses", icon: BookOpen },
    { label: "Exams", href: "/student/exams", icon: FileText },
    { label: "Practice", href: "/student/practice-hub", icon: Target },
    { label: "Progress", href: "/student/progress", icon: BarChart3 },
    { label: "Ranks", href: "/student/leaderboard", icon: Trophy },
    { label: "Milestones", href: "/student/milestones", icon: Gift },
    { label: "Alerts", href: "/student/notifications", icon: Bell },
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
    { label: "Milestones", href: "/parent/milestones", icon: Gift },
    { label: "Requests", href: "/parent/requests", icon: Shield },
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

// Show at most 4 items in the bar; the rest go into "..."
const PRIMARY_COUNT = 4;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = user?.role || "student";
  const navItems = roleNavItems[role];

  const primaryItems = navItems.slice(0, PRIMARY_COUNT);
  const overflowItems = navItems.slice(PRIMARY_COUNT);
  const hasOverflow = overflowItems.length > 0;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const isActive = (href: string) =>
    pathname === href || (href !== `/${role}` && pathname.startsWith(`${href}/`));

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        onClick={() => setMenuOpen(false)}
        className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-all active:scale-95 ${
          active ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <div className="relative">
          <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
          {active && (
            <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
          )}
        </div>
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  // Check if any overflow item is active (so the "..." button lights up)
  const overflowActive = overflowItems.some((item) => isActive(item.href));

  return (
    <>
      {/* Overflow Popover */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed bottom-[4.5rem] right-2 z-[60] w-52 rounded-2xl border border-border bg-background/95 shadow-2xl backdrop-blur-md p-2 animate-in slide-in-from-bottom-2 fade-in duration-150"
        >
          <div className="flex items-center justify-between px-2 pb-2 border-b border-border mb-1">
            <span className="text-xs font-semibold text-muted-foreground">More</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {overflowItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background/85 px-2 backdrop-blur-md pb-safe touch-action-manipulation md:hidden">
        {primaryItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        {hasOverflow && (
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="More navigation options"
            className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-all active:scale-95 ${
              overflowActive || menuOpen
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="relative">
              <MoreHorizontal className={`h-5 w-5 ${overflowActive || menuOpen ? "text-primary" : "text-muted-foreground"}`} />
              {overflowActive && (
                <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </div>
            <span>More</span>
          </button>
        )}
      </nav>
    </>
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
        {/* Real-time XP & Streak Stats (students only) */}
        {user?.role === "student" && <HeaderStats />}

        {/* Notification Bell — students only */}
        {user?.role === "student" && (
          <Link
            href="/student/notifications"
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              2
            </span>
          </Link>
        )}

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
