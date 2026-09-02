import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { Milestone } from "@/modules/parent/models/milestone.model";
import DailyActivity from "@/modules/progress/models/daily-activity.model";
import { Notification } from "@/modules/parent/models/notification.model";

export async function GET(request: Request) {
  try {
    // In production, verify a CRON_SECRET token here to prevent unauthorized execution.
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: "Unauthorized cron execution" }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Fetch all active, unlocked milestones
    const activeMilestones = await Milestone.find({ isUnlocked: false }).populate("studentId");

    const notificationsToSend = [];
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    for (const milestone of activeMilestones) {
      if (!milestone.studentId) continue;

      // 2. Check student's recent activity (e.g. have they been active in the last 3 days?)
      const recentActivity = await DailyActivity.findOne({
        userId: milestone.studentId._id,
        date: { $gte: threeDaysAgo },
        xpEarned: { $gt: 0 },
      });

      // 3. If no significant activity (low performance/inactivity), trigger a reminder
      if (!recentActivity) {
        // Prevent spam: Check if we already sent a reminder in the last 3 days
        const recentReminder = await Notification.findOne({
          userId: milestone.studentId._id,
          type: "milestone_reminder",
          "meta.milestoneId": milestone._id.toString(),
          createdAt: { $gte: threeDaysAgo }
        });

        if (!recentReminder) {
          notificationsToSend.push({
            userId: milestone.studentId._id,
            type: "milestone_reminder",
            title: "🎯 Milestone Reminder",
            message: `Your performance has dropped recently. Don't forget your goal "${milestone.title}" to unlock: ${milestone.gift.emoji} ${milestone.gift.title}. Jump back into practice!`,
            meta: { milestoneId: milestone._id.toString() },
          });
        }
      }
    }

    if (notificationsToSend.length > 0) {
      await Notification.insertMany(notificationsToSend);
    }

    return NextResponse.json({ 
      success: true, 
      remindersSent: notificationsToSend.length 
    });
  } catch (error: any) {
    console.error("Cron milestone reminders error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
