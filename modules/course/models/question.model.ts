import mongoose, { Document, Schema, Types } from "mongoose";

export type QuestionDifficulty = "easy" | "medium" | "hard";
export type QuestionType = "mcq" | "open-ended";

export interface IQuestion {
  courseId: Types.ObjectId;
  lessonId: Types.ObjectId;
  topicId?: Types.ObjectId;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty?: QuestionDifficulty;
  type?: QuestionType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuestionDocument extends IQuestion, Document {
  _id: Types.ObjectId;
}

const questionSchema = new Schema<IQuestionDocument>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    topicId: { type: Schema.Types.ObjectId, index: true },
    questionText: { type: String, required: true, trim: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, required: true, trim: true },
    explanation: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    type: {
      type: String,
      enum: ["mcq", "open-ended"],
      default: function (this: IQuestionDocument) {
        return this.options && this.options.length > 0 ? "mcq" : "open-ended";
      },
    },
  },
  { timestamps: true }
);

questionSchema.index({ lessonId: 1 });
questionSchema.index({ courseId: 1, lessonId: 1 });
questionSchema.index({ topicId: 1 });

const Question =
  mongoose.models.Question ||
  mongoose.model<IQuestionDocument>("Question", questionSchema);

export default Question;