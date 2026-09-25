import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user";
import connectToDatabase from "@/lib/db/mongodb";
import PdfPartProgress from "@/modules/course/models/pdf-part-progress.model";
import mongoose from "mongoose";

/**
 * GET /api/student/pdf-progress?lessonId=...
 * Returns all PDF part progress records for the authenticated student for a specific lesson.
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
      return NextResponse.json(
        { success: false, message: "lessonId query param is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const records = await PdfPartProgress.find({
      userId: new mongoose.Types.ObjectId(userId),
      lessonId: new mongoose.Types.ObjectId(lessonId),
    }).lean();

    return NextResponse.json({
      success: true,
      data: records,
    });
  } catch (error: any) {
    console.error("[GET /api/student/pdf-progress]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * POST /api/student/pdf-progress
 * Records a student's PDF checkpoint attempt and updates unlocked state if passed.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      lessonId,
      courseId,
      partNumber,
      score = 0,
      totalQuestions = 1,
      passingScore = 80,
    } = body as {
      lessonId: string;
      courseId: string;
      partNumber: number;
      score: number;
      totalQuestions: number;
      passingScore: number;
    };

    if (!lessonId || !courseId || typeof partNumber !== "number") {
      return NextResponse.json(
        { success: false, message: "Missing required fields (lessonId, courseId, partNumber)" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const scorePercentage = Math.round((score / Math.max(totalQuestions, 1)) * 100);
    const hasPassed = scorePercentage >= (passingScore ?? 80);

    const userObjId = new mongoose.Types.ObjectId(userId);
    const lessonObjId = new mongoose.Types.ObjectId(lessonId);
    const courseObjId = new mongoose.Types.ObjectId(courseId);

    const existing = await PdfPartProgress.findOne({
      userId: userObjId,
      lessonId: lessonObjId,
      partNumber,
    });

    let record;
    if (existing) {
      existing.attempts += 1;
      existing.lastScore = scorePercentage;
      existing.lastAttemptAt = new Date();
      if (scorePercentage > existing.bestScore) {
        existing.bestScore = scorePercentage;
      }
      if (hasPassed && !existing.passed) {
        existing.passed = true;
        existing.unlockedAt = new Date();
      }
      record = await existing.save();
    } else {
      record = await PdfPartProgress.create({
        userId: userObjId,
        lessonId: lessonObjId,
        courseId: courseObjId,
        partNumber,
        passed: hasPassed,
        attempts: 1,
        bestScore: scorePercentage,
        lastScore: scorePercentage,
        unlockedAt: hasPassed ? new Date() : undefined,
        lastAttemptAt: new Date(),
      });
    }

    // Fetch all updated records for this lesson to return complete status
    const allProgress = await PdfPartProgress.find({
      userId: userObjId,
      lessonId: lessonObjId,
    }).lean();

    return NextResponse.json({
      success: true,
      data: {
        attemptRecord: record,
        hasPassed,
        scorePercentage,
        allProgress,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/student/pdf-progress]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
