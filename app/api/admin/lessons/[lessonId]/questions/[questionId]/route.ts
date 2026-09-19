import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Question from "@/modules/course/models/question.model";

export async function PUT(request: Request, { params }: { params: Promise<{ questionId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { questionId } = await params;
    const body = await request.json();
    const question = await Question.findByIdAndUpdate(questionId, body, { new: true });
    return NextResponse.json({ success: true, data: question });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ questionId: string }> }) {
  try {
    if (request.headers.get("x-user-role") !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { questionId } = await params;
    await Question.findByIdAndDelete(questionId);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
