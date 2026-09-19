import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Enrollment from "@/modules/course/models/enrollment.model";
import { getUserId } from "@/lib/auth/get-user";

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const enrollments = await Enrollment.find({ userId }).lean();
    const enrolledCourseIds = enrollments.map((e: any) => e.courseId);
    return NextResponse.json({ success: true, enrolledCourseIds });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { courseId } = await request.json();
    const existing = await Enrollment.findOne({ userId, courseId });
    if (existing) return NextResponse.json({ success: false, message: "Already enrolled" }, { status: 409 });
    await Enrollment.create({ userId, courseId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
