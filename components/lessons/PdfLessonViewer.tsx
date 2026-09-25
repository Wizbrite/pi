"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ILessonPart } from "@/modules/course/models/lesson.model";
import {
  FileText,
  Lock,
  Unlock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
  Sparkles,
  HelpCircle,
  Loader2,
  RotateCcw,
  BookCheck,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { PdfQuizQuestion } from "@/app/api/ai/pdf-quiz/route";

// ─── Polyfills required by pdfjs-dist v5+ ─────────────────────────────────────
// URL.parse — available Chrome 126+ / Node 22+
if (typeof URL !== 'undefined' && typeof (URL as any).parse !== 'function') {
  (URL as any).parse = (url: string, base?: string | URL) => {
    try { return new URL(url, base); } catch { return null; }
  };
}

// Promise.try — available Chrome 131+ / Node 22+
if (typeof Promise !== 'undefined' && typeof (Promise as any).try !== 'function') {
  (Promise as any).try = function <T>(fn: () => T | PromiseLike<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      try { resolve(fn()); } catch (e) { reject(e); }
    });
  };
}

// Configure PDF.js worker — MUST point to react-pdf's own bundled pdfjs-dist
// to avoid "API version does not match Worker version" mismatch errors.
// react-pdf@9 nests pdfjs-dist@4.8.69; we resolve its worker directly.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PdfLessonViewerProps {
  lessonId: string;
  courseId: string;
  lessonTitle: string;
  pdfUrl: string; // Master PDF for the whole lesson
  parts: ILessonPart[];
  onAllPartsCompleted?: () => void;
  /** Called whenever the student switches to a different PDF part — used to update AI context */
  onPartChange?: (part: ILessonPart) => void;
}

export function PdfLessonViewer({
  lessonId,
  courseId,
  lessonTitle,
  pdfUrl,
  parts,
  onAllPartsCompleted,
  onPartChange,
}: PdfLessonViewerProps) {
  // ─── Sorted parts ──────────────────────────────────────────────────────────
  const sortedParts = [...parts].sort((a, b) => a.partNumber - b.partNumber);

  // ─── Progress state ────────────────────────────────────────────────────────
  const [passedParts, setPassedParts] = useState<number[]>([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // ─── PDF viewer state ──────────────────────────────────────────────────────
  const [activePart, setActivePart] = useState<ILessonPart>(sortedParts[0]);
  const [currentPage, setCurrentPage] = useState<number>(
    sortedParts[0]?.startPage ?? 1
  );
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(0);
  const [pdfLoading, setPdfLoading] = useState<boolean>(true);
  const [pdfError, setPdfError] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(700);

  // ─── Lock overlay state ────────────────────────────────────────────────────
  const [showLockOverlay, setShowLockOverlay] = useState(false);
  const [lockedPartNumber, setLockedPartNumber] = useState<number>(0);

  // ─── Quiz Modal State ──────────────────────────────────────────────────────
  const [activePartQuiz, setActivePartQuiz] = useState<ILessonPart | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<PdfQuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    hasPassed: boolean;
  } | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // ─── Track container width for responsive PDF ─────────────────────────────
  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(Math.floor(entry.contentRect.width) - 2);
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // ─── Notify parent of initial part on mount ────────────────────────────────
  useEffect(() => {
    if (sortedParts[0] && onPartChange) {
      onPartChange(sortedParts[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Load student progress ─────────────────────────────────────────────────
  useEffect(() => {
    async function fetchProgress() {
      try {
        setIsLoadingProgress(true);
        const res = await fetch(`/api/student/pdf-progress?lessonId=${lessonId}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const passed = json.data
            .filter((p: any) => p.passed)
            .map((p: any) => p.partNumber);
          setPassedParts(passed);
          if (passed.length === sortedParts.length && onAllPartsCompleted) {
            onAllPartsCompleted();
          }
        }
      } catch (err) {
        console.error("Failed to load PDF progress:", err);
      } finally {
        setIsLoadingProgress(false);
      }
    }
    fetchProgress();
  }, [lessonId]);

  // ─── Part unlock logic ─────────────────────────────────────────────────────
  const isPartUnlocked = (partNum: number) => {
    if (partNum <= 1) return true;
    return passedParts.includes(partNum - 1);
  };

  // The currently active part's allowed page window
  const partStartPage = activePart?.startPage ?? 1;
  const partEndPage = activePart?.endPage ?? pdfTotalPages;

  // The resolved PDF URL: per-part override OR master PDF
  const resolvedPdfUrl = activePart?.pdfUrl || pdfUrl;

  // ─── Navigate to a page within allowed range ───────────────────────────────
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < partStartPage) return; // Can't go before this part's start

      // Trying to go PAST this part's end page
      if (newPage > partEndPage) {
        const nextPart = sortedParts.find(
          (p) => p.partNumber === activePart.partNumber + 1
        );
        if (!nextPart) {
          // No next part exists – already at the end
          toast.info("You're at the last page of this lesson.");
          return;
        }
        if (!isPartUnlocked(nextPart.partNumber)) {
          // Show lock overlay
          setLockedPartNumber(nextPart.partNumber);
          setShowLockOverlay(true);
          return;
        }
        // Next part IS unlocked – switch to it
        setActivePart(nextPart);
        setCurrentPage(nextPart.startPage ?? newPage);
        setPdfLoading(true);
        return;
      }

      setCurrentPage(newPage);
    },
    [activePart, partStartPage, partEndPage, sortedParts, passedParts]
  );

  // ─── Switch to a specific part tab ────────────────────────────────────────
  const handleSwitchPart = (part: ILessonPart) => {
    if (!isPartUnlocked(part.partNumber)) {
      setLockedPartNumber(part.partNumber);
      setShowLockOverlay(true);
      return;
    }
    setActivePart(part);
    setCurrentPage(part.startPage ?? 1);
    setPdfLoading(true);
    setShowLockOverlay(false);
    // Notify parent so the AI tutor updates its context
    if (onPartChange) onPartChange(part);
  };

  // ─── Quiz generation ───────────────────────────────────────────────────────
  const handleStartPartQuiz = async (part: ILessonPart) => {
    try {
      setActivePartQuiz(part);
      setIsGeneratingQuiz(true);
      setQuizQuestions([]);
      setSelectedAnswers({});
      setQuizSubmitted(false);
      setQuizResult(null);
      setShowLockOverlay(false);

      const previousParts = sortedParts
        .filter((p) => p.partNumber < part.partNumber)
        .map((p) => ({
          partNumber: p.partNumber,
          title: p.title,
          startPage: p.startPage || 1,
          endPage: p.endPage || 1,
          partContext: p.partContext || p.content,
        }));

      const res = await fetch("/api/ai/pdf-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle,
          currentPart: {
            partNumber: part.partNumber,
            title: part.title,
            startPage: part.startPage || 1,
            endPage: part.endPage || 1,
            partContext: part.partContext || part.content,
          },
          previousParts,
          questionCount: 10,
          passingScore: part.passingScore || 80,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.questions) {
        setQuizQuestions(json.data.questions);
      } else {
        toast.error(json.message || "Failed to generate AI quiz.");
        setActivePartQuiz(null);
      }
    } catch (err) {
      console.error("Failed to start PDF quiz:", err);
      toast.error("An error occurred while generating quiz questions.");
      setActivePartQuiz(null);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectOption = (qIdx: number, option: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (!activePartQuiz) return;
    if (Object.keys(selectedAnswers).length < quizQuestions.length) {
      toast.warning("Please answer all questions before submitting.");
      return;
    }

    try {
      setIsSubmittingQuiz(true);
      let correctCount = 0;
      quizQuestions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswer) correctCount++;
      });

      const total = quizQuestions.length;
      const percentage = Math.round((correctCount / total) * 100);
      const passingScore = activePartQuiz.passingScore || 80;
      const hasPassed = percentage >= passingScore;

      setQuizResult({ score: correctCount, total, percentage, hasPassed });
      setQuizSubmitted(true);

      const res = await fetch("/api/student/pdf-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          courseId,
          partNumber: activePartQuiz.partNumber,
          score: correctCount,
          totalQuestions: total,
          passingScore,
        }),
      });

      const json = await res.json();
      if (json.success && hasPassed) {
        const updated = Array.from(
          new Set([...passedParts, activePartQuiz.partNumber])
        );
        setPassedParts(updated);
        if (updated.length === sortedParts.length && onAllPartsCompleted) {
          onAllPartsCompleted();
        }
        toast.success(
          `🎉 Passed! Part ${activePartQuiz.partNumber + 1} is now unlocked.`
        );
      } else if (!hasPassed) {
        toast.error(
          `You scored ${percentage}%. You need ${passingScore}% to unlock the next part.`
        );
      }
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      toast.error("Failed to record quiz results.");
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const allPartsPassed = sortedParts.every((p) =>
    passedParts.includes(p.partNumber)
  );

  const pageWithinPart = currentPage - partStartPage + 1;
  const pagesInPart = partEndPage - partStartPage + 1;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── Parts Navigation Tabs ─────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-primary tracking-wider uppercase flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> PDF Document Lesson
            </span>
            <h2 className="text-lg font-bold text-foreground">{lessonTitle}</h2>
          </div>
          {allPartsPassed && (
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4" /> All Checkpoints Completed
            </span>
          )}
        </div>

        {/* Part Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
          {sortedParts.map((part) => {
            const unlocked = isPartUnlocked(part.partNumber);
            const passed = passedParts.includes(part.partNumber);
            const isActive = activePart?.partNumber === part.partNumber;

            return (
              <div
                key={part.partNumber}
                onClick={() => handleSwitchPart(part)}
                className={`p-2.5 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between ${
                  passed
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    : isActive
                    ? "bg-primary/10 border-primary text-primary font-bold shadow-sm"
                    : unlocked
                    ? "bg-background border-border text-foreground hover:bg-accent"
                    : "bg-muted/40 border-border/60 text-muted-foreground opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="space-y-0.5 truncate pr-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>Part {part.partNumber}:</span>
                    <span className="truncate">{part.title}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Pages {part.startPage ?? 1} – {part.endPage ?? "?"}
                  </div>
                </div>
                {passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : unlocked ? (
                  <Unlock className="w-3.5 h-3.5 text-primary shrink-0" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Page Navigation Bar ────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-muted-foreground">Viewing:</span>
          <span className="font-bold text-foreground bg-accent px-2.5 py-1 rounded-md">
            Part {activePart?.partNumber}: {activePart?.title}
          </span>
          <span className="text-muted-foreground">
            (Pages {partStartPage}–{partEndPage})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= partStartPage}
            onClick={() => handlePageChange(currentPage - 1)}
            className="h-8 px-2.5 text-xs gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </Button>

          <span className="text-xs font-mono font-semibold px-1">
            Page{" "}
            <input
              type="number"
              min={partStartPage}
              max={partEndPage}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) handlePageChange(val);
              }}
              className="w-12 text-center py-0.5 border border-input rounded bg-background text-foreground font-mono inline-block"
            />{" "}
            / {partEndPage}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            className="h-8 px-2.5 text-xs gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <span className="text-[10px] text-muted-foreground font-medium">
          Page {pageWithinPart} of {pagesInPart} in this part
        </span>
      </div>

      {/* ── PDF Viewer ─────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative border border-border rounded-xl overflow-hidden bg-neutral-900 shadow-sm"
        style={{ minHeight: 600 }}
      >
        {resolvedPdfUrl ? (
          <>
            {pdfLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/80 z-10">
                <div className="flex flex-col items-center gap-3 text-white">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm font-semibold">Loading PDF…</span>
                </div>
              </div>
            )}
            {pdfError && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-10">
                <div className="text-center text-white space-y-2">
                  <AlertTriangle className="w-10 h-10 mx-auto text-yellow-400" />
                  <p className="font-semibold">Failed to load PDF.</p>
                  <p className="text-xs text-neutral-400">Check that the PDF URL is correct and accessible.</p>
                </div>
              </div>
            )}

            <Document
              file={resolvedPdfUrl}
              onLoadSuccess={({ numPages }) => {
                setPdfTotalPages(numPages);
                setPdfLoading(false);
                setPdfError(false);
              }}
              onLoadError={() => {
                setPdfLoading(false);
                setPdfError(true);
              }}
              loading=""
              className="flex justify-center py-4"
            >
              <Page
                pageNumber={currentPage}
                width={Math.min(containerWidth - 32, 900)}
                loading=""
                renderAnnotationLayer={false}
                renderTextLayer={true}
                className="shadow-2xl"
              />
            </Document>
          </>
        ) : (
          <div className="p-16 text-center text-white space-y-3">
            <FileText className="w-12 h-12 mx-auto text-neutral-500" />
            <p className="font-semibold">No PDF attached to this lesson yet.</p>
          </div>
        )}

        {/* ── Lock Overlay (shown when student hits the page gate) ────────── */}
        {showLockOverlay && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">
                  Part {lockedPartNumber} is Locked
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You must complete the <strong>Part {lockedPartNumber - 1} checkpoint quiz</strong>{" "}
                  and score at least{" "}
                  <strong>
                    {sortedParts.find((p) => p.partNumber === lockedPartNumber - 1)?.passingScore ?? 80}%
                  </strong>{" "}
                  before you can read these pages.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="w-full gap-2"
                  onClick={() => {
                    const partToQuiz = sortedParts.find(
                      (p) => p.partNumber === lockedPartNumber - 1
                    );
                    if (partToQuiz) handleStartPartQuiz(partToQuiz);
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Take Part {lockedPartNumber - 1} Checkpoint Quiz
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowLockOverlay(false)}
                >
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Part Checkpoint Footer Card ────────────────────────────────────── */}
      {activePart && (
        <Card
          className={`p-4 border transition-all ${
            passedParts.includes(activePart.partNumber)
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-primary/5 border-primary/20"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                {passedParts.includes(activePart.partNumber) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Part {activePart.partNumber} Checkpoint Passed!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-primary" />
                    Part {activePart.partNumber} Checkpoint Quiz
                  </>
                )}
              </h4>
              <p className="text-xs text-muted-foreground">
                {passedParts.includes(activePart.partNumber)
                  ? "You passed this checkpoint. The next part is unlocked!"
                  : `Answer the AI-generated checkpoint quiz to unlock Part ${
                      activePart.partNumber + 1
                    } (pages ${(activePart.endPage ?? 0) + 1}+).`}
              </p>
            </div>
            <Button
              type="button"
              onClick={() => handleStartPartQuiz(activePart)}
              className="px-4 py-2 text-xs font-bold gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              {passedParts.includes(activePart.partNumber)
                ? "Retake Quiz"
                : "Take Checkpoint Quiz"}
            </Button>
          </div>
        </Card>
      )}

      {/* ── AI Quiz Modal ─────────────────────────────────────────────────── */}
      {activePartQuiz && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-xl p-5 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-bold text-primary tracking-wider uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Cumulative Checkpoint Quiz
                </span>
                <h3 className="text-base font-bold text-foreground">
                  Part {activePartQuiz.partNumber}: {activePartQuiz.title} — Pages{" "}
                  {activePartQuiz.startPage}–{activePartQuiz.endPage}
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground"
                onClick={() => setActivePartQuiz(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Loading */}
            {isGeneratingQuiz ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-sm font-semibold text-foreground">
                  Pi AI is generating checkpoint questions…
                </p>
                <p className="text-xs text-muted-foreground">
                  Analysing pages {activePartQuiz.startPage}–{activePartQuiz.endPage}
                  {activePartQuiz.partNumber > 1 && " + cumulative review"}
                </p>
              </div>
            ) : quizQuestions.length > 0 ? (
              <div className="space-y-6">
                {/* Result Banner */}
                {quizResult && (
                  <div
                    className={`p-4 rounded-xl border text-sm font-semibold space-y-1 ${
                      quizResult.hasPassed
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                        : "bg-destructive/10 border-destructive/30 text-destructive"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-base">
                      <span>
                        {quizResult.hasPassed ? "🎉 Checkpoint Passed!" : "❌ Not Passed"}
                      </span>
                      <span>
                        {quizResult.score}/{quizResult.total} ({quizResult.percentage}%)
                      </span>
                    </div>
                    <p className="text-xs">
                      {quizResult.hasPassed
                        ? `You met the ${activePartQuiz.passingScore ?? 80}% passing score. Part ${
                            activePartQuiz.partNumber + 1
                          } is now unlocked!`
                        : `You scored ${quizResult.percentage}%. You need ${
                            activePartQuiz.passingScore ?? 80
                          }% to continue. Review pages ${activePartQuiz.startPage}–${
                            activePartQuiz.endPage
                          } and try again.`}
                    </p>
                  </div>
                )}

                {/* Questions */}
                <div className="space-y-5">
                  {quizQuestions.map((q, idx) => {
                    const selected = selectedAnswers[idx];
                    return (
                      <div
                        key={idx}
                        className="p-4 bg-accent/40 border border-border rounded-lg space-y-3 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-foreground text-sm leading-snug">
                            Q{idx + 1}. {q.questionText}
                          </h4>
                          {q.isReviewQuestion && (
                            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded text-[10px] font-bold shrink-0 flex items-center gap-1">
                              <RotateCcw className="w-3 h-3" /> Part {q.partNumber} Review
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {q.options.map((opt, oIdx) => {
                            let optStyle =
                              "bg-background border-border text-foreground hover:bg-accent";
                            if (quizSubmitted) {
                              if (opt === q.correctAnswer)
                                optStyle =
                                  "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold";
                              else if (selected === opt)
                                optStyle =
                                  "bg-destructive/20 border-destructive text-destructive font-bold";
                            } else if (selected === opt) {
                              optStyle =
                                "bg-primary/20 border-primary text-primary font-bold";
                            }
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={quizSubmitted}
                                onClick={() => handleSelectOption(idx, opt)}
                                className={`p-2.5 rounded-md border text-left transition-all text-xs ${optStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && q.explanation && (
                          <div className="p-2.5 bg-background border border-border rounded text-[11px] text-muted-foreground space-y-0.5">
                            <span className="font-bold text-foreground flex items-center gap-1">
                              <HelpCircle className="w-3 h-3 text-primary" /> Explanation:
                            </span>
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActivePartQuiz(null)}
                  >
                    Close
                  </Button>
                  {!quizSubmitted ? (
                    <Button
                      type="button"
                      disabled={
                        isSubmittingQuiz ||
                        Object.keys(selectedAnswers).length < quizQuestions.length
                      }
                      onClick={handleSubmitQuiz}
                      className="gap-2"
                    >
                      {isSubmittingQuiz ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                        </>
                      ) : (
                        <>
                          <BookCheck className="w-4 h-4" /> Submit Checkpoint Quiz
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => handleStartPartQuiz(activePartQuiz)}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" /> Retake Quiz
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      )}
      {/* ── Sticky Floating Page Navigation Pill ──────────────────────────── */}
      {resolvedPdfUrl && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-full px-4 py-2">
          {/* Prev button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={currentPage <= partStartPage}
            onClick={() => handlePageChange(currentPage - 1)}
            className="h-8 w-8 p-0 rounded-full"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Page indicator + input */}
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-foreground min-w-[90px] justify-center">
            <span className="text-muted-foreground text-[10px]">p.</span>
            <input
              type="number"
              min={partStartPage}
              max={partEndPage}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) handlePageChange(val);
              }}
              className="w-10 text-center py-0.5 border border-input rounded-md bg-background text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <span className="text-muted-foreground text-[10px]">/ {partEndPage}</span>
          </div>

          {/* Next button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            className="h-8 w-8 p-0 rounded-full"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Divider + part label */}
          <div className="w-px h-5 bg-border mx-1" />
          <span className="text-[10px] text-muted-foreground font-semibold max-w-[100px] truncate">
            Part {activePart?.partNumber}: {activePart?.title}
          </span>
        </div>
      )}
    </div>
  );
}
