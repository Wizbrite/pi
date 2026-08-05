import React from 'react';
import Link from 'next/link'; // 1. Import Next.js Link
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const enrolledCourses = [
  {
    id: 'pure-maths-0770',
    title: 'Pure Mathematics',
    code: 'GCE A-Level • 0770',
    progress: 65,
    modulesCompleted: 13,
    totalModules: 20,
    nextTopic: 'Calculus: Integration by Parts',
  },
  {
    id: 'physics-0780',
    title: 'Physics',
    code: 'GCE A-Level • 0780',
    progress: 40,
    modulesCompleted: 8,
    totalModules: 20,
    nextTopic: 'Electromagnetism & Faraday’s Law',
  },
  {
    id: 'computer-science-0795',
    title: 'Computer Science',
    code: 'GCE A-Level • 0795',
    progress: 80,
    modulesCompleted: 16,
    totalModules: 20,
    nextTopic: 'Data Structures: Binary Trees',
  },
];

export default function StudentCoursesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-sm text-muted-foreground">Manage your enrolled GCE subjects and track syllabus coverage.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          + Enroll New Subject
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledCourses.map((course) => (
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
              
              {/* 2. Wrap button with Link navigating to /student/courses/[id] */}
              <Link href={`/student/courses/${course.id}`} className="block w-full">
                <Button variant="outline" className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                  Continue Learning
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}