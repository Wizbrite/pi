import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { ExamPaper } from "@/modules/course/models/exam.model";

export async function GET(request: Request, { params }: { params: Promise<{ subjectId: string }> }) {
  try {
    await connectToDatabase();
    const { subjectId } = await params;
    const papers = await ExamPaper.find({ examSubjectId: subjectId });
    return NextResponse.json({ success: true, data: papers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ subjectId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { subjectId } = await params;
    const body = await request.json();
    const paper = await ExamPaper.create({ ...body, examSubjectId: subjectId });
    return NextResponse.json({ success: true, data: paper });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
