"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileCheck2, 
  UserCheck, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    usersCount: 0,
    pendingTeachersCount: 0,
    coursesCount: 0,
    examsCount: 0,
  });
  const [pendingTeachers, setPendingTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, coursesRes, examsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/courses"),
        fetch("/api/admin/exams"),
      ]);

      const usersJson = await usersRes.json();
      const coursesJson = await coursesRes.json();
      const examsJson = await examsRes.json();

      const allUsers = usersJson.success ? usersJson.data : [];
      const pending = allUsers.filter(
        (u: any) => u.role === "teacher" && u.teacherApprovalStatus === "pending"
      );

      setPendingTeachers(pending);
      setStats({
        usersCount: allUsers.length,
        pendingTeachersCount: pending.length,
        coursesCount: coursesJson.success ? coursesJson.data.length : 0,
        examsCount: examsJson.success ? examsJson.data.length : 0,
      });
    } catch (err) {
      console.error("Failed to load admin metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTeacherApproval = async (userId: string, status: "approved" | "rejected") => {
    setActionLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherApprovalStatus: status }),
      });
      const json = await res.json();
      if (json.success) {
        setPendingTeachers((prev) => prev.filter((t) => t._id !== userId));
        setStats((prev) => ({
          ...prev,
          pendingTeachersCount: Math.max(0, prev.pendingTeachersCount - 1),
        }));
      }
    } catch (err) {
      console.error("Error updating teacher status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Banner */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-600/10 via-purple-500/10 to-indigo-600/10 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/10 text-violet-600 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Platform Administration
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Admin Console</h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-xl">
              Manage platform users, approve teacher credentials, add & configure GCE courses, lessons, questions, and past GCE exam papers.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/courses/new">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" /> Add Course
              </Button>
            </Link>
            <Link href="/admin/exams">
              <Button variant="outline" className="gap-2">
                <FileCheck2 className="w-4 h-4 text-violet-600" /> Manage GCE Exams
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-xs hover:border-violet-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : stats.usersCount}
              </h3>
            </div>
            <div className="p-3 bg-violet-500/10 text-violet-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs hover:border-amber-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Teachers</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : stats.pendingTeachersCount}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs hover:border-emerald-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Courses</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : stats.coursesCount}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs hover:border-blue-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Past GCE Exams</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : stats.examsCount}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Modules & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Nav Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            Management Modules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/admin/users" className="block group">
              <Card className="bg-card border-border group-hover:border-violet-500 transition-all shadow-xs h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-violet-600 transition-colors" />
                  </div>
                  <CardTitle className="text-lg">User & Teacher Management</CardTitle>
                  <CardDescription>
                    Manage registered students, teachers, parents, and approve teacher credentials.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/courses" className="block group">
              <Card className="bg-card border-border group-hover:border-emerald-500 transition-all shadow-xs h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <CardTitle className="text-lg">Course & Syllabus Builder</CardTitle>
                  <CardDescription>
                    Create courses, topics, structured lessons, and lesson quiz questions.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/exams" className="block group">
              <Card className="bg-card border-border group-hover:border-blue-500 transition-all shadow-xs h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                  </div>
                  <CardTitle className="text-lg">Past GCE Exam Management</CardTitle>
                  <CardDescription>
                    Insert past GCE exam papers, paper numbers, marking schemes, and official exam questions.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Pending Teacher Approvals Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Pending Teacher Approvals
            </h2>
            <Link href="/admin/users?role=teacher" className="text-xs text-violet-600 hover:underline">
              View All
            </Link>
          </div>

          <Card className="bg-card border-border shadow-xs">
            <CardContent className="p-4 space-y-3">
              {isLoading ? (
                <div className="py-8 flex flex-col items-center justify-center text-muted-foreground space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                  <p className="text-xs">Checking teacher applications...</p>
                </div>
              ) : pendingTeachers.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-medium">All clear!</p>
                  <p className="text-xs mt-0.5">No pending teacher applications to review.</p>
                </div>
              ) : (
                pendingTeachers.map((teacher) => (
                  <div key={teacher._id} className="p-3 border border-border rounded-xl bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-foreground">{teacher.fullName || teacher.email}</p>
                        <p className="text-xs text-muted-foreground">{teacher.email}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                        Pending
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        className="w-full bg-emerald-600 text-white hover:bg-emerald-700 h-8 text-xs gap-1"
                        disabled={actionLoadingId === teacher._id}
                        onClick={() => handleTeacherApproval(teacher._id, "approved")}
                      >
                        {actionLoadingId === teacher._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 h-8 text-xs gap-1"
                        disabled={actionLoadingId === teacher._id}
                        onClick={() => handleTeacherApproval(teacher._id, "rejected")}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
