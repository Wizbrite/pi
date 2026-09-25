"use client";

import React, { useState, useEffect, useRef } from "react";
import { FormattedMarkdown } from "@/components/shared/FormattedMarkdown";
import {
  Sparkles, X, Send, Loader2, Quote, RefreshCw, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SelectionAiSideModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  aiResponse: string;
  isLoading: boolean;
  error: string | null;
  onAskFollowUp: (query: string) => Promise<void>;
  onRetry: () => void;
}

export function SelectionAiSideModal({
  isOpen,
  onClose,
  selectedText,
  aiResponse,
  isLoading,
  error,
  onAskFollowUp,
  onRetry,
}: SelectionAiSideModalProps) {
  const [followUp, setFollowUp] = useState("");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as response streams in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiResponse, isLoading]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUp.trim() || isLoading) return;
    const text = followUp.trim();
    setFollowUp("");
    await onAskFollowUp(text);
  };

  const handleCopy = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(aiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Semi-transparent non-blocking mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[90] md:hidden animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Floating Side Modal Pop-Up */}
      <div
        className="fixed z-[100] transition-all duration-300 ease-out
          bottom-4 left-4 right-4 max-h-[85vh] h-[550px]
          md:bottom-6 md:right-6 md:left-auto md:top-20 md:w-[450px] md:max-h-[calc(100vh-7rem)] md:h-auto
          bg-card/95 backdrop-blur-md border border-primary/20 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 md:slide-in-from-right-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary border border-primary/30">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 id="side-modal-title" className="text-sm font-bold text-foreground flex items-center gap-1.5">
                Pi AI Explanation
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                  Selected Text
                </Badge>
              </h3>
              <p className="text-[11px] text-muted-foreground">Contextual deep-dive assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {aiResponse && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Quote className="w-3.5 h-3.5" />}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={onClose}
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Selected Excerpt Preview */}
        {selectedText && (
          <div className="px-4 py-2.5 bg-muted/40 border-b border-border/40 shrink-0">
            <div className="flex items-start gap-2 text-xs">
              <Quote className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-0.5" />
              <p className="text-muted-foreground italic line-clamp-2 leading-relaxed">
                &ldquo;{selectedText}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* AI Output Stream Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && !aiResponse && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <Sparkles className="w-4 h-4 text-primary absolute" />
              </div>
              <p className="text-xs text-muted-foreground animate-pulse font-medium">
                Pi AI is thinking & writing your explanation...
              </p>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs space-y-2">
              <p className="font-semibold text-destructive flex items-center gap-1.5">
                <span>⚠️</span> Could not get AI response
              </p>
              <p className="text-muted-foreground">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1 border-destructive/30 hover:bg-destructive/10"
                onClick={onRetry}
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </Button>
            </div>
          )}

          {aiResponse && (
            <FormattedMarkdown className="text-xs md:text-sm">{aiResponse}</FormattedMarkdown>
          )}

          {isLoading && aiResponse && (
            <div className="flex items-center gap-2 text-xs text-primary/70 font-medium pt-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating streaming thoughts...</span>
            </div>
          )}
        </div>

        {/* Follow-up Question Input Footer */}
        <div className="p-3 border-t border-border/60 bg-muted/20 shrink-0">
          <form onSubmit={handleSendFollowUp} className="flex items-center gap-2">
            <Input
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              placeholder="Ask a follow-up about this excerpt..."
              className="text-xs h-9 bg-background/80 border-border/60 focus-visible:ring-primary"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 shrink-0 bg-primary text-primary-foreground shadow-sm"
              disabled={isLoading || !followUp.trim()}
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
