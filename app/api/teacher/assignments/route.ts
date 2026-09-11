import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user";
import { teacherAssignmentService } from "@/modules/teacher/services/teacher-assignment.service";

export async function GET(request: Request) {
  try {
    const teacherId = await getUserId();
    if (!teacherId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId") || undefined;

    const assignments = await teacherAssignmentService.getTeacherAssignments(teacherId, studentId);
    return NextResponse.json({ success: true, assignments });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const teacherId = await getUserId();
    if (!teacherId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, type, title, instructions, subjectTitle, topicTitle, dueDate } = body;

    if (!studentId || !type || !title || !instructions) {
      return NextResponse.json(
        { message: "studentId, type, title, and instructions are required" },
        { status: 400 }
      );
    }

    const assignment = await teacherAssignmentService.createAssignment({
      teacherId,
      studentId,
      type,
      title,
      instructions,
      subjectTitle,
      topicTitle,
      dueDate,
    });

    return NextResponse.json({ success: true, assignment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create assignment" }, { status: 400 });
  }
}
