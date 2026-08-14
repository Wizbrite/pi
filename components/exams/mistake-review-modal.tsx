"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MissedQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  userAnswer: number;
  explanation: string;
}

interface MistakeReviewModalProps {
  isOpen: boolean;
  missedQuestions: MissedQuestion[];
  onClose: () => void;
  onFinish: () => void;
}

export function MistakeReviewModal({
  isOpen,
  missedQuestions,
  onClose,
  onFinish,
}: MistakeReviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  if (!isOpen || missedQuestions.length === 0) return null;

  const currentQuestion = missedQuestions[currentIndex];
  const isCorrect = selectedOption === currentQuestion.correctAnswer;
  const isLastQuestion = currentIndex === missedQuestions.length - 1;

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctAnswer) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onFinish();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  const progressPercent = ((currentIndex + 1) / missedQuestions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Mistake Correction</h2>
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

        {/* Progress Bar */}
        <div className="w-full bg-muted h-1.5">
          <div
            className="bg-primary h-1.5 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
              Retry Missed Question
            </span>
            <h3 className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
              {currentQuestion.questionText}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((option, idx) => {
              let style = "border-border hover:bg-muted/50 text-foreground";

              if (isAnswered) {
                if (idx === currentQuestion.correctAnswer) {
                  style = "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 font-semibold";
                } else if (selectedOption === idx) {
                  style = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                } else {
                  style = "border-border opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border text-left transition flex items-center justify-between text-xs sm:text-sm font-medium ${style}`}
                >
                  <span>{option}</span>
                  {isAnswered && idx === currentQuestion.correctAnswer && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                  {isAnswered && selectedOption === idx && !isCorrect && (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
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
                {isCorrect ? "Got it right this time!" : "Explanation"}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1 text-purple-600 border-purple-200 dark:text-purple-400"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Hint
          </Button>

          {isAnswered ? (
            <Button size="sm" onClick={handleNext} className="text-xs gap-1">
              {isLastQuestion ? "Finish Review" : "Next Question"}{" "}
              <ArrowRight className="w-3.5 h-3.5" />
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