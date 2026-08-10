"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Zap,
  Clock,
  Target,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Share2,
  BookOpen,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuestionResult {
  questionId: number;
  questionNumber: number;
  text: string;
  topic: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  marksObtained: number;
  totalMarks: number;
  markingSchemeNotes: string;
  aiExplanation: string;
}

const MOCK_RESULTS_DATA = {
  subjectName: "Physics",
  paperCode: "PHY701-2023-P1",
  paperTitle: "2023 GCE Advanced Level Physics Paper 1",
  score: 4,
  totalMarks: 5,
  percentage: 80,
  grade: "Grade A",
  timeSpent: "42 mins 15 secs",
  totalTime: "90 mins",
  xpEarned: 180,
  streakBonus: 20,
  topicPerformance: [
    { topic: "Units & Dimensions", score: 1, total: 1, percentage: 100 },
    { topic: "Kinematics", score: 1, total: 1, percentage: 100 },
    { topic: "Elasticity", score: 0, total: 1, percentage: 0 },
    { topic: "Work & Energy", score: 1, total: 1, percentage: 100 },
    { topic: "Electromagnetism", score: 1, total: 1, percentage: 100 },
  ],
  questions: [
    {
      questionId: 1,
      questionNumber: 1,
      text: "Which of the following physical quantities is a fundamental (base) SI unit?",
      topic: "Units & Dimensions",
      userAnswer: "Ampere (A)",
      correctAnswer: "Ampere (A)",
      isCorrect: true,
      marksObtained: 1,
      totalMarks: 1,
      markingSchemeNotes: "SI base units include Metre (m), Kilogram (kg), Second (s), Ampere (A), Kelvin (K), Mole (mol), and Candela (cd).",
      aiExplanation: "Great job! Ampere is the base unit for electric current in the International System of Units (SI).",
    },
    {
      questionId: 2,
      questionNumber: 2,
      text: "A projectile is launched with an initial velocity u at an angle θ to the horizontal. What is its horizontal velocity component at maximum height?",
      topic: "Kinematics",
      userAnswer: "u cos θ",
      correctAnswer: "u cos θ",
      isCorrect: true,
      marksObtained: 1,
      totalMarks: 1,
      markingSchemeNotes: "In projectile motion without air resistance, horizontal velocity remains constant throughout flight: u_x = u cos θ.",
      aiExplanation: "Correct! Vertical velocity decreases to zero at maximum height, but horizontal velocity remains unchanged as u cos θ.",
    },
    {
      questionId: 3,
      questionNumber: 3,
      text: "According to Hooke's Law, the extension of a spring is directly proportional to the applied force provided that:",
      topic: "Elasticity",
      userAnswer: "The elastic limit is exceeded",
      correctAnswer: "The limit of proportionality is not exceeded",
      isCorrect: false,
      marksObtained: 0,
      totalMarks: 1,
      markingSchemeNotes: "GCE Syllabus Rule: Hooke's Law holds strictly up to the limit of proportionality, beyond which F is no longer linear with extension x.",
      aiExplanation: "You selected 'elastic limit is exceeded', which is incorrect. Hooke's Law states F = kx, which only applies up to the limit of proportionality. Beyond this point, the force-extension graph ceases to be a straight line.",
    },
    {
      questionId: 4,
      questionNumber: 4,
      text: "Calculate the kinetic energy of a body of mass 4 kg moving at a constant speed of 5 m/s.",
      topic: "Work & Energy",
      userAnswer: "50 J",
      correctAnswer: "50 J",
      isCorrect: true,
      marksObtained: 1,
      totalMarks: 1,
      markingSchemeNotes: "KE = 1/2 * m * v^2 = 0.5 * 4 * (5)^2 = 0.5 * 4 * 25 = 50 Joules.",
      aiExplanation: "Spot on! Using KE = ½mv², 0.5 × 4 kg × (5 m/s)² = 50 J.",
    },
    {
      questionId: 5,
      questionNumber: 5,
      text: "In a transformer, electrical power is transferred from primary to secondary coil through:",
      topic: "Electromagnetism",
      userAnswer: "Mutual electromagnetic induction",
      correctAnswer: "Mutual electromagnetic induction",
      isCorrect: true,
      marksObtained: 1,
      totalMarks: 1,
      markingSchemeNotes: "Alternating current in the primary coil creates a varying magnetic flux, inducing an emf in the secondary coil via mutual induction.",
      aiExplanation: "Correct! The coils are electrically isolated but magnetically linked through the soft iron core via mutual electromagnetic induction.",
    },
  ] as QuestionResult[],
};

export default function ExamResultsPage({
  params,
}: {
  params: Promise<{ "subject-id": string; "attempt-id": string }> | { "subject-id": string; "attempt-id": string };
}) {
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const subjectId = resolvedParams?.["subject-id"];
  const attemptId = resolvedParams?.["attempt-id"];

  const [filter, setFilter] = useState<"all" | "incorrect" | "correct">("all");
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(3);

  const filteredQuestions = MOCK_RESULTS_DATA.questions.filter((q) => {
    if (filter === "correct") return q.isCorrect;
    if (filter === "incorrect") return !q.isCorrect;
    return true;
  });

  return (
    <div className="min-h-screen bg-background space-y-6 pb-12">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href={`/student/exams/${subjectId}`}
            className="p-2.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-muted-foreground uppercase">{subjectId}</span>
              <Badge variant="outline" className="text-[10px] py-0">GCE Results</Badge>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground">{MOCK_RESULTS_DATA.paperTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 h-9">
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
          <Link href={`/student/exams/${subjectId}/room/${attemptId}`}>
            <Button size="sm" className="text-xs font-bold gap-1.5 h-9 bg-primary text-primary-foreground">
              <RotateCcw className="w-3.5 h-3.5" /> Retake Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* XP CELEBRATION BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-5 sm:p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
              <Trophy className="w-8 h-8 text-amber-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-400 text-slate-900 border-none font-extrabold text-[10px]">
                  EXAM COMPLETED
                </Badge>
                <span className="text-xs font-semibold text-purple-100">+20 Day Streak Bonus!</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">Excellent Effort!</h2>
              <p className="text-xs sm:text-sm text-purple-100">You scored higher than 84% of students on this paper.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-xl self-start sm:self-auto">
            <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
            <div>
              <span className="text-xl font-black leading-none block">+{MOCK_RESULTS_DATA.xpEarned + MOCK_RESULTS_DATA.streakBonus} XP</span>
              <span className="text-[10px] text-purple-200 uppercase font-bold tracking-wider">Earned</span>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS & SCORE BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Score</span>
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-foreground">{MOCK_RESULTS_DATA.score}</span>
              <span className="text-sm font-bold text-muted-foreground">/ {MOCK_RESULTS_DATA.totalMarks}</span>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              {MOCK_RESULTS_DATA.percentage}% Accuracy
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${MOCK_RESULTS_DATA.percentage}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">GCE Equivalent</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400">{MOCK_RESULTS_DATA.grade}</span>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              Passed official grade threshold
            </p>
          </div>
          <div className="text-[11px] font-bold text-muted-foreground bg-muted/60 p-1.5 rounded-lg text-center">
            Grade Boundary: A ≥ 75%
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Time Spent</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="my-3">
            <span className="text-2xl font-black text-foreground">{MOCK_RESULTS_DATA.timeSpent}</span>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              Allocated: {MOCK_RESULTS_DATA.totalTime}
            </p>
          </div>
          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 p-1.5 rounded-lg text-center">
            Pacing: 8.4 mins/question
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Attempt Summary</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-3 space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">Correct:</span>
              <span>4</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-red-500">Incorrect:</span>
              <span>1</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Unanswered:</span>
              <span>0</span>
            </div>
          </div>
          <div className="text-[11px] font-bold text-muted-foreground bg-muted/60 p-1.5 rounded-lg text-center">
            5 total questions reviewed
          </div>
        </div>
      </div>

      {/* TOPIC MASTERY BREAKDOWN */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Topic Mastery Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOCK_RESULTS_DATA.topicPerformance.map((topic, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground truncate">{topic.topic}</span>
                <span className={topic.percentage >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
                  {topic.percentage}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${topic.percentage >= 70 ? "bg-emerald-500" : "bg-red-500"}`}
                  style={{ width: `${topic.percentage}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium block">
                {topic.score} of {topic.total} marks earned
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* QUESTION BY QUESTION REVIEW SECTION */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Detailed Question Review</h3>
            <p className="text-xs text-muted-foreground">Review your answers against official GCE marking schemes & AI explanations.</p>
          </div>

          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All (5)
            </button>
            <button
              onClick={() => setFilter("incorrect")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === "incorrect" ? "bg-card text-red-500 shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Missed (1)
            </button>
            <button
              onClick={() => setFilter("correct")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === "correct" ? "bg-card text-emerald-600 shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Correct (4)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const isExpanded = expandedQuestionId === q.questionId;

            return (
              <div
                key={q.questionId}
                className={`border rounded-2xl transition overflow-hidden ${
                  q.isCorrect ? "border-border" : "border-red-500/30 bg-red-500/[0.02]"
                }`}
              >
                <button
                  onClick={() => setExpandedQuestionId(isExpanded ? null : q.questionId)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-muted/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {q.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-foreground">Question {q.questionNumber}</span>
                        <Badge variant="outline" className="text-[10px] py-0">{q.topic}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{q.text}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold ${q.isCorrect ? "text-emerald-600" : "text-red-500"}`}>
                      {q.marksObtained}/{q.totalMarks} Mark
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-border/60 space-y-4 mt-2">
                    <div className="pt-2">
                      <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed">{q.text}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className={`p-3 rounded-xl border ${q.isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Your Answer:</span>
                        <span className={`font-bold ${q.isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-400"}`}>
                          {q.userAnswer}
                        </span>
                      </div>

                      {!q.isCorrect && (
                        <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Official Correct Answer:</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">
                            {q.correctAnswer}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 bg-muted/60 border border-border rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        <span>Official GCE Marking Scheme Notes</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {q.markingSchemeNotes}
                      </p>
                    </div>

                    <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                        <Bot className="w-3.5 h-3.5" />
                        <span>AI Tutor Remediation</span>
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed">
                        {q.aiExplanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}