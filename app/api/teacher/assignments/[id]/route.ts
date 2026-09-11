import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user";
import { teacherAssignmentService } from "@/modules/teacher/services/teacher-assignment.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacherId = await getUserId();
    if (!teacherId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { score, comments } = await request.json();

    const assignment = await teacherAssignmentService.reviewAssignment({
      assignmentId: id,
      teacherId,
      score,
      comments,
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to review assignment" }, { status: 400 });
  }
}
