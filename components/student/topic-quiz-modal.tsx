"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Trophy, ArrowRight, RotateCcw, CheckCircle2, XCircle, BookOpen, Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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
  onQuizComplete?: (score: number, earnedXp: number, failedQuestions: FailedQuestion[]) => void;
}

export function TopicQuizModal({
  isOpen,
  onClose,
  topicTitle,
  lessonTitle,
  lessonId,
  onQuizComplete
}: TopicQuizModalProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [ncqAnswer, setNcqAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState(false);
  
  const [score, setScore] = useState(0);
  const [failedQuestions, setFailedQuestions] = useState<FailedQuestion[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const XP_PER_CORRECT = 50;

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/questions`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      
      setQuestions(json.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (isOpen) {
      fetchQuestions();
      handleReset();
    }
  }, [isOpen, fetchQuestions]);

  if (!isOpen) return null;

  const currentQ = questions[currentQuestionIndex];
  const isNCQ = currentQ && (!currentQ.options || currentQ.options.length === 0);

  const handleSelectOption = (opt: string) => {
    if (!isAnswered) setSelectedOption(opt);
  };

  const handleConfirmAnswer = () => {
    if (!currentQ) return;
    setIsAnswered(true);

    const userAnswer = isNCQ ? ncqAnswer : selectedOption;
    // Basic exact-match for NCQ for now; in a real app, AI could grade this.
    const isCorrect = isNCQ 
      ? userAnswer?.trim().toLowerCase() === currentQ.correctAnswer.toLowerCase()
      : userAnswer === currentQ.correctAnswer;

    if (isCorrect) {
      setIsIncorrect(false);
      setScore(prev => prev + 1);
    } else {
      setIsIncorrect(true);
      setFailedQuestions(prev => [
        ...prev,
        {
          questionText: currentQ.questionText,
          userAnswer: userAnswer || "No answer",
          correctAnswer: currentQ.correctAnswer
        }
      ]);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setNcqAnswer("");
      setIsAnswered(false);
      setIsIncorrect(false);
      setShowAiInput(false);
      setAiResponse(null);
    } else {
      setQuizFinished(true);
      const totalXp = score * XP_PER_CORRECT;
      
      // Auto-complete lesson
      fetch(`/api/lessons/${lessonId}/complete`, { method: "POST" })
        .catch(err => console.error("Failed to complete lesson", err));
        
      if (onQuizComplete) {
        onQuizComplete(score, totalXp, failedQuestions);
      }
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
    setAiResponse(null);
  };

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiResponse(`AI Tutor: The correct answer is related to "${currentQ?.correctAnswer}". In a full integration, I would explain why your answer "${isNCQ ? ncqAnswer : selectedOption}" was right or wrong.`);
    setAiQuery("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border border-border w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-muted/30 shrink-0">
          <div>
            <Badge variant="accent" className="text-[10px] uppercase">
              {topicTitle}
            </Badge>
            <h3 className="text-sm font-bold text-foreground mt-0.5">{lessonTitle} Assessment</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-xs">Loading questions...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <p className="text-red-500 text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchQuestions}>Retry</Button>
            </div>
          ) : !questions || questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <p className="text-muted-foreground text-sm">No questions available for this lesson.</p>
            </div>
          ) : !quizFinished ? (
            <>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span className="font-semibold text-primary">Potential XP: {questions.length * XP_PER_CORRECT}</span>
              </div>

              <p className="font-medium text-foreground text-base leading-snug">{currentQ.questionText}</p>

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

                    if (selectedOption === opt) {
                      btnStyle = "border-primary bg-primary/10 text-primary font-medium";
                    }

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

              {isAnswered && (
                <div className="space-y-3 pt-2">
                  <div className={`p-3 rounded-lg border text-xs leading-relaxed ${isIncorrect ? 'bg-red-500/5 border-red-500/20 text-foreground' : 'bg-muted border-border text-muted-foreground'}`}>
                    <span className="font-bold block mb-0.5">
                      {isIncorrect ? "Not quite right!" : "Correct Explanation:"}
                    </span>
                    {currentQ.explanation || "No explanation provided."}
                  </div>

                  {isIncorrect && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground">
                        Need to refresh your concepts before proceeding?
                      </div>
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

                  {!showAiInput ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAiInput(true)}
                      className="text-xs text-primary hover:text-primary/80 px-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" /> Confused? Ask AI Tutor
                    </Button>
                  ) : (
                    <form onSubmit={handleAskAi} className="flex gap-2 pt-1">
                      <Input
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        placeholder="Why is this answer correct?"
                        className="text-xs h-9"
                      />
                      <Button type="submit" size="sm" className="h-9 px-3 shrink-0">
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </form>
                  )}

                  {aiResponse && (
                    <div className="p-3 bg-accent border border-primary/20 rounded-lg text-xs text-accent-foreground">
                      {aiResponse}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
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

        {!quizFinished && !isLoading && !error && questions.length > 0 && (
          <div className="p-3.5 border-t border-border bg-background shrink-0 flex gap-2">
            {!isAnswered ? (
              <Button
                onClick={handleConfirmAnswer}
                disabled={isNCQ ? ncqAnswer.trim() === "" : selectedOption === null}
                className="w-full h-11 text-sm font-semibold shadow-xs"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} className="w-full h-11 text-sm font-semibold shadow-xs">
                Next Question <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
