import mongoose, { Document, Schema, Types } from "mongoose";

export interface ILessonProgress {
  userId: Types.ObjectId;
  lessonId: Types.ObjectId;
  courseId: Types.ObjectId;
  topicId?: Types.ObjectId;
  completed: boolean;
  completedAt?: Date;

  // Quiz performance
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeSpentSeconds: number;
  attempts: number;
  xpEarned: number;
  masteryLevel: number;
  bestScore: number;
  bestAccuracy: number;
  firstCompletedAt?: Date;
  lastAttemptedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILessonProgressDocument extends ILessonProgress, Document {
  _id: Types.ObjectId;
}

const lessonProgressSchema = new Schema<ILessonProgressDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    topicId: { type: Schema.Types.ObjectId, index: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },

    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0, min: 0, max: 100 },
    timeSpentSeconds: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    masteryLevel: { type: Number, default: 0, min: 0, max: 100 },
    bestScore: { type: Number, default: 0 },
    bestAccuracy: { type: Number, default: 0 },
    firstCompletedAt: { type: Date },
    lastAttemptedAt: { type: Date },
  },
  { timestamps: true }
);

lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
lessonProgressSchema.index({ userId: 1, courseId: 1 });
lessonProgressSchema.index({ userId: 1, topicId: 1 });

const LessonProgress =
  mongoose.models.LessonProgress ||
  mongoose.model<ILessonProgressDocument>("LessonProgress", lessonProgressSchema);

export default LessonProgress;