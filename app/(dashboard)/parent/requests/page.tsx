"use client";

import { useState } from "react";
import { Plus, Send, Clock, CheckCircle2, X, Mail, UserPlus, ChevronRight, Inbox } from "lucide-react";
import { ConnectionRequestModal } from "@/components/parent/connection-request-modal";

type RequestStatus = "pending" | "accepted" | "rejected";

interface OutgoingRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  status: RequestStatus;
  sentAt: string;
  respondedAt?: string;
}

interface IncomingRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  message?: string;
  sentAt: string;
}

const OUTGOING: OutgoingRequest[] = [
  { id: "r1", studentName: "Madeleine Fon", studentEmail: "madeleine@school.edu", status: "pending", sentAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "r2", studentName: "Favour Nkemdirim", studentEmail: "favour@school.edu", status: "accepted", sentAt: new Date(Date.now() - 7 * 86400000).toISOString(), respondedAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: "r3", studentName: "Jean-Pierre Nkolo", studentEmail: "jp@school.edu", status: "rejected", sentAt: new Date(Date.now() - 10 * 86400000).toISOString(), respondedAt: new Date(Date.now() - 9 * 86400000).toISOString() },
];

const INCOMING: IncomingRequest[] = [
  { id: "ir1", studentName: "Amara Diallo", studentEmail: "amara@school.edu", message: "Hello, I'd like you to monitor my progress!", sentAt: new Date(Date.now() - 1800000).toISOString() },
];

const statusConfig: Record<RequestStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
  accepted: { label: "Accepted ✓", cls: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RequestsPage() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"outgoing" | "incoming">("outgoing");
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [rejected, setRejected] = useState<Set<string>>(new Set());

  const pendingIncoming = INCOMING.filter((r) => !accepted.has(r.id) && !rejected.has(r.id));

  return (
    <>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Connection Requests</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your parent-student connection requests
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Send Request
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab("outgoing")} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "outgoing" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <Send className="h-3.5 w-3.5" /> Sent
            <span className="ml-1 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-[9px] font-bold">{OUTGOING.length}</span>
          </button>
          <button onClick={() => setActiveTab("incoming")} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "incoming" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <Inbox className="h-3.5 w-3.5" /> Received
            {pendingIncoming.length > 0 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">{pendingIncoming.length}</span>
            )}
          </button>
        </div>

        {/* Outgoing Requests */}
        {activeTab === "outgoing" && (
          <div className="space-y-3">
            {OUTGOING.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 py-12 text-center">
                <Send className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-base font-bold text-foreground">No requests sent yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Send a parent request to connect with your child&apos;s account.</p>
                <button onClick={() => setShowModal(true)} className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90">
                  <UserPlus className="h-4 w-4" /> Send Request
                </button>
              </div>
            ) : (
              OUTGOING.map((req) => {
                const { label, cls } = statusConfig[req.status];
                return (
                  <div key={req.id} className="rounded-2xl border border-border bg-card p-4 shadow-xs transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white">
                        {req.studentName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground">{req.studentName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{req.studentEmail}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${cls}`}>{label}</span>
                        <p className="mt-1 text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                          <Clock className="h-2.5 w-2.5" /> Sent {timeAgo(req.sentAt)}
                        </p>
                      </div>
                    </div>
                    {req.status === "accepted" && (
                      <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-2 dark:bg-green-500/10">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-xs text-green-700 dark:text-green-400">
                          Connected! You can now view their progress. {req.respondedAt ? `Accepted ${timeAgo(req.respondedAt)}` : ""}
                        </span>
                      </div>
                    )}
                    {req.status === "pending" && (
                      <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 dark:bg-amber-500/10">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs text-amber-700 dark:text-amber-400">Waiting for student to accept. An email was sent to {req.studentEmail}.</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Incoming Requests (students inviting parent) */}
        {activeTab === "incoming" && (
          <div className="space-y-3">
            {INCOMING.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 py-12 text-center">
                <Inbox className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-base font-bold text-foreground">No incoming requests</p>
                <p className="mt-1 text-sm text-muted-foreground">Students can also invite you to monitor their progress.</p>
              </div>
            ) : (
              INCOMING.map((req) => {
                const isAccepted = accepted.has(req.id);
                const isRejected = rejected.has(req.id);
                return (
                  <div key={req.id} className={`rounded-2xl border bg-card p-4 shadow-xs transition-all ${isAccepted ? "border-green-300/50 bg-green-50/30 dark:bg-green-500/5" : isRejected ? "border-muted bg-muted/20 opacity-60" : "border-violet-200/50"}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white">
                        {req.studentName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground">{req.studentName}</p>
                        <p className="text-xs text-muted-foreground">{req.studentEmail}</p>
                        {req.message && (
                          <div className="mt-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                            <p className="text-xs italic text-muted-foreground">&ldquo;{req.message}&rdquo;</p>
                          </div>
                        )}
                        <p className="mt-1 text-[10px] text-muted-foreground">Sent {timeAgo(req.sentAt)}</p>
                      </div>
                    </div>
                    {!isAccepted && !isRejected ? (
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => setAccepted((p) => new Set([...p, req.id]))} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary/90">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                        </button>
                        <button onClick={() => setRejected((p) => new Set([...p, req.id]))} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground hover:border-red-300 hover:text-red-600">
                          <X className="h-3.5 w-3.5" /> Decline
                        </button>
                      </div>
                    ) : isAccepted ? (
                      <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-2 dark:bg-green-500/10">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-xs text-green-700 dark:text-green-400">Accepted! You are now monitoring this student.</span>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2">
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Request declined.</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <ConnectionRequestModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
