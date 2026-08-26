"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useMemo } from "react";

interface RecommendedModule {
  id: string;
  title: string;
  subject: string;
  paper: string;
  duration: string;
  questionCount: number;
  level: "A Level" | "O Level";
  href: string;
  badgeColor: string;
}

const recommendedModules: RecommendedModule[] = [
  // A-Level Modules
  {
    id: "1",
    title: "Algebra & Polynomial Functions Practice",
    subject: "Pure Mathematics",
    paper: "Paper 1",
    duration: "15 mins",
    questionCount: 10,
    level: "A Level",
    href: "/student/exams?subject=pure-maths&topic=algebra",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
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
    badgeColor: "bg-primary/10 text-primary border-primary/20",
  },
  // O-Level Modules
  {
    id: "3",
    title: "Trigonometry Basics",
    subject: "Mathematics",
    paper: "Paper 1",
    duration: "15 mins",
    questionCount: 10,
    level: "O Level",
    href: "/student/exams?subject=maths&topic=trigonometry",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
  },
  {
    id: "4",
    title: "Forces and Motion Quiz",
    subject: "Physics",
    paper: "Paper 2",
    duration: "20 mins",
    questionCount: 15,
    level: "O Level",
    href: "/student/exams?subject=physics&topic=forces",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
  }
];

export function RecommendedNextSteps() {
  const { user } = useAuthStore();
  const currentLevel = user?.gceLevel === "Advanced" ? "A Level" : "O Level";

  const filteredModules = useMemo(() => {
    return recommendedModules.filter((module) => module.level === currentLevel);
  }, [currentLevel]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">Recommended for You</h3>
          <p className="text-xs text-muted-foreground">
            Handpicked practice modules based on your {currentLevel} curriculum
          </p>
        </div>
        <Link
          href="/student/courses"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filteredModules.map((module) => (
          <div
            key={module.id}
            className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-bold ${module.badgeColor}`}
                >
                  {module.subject} • {module.paper}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {module.duration}
                </span>
              </div>

              <h4 className="mt-3 font-bold text-foreground group-hover:text-primary transition-colors">
                {module.title}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                {module.questionCount} GCE-aligned multiple choice & structural questions
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">
                {module.level}
              </span>
              <Link
                href={module.href}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform"
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
