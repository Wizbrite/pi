import mongoose, { Document, Schema } from "mongoose";

export interface ITopic {
  title: string;
  description?: string;
  order: number;
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
  _id: mongoose.Types.ObjectId;
}

const topicSchema = new Schema<ITopic>(
  {
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true },
  },
  { _id: true } // Generate object ids for subdocuments
);

const courseSchema = new Schema<ICourseDocument>(
  {
    title: { type: String, required: true, trim: true },
    level: { type: String, required: true, enum: ["O-Level", "A-Level"] },
    subject: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    topics: [topicSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster querying
courseSchema.index({ level: 1 });
courseSchema.index({ subject: 1 });
courseSchema.index({ level: 1, subject: 1 });

const Course =
  mongoose.models.Course || mongoose.model<ICourseDocument>("Course", courseSchema);

export default Course;
