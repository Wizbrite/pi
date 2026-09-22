import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import NotionProgress from "@/modules/course/models/notion-progress.model";
import { getUserId } from "@/lib/auth/get-user";

/**
 * GET /api/student/notion-progress?lessonId=...
 * Returns all notion progress records for the current student in a lesson.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    if (!lessonId) {
      return NextResponse.json({ success: false, message: "lessonId is required" }, { status: 400 });
    }

    await connectToDatabase();
    const records = await NotionProgress.find({ userId, lessonId }).lean();

    // Transform to a map keyed by notionId for easy lookup on the client
    const progressMap: Record<string, any> = {};
    for (const r of records) {
      progressMap[r.notionId] = {
        passed: r.passed,
        attempts: r.attempts,
        bestScore: r.bestScore,
        lastScore: r.lastScore,
        unlockedAt: r.unlockedAt,
        lastAttemptAt: r.lastAttemptAt,
      };
    }

    return NextResponse.json({ success: true, data: progressMap });
  } catch (error: any) {
    console.error("[GET /api/student/notion-progress]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * POST /api/student/notion-progress
 * Records a notion quiz attempt.
 *
 * Body: {
 *   lessonId: string;
 *   courseId: string;
 *   partNumber: number;
 *   notionId: string;
 *   notionLabel: string;
 *   score: number;       // correct answers count
 *   total: number;       // total questions
 *   passingScore: number;// % threshold (e.g. 80)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { lessonId, courseId, partNumber, notionId, notionLabel, score, total, passingScore } = body as {
      lessonId: string;
      courseId: string;
      partNumber: number;
      notionId: string;
      notionLabel: string;
      score: number;
      total: number;
      passingScore: number;
    };

    if (!lessonId || !courseId || !notionId || total === undefined || score === undefined) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = percentage >= (passingScore || 80);
    const now = new Date();

    // Upsert — one record per student per notion
    const existing = await NotionProgress.findOne({ userId, lessonId, notionId });

    if (existing) {
      existing.attempts += 1;
      existing.lastScore = percentage;
      existing.lastAttemptAt = now;
      if (percentage > existing.bestScore) existing.bestScore = percentage;
      if (passed && !existing.passed) {
        existing.passed = true;
        existing.unlockedAt = now;
      }
      await existing.save();
      return NextResponse.json({ success: true, data: existing });
    } else {
      const record = await NotionProgress.create({
        userId,
        lessonId,
        courseId,
        partNumber: partNumber ?? 1,
        notionId,
        notionLabel: notionLabel ?? "",
        passed,
        attempts: 1,
        bestScore: percentage,
        lastScore: percentage,
        unlockedAt: passed ? now : undefined,
        lastAttemptAt: now,
      });
      return NextResponse.json({ success: true, data: record });
    }
  } catch (error: any) {
    console.error("[POST /api/student/notion-progress]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
