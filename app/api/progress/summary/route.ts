import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { getUserId } from "@/lib/auth/get-user";
import UserProgress from "@/modules/analytics/models/student-progress.model";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const progress = await UserProgress.findOne({ userId });

    if (!progress) {
      return NextResponse.json({
        success: true,
        data: {
          currentStreak: 0,
          totalXP: 0,
          overallAccuracy: 0,
          topicMastery: [],
          weakAreas: [],
        },
      });
    }

    return NextResponse.json({ success: true, data: progress });
  } catch (error: any) {
    console.error("[GET /api/progress/summary] Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}