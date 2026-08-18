"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

const mockSubjects = [
  // O-Level
  {
    id: 'math-0580',
    title: 'Mathematics',
    code: 'GCE O-Level • 0580',
    level: 'Ordinary',
    progress: 75,
    modulesCompleted: 15,
    totalModules: 20,
    nextTopic: 'Trigonometry',
  },
  {
    id: 'biology-0610',
    title: 'Biology',
    code: 'GCE O-Level • 0610',
    level: 'Ordinary',
    progress: 45,
    modulesCompleted: 9,
    totalModules: 20,
    nextTopic: 'Human Physiology',
  },
  {
    id: 'chemistry-0620',
    title: 'Chemistry',
    code: 'GCE O-Level • 0620',
    level: 'Ordinary',
    progress: 30,
    modulesCompleted: 6,
    totalModules: 20,
    nextTopic: 'Organic Chemistry Basics',
  },
  {
    id: 'physics-0625',
    title: 'Physics',
    code: 'GCE O-Level • 0625',
    level: 'Ordinary',
    progress: 60,
    modulesCompleted: 12,
    totalModules: 20,
    nextTopic: 'Forces and Motion',
  },
  // A-Level
  {
    id: 'pure-maths-0770',
    title: 'Pure Mathematics',
    code: 'GCE A-Level • 0770',
    level: 'Advanced',
    progress: 65,
    modulesCompleted: 13,
    totalModules: 20,
    nextTopic: 'Calculus: Integration by Parts',
  },
  {
    id: 'physics-0780',
    title: 'Physics',
    code: 'GCE A-Level • 0780',
    level: 'Advanced',
    progress: 40,
    modulesCompleted: 8,
    totalModules: 20,
    nextTopic: 'Electromagnetism & Faraday’s Law',
  },
  {
    id: 'computer-science-0795',
    title: 'Computer Science',
    code: 'GCE A-Level • 0795',
    level: 'Advanced',
    progress: 80,
    modulesCompleted: 16,
    totalModules: 20,
    nextTopic: 'Data Structures: Binary Trees',
  },
];

export default function StudentCoursesPage() {
  const { user } = useAuthStore();
  const [simulateError, setSimulateError] = useState(false);

  // Default to Ordinary if user is not fully loaded or gceLevel is undefined
  const currentLevel = user?.gceLevel === 'Advanced' ? 'Advanced' : 'Ordinary';

  const filteredSubjects = useMemo(() => {
    return mockSubjects.filter((subject) => subject.level === currentLevel);
  }, [currentLevel]);

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
          <Button 
            variant="outline" 
            onClick={() => setSimulateError(!simulateError)}
            className="text-violet-600 border-violet-200 hover:bg-violet-50"
          >
            Toggle Error State
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            + Enroll New Subject
          </Button>
        </div>
      </div>

      {simulateError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-red-100 p-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-800">Failed to load subjects</h3>
            <p className="text-xs text-red-600 mt-1">There was a problem communicating with the server.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSimulateError(false)}
            className="bg-card border-red-200 text-red-700 hover:bg-red-50 gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted p-12 flex flex-col items-center text-center space-y-4">
          <p className="text-sm font-medium text-muted-foreground">No subjects found for this level.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((course) => (
            <Card key={course.id} className="bg-card text-card-foreground border-border hover:border-primary/50 transition-all shadow-xs">
              <CardHeader className="pb-3">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{course.code}</span>
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <CardDescription className="text-muted-foreground">Next: {course.nextTopic}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1.5">
                    <span>{course.modulesCompleted}/{course.totalModules} Modules</span>
                    <span className="text-foreground font-semibold">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
                
                <Link href={`/student/courses/${course.id}`} className="block w-full">
                  <Button variant="outline" className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                    Continue Learning
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}