import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Course from "@/modules/course/models/course.model";
import LessonProgress from "@/modules/course/models/lesson-progress.model";
import Lesson from "@/modules/course/models/lesson.model";
import { getUserId } from "@/lib/auth/get-user";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    const query: any = {};
    const level = searchParams.get("level");
    const subject = searchParams.get("subject");

    if (level) query.level = level;
    if (subject) query.subject = subject;

    let courses = await Course.find(query).sort({ createdAt: -1 }).lean();

    // Check if user is authenticated to attach progress
    let userId = null;
    try {
      userId = await getUserId();
    } catch {
      // Ignored
    }

    if (userId) {
      // Fetch all lessons and progress for these courses
      const courseIds = courses.map((c) => c._id);
      
      const [lessons, progresses] = await Promise.all([
        Lesson.find({ courseId: { $in: courseIds } }).lean(),
        LessonProgress.find({ userId, courseId: { $in: courseIds } }).lean(),
      ]);

      courses = courses.map((course) => {
        const courseLessons = lessons.filter(
          (l) => l.courseId.toString() === course._id.toString()
        );
        const courseProgresses = progresses.filter(
          (p) => p.courseId.toString() === course._id.toString()
        );

        const totalLessons = courseLessons.length;
        const completedLessons = courseProgresses.filter((p) => p.completed).length;

        // Calculate progress percentage
        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        // Calculate completed modules (topics where all lessons are completed)
        const lessonsByTopic = new Map<string, any[]>();
        for (const l of courseLessons) {
          const key = l.topicId.toString();
          if (!lessonsByTopic.has(key)) lessonsByTopic.set(key, []);
          lessonsByTopic.get(key)!.push(l);
        }

        let modulesCompleted = 0;
        let nextTopic = "N/A";
        
        for (const topic of course.topics || []) {
          const topicLessons = lessonsByTopic.get(topic._id.toString()) || [];
          if (topicLessons.length > 0) {
            const topicCompletedCount = topicLessons.filter((l) =>
              courseProgresses.find((p) => p.lessonId.toString() === l._id.toString() && p.completed)
            ).length;
            if (topicCompletedCount === topicLessons.length) {
              modulesCompleted++;
            } else if (nextTopic === "N/A") {
              nextTopic = topic.title;
            }
          } else if (nextTopic === "N/A") {
            nextTopic = topic.title;
          }
        }

        // If all modules are completed, or there are no topics, nextTopic will be N/A or Completed
        if (modulesCompleted === (course.topics?.length || 0) && modulesCompleted > 0) {
          nextTopic = "Course Completed 🎉";
        }

        return {
          ...course,
          progress: progressPercentage,
          modulesCompleted,
          nextTopic,
        };
      });
    }

    return NextResponse.json({ success: true, data: courses });
  } catch (error: any) {
    console.error("[GET /api/courses] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
