"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { AlertTriangle, RefreshCcw, Loader2 } from 'lucide-react';

export default function StudentCoursesPage() {
  const { user } = useAuthStore();
  const currentLevel = user?.gceLevel === 'Advanced' ? 'Advanced' : 'Ordinary';

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses based on the user's GCE level
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses?level=${currentLevel === 'Advanced' ? 'A-Level' : 'O-Level'}`);
      if (!res.ok) {
        throw new Error('Failed to fetch courses');
      }
      const json = await res.json();
      if (json.success) {
        setCourses(json.data);
      } else {
        throw new Error(json.message || 'Failed to fetch courses');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while loading courses.');
    } finally {
      setIsLoading(false);
    }
  }, [currentLevel]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-sm text-muted-foreground">
            Manage your enrolled {currentLevel === 'Advanced' ? 'A-Level' : 'O-Level'} subjects and track syllabus coverage.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            + Enroll New Subject
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your courses...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-red-100 p-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-800">Failed to load subjects</h3>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchCourses}
            className="bg-card border-red-200 text-red-700 hover:bg-red-50 gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted p-12 flex flex-col items-center text-center space-y-4">
          <p className="text-sm font-medium text-muted-foreground">No subjects found for this level.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            // For Phase 1, we don't have exact module progress calculated at the top-level yet, 
            // so we will mock a 0% progress, or calculate it if the API later provides it.
            const progress = course.progress || 0;
            const modulesCompleted = course.modulesCompleted || 0;
            const totalModules = course.topics?.length || 0;
            const nextTopic = course.topics?.[0]?.title || "N/A";

            return (
              <Card key={course._id} className="bg-card text-card-foreground border-border hover:border-primary/50 transition-all shadow-xs">
                <CardHeader className="pb-3">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    GCE {course.level} • {course.subject}
                  </span>
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">Next: {nextTopic}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1.5">
                      <span>{modulesCompleted}/{totalModules} Modules</span>
                      <span className="text-foreground font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  
                  <Link href={`/student/courses/${course._id}`} className="block w-full">
                    <Button variant="outline" className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                      Continue Learning
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}