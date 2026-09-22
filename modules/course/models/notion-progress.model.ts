import mongoose, { Document, Schema, Types } from "mongoose";

// ---------------------------------------------------------------------------
// INotionProgress — tracks per-student, per-notion quiz attempts
// ---------------------------------------------------------------------------
export interface INotionProgress {
  userId: Types.ObjectId;
  lessonId: Types.ObjectId;
  courseId: Types.ObjectId;
  partNumber: number;         // which lesson part this notion belongs to
  notionId: string;           // matches INotion.id (UUID)
  notionLabel: string;        // human-readable for display
  passed: boolean;            // has the student met the passing threshold?
  attempts: number;           // total quiz attempts
  bestScore: number;          // best percentage achieved (0–100)
  lastScore: number;          // most recent percentage
  unlockedAt?: Date;          // when the student first passed
  lastAttemptAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotionProgressDocument extends INotionProgress, Document {
  _id: Types.ObjectId;
}

const notionProgressSchema = new Schema<INotionProgressDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    partNumber: { type: Number, required: true },
    notionId: { type: String, required: true },
    notionLabel: { type: String, required: true, default: "" },
    passed: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0, min: 0, max: 100 },
    lastScore: { type: Number, default: 0, min: 0, max: 100 },
    unlockedAt: { type: Date },
    lastAttemptAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One record per student per notion
notionProgressSchema.index({ userId: 1, lessonId: 1, notionId: 1 }, { unique: true });
notionProgressSchema.index({ userId: 1, lessonId: 1 });
notionProgressSchema.index({ userId: 1, courseId: 1 });

const NotionProgress =
  mongoose.models.NotionProgress ||
  mongoose.model<INotionProgressDocument>("NotionProgress", notionProgressSchema);

export default NotionProgress;
