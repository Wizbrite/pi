import mongoose, { Document, Schema } from "mongoose";

export interface ILessonProgress {
  userId: mongoose.Types.ObjectId; // References User
  lessonId: mongoose.Types.ObjectId; // References Lesson
  courseId: mongoose.Types.ObjectId; // References Course (for quick aggregation)
  completed: boolean;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILessonProgressDocument extends ILessonProgress, Document {
  _id: mongoose.Types.ObjectId;
}

const lessonProgressSchema = new Schema<ILessonProgressDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one progress record per user per lesson
lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
lessonProgressSchema.index({ userId: 1, courseId: 1 });

const LessonProgress =
  mongoose.models.LessonProgress ||
  mongoose.model<ILessonProgressDocument>("LessonProgress", lessonProgressSchema);

export default LessonProgress;
