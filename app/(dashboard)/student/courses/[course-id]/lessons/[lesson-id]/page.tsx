"use client";

import React, { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, BotMessageSquare, Send, Sparkles, X, Loader2, AlertTriangle, RefreshCcw } from "lucide-react";
import { TopicQuizModal } from "@/components/student/topic-quiz-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';

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

  const [aiQuery, setAiQuery] = useState("");
  const [aiHelpResponse, setAiHelpResponse] = useState<string | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("part-1");

  const fetchLessonData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [courseRes, lessonRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/lessons/${lessonId}`)
      ]);
      
      if (!courseRes.ok || !lessonRes.ok) throw new Error("Failed to fetch data");
      const courseJson = await courseRes.json();
      const lessonJson = await lessonRes.json();
      
      if (!courseJson.success) throw new Error(courseJson.message);
      if (!lessonJson.success) throw new Error(lessonJson.message);

      const courseData = courseJson.data.course;
      const fullLesson = lessonJson.data;

      const foundTopic = courseData.topics.find((t: any) => t._id.toString() === fullLesson.topicId);

      setCourse(courseData);
      setTopic(foundTopic || { title: "Topic" });
      setLesson(fullLesson);
      
      if (fullLesson.parts && fullLesson.parts.length > 0) {
        setActiveTab(`part-${fullLesson.parts[0].partNumber}`);
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

  const handleAskAI = (e: React.FormEvent, predefinedHint?: string) => {
    e.preventDefault();
    const query = predefinedHint || aiQuery.trim();
    if (!query) return;

    setAiHelpResponse(
      `AI Tutor (${lesson?.title || "Lesson"}): This is a simulated AI response for "${query}". In a fully integrated system, this would securely query the Mistral API using the lesson context.`
    );
    if (!predefinedHint) setAiQuery("");
  };

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
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 touch-action-manipulation">
      {/* Back Navigation Bar */}
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
          <span className="hidden md:inline text-xs text-muted-foreground">• {lesson.parts?.length || 0} Parts</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{lesson.title}</h1>
      </div>

      {/* Touch-Optimized Reader Card */}
      <Card className="bg-card border-border text-card-foreground shadow-xs p-4 md:p-6 space-y-6">
        
        {lesson.parts && lesson.parts.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden hide-scrollbar bg-muted/50 p-1">
              {lesson.parts.map((part: any) => (
                <TabsTrigger 
                  key={part._id || part.partNumber} 
                  value={`part-${part.partNumber}`}
                  className="text-xs md:text-sm whitespace-nowrap"
                >
                  Part {part.partNumber}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {lesson.parts.map((part: any) => (
              <TabsContent 
                key={part._id || part.partNumber} 
                value={`part-${part.partNumber}`}
                className="mt-6 space-y-6 focus:outline-none"
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">{part.title}</h3>
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                    <ReactMarkdown>{part.content}</ReactMarkdown>
                  </div>
                </div>

                {part.aiPromptHint && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-6">
                    <div className="flex gap-2 items-start">
                      <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">Concept Check</h4>
                        <p className="text-xs md:text-sm text-muted-foreground mb-3">{part.aiPromptHint}</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          onClick={(e) => handleAskAI(e, part.aiPromptHint)}
                        >
                          Ask AI Tutor
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
             <p className="text-sm md:text-base text-foreground leading-relaxed">This lesson has no content parts available.</p>
          </div>
        )}

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
      {lesson && course && topic && (
        <TopicQuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          topicTitle={topic.title}
          lessonTitle={lesson.title}
          lessonId={lesson._id.toString()}
          onQuizComplete={(finalScore: number, earnedXp: number, failedQuestions: any[]) => {
            console.log("Quiz completed. Score:", finalScore);
          }}
        />
      )}
    </div>
  );
}