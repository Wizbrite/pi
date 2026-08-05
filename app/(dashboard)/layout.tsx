"use client";

import { useEffect } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MobileBottomNav, MobileTopHeader } from "@/components/layout/mobile-nav";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchUser, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Middleware will redirect
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-50/50 text-slate-900 md:flex-row md:h-screen">
      {/* Mobile Sticky App Header Bar */}
      <MobileTopHeader />

      {/* Desktop Sidebar (Hidden on mobile) */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>
    
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
