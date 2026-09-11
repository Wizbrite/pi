import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user";
import connectToDatabase from "@/lib/db/mongodb";
import { teacherConnectionService } from "@/modules/teacher/services/teacher-connection.service";
import { User } from "@/modules/auth/models/user.model";
import { ProgressService } from "@/modules/progress/services/progress.service";
import { AdaptationService } from "@/modules/adaptive/services/adaptation.service";
import LearnerProfile from "@/modules/adaptive/models/learner-profile.model";
import { Types } from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const teacherId = await getUserId();
    if (!teacherId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { studentId } = await params;
    await connectToDatabase();

    // Verify teacher is connected to this student
    const isConnected = await teacherConnectionService.isConnected(teacherId, studentId);
    if (!isConnected) {
      return NextResponse.json(
        { message: "You are not connected to this student." },
        { status: 403 }
      );
    }

    const student = await User.findById(studentId).select("fullName name email gceLevel createdAt");
    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    const progressService = new ProgressService();
    const adaptationService = new AdaptationService();

    const [progress, weakAreas, nextSteps, learnerProfile] = await Promise.all([
      progressService.getFullProgress(studentId),
      adaptationService.getWeakAreas(studentId, 8),
      adaptationService.getNextSteps(studentId, 6),
      LearnerProfile.findOne({ userId: new Types.ObjectId(studentId) }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      student: {
        id: student._id.toString(),
        name: student.fullName || student.name,
        email: student.email,
        gceLevel: student.gceLevel,
        createdAt: student.createdAt,
      },
      progress,
      weakAreas,
      nextSteps,
      learnerProfile,
    });
  } catch (error: any) {
    console.error("GET /api/teacher/students/[studentId] error:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
