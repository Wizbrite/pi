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
    const question = await Question.create({
      ...body,
      lessonId,
      courseId: lesson.courseId,
      topicId: lesson.topicId
    });
    return NextResponse.json({ success: true, data: question });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
