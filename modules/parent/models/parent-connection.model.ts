import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface IParentConnection {
  parentId: Types.ObjectId;
  studentId: Types.ObjectId;
  status: ConnectionStatus;
  message?: string;
  /** The party who initiated the request: 'parent' or 'student' */
  initiatedBy: "parent" | "student";
  createdAt: Date;
  updatedAt: Date;
}

export interface IParentConnectionDocument extends IParentConnection, Document {}

const ParentConnectionSchema = new Schema<IParentConnectionDocument>(
  {
    parentId: {
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
      enum: ["parent", "student"],
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure one connection record per parent-student pair
ParentConnectionSchema.index({ parentId: 1, studentId: 1 }, { unique: true });

export const ParentConnection: Model<IParentConnectionDocument> =
  mongoose.models.ParentConnection ||
  mongoose.model<IParentConnectionDocument>(
    "ParentConnection",
    ParentConnectionSchema
  );

export default ParentConnection;
