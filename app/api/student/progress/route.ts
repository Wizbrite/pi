import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user";
import { progressService } from "@/modules/progress/services/progress.service";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const data = await progressService.getFullProgress(userId);

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Progress API error:", error);
    return NextResponse.json(
      { message: "Failed to load progress data" },
      { status: 500 }
    );
  }
}