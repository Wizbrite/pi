import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Lesson from "@/modules/course/models/lesson.model";
import LessonProgress from "@/modules/course/models/lesson-progress.model";
import { getUserId } from "@/lib/auth/get-user";
import { logDailyActivity } from "@/lib/progress/log-activity";
import mongoose from "mongoose";

// Expected request body
interface CompleteLessonBody {
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const lessonId = resolvedParams.id;
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json(
        { success: false, message: "Invalid lesson ID" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    let body: CompleteLessonBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Request body is required" },
        { status: 400 }
      );
    }

    const { score, totalQuestions, timeSpentSeconds } = body;

    // Validate fields
    if (typeof score !== "number" || score < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid score value" },
        { status: 400 }
      );
    }
    if (typeof totalQuestions !== "number" || totalQuestions < 1) {
      return NextResponse.json(
        { success: false, message: "Invalid totalQuestions value" },
        { status: 400 }
      );
    }
    if (typeof timeSpentSeconds !== "number" || timeSpentSeconds < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid timeSpentSeconds value" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json(
        { success: false, message: "Lesson not found" },
        { status: 404 }
      );
    }

    // Calculate derived values
    const accuracy = Math.round((score / totalQuestions) * 100);
    const xpEarned = Math.round(score * 30 + (accuracy >= 80 ? 20 : 0)); // 30 XP per correct + 20 bonus for 80%+
    const masteryLevel = Math.min(100, accuracy); // Simplified mastery = accuracy for now

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get existing progress (if any) for best scores
    const existingProgress = await LessonProgress.findOne({
      userId: userObjectId,
      lessonId: lesson._id,
    });

    const updateData: Record<string, any> = {
      $set: {
        courseId: lesson.courseId,
        topicId: lesson.topicId,
        completed: true,
        completedAt: new Date(),
        score,
        totalQuestions,
        accuracy,
        timeSpentSeconds,
        xpEarned,
        masteryLevel,
        bestScore: Math.max(existingProgress?.bestScore || 0, score),
        bestAccuracy: Math.max(existingProgress?.bestAccuracy || 0, accuracy),
        lastAttemptedAt: new Date(),
      },
      $inc: { attempts: 1 },
    };

    // Only set firstCompletedAt if this is the first completion
    if (!existingProgress?.firstCompletedAt) {
      updateData.$set.firstCompletedAt = new Date();
    }

    const progress = await LessonProgress.findOneAndUpdate(
      { userId: userObjectId, lessonId: lesson._id },
      updateData,
      { upsert: true, new: true }
    );

    // Log daily activity (non-blocking — don't wait for it)
    logDailyActivity(userId, {
      lessonsCompleted: 1,
      timeSpentMinutes: Math.round(timeSpentSeconds / 60),
      xpEarned,
      questionsAttempted: totalQuestions,
      questionsCorrect: score,
    }).catch((err) => {
      console.error("Failed to log daily activity:", err);
    });

    return NextResponse.json({
      success: true,
      data: {
        progress,
        xpEarned,
        accuracy,
        masteryLevel,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/lessons/[id]/complete] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update lesson progress" },
      { status: 500 }
    );
  }
}