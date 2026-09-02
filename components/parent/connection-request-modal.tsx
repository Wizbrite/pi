"use client";

import { useState } from "react";
import { X, Mail, Send, UserPlus, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend?: (email: string, message?: string) => Promise<void>;
}

export function ConnectionRequestModal({
  isOpen,
  onClose,
  onSend,
}: ConnectionRequestModalProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"form" | "sending" | "success" | "error">(
    "form"
  );
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!email.trim()) {
      setErrorMsg("Please enter a student email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setErrorMsg("");
    setStep("sending");
    try {
      if (onSend) {
        await onSend(email.trim(), message.trim() || undefined);
      } else {
        // Mock delay
        await new Promise((r) => setTimeout(r, 1500));
      }
      setStep("success");
    } catch (err: any) {
      setStep("error");
      setErrorMsg(err.message || "Failed to send request. Please try again.");
    }
  };

  const handleClose = () => {
    setEmail("");
    setMessage("");
    setStep("form");
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <UserPlus className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Send Parent Request
              </h2>
              <p className="text-xs text-muted-foreground">
                Connect to monitor student progress
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "success" ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Request Sent!
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  A connection request has been sent to{" "}
                  <span className="font-semibold text-foreground">{email}</span>
                  . An email notification has been sent to the student.
                </p>
              </div>
              <Button onClick={handleClose} className="mt-2 w-full">
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-200/50 bg-blue-50/50 p-3 dark:border-blue-500/20 dark:bg-blue-500/10">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  📧 The student will receive an email notification with a link
                  to accept your request. You&apos;ll be notified once they
                  accept.
                </p>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Student&apos;s Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="student@example.com"
                    disabled={step === "sending"}
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Optional message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Personal Message{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi! I'd like to monitor your learning progress..."
                  rows={3}
                  disabled={step === "sending"}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-medium text-red-500">{errorMsg}</p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={step === "sending"}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={step === "sending"}
                  className="flex-1 gap-2"
                >
                  {step === "sending" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
