import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user";
import { adaptationService } from "@/modules/adaptive/services/adaptation.service";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const nextSteps = await adaptationService.getNextSteps(userId, 5);
    const weakAreas = await adaptationService.getWeakAreas(userId, 5);

    return NextResponse.json({
      success: true,
      data: { nextSteps, weakAreas },
    });
  } catch (error: any) {
    console.error("[GET /api/student/adaptive/next-steps] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load recommendations" },
      { status: 500 }
    );
  }
}