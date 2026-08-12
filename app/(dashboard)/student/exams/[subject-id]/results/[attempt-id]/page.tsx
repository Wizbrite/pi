"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Zap,
  Clock,
  Target,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Share2,
  BookOpen,
  Bot,
  AlertTriangle,
  X,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuestionResult {
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
}

interface AttemptData {
  paperId: string;
  subjectId: string;
  paperTitle: string;
  totalMarks: number;
  timeSpentSeconds: number;
  questions: QuestionResult[];
}

function MistakeReviewModal({
  isOpen,
  missedQuestions,
  onClose,
  onFinish,
}: {
  isOpen: boolean;
  missedQuestions: QuestionResult[];
  onClose: () => void;
  onFinish: (correctedQuestionIds: number[]) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctedIds, setCorrectedIds] = useState<number[]>([]);

  if (!isOpen || missedQuestions.length === 0) return null;

  const currentQuestion = missedQuestions[currentIndex];
  const isCorrect = selectedOption === currentQuestion.correctAnswer;
  const isLastQuestion = currentIndex === missedQuestions.length - 1;

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQuestion.correctAnswer) {
      setCorrectedIds((prev) => [...prev, currentQuestion.questionId]);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onFinish(correctedIds);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Re-answering Mistakes</h2>
              <p className="text-xs text-muted-foreground">
                Question {currentIndex + 1} of {missedQuestions.length}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Skip Review <X className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="space-y-2">
            <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
              {currentQuestion.topic}
            </Badge>
            <h3 className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
              {currentQuestion.text}
            </h3>
          </div>

          <div className="space-y-2.5">
            {currentQuestion.options.map((option, idx) => {
              let style = "border-border hover:bg-muted/50 text-foreground";

              if (isAnswered) {
                if (option === currentQuestion.correctAnswer) {
                  style = "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 font-semibold";
                } else if (selectedOption === option) {
                  style = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                } else {
                  style = "border-border opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border text-left transition flex items-center justify-between text-xs sm:text-sm font-medium ${style}`}
                >
                  <span>{option}</span>
                  {isAnswered && option === currentQuestion.correctAnswer && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                  {isAnswered && selectedOption === option && !isCorrect && (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                isCorrect
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <HelpCircle className="w-4 h-4" />
                {isCorrect ? "Got it right!" : "Explanation"}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {currentQuestion.aiExplanation}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>

          {isAnswered ? (
            <Button size="sm" onClick={handleNext} className="text-xs gap-1">
              {isLastQuestion ? "Submit Correction" : "Next Question"} <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNext}
              className="text-xs text-muted-foreground"
            >
              Skip Question
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExamResultsPage({
  params,
}: {
  params: Promise<{ "subject-id": string; "attempt-id": string }> | { "subject-id": string; "attempt-id": string };
}) {
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const subjectId = resolvedParams?.["subject-id"];
  const attemptId = resolvedParams?.["attempt-id"];

  const [questions, setQuestions] = useState<QuestionResult[]>([]);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [filter, setFilter] = useState<"all" | "incorrect" | "correct">("all");
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
  const [showMistakeModal, setShowMistakeModal] = useState(false);

  // Retrieve actual user performance stored in localStorage from the exam room
  useEffect(() => {
    if (!attemptId) return;

    const storedData = localStorage.getItem(`exam_attempt_${attemptId}`);
    if (storedData) {
      try {
        const parsed: AttemptData = JSON.parse(storedData);
        setQuestions(parsed.questions || []);
        setTimeSpentSeconds(parsed.timeSpentSeconds || 0);

        // Find the first incorrect question to auto-expand for quick review
        const firstIncorrect = parsed.questions.find((q) => !q.isCorrect);
        if (firstIncorrect) {
          setExpandedQuestionId(firstIncorrect.questionId);
        }
      } catch (err) {
        console.error("Failed to parse stored attempt data:", err);
      }
    }
  }, [attemptId]);

  // Dynamic score and stats calculations based on actual exam data
  const missedQuestions = questions.filter((q) => !q.isCorrect);
  const score = questions.filter((q) => q.isCorrect).length;
  const totalMarks = questions.reduce((acc, q) => acc + q.totalMarks, 0) || questions.length;
  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

  const formatTimeSpent = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins} mins ${remainderSecs} secs`;
  };

  const handleReviewFinished = (correctedQuestionIds: number[]) => {
    setShowMistakeModal(false);

    setQuestions((prev) => {
      const updated = prev.map((q) => {
        if (correctedQuestionIds.includes(q.questionId)) {
          return {
            ...q,
            isCorrect: true,
            userAnswer: q.correctAnswer,
            marksObtained: q.totalMarks,
          };
        }
        return q;
      });

      // Sync the corrected results back into localStorage
      if (attemptId) {
        const stored = localStorage.getItem(`exam_attempt_${attemptId}`);
        if (stored) {
          const parsed: AttemptData = JSON.parse(stored);
          parsed.questions = updated;
          localStorage.setItem(`exam_attempt_${attemptId}`, JSON.stringify(parsed));
        }
      }

      return updated;
    });
  };

  const filteredQuestions = questions.filter((q) => {
    if (filter === "correct") return q.isCorrect;
    if (filter === "incorrect") return !q.isCorrect;
    return true;
  });

  return (
    <div className="min-h-screen bg-background space-y-6 pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href={`/student/exams/${subjectId}`}
            className="p-2.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-muted-foreground uppercase">{subjectId}</span>
              <Badge variant="outline" className="text-[10px] py-0">Attempt #{attemptId}</Badge>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground">2023 GCE Past Paper Exam</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 h-9">
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
          <Link href={`/student/exams/${subjectId}/room/${attemptId}`}>
            <Button size="sm" className="text-xs font-bold gap-1.5 h-9 bg-primary text-primary-foreground">
              <RotateCcw className="w-3.5 h-3.5" /> Retake Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* CORRECTION CARD */}
      {missedQuestions.length > 0 ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                You made {missedQuestions.length} mistake{missedQuestions.length > 1 ? "s" : ""}
              </h3>
              <p className="text-xs text-muted-foreground">
                Re-answer these missed questions right now to correct your errors and improve your score!
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowMistakeModal(true)}
            className="w-full sm:w-auto shrink-0 gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold"
          >
            <RotateCcw className="w-4 h-4" /> Correct Mistakes
          </Button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 flex items-center gap-3 text-green-600 dark:text-green-400 shadow-xs">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="text-sm font-bold">All Mistakes Cleared!</h3>
            <p className="text-xs opacity-90">Great job! You answered every question correctly in this attempt.</p>
          </div>
        </div>
      )}

      {/* XP CELEBRATION BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-5 sm:p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
              <Trophy className="w-8 h-8 text-amber-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-400 text-slate-900 border-none font-extrabold text-[10px]">
                  EXAM COMPLETED
                </Badge>
                <span className="text-xs font-semibold text-purple-100">+20 Day Streak Bonus!</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                {percentage >= 70 ? "Excellent Effort!" : "Keep Practicing!"}
              </h2>
              <p className="text-xs sm:text-sm text-purple-100">
                You answered {score} out of {totalMarks} questions correctly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-xl self-start sm:self-auto">
            <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
            <div>
              <span className="text-xl font-black leading-none block">+{score * 40 + 20} XP</span>
              <span className="text-[10px] text-purple-200 uppercase font-bold tracking-wider">Earned</span>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS & BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Score</span>
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-foreground">{score}</span>
              <span className="text-sm font-bold text-muted-foreground">/ {totalMarks}</span>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              {percentage}% Accuracy
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Grade</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400">
              {percentage >= 70 ? "Grade A" : percentage >= 50 ? "Grade C" : "Grade F"}
            </span>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              {percentage >= 50 ? "Passed official threshold" : "Needs improvement"}
            </p>
          </div>
          <div className="text-[11px] font-bold text-muted-foreground bg-muted/60 p-1.5 rounded-lg text-center">
            Pass Threshold: 50%
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Time Spent</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="my-3">
            <span className="text-2xl font-black text-foreground">{formatTimeSpent(timeSpentSeconds)}</span>
            <p className="text-xs font-medium text-muted-foreground mt-1">Allocated: 90 mins</p>
          </div>
          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 p-1.5 rounded-lg text-center">
            Pacing Recorded
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Attempt Summary</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-3 space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">Correct:</span>
              <span>{score}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-red-500">Incorrect:</span>
              <span>{missedQuestions.length}</span>
            </div>
          </div>
          <div className="text-[11px] font-bold text-muted-foreground bg-muted/60 p-1.5 rounded-lg text-center">
            {totalMarks} total questions reviewed
          </div>
        </div>
      </div>

      {/* QUESTION REVIEW */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Detailed Question Review</h3>
            <p className="text-xs text-muted-foreground">Review your answers against official GCE marking schemes & AI explanations.</p>
          </div>

          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setFilter("incorrect")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === "incorrect" ? "bg-card text-red-500 shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Missed ({missedQuestions.length})
            </button>
            <button
              onClick={() => setFilter("correct")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === "correct" ? "bg-card text-emerald-600 shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Correct ({score})
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const isExpanded = expandedQuestionId === q.questionId;

            return (
              <div
                key={q.questionId}
                className={`border rounded-2xl transition overflow-hidden ${
                  q.isCorrect ? "border-border" : "border-red-500/30 bg-red-500/[0.02]"
                }`}
              >
                <button
                  onClick={() => setExpandedQuestionId(isExpanded ? null : q.questionId)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-muted/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {q.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-foreground">Question {q.questionNumber}</span>
                        <Badge variant="outline" className="text-[10px] py-0">{q.topic}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{q.text}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold ${q.isCorrect ? "text-emerald-600" : "text-red-500"}`}>
                      {q.marksObtained}/{q.totalMarks} Mark
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-border/60 space-y-4 mt-2">
                    <div className="pt-2">
                      <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed">{q.text}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className={`p-3 rounded-xl border ${q.isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Your Answer:</span>
                        <span className={`font-bold ${q.isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-400"}`}>
                          {q.userAnswer}
                        </span>
                      </div>

                      {!q.isCorrect && (
                        <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Official Correct Answer:</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">
                            {q.correctAnswer}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 bg-muted/60 border border-border rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        <span>Official GCE Marking Scheme Notes</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {q.markingSchemeNotes}
                      </p>
                    </div>

                    <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                        <Bot className="w-3.5 h-3.5" />
                        <span>AI Tutor Remediation</span>
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed">
                        {q.aiExplanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <MistakeReviewModal
        isOpen={showMistakeModal}
        missedQuestions={missedQuestions}
        onClose={() => setShowMistakeModal(false)}
        onFinish={handleReviewFinished}
      />
    </div>
  );
}