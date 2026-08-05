"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Calculator, Zap, Clock } from "lucide-react";

interface RecommendedModule {
  id: string;
  title: string;
  subject: string;
  paper: string;
  duration: string;
  questionCount: number;
  level: string;
  href: string;
  badgeColor: string;
}

const recommendedModules: RecommendedModule[] = [
  {
    id: "1",
    title: "Algebra & Polynomial Functions Practice",
    subject: "Pure Mathematics",
    paper: "Paper 1",
    duration: "15 mins",
    questionCount: 10,
    level: "A Level",
    href: "/student/exams?subject=pure-maths&topic=algebra",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200/60",
  },
  {
    id: "2",
    title: "Mechanics & Kinematics Quick Quiz",
    subject: "Physics",
    paper: "Paper 2",
    duration: "20 mins",
    questionCount: 12,
    level: "A Level",
    href: "/student/exams?subject=physics&topic=mechanics",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  },
];

export function RecommendedNextSteps() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recommended for You</h3>
          <p className="text-xs text-slate-500">
            Handpicked practice modules based on your curriculum
          </p>
        </div>
        <Link
          href="/student/courses"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {recommendedModules.map((module) => (
          <div
            key={module.id}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-blue-300 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-bold ${module.badgeColor}`}
                >
                  {module.subject} • {module.paper}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <Clock className="h-3 w-3" />
                  {module.duration}
                </span>
              </div>

              <h4 className="mt-3 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {module.title}
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                {module.questionCount} GCE-aligned multiple choice & structural questions
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">
                {module.level}
              </span>
              <Link
                href={module.href}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform"
              >
                Start Practice
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
