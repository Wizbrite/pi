import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { ExamSubject, ExamPaper, ExamQuestion } from "@/modules/course/models/exam.model";
import { getUserRole } from "@/lib/auth/get-user";

export async function GET(request: Request, { params }: { params: Promise<{ subjectId: string }> }) {
  try {
    await connectToDatabase();
    const { subjectId } = await params;
    const subject = await ExamSubject.findById(subjectId).lean();
    if (!subject) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    const papers = await ExamPaper.find({ examSubjectId: subjectId }).lean();
    const paperIds = papers.map((p: any) => p._id);
    const questions = await ExamQuestion.find({ examPaperId: { $in: paperIds } }).lean();
    
    const formattedPapers = papers.map((p: any) => {
      const qCount = questions.filter((q: any) => q.examPaperId.toString() === p._id.toString()).length;
      return { ...p, questionCount: qCount };
    });
    
    return NextResponse.json({ success: true, data: { ...subject, papers: formattedPapers } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ subjectId: string }> }) {
  try {
    const roleHeader = request.headers.get("x-user-role") || await getUserRole();
    if (roleHeader !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { subjectId } = await params;
    const body = await request.json();
    const subject = await ExamSubject.findByIdAndUpdate(subjectId, body, { new: true });
    return NextResponse.json({ success: true, data: subject });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ subjectId: string }> }) {
  try {
    const roleHeader = request.headers.get("x-user-role") || await getUserRole();
    if (roleHeader !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { subjectId } = await params;
    const papers = await ExamPaper.find({ examSubjectId: subjectId });
    const paperIds = papers.map((p: any) => p._id);
    await ExamQuestion.deleteMany({ examPaperId: { $in: paperIds } });
    await ExamPaper.deleteMany({ examSubjectId: subjectId });
    await ExamSubject.findByIdAndDelete(subjectId);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
