import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { getUserId } from "@/lib/auth/get-user";
import { User } from "@/modules/auth/models/user.model";
import { Milestone } from "@/modules/parent/models/milestone.model";
import { Notification } from "@/modules/parent/models/notification.model";

export async function POST(request: Request) {
  try {
    const parentId = await getUserId();
    if (!parentId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { milestoneId, message } = await request.json();

    if (!milestoneId) {
      return NextResponse.json({ message: "Milestone ID required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(parentId);
    if (user?.role !== "parent") {
      return NextResponse.json({ message: "Only parents can send reminders" }, { status: 403 });
    }

    const milestone = await Milestone.findOne({ _id: milestoneId, parentId, isUnlocked: false });
    if (!milestone) {
      return NextResponse.json({ message: "Active milestone not found" }, { status: 404 });
    }

    const defaultMessage = `Don't forget your goal! You're working towards "${milestone.title}" to unlock: ${milestone.gift.emoji} ${milestone.gift.title}. Keep pushing!`;

    await Notification.create({
      userId: milestone.studentId,
      type: "general",
      title: "🎯 Milestone Reminder",
      message: message || defaultMessage,
    });

    return NextResponse.json({ success: true, message: "Reminder sent successfully" });
  } catch (error: any) {
    console.error("Reminder error:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
