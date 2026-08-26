"use client";

import React, { use, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, ArrowRight, BotMessageSquare, Send, Sparkles, X,
  Loader2, AlertTriangle, RefreshCcw, StopCircle,
} from "lucide-react";
import { TopicQuizModal } from "@/components/student/topic-quiz-modal";
import { useAiTutor } from "@/hooks/use-ai-tutor";
import { buildLessonSystemPrompt } from "@/lib/ai/prompts";
import { usePracticeStore } from "@/stores/practice-store";

interface LessonPageProps {
  params: Promise<{ "course-id": string; "lesson-id": string }>;
}

export default function LessonDetailPage({ params }: LessonPageProps) {
  const resolvedParams = use(params);
  const courseId = resolvedParams["course-id"];
  const lessonId = resolvedParams["lesson-id"];

  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [topic, setTopic] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("part-1");
  const [aiQuery, setAiQuery] = useState("");
  const [activePartContent, setActivePartContent] = useState<string>("");

  // Keep a stable ref for the input value to avoid re-render focus loss
  const aiQueryRef = useRef(aiQuery);
  aiQueryRef.current = aiQuery;

  // ── AI Tutor hook ──────────────────────────────────────────────────────────
  const systemPrompt = lesson
    ? buildLessonSystemPrompt({
        lessonTitle: lesson.title,
        topicTitle: topic?.title ?? "Topic",
        courseTitle: course?.title ?? "Course",
        partContent: activePartContent,
      })
    : "You are Pi, an AI Tutor for GCE A-Level students.";

  const { response: aiResponse, isLoading: aiLoading, error: aiError, ask, reset: resetAi } = useAiTutor({
    systemPrompt,
    stream: true,
  });

  // ── Fetch lesson + course data ─────────────────────────────────────────────
  const fetchLessonData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [courseRes, lessonRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/lessons/${lessonId}`),
      ]);

      if (!courseRes.ok || !lessonRes.ok) throw new Error("Failed to fetch data");
      const courseJson = await courseRes.json();
      const lessonJson = await lessonRes.json();

      if (!courseJson.success) throw new Error(courseJson.message);
      if (!lessonJson.success) throw new Error(lessonJson.message);

      const courseData = courseJson.data.course;
      const fullLesson = lessonJson.data;
      const foundTopic = courseData.topics.find(
        (t: any) => t._id.toString() === fullLesson.topicId
      );

      setCourse(courseData);
      setTopic(foundTopic || { title: "Topic" });
      setLesson(fullLesson);

      if (fullLesson.parts?.length > 0) {
        const firstPart = fullLesson.parts[0];
        setActiveTab(`part-${firstPart.partNumber}`);
        setActivePartContent(firstPart.content ?? "");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load lesson");
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    fetchLessonData();
  }, [fetchLessonData]);

  // When the user switches tabs, update active part content for AI context
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    resetAi();
    if (lesson?.parts) {
      const partNum = parseInt(value.replace("part-", ""), 10);
      const part = lesson.parts.find((p: any) => p.partNumber === partNum);
      setActivePartContent(part?.content ?? "");
    }
  };

  const handleAskAI = async (e: React.FormEvent, predefinedHint?: string) => {
    e.preventDefault();
    const query = predefinedHint || aiQueryRef.current.trim();
    if (!query) return;
    if (!predefinedHint) setAiQuery("");
    await ask(query);
  };

  // ── Loading & error states ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading lesson content...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="p-6 text-center space-y-4 max-w-md mx-auto my-12">
        <div className="rounded-full bg-red-100 p-3 inline-block">
          <AlertTriangle className="h-6 w-6 text-red-600 mx-auto" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Error Loading Lesson</h2>
        <p className="text-sm text-red-600">{error || "Could not locate lesson."}</p>
        <div className="flex justify-center gap-2 mt-4">
          <Link href={`/student/courses/${courseId}`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Syllabus
            </Button>
          </Link>
          <Button onClick={fetchLessonData} className="bg-primary text-primary-foreground">
            <RefreshCcw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3 md:border-none md:pb-0">
        <Link
          href={`/student/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {course?.title || "Topics"}
        </Link>
        <Badge variant="outline" className="text-[11px] md:hidden">
          {lesson.parts?.length || 0} Parts
        </Badge>
      </div>

      {/* Lesson Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="accent" className="text-[10px] uppercase tracking-wider">
            {topic?.title || "Module"}
          </Badge>
          <span className="hidden md:inline text-xs text-muted-foreground">
            • {lesson.parts?.length || 0} Parts
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
          {lesson.title}
        </h1>
      </div>

      {/* Lesson Reader Card */}
      <Card className="bg-card border-border text-card-foreground shadow-xs p-4 md:p-6 space-y-6">
        {lesson.parts && lesson.parts.length > 0 ? (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden bg-muted/50 p-1">
              {lesson.parts.map((part: any) => (
                <TabsTrigger
                  key={part.partNumber}
                  value={`part-${part.partNumber}`}
                  className="text-xs md:text-sm whitespace-nowrap"
                >
                  Part {part.partNumber}
                </TabsTrigger>
              ))}
            </TabsList>

            {lesson.parts.map((part: any) => (
              <TabsContent
                key={part.partNumber}
                value={`part-${part.partNumber}`}
                className="mt-6 space-y-6 focus:outline-none"
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">{part.title}</h3>
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                    <ReactMarkdown>{part.content}</ReactMarkdown>
                  </div>
                </div>

                {/* Per-part AI Concept Check — only shows prompt hint, no response here */}
                {part.aiPromptHint && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <div className="flex gap-2 items-start">
                      <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <h4 className="text-sm font-semibold text-foreground">Concept Check</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {part.aiPromptHint}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={(e) => handleAskAI(e, part.aiPromptHint)}
                          disabled={aiLoading}
                        >
                          {aiLoading ? (
                            <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Asking Pi...</>
                          ) : (
                            <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Ask Pi AI Tutor</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="p-4 bg-muted/60 rounded-xl border border-border/80">
            <p className="text-sm text-foreground">This lesson has no content parts yet.</p>
          </div>
        )}

        {/* Desktop AI Tutor Panel — single response location */}
        <div className="hidden md:block pt-6 border-t border-border space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              Stuck? Ask Pi your AI Tutor
            </h4>
            {(aiLoading || aiResponse) && (
              <button
                onClick={resetAi}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <RefreshCcw className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Inlined form — NOT a sub-component, so input never loses focus */}
          <form onSubmit={handleAskAI} className="flex gap-2">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder={`Ask a question about ${lesson.title}...`}
              disabled={aiLoading}
              className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button
              type="submit"
              disabled={aiLoading || !aiQuery.trim()}
              className="bg-primary text-primary-foreground shrink-0"
            >
              {aiLoading ? <StopCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>

          {/* Single AI Response Box */}
          {(aiLoading || aiResponse || aiError) && (
            <div className="p-4 bg-accent/60 border border-primary/20 rounded-xl text-sm text-accent-foreground leading-relaxed min-h-[60px]">
              {aiLoading && !aiResponse && (
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Pi is thinking...
                </div>
              )}
              {aiResponse && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                </div>
              )}
              {aiError && <p className="text-xs text-red-500 mt-1">{aiError}</p>}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-border flex justify-between items-center">
          <Link href={`/student/courses/${courseId}`}>
            <Button variant="outline" size="sm" className="border-border text-foreground">
              Return to Topics
            </Button>
          </Link>
          <Button
            onClick={() => setIsQuizOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px] px-5 active:scale-95"
          >
            Take Mastery Quiz <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>

      {/* Mobile FAB — AI Tutor */}
      <button
        onClick={() => setIsAiDrawerOpen(true)}
        aria-label="Open AI Tutor"
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-all md:hidden"
      >
        <BotMessageSquare className="h-6 w-6" />
      </button>

      {/* Mobile AI Drawer */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex flex-col justify-end md:hidden animate-in fade-in">
          <div className="bg-background border-t border-border rounded-t-2xl flex flex-col animate-in slide-in-from-bottom duration-200" style={{ maxHeight: "75vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3 shrink-0">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Sparkles className="w-4 h-4 text-primary" /> Pi AI Tutor
              </div>
              <button
                onClick={() => { setIsAiDrawerOpen(false); resetAi(); }}
                aria-label="Close AI Drawer"
                className="p-1 rounded-md text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input — always visible at top */}
            <div className="px-5 pt-4 pb-3 shrink-0">
              <form onSubmit={handleAskAI} className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Type your question..."
                  disabled={aiLoading}
                  autoFocus
                  className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[44px]"
                />
                <Button
                  type="submit"
                  disabled={aiLoading || !aiQuery.trim()}
                  className="bg-primary text-primary-foreground shrink-0 min-h-[44px]"
                >
                  {aiLoading ? <StopCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>

            {/* Scrollable response area */}
            {(aiLoading || aiResponse || aiError) && (
              <div className="flex-1 overflow-y-auto px-5 pb-5">
                <div className="p-4 bg-accent/60 border border-primary/20 rounded-xl text-sm text-accent-foreground leading-relaxed">
                  {aiLoading && !aiResponse && (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Loader2 className="w-4 h-4 animate-spin" /> Pi is thinking...
                    </div>
                  )}
                  {aiResponse && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{aiResponse}</ReactMarkdown>
                    </div>
                  )}
                  {aiError && <p className="text-xs text-red-500">{aiError}</p>}
                </div>
              </div>
            )}

            {/* Bottom padding for safe area */}
            <div className="h-4 shrink-0" />
          </div>
        </div>
      )}

      {/* Mastery Quiz Modal */}
      {lesson && course && topic && (
        <TopicQuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          topicTitle={topic.title}
          lessonTitle={lesson.title}
          lessonId={lesson._id.toString()}
          courseTitle={course.title}
          onQuizComplete={(finalScore: number, earnedXp: number, failedQuestions: any[]) => {
            console.log("Quiz completed. Score:", finalScore);
            const { addMistake } = usePracticeStore.getState();
            failedQuestions?.forEach((q) => {
              addMistake({
                subject: course.title,
                topic: topic.title,
                lesson: lesson.title,
                question: q.questionText,
                incorrectAnswer: q.userAnswer,
                correctAnswer: q.correctAnswer,
              });
            });
          }}
        />
      )}
    </div>
  );
}