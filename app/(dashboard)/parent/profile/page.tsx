"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  User, Mail, Shield, Calendar, Users, Lock, Eye, EyeOff,
  Save, Loader2, CheckCircle2, AlertTriangle, LogOut, Edit2,
  X, KeyRound
} from "lucide-react";
import { useRouter } from "next/navigation";

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function PasswordInput({
  id, label, value, onChange, show, onToggle, placeholder
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-foreground">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "••••••••"}
          className="w-full rounded-xl border border-border bg-background py-2.5 pl-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ParentProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [childrenCount, setChildrenCount] = useState(0);

  // Name edit state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password state
  const [showPwSection, setShowPwSection] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Logout
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [profileRes, connRes] = await Promise.all([
          fetch("/api/auth/profile"),
          fetch("/api/parent/connections"),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data.profile);
          setNameInput(data.profile?.fullName || "");
        }

        if (connRes.ok) {
          const data = await connRes.json();
          const accepted = (data.connections || []).filter((c: any) => c.status === "accepted");
          setChildrenCount(accepted.length);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput.trim().length < 2) {
      setNameMsg({ type: "error", text: "Name must be at least 2 characters" });
      return;
    }
    setNameSaving(true);
    setNameMsg(null);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: nameInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProfile((p: any) => ({ ...p, fullName: nameInput.trim() }));
      setNameMsg({ type: "success", text: "Name updated successfully" });
      setIsEditingName(false);
    } catch (err: any) {
      setNameMsg({ type: "error", text: err.message });
    } finally {
      setNameSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (!currentPw) { setPwMsg({ type: "error", text: "Enter your current password" }); return; }
    if (newPw.length < 8) { setPwMsg({ type: "error", text: "New password must be at least 8 characters" }); return; }
    if (newPw !== confirmPw) { setPwMsg({ type: "error", text: "Passwords do not match" }); return; }

    setPwSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPwMsg({ type: "success", text: "Password changed successfully" });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setShowPwSection(false), 2000);
    } catch (err: any) {
      setPwMsg({ type: "error", text: err.message });
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    router.replace("/login");
  };

  const displayName = profile?.fullName || user?.name || "Parent";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  if (loadingProfile) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-16">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account details and security</p>
      </div>

      {/* ── Avatar + Name ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-2xl font-black text-white shadow-md">
            {initials}
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 border-2 border-card">
              <span className="text-[8px] font-black text-white">✓</span>
            </span>
          </div>

          {/* Name + role */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-xl font-black text-foreground truncate">{displayName}</h2>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-400 capitalize">
                {profile?.role || "parent"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span><strong className="text-foreground">{childrenCount}</strong> child{childrenCount !== 1 ? "ren" : ""} linked</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "–"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Account Details ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Account Details</h3>
        </div>

        {/* Full Name — editable */}
        <div className="flex items-start gap-3 py-3 border-b border-border">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Full Name</p>
            {isEditingName ? (
              <div className="mt-1.5 space-y-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  autoFocus
                />
                {nameMsg && (
                  <p className={`text-xs font-semibold flex items-center gap-1 ${nameMsg.type === "success" ? "text-green-600" : "text-red-500"}`}>
                    {nameMsg.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                    {nameMsg.text}
                  </p>
                )}
                <div className="flex gap-2">
                  <button onClick={handleSaveName} disabled={nameSaving} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90 disabled:opacity-50">
                    {nameSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save
                  </button>
                  <button onClick={() => { setIsEditingName(false); setNameInput(profile?.fullName || ""); setNameMsg(null); }} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="text-sm font-semibold text-foreground">{profile?.fullName || "–"}</p>
                <button onClick={() => { setIsEditingName(true); setNameMsg(null); }} className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
              </div>
            )}
          </div>
        </div>

        <InfoRow icon={Mail} label="Email Address" value={profile?.email || "–"} />
        <InfoRow icon={Shield} label="Account Role" value={(profile?.role || "parent").charAt(0).toUpperCase() + (profile?.role || "parent").slice(1)} />
      </div>

      {/* ── Change Password ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <button
          onClick={() => { setShowPwSection((v) => !v); setPwMsg(null); }}
          className="flex w-full items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors sm:p-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
              <KeyRound className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Change Password</p>
              <p className="text-xs text-muted-foreground">Update your account security</p>
            </div>
          </div>
          <Lock className={`h-4 w-4 transition-transform ${showPwSection ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
        </button>

        {showPwSection && (
          <div className="border-t border-border p-5 space-y-4 sm:p-6">
            <PasswordInput id="current-pw" label="Current Password" value={currentPw} onChange={setCurrentPw} show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
            <PasswordInput id="new-pw" label="New Password" value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew(v => !v)} placeholder="Min 8 characters" />
            <PasswordInput id="confirm-pw" label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />

            {pwMsg && (
              <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${pwMsg.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"}`}>
                {pwMsg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                {pwMsg.text}
              </div>
            )}

            {/* Password strength indicator */}
            {newPw.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => {
                    const strength = newPw.length >= 12 ? 4 : newPw.length >= 10 ? 3 : newPw.length >= 8 ? 2 : 1;
                    return (
                      <div key={level} className={`h-1 flex-1 rounded-full transition-all ${level <= strength ? (strength >= 4 ? "bg-green-500" : strength >= 3 ? "bg-blue-500" : strength >= 2 ? "bg-amber-500" : "bg-red-500") : "bg-muted"}`} />
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {newPw.length < 8 ? "Too short" : newPw.length < 10 ? "Fair" : newPw.length < 12 ? "Good" : "Strong"}
                </p>
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={pwSaving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Update Password
            </button>
          </div>
        )}
      </div>

      {/* ── Danger Zone ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-red-200/60 bg-red-50/40 p-5 shadow-xs dark:border-red-500/20 dark:bg-red-500/5 sm:p-6">
        <h3 className="mb-1 text-sm font-bold text-foreground">Account Actions</h3>
        <p className="mb-4 text-xs text-muted-foreground">Sign out of your account on this device.</p>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 shadow-xs hover:bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 disabled:opacity-50"
        >
          {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Sign Out
        </button>
      </div>
    </div>
  );
}
