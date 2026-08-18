import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Lesson from "@/modules/course/models/lesson.model";
import mongoose from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    return NextResponse.json({ success: true, data: lesson });
  } catch (error: any) {
    console.error("[GET /api/lessons/[id]] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}
