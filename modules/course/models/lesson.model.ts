import mongoose, { Document, Schema } from "mongoose";

export interface ILesson {
  courseId: mongoose.Types.ObjectId;
  topicId: string; // References the _id of a topic inside the Course.topics array
  title: string;
  content: string; // Markdown/HTML body
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILessonDocument extends ILesson, Document {
  _id: mongoose.Types.ObjectId;
}

const lessonSchema = new Schema<ILessonDocument>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    topicId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    order: { type: Number, required: true },
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
