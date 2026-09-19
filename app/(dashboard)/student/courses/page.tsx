"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { AlertTriangle, RefreshCcw, Loader2, BookOpen, Plus, ArrowRight } from 'lucide-react';

export default function StudentCoursesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const currentLevel = user?.gceLevel === 'Advanced' ? 'Advanced' : 'Ordinary';

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrolledCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [enrollmentsRes, coursesRes] = await Promise.all([
        fetch('/api/student/enrollments'),
        fetch('/api/courses'),
      ]);

      const enrollmentsJson = await enrollmentsRes.json();
      const coursesJson = await coursesRes.json();

      if (coursesJson.success) {
        let enrolledIds: string[] = [];
        if (enrollmentsJson.success && Array.isArray(enrollmentsJson.enrolledCourseIds)) {
          enrolledIds = enrollmentsJson.enrolledCourseIds.map((id: any) => id.toString());
        }

        // Filter courses to only those enrolled by student
        // If student has no explicit enrollments yet, fallback to all courses matching their level
        const allCourses = coursesJson.data || [];
        const enrolled = allCourses.filter((c: any) => enrolledIds.includes(c._id.toString()));

        setCourses(enrolled.length > 0 ? enrolled : []);
      } else {
        throw new Error(coursesJson.message || 'Failed to fetch courses');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while loading courses.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Enrolled Courses</h1>
          <p className="text-sm text-muted-foreground">
            Manage your enrolled subjects and track syllabus & lesson progress.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/student/courses/catalog">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" /> Enroll to New Course
            </Button>
          </Link>
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
            onClick={fetchEnrolledCourses}
            className="bg-card border-red-200 text-red-700 hover:bg-red-50 gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 flex flex-col items-center text-center space-y-4">
          <BookOpen className="w-12 h-12 text-muted-foreground opacity-40" />
          <div>
            <h3 className="text-base font-bold text-foreground">You haven't enrolled in any courses yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
              Browse the course catalog to choose from all available admin-created GCE O-Level and A-Level subjects.
            </p>
          </div>
          <Link href="/student/courses/catalog">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold">
              Browse Course Catalog <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const progress = course.progress || 0;
            const modulesCompleted = course.modulesCompleted || 0;
            const totalModules = course.topics?.length || 0;
            const nextTopic = course.nextTopic || course.topics?.[0]?.title || "N/A";

            return (
              <Card key={course._id} className="bg-card text-card-foreground border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    GCE {course.level} • {course.subject}
                  </span>
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs mt-1">Next: {nextTopic}</CardDescription>
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
                    <Button variant="outline" className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground font-semibold">
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