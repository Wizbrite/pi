import mongoose, { Document, Schema } from "mongoose";

// ---------------------------------------------------------------------------
// ILessonPart — one micro-learning section inside a lesson
// ---------------------------------------------------------------------------
export interface ILessonPart {
  partNumber: number;
  title: string;
  content: string; // Markdown / plain text body
  aiPromptHint?: string; // Suggested question for the AI Tutor
}

// ---------------------------------------------------------------------------
// ILesson — the lesson document
// ---------------------------------------------------------------------------
export interface ILesson {
  courseId: mongoose.Types.ObjectId; // ref: "Course"
  topicId: mongoose.Types.ObjectId;  // ref: sub-document inside Course.topics
  title: string;
  order: number;
  parts: ILessonPart[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILessonDocument extends ILesson, Document {
  _id: mongoose.Types.ObjectId;
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const lessonPartSchema = new Schema<ILessonPart>(
  {
    partNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    aiPromptHint: { type: String },
  },
  { _id: false } // parts are value objects, no independent _id needed
);

const lessonSchema = new Schema<ILessonDocument>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    topicId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    parts: { type: [lessonPartSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Indexes
lessonSchema.index({ courseId: 1 });
lessonSchema.index({ courseId: 1, topicId: 1 });
lessonSchema.index({ courseId: 1, topicId: 1, order: 1 });

const Lesson =
  mongoose.models.Lesson || mongoose.model<ILessonDocument>("Lesson", lessonSchema);

export default Lesson;
