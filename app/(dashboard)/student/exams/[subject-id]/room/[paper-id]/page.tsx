"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Bot,
  Send,
  ChevronLeft,
  ChevronRight,
  X,
  Grid,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePracticeStore } from "@/stores/practice-store";

// Interface Definitions
export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  correctAnswerText: string;
  type: "MCQ" | "Structured";
  marks: number;
  topic: string;
  markingSchemeNotes?: string;
  aiExplanation?: string;
}

interface PaperMeta {
  title: string;
  type: "MCQ" | "Structured";
  durationMinutes: number;
  totalMarks: number;
  year: number;
}

export default function ExamRoomPage({
  params,
}: {
  params:
    | Promise<{ "subject-id": string; "paper-id": string }>
    | { "subject-id": string; "paper-id": string };
}) {
  const router = useRouter();
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const subjectId = resolvedParams?.["subject-id"];
  const paperId = resolvedParams?.["paper-id"];

  // Data fetching states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [paperMeta, setPaperMeta] = useState<PaperMeta | null>(null);
  const [isLoadingPaper, setIsLoadingPaper] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Exam states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number | string>
  >({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<number[]>([]);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isNavGridOpenMobile, setIsNavGridOpenMobile] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiChat, setAiChat] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([
    {
      sender: "ai",
      text: "Hello! I am your AI GCE Tutor. Stuck on this question? Ask me for hints or concept explanations!",
    },
  ]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch paper + questions from API
  useEffect(() => {
    if (!subjectId || !paperId) return;
    async function fetchPaper() {
      try {
        setIsLoadingPaper(true);
        const res = await fetch(`/api/exams/${subjectId}/papers/${paperId}`);
        if (!res.ok) {
          setFetchError("Failed to load exam paper.");
          return;
        }
        const json = await res.json();
        const data = json.data;

        setPaperMeta({
          title: data.title,
          type:
            data.type ||
            (data.questions?.[0]?.type === "MCQ" ? "MCQ" : "Structured"),
          durationMinutes: data.durationMinutes,
          totalMarks: data.totalMarks,
          year: data.year,
        });

        const mappedQuestions: Question[] = (data.questions || []).map(
          (q: any) => ({
            id: q.id || q.questionNumber,
            text: q.text,
            options: q.options || [],
            correctAnswerIndex: q.correctAnswerIndex ?? 0,
            correctAnswerText: q.correctAnswerText || "",
            type: q.type || (q.options?.length > 0 ? "MCQ" : "Structured"),
            marks: q.marks,
            topic: q.topic,
            markingSchemeNotes: q.markingSchemeNotes || "",
            aiExplanation: q.aiExplanation || "",
          })
        );

        setQuestions(mappedQuestions);
        setTimeLeftSeconds(data.durationMinutes * 60);
        setTimerStarted(true);
      } catch (err) {
        console.error("Failed to fetch exam paper:", err);
        setFetchError("Failed to load exam paper.");
      } finally {
        setIsLoadingPaper(false);
      }
    }
    fetchPaper();
  }, [subjectId, paperId]);

  // Timer Effect
  useEffect(() => {
    if (!timerStarted) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timerStarted]);

  // Format Time (HH:MM:SS)
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? `${hours}:` : ""}${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Loading state
  if (isLoadingPaper) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading exam paper…
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-lg font-bold text-foreground">
            Could not load exam
          </h2>
          <p className="text-sm text-muted-foreground">
            {fetchError || "No questions found for this paper."}
          </p>
          <Link href={`/student/exams/${subjectId}`}>
            <Button size="sm" className="text-xs">
              Back to Papers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const TOTAL_TIME = (paperMeta?.durationMinutes || 90) * 60;
  const currentQ = questions[currentQuestionIndex];

  // Option Selection / Text Input
  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  const handleTextInput = (text: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: text,
    }));
  };

  // Toggle Bookmark
  const toggleBookmark = (qId: number) => {
    setBookmarkedQuestions((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  // Handle AI Chat submit
  const handleSendAiQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userText = aiPrompt;
    setAiChat((prev) => [...prev, { sender: "user", text: userText }]);
    setAiPrompt("");

    setTimeout(() => {
      setAiChat((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `For Question ${currentQ.id} on ${currentQ.topic}: Think about the key concepts related to this topic. Review your notes on ${currentQ.topic} for the relevant principles and definitions.`,
        },
      ]);
    }, 800);
  };

  // Submit Exam — saves to MongoDB AND localStorage (for backward compatibility)
  const handleSubmitExam = async () => {
    if (isSubmitting) return;

    const unansweredCount = questions.filter(
      (q) => selectedAnswers[q.id] === undefined || selectedAnswers[q.id] === ""
    ).length;

    const confirmMsg =
      unansweredCount > 0
        ? `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`
        : "Are you sure you want to submit your exam?";

    if (!confirm(confirmMsg)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const timeSpentSeconds = TOTAL_TIME - timeLeftSeconds;
    const { addMistake } = usePracticeStore.getState();

    const processedQuestions = questions.map((q, idx) => {
      const selectedVal = selectedAnswers[q.id];
      const isAnswered = selectedVal !== undefined && selectedVal !== "";
      let isCorrect = false;
      let userAnswerText = "Unanswered";

      if (q.type === "MCQ") {
        isCorrect = isAnswered && selectedVal === q.correctAnswerIndex;
        userAnswerText = isAnswered
          ? q.options[(selectedVal as number)] || `Option ${(selectedVal as number) + 1}`
          : "Unanswered";
      } else {
        userAnswerText = isAnswered ? (selectedVal as string) : "Unanswered";
        isCorrect = false; // Structured questions need manual/AI grading
      }

      // Record mistake if incorrect MCQ
      if (!isCorrect && isAnswered && q.type === "MCQ") {
        addMistake({
          subject: subjectId || "Subject",
          topic: q.topic,
          lesson: "Exam",
          question: q.text,
          incorrectAnswer: userAnswerText,
          correctAnswer:
            q.correctAnswerText || q.options[q.correctAnswerIndex] || "",
        });
      }

      return {
        questionId: q.id,
        questionNumber: idx + 1,
        text: q.text,
        topic: q.topic,
        userAnswer: userAnswerText,
        correctAnswer:
          q.correctAnswerText || q.options[q.correctAnswerIndex] || "",
        options: q.options,
        isCorrect,
        marksObtained: isCorrect ? q.marks : 0,
        totalMarks: q.marks,
        markingSchemeNotes:
          q.markingSchemeNotes ||
          "Standard marking scheme guidelines apply.",
        aiExplanation:
          q.aiExplanation ||
          "Review the official core syllabus for this topic.",
      };
    });

    const score = processedQuestions.reduce((sum, q) => sum + q.marksObtained, 0);
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    // Prepare payload for API
    const apiPayload = {
      paperId: paperId || "default-paper",
      paperTitle: paperMeta?.title || "GCE Past Paper Exam",
      totalMarks,
      timeSpentSeconds,
      questions: processedQuestions,
    };

    // Prepare payload for localStorage (backward compatibility)
    const localStoragePayload = {
      ...apiPayload,
      subjectId: subjectId || "default-subject",
    };

    try {
      // Save to MongoDB via API
      const res = await fetch(`/api/exams/${subjectId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      if (res.ok) {
        const json = await res.json();
        const attemptId = json.data.attemptId;

        // Also save to localStorage for the results page (backward compat)
        localStorage.setItem(
          `exam_attempt_${attemptId}`,
          JSON.stringify(localStoragePayload)
        );

        // Navigate to results with the NEW attempt ID from MongoDB
        router.push(
          `/student/exams/${subjectId}/results/${attemptId}`
        );
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save exam");
      }
    } catch (error: any) {
      console.error("Failed to submit exam:", error);
      setSubmitError(error.message || "Failed to submit exam. Please try again.");

      // Fallback: save to localStorage only and use paperId as attempt ID
      console.warn("Falling back to localStorage-only save");
      localStorage.setItem(
        `exam_attempt_${paperId}`,
        JSON.stringify(localStoragePayload)
      );
      router.push(`/student/exams/${subjectId}/results/${paperId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col -m-3 sm:-m-6 p-3 sm:p-6">
      {/* SUBMISSION ERROR BANNER */}
      {submitError && (
        <div className="mb-4 bg-destructive/10 border border-destructive/30 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive flex-1">{submitError}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSubmitError(null)}
            className="text-destructive h-8 px-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 1. MOBILE-RESPONSIVE TOP EXAM HEADER */}
      <header className="bg-card border border-border rounded-2xl p-3 sm:p-4 shadow-xs space-y-3 mb-4 sm:mb-6 sticky top-2 sm:top-4 z-20 backdrop-blur-md bg-card/95">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href={`/student/exams/${subjectId}`}
              className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="truncate">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] sm:text-xs font-mono font-bold text-muted-foreground uppercase">
                  {subjectId}
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] sm:text-[10px] py-0 px-1.5 font-semibold"
                >
                  {paperMeta?.type === "MCQ"
                    ? "Paper (MCQ)"
                    : "Paper (Structured)"}
                </Badge>
              </div>
              <h1 className="text-xs sm:text-sm font-bold text-foreground truncate">
                {paperMeta?.year} GCE — {paperMeta?.title}
              </h1>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNavGridOpenMobile(!isNavGridOpenMobile)}
            className="lg:hidden text-xs gap-1 h-8 px-2.5 shrink-0"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">
              {currentQuestionIndex + 1}/{questions.length}
            </span>
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl text-primary font-mono font-bold text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAiOpen(!isAiOpen)}
              className="text-xs font-semibold gap-1 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 h-8 px-2.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden sm:inline">AI Tutor</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1 h-8 px-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {isSubmitting ? "Submitting..." : "Submit Exam"}
              </span>
              <span className="sm:hidden">
                {isSubmitting ? "..." : "Submit"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 flex-1 items-start">
        {/* QUESTION CONTAINER */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs min-h-[380px] sm:min-h-[420px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-border pb-3 sm:pb-4 mb-4 sm:mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px] sm:text-xs font-bold">
                    Question {currentQuestionIndex + 1} of{" "}
                    {questions.length}
                  </Badge>
                  <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">
                    • Topic: {currentQ.topic}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {currentQ.marks} mark
                    {currentQ.marks > 1 ? "s" : ""}
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBookmark(currentQ.id)}
                  className={`text-xs gap-1 h-8 px-2 sm:px-3 ${
                    bookmarkedQuestions.includes(currentQ.id)
                      ? "text-violet-500 bg-violet-500/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">
                    {bookmarkedQuestions.includes(currentQ.id)
                      ? "Flagged"
                      : "Flag for Review"}
                  </span>
                </Button>
              </div>

              <p className="text-sm sm:text-base font-semibold text-foreground leading-relaxed mb-5 sm:mb-6 whitespace-pre-line">
                {currentQ.text}
              </p>

              {currentQ.options.length > 0 ? (
                <div className="space-y-2.5 sm:space-y-3">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = selectedAnswers[currentQ.id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition flex items-center gap-3 text-xs sm:text-sm font-medium ${
                          isSelected
                            ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                            : "border-border bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border bg-muted/40"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="leading-snug">{option}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Type your answer below:
                  </p>
                  <textarea
                    value={(selectedAnswers[currentQ.id] as string) || ""}
                    onChange={(e) => handleTextInput(e.target.value)}
                    placeholder="Enter your detailed answer here..."
                    className="w-full min-h-[150px] p-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4 sm:pt-5 mt-6 gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="text-xs font-semibold gap-1 h-9 px-3"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>

              <span className="text-[11px] sm:text-xs text-muted-foreground font-mono font-medium text-center">
                {Object.keys(selectedAnswers).length} / {questions.length}
              </span>

              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="text-xs font-semibold gap-1 bg-foreground text-background hover:bg-foreground/90 h-9 px-3"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="text-xs font-bold gap-1.5 h-9 px-4 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/40 ring-2 ring-green-400/50 disabled:opacity-50 disabled:animate-none"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Submit
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* QUESTION NAVIGATOR GRID */}
        <div
          className={`lg:col-span-4 ${
            isNavGridOpenMobile ? "block" : "hidden lg:block"
          }`}
        >
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Question Navigator
              </h3>
              <button
                onClick={() => setIsNavGridOpenMobile(false)}
                className="lg:hidden text-muted-foreground p-1 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered =
                  selectedAnswers[q.id] !== undefined &&
                  selectedAnswers[q.id] !== "";
                const isFlagged = bookmarkedQuestions.includes(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setIsNavGridOpenMobile(false);
                    }}
                    className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center relative transition border ${
                      isCurrent
                        ? "ring-2 ring-primary border-primary bg-primary text-primary-foreground"
                        : isAnswered
                          ? "bg-muted border-border text-foreground font-extrabold"
                          : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-violet-500 ring-2 ring-card" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />{" "}
                Active
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-muted border border-border" />{" "}
                Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />{" "}
                Flagged
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING AI TUTOR DRAWER */}
      {isAiOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 w-[calc(100vw-24px)] sm:w-96 bg-card border border-purple-500/30 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-purple-950/20 dark:bg-purple-950/40 p-3 sm:p-3.5 border-b border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-500">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  AI Exam Assistant
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Pi AI • Concept Hints
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAiOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 space-y-3 h-56 sm:h-64 overflow-y-auto text-xs">
            {aiChat.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl max-w-[85%] ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted/80 text-foreground border border-border"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSendAiQuery}
            className="p-2.5 bg-muted/40 border-t border-border flex gap-2"
          >
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask for a hint or explanation..."
              className="flex-1 bg-card border border-border rounded-xl px-3 text-xs outline-none focus:border-purple-500/50 h-9"
            />
            <Button
              size="sm"
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white h-9 px-3"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}