"use client";

import React, { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, ChevronRight, ArrowLeft, Filter, Loader2, AlertTriangle, RefreshCcw } from "lucide-react";

interface PageProps {
  params: Promise<{ "course-id": string }>;
}

export default function CourseTopicsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const courseId = resolvedParams["course-id"];

  const [courseData, setCourseData] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "in-progress" | "completed">("all");

  const fetchCourseDetails = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch course details');
      }
      const json = await res.json();
      if (json.success) {
        const { course, lessons } = json.data;
        setCourseData(course);

        // Group lessons into topics
        const mappedTopics = course.topics.map((t: any) => {
          const topicLessons = lessons.filter((l: any) => l.topicId === t._id.toString());
          const completedCount = topicLessons.filter((l: any) => l.isCompleted).length;
          return {
            id: t._id.toString(),
            title: t.title,
            description: t.description,
            completedCount,
            totalLessons: topicLessons.length,
            lessons: topicLessons.map((l: any) => ({
              id: l._id.toString(),
              title: l.title,
              duration: "10m", // Mock duration for now
              completed: l.isCompleted,
            })),
          };
        });

        setTopics(mappedTopics);
      } else {
        throw new Error(json.message || 'Failed to fetch course details');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while loading the syllabus.');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading syllabus...</p>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="p-6 text-center space-y-4 max-w-md mx-auto my-12">
        <div className="rounded-full bg-red-100 p-3 inline-block">
          <AlertTriangle className="h-6 w-6 text-red-600 mx-auto" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Failed to Load Syllabus</h2>
        <p className="text-sm text-red-600 mt-1">{error || "Course not found."}</p>
        <div className="flex gap-2 justify-center mt-4">
          <Link href="/student/courses">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Courses
            </Button>
          </Link>
          <Button onClick={fetchCourseDetails} className="bg-primary text-primary-foreground">
            <RefreshCcw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const filteredTopics = topics.filter((topic) => {
    if (activeFilter === "completed") return topic.completedCount > 0 && topic.completedCount === topic.totalLessons;
    if (activeFilter === "in-progress") return topic.completedCount < topic.totalLessons;
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 touch-action-manipulation">
      <div>
        <Link href="/student/courses" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Courses
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              GCE {courseData.level} • {courseData.subject}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{courseData.title} Syllabus</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Select a topic below to inspect individual lessons.</p>
          </div>
          <Badge variant="accent" className="px-3 py-1 text-xs">
            {topics.length} Syllabus Modules
          </Badge>
        </div>
      </div>

      {/* Sticky Filter Pills */}
      <div className="sticky top-14 z-30 flex items-center gap-2 overflow-x-auto bg-background/90 py-2.5 backdrop-blur-md border-b border-border/50 scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-1" />
        <button
          onClick={() => setActiveFilter("all")}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
            activeFilter === "all"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          All Topics ({topics.length})
        </button>
        <button
          onClick={() => setActiveFilter("in-progress")}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
            activeFilter === "in-progress"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => setActiveFilter("completed")}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
            activeFilter === "completed"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          Completed
        </button>
      </div>

      {/* Topics & Lessons Stack */}
      <div className="space-y-6">
        {filteredTopics.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 border border-border rounded-xl">
            <p className="text-sm text-muted-foreground">No topics match the selected filter.</p>
          </div>
        ) : (
          filteredTopics.map((topic) => (
            <Card key={topic.id} className="bg-card border-border text-card-foreground shadow-xs overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/30 p-4">
                <div className="flex justify-between items-center gap-2">
                  <div>
                    <CardTitle className="text-base md:text-lg font-bold text-foreground">{topic.title}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      {topic.description}
                    </CardDescription>
                  </div>
                  <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full shrink-0">
                    {topic.completedCount}/{topic.totalLessons} Done
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {topic.lessons.map((lesson: any) => (
                  <Link key={lesson.id} href={`/student/courses/${courseData._id}/lessons/${lesson.id}`}>
                    <div className="group border border-border rounded-xl p-3.5 bg-background hover:border-primary/50 hover:bg-accent/40 active:scale-[0.98] active:bg-accent/60 transition-all cursor-pointer space-y-2">
                      <div className="flex justify-between items-start">
                        {lesson.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        )}
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-medium text-muted-foreground">
                          {lesson.duration}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                          {lesson.title}
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </h4>
                      </div>
                    </div>
                  </Link>
                ))}
                {topic.lessons.length === 0 && (
                  <p className="text-xs text-muted-foreground italic col-span-full">No lessons available in this module yet.</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}