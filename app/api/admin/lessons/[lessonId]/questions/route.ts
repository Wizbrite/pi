import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Question from "@/modules/course/models/question.model";
import Lesson from "@/modules/course/models/lesson.model";
import { getUserRole } from "@/lib/auth/get-user";

export async function GET(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    await connectToDatabase();
    const { lessonId } = await params;
    const questions = await Question.find({ lessonId });
    return NextResponse.json({ success: true, data: questions });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const roleHeader = request.headers.get("x-user-role") || await getUserRole();
    if (roleHeader !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { lessonId } = await params;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return NextResponse.json({ success: false, message: "Lesson not found" }, { status: 404 });
    const body = await request.json();

    const questionText = body.questionText || body.text || "";

    let correctAnswer = body.correctAnswer || "";
    if (!correctAnswer) {
      if (body.type === "mcq" && Array.isArray(body.options) && body.options.length > 0) {
        const idx = typeof body.correctAnswerIndex === "number" ? body.correctAnswerIndex : 0;
        correctAnswer = body.options[idx] || body.options[0] || "";
      } else if (body.correctAnswerText) {
        correctAnswer = body.correctAnswerText;
      }
    }

    let difficulty: "easy" | "medium" | "hard" = "medium";
    if (body.difficulty === "beginner" || body.difficulty === "easy") difficulty = "easy";
    else if (body.difficulty === "intermediate" || body.difficulty === "medium") difficulty = "medium";
    else if (body.difficulty === "advanced" || body.difficulty === "hard") difficulty = "hard";

    const question = await Question.create({
      questionText,
      correctAnswer: correctAnswer || "N/A",
      explanation: body.explanation || "",
      difficulty,
      type: body.type || (body.options?.length > 0 ? "mcq" : "open-ended"),
      options: Array.isArray(body.options) ? body.options : [],
      xpPoints: typeof body.xpPoints === "number" ? body.xpPoints : 10,
      lessonId,
      courseId: lesson.courseId,
      topicId: lesson.topicId || undefined,
    });
    return NextResponse.json({ success: true, data: question });
  } catch (error: any) {
    console.error("[POST /api/admin/lessons/[lessonId]/questions] Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
