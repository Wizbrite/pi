import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type AssignmentType = "exercise" | "correction" | "recommendation";
export type AssignmentStatus = "assigned" | "submitted" | "reviewed" | "completed";

export interface ITeacherAssignment {
  teacherId: Types.ObjectId;
  studentId: Types.ObjectId;
  type: AssignmentType;
  title: string;
  instructions: string;
  subjectTitle?: string;
  topicTitle?: string;
  dueDate?: Date;
  status: AssignmentStatus;
  studentSubmission?: {
    answerText?: string;
    submittedAt?: Date;
  };
  teacherFeedback?: {
    score?: number; // 0 - 100
    comments?: string;
    reviewedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeacherAssignmentDocument extends ITeacherAssignment, Document {}

const TeacherAssignmentSchema = new Schema<ITeacherAssignmentDocument>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["exercise", "correction", "recommendation"],
      default: "exercise",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    instructions: { type: String, required: true, trim: true },
    subjectTitle: { type: String, trim: true },
    topicTitle: { type: String, trim: true },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["assigned", "submitted", "reviewed", "completed"],
      default: "assigned",
    },
    studentSubmission: {
      answerText: { type: String },
      submittedAt: { type: Date },
    },
    teacherFeedback: {
      score: { type: Number, min: 0, max: 100 },
      comments: { type: String },
      reviewedAt: { type: Date },
    },
  },
  { timestamps: true }
);

TeacherAssignmentSchema.index({ teacherId: 1, studentId: 1, createdAt: -1 });

export const TeacherAssignment: Model<ITeacherAssignmentDocument> =
  mongoose.models.TeacherAssignment ||
  mongoose.model<ITeacherAssignmentDocument>(
    "TeacherAssignment",
    TeacherAssignmentSchema
  );

export default TeacherAssignment;
