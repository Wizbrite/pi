"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaFacebook, FaTwitter, FaWhatsapp} from "react-icons/fa";
import {
  User,
  Mail,
  Trophy,
  Zap,
  Flame,
  Award,
  CreditCard,
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Moon,
  Sun,
  Bell,
  Edit3,
  MessageCircle,
  Share2,      // Replaces Facebook
  Globe,       // Replaces Twitter / Website
  HelpCircle,
  FileText,
  ShieldAlert,
  LogOut,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/auth-store";

export default function StudentProfilePage() {
  const { user } = useAuthStore();

  // State for theme & notifications
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Mock student stats & achievements
  const studentData = {
    name: user?.name || "Student Name",
    email: user?.email || "student@example.com",
    level: user?.gceLevel === "Advanced" ? "Advanced Level (A-Level)" : "Ordinary Level (O-Level)",
    xp: 1250,
    streakDays: 5,
    quizzesCompleted: 42,
    avgScore: "84%",
    subscriptionStatus: "Free Plan",
    achievements: [
      { id: 1, title: "7-Day Streak", desc: "Studied 7 days in a row", icon: Flame, color: "text-amber-500 bg-amber-500/10" },
      { id: 2, title: "Quiz Master", desc: "Completed 25+ topic quizzes", icon: Trophy, color: "text-blue-500 bg-blue-500/10" },
      { id: 3, title: "Physics Scholar", desc: "Scored 90%+ in Mechanics", icon: Award, color: "text-purple-500 bg-purple-500/10" },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* 1. CREDENTIAL SUMMARY HEADER */}
      <section className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-2xl font-black text-primary">
              {studentData.name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-md hover:scale-105 transition">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-xl font-bold text-foreground">{studentData.name}</h1>
              <Badge variant="outline" className="text-xs font-semibold">
                {studentData.level}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5" /> {studentData.email}
            </p>
          </div>
        </div>
        
      </section>

      {/* 2. SUBSCRIPTION PLAN BANNER / CARD */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Subscription Status</span>
          </div>
          <h2 className="text-xl font-extrabold">{studentData.subscriptionStatus}</h2>
          <p className="text-xs text-blue-100 max-w-md">
            Upgrade to Pro to unlock unlimited GCE past paper solutions, full AI tutor access, and offline downloads.
          </p>
        </div>
        <Link href="/student/subscription">
          <Button className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold shadow-sm whitespace-nowrap gap-1.5">
            Upgrade Plan <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      {/* 3. PROGRESS STATS & ACHIEVEMENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Progress Stats Summary */}
        <div className="md:col-span-1 bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" /> Learning Stats
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-xl border border-border text-center">
              <span className="text-xs text-muted-foreground block">Total XP</span>
              <span className="text-lg font-black text-primary flex items-center justify-center gap-1 mt-0.5">
                <Zap className="w-4 h-4 fill-primary" /> {studentData.xp}
              </span>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl border border-border text-center">
              <span className="text-xs text-muted-foreground block">Streak</span>
              <span className="text-lg font-black text-amber-500 flex items-center justify-center gap-1 mt-0.5">
                <Flame className="w-4 h-4 fill-amber-500" /> {studentData.streakDays}d
              </span>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl border border-border text-center">
              <span className="text-xs text-muted-foreground block">Quizzes</span>
              <span className="text-lg font-black text-foreground mt-0.5 block">{studentData.quizzesCompleted}</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl border border-border text-center">
              <span className="text-xs text-muted-foreground block">Avg Score</span>
              <span className="text-lg font-black text-green-600 dark:text-green-400 mt-0.5 block">{studentData.avgScore}</span>
            </div>
          </div>
        </div>

        {/* Badges & Achievements */}
        <div className="md:col-span-2 bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Recent Badges
            </h3>
            <span className="text-xs text-primary font-semibold hover:underline cursor-pointer">View All</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {studentData.achievements.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="p-3 border border-border rounded-xl flex items-center gap-3 bg-card hover:bg-muted/30 transition">
                  <div className={`p-2.5 rounded-xl shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. GENERAL PREFERENCES & APP SETTINGS */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">General Preferences</h3>
        
        <div className="space-y-3 divide-y divide-border">
          {/* Theme Selector */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Adjust the interface visual theme</p>
              </div>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Study Reminders</p>
                <p className="text-xs text-muted-foreground">Receive notifications for daily study streaks and quizzes</p>
              </div>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          </div>
        </div>
      </section>

      {/* 5. CONNECT WITH US (SOCIAL LINKS) */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Connect With Us</h3>
        <p className="text-xs text-muted-foreground">Join our GCE revision community and get daily study updates.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="https://wa.me/123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-green-500/10 hover:border-green-500/30 transition text-xs font-semibold text-foreground"
          >
            <span className="flex items-center gap-2">
              <FaWhatsapp className="w-4 h-4 text-green-500" /> WhatsApp Community
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-blue-500/10 hover:border-blue-500/30 transition text-xs font-semibold text-foreground"
          >
            <span className="flex items-center gap-2">
              <FaFacebook className="w-4 h-4 text-blue-600" /> Facebook Page
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>

          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-sky-500/10 hover:border-sky-500/30 transition text-xs font-semibold text-foreground"
          >
            <span className="flex items-center gap-2">
              <FaTwitter className="w-4 h-4 text-sky-500" /> X / Twitter
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
        </div>
      </section>

      {/* 6. LEGAL & SUPPORT SECTION */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Support & Legal</h3>
        
        <div className="space-y-1">
          <Link href="/support" className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition text-xs font-medium text-foreground">
            <span className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-muted-foreground" /> Help Center & FAQ
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <Link href="/terms" className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition text-xs font-medium text-foreground">
            <span className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-muted-foreground" /> Terms of Service
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <Link href="/privacy" className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition text-xs font-medium text-foreground">
            <span className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-muted-foreground" /> Privacy Policy
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>

        <div className="pt-2">
          <Button variant="destructive" size="sm" className="w-full sm:w-auto gap-2 text-xs">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      </section>

    </div>
  );
}