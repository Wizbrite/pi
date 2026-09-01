import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type NotificationType =
  | "parent_request"
  | "request_accepted"
  | "request_rejected"
  | "milestone_unlocked"
  | "general";

export interface INotification {
  userId: Types.ObjectId;      // recipient
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  meta?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationDocument extends INotification, Document {}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "parent_request",
        "request_accepted",
        "request_rejected",
        "milestone_unlocked",
        "general",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
    actionUrl: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Notification: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>("Notification", NotificationSchema);

export default Notification;
