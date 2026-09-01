"use client";

import { useState } from "react";
import { UserPlus, CheckCircle2, X, ChevronRight, Shield } from "lucide-react";
import Link from "next/link";

interface ParentRequest {
  id: string;
  parentName: string;
  parentEmail: string;
  message?: string;
  sentAt: string;
}

interface ParentRequestNotificationProps {
  requests: ParentRequest[];
  onAccept?: (requestId: string) => Promise<void>;
  onReject?: (requestId: string) => Promise<void>;
}

export function ParentRequestNotification({
  requests,
  onAccept,
  onReject,
}: ParentRequestNotificationProps) {
  const [processing, setProcessing] = useState<Record<string, "accepting" | "rejecting">>({});
  const [handled, setHandled] = useState<Set<string>>(new Set());

  const pendingRequests = requests.filter((r) => !handled.has(r.id));

  if (pendingRequests.length === 0) return null;

  const handleAccept = async (id: string) => {
    setProcessing((p) => ({ ...p, [id]: "accepting" }));
    try {
      await onAccept?.(id);
      setHandled((prev) => new Set([...prev, id]));
    } finally {
      setProcessing((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
    }
  };

  const handleReject = async (id: string) => {
    setProcessing((p) => ({ ...p, [id]: "rejecting" }));
    try {
      await onReject?.(id);
      setHandled((prev) => new Set([...prev, id]));
    } finally {
      setProcessing((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/10">
            <Shield className="h-3.5 w-3.5 text-violet-500" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Parent Requests</h3>
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
            {pendingRequests.length}
          </span>
        </div>
        <Link
          href="/student/notifications"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {pendingRequests.map((req) => (
        <div
          key={req.id}
          className="rounded-2xl border border-violet-200/50 bg-gradient-to-br from-violet-50/80 to-purple-50/50 p-4 shadow-xs dark:border-violet-500/20 dark:from-violet-500/10 dark:to-purple-500/5"
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white shadow-sm">
              {req.parentName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-foreground">{req.parentName}</p>
                  <p className="text-xs text-muted-foreground">{req.parentEmail}</p>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-violet-200/50 bg-violet-100/80 px-2 py-0.5 dark:border-violet-500/20 dark:bg-violet-500/20">
                  <UserPlus className="h-3 w-3 text-violet-500" />
                  <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">
                    Parent Request
                  </span>
                </div>
              </div>

              {req.message && (
                <div className="mt-2 rounded-lg border border-border/50 bg-background/50 px-3 py-2">
                  <p className="text-xs italic text-muted-foreground">
                    &ldquo;{req.message}&rdquo;
                  </p>
                </div>
              )}

              <p className="mt-2 text-[11px] text-muted-foreground">
                Accepting allows this person to monitor your learning progress
                and set milestone rewards for you.
              </p>

              {/* Action Buttons */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleAccept(req.id)}
                  disabled={!!processing[req.id]}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white transition-all hover:bg-primary/90 disabled:opacity-60"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {processing[req.id] === "accepting" ? "Accepting…" : "Accept"}
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  disabled={!!processing[req.id]}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-60 dark:hover:bg-red-500/10"
                >
                  <X className="h-3.5 w-3.5" />
                  {processing[req.id] === "rejecting" ? "Declining…" : "Decline"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
