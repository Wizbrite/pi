import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Course from "@/modules/course/models/course.model";
import Lesson from "@/modules/course/models/lesson.model";
import { getUserId } from "@/lib/auth/get-user";
import LessonProgress from "@/modules/course/models/lesson-progress.model";
import mongoose from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.id;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ success: false, message: "Invalid course ID" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Fetch course details
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    }

    // Fetch all lessons for this course
    const lessons = await Lesson.find({ courseId }).sort({ order: 1 });

    // Try to get user progress if logged in
    const userId = await getUserId();
    let progress: any[] = [];
    if (userId) {
      progress = await LessonProgress.find({ 
        courseId, 
        userId: new mongoose.Types.ObjectId(userId) 
      });
    }

    // Format the response to map progress to lessons
    const progressMap = new Map(progress.map((p) => [p.lessonId.toString(), p]));
    
    const formattedLessons = lessons.map((lesson) => ({
      _id: lesson._id,
      topicId: lesson.topicId,
      title: lesson.title,
      order: lesson.order,
      isCompleted: progressMap.has(lesson._id.toString()) ? progressMap.get(lesson._id.toString()).completed : false,
    }));

    return NextResponse.json({
      success: true,
      data: {
        course,
        lessons: formattedLessons,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/courses/[id]] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch course details" },
      { status: 500 }
    );
  }
}
