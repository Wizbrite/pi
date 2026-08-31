import mongoose, { Document, Schema, Types } from "mongoose";

export interface IExamQuestionResult {
  questionId: string;
  questionNumber: number;
  text: string;
  topic: string;
  userAnswer: string;
  correctAnswer: string;
  options: string[];
  isCorrect: boolean;
  marksObtained: number;
  totalMarks: number;
  markingSchemeNotes: string;
  aiExplanation: string;
}

export interface IExamAttempt {
  userId: Types.ObjectId;
  subjectId: string;
  paperId: string;
  paperTitle: string;
  score: number;
  totalMarks: number;
  timeSpentSeconds: number;
  questions: IExamQuestionResult[];
  xpEarned: number;
  completedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExamAttemptDocument extends IExamAttempt, Document {
  _id: Types.ObjectId;
}

const examQuestionResultSchema = new Schema<IExamQuestionResult>(
  {
    questionId: { type: String, required: true },
    questionNumber: { type: Number, required: true },
    text: { type: String, required: true },
    topic: { type: String, required: true },
    userAnswer: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    options: [{ type: String }],
    isCorrect: { type: Boolean, required: true },
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    markingSchemeNotes: { type: String, default: "" },
    aiExplanation: { type: String, default: "" },
  },
  { _id: false }
);

const examAttemptSchema = new Schema<IExamAttemptDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subjectId: { type: String, required: true, index: true },
    paperId: { type: String, required: true },
    paperTitle: { type: String, required: true },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    timeSpentSeconds: { type: Number, default: 0 },
    questions: { type: [examQuestionResultSchema], default: [] },
    xpEarned: { type: Number, default: 0 },
    completedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

examAttemptSchema.index({ userId: 1, completedAt: -1 });

const ExamAttempt =
  mongoose.models.ExamAttempt ||
  mongoose.model<IExamAttemptDocument>("ExamAttempt", examAttemptSchema);

export default ExamAttempt;