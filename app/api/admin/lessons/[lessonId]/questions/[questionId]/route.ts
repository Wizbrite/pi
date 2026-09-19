import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Question from "@/modules/course/models/question.model";
import { getUserRole } from "@/lib/auth/get-user";

export async function PUT(request: Request, { params }: { params: Promise<{ questionId: string }> }) {
  try {
    const roleHeader = request.headers.get("x-user-role") || await getUserRole();
    if (roleHeader !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { questionId } = await params;
    const body = await request.json();

    const updates: any = { ...body };
    if (body.text || body.questionText) {
      updates.questionText = body.questionText || body.text;
    }

    if (body.type === "mcq" && Array.isArray(body.options) && body.options.length > 0) {
      const idx = typeof body.correctAnswerIndex === "number" ? body.correctAnswerIndex : 0;
      updates.correctAnswer = body.options[idx] || body.options[0] || body.correctAnswer || "";
    } else if (body.correctAnswerText) {
      updates.correctAnswer = body.correctAnswerText;
    }

    if (body.difficulty) {
      if (body.difficulty === "beginner" || body.difficulty === "easy") updates.difficulty = "easy";
      else if (body.difficulty === "intermediate" || body.difficulty === "medium") updates.difficulty = "medium";
      else if (body.difficulty === "advanced" || body.difficulty === "hard") updates.difficulty = "hard";
    }

    const question = await Question.findByIdAndUpdate(questionId, updates, { new: true });
    return NextResponse.json({ success: true, data: question });
  } catch (error: any) {
    console.error("[PUT /api/admin/lessons/[lessonId]/questions/[questionId]] Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ questionId: string }> }) {
  try {
    const roleHeader = request.headers.get("x-user-role") || await getUserRole();
    if (roleHeader !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { questionId } = await params;
    await Question.findByIdAndDelete(questionId);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
