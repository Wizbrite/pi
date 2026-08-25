import mongoose, { Document, Schema } from "mongoose";

// ---------------------------------------------------------------------------
// IQuestion — top-level question document
//
// Supports two question types:
//   • Structural (MCQ)  — options[] is non-empty; correctAnswer is one of the options.
//   • NCQ / Open-ended  — options[] is empty;  correctAnswer is the model answer text.
// ---------------------------------------------------------------------------
export interface IQuestion {
  courseId: mongoose.Types.ObjectId;  // ref: "Course"
  lessonId: mongoose.Types.ObjectId;  // ref: "Lesson"
  questionText: string;
  options: string[];        // MCQ choices; leave empty for open-ended / NCQ
  correctAnswer: string;    // Exact matching option string, or model answer for NCQ
  explanation: string;      // Why the answer is correct (shown post-answer)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuestionDocument extends IQuestion, Document {
  _id: mongoose.Types.ObjectId;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const questionSchema = new Schema<IQuestionDocument>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    questionText: { type: String, required: true, trim: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, required: true, trim: true },
    explanation: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
questionSchema.index({ lessonId: 1 });
questionSchema.index({ courseId: 1, lessonId: 1 });

const Question =
  mongoose.models.Question ||
  mongoose.model<IQuestionDocument>("Question", questionSchema);

export default Question;
