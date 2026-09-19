import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Lesson from "@/modules/course/models/lesson.model";
import Question from "@/modules/course/models/question.model";
import { getUserRole } from "@/lib/auth/get-user";

export async function GET(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    await connectToDatabase();
    const { courseId } = await params;
    const lessons = await Lesson.find({ courseId }).sort({ order: 1 }).lean();
    
    // Fetch question counts for each lesson
    const lessonIds = lessons.map((l: any) => l._id);
    const questions = await Question.find({ lessonId: { $in: lessonIds } }).lean();

    const data = lessons.map((l: any) => {
      const qCount = questions.filter((q: any) => q.lessonId.toString() === l._id.toString()).length;
      return { ...l, questionCount: qCount };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const roleHeader = request.headers.get("x-user-role") || await getUserRole();
    if (roleHeader !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { courseId } = await params;
    const body = await request.json();
    const lesson = await Lesson.create({ ...body, courseId });
    return NextResponse.json({ success: true, data: lesson });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
