import mongoose, { Document, Schema, Types } from "mongoose";

export type TopicDifficulty = "beginner" | "intermediate" | "advanced";

export interface ITopic {
  title: string;
  description?: string;
  order: number;
  difficulty?: TopicDifficulty;
  prerequisites?: Types.ObjectId[];
}

export interface ICourse {
  title: string;
  level: "O-Level" | "A-Level";
  subject: string;
  description?: string;
  topics: ITopic[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICourseDocument extends ICourse, Document {
  _id: Types.ObjectId;
}

const topicSchema = new Schema<ITopic>(
  {
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    prerequisites: [{ type: Schema.Types.ObjectId }],
  },
  { _id: true }
);

const courseSchema = new Schema<ICourseDocument>(
  {
    title: { type: String, required: true, trim: true },
    level: { type: String, required: true, enum: ["O-Level", "A-Level"] },
    subject: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    topics: [topicSchema],
  },
  { timestamps: true }
);

courseSchema.index({ level: 1 });
courseSchema.index({ subject: 1 });
courseSchema.index({ level: 1, subject: 1 });

const Course =
  mongoose.models.Course || mongoose.model<ICourseDocument>("Course", courseSchema);

export default Course;