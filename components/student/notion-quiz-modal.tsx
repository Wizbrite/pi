"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, XCircle, Loader2, AlertTriangle,
  Trophy, RotateCcw, ChevronRight, BookOpen, Sparkles,
} from "lucide-react";

export interface NotionQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface NotionInfo {
  id: string;
  label: string;
  description?: string;
  passingScore: number;
  questionsCount: number;
  startTime: number;
}

interface NotionQuizModalProps {
  isOpen: boolean;
  notion: NotionInfo;
  lessonId: string;
  courseId: string;
  partNumber: number;
  lessonTitle: string;
  partTitle: string;
  /** Called when student passes — video should continue */
  onPassed: () => void;
  /** Called when student fails — video should seek back to startTime */
  onFailed: () => void;
}

type Phase = "loading" | "error" | "quiz" | "result";

export function NotionQuizModal({
  isOpen,
  notion,
  lessonId,
  courseId,
  partNumber,
  lessonTitle,
  partTitle,
  onPassed,
  onFailed,
}: NotionQuizModalProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<NotionQuestion[]>([]);
  const [passingScore, setPassingScore] = useState(notion.passingScore ?? 80);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Result state
  const [score, setScore] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [passed, setPassed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Generate questions when modal opens
  const generateQuestions = useCallback(async () => {
    setPhase("loading");
    setErrorMsg(null);
    setCurrentIdx(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);

    try {
      const res = await fetch("/api/ai/notion-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notionLabel: notion.label,
          description: notion.description || "",
          lessonTitle,
          partTitle,
          count: notion.questionsCount ?? 20,
          passingScore: notion.passingScore ?? 80,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to generate questions");
      }

      setQuestions(json.data.questions);
      setPassingScore(json.data.passingScore ?? 80);
      setPhase("quiz");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate questions. Please try again.");
      setPhase("error");
    }
  }, [notion, lessonTitle, partTitle]);

  useEffect(() => {
    if (isOpen) {
      generateQuestions();
    }
  }, [isOpen, generateQuestions]);

  // Save progress to backend
  const saveProgress = useCallback(
    async (correct: number, total: number, didPass: boolean) => {
      setIsSaving(true);
      try {
        await fetch("/api/student/notion-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            courseId,
            partNumber,
            notionId: notion.id,
            notionLabel: notion.label,
            score: correct,
            total,
            passingScore,
          }),
        });
      } catch (err) {
        console.error("Failed to save notion progress:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [lessonId, courseId, partNumber, notion, passingScore]
  );

  const handleSelectAnswer = (option: string) => {
    if (showExplanation) return; // already answered
    setSelectedAnswer(option);
  };

  const handleConfirmAnswer = () => {
    if (!selectedAnswer) return;
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Last question — compute result
      const finalAnswers = [...answers];
      const correct = finalAnswers.filter(
        (ans, idx) => ans === questions[idx]?.correctAnswer
      ).length;
      const total = questions.length;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      const didPass = pct >= passingScore;

      setScore(correct);
      setPercentage(pct);
      setPassed(didPass);
      setPhase("result");
      await saveProgress(correct, total, didPass);
    }
  };

  if (!isOpen) return null;

  const currentQuestion = questions[currentIdx];
  const isCorrect = showExplanation && selectedAnswer === currentQuestion?.correctAnswer;
  const isWrong = showExplanation && selectedAnswer !== currentQuestion?.correctAnswer;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background border border-border shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={`Notion Quiz: ${notion.label}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-primary/5 rounded-t-2xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Notion Check</p>
            <h2 className="text-base font-bold text-foreground truncate">{notion.label}</h2>
          </div>
          {phase === "quiz" && (
            <span className="shrink-0 text-xs font-semibold text-muted-foreground bg-muted rounded-full px-3 py-1">
              {currentIdx + 1} / {questions.length}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 p-6">
          {/* ── Loading ── */}
          {phase === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Pi AI is generating your questions…</p>
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Creating {notion.questionsCount} personalised questions based on <strong>{notion.label}</strong>
              </p>
            </div>
          )}

          {/* ── Error ── */}
          {phase === "error" && (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <h3 className="font-semibold text-foreground">Couldn't load questions</h3>
              <p className="text-sm text-muted-foreground max-w-xs">{errorMsg}</p>
              <Button onClick={generateQuestions} className="mt-2">
                <RotateCcw className="h-4 w-4 mr-2" /> Try Again
              </Button>
            </div>
          )}

          {/* ── Quiz ── */}
          {phase === "quiz" && currentQuestion && (
            <div className="space-y-6">
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Question {currentIdx + 1}
                </p>
                <p className="text-base font-semibold text-foreground leading-snug">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Options */}
              <div className="grid gap-2.5">
                {currentQuestion.options.map((option, i) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectOption = showExplanation && option === currentQuestion.correctAnswer;
                  const isWrongSelected = showExplanation && isSelected && option !== currentQuestion.correctAnswer;

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={showExplanation}
                      className={[
                        "w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 flex items-center gap-3",
                        showExplanation
                          ? isCorrectOption
                            ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                            : isWrongSelected
                              ? "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                              : "border-border bg-muted/30 text-muted-foreground opacity-60"
                          : isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5",
                      ].join(" ")}
                    >
                      <span className="shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold border-current">
                        {["A", "B", "C", "D"][i]}
                      </span>
                      <span className="flex-1">{option}</span>
                      {showExplanation && isCorrectOption && (
                        <CheckCircle2 className="shrink-0 h-5 w-5 text-green-500" />
                      )}
                      {isWrongSelected && (
                        <XCircle className="shrink-0 h-5 w-5 text-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div
                  className={[
                    "rounded-xl p-4 text-sm leading-relaxed border",
                    isCorrect
                      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
                      : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300",
                  ].join(" ")}
                >
                  <p className="font-semibold mb-1 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 shrink-0" />
                    {isCorrect ? "Correct!" : `Correct answer: ${currentQuestion.correctAnswer}`}
                  </p>
                  <p className="text-xs leading-relaxed opacity-90">{currentQuestion.explanation}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-2">
                {!showExplanation ? (
                  <Button
                    onClick={handleConfirmAnswer}
                    disabled={!selectedAnswer}
                    className="bg-primary text-primary-foreground min-w-[120px]"
                  >
                    Confirm Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-primary text-primary-foreground gap-1.5"
                  >
                    {currentIdx < questions.length - 1 ? (
                      <>Next <ChevronRight className="h-4 w-4" /></>
                    ) : (
                      <>See Results <Trophy className="h-4 w-4" /></>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ── Result ── */}
          {phase === "result" && (
            <div className="flex flex-col items-center gap-6 py-6 text-center">
              {/* Score ring */}
              <div className="relative h-32 w-32">
                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/40" />
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke={passed ? "#22c55e" : "#ef4444"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - percentage / 100)}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-extrabold ${passed ? "text-green-500" : "text-red-500"}`}>
                    {percentage}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {score}/{questions.length}
                  </span>
                </div>
              </div>

              {passed ? (
                <>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-green-500">🎉 Notion Unlocked!</h3>
                    <p className="text-sm text-muted-foreground">
                      You scored <strong>{percentage}%</strong> on <em>{notion.label}</em>.
                      The video will continue to the next segment.
                    </p>
                  </div>
                  <Button
                    onClick={onPassed}
                    disabled={isSaving}
                    className="bg-green-500 hover:bg-green-600 text-white gap-2 min-w-[180px] min-h-[44px]"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <><ChevronRight className="h-4 w-4" /> Continue Watching</>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-red-500">Review Required</h3>
                    <p className="text-sm text-muted-foreground">
                      You scored <strong>{percentage}%</strong>. You need at least{" "}
                      <strong>{passingScore}%</strong> to unlock the next segment.
                      Please re-watch <em>{notion.label}</em>.
                    </p>
                  </div>
                  <Button
                    onClick={onFailed}
                    disabled={isSaving}
                    className="bg-amber-500 hover:bg-amber-600 text-white gap-2 min-w-[180px] min-h-[44px]"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <><RotateCcw className="h-4 w-4" /> Review Notion</>
                    )}
                  </Button>
                </>
              )}

              <p className="text-xs text-muted-foreground">
                Passing threshold: {passingScore}% · Attempt saved to your progress
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
