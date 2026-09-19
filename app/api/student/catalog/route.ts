import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Course from "@/modules/course/models/course.model";
import Lesson from "@/modules/course/models/lesson.model";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const courses = await Course.find()
      .select("_id title subject level description topics createdAt")
      .sort({ createdAt: -1 })
      .lean();
    
    const courseIds = courses.map((c: any) => c._id);
    const lessons = await Lesson.find({ courseId: { $in: courseIds } }).lean();
    
    const data = courses.map((c: any) => {
      const lCount = lessons.filter((l: any) => l.courseId.toString() === c._id.toString()).length;
      const tCount = c.topics ? c.topics.length : 0;
      return {
        _id: c._id,
        title: c.title,
        subject: c.subject,
        level: c.level,
        description: c.description,
        topicsCount: tCount,
        lessonCount: lCount,
        createdAt: c.createdAt
      };
    });
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
