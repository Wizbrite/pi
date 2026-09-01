export interface RecordAnswerInput {
  questionId: string;
  isCorrect: boolean;
  isMcq?: boolean;
}

export interface BatchRecordAnswerInput {
  answers: RecordAnswerInput[];
}

export interface RecordAnswerResult {
  skillId: string;
  topicTitle: string;
  previousMastery: number;
  newMastery: number;
  change: number;
}

export interface BatchRecordAnswerResult {
  results: RecordAnswerResult[];
  overallMastery: number;
}

export interface NextStep {
  type: "lesson" | "quiz" | "review" | "exam";
  courseId: string;
  courseTitle: string;
  topicId: string;
  topicTitle: string;
  lessonId?: string;
  lessonTitle?: string;
  reason: string;
  currentMastery: number;
  difficulty: string;
  priority: number;
}

export interface WeakAreaItem {
  skillId: string;
  topicTitle: string;
  courseId: string;
  courseTitle: string;
  mastery: number;
  totalAttempts: number;
  accuracy: number;
  lastPracticedAt?: string;
  suggestedAction: string;
}