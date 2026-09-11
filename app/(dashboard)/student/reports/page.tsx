"use client";

import { StudentAIStudyReport } from "@/components/student/ai-study-report";

export default function StudentReportsPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">AI Study Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time AI diagnostic breakdown of your GCE study progress, habits, and target weak areas.
        </p>
      </div>

      {/* Main Student AI Report Component */}
      <StudentAIStudyReport />
    </div>
  );
}
