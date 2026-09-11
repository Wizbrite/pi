import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface ITeacherConnection {
  teacherId: Types.ObjectId;
  studentId: Types.ObjectId;
  status: ConnectionStatus;
  message?: string;
  /** The party who initiated the request: 'teacher' or 'student' */
  initiatedBy: "teacher" | "student";
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeacherConnectionDocument extends ITeacherConnection, Document {}

const TeacherConnectionSchema = new Schema<ITeacherConnectionDocument>(
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
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: { type: String, trim: true },
    initiatedBy: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure unique teacher-student connection record
TeacherConnectionSchema.index({ teacherId: 1, studentId: 1 }, { unique: true });

export const TeacherConnection: Model<ITeacherConnectionDocument> =
  mongoose.models.TeacherConnection ||
  mongoose.model<ITeacherConnectionDocument>(
    "TeacherConnection",
    TeacherConnectionSchema
  );

export default TeacherConnection;
