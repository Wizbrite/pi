// Types for the progress page - matches what the API should return

export interface DailyActivity {
  date: string; // "2025-08-31"
  lessonsCompleted: number;
  examsTaken: number;
  timeSpentMinutes: number;
  xpEarned: number;
}

export interface LessonProgress {
  lessonId: string;
  title: string;
  order: number;
  completed: boolean;
  score?: number; // e.g., 1/2
  totalQuestions?: number;
  accuracy?: number; // 0-100
  timeSpentSeconds?: number;
  attempts: number;
  xpEarned: number;
  masteryLevel: number; // 0-100
  lastAttemptedAt?: string;
}

export interface TopicProgress {
  topicId: string;
  title: string;
  description?: string;
  order: number;
  lessons: LessonProgress[];
  completedCount: number;
  totalLessons: number;
  masteryLevel: number; // aggregate of lessons
  timeSpentMinutes: number;
}

export interface SubjectProgress {
  courseId: string;
  title: string;
  level: "O-Level" | "A-Level";
  subject: string;
  topics: TopicProgress[];
  completedLessons: number;
  totalLessons: number;
  overallMastery: number; // 0-100
  totalTimeSpentMinutes: number;
  averageAccuracy: number;
  lastActivityAt?: string;
}

export interface ExamHistory {
  attemptId: string;
  paperTitle: string;
  subjectId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeSpentSeconds: number;
  completedAt: string;
  correctCount: number;
  incorrectCount: number;
}

export interface WeakArea {
  topicId: string;
  topicTitle: string;
  courseId: string;
  courseTitle: string;
  accuracy: number;
  totalAttempts: number;
  lessonCount: number;
}

export interface QuestionTypeStats {
  type: "mcq" | "open-ended" | "matching" | "fill-blank";
  totalAttempted: number;
  correctCount: number;
  accuracy: number;
}

export interface OverallStats {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeSpentMinutes: number;
  totalLessonsCompleted: number;
  totalExamsTaken: number;
  overallAccuracy: number;
  subjectsEnrolled: number;
}

export interface ProgressData {
  overall: OverallStats;
  weeklyActivity: DailyActivity[];
  subjects: SubjectProgress[];
  examHistory: ExamHistory[];
  weakAreas: WeakArea[];
  questionTypeStats: QuestionTypeStats[];
}