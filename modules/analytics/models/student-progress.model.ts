import mongoose, { Schema, Document } from "mongoose";

export interface ITopicMastery {
  topicId: mongoose.Types.ObjectId;
  topicTitle: string;
  masteryScore: number; // 0 to 100%
  completedLessons: number;
  totalLessons: number;
}

export interface IMistakeLog {
  questionId: mongoose.Types.ObjectId;
  topicTitle: string;
  questionText: string;
  mistakeCount: number;
  lastAttemptedAt: Date;
}

export interface IUserProgressDocument extends Document {
  userId: string; // Clerk/NextAuth User ID
  currentStreak: number;
  lastActiveDate: Date;
  totalXP: number;
  topicMastery: ITopicMastery[];
  weakAreas: IMistakeLog[];
  overallAccuracy: number; // Percentage
  totalQuestionsAnswered: number;
}

const userProgressSchema = new Schema<IUserProgressDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    currentStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
    totalXP: { type: Number, default: 0 },
    topicMastery: [
      {
        topicId: { type: Schema.Types.ObjectId, ref: "Topic" },
        topicTitle: String,
        masteryScore: { type: Number, default: 0 },
        completedLessons: { type: Number, default: 0 },
        totalLessons: { type: Number, default: 0 },
      },
    ],
    weakAreas: [
      {
        questionId: Schema.Types.ObjectId,
        topicTitle: String,
        questionText: String,
        mistakeCount: { type: Number, default: 1 },
        lastAttemptedAt: { type: Date, default: Date.now },
      },
    ],
    overallAccuracy: { type: Number, default: 0 },
    totalQuestionsAnswered: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.UserProgress ||
  mongoose.model<IUserProgressDocument>("UserProgress", userProgressSchema);