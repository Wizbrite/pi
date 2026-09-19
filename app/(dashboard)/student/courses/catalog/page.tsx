"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2, 
  Layers, 
  FileText,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function StudentCourseCatalogPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [levelFilter, setLevelFilter] = useState<"ALL" | "O-Level" | "A-Level">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catalogRes, enrollmentsRes] = await Promise.all([
        fetch("/api/student/catalog"),
        fetch("/api/student/enrollments"),
      ]);

      const catalogJson = await catalogRes.json();
      const enrollmentsJson = await enrollmentsRes.json();

      if (catalogJson.success) {
        setCourses(catalogJson.data);
      }
      if (enrollmentsJson.success && Array.isArray(enrollmentsJson.enrolledCourseIds)) {
        setEnrolledCourseIds(enrollmentsJson.enrolledCourseIds.map((id: any) => id.toString()));
      }
    } catch (err) {
      console.error("Failed to load course catalog:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEnroll = async (courseId: string) => {
    setEnrollingId(courseId);
    try {
      const res = await fetch("/api/student/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setEnrolledCourseIds((prev) => [...prev, courseId]);
      } else {
        alert(json.message || "Failed to enroll in course.");
      }
    } catch (err) {
      console.error("Enrollment error:", err);
    } finally {
      setEnrollingId(null);
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
        <Button variant="ghost" onClick={() => router.push("/student/courses")} className="gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to My Courses
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary" /> Course Catalog
          </h1>
          <p className="text-sm text-muted-foreground">
            Explore all admin-created GCE O-Level and A-Level courses and pick subjects to enroll into your learning dashboard.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="bg-card border-border shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={levelFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setLevelFilter("ALL")}
              >
                All Courses ({courses.length})
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
                placeholder="Search catalog subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading available courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-muted/20 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground opacity-50" />
          <p className="text-base font-semibold text-foreground">No courses available in catalog</p>
          <p className="text-xs text-muted-foreground">Check back soon for new admin published subjects.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course._id.toString());

            return (
              <Card key={course._id} className="bg-card border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      GCE {course.level}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {course.subject}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs text-muted-foreground mt-1">
                    {course.description || "No course summary provided."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                    <span className="flex items-center gap-1 font-medium">
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      {course.topicsCount || 0} Syllabus Topics
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <FileText className="w-3.5 h-3.5 text-purple-600" />
                      {course.lessonCount || 0} Lessons
                    </span>
                  </div>

                  {isEnrolled ? (
                    <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Enrolled in Subject
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleEnroll(course._id)}
                      disabled={enrollingId === course._id}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
                    >
                      {enrollingId === course._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Enroll to Course
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
