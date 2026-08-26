"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Clock,
  Award,
  Play,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Interface Definitions
interface ExamPaper {
  id: string;
  slug: string;
  year: number;
  paperNumber: number;
  title: string;
  type: "MCQ" | "Structured";
  durationMinutes: number;
  totalMarks: number;
  questionCount: number;
  lastAttempt?: {
    score: number;
    maxScore: number;
    grade: string;
    completedAt: string;
  };
}

interface SubjectDetail {
  id: string;
  slug: string;
  title: string;
  code: string;
  level: "O-Level" | "A-Level";
  category: "Science" | "Arts";
  description: string;
  papers: ExamPaper[];
}

export default function SubjectExamPapersPage({
  params,
}: {
  params: Promise<{ "subject-id": string }> | { "subject-id": string };
}) {
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const subjectId = resolvedParams?.["subject-id"];

  const [subject, setSubject] = useState<SubjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");

  // Fetch subject details + papers from API
  useEffect(() => {
    if (!subjectId) return;
    async function fetchSubject() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/exams/${subjectId}`);
        if (res.ok) {
          const json = await res.json();
          setSubject(json.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch exam subject:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSubject();
  }, [subjectId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading exam papers…</p>
      </div>
    );
  }

  // Error / not found state
  if (error || !subject) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pt-12 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Subject Not Found</h1>
        <p className="text-xs text-muted-foreground">
          The subject with ID <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{subjectId}</code> could not be found.
        </p>
        <Link href="/student/exams">
          <Button size="sm" className="text-xs mt-2">
            Return to Mock Exams
          </Button>
        </Link>
      </div>
    );
  }

  // Get unique years for filter
  const availableYears = [...new Set(subject.papers.map((p) => p.year.toString()))].sort().reverse();

  // Filter Papers Logic
  const filteredPapers = subject.papers.filter((paper) => {
    const matchesYear = selectedYear === "All" || paper.year.toString() === selectedYear;
    const matchesType = selectedType === "All" || paper.type === selectedType;
    return matchesYear && matchesType;
  });

  const attemptedCount = subject.papers.filter((p) => p.lastAttempt).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* Navigation & Header */}
      <div>
        <Link
          href="/student/exams"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Mock Exams
        </Link>
        
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className={subject.level === "A-Level" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" : "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"}>
                {subject.level}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {subject.category}
              </Badge>
              <span className="text-xs font-mono font-bold text-muted-foreground">{subject.code}</span>
            </div>
            <h1 className="text-2xl font-black text-foreground">{subject.title} Past Exam Papers</h1>
            <p className="text-xs text-muted-foreground max-w-xl">{subject.description}</p>
          </div>

          <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl border border-border shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Available Papers</span>
              <span className="text-base font-black text-foreground">{subject.papers.length}</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="text-center px-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Attempted</span>
              <span className="text-base font-black text-primary">{attemptedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Year:</span>
          <div className="flex gap-1">
            {["All", ...availableYears].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedYear === yr
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Type:</span>
          <div className="flex gap-1">
            {["All", "MCQ", "Structured"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedType === type
                    ? "bg-foreground text-background"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DYNAMIC EXAM PAPERS LIST FOR THIS SUBJECT */}
      <div className="space-y-3">
        {filteredPapers.length > 0 ? (
          filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:border-primary/40 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs font-bold bg-muted/40">
                    {paper.year} GCE
                  </Badge>
                  <Badge
                    className={
                      paper.type === "MCQ"
                        ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    }
                  >
                    {paper.type}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-foreground">{paper.title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" /> {paper.durationMinutes} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> {paper.questionCount} Questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> {paper.totalMarks} Marks
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-border">
                {paper.lastAttempt && (
                  <div className="text-left sm:text-right text-xs pr-2">
                    <span className="text-muted-foreground block">Best Score</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {paper.lastAttempt.score}/{paper.lastAttempt.maxScore} (Grade {paper.lastAttempt.grade})
                    </span>
                  </div>
                )}

                <Link href={`/student/exams/${subjectId}/room/${paper.slug}`} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 px-5 gap-2 shadow-xs">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {paper.lastAttempt ? "Retake Exam" : "Start Exam"}
                  </Button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-xs text-muted-foreground">
            No papers match your year or paper type filter for this subject.
          </div>
        )}
      </div>

    </div>
  );
}