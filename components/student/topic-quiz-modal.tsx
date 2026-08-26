"use client";

import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import {
  X, Trophy, ArrowRight, RotateCcw, CheckCircle2, XCircle,
  BookOpen, Sparkles, Send, Loader2, StopCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAiTutor } from "@/hooks/use-ai-tutor";
import { buildQuizSystemPrompt } from "@/lib/ai/prompts";

interface FailedQuestion {
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
}

interface TopicQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  lessonTitle: string;
  lessonId: string;
  courseTitle?: string;
  onQuizComplete?: (score: number, earnedXp: number, failedQuestions: FailedQuestion[]) => void;
}

export function TopicQuizModal({
  isOpen,
  onClose,
  topicTitle,
  lessonTitle,
  lessonId,
  courseTitle = "ICT",
  onQuizComplete,
}: TopicQuizModalProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoadingQ, setIsLoadingQ] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [ncqAnswer, setNcqAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiEvaluationText, setAiEvaluationText] = useState<string | null>(null);

  const [score, setScore] = useState(0);
  const [failedQuestions, setFailedQuestions] = useState<FailedQuestion[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const [showAiInput, setShowAiInput] = useState(false);
  const [aiQuery, setAiQuery] = useState("");

  const XP_PER_CORRECT = 50;

  // ── Build quiz AI system prompt based on current question ─────────────────
  const currentQ = questions[currentQuestionIndex];
  const isNCQ = currentQ && (!currentQ.options || currentQ.options.length === 0);
  const userAnswer = isNCQ ? ncqAnswer : (selectedOption ?? "");

  const quizSystemPrompt = currentQ
    ? buildQuizSystemPrompt({
        lessonTitle,
        topicTitle,
        questionText: currentQ.questionText ?? "",
        correctAnswer: currentQ.correctAnswer ?? "",
        studentAnswer: userAnswer,
        explanation: currentQ.explanation ?? "",
      })
    : `You are Pi, an AI Tutor for GCE A-Level ${courseTitle} students.`;

  const { response: aiResponse, isLoading: aiLoading, error: aiError, ask, reset: resetAi } = useAiTutor({
    systemPrompt: quizSystemPrompt,
    stream: true,
  });

  // ── Fetch questions ────────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    setIsLoadingQ(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/questions`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setQuestions(json.data || []);
    } catch (err: any) {
      setFetchError(err.message || "Failed to load questions");
    } finally {
      setIsLoadingQ(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (isOpen) {
      fetchQuestions();
      handleReset();
    }
  }, [isOpen, fetchQuestions]);

  if (!isOpen) return null;

  const handleSelectOption = (opt: string) => {
    if (!isAnswered) setSelectedOption(opt);
  };

  const handleConfirmAnswer = async () => {
    if (!currentQ) return;
    setIsAnswered(true);
    resetAi();
    setShowAiInput(false);
    setAiEvaluationText(null);

    const answer = isNCQ ? ncqAnswer : selectedOption;
    let isCorrect = false;

    if (isNCQ) {
      setIsEvaluating(true);
      try {
        const res = await fetch("/api/ai/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionText: currentQ.questionText,
            correctAnswer: currentQ.correctAnswer,
            studentAnswer: answer,
          }),
        });
        const json = await res.json();
        if (json.success && json.evaluation) {
          isCorrect = json.evaluation.isCorrect;
          setAiEvaluationText(json.evaluation.explanation);
        } else {
          // Fallback if AI fails
          isCorrect = answer?.trim().toLowerCase() === currentQ.correctAnswer?.toLowerCase();
          setAiEvaluationText("AI evaluation failed. Using exact match fallback.");
        }
      } catch (err) {
        isCorrect = answer?.trim().toLowerCase() === currentQ.correctAnswer?.toLowerCase();
        setAiEvaluationText("AI evaluation failed. Using exact match fallback.");
      } finally {
        setIsEvaluating(false);
      }
    } else {
      isCorrect = answer === currentQ.correctAnswer;
    }

    if (isCorrect) {
      setIsIncorrect(false);
      setScore((prev) => prev + 1);
    } else {
      setIsIncorrect(true);
      setFailedQuestions((prev) => [
        ...prev,
        {
          questionText: currentQ.questionText,
          userAnswer: answer || "No answer",
          correctAnswer: currentQ.correctAnswer,
        },
      ]);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setNcqAnswer("");
      setIsAnswered(false);
      setIsIncorrect(false);
      setShowAiInput(false);
      resetAi();
    } else {
      setQuizFinished(true);
      const totalXp = score * XP_PER_CORRECT;
      fetch(`/api/lessons/${lessonId}/complete`, { method: "POST" }).catch(console.error);
      if (onQuizComplete) onQuizComplete(score, totalXp, failedQuestions);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setNcqAnswer("");
    setIsAnswered(false);
    setIsIncorrect(false);
    setScore(0);
    setFailedQuestions([]);
    setQuizFinished(false);
    setShowAiInput(false);
    resetAi();
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    const q = aiQuery;
    setAiQuery("");
    await ask(q);
  };

  // Auto-ask AI when a wrong answer is confirmed
  const handleAutoExplain = async () => {
    if (!currentQ) return;
    const prompt = `I answered "${userAnswer}" but the correct answer is "${currentQ.correctAnswer}". Can you explain why I was wrong and help me understand the concept?`;
    await ask(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border border-border w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-muted/30 shrink-0">
          <div>
            <Badge variant="accent" className="text-[10px] uppercase">{topicTitle}</Badge>
            <h3 className="text-sm font-bold text-foreground mt-0.5">{lessonTitle} Assessment</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {isLoadingQ ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-xs">Loading questions...</p>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <p className="text-red-500 text-sm">{fetchError}</p>
              <Button variant="outline" size="sm" onClick={fetchQuestions}>Retry</Button>
            </div>
          ) : !questions.length ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <p className="text-muted-foreground text-sm">No questions available for this lesson.</p>
            </div>
          ) : !quizFinished ? (
            <>
              {/* Progress */}
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span className="font-semibold text-primary">
                  Potential XP: {questions.length * XP_PER_CORRECT}
                </span>
              </div>

              {/* Question */}
              <p className="font-medium text-foreground text-base leading-snug">
                {currentQ.questionText}
              </p>

              {/* Answer inputs */}
              <div className="space-y-2 pt-1">
                {isNCQ ? (
                  <textarea
                    className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Type your answer here..."
                    value={ncqAnswer}
                    onChange={(e) => setNcqAnswer(e.target.value)}
                    disabled={isAnswered}
                  />
                ) : (
                  currentQ.options.map((opt: string, idx: number) => {
                    let btnStyle = "border-border bg-card text-card-foreground hover:border-primary/50";
                    if (selectedOption === opt) btnStyle = "border-primary bg-primary/10 text-primary font-medium";
                    if (isAnswered) {
                      if (opt === currentQ.correctAnswer) {
                        btnStyle = "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400 font-medium";
                      } else if (selectedOption === opt) {
                        btnStyle = "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400";
                      }
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(opt)}
                        disabled={isAnswered}
                        className={`w-full p-3 rounded-lg border text-left text-sm transition-all flex justify-between items-center min-h-[44px] touch-manipulation active:scale-[0.99] ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && opt === currentQ.correctAnswer && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 ml-2" />}
                        {isAnswered && selectedOption === opt && opt !== currentQ.correctAnswer && <XCircle className="w-4 h-4 text-red-500 shrink-0 ml-2" />}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Post-answer feedback */}
              {isEvaluating ? (
                <div className="space-y-3 pt-4 flex flex-col items-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Pi is evaluating your answer...</p>
                </div>
              ) : isAnswered && (
                <div className="space-y-3 pt-2">
                  {/* Explanation */}
                  <div className={`p-3 rounded-lg border text-xs leading-relaxed ${isIncorrect ? "bg-red-500/5 border-red-500/20 text-foreground" : "bg-muted border-border text-muted-foreground"}`}>
                    <span className="font-bold block mb-0.5">
                      {isIncorrect ? "Not quite right!" : "Correct!"}
                    </span>
                    {aiEvaluationText ? aiEvaluationText : (currentQ.explanation || "No explanation provided.")}
                  </div>

                  {/* Review lesson CTA if wrong */}
                  {isIncorrect && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">Need to review before continuing?</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="text-xs h-8 border-primary/30 text-primary hover:bg-primary/10 shrink-0"
                      >
                        <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Review Lesson
                      </Button>
                    </div>
                  )}

                  {/* AI Tutor — auto-explain or ask custom question */}
                  <div className="space-y-2">
                    {!showAiInput ? (
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setShowAiInput(true); handleAutoExplain(); }}
                          disabled={aiLoading}
                          className="text-xs text-primary hover:text-primary/80 px-0"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
                          {aiLoading ? "Pi is explaining..." : "Confused? Let Pi explain this"}
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleAskAi} className="flex gap-2 pt-1">
                        <Input
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          placeholder="Ask Pi a follow-up question..."
                          disabled={aiLoading}
                          className="text-xs h-9"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={aiLoading || !aiQuery.trim()}
                          className="h-9 px-3 shrink-0"
                        >
                          {aiLoading ? <StopCircle className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                        </Button>
                      </form>
                    )}

                    {/* AI Response */}
                    {(aiLoading || aiResponse) && (
                      <div className="p-3 bg-accent/60 border border-primary/20 rounded-lg min-h-[50px]">
                        {aiLoading && !aiResponse ? (
                          <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Pi is thinking...
                          </div>
                        ) : (
                          <div className="text-xs text-accent-foreground leading-relaxed">
                            <ReactMarkdown>
                              {aiResponse}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}

                    {aiError && <p className="text-xs text-red-500">{aiError}</p>}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ── Results screen ────────────────────────────────────────────── */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-500 flex items-center justify-center mx-auto shadow-inner">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <Badge className="bg-violet-500 text-black font-bold uppercase tracking-wider text-[10px]">
                  Mastery Quiz Completed
                </Badge>
                <h4 className="text-2xl font-black text-foreground">+{score * XP_PER_CORRECT} XP</h4>
                <p className="text-xs text-muted-foreground">
                  You scored <span className="font-bold text-foreground">{score}/{questions.length}</span> correct answers.
                </p>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden max-w-xs mx-auto">
                <div
                  className="bg-violet-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(score / questions.length) * 100}%` }}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2 max-w-xs mx-auto">
                <Button onClick={handleReset} variant="outline" className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" /> Retake Quiz
                </Button>
                <Button onClick={onClose} className="w-full bg-primary text-primary-foreground">
                  Continue Learning
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer action */}
        {!quizFinished && !isLoadingQ && !fetchError && questions.length > 0 && (
          <div className="p-3.5 border-t border-border bg-background shrink-0 flex gap-2">
            {!isAnswered ? (
              <Button
                onClick={handleConfirmAnswer}
                disabled={isNCQ ? ncqAnswer.trim() === "" : selectedOption === null}
                className="w-full h-11 text-sm font-semibold"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} className="w-full h-11 text-sm font-semibold">
                {currentQuestionIndex < questions.length - 1
                  ? <><span>Next Question</span><ArrowRight className="w-4 h-4 ml-1" /></>
                  : "Finish Quiz"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
