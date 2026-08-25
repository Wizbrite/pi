import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Question from "@/modules/course/models/question.model";
import mongoose from "mongoose";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json(
        { success: false, message: "Invalid lesson ID" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const questions = await Question.find({
      lessonId: new mongoose.Types.ObjectId(lessonId),
    }).sort({ createdAt: 1 });

    return NextResponse.json({ success: true, data: questions });
  } catch (error: unknown) {
    console.error("[GET /api/lessons/[id]/questions] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
