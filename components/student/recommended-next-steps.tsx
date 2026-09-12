"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen, Brain, RefreshCw, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import type { NextStep } from "@/lib/types/adaptive";

export function RecommendedNextSteps() {
  const { user } = useAuthStore();
  const currentLevel = user?.gceLevel === "Advanced" ? "A-Level" : "O-Level";

  const [nextSteps, setNextSteps] = useState<NextStep[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRecommendations() {
      try {
        const res = await fetch("/api/student/adaptive/next-steps");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.nextSteps && isMounted) {
            setNextSteps(json.data.nextSteps);
          }
        }
      } catch (err) {
        console.error("Failed to load adaptive next steps:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRecommendations();
    return () => {
      isMounted = false;
    };
  }, []);

  const getTypeIcon = (type: NextStep["type"]) => {
    switch (type) {
      case "lesson":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "quiz":
        return <Brain className="h-4 w-4 text-purple-500" />;
      case "review":
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-primary" />;
    }
  };

  const getTypeBadge = (type: NextStep["type"]) => {
    switch (type) {
      case "lesson":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "quiz":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "review":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getActionHref = (step: NextStep) => {
    if (step.courseId) {
      return `/student/courses/${step.courseId}`;
    }
    return "/student/courses";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <h3 className="text-base font-bold text-foreground">
              Recommended Revisions
            </h3>
          </div>
          {/* <p className="text-xs text-muted-foreground mt-0.5">
            Personalized next lessons and revisions calculated by Bayesian Knowledge Tracing based on your performance
          </p> */}
        </div>
        <Link
          href="/student/courses"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 shrink-0"
        >
          View all courses
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-xs font-medium">Calculating adaptive recommendations...</span>
        </div>
      ) : nextSteps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground">Ready to start learning!</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Enroll in a course or take a practice lesson to receive personalized AI recommendations and revision schedules.
          </p>
          <Link
            href="/student/courses"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
          >
            Explore Courses
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {nextSteps.map((step, index) => (
            <div
              key={`${step.topicId}-${index}`}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-[11px] font-bold ${getTypeBadge(
                      step.type
                    )}`}
                  >
                    {getTypeIcon(step.type)}
                    <span className="capitalize">{step.type}</span> • {step.courseTitle}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">
                    {step.currentMastery}% Mastery
                  </span>
                </div>

                <h4 className="mt-3 font-bold text-foreground group-hover:text-primary transition-colors">
                  {step.topicTitle}
                </h4>
                {step.lessonTitle && (
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                    Lesson: {step.lessonTitle}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded-lg border border-border/50">
                  💡 {step.reason}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {currentLevel}
                </span>
                <Link
                  href={getActionHref(step)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform"
                >
                  {step.type === "review"
                    ? "Start Revision"
                    : step.type === "quiz"
                    ? "Take Quiz"
                    : "Start Lesson"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
