"use client";

/**
 * NotionVideoPlayer — Vimeo embed with notion-gated quiz checkpoints.
 *
 * Reliability strategy:
 * ─ We use TWO mechanisms to track video time (belt-and-suspenders approach):
 *   1. Vimeo postMessage `timeupdate` event subscription (fires ~every 250ms)
 *   2. A setInterval polling fallback that calls `getCurrentTime` every 500ms
 *      in case the event subscription is dropped or delayed.
 *
 * ─ We deliberately avoid filtering by player_id because some Vimeo embed
 *   configurations don't echo it back reliably.
 *
 * ─ All mutable check state is kept in refs to avoid stale-closure bugs.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Lock, CheckCircle2, Play, Loader2, Video } from "lucide-react";
import { NotionQuizModal, NotionInfo } from "./notion-quiz-modal";

export interface NotionDef {
  id: string;
  label: string;
  startTime: number;    // seconds
  endTime: number;      // seconds (0 means last segment — no hard stop)
  description?: string;
  passingScore: number;
  questionsCount: number;
}

interface NotionVideoPlayerProps {
  vimeoEmbedUrl: string;
  notions: NotionDef[];
  lessonId: string;
  courseId: string;
  partNumber: number;
  lessonTitle: string;
  partTitle: string;
  initialProgress?: Record<string, { passed: boolean; attempts: number; bestScore: number }>;
}

/** Append Vimeo Player API query params to the embed URL */
function buildEmbedUrl(raw: string): string {
  try {
    // Strip trailing `?` if present, then reconstruct cleanly
    const base = raw.split("?")[0];
    const existingParams = new URLSearchParams(raw.includes("?") ? raw.split("?")[1] : "");
    existingParams.set("api", "1");
    existingParams.set("autopause", "0");
    return `${base}?${existingParams.toString()}`;
  } catch {
    return raw;
  }
}

/** Post a command to the Vimeo iframe via the Player postMessage API */
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
  initialProgress = {},
}: NotionVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ─── refs (no stale-closure issues) ────────────────────────────────────────
  const currentTimeRef    = useRef(0);
  const pausedForQuizRef  = useRef(false);   // true while quiz modal is open
  const pendingNotionRef  = useRef<NotionDef | null>(null);
  const progressRef       = useRef(initialProgress);
  const sortedNotionsRef  = useRef<NotionDef[]>([]);
  const playerReadyRef    = useRef(false);
  const pollIntervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── React state (for rendering only) ──────────────────────────────────────
  const [progress, setProgress] = useState(initialProgress);
  const [activeNotion, setActiveNotion] = useState<NotionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Keep progressRef in sync with state
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Build sorted notions once
  useEffect(() => {
    sortedNotionsRef.current = [...notions].sort((a, b) => a.startTime - b.startTime);
  }, [notions]);

  // ─── Core time-check logic (pure refs — no closure deps) ─────────────────
  const checkTime = useCallback((t: number) => {
    if (pausedForQuizRef.current) return;
    currentTimeRef.current = t;

    const sorted = sortedNotionsRef.current;
    const prog = progressRef.current;

    // Walk notions in order; stop at the first locked one
    for (let i = 0; i < sorted.length; i++) {
      const n = sorted[i];
      const isFirst = i === 0;
      const prevPassed = i > 0 ? !!prog[sorted[i - 1].id]?.passed : true;
      const unlocked = isFirst || prevPassed;

      if (!unlocked) {
        // Enforce lock: if student scrubbed past this notion's startTime, push back
        if (t >= n.startTime) {
          vimeoPost(iframeRef.current, "setCurrentTime", Math.max(n.startTime - 2, 0));
          vimeoPost(iframeRef.current, "pause");
        }
        break;
      }

      // Check if we've reached the end of this unlocked notion
      if (n.endTime > 0 && t >= n.endTime && !prog[n.id]?.passed) {
        pausedForQuizRef.current = true;
        pendingNotionRef.current = n;
        vimeoPost(iframeRef.current, "pause");
        setActiveNotion({
          id: n.id,
          label: n.label,
          description: n.description,
          passingScore: n.passingScore,
          questionsCount: n.questionsCount,
          startTime: n.startTime,
        });
        return; // stop checking; quiz is now shown
      }
    }
  }, []); // no deps — uses only refs

  // ─── Subscribe to Vimeo postMessage events ────────────────────────────────
  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      // Only accept messages from Vimeo
      if (!ev.origin.includes("vimeo.com")) return;

      let data: any;
      try {
        data = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
      } catch {
        return;
      }

      // Ready — subscribe to timeupdate
      if (data.event === "ready") {
        playerReadyRef.current = true;
        setIsLoading(false);
        vimeoPost(iframeRef.current, "addEventListener", "timeupdate");
        vimeoPost(iframeRef.current, "addEventListener", "finish");
      }

      // timeupdate — primary time source
      if (data.event === "timeupdate" && data.data?.seconds !== undefined) {
        checkTime(data.data.seconds as number);
      }

      // Response to our polled getCurrentTime calls — fallback time source
      if (data.method === "getCurrentTime" && typeof data.value === "number") {
        checkTime(data.value as number);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [checkTime]);

  // ─── Polling fallback: send getCurrentTime every 500 ms ──────────────────
  // This fires even if Vimeo's timeupdate subscription silently failed.
  useEffect(() => {
    const startPolling = () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => {
        if (pausedForQuizRef.current) return; // don't poll while quiz is open
        vimeoPost(iframeRef.current, "getCurrentTime");
      }, 500);
    };

    // Start polling after a short delay to give the iframe time to init
    const timer = setTimeout(startPolling, 2000);

    return () => {
      clearTimeout(timer);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // ─── Also send ready subscription when iframe loads ───────────────────────
  const handleIframeLoad = useCallback(() => {
    // Send addEventListener as soon as the iframe DOM is loaded
    // (in case the ready postMessage event was missed)
    setTimeout(() => {
      vimeoPost(iframeRef.current, "addEventListener", "timeupdate");
      vimeoPost(iframeRef.current, "addEventListener", "finish");
    }, 500);
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────
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
      const next = {
        ...prev,
        [n.id]: { passed: false, attempts: (prev[n.id]?.attempts ?? 0) + 1, bestScore: prev[n.id]?.bestScore ?? 0 },
      };
      progressRef.current = next;
      return next;
    });
    setActiveNotion(null);
    pausedForQuizRef.current = false;
    pendingNotionRef.current = null;
    // Seek back to notion start so the student re-watches it
    vimeoPost(iframeRef.current, "setCurrentTime", n.startTime);
    setTimeout(() => vimeoPost(iframeRef.current, "play"), 300);
  }, []);

  // ─── Derived display state ─────────────────────────────────────────────────
  const sortedNotions = sortedNotionsRef.current.length
    ? sortedNotionsRef.current
    : [...notions].sort((a, b) => a.startTime - b.startTime);

  const embedUrl = buildEmbedUrl(vimeoEmbedUrl);

  return (
    <div className="space-y-3">
      {/* Video */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-border shadow-sm">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-white/50" />
            <p className="text-white/50 text-xs">Loading video player…</p>
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
            <Video className="h-3.5 w-3.5" /> Video Notions
          </p>

          <div className="flex flex-wrap gap-2">
            {sortedNotions.map((notion, i) => {
              const isFirst = i === 0;
              const prevPassed = i > 0 ? !!progress[sortedNotions[i - 1].id]?.passed : true;
              const unlocked = isFirst || prevPassed;
              const passed = !!progress[notion.id]?.passed;
              const bestScore = progress[notion.id]?.bestScore;

              return (
                <div
                  key={notion.id}
                  className={[
                    "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all",
                    passed
                      ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400"
                      : unlocked
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-muted/50 text-muted-foreground opacity-60",
                  ].join(" ")}
                >
                  {passed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                  ) : unlocked ? (
                    <Play className="h-3 w-3 shrink-0" />
                  ) : (
                    <Lock className="h-3 w-3 shrink-0" />
                  )}
                  <span>{notion.label}</span>
                  <span className="opacity-60">
                    {fmt(notion.startTime)}
                    {notion.endTime > 0 ? `–${fmt(notion.endTime)}` : "+"}
                  </span>
                  {passed && bestScore !== undefined && (
                    <span className="bg-green-500/20 rounded-full px-1.5 text-[10px] font-bold">
                      {bestScore}%
                    </span>
                  )}
                  {!unlocked && (
                    <span className="bg-muted rounded-full px-1.5 text-[10px]">locked</span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Complete each notion's quiz (min {sortedNotions[0]?.passingScore ?? 80}%) to unlock the next segment.
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
