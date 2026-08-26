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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Interface Definitions
export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  type: "MCQ" | "Structured";
  marks: number;
  topic: string;
  markingSchemeNotes?: string;
  aiExplanation?: string;
}

export interface ExamAttemptResult {
  paperId: string;
  subjectId: string;
  paperTitle: string;
  totalMarks: number;
  timeSpentSeconds: number;
  questions: Array<{
    questionId: number;
    questionNumber: number;
    text: string;
    topic: string;
    userAnswer: string;
    correctAnswer: string;
    options: string[];
    isCorrect: boolean;
    marksObtained: number;
    totalMarks: number;
    markingSchemeNotes: string;
    aiExplanation: string;
  }>;
}

// Mock Questions with detailed remediation details
const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Which of the following physical quantities is a fundamental (base) SI unit?",
    options: ["Newton (N)", "Ampere (A)", "Joule (J)", "Watt (W)"],
    correctAnswer: 1,
    type: "MCQ",
    marks: 1,
    topic: "Units & Dimensions",
    markingSchemeNotes: "SI base units include Metre (m), Kilogram (kg), Second (s), Ampere (A), Kelvin (K), Mole (mol), and Candela (cd).",
    aiExplanation: "Great job! Ampere is the base unit for electric current in the International System of Units (SI).",
  },
  {
    id: 2,
    text: "A projectile is launched with an initial velocity u at an angle θ to the horizontal. What is its horizontal velocity component at maximum height?",
    options: ["Zero", "u sin θ", "u cos θ", "u tan θ"],
    correctAnswer: 2,
    type: "MCQ",
    marks: 1,
    topic: "Kinematics",
    markingSchemeNotes: "In projectile motion without air resistance, horizontal velocity remains constant throughout flight: u_x = u cos θ.",
    aiExplanation: "Correct! Vertical velocity decreases to zero at maximum height, but horizontal velocity remains unchanged as u cos θ.",
  },
  {
    id: 3,
    text: "According to Hooke's Law, the extension of a spring is directly proportional to the applied force provided that:",
    options: [
      "The limit of proportionality is not exceeded",
      "The elastic limit is exceeded",
      "The material is plastic",
      "The temperature remains zero",
    ],
    correctAnswer: 0,
    type: "MCQ",
    marks: 1,
    topic: "Elasticity",
    markingSchemeNotes: "GCE Syllabus Rule: Hooke's Law holds strictly up to the limit of proportionality, beyond which F is no longer linear with extension x.",
    aiExplanation: "Hooke's Law states F = kx, which only applies up to the limit of proportionality.",
  },
  {
    id: 4,
    text: "Calculate the kinetic energy of a body of mass 4 kg moving at a constant speed of 5 m/s.",
    options: ["20 J", "50 J", "100 J", "10 J"],
    correctAnswer: 1,
    type: "MCQ",
    marks: 1,
    topic: "Work & Energy",
    markingSchemeNotes: "KE = 1/2 * m * v^2 = 0.5 * 4 * (5)^2 = 0.5 * 4 * 25 = 50 Joules.",
    aiExplanation: "Spot on! Using KE = ½mv², 0.5 × 4 kg × (5 m/s)² = 50 J.",
  },
  {
    id: 5,
    text: "In a transformer, electrical power is transferred from primary to secondary coil through:",
    options: [
      "Conduction",
      "Electrostatic attraction",
      "Mutual electromagnetic induction",
      "Thermal expansion",
    ],
    correctAnswer: 2,
    type: "MCQ",
    marks: 1,
    topic: "Electromagnetism",
    markingSchemeNotes: "Alternating current in the primary coil creates a varying magnetic flux, inducing an emf in the secondary coil via mutual induction.",
    aiExplanation: "Correct! The coils are electrically isolated but magnetically linked through the soft iron core via mutual electromagnetic induction.",
  },
];

export default function ExamRoomPage({
  params,
}: {
  params: Promise<{ "subject-id": string; "paper-id": string }> | { "subject-id": string; "paper-id": string };
}) {
  const router = useRouter();
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const subjectId = resolvedParams?.["subject-id"];
  const paperId = resolvedParams?.["paper-id"];

  // Exam States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<number[]>([]);
  const TOTAL_TIME = 90 * 60; // 90 minutes
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(TOTAL_TIME);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isNavGridOpenMobile, setIsNavGridOpenMobile] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiChat, setAiChat] = useState<{ sender: "user" | "ai"; text: string }[]>([
    {
      sender: "ai",
      text: "Hello! I am your AI GCE Tutor. Stuck on this question? Ask me for hints or concept explanations!",
    },
  ]);

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Time (HH:MM:SS)
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? `${hours}:` : ""}${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };

  const currentQ = MOCK_QUESTIONS[currentQuestionIndex];

  // Option Selection
  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
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
          text: `For Question ${currentQ.id} on ${currentQ.topic}: SI base units include metre (m), kilogram (kg), second (s), and Ampere (A). Derived units like Newton or Watt are combination units.`,
        },
      ]);
    }, 800);
  };

  // Submit Exam & Save Results to localStorage
  const handleSubmitExam = () => {
    if (confirm("Are you sure you want to submit your exam?")) {
      const timeSpentSeconds = TOTAL_TIME - timeLeftSeconds;

      const processedQuestions = MOCK_QUESTIONS.map((q, idx) => {
        const selectedIdx = selectedAnswers[q.id];
        const isAnswered = selectedIdx !== undefined;
        const isCorrect = isAnswered && selectedIdx === q.correctAnswer;
        const userAnswerText = isAnswered ? q.options[selectedIdx] : "Unanswered";

        return {
          questionId: q.id,
          questionNumber: idx + 1,
          text: q.text,
          topic: q.topic,
          userAnswer: userAnswerText,
          correctAnswer: q.options[q.correctAnswer],
          options: q.options,
          isCorrect,
          marksObtained: isCorrect ? q.marks : 0,
          totalMarks: q.marks,
          markingSchemeNotes: q.markingSchemeNotes || "Standard marking scheme guidelines apply.",
          aiExplanation: q.aiExplanation || "Review the official core syllabus for this topic.",
        };
      });

      const examAttemptData: ExamAttemptResult = {
        paperId: paperId || "default-paper",
        subjectId: subjectId || "default-subject",
        paperTitle: "2023 GCE Past Paper Exam",
        totalMarks: MOCK_QUESTIONS.reduce((acc, q) => acc + q.marks, 0),
        timeSpentSeconds,
        questions: processedQuestions,
      };

      // Store evaluation in localStorage for the results page
      localStorage.setItem(`exam_attempt_${paperId}`, JSON.stringify(examAttemptData));

      router.push(`/student/exams/${subjectId}/results/${paperId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col -m-3 sm:-m-6 p-3 sm:p-6">
      
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
                <span className="text-[10px] sm:text-xs font-mono font-bold text-muted-foreground uppercase">{subjectId}</span>
                <Badge variant="outline" className="text-[9px] sm:text-[10px] py-0 px-1.5 font-semibold">
                  Paper 1 (MCQ)
                </Badge>
              </div>
              <h1 className="text-xs sm:text-sm font-bold text-foreground truncate">2023 GCE Past Paper Exam</h1>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNavGridOpenMobile(!isNavGridOpenMobile)}
            className="lg:hidden text-xs gap-1 h-8 px-2.5 shrink-0"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">{currentQuestionIndex + 1}/{MOCK_QUESTIONS.length}</span>
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1 h-8 px-3"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Submit Exam</span>
              <span className="sm:hidden">Submit</span>
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
                    Question {currentQuestionIndex + 1} of {MOCK_QUESTIONS.length}
                  </Badge>
                  <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">• Topic: {currentQ.topic}</span>
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
                  <span className="hidden sm:inline">{bookmarkedQuestions.includes(currentQ.id) ? "Flagged" : "Flag for Review"}</span>
                </Button>
              </div>

              <p className="text-sm sm:text-base font-semibold text-foreground leading-relaxed mb-5 sm:mb-6">
                {currentQ.text}
              </p>

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
                {Object.keys(selectedAnswers).length} / {MOCK_QUESTIONS.length}
              </span>

              {currentQuestionIndex < MOCK_QUESTIONS.length - 1 ? (
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
                  className="text-xs font-bold gap-1.5 h-9 px-4 bg-green-600 hover:bg-green-700 text-white animate-pulse shadow-lg shadow-green-600/40 ring-2 ring-green-400/50"
                >
                  <CheckCircle2 className="w-4 h-4" /> Submit
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* QUESTION NAVIGATOR GRID */}
        <div className={`lg:col-span-4 ${isNavGridOpenMobile ? "block" : "hidden lg:block"}`}>
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Question Navigator</h3>
              <button
                onClick={() => setIsNavGridOpenMobile(false)}
                className="lg:hidden text-muted-foreground p-1 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {MOCK_QUESTIONS.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered = selectedAnswers[q.id] !== undefined;
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
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Active
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-muted border border-border" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Flagged
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* FLOATING AI TUTOR DRAWER */}
      {isAiOpen && (
        <div className="fixed bottom-16 right-3 sm:bottom-6 sm:right-6 w-[calc(100vw-24px)] sm:w-96 bg-card border border-purple-500/30 rounded-2xl shadow-2xl z-[60] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 max-h-[60vh] sm:max-h-[unset]">
          <div className="bg-purple-950/20 dark:bg-purple-950/40 p-3 sm:p-3.5 border-b border-purple-500/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-500">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">AI Exam Assistant</h4>
                <p className="text-[10px] text-muted-foreground">Pi AI • Concept Hints</p>
              </div>
            </div>
            <button
              onClick={() => setIsAiOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 space-y-3 flex-1 overflow-y-auto text-xs min-h-0">
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

          {/* Input always visible — flex-shrink-0 keeps it from being pushed off screen */}
          <form onSubmit={handleSendAiQuery} className="p-2.5 bg-muted/40 border-t border-border flex gap-2 shrink-0">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask for a hint or explanation..."
              className="flex-1 bg-card border border-border rounded-xl px-3 text-xs outline-none focus:border-purple-500/50 h-9"
            />
            <Button size="sm" type="submit" className="bg-purple-600 hover:bg-purple-700 text-white h-9 px-3">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}

    </div>
  );
}