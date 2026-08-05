"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Send,
  ArrowRight,
  RotateCcw,
  X,
  BookOpen,
  Zap,
  Trophy
} from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the primary characteristic of thermal equilibrium?",
    options: [
      "Both systems have equal heat energy",
      "No net heat transfer occurs between the systems",
      "One system loses heat continuously",
      "Temperature difference is at its maximum"
    ],
    correctIndex: 1,
    explanation: "Thermal equilibrium occurs when two objects in thermal contact cease to exchange heat by radiation or conduction because they have reached the same temperature."
  },
  {
    id: 2,
    question: "Which law of thermodynamics states that energy cannot be created or destroyed?",
    options: [
      "Zeroth Law",
      "First Law",
      "Second Law",
      "Third Law"
    ],
    correctIndex: 1,
    explanation: "The First Law of Thermodynamics is a formulation of the law of conservation of energy."
  }
];

interface TopicQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  lessonTitle: string;
  onQuizComplete?: (score: number, earnedXp: number) => void;
}

export function TopicQuizModal({
  isOpen,
  onClose,
  topicTitle,
  lessonTitle,
  onQuizComplete
}: TopicQuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const [showAiInput, setShowAiInput] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const q = MOCK_QUESTIONS[currentQuestionIndex];
  const isIncorrect = isAnswered && selectedOption !== q.correctIndex;
  const XP_PER_CORRECT = 25;
  const totalEarnedXp = score * XP_PER_CORRECT;

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    if (selectedOption === q.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowAiInput(false);
    setAiResponse(null);

    if (currentQuestionIndex + 1 < MOCK_QUESTIONS.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const finalScore = selectedOption === q.correctIndex ? score + 1 : score;
      const finalXp = finalScore * XP_PER_CORRECT;
      setQuizFinished(true);
      if (onQuizComplete) {
        onQuizComplete(finalScore, finalXp);
      }
    }
  };

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiResponse(`AI Breakdown for Question ${q.id}: regarding "${aiQuery}"...`);
    setAiQuery("");
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setShowAiInput(false);
    setAiResponse(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4 pb-16 md:pb-4">
      <div className="w-full max-w-xl bg-background border-t md:border border-border rounded-t-2xl md:rounded-xl shadow-xl max-h-[85dvh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
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

        {/* Modal Scrollable Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {!quizFinished ? (
            <>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Question {currentQuestionIndex + 1} of {MOCK_QUESTIONS.length}</span>
                <span className="font-semibold text-primary">Potential XP: {MOCK_QUESTIONS.length * XP_PER_CORRECT}</span>
              </div>

              <p className="font-medium text-foreground text-base leading-snug">{q.question}</p>

              <div className="space-y-2 pt-1">
                {q.options.map((opt, idx) => {
                  let btnStyle = "border-border bg-card text-card-foreground hover:border-primary/50";

                  if (selectedOption === idx) {
                    btnStyle = "border-primary bg-primary/10 text-primary font-medium";
                  }

                  if (isAnswered) {
                    if (idx === q.correctIndex) {
                      btnStyle = "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400 font-medium";
                    } else if (selectedOption === idx) {
                      btnStyle = "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full p-3 rounded-lg border text-left text-sm transition-all flex justify-between items-center min-h-[44px] touch-manipulation active:scale-[0.99] ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && idx === q.correctIndex && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 ml-2" />}
                      {isAnswered && selectedOption === idx && idx !== q.correctIndex && <XCircle className="w-4 h-4 text-red-500 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="space-y-3 pt-2">
                  <div className={`p-3 rounded-lg border text-xs leading-relaxed ${isIncorrect ? 'bg-red-500/5 border-red-500/20 text-foreground' : 'bg-muted border-border text-muted-foreground'}`}>
                    <span className="font-bold block mb-0.5">
                      {isIncorrect ? "Not quite right!" : "Correct Explanation:"}
                    </span>
                    {q.explanation}
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
                      <Sparkles className="w-3.5 h-3.5 mr-1" /> Confused? Ask AI Tutor about this question
                    </Button>
                  ) : (
                    <form onSubmit={handleAskAi} className="flex gap-2 pt-1">
                      <Input
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        placeholder="Why is option 2 correct?"
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
            /* Gamified Post-Quiz Victory View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                <Trophy className="w-8 h-8" />
              </div>
              
              <div className="space-y-1">
                <Badge className="bg-amber-500 text-black font-bold uppercase tracking-wider text-[10px]">
                  Mastery Quiz Completed
                </Badge>
                <h4 className="text-2xl font-black text-foreground">+{totalEarnedXp} XP</h4>
                <p className="text-xs text-muted-foreground">
                  You scored <span className="font-bold text-foreground">{score}/{MOCK_QUESTIONS.length}</span> correct choices.
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden max-w-xs mx-auto">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(score / MOCK_QUESTIONS.length) * 100}%` }}
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

        {/* Footer Actions */}
        {!quizFinished && (
          <div className="p-3.5 border-t border-border bg-background shrink-0 flex gap-2">
            {!isAnswered ? (
              <Button
                onClick={handleConfirmAnswer}
                disabled={selectedOption === null}
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