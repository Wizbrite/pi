import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { ExamSubject, ExamPaper } from "@/modules/course/models/exam.model";
import { getUserRole } from "@/lib/auth/get-user";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const subjects = await ExamSubject.find().lean();
    const subjectIds = subjects.map((s: any) => s._id);
    const papers = await ExamPaper.find({ examSubjectId: { $in: subjectIds } }).lean();
    
    const data = subjects.map((subj: any) => {
      const count = papers.filter((p: any) => p.examSubjectId.toString() === subj._id.toString()).length;
      return { ...subj, paperCount: count };
    });
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const roleHeader = request.headers.get("x-user-role") || await getUserRole();
    if (roleHeader !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const body = await request.json();
    const existing = await ExamSubject.findOne({ slug: body.slug });
    if (existing) return NextResponse.json({ success: false, message: "Slug must be unique" }, { status: 400 });
    const subject = await ExamSubject.create(body);
    return NextResponse.json({ success: true, data: subject });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
