"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle2, X, UserPlus, Gift, Clock, Check, Loader2 } from "lucide-react";
import { ParentRequestNotification } from "@/components/student/parent-request-notification";
import type { AppNotification } from "@/components/notifications/notification-bell";

const typeIcon: Record<string, React.ElementType> = {
  parent_request: UserPlus,
  request_accepted: CheckCircle2,
  request_rejected: X,
  milestone_unlocked: Gift,
  general: Bell,
};

const typeColor: Record<string, string> = {
  parent_request: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  request_accepted: "bg-green-500/10 text-green-600 dark:text-green-400",
  request_rejected: "bg-red-500/10 text-red-500",
  milestone_unlocked: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  general: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return "just now";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [parentRequests, setParentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const [notifRes, connRes] = await Promise.all([
          fetch("/api/notifications"),
          fetch("/api/parent/connections")
        ]);

        if (notifRes.ok) {
          const notifData = await notifRes.json();
          // Filter out 'parent_request' notifications since we handle them in a separate section via connections API
          setNotifications(notifData.notifications?.filter((n: any) => n.type !== "parent_request") || []);
        }

        if (connRes.ok) {
          const connData = await connRes.json();
          if (connData.pending) {
            setParentRequests(
              connData.pending.map((p: any) => ({
                id: p._id,
                parentName: p.parentId?.fullName || p.parentId?.name || "A parent",
                parentEmail: p.parentId?.email || "",
                message: p.message || "I would like to monitor your progress.",
                sentAt: p.createdAt,
              }))
            );
          }
        }
      } catch (e) {
        console.error("Failed to load notifications", e);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead: true }) });
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch("/api/notifications", { method: "PATCH" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      const res = await fetch(`/api/parent/connections/${id}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept: true })
      });
      const data = await res.json();
      if (res.ok) {
        setParentRequests((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(data.message || "Failed to accept request");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      const res = await fetch(`/api/parent/connections/${id}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept: false })
      });
      const data = await res.json();
      if (res.ok) {
        setParentRequests((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(data.message || "Failed to reject request");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted">
            <Check className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* Parent Requests (priority section) */}
      {parentRequests.length > 0 && (
        <ParentRequestNotification
          requests={parentRequests}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
        />
      )}

      {/* Notifications List */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-muted-foreground uppercase tracking-wider">All Notifications</h2>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 py-12 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-base font-bold text-foreground">No notifications yet</p>
            <p className="mt-1 text-sm text-muted-foreground">We&apos;ll notify you about parent requests, milestones, and more.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const Icon = typeIcon[n.type] || Bell;
              const colorClass = typeColor[n.type] || typeColor.general;
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`relative flex gap-3 cursor-pointer rounded-2xl border p-4 shadow-xs transition-all hover:shadow-md ${!n.isRead ? "border-primary/20 bg-primary/5" : "border-border bg-card"}`}
                >
                  {!n.isRead && (
                    <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-primary" />
                  )}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground/60">{timeAgo(n.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
