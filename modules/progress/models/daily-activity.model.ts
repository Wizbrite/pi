import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDailyActivity {
  userId: Types.ObjectId;
  date: Date; // midnight of the day
  lessonsCompleted: number;
  examsTaken: number;
  timeSpentMinutes: number;
  xpEarned: number;
  questionsAttempted: number;
  questionsCorrect: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDailyActivityDocument extends IDailyActivity, Document {
  _id: Types.ObjectId;
}

const dailyActivitySchema = new Schema<IDailyActivityDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    lessonsCompleted: { type: Number, default: 0 },
    examsTaken: { type: Number, default: 0 },
    timeSpentMinutes: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    questionsAttempted: { type: Number, default: 0 },
    questionsCorrect: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One record per user per day
dailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true });
dailyActivitySchema.index({ userId: 1, date: -1 });

const DailyActivity =
  mongoose.models.DailyActivity ||
  mongoose.model<IDailyActivityDocument>("DailyActivity", dailyActivitySchema);

export default DailyActivity;