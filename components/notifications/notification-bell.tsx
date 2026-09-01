"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, X, CheckCircle2, Clock, UserPlus, Gift, Loader2, ChevronRight } from "lucide-react";

export interface AppNotification {
  id: string;
  type: "parent_request" | "request_accepted" | "request_rejected" | "milestone_unlocked" | "general";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  meta?: Record<string, string>;
}

const typeIcon: Record<AppNotification["type"], React.ElementType> = {
  parent_request: UserPlus,
  request_accepted: CheckCircle2,
  request_rejected: X,
  milestone_unlocked: Gift,
  general: Bell,
};

const typeColor: Record<AppNotification["type"], string> = {
  parent_request: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  request_accepted: "bg-green-500/10 text-green-600 dark:text-green-400",
  request_rejected: "bg-red-500/10 text-red-500",
  milestone_unlocked: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  general: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface NotificationBellProps {
  notifications: AppNotification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  isLoading?: boolean;
}

export function NotificationBell({
  notifications,
  onMarkRead,
  onMarkAllRead,
  isLoading,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="notification-bell"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-top-2 fade-in duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcon[n.type];
                const colorClass = typeColor[n.type];
                return (
                  <div
                    key={n.id}
                    onClick={() => onMarkRead?.(n.id)}
                    className={`relative flex gap-3 border-b border-border/50 px-4 py-3 transition-colors hover:bg-muted/50 last:border-b-0 ${
                      !n.isRead ? "bg-primary/5" : ""
                    }`}
                  >
                    {/* Unread dot */}
                    {!n.isRead && (
                      <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />
                    )}

                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                        {n.message}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Clock className="h-2.5 w-2.5 text-muted-foreground/60" />
                        <span className="text-[10px] text-muted-foreground/60">
                          {formatTimeAgo(n.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <Link
            href="/student/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 border-t border-border py-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/5"
          >
            View All Notifications <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
