import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type MilestoneType =
  | "lessons_completed"
  | "exam_score"
  | "streak"
  | "accuracy"
  | "xp";

export interface IGift {
  emoji: string;
  title: string;
  description?: string;
  couponCode?: string;
  externalLink?: string;
}

export interface IMilestone {
  parentId: Types.ObjectId;
  studentId: Types.ObjectId;
  title: string;
  description?: string;
  type: MilestoneType;
  targetValue: number;
  gift: IGift;
  isUnlocked: boolean;
  unlockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMilestoneDocument extends IMilestone, Document {}

const GiftSchema = new Schema<IGift>(
  {
    emoji: { type: String, default: "🎁" },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    couponCode: { type: String, trim: true },
    externalLink: { type: String, trim: true },
  },
  { _id: false }
);

const MilestoneSchema = new Schema<IMilestoneDocument>(
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
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ["lessons_completed", "exam_score", "streak", "accuracy", "xp"],
      required: true,
    },
    targetValue: { type: Number, required: true, min: 1 },
    gift: { type: GiftSchema, required: true },
    isUnlocked: { type: Boolean, default: false },
    unlockedAt: { type: Date },
  },
  { timestamps: true }
);

export const Milestone: Model<IMilestoneDocument> =
  mongoose.models.Milestone ||
  mongoose.model<IMilestoneDocument>("Milestone", MilestoneSchema);

export default Milestone;
