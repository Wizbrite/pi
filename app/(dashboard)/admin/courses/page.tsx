"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Layers, 
  ArrowLeft, 
  Loader2, 
  Search,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [levelFilter, setLevelFilter] = useState<"ALL" | "O-Level" | "A-Level">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/courses");
      const json = await res.json();
      if (json.success) {
        setCourses(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? All associated lessons and questions will be deleted.`)) {
      return;
    }
    setDeletingId(courseId);
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
      }
    } catch (err) {
      console.error("Failed to delete course:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesLevel = levelFilter === "ALL" || c.level === levelFilter;
    const matchesSearch =
      (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.subject || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/admin")} className="gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
        <Link href="/admin/courses/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> Create New Course
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" /> Course & Syllabus Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage GCE O-Level and A-Level courses, syllabus topics, and lessons.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={levelFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setLevelFilter("ALL")}
              >
                All Levels ({courses.length})
              </Button>
              <Button
                variant={levelFilter === "O-Level" ? "default" : "outline"}
                size="sm"
                onClick={() => setLevelFilter("O-Level")}
              >
                O-Level ({courses.filter((c) => c.level === "O-Level").length})
              </Button>
              <Button
                variant={levelFilter === "A-Level" ? "default" : "outline"}
                size="sm"
                onClick={() => setLevelFilter("A-Level")}
              >
                A-Level ({courses.filter((c) => c.level === "A-Level").length})
              </Button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search course or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm text-muted-foreground">Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-muted/20 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground opacity-50" />
          <p className="text-base font-semibold text-foreground">No courses found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Get started by adding your first admin course to the platform.
          </p>
          <Link href="/admin/courses/new" className="inline-block mt-2">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Create Course Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course._id} className="bg-card border-border hover:border-emerald-500/50 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    GCE {course.level}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {course.subject}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs text-muted-foreground mt-1">
                  {course.description || "No description provided."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <span className="flex items-center gap-1 font-medium">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    {course.topics?.length || 0} Syllabus Topics
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <Link href={`/admin/courses/${course._id}`} className="w-full">
                    <Button variant="outline" className="w-full justify-between text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                      <span>Manage Syllabus & Lessons</span>
                      <ChevronRight className="w-4 h-4 text-emerald-600" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deletingId === course._id}
                    onClick={() => handleDeleteCourse(course._id, course.title)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0"
                  >
                    {deletingId === course._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}