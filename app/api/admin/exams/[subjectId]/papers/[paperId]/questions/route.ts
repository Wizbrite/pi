import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { ExamQuestion } from "@/modules/course/models/exam.model";
import { getUserRole } from "@/lib/auth/get-user";

export async function GET(request: Request, { params }: { params: Promise<{ paperId: string }> }) {
  try {
    await connectToDatabase();
    const { paperId } = await params;
    const questions = await ExamQuestion.find({ examPaperId: paperId }).sort({ questionNumber: 1 });
    return NextResponse.json({ success: true, data: questions });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ paperId: string }> }) {
  try {
    const roleHeader = request.headers.get("x-user-role") || await getUserRole();
    if (roleHeader !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { paperId } = await params;
    const body = await request.json();
    const question = await ExamQuestion.create({ ...body, examPaperId: paperId });
    return NextResponse.json({ success: true, data: question });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
