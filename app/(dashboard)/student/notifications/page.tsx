"use client";

import { useState } from "react";
import { Bell, CheckCircle2, X, UserPlus, Gift, Clock, Check } from "lucide-react";
import { ParentRequestNotification } from "@/components/student/parent-request-notification";
import type { AppNotification } from "@/components/notifications/notification-bell";

const MOCK_PARENT_REQUESTS = [
  {
    id: "pr1",
    parentName: "Mrs. Nkemdirim",
    parentEmail: "parent@family.com",
    message: "Hi Favour, I'd like to monitor your GCE prep progress and set some reward milestones for you!",
    sentAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "milestone_unlocked",
    title: "🎉 Milestone Unlocked!",
    message: "You completed 7 days in a row! Your parent unlocked a reward: Pizza Night 🍕",
    isRead: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "n2",
    type: "parent_request",
    title: "New Parent Request",
    message: "Mrs. Nkemdirim sent a parent request to monitor your progress.",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "n3",
    type: "general",
    title: "Welcome to Pi Learning!",
    message: "Start your first lesson to earn XP and build your streak.",
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [parentRequests, setParentRequests] = useState(MOCK_PARENT_REQUESTS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleAcceptRequest = async (id: string) => {
    await new Promise((r) => setTimeout(r, 800));
    setParentRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRejectRequest = async (id: string) => {
    await new Promise((r) => setTimeout(r, 800));
    setParentRequests((prev) => prev.filter((r) => r.id !== id));
  };

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
              const Icon = typeIcon[n.type];
              const colorClass = typeColor[n.type];
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
