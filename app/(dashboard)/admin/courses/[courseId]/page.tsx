"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Layers, 
  FileText, 
  HelpCircle,
  Loader2,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminCourseDetailsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicDesc, setNewTopicDesc] = useState("");
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/admin/courses/${courseId}/lessons`),
      ]);

      const courseJson = await courseRes.json();
      const lessonsJson = await lessonsRes.json();

      if (courseJson.success) {
        setCourse(courseJson.data.course || courseJson.data);
      }
      if (lessonsJson.success) {
        setLessons(lessonsJson.data);
      }
    } catch (err) {
      console.error("Failed to load course details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !course) return;
    setIsAddingTopic(true);

    const updatedTopics = [
      ...(course.topics || []),
      {
        title: newTopicTitle.trim(),
        description: newTopicDesc.trim(),
        order: (course.topics?.length || 0) + 1,
      },
    ];

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: updatedTopics }),
      });
      const json = await res.json();
      if (json.success) {
        setCourse(json.data);
        setNewTopicTitle("");
        setNewTopicDesc("");
      }
    } catch (err) {
      console.error("Failed to add topic:", err);
    } finally {
      setIsAddingTopic(false);
    }
  };

  const handleDeleteTopic = async (index: number) => {
    if (!confirm("Are you sure you want to remove this topic?")) return;
    const updatedTopics = (course.topics || []).filter((_: any, i: number) => i !== index);

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: updatedTopics }),
      });
      const json = await res.json();
      if (json.success) {
        setCourse(json.data);
      }
    } catch (err) {
      console.error("Failed to delete topic:", err);
    }
  };

  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete lesson "${title}"?`)) return;
    setDeletingLessonId(lessonId);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setLessons((prev) => prev.filter((l) => l._id !== lessonId));
      }
    } catch (err) {
      console.error("Failed to delete lesson:", err);
    } finally {
      setDeletingLessonId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-muted-foreground">Loading course & syllabus details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center space-y-4">
        <p className="text-lg font-semibold text-red-600">Course not found</p>
        <Button onClick={() => router.push("/admin/courses")}>Back to Courses</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/admin/courses")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Button>
        <Link href={`/admin/courses/${courseId}/lessons/new`}>
          <Button className="bg-emerald-600 text-white hover:bg-emerald-700 gap-2">
            <Plus className="w-4 h-4" /> Add New Lesson
          </Button>
        </Link>
      </div>

      {/* Course Header */}
      <Card className="bg-card border-border shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  GCE {course.level}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  {course.subject}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-foreground">{course.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
                {course.description || "No description provided."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Syllabus Topics & Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Topics Manager */}
        <div className="space-y-4">
          <Card className="bg-card border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" /> Syllabus Topics ({course.topics?.length || 0})
              </CardTitle>
              <CardDescription>
                Modules & topics defined for this course.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {(course.topics || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2">No topics created yet.</p>
                ) : (
                  (course.topics || []).map((topic: any, idx: number) => (
                    <div key={idx} className="p-3 border border-border rounded-lg bg-muted/30 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          #{idx + 1}. {topic.title}
                        </p>
                        {topic.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{topic.description}</p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteTopic(idx)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Topic Form */}
              <form onSubmit={handleAddTopic} className="pt-3 border-t border-border space-y-2">
                <p className="text-xs font-semibold text-foreground">Add New Topic</p>
                <input
                  type="text"
                  placeholder="Topic Title (e.g. Data Communication)"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Short Description (Optional)"
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button
                  type="submit"
                  disabled={isAddingTopic || !newTopicTitle.trim()}
                  size="sm"
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 h-8 text-xs gap-1"
                >
                  {isAddingTopic ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add Topic
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Lessons List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Course Lessons ({lessons.length})
            </h2>
            <Link href={`/admin/courses/${courseId}/lessons/new`}>
              <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 gap-1 text-xs">
                <Plus className="w-3.5 h-3.5" /> Add Lesson
              </Button>
            </Link>
          </div>

          {lessons.length === 0 ? (
            <Card className="bg-card border-border shadow-xs p-12 text-center">
              <FileText className="w-10 h-10 mx-auto text-muted-foreground opacity-40 mb-2" />
              <p className="text-base font-semibold text-foreground">No lessons created yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                Add structured lessons with learning content and questions to this course.
              </p>
              <Link href={`/admin/courses/${courseId}/lessons/new`}>
                <Button size="sm" className="bg-emerald-600 text-white gap-2">
                  <Plus className="w-4 h-4" /> Create First Lesson
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson) => {
                const topicObj = (course.topics || []).find(
                  (t: any) => t._id?.toString() === lesson.topicId?.toString()
                );

                return (
                  <Card key={lesson._id} className="bg-card border-border hover:border-emerald-500/40 transition-all shadow-xs">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                            Order #{lesson.order || 1}
                          </span>
                          {topicObj && (
                            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              Topic: {topicObj.title}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-foreground">{lesson.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            {lesson.parts?.length || 0} Content Parts
                          </span>
                          <span className="flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                            {lesson.questionCount || 0} Quiz Questions
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/admin/courses/${courseId}/lessons/${lesson._id}`}>
                          <Button size="sm" variant="outline" className="text-xs gap-1">
                            <Edit3 className="w-3.5 h-3.5" /> Edit & Questions
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={deletingLessonId === lesson._id}
                          onClick={() => handleDeleteLesson(lesson._id, lesson.title)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                        >
                          {deletingLessonId === lesson._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
