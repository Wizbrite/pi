"use client";

import { Sparkles, Bot, Send } from "lucide-react";
import { useState } from "react";

interface AiTutorBannerProps {
  onAsk?: (question: string) => void;
}

export function AiTutorBanner({ onAsk }: AiTutorBannerProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (onAsk) {
      onAsk(query);
    }
    setQuery("");
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary p-6 text-white shadow-md">
      {/* Decorative ambient lighting */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 right-1/3 h-32 w-32 rounded-full bg-violet-400/20 blur-xl" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Ask your AI Tutor</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-violet-100 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 text-violet-300" />
                24/7 Available
              </span>
            </div>
            <p className="text-xs text-violet-100/90">
              Get instant step-by-step explanations for any GCE topic, question, or formula.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Explain Newton's 2nd Law or solve 2x² + 5x - 3 = 0"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-blue-200/70 shadow-inner outline-none backdrop-blur-md transition-all focus:border-white/40 focus:bg-white/15"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary shadow-md transition-all hover:bg-slate-50 active:scale-[0.98]"
          >
            Ask AI
            <Sparkles className="h-4 w-4 text-primary" />
          </button>
        </form>
      </div>
    </div>
  );
}

export function AiTutorFab({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open AI Assistant"
      className="fixed bottom-20 right-6 z-60 flex items-center gap-2.5 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
    >
      <div className="relative">
        <Bot className="h-5 w-5" />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-purple-300 ring-2 ring-primary" />
      </div>
      <span className="hidden sm:inline">Ask AI Tutor</span>
    </button>
  );
}
