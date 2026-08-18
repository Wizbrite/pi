import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Lesson from "@/modules/course/models/lesson.model";
import LessonProgress from "@/modules/course/models/lesson-progress.model";
import { getUserId } from "@/lib/auth/get-user";
import mongoose from "mongoose";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const lessonId = resolvedParams.id;
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json({ success: false, message: "Invalid lesson ID" }, { status: 400 });
    }

    await connectToDatabase();
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ success: false, message: "Lesson not found" }, { status: 404 });
    }

    // Upsert the progress record
    const progress = await LessonProgress.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        lessonId: lesson._id,
      },
      {
        $set: {
          courseId: lesson.courseId,
          completed: true,
          completedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: progress });
  } catch (error: any) {
    console.error("[POST /api/lessons/[id]/complete] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update lesson progress" },
      { status: 500 }
    );
  }
}
