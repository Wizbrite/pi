import { Types } from "mongoose";
import connectToDatabase from "@/lib/db/mongodb";
import DailyActivity from "@/modules/progress/models/daily-activity.model";

/**
 * Call this whenever a user completes a lesson or exam.
 * It upserts today's daily activity record with incremented counters.
 */
export async function logDailyActivity(
  userId: string | Types.ObjectId,
  data: {
    lessonsCompleted?: number;
    examsTaken?: number;
    timeSpentMinutes?: number;
    xpEarned?: number;
    questionsAttempted?: number;
    questionsCorrect?: number;
  }
): Promise<void> {
  await connectToDatabase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inc: Record<string, number> = {};
  if (data.lessonsCompleted) inc.lessonsCompleted = data.lessonsCompleted;
  if (data.examsTaken) inc.examsTaken = data.examsTaken;
  if (data.timeSpentMinutes) inc.timeSpentMinutes = data.timeSpentMinutes;
  if (data.xpEarned) inc.xpEarned = data.xpEarned;
  if (data.questionsAttempted) inc.questionsAttempted = data.questionsAttempted;
  if (data.questionsCorrect) inc.questionsCorrect = data.questionsCorrect;

  if (Object.keys(inc).length === 0) return;

  await DailyActivity.findOneAndUpdate(
    { userId, date: today },
    { $inc: inc },
    { upsert: true, new: true }
  );
}