"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface FormattedMarkdownProps {
  children: string;
  className?: string;
}

/**
 * FormattedMarkdown
 * 
 * Synchronized, high-quality Markdown renderer for Pi AI responses across:
 * - Student AI Tutor Chat Page (/student/ai-tutor)
 * - Lesson Bottom Chat & Prose (/student/courses/.../lessons/...)
 * - Selection Ask AI Floating Side Modal (SelectionAiSideModal.tsx)
 * - Topic Quiz Modal AI Evaluation & Tutor (topic-quiz-modal.tsx)
 * - Practice Hub AI Assistant
 */
export function FormattedMarkdown({ children, className }: FormattedMarkdownProps) {
  if (!children) return null;

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none leading-relaxed text-foreground", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-base md:text-lg font-bold text-foreground mt-3 mb-1.5 pb-1 border-b border-border/40" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm md:text-base font-bold text-foreground mt-3 mb-1" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs md:text-sm font-semibold text-foreground mt-2.5 mb-1" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-foreground/90" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside pl-4 space-y-1 my-2 text-foreground/90" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside pl-4 space-y-1 my-2 text-foreground/90" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-primary/60 pl-3 italic bg-primary/5 py-1.5 my-2.5 rounded-r text-muted-foreground text-xs md:text-sm" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] md:text-xs font-mono text-primary font-semibold border border-primary/20" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-3 rounded-xl bg-slate-950 text-slate-100 overflow-x-auto text-xs my-2.5 font-mono border border-slate-800 shadow-inner">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-foreground" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-border">
              <table className="min-w-full divide-y divide-border text-xs" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="px-3 py-2 bg-muted/70 font-semibold text-left border-b border-border text-foreground" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 border-b border-border/40 text-muted-foreground" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-3 border-border/60" {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
