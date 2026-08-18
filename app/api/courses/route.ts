import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Course from "@/modules/course/models/course.model";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    const query: any = {};
    const level = searchParams.get("level");
    const subject = searchParams.get("subject");

    if (level) query.level = level;
    if (subject) query.subject = subject;

    const courses = await Course.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: courses });
  } catch (error: any) {
    console.error("[GET /api/courses] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
