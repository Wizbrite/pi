"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Flame,
  Zap,
  Clock,
  BookOpen,
  FileText,
  Target,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Calendar,
  Award,
  Brain,
} from "lucide-react";
import type { ProgressData } from "@/lib/types/progress";

// ─── MOCK DATA (Replace with API call) ───────────────────────────────────────

const MOCK_DATA: ProgressData = {
  overall: {
    totalXp: 850,
    currentStreak: 5,
    longestStreak: 12,
    totalTimeSpentMinutes: 342,
    totalLessonsCompleted: 8,
    totalExamsTaken: 3,
    overallAccuracy: 72,
    subjectsEnrolled: 2,
  },
  weeklyActivity: [
    { date: "2025-08-25", lessonsCompleted: 2, examsTaken: 0, timeSpentMinutes: 45, xpEarned: 100 },
    { date: "2025-08-26", lessonsCompleted: 1, examsTaken: 0, timeSpentMinutes: 30, xpEarned: 50 },
    { date: "2025-08-27", lessonsCompleted: 3, examsTaken: 1, timeSpentMinutes: 90, xpEarned: 250 },
    { date: "2025-08-28", lessonsCompleted: 0, examsTaken: 0, timeSpentMinutes: 0, xpEarned: 0 },
    { date: "2025-08-29", lessonsCompleted: 1, examsTaken: 0, timeSpentMinutes: 25, xpEarned: 50 },
    { date: "2025-08-30", lessonsCompleted: 2, examsTaken: 1, timeSpentMinutes: 85, xpEarned: 200 },
    { date: "2025-08-31", lessonsCompleted: 1, examsTaken: 0, timeSpentMinutes: 35, xpEarned: 50 },
  ],
  subjects: [
    {
      courseId: "course_1",
      title: "Information and Communication Technology (Upper Sixth)",
      level: "A-Level",
      subject: "ICT",
      topics: [
        {
          topicId: "topic_1",
          title: "Concepts and Features of Networks",
          description: "Network types, topologies, and basic concepts",
          order: 1,
          lessons: [
            {
              lessonId: "lesson_1",
              title: "Introduction to Computer Networks",
              order: 1,
              completed: true,
              score: 1,
              totalQuestions: 2,
              accuracy: 50,
              timeSpentSeconds: 420,
              attempts: 1,
              xpEarned: 50,
              masteryLevel: 50,
              lastAttemptedAt: "2025-08-30T14:30:00Z",
            },
            {
              lessonId: "lesson_2",
              title: "Network Types and Classifications",
              order: 2,
              completed: true,
              score: 3,
              totalQuestions: 3,
              accuracy: 100,
              timeSpentSeconds: 380,
              attempts: 1,
              xpEarned: 60,
              masteryLevel: 100,
              lastAttemptedAt: "2025-08-30T15:10:00Z",
            },
            {
              lessonId: "lesson_3",
              title: "Network Topologies",
              order: 3,
              completed: false,
              attempts: 0,
              xpEarned: 0,
              masteryLevel: 0,
            },
            {
              lessonId: "lesson_4",
              title: "Network Hardware and Software",
              order: 4,
              completed: false,
              attempts: 0,
              xpEarned: 0,
              masteryLevel: 0,
            },
          ],
          completedCount: 2,
          totalLessons: 4,
          masteryLevel: 75,
          timeSpentMinutes: 13,
        },
        {
          topicId: "topic_2",
          title: "Data Communication & Transmission",
          description: "Data transmission methods, protocols, and standards",
          order: 2,
          lessons: [
            {
              lessonId: "lesson_5",
              title: "Data Transmission Methods",
              order: 1,
              completed: true,
              score: 2,
              totalQuestions: 2,
              accuracy: 100,
              timeSpentSeconds: 350,
              attempts: 1,
              xpEarned: 50,
              masteryLevel: 100,
              lastAttemptedAt: "2025-08-31T10:00:00Z",
            },
            {
              lessonId: "lesson_6",
              title: "Communication Protocols",
              order: 2,
              completed: false,
              attempts: 0,
              xpEarned: 0,
              masteryLevel: 0,
            },
          ],
          completedCount: 1,
          totalLessons: 2,
          masteryLevel: 50,
          timeSpentMinutes: 6,
        },
      ],
      completedLessons: 4,
      totalLessons: 6,
      overallMastery: 67,
      totalTimeSpentMinutes: 19,
      averageAccuracy: 75,
      lastActivityAt: "2025-08-31T10:00:00Z",
    },
    {
      courseId: "course_2",
      title: "Mathematics (Pure)",
      level: "A-Level",
      subject: "Mathematics",
      topics: [
        {
          topicId: "topic_3",
          title: "Algebra & Functions",
          description: "Polynomials, equations, and inequalities",
          order: 1,
          lessons: [
            {
              lessonId: "lesson_7",
              title: "Polynomial Functions",
              order: 1,
              completed: true,
              score: 2,
              totalQuestions: 3,
              accuracy: 67,
              timeSpentSeconds: 500,
              attempts: 1,
              xpEarned: 40,
              masteryLevel: 67,
              lastAttemptedAt: "2025-08-27T09:00:00Z",
            },
            {
              lessonId: "lesson_8",
              title: "Quadratic Equations",
              order: 2,
              completed: true,
              score: 3,
              totalQuestions: 3,
              accuracy: 100,
              timeSpentSeconds: 400,
              attempts: 1,
              xpEarned: 60,
              masteryLevel: 100,
              lastAttemptedAt: "2025-08-27T10:30:00Z",
            },
            {
              lessonId: "lesson_9",
              title: "Inequalities",
              order: 3,
              completed: true,
              score: 1,
              totalQuestions: 2,
              accuracy: 50,
              timeSpentSeconds: 450,
              attempts: 2,
              xpEarned: 30,
              masteryLevel: 50,
              lastAttemptedAt: "2025-08-28T11:00:00Z",
            },
          ],
          completedCount: 3,
          totalLessons: 3,
          masteryLevel: 72,
          timeSpentMinutes: 22,
        },
      ],
      completedLessons: 3,
      totalLessons: 3,
      overallMastery: 72,
      totalTimeSpentMinutes: 22,
      averageAccuracy: 72,
      lastActivityAt: "2025-08-28T11:00:00Z",
    },
  ],
  examHistory: [
    {
      attemptId: "attempt_1",
      paperTitle: "ICT 801 - Paper 1 (June 2023)",
      subjectId: "ict801",
      score: 18,
      totalMarks: 26,
      percentage: 69,
      timeSpentSeconds: 4800,
      completedAt: "2025-08-27T16:00:00Z",
      correctCount: 18,
      incorrectCount: 8,
    },
    {
      attemptId: "attempt_2",
      paperTitle: "Mathematics P1 - Pure (June 2023)",
      subjectId: "mathp1",
      score: 45,
      totalMarks: 60,
      percentage: 75,
      timeSpentSeconds: 5400,
      completedAt: "2025-08-29T14:00:00Z",
      correctCount: 45,
      incorrectCount: 15,
    },
    {
      attemptId: "attempt_3",
      paperTitle: "ICT 801 - Paper 2 (June 2023)",
      subjectId: "ict801",
      score: 12,
      totalMarks: 20,
      percentage: 60,
      timeSpentSeconds: 3600,
      completedAt: "2025-08-30T17:00:00Z",
      correctCount: 12,
      incorrectCount: 8,
    },
  ],
  weakAreas: [
    {
      topicId: "topic_1",
      topicTitle: "Concepts and Features of Networks",
      courseId: "course_1",
      courseTitle: "ICT",
      accuracy: 50,
      totalAttempts: 2,
      lessonCount: 4,
    },
    {
      topicId: "topic_3",
      topicTitle: "Algebra & Functions",
      courseId: "course_2",
      courseTitle: "Mathematics",
      accuracy: 72,
      totalAttempts: 6,
      lessonCount: 3,
    },
  ],
  questionTypeStats: [
    { type: "mcq", totalAttempted: 15, correctCount: 12, accuracy: 80 },
    { type: "open-ended", totalAttempted: 5, correctCount: 2, accuracy: 40 },
  ],
};

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-GB", { weekday: "short" });
}

function getMasteryColor(level: number): string {
  if (level >= 80) return "bg-green-500";
  if (level >= 50) return "bg-yellow-500";
  if (level > 0) return "bg-orange-500";
  return "bg-muted";
}

function getMasteryLabel(level: number): string {
  if (level >= 90) return "Mastered";
  if (level >= 70) return "Proficient";
  if (level >= 50) return "Learning";
  if (level > 0) return "Started";
  return "Not Started";
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return "text-green-600 dark:text-green-400";
  if (accuracy >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sublabel?: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card className="border-border shadow-xs">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <p className="mt-1 text-2xl font-black text-foreground truncate">{value}</p>
            {sublabel && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">{sublabel}</p>
            )}
          </div>
          <div className={`rounded-xl p-2.5 shrink-0 ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WeeklyActivityChart({ data }: { data: ProgressData["weeklyActivity"] }) {
  const maxLessons = Math.max(...data.map((d) => d.lessonsCompleted), 1);

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="border-b border-border bg-muted/30 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              This Week&apos;s Activity
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Lessons completed per day</p>
          </div>
          <Badge variant="outline" className="text-[10px]">
            <Calendar className="w-3 h-3 mr-1" />
            Last 7 days
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex items-end justify-between gap-2 h-32">
          {data.map((day, idx) => {
            const height = (day.lessonsCompleted / maxLessons) * 100;
            const isToday = idx === data.length - 1;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-foreground">
                  {day.lessonsCompleted > 0 ? day.lessonsCompleted : ""}
                </span>
                <div className="w-full bg-muted rounded-full h-24 flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-full transition-all duration-500 ${
                      isToday ? "bg-primary" : day.lessonsCompleted > 0 ? "bg-primary/60" : "bg-muted"
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    isToday ? "text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  {getDayName(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SubjectProgressCard({
  subject,
  isExpanded,
  onToggle,
}: {
  subject: ProgressData["subjects"][0];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="border-border shadow-xs overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left hover:bg-muted/30 transition"
      >
        <CardHeader className="px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="accent" className="text-[10px]">
                  {subject.level}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {subject.subject}
                </Badge>
              </div>
              <h3 className="text-sm font-bold text-foreground truncate">{subject.title}</h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                {subject.completedLessons}/{subject.totalLessons} lessons •{" "}
                {formatMinutes(subject.totalTimeSpentMinutes)} spent
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-xl font-black text-foreground">{subject.overallMastery}%</p>
                <p className="text-[10px] text-muted-foreground">{getMasteryLabel(subject.overallMastery)}</p>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getMasteryColor(subject.overallMastery)}`}
              style={{ width: `${subject.overallMastery}%` }}
            />
          </div>
        </CardHeader>
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          {subject.topics.map((topic) => (
            <div key={topic.topicId} className="border-b border-border/50 last:border-b-0">
              <div className="px-5 py-3 bg-muted/20">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground">{topic.title}</h4>
                    {topic.description && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {topic.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {topic.completedCount}/{topic.totalLessons}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        topic.masteryLevel >= 80
                          ? "border-green-500/30 text-green-600"
                          : topic.masteryLevel >= 50
                          ? "border-yellow-500/30 text-yellow-600"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {topic.masteryLevel}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getMasteryColor(topic.masteryLevel)}`}
                    style={{ width: `${topic.masteryLevel}%` }}
                  />
                </div>
              </div>

              {/* Lessons list */}
              <div className="divide-y divide-border/30">
                {topic.lessons.map((lesson) => (
                  <div
                    key={lesson.lessonId}
                    className="px-5 py-2.5 flex items-center justify-between gap-3 hover:bg-muted/20 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {lesson.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-medium truncate ${
                            lesson.completed ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {lesson.title}
                        </p>
                        {lesson.completed && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-semibold ${getAccuracyColor(lesson.accuracy || 0)}`}>
                              {lesson.accuracy}% accuracy
                            </span>
                            {lesson.timeSpentSeconds && (
                              <span className="text-[10px] text-muted-foreground">
                                {Math.round(lesson.timeSpentSeconds / 60)}m
                              </span>
                            )}
                            {lesson.attempts > 1 && (
                              <span className="text-[10px] text-orange-500 font-medium">
                                {lesson.attempts} attempts
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {lesson.completed && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Zap className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold text-primary">+{lesson.xpEarned}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ExamHistoryCard({ exam }: { exam: ProgressData["examHistory"][0] }) {
  return (
    <Link
      href={`/student/exams/${exam.subjectId}/results/${exam.attemptId}`}
      className="block"
    >
      <Card className="border-border shadow-xs hover:border-primary/50 hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-foreground truncate">{exam.paperTitle}</h4>
              <p className="text-[10px] text-muted-foreground mt-1">
                {formatDate(exam.completedAt)} • {formatMinutes(Math.round(exam.timeSpentSeconds / 60))}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={exam.percentage >= 50 ? "default" : "destructive"}
                  className="text-[10px]"
                >
                  {exam.percentage >= 50 ? "Passed" : "Failed"}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {exam.correctCount} correct / {exam.incorrectCount} incorrect
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-black text-foreground">{exam.percentage}%</p>
              <p className="text-[10px] text-muted-foreground">
                {exam.score}/{exam.totalMarks}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function WeakAreaCard({ area }: { area: ProgressData["weakAreas"][0] }) {
  return (
    <Link
      href={`/student/courses/${area.courseId}`}
      className="block"
    >
      <Card className="border-border shadow-xs hover:border-orange-500/50 hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-foreground truncate">{area.topicTitle}</h4>
              <p className="text-[10px] text-muted-foreground">{area.courseTitle} • {area.lessonCount} lessons</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-lg font-black ${getAccuracyColor(area.accuracy)}`}>
                {area.accuracy}%
              </p>
              <p className="text-[10px] text-muted-foreground">accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── MAIN PAGE COMPONENT ─────────────────────────────────────────────────────

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "exams" | "weaknesses">("overview");

  // // Simulate API call — replace with real fetch
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setData(MOCK_DATA);
  //     setIsLoading(false);
  //   }, 800);
  //   return () => clearTimeout(timer);
  // }, []);

  useEffect(() => {
  async function fetchProgress() {
    try {
      const res = await fetch("/api/student/progress");
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      } else {
        // Fallback to mock data in development
        console.warn("Progress API failed, using mock data");
        setData(MOCK_DATA);
      }
    } catch {
      // Offline or network error — use mock data
      console.warn("Network error, using mock data");
      setData(MOCK_DATA);
    } finally {
      setIsLoading(false);
    }
  }

  fetchProgress();
}, []);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your progress...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Your Progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your learning journey across all subjects
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-xl w-fit">
        {(["overview", "exams", "weaknesses"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {/* Overall Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={Zap}
              label="Total XP"
              value={data.overall.totalXp}
              sublabel="Lifetime points"
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              icon={Flame}
              label="Current Streak"
              value={`${data.overall.currentStreak}d`}
              sublabel={`Best: ${data.overall.longestStreak}d`}
              iconBg="bg-orange-500/10"
              iconColor="text-orange-500"
            />
            <StatCard
              icon={Clock}
              label="Study Time"
              value={formatMinutes(data.overall.totalTimeSpentMinutes)}
              sublabel="Total time invested"
              iconBg="bg-blue-500/10"
              iconColor="text-blue-500"
            />
            <StatCard
              icon={Target}
              label="Accuracy"
              value={`${data.overall.overallAccuracy}%`}
              sublabel="Across all quizzes"
              iconBg="bg-green-500/10"
              iconColor="text-green-500"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-border shadow-xs">
              <CardContent className="p-3 text-center">
                <BookOpen className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-lg font-black text-foreground">{data.overall.totalLessonsCompleted}</p>
                <p className="text-[10px] text-muted-foreground">Lessons Done</p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-xs">
              <CardContent className="p-3 text-center">
                <FileText className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-lg font-black text-foreground">{data.overall.totalExamsTaken}</p>
                <p className="text-[10px] text-muted-foreground">Exams Taken</p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-xs">
              <CardContent className="p-3 text-center">
                <Award className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-lg font-black text-foreground">{data.overall.subjectsEnrolled}</p>
                <p className="text-[10px] text-muted-foreground">Subjects</p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity Chart */}
          <WeeklyActivityChart data={data.weeklyActivity} />

          {/* Subject Progress */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Subject Progress</h2>
            <div className="space-y-3">
              {data.subjects.map((subject) => (
                <SubjectProgressCard
                  key={subject.courseId}
                  subject={subject}
                  isExpanded={expandedSubject === subject.courseId}
                  onToggle={() =>
                    setExpandedSubject((prev) =>
                      prev === subject.courseId ? null : subject.courseId
                    )
                  }
                />
              ))}
            </div>
          </div>

          {/* Question Type Accuracy */}
          <Card className="border-border shadow-xs">
            <CardHeader className="border-b border-border bg-muted/30 px-5 py-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-bold text-foreground">
                  Accuracy by Question Type
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.questionTypeStats.map((stat) => (
                  <div key={stat.type} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-foreground uppercase">
                        {stat.type === "mcq" ? "Multiple Choice" : "Open-Ended"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {stat.correctCount}/{stat.totalAttempted} correct
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black ${getAccuracyColor(stat.accuracy)}`}>
                        {stat.accuracy}%
                      </p>
                      {stat.accuracy >= 70 ? (
                        <TrendingUp className="w-3 h-3 text-green-500 ml-auto" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500 ml-auto" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "exams" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Exam History</h2>
            <Link href="/student/exams">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                Take New Exam <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {data.examHistory.length === 0 ? (
            <Card className="border-border shadow-xs">
              <CardContent className="p-8 text-center">
                <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">No exams taken yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Complete a mock exam to see your results here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.examHistory.map((exam) => (
                <ExamHistoryCard key={exam.attemptId} exam={exam} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "weaknesses" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Areas to Improve</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Topics with lower accuracy — focus your study time here
            </p>
          </div>

          {data.weakAreas.length === 0 ? (
            <Card className="border-border shadow-xs">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">No weak areas!</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Keep up the great work
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.weakAreas.map((area) => (
                <WeakAreaCard key={area.topicId} area={area} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}