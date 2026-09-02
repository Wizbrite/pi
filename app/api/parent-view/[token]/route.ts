import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { User } from "@/modules/auth/models/user.model";
import { ProgressService } from "@/modules/progress/services/progress.service";

// In a real production app, you might want to use a signed JWT token or a specialized model 
// to generate short-lived or revocable share links.
// For this implementation, we use the studentId directly as the 'token'.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: studentId } = await params;

    await connectToDatabase();

    const student = await User.findById(studentId).select("name fullName gceLevel");
    
    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    // Initialize progress service
    const progressService = new ProgressService();
    
    // Get aggregated stats using the correct method
    const stats = await progressService.getFullProgress(studentId);

    // Build the data structure expected by the frontend parent view
    const progressData = {
      name: student.fullName || student.name,
      email: student.email,
      gceLevel: student.gceLevel || "Ordinary",
      overall: stats.overall,
      weeklyActivity: stats.weeklyActivity,
      subjects: stats.subjects,
      examHistory: stats.examHistory,
      weakAreas: stats.weakAreas,
    };

    return NextResponse.json({ progress: progressData });
  } catch (error: any) {
    console.error("Error fetching public progress view:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
