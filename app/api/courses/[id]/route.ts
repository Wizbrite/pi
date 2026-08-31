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

//api endpoint for allowing admin to create a new course
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { title, level, subject, description, topics } = body;

    // Validate required fields based on schema
    if (!title || !level || !subject) {
      return NextResponse.json(
        { success: false, message: "Title, level, and subject are required." },
        { status: 400 }
      );
    }

    // Format and assign order indices to topics if provided
    const formattedTopics = Array.isArray(topics)
      ? topics.map((topic: { title: string; description?: string }, index: number) => ({
          title: topic.title,
          description: topic.description || "",
          order: index + 1,
        }))
      : [];

    const newCourse = await Course.create({
      title,
      level,
      subject,
      description,
      topics: formattedTopics,
    });

    return NextResponse.json(
      { success: true, data: newCourse, message: "Course created successfully!" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/courses] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}