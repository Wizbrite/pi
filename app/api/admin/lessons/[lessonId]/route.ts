import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Lesson from "@/modules/course/models/lesson.model";
import Question from "@/modules/course/models/question.model";
import { getUserRole } from "@/lib/auth/get-user";

export async function GET(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    await connectToDatabase();
    const { lessonId } = await params;
    const lesson = await Lesson.findById(lessonId);
    return NextResponse.json({ success: true, data: lesson });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const roleHeader = request.headers.get("x-user-role") || await getUserRole();
    if (roleHeader !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { lessonId } = await params;
    const body = await request.json();
    const lesson = await Lesson.findByIdAndUpdate(lessonId, body, { new: true });
    return NextResponse.json({ success: true, data: lesson });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const roleHeader = request.headers.get("x-user-role") || await getUserRole();
    if (roleHeader !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { lessonId } = await params;
    await Promise.all([
      Question.deleteMany({ lessonId }),
      Lesson.findByIdAndDelete(lessonId)
    ]);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
