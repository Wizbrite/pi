import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user";
import { leaderboardService } from "@/modules/progress/services/leaderboard.service";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get("timeframe") || "All Time";
    const subject = searchParams.get("subject") || "Global";

    const data = await leaderboardService.getLeaderboard(
      userId,
      timeframe,
      subject
    );

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Leaderboard API error:", error);
    return NextResponse.json(
      { message: "Failed to load leaderboard data" },
      { status: 500 }
    );
  }
}
