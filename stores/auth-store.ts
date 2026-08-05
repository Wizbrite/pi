"use client";

import { create } from "zustand";

export type UserRole = "student" | "teacher" | "parent" | "admin";
export type GceLevel = "Ordinary" | "Advanced";
export type TeacherApprovalStatus = "pending" | "approved" | "rejected";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gceLevel?: GceLevel;
  teacherApprovalStatus?: TeacherApprovalStatus;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      set({ user: null, isAuthenticated: false, isLoading: false });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
