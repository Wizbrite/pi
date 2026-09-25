import mongoose, { Document, Schema, Types } from "mongoose";

// ---------------------------------------------------------------------------
// IPdfPartProgress — tracks per-student PDF lesson part (page-range) quiz attempts
// ---------------------------------------------------------------------------
export interface IPdfPartProgress {
  userId: Types.ObjectId;
  lessonId: Types.ObjectId;
  courseId: Types.ObjectId;
  partNumber: number;         // 1-indexed part number
  passed: boolean;            // true if student met passingScore (default 80%)
  attempts: number;           // total attempts
  bestScore: number;          // best percentage achieved (0–100)
  lastScore: number;          // last score percentage
  unlockedAt?: Date;          // date when student passed checkpoint
  lastAttemptAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPdfPartProgressDocument extends IPdfPartProgress, Document {
  _id: Types.ObjectId;
}

const pdfPartProgressSchema = new Schema<IPdfPartProgressDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    partNumber: { type: Number, required: true },
    passed: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0, min: 0, max: 100 },
    lastScore: { type: Number, default: 0, min: 0, max: 100 },
    unlockedAt: { type: Date },
    lastAttemptAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique index per student per lesson per partNumber
pdfPartProgressSchema.index({ userId: 1, lessonId: 1, partNumber: 1 }, { unique: true });
pdfPartProgressSchema.index({ userId: 1, lessonId: 1 });
pdfPartProgressSchema.index({ userId: 1, courseId: 1 });

const PdfPartProgress =
  mongoose.models.PdfPartProgress ||
  mongoose.model<IPdfPartProgressDocument>("PdfPartProgress", pdfPartProgressSchema);

export default PdfPartProgress;
