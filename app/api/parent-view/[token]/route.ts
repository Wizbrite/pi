import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
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
    
    // Get aggregated stats
    const stats = await progressService.getStudentProgressStats(studentId);

    // Build the data structure expected by the frontend parent view
    const progressData = {
      name: student.fullName || student.name,
      gceLevel: student.gceLevel || "Ordinary",
      overall: {
        totalXp: stats.totalXp,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak || stats.currentStreak,
        totalTimeSpentMinutes: stats.totalTimeSpentMinutes,
        totalLessonsCompleted: stats.lessonsCompleted,
        totalExamsTaken: stats.examsCompleted,
        overallAccuracy: stats.overallAccuracy,
        subjectsEnrolled: stats.subjectsEnrolled || 0,
      },
      // Since we don't have all these detailed fields implemented in the progress service yet,
      // we'll send empty arrays/mock data for the detailed charts to avoid breaking the frontend
      weeklyActivity: [
        { date: "Mon", lessonsCompleted: 0, xpEarned: 0 },
        { date: "Tue", lessonsCompleted: 0, xpEarned: 0 },
        { date: "Wed", lessonsCompleted: 0, xpEarned: 0 },
        { date: "Thu", lessonsCompleted: 0, xpEarned: 0 },
        { date: "Fri", lessonsCompleted: 0, xpEarned: 0 },
        { date: "Sat", lessonsCompleted: 0, xpEarned: 0 },
        { date: "Sun", lessonsCompleted: 0, xpEarned: 0 },
      ],
      subjects: [],
      examHistory: [],
      weakAreas: [],
    };

    return NextResponse.json({ progress: progressData });
  } catch (error: any) {
    console.error("Error fetching public progress view:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
