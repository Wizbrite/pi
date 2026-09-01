import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/auth/get-user";
import { adaptationService } from "@/modules/adaptive/services/adaptation.service";

const singleAnswerSchema = z.object({
  questionId: z.string().min(1),
  isCorrect: z.boolean(),
  isMcq: z.boolean().optional(),
});

const batchSchema = z.object({
  answers: z.array(singleAnswerSchema).min(1).max(50),
});

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Detect batch vs single
    if (body.answers && Array.isArray(body.answers)) {
      const validation = batchSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, message: "Validation failed", errors: validation.error.format() },
          { status: 400 }
        );
      }
      const result = await adaptationService.batchRecordAnswer(userId, validation.data);
      return NextResponse.json({ success: true, data: result });
    } else {
      const validation = singleAnswerSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, message: "Validation failed", errors: validation.error.format() },
          { status: 400 }
        );
      }
      const result = await adaptationService.recordAnswer(userId, validation.data);
      return NextResponse.json({ success: true, data: result });
    }
  } catch (error: any) {
    console.error("[POST /api/student/adaptive/record-answer] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to record answer" },
      { status: 500 }
    );
  }
}