import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user";
import { teacherAssignmentService } from "@/modules/teacher/services/teacher-assignment.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const studentId = await getUserId();
    if (!studentId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { answerText } = await request.json();

    if (!answerText || typeof answerText !== "string") {
      return NextResponse.json({ message: "Answer text is required" }, { status: 400 });
    }

    const assignment = await teacherAssignmentService.submitAssignment(id, studentId, answerText);
    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to submit assignment" }, { status: 400 });
  }
}
