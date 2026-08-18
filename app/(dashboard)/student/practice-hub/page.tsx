"use client";

import { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  BookOpen,
  Flame,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Play,
  X,
  Send,
  RotateCcw,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { usePracticeStore, SavedMistake } from "@/stores/practice-store";

export default function PracticeHubPage() {
  const { mistakes, removeMistake } = usePracticeStore();
  const [activeTab, setActiveTab] = useState<"ai-practice" | "mistake-bank">("ai-practice");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClearMistake = (id: string) => {
    removeMistake(id);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#131834] border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-600/10 text-violet-600 dark:text-violet-400">
              Duolingo-Style Review
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Spaced Repetition</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0a0d1d] dark:text-white mt-1">Practice Hub</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Target your weak areas, review recorded mistakes, and run AI mini-sessions.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#f4f6fc] dark:bg-[#0a0d1d] p-3 rounded-xl border border-slate-200/80 dark:border-white/10 shrink-0">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Mistakes to Clear</p>
            <p className="text-lg font-bold text-[#0a0d1d] dark:text-white">{mistakes.length} Items</p>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex gap-2 border-b border-slate-200/80 dark:border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("ai-practice")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "ai-practice"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
              : "text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Mini Practice</span>
        </button>

        <button
          onClick={() => setActiveTab("mistake-bank")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "mistake-bank"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
              : "text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Mistake Bank ({mistakes.length})</span>
        </button>
      </div>

      {/* Tab Content 1: AI Mini Practice */}
      {activeTab === "ai-practice" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#131834] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0a0d1d] dark:text-white">Smart Adaptive Session</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                AI dynamically creates 5 questions pulling strictly from completed lessons where your confidence score is lowest.
              </p>
            </div>

            <Link
              href="/student/daily-challenge"
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm transition-colors text-center flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20"
            >
              <span>Start 5-Min AI Practice</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

         
        </div>
      )}

      {/* Tab Content 2: Mistake Bank */}
      {activeTab === "mistake-bank" && (
        <div className="space-y-4">
          {mistakes.length > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-violet-600/10 border border-violet-600/20">
              <div>
                <h3 className="text-sm font-bold text-violet-950 dark:text-violet-300">Ready to clear your mistakes?</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Launch an interactive drill session covering all {mistakes.length} stored mistakes.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-violet-600/20 transition-all shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Practice Session</span>
              </button>
            </div>
          )}

          {mistakes.length > 0 ? (
            mistakes.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-white dark:bg-[#131834] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-600/10 text-violet-600 dark:text-violet-400">
                      {item.subject}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.topic}</span>
                  </div>
                  <span className="text-xs text-rose-500 font-medium">Failed {item.attemptsFailed || 1}x</span>
                </div>

                <p className="text-base font-semibold text-[#0a0d1d] dark:text-white">{item.question}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm pt-2">
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400">
                    <span className="block text-[10px] uppercase font-bold text-rose-500/70">Your Answer</span>
                    {item.incorrectAnswer}
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    <span className="block text-[10px] uppercase font-bold text-emerald-500/70">Correct Solution</span>
                    {item.correctAnswer}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleClearMistake(item.id)}
                    className="text-xs text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Mastered</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 rounded-xl bg-white dark:bg-[#131834] border border-slate-200/80 dark:border-white/10 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-violet-500 mx-auto" />
              <h3 className="text-lg font-bold text-[#0a0d1d] dark:text-white">Mistake Bank Clear!</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                You currently have no saved mistakes. Keep practicing lessons to automatically log questions you'd like to revisit!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Interactive Mistake Drill Modal */}
      {isModalOpen && (
        <MistakeQuizModal
          mistakes={mistakes}
          onClose={() => setIsModalOpen(false)}
          onMastered={(id) => removeMistake(id)}
        />
      )}
    </div>
  );
}

function MistakeQuizModal({
  mistakes,
  onClose,
  onMastered,
}: {
  mistakes: any[];
  onClose: () => void;
  onMastered: (id: string) => void;
}) {

  const [earnedXp, setEarnedXp] = useState(0);
  
  // Snapshot the initial mistakes list so array indices remain stable during review
  const [initialMistakes] = useState(() => [...mistakes]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // AI Assistant State
  const [showAi, setShowAi] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const currentItem = initialMistakes[currentIndex];

  // Derive options list containing the wrong and right answer
  const options = currentItem
    ? [currentItem.incorrectAnswer, currentItem.correctAnswer]
        .filter(Boolean)
        .sort(() => (currentItem.id.charCodeAt(0) || 1) % 2 - 0.5)
    : [];

  const handleSubmit = () => {
    if (!selectedAnswer || !currentItem) return;
    setIsSubmitted(true);
    
    if (selectedAnswer === currentItem.correctAnswer) {
      onMastered(currentItem.id);
      setEarnedXp((prev) => prev + 20); // Track +20 XP per correct question
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setShowAi(false);
    setAiResponse(null);

    if (currentIndex + 1 < initialMistakes.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;
    setAiResponse(
      `AI Explanation for "${currentItem.question}": The correct solution is "${currentItem.correctAnswer}". ${
        aiQuery
          ? `Regarding "${aiQuery}": Always focus on core rules for ${currentItem.topic}.`
          : `Note that "${currentItem.incorrectAnswer}" fails to satisfy the topic criteria.`
      }`
    );
    setAiQuery("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-[#131834] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0d1d]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-600/10 text-violet-600 dark:text-violet-400">
              Mistake Drill Session
            </span>
            <h3 className="text-sm font-bold text-[#0a0d1d] dark:text-white mt-0.5">
              {!isFinished ? `Question ${currentIndex + 1} of ${initialMistakes.length}` : "Drill Finished"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm">
          {!isFinished && currentItem ? (
            <>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentItem.subject} • {currentItem.topic}
                </p>
                <h4 className="text-base font-bold text-[#0a0d1d] dark:text-white leading-snug">
                  {currentItem.question}
                </h4>
              </div>

              {/* Options list */}
              <div className="space-y-2 pt-2">
                {options.map((option, idx) => {
                  let btnStyle =
                    "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0d1d] text-slate-800 dark:text-slate-200 hover:border-violet-600/50";

                  if (selectedAnswer === option) {
                    btnStyle = "border-violet-600 bg-violet-600/10 text-violet-600 font-semibold";
                  }

                  if (isSubmitted) {
                    if (option === currentItem.correctAnswer) {
                      btnStyle =
                        "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold";
                    } else if (selectedAnswer === option) {
                      btnStyle = "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isSubmitted}
                      onClick={() => setSelectedAnswer(option)}
                      className={`w-full p-3.5 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {isSubmitted && option === currentItem.correctAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      {isSubmitted && selectedAnswer === option && option !== currentItem.correctAnswer && (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and AI Explanation Trigger */}
              {isSubmitted && (
                <div className="space-y-3 pt-2">
                  <div
                    className={`p-3 rounded-xl border text-xs leading-relaxed ${
                      selectedAnswer === currentItem.correctAnswer
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    <span className="font-bold block mb-0.5">
                      {selectedAnswer === currentItem.correctAnswer
                        ? "Great job! Mistake cleared."
                        : "Not quite right!"}
                    </span>
                    Correct answer: <span className="font-semibold">{currentItem.correctAnswer}</span>
                  </div>

                  {!showAi ? (
                    <button
                      onClick={() => setShowAi(true)}
                      className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Still confused? Ask AI Tutor to explain concept</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-slate-100 dark:bg-[#0a0d1d] border border-violet-600/20 rounded-xl space-y-2">
                      <form onSubmit={handleAskAi} className="flex gap-2">
                        <input
                          type="text"
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          placeholder="Ask AI why this answer is correct..."
                          className="flex-1 bg-white dark:bg-[#131834] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-violet-600"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold flex items-center justify-center"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>

                      {aiResponse && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                          {aiResponse}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Session Completed Screen */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-[#0a0d1d] dark:text-white">Mistake Drill Complete!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You reviewed all recorded mistakes and earned <span className="font-bold text-amber-500">+{earnedXp} XP</span>!
                </p>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-semibold shadow-md shadow-violet-600/20"
              >
                Return to Practice Hub
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!isFinished && (
          <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0d1d]">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-bold transition-all"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}