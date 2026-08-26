import mongoose, { Document, Schema } from "mongoose";

// =============================================================================
//  ExamSubject — a subject available for mock exams
// =============================================================================
export interface IExamSubject {
  slug: string;            // URL-friendly ID, e.g. "ict-a"
  title: string;           // e.g. "Information & Communication Technology"
  code: string;            // e.g. "ICT801"
  level: "O-Level" | "A-Level";
  category: "Science" | "Arts";
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExamSubjectDocument extends IExamSubject, Document {
  _id: mongoose.Types.ObjectId;
}

const examSubjectSchema = new Schema<IExamSubjectDocument>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    level: { type: String, required: true, enum: ["O-Level", "A-Level"] },
    category: { type: String, required: true, enum: ["Science", "Arts"] },
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

examSubjectSchema.index({ level: 1 });
examSubjectSchema.index({ slug: 1 }, { unique: true });

export const ExamSubject =
  mongoose.models.ExamSubject ||
  mongoose.model<IExamSubjectDocument>("ExamSubject", examSubjectSchema);

// =============================================================================
//  ExamPaper — a specific exam paper under a subject
// =============================================================================
export interface IExamPaper {
  slug: string;            // URL-friendly ID, e.g. "ict801-2024-p1"
  examSubjectId: mongoose.Types.ObjectId;
  year: number;
  paperNumber: number;
  title: string;           // e.g. "Paper 1 - Multiple Choice Questions"
  type: "MCQ" | "Structured";
  durationMinutes: number;
  totalMarks: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExamPaperDocument extends IExamPaper, Document {
  _id: mongoose.Types.ObjectId;
}

const examPaperSchema = new Schema<IExamPaperDocument>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    examSubjectId: { type: Schema.Types.ObjectId, ref: "ExamSubject", required: true },
    year: { type: Number, required: true },
    paperNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ["MCQ", "Structured"] },
    durationMinutes: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
  },
  { timestamps: true }
);

examPaperSchema.index({ examSubjectId: 1 });
examPaperSchema.index({ slug: 1 }, { unique: true });

export const ExamPaper =
  mongoose.models.ExamPaper ||
  mongoose.model<IExamPaperDocument>("ExamPaper", examPaperSchema);

// =============================================================================
//  ExamQuestion — an individual question within a paper
// =============================================================================
export interface IExamQuestion {
  examPaperId: mongoose.Types.ObjectId;
  questionNumber: number;
  text: string;
  options: string[];          // Empty array for structured/open-ended
  correctAnswerIndex: number; // -1 for structured questions
  correctAnswerText: string;  // Model answer text (for structured) or the option text (for MCQ)
  marks: number;
  topic: string;
  markingSchemeNotes: string;
  aiExplanation: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExamQuestionDocument extends IExamQuestion, Document {
  _id: mongoose.Types.ObjectId;
}

const examQuestionSchema = new Schema<IExamQuestionDocument>(
  {
    examPaperId: { type: Schema.Types.ObjectId, ref: "ExamPaper", required: true },
    questionNumber: { type: Number, required: true },
    text: { type: String, required: true, trim: true },
    options: { type: [String], default: [] },
    correctAnswerIndex: { type: Number, required: true },
    correctAnswerText: { type: String, required: true, trim: true },
    marks: { type: Number, required: true },
    topic: { type: String, required: true, trim: true },
    markingSchemeNotes: { type: String, default: "" },
    aiExplanation: { type: String, default: "" },
  },
  { timestamps: true }
);

examQuestionSchema.index({ examPaperId: 1 });
examQuestionSchema.index({ examPaperId: 1, questionNumber: 1 });

export const ExamQuestion =
  mongoose.models.ExamQuestion ||
  mongoose.model<IExamQuestionDocument>("ExamQuestion", examQuestionSchema);
