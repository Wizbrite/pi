import { Types } from "mongoose";
import connectToDatabase from "@/lib/db/mongodb";
import DailyActivity from "@/modules/progress/models/daily-activity.model";

/**
 * Call this whenever a user completes a lesson, quiz, or exam.
 * It upserts today's daily activity record with incremented counters and study duration.
 */
export async function logDailyActivity(
  userId: string | Types.ObjectId,
  data: {
    lessonsCompleted?: number;
    examsTaken?: number;
    timeSpentMinutes?: number;
    timeSpentSeconds?: number;
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
  if (data.xpEarned) inc.xpEarned = data.xpEarned;
  if (data.questionsAttempted) inc.questionsAttempted = data.questionsAttempted;
  if (data.questionsCorrect) inc.questionsCorrect = data.questionsCorrect;

  // Handle time calculation
  let secondsToAdd = data.timeSpentSeconds ?? 0;
  let minutesToAdd = data.timeSpentMinutes ?? 0;

  if (secondsToAdd > 0) {
    inc.timeSpentSeconds = secondsToAdd;
    if (minutesToAdd === 0) {
      minutesToAdd = Math.max(1, Math.round(secondsToAdd / 60));
    }
  }

  if (minutesToAdd > 0) {
    inc.timeSpentMinutes = minutesToAdd;
  }

  if (Object.keys(inc).length === 0) return;

  await DailyActivity.findOneAndUpdate(
    { userId, date: today },
    { $inc: inc },
    { upsert: true, new: true }
  );
}