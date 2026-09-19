"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  ShieldAlert, 
  UserCheck, 
  Loader2,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "teacher" | "student" | "admin">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateStatus = async (userId: string, updates: Record<string, any>) => {
    setActionLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, ...json.data } : u))
        );
      }
    } catch (err) {
      console.error("Failed to update user:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setActionLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "pending") {
      return u.role === "teacher" && u.teacherApprovalStatus === "pending";
    }
    if (activeTab === "teacher") return u.role === "teacher";
    if (activeTab === "student") return u.role === "student";
    if (activeTab === "admin") return u.role === "admin";
    return true;
  });

  const pendingCount = users.filter(
    (u) => u.role === "teacher" && u.teacherApprovalStatus === "pending"
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/admin")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-600" /> User & Teacher Management
          </h1>
          <p className="text-sm text-muted-foreground">
            View users, manage roles, and review pending teacher applications.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <Card className="bg-card border-border shadow-xs">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("all")}
              >
                All Users ({users.length})
              </Button>
              <Button
                variant={activeTab === "pending" ? "default" : "outline"}
                size="sm"
                className={activeTab === "pending" ? "bg-amber-600 hover:bg-amber-700" : "border-amber-400 text-amber-600"}
                onClick={() => setActiveTab("pending")}
              >
                Pending Teachers {pendingCount > 0 && `(${pendingCount})`}
              </Button>
              <Button
                variant={activeTab === "teacher" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("teacher")}
              >
                Teachers
              </Button>
              <Button
                variant={activeTab === "student" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("student")}
              >
                Students
              </Button>
              <Button
                variant={activeTab === "admin" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("admin")}
              >
                Admins
              </Button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* User Table */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
              <p className="text-sm text-muted-foreground">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-base font-semibold">No users found</p>
              <p className="text-xs">No accounts match the current filter or search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[11px] tracking-wider">
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Teacher Status</th>
                    <th className="p-3">GCE Level</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <p className="font-semibold text-foreground">{user.fullName || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="p-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateStatus(user._id, { role: e.target.value })}
                          className="px-2 py-1 text-xs border border-input rounded bg-background"
                        >
                          <option value="student">student</option>
                          <option value="teacher">teacher</option>
                          <option value="parent">parent</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="p-3">
                        {user.role === "teacher" ? (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              user.teacherApprovalStatus === "approved"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : user.teacherApprovalStatus === "rejected"
                                ? "bg-red-500/10 text-red-600"
                                : "bg-amber-500/10 text-amber-600"
                            }`}
                          >
                            {user.teacherApprovalStatus || "pending"}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {user.gceLevel || "N/A"}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {user.role === "teacher" && user.teacherApprovalStatus !== "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 h-7 text-xs gap-1"
                              disabled={actionLoadingId === user._id}
                              onClick={() => handleUpdateStatus(user._id, { teacherApprovalStatus: "approved" })}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </Button>
                          )}
                          {user.role === "teacher" && user.teacherApprovalStatus !== "rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-300 text-amber-600 hover:bg-amber-50 h-7 text-xs gap-1"
                              disabled={actionLoadingId === user._id}
                              onClick={() => handleUpdateStatus(user._id, { teacherApprovalStatus: "rejected" })}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                            disabled={actionLoadingId === user._id}
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
