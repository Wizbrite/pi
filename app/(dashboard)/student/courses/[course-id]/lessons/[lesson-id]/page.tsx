"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Sparkles, Send, ArrowRight, X, BotMessageSquare } from "lucide-react";
import { TopicQuizModal } from "@/components/student/topic-quiz-modal";
import { MOCK_COURSES } from "@/lib/mock-data";
import { usePracticeStore } from "@/stores/practice-store";

interface PageProps {
  params: Promise<{
    "course-id": string;
    "lesson-id": string;
  }>;
}

export default function LessonDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const addMistake = usePracticeStore((state) => state.addMistake);
  const courseId = resolvedParams["course-id"];
  const lessonId = resolvedParams["lesson-id"];

  const course = MOCK_COURSES[courseId];

  let topic = null;
  let lesson = null;

  if (course) {
    for (const t of course.topics) {
      const foundLesson = t.lessons.find((l) => l.id === lessonId);
      if (foundLesson) {
        topic = t;
        lesson = foundLesson;
        break;
      }
    }
  }

  const [aiQuery, setAiQuery] = useState("");
  const [aiHelpResponse, setAiHelpResponse] = useState<string | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  if (!course || !topic || !lesson) {
    return (
      <div className="p-6 text-center space-y-4 max-w-md mx-auto my-12">
        <h2 className="text-xl font-bold text-foreground">Lesson Not Found</h2>
        <p className="text-sm text-muted-foreground">
          Could not locate lesson <code className="bg-muted px-2 py-1 rounded text-primary">{lessonId}</code> under course <code className="bg-muted px-2 py-1 rounded text-primary">{courseId}</code>.
        </p>
        <Link href={course ? `/student/courses/${course.id}` : "/student/courses"}>
          <Button variant="outline" className="mt-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Syllabus
          </Button>
        </Link>
      </div>
    );
  }

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiHelpResponse(
      `AI Tutor (${lesson.title}): Here is an explanation for "${aiQuery}". This aligns with GCE requirements.`
    );
    setAiQuery("");
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 touch-action-manipulation">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3 md:border-none md:pb-0">
        <Link
          href={`/student/courses/${course.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {course.title} Topics
        </Link>
        <Badge variant="outline" className="text-[11px] md:hidden">
          {lesson.duration}
        </Badge>
      </div>

      {/* Lesson Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="accent" className="text-[10px] uppercase tracking-wider">
            {topic.title}
          </Badge>
          <span className="hidden md:inline text-xs text-muted-foreground">• Estimated {lesson.duration}</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{lesson.title}</h1>
      </div>

      {/* Touch-Optimized Reader Card */}
      <Card className="bg-card border-border text-card-foreground shadow-xs p-4 md:p-6 space-y-6">
        {/* Overview Box */}
        <div className="p-4 bg-muted/60 rounded-xl border border-border/80">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Overview</h3>
          <p className="text-sm md:text-base text-foreground leading-relaxed">{lesson.content.overview}</p>
        </div>

        {/* Section Breakdown */}
        <div className="space-y-6 text-sm md:text-base px-1 md:px-2">
          {lesson.content.sections.map((sec, idx) => (
            <section key={idx} className="space-y-2">
              <h3 className="text-base md:text-lg font-bold text-foreground">{sec.heading}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{sec.text}</p>
            </section>
          ))}
        </div>

        {/* Inline AI Tutor Widget (Desktop View) */}
        <div className="hidden md:block pt-6 border-t border-border space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Stuck on this lesson? Ask your AI Tutor</h4>
          </div>

          <form onSubmit={handleAskAI} className="flex gap-2">
            <Input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder={`Ask a question about ${lesson.title}...`}
              className="bg-background border-input text-foreground text-sm"
            />
            <Button type="submit" className="bg-primary text-primary-foreground shrink-0">
              <Send className="w-4 h-4 mr-1" /> Ask AI
            </Button>
          </form>

          {aiHelpResponse && (
            <div className="p-4 bg-accent border border-primary/20 rounded-lg text-xs text-accent-foreground">
              {aiHelpResponse}
            </div>
          )}
        </div>

        {/* Bottom Desktop Actions */}
        <div className="pt-4 border-t border-border flex justify-between items-center">
          <Link href={`/student/courses/${course.id}`}>
            <Button variant="outline" size="sm" className="border-border text-foreground">
              Return to Topics
            </Button>
          </Link>
          <Button
            onClick={() => setIsQuizOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px] px-5 active:scale-95"
          >
            Complete & Continue <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>

      {/* Mobile Floating Action Button (FAB) for AI Tutor */}
      <button
        onClick={() => setIsAiDrawerOpen(true)}
        aria-label="Open AI Tutor Drawer"
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-all md:hidden"
      >
        <BotMessageSquare className="h-6 w-6" />
      </button>

      {/* Mobile Slide-Up AI Drawer / Sheet */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in">
          <div className="bg-background border-t border-border rounded-t-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Sparkles className="w-4 h-4 text-primary" /> Ask AI Tutor
              </div>
              <button onClick={() => setIsAiDrawerOpen(false)} aria-label="Close AI Drawer" className="p-1 rounded-md text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAskAI} className="space-y-3">
              <Input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Type your question..."
                className="bg-background border-input text-sm min-h-[48px]"
              />
              <Button type="submit" className="w-full min-h-[48px] bg-primary text-primary-foreground">
                <Send className="w-4 h-4 mr-2" /> Send to AI Tutor
              </Button>
            </form>

            {aiHelpResponse && (
              <div className="p-4 bg-accent border border-primary/20 rounded-xl text-xs text-accent-foreground leading-relaxed">
                {aiHelpResponse}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Integrated Assessment Drawer/Modal */}
      <TopicQuizModal
  isOpen={isQuizOpen}
  onClose={() => setIsQuizOpen(false)}
  topicTitle={topic.title}
  lessonTitle={lesson.title}
  onQuizComplete={(finalScore, earnedXp, failedQuestions) => {
    failedQuestions?.forEach((q) => {
      addMistake({
        subject: course.title,
        topic: topic.title,
        question: q.questionText,
        incorrectAnswer: q.userAnswer,
        correctAnswer: q.correctAnswer,
      });
    });
  }}
/>
    </div>
  );
}