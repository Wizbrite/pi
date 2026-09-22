import mongoose, { Document, Schema } from "mongoose";

// ---------------------------------------------------------------------------
// INotion — a named video segment marker within a lesson part
// ---------------------------------------------------------------------------
export interface INotion {
  id: string;            // stable UUID for referencing in progress records
  label: string;         // e.g. "Introduction", "Core Concepts"
  startTime: number;     // seconds from video start
  endTime: number;       // seconds (0 = end of video for last notion)
  description?: string;  // context text fed to AI for question generation
  passingScore: number;  // minimum % to pass, default 80
  questionsCount: number;// number of AI questions to generate, default 20
}

// ---------------------------------------------------------------------------
// ILessonPart — one micro-learning section inside a lesson
// ---------------------------------------------------------------------------
export interface ILessonPart {
  partNumber: number;
  title: string;
  content: string; // Markdown / plain text body
  aiPromptHint?: string; // Suggested question for the AI Tutor
  videoUrl?: string;
  vimeoVideoId?: string;
  vimeoEmbedUrl?: string;
  notions?: INotion[];  // video segment markers for gated quizzes
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
const notionSchema = new Schema<INotion>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    startTime: { type: Number, required: true, default: 0 },
    endTime: { type: Number, required: true, default: 0 },
    description: { type: String, default: "" },
    passingScore: { type: Number, default: 80, min: 0, max: 100 },
    questionsCount: { type: Number, default: 20, min: 5 },
  },
  { _id: false }
);

const lessonPartSchema = new Schema<ILessonPart>(
  {
    partNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    aiPromptHint: { type: String },
    videoUrl: { type: String, default: "" },
    vimeoVideoId: { type: String, default: "" },
    vimeoEmbedUrl: { type: String, default: "" },
    notions: { type: [notionSchema], default: [] },
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
