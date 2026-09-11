import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user";
import { teacherAssignmentService } from "@/modules/teacher/services/teacher-assignment.service";

export async function GET() {
  try {
    const studentId = await getUserId();
    if (!studentId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const assignments = await teacherAssignmentService.getStudentAssignments(studentId);
    return NextResponse.json({ success: true, assignments });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
