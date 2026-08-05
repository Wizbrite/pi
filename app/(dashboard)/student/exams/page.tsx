import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const mockExams = [
  {
    id: 'p1-maths',
    subject: 'Pure Mathematics Paper 1',
    duration: '1h 30m',
    questions: 50,
    type: 'Multiple Choice (MCQ)',
    difficulty: 'Exam Standard',
  },
  {
    id: 'p2-physics',
    subject: 'Physics Paper 2',
    duration: '2h 30m',
    questions: 7,
    type: 'Structural & Calculation',
    difficulty: 'Advanced',
  },
  {
    id: 'p1-cs',
    subject: 'Computer Science Paper 1',
    duration: '1h 30m',
    questions: 50,
    type: 'Multiple Choice (MCQ)',
    difficulty: 'Intermediate',
  },
];

export default function MockExamsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mock Exams & Practice</h1>
        <p className="text-sm text-muted-foreground">Test your readiness with timed, GCE-formatted past questions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockExams.map((exam) => (
          <Card key={exam.id} className="bg-card border-border text-card-foreground shadow-xs">
            <CardHeader>
              <span className="text-xs font-medium text-accent-foreground bg-accent px-2.5 py-1 rounded-md w-fit">
                {exam.type}
              </span>
              <CardTitle className="text-lg mt-2">{exam.subject}</CardTitle>
              <CardDescription className="text-muted-foreground">{exam.duration} • {exam.questions} Questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs text-muted-foreground border-y border-border py-2.5">
                <span>Difficulty: <strong className="text-foreground">{exam.difficulty}</strong></span>
                <span>Format: <strong className="text-foreground">GCE Pattern</strong></span>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Start Mock
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}