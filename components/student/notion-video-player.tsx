"use client";

/**
 * NotionVideoPlayer — Vimeo embed with notion-gated quiz checkpoints.
 *
 * Question strategy:
 * ─ On mount (once all notions are known), calls /api/ai/notion-quiz ONCE
 *   to generate the full question pool for the entire video part.
 * ─ The API splits questions across notions (e.g. 10 per notion).
 * ─ When a notion ends, its pre-allocated questions are passed directly into
 *   the quiz modal (no additional AI calls needed per student per notion).
 *
 * Time-tracking strategy (belt-and-suspenders):
 * ─ Primary: Vimeo postMessage `timeupdate` event subscription
 * ─ Fallback: setInterval polling every 500ms via `getCurrentTime` postMessage
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Lock, CheckCircle2, Play, Loader2, Video, Sparkles, AlertTriangle, RotateCcw } from "lucide-react";
import { NotionQuizModal, NotionInfo, NotionQuestion } from "./notion-quiz-modal";
import { Button } from "@/components/ui/button";

export interface NotionDef {
  id: string;
  label: string;
  startTime: number;    // seconds
  endTime: number;      // seconds (0 = no hard stop for this notion)
  description?: string;
  passingScore: number;
}

interface NotionVideoPlayerProps {
  vimeoEmbedUrl: string;
  notions: NotionDef[];
  lessonId: string;
  courseId: string;
  partNumber: number;
  lessonTitle: string;
  partTitle: string;
  /** Part-level quiz config */
  totalQuestions?: number;
  questionsPerNotion?: number;
  videoContext?: string;    // transcript / summary for AI
  initialProgress?: Record<string, { passed: boolean; attempts: number; bestScore: number }>;
}

/** Append Vimeo Player API query params */
function buildEmbedUrl(raw: string): string {
  try {
    const base = raw.split("?")[0];
    const existingParams = new URLSearchParams(raw.includes("?") ? raw.split("?")[1] : "");
    existingParams.set("api", "1");
    existingParams.set("autopause", "0");
    return `${base}?${existingParams.toString()}`;
  } catch {
    return raw;
  }
}

/** Post a command to the Vimeo iframe */
function vimeoPost(iframe: HTMLIFrameElement | null, method: string, value?: unknown) {
  if (!iframe?.contentWindow) return;
  const msg = value !== undefined ? { method, value } : { method };
  iframe.contentWindow.postMessage(JSON.stringify(msg), "https://player.vimeo.com");
}

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function NotionVideoPlayer({
  vimeoEmbedUrl,
  notions,
  lessonId,
  courseId,
  partNumber,
  lessonTitle,
  partTitle,
  totalQuestions = 20,
  questionsPerNotion = 10,
  videoContext = "",
  initialProgress = {},
}: NotionVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ─── refs (no stale-closure issues) ────────────────────────────────────────
  const pausedForQuizRef  = useRef(false);
  const pendingNotionRef  = useRef<NotionDef | null>(null);
  const progressRef       = useRef(initialProgress);
  const sortedNotionsRef  = useRef<NotionDef[]>([]);
  const pollIntervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── React state (for rendering only) ──────────────────────────────────────
  const [progress, setProgress]       = useState(initialProgress);
  const [activeNotion, setActiveNotion] = useState<NotionInfo | null>(null);
  const [isPlayerLoading, setIsPlayerLoading] = useState(true);

  // ─── Question pool state ────────────────────────────────────────────────────
  type QuestionPoolStatus = "idle" | "loading" | "ready" | "error";
  const [poolStatus, setPoolStatus]   = useState<QuestionPoolStatus>("idle");
  const [poolError, setPoolError]     = useState<string | null>(null);
  // Map: notionId → questions allocated to it
  const [questionPool, setQuestionPool] = useState<Record<string, NotionQuestion[]>>({});
  const questionPoolRef = useRef<Record<string, NotionQuestion[]>>({});

  // Keep refs in sync
  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => {
    sortedNotionsRef.current = [...notions].sort((a, b) => a.startTime - b.startTime);
  }, [notions]);
  useEffect(() => { questionPoolRef.current = questionPool; }, [questionPool]);

  // ─── Generate the full question pool ONCE on mount ─────────────────────────
  const generatePool = useCallback(async () => {
    if (notions.length === 0) return;
    setPoolStatus("loading");
    setPoolError(null);
    try {
      const res = await fetch("/api/ai/notion-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle,
          partTitle,
          videoContext,
          notions: notions.map((n) => ({
            id: n.id,
            label: n.label,
            description: n.description,
            passingScore: n.passingScore,
          })),
          totalQuestions: Math.max(totalQuestions, notions.length * questionsPerNotion),
          questionsPerNotion,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to generate questions");

      const allocations: { notionId: string; questions: NotionQuestion[] }[] =
        json.data.allocations ?? [];

      const pool: Record<string, NotionQuestion[]> = {};
      for (const alloc of allocations) {
        pool[alloc.notionId] = alloc.questions;
      }

      setQuestionPool(pool);
      questionPoolRef.current = pool;
      setPoolStatus("ready");
    } catch (err: any) {
      setPoolError(err.message || "Failed to prepare video questions");
      setPoolStatus("error");
    }
  }, [notions, lessonTitle, partTitle, videoContext, totalQuestions, questionsPerNotion]);

  useEffect(() => {
    if (notions.length > 0) generatePool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  // ─── Core time-check (uses only refs — no closure deps) ──────────────────
  const checkTime = useCallback((t: number) => {
    if (pausedForQuizRef.current) return;

    const sorted = sortedNotionsRef.current;
    const prog   = progressRef.current;

    for (let i = 0; i < sorted.length; i++) {
      const n         = sorted[i];
      const prevPassed = i > 0 ? !!prog[sorted[i - 1].id]?.passed : true;
      const unlocked   = i === 0 || prevPassed;

      if (!unlocked) {
        // Block scrubbing past locked notion
        if (t >= n.startTime) {
          vimeoPost(iframeRef.current, "setCurrentTime", Math.max(n.startTime - 2, 0));
          vimeoPost(iframeRef.current, "pause");
        }
        break;
      }

      // Trigger quiz at notion end time
      if (n.endTime > 0 && t >= n.endTime && !prog[n.id]?.passed) {
        pausedForQuizRef.current = true;
        pendingNotionRef.current = n;
        vimeoPost(iframeRef.current, "pause");

        // Get pre-allocated questions for this notion
        const preQuestions = questionPoolRef.current[n.id] ?? [];

        setActiveNotion({
          id: n.id,
          label: n.label,
          description: n.description,
          passingScore: n.passingScore,
          questionsCount: preQuestions.length || questionsPerNotion,
          startTime: n.startTime,
          preGeneratedQuestions: preQuestions,
        });
        return;
      }
    }
  }, [questionsPerNotion]);

  // ─── Vimeo postMessage listener ───────────────────────────────────────────
  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      if (!ev.origin.includes("vimeo.com")) return;
      let data: any;
      try { data = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data; }
      catch { return; }

      if (data.event === "ready") {
        setIsPlayerLoading(false);
        vimeoPost(iframeRef.current, "addEventListener", "timeupdate");
        vimeoPost(iframeRef.current, "addEventListener", "finish");
      }
      if (data.event === "timeupdate" && data.data?.seconds !== undefined) {
        checkTime(data.data.seconds as number);
      }
      if (data.method === "getCurrentTime" && typeof data.value === "number") {
        checkTime(data.value as number);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [checkTime]);

  // ─── Polling fallback ─────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      pollIntervalRef.current = setInterval(() => {
        if (!pausedForQuizRef.current) vimeoPost(iframeRef.current, "getCurrentTime");
      }, 500);
    }, 2000);
    return () => {
      clearTimeout(t);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Re-subscribe on iframe load
  const handleIframeLoad = useCallback(() => {
    setTimeout(() => {
      vimeoPost(iframeRef.current, "addEventListener", "timeupdate");
    }, 500);
  }, []);

  // ─── Quiz handlers ────────────────────────────────────────────────────────
  const handlePassed = useCallback(() => {
    const n = pendingNotionRef.current;
    if (!n) return;
    setProgress((prev) => {
      const next = { ...prev, [n.id]: { passed: true, attempts: (prev[n.id]?.attempts ?? 0) + 1, bestScore: 100 } };
      progressRef.current = next;
      return next;
    });
    setActiveNotion(null);
    pausedForQuizRef.current = false;
    pendingNotionRef.current = null;
    vimeoPost(iframeRef.current, "play");
  }, []);

  const handleFailed = useCallback(() => {
    const n = pendingNotionRef.current;
    if (!n) return;
    setProgress((prev) => {
      const next = { ...prev, [n.id]: { passed: false, attempts: (prev[n.id]?.attempts ?? 0) + 1, bestScore: prev[n.id]?.bestScore ?? 0 } };
      progressRef.current = next;
      return next;
    });
    setActiveNotion(null);
    pausedForQuizRef.current = false;
    pendingNotionRef.current = null;
    vimeoPost(iframeRef.current, "setCurrentTime", n.startTime);
    setTimeout(() => vimeoPost(iframeRef.current, "play"), 300);
  }, []);

  // ─── Derived display ──────────────────────────────────────────────────────
  const sortedNotions = [...notions].sort((a, b) => a.startTime - b.startTime);
  const embedUrl      = buildEmbedUrl(vimeoEmbedUrl);

  return (
    <div className="space-y-4">
      {/* AI question pool status banner */}
      {notions.length > 0 && (
        <div className={[
          "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-medium border",
          poolStatus === "loading" ? "border-primary/30 bg-primary/5 text-primary" :
          poolStatus === "ready"   ? "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400" :
          poolStatus === "error"   ? "border-red-400/30 bg-red-500/5 text-red-600 dark:text-red-400" :
          "border-border bg-muted/30 text-muted-foreground",
        ].join(" ")}>
          {poolStatus === "loading" && (
            <><Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              Pi AI is preparing {totalQuestions} questions for this video…</>
          )}
          {poolStatus === "ready" && (
            <><Sparkles className="h-3.5 w-3.5 shrink-0 text-green-500" />
              {totalQuestions} questions ready — {questionsPerNotion} allocated per notion</>
          )}
          {poolStatus === "error" && (
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {poolError || "Failed to prepare questions"}
              </span>
              <Button size="sm" variant="ghost" className="h-6 text-xs gap-1 px-2" onClick={generatePool}>
                <RotateCcw className="h-3 w-3" /> Retry
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Video */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-border shadow-sm">
        {isPlayerLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-white/50" />
            <p className="text-white/50 text-xs">Loading video…</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="absolute top-0 left-0 h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={partTitle || "Lesson Video"}
          onLoad={handleIframeLoad}
        />
      </div>

      {/* Notion markers */}
      {sortedNotions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5" /> Video Segments
          </p>

          <div className="flex flex-wrap gap-2">
            {sortedNotions.map((notion, i) => {
              const prevPassed = i > 0 ? !!progress[sortedNotions[i - 1].id]?.passed : true;
              const unlocked   = i === 0 || prevPassed;
              const passed     = !!progress[notion.id]?.passed;
              const bestScore  = progress[notion.id]?.bestScore;
              const qCount     = questionPool[notion.id]?.length ?? 0;

              return (
                <div
                  key={notion.id}
                  className={[
                    "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all",
                    passed   ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400"
                    : unlocked ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border bg-muted/50 text-muted-foreground opacity-60",
                  ].join(" ")}
                >
                  {passed   ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                  : unlocked ? <Play className="h-3 w-3 shrink-0" />
                            : <Lock className="h-3 w-3 shrink-0" />}
                  <span>{notion.label}</span>
                  <span className="opacity-60">
                    {fmt(notion.startTime)}{notion.endTime > 0 ? `–${fmt(notion.endTime)}` : "+"}
                  </span>
                  {poolStatus === "ready" && qCount > 0 && !passed && (
                    <span className="bg-primary/10 rounded-full px-1.5 text-[10px]">{qCount}Qs</span>
                  )}
                  {passed && bestScore !== undefined && (
                    <span className="bg-green-500/20 rounded-full px-1.5 text-[10px] font-bold">{bestScore}%</span>
                  )}
                  {!unlocked && <span className="bg-muted rounded-full px-1.5 text-[10px]">locked</span>}
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Complete each segment's quiz (min {sortedNotions[0]?.passingScore ?? 80}%) to unlock the next.
            {poolStatus === "ready" && ` · ${questionsPerNotion} questions per segment.`}
          </p>
        </div>
      )}

      {/* Quiz Modal */}
      {activeNotion && (
        <NotionQuizModal
          isOpen={!!activeNotion}
          notion={activeNotion}
          lessonId={lessonId}
          courseId={courseId}
          partNumber={partNumber}
          lessonTitle={lessonTitle}
          partTitle={partTitle}
          onPassed={handlePassed}
          onFailed={handleFailed}
        />
      )}
    </div>
  );
}
