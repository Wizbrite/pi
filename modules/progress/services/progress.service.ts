import { Types } from "mongoose";
import connectToDatabase from "@/lib/db/mongodb";
import LessonProgress from "@/modules/course/models/lesson-progress.model";
import DailyActivity from "../models/daily-activity.model";
import ExamAttempt from "../models/exam-attempt.model";
import Course from "@/modules/course/models/course.model";
import Lesson from "@/modules/course/models/lesson.model";
import type {
  ProgressData,
  OverallStats,
  DailyActivity as DailyActivityType,
  SubjectProgress,
  TopicProgress,
  LessonProgress as LessonProgressType,
  ExamHistory,
  WeakArea,
} from "@/lib/types/progress";

export class ProgressService {
  /**
   * Main entry point — returns all data the progress page needs
   */
  async getFullProgress(userId: string): Promise<ProgressData> {
    await connectToDatabase();
    const userObjectId = new Types.ObjectId(userId);

    const [overall, weeklyActivity, subjects, examHistory, weakAreas] =
      await Promise.all([
        this.getOverallStats(userObjectId),
        this.getWeeklyActivity(userObjectId),
        this.getSubjectProgress(userObjectId),
        this.getExamHistory(userObjectId),
        this.getWeakAreas(userObjectId),
      ]);

    return {
      overall,
      weeklyActivity,
      subjects,
      examHistory,
      weakAreas,
      questionTypeStats: [], // Requires per-question type tracking — future enhancement
    };
  }

  // ─── OVERALL STATS ────────────────────────────────────────────────────

  private async getOverallStats(userId: Types.ObjectId): Promise<OverallStats> {
    const [
      lessonXpResult,
      examXpResult,
      lessonsCompleted,
      examsTaken,
      accuracyResult,
      timeResult,
      courseIds,
      streakData,
    ] = await Promise.all([
      // Total XP from lessons
      LessonProgress.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: "$xpEarned" } } },
      ]),
      // Total XP from exams
      ExamAttempt.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: "$xpEarned" } } },
      ]),
      // Lessons completed count
      LessonProgress.countDocuments({ userId, completed: true }),
      // Exams taken count
      ExamAttempt.countDocuments({ userId }),
      // Overall accuracy (weighted by question count)
      LessonProgress.aggregate([
        {
          $match: { userId, completed: true, totalQuestions: { $gt: 0 } },
        },
        {
          $group: {
            _id: null,
            totalCorrect: { $sum: "$score" },
            totalQuestions: { $sum: "$totalQuestions" },
          },
        },
      ]),
      // Total time from lessons
      LessonProgress.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: "$timeSpentSeconds" } } },
      ]),
      // Distinct subjects
      LessonProgress.distinct("courseId", { userId }),
      // Streak calculation
      this.calculateStreak(userId),
    ]);

    const lessonXp = lessonXpResult[0]?.total || 0;
    const examXp = examXpResult[0]?.total || 0;
    const totalCorrect = accuracyResult[0]?.totalCorrect || 0;
    const totalQuestions = accuracyResult[0]?.totalQuestions || 0;
    const totalTimeSeconds = timeResult[0]?.total || 0;

    // Also add exam time
    const examTimeResult = await ExamAttempt.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: "$timeSpentSeconds" } } },
    ]);
    const examTimeSeconds = examTimeResult[0]?.total || 0;

    return {
      totalXp: lessonXp + examXp,
      currentStreak: streakData.current,
      longestStreak: streakData.longest,
      totalTimeSpentMinutes: Math.round((totalTimeSeconds + examTimeSeconds) / 60),
      totalLessonsCompleted: lessonsCompleted,
      totalExamsTaken: examsTaken,
      overallAccuracy:
        totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      subjectsEnrolled: courseIds.length,
    };
  }

  // ─── STREAK CALCULATION ───────────────────────────────────────────────

  private async calculateStreak(
    userId: Types.ObjectId
  ): Promise<{ current: number; longest: number }> {
    const activities = await DailyActivity.find({ userId })
      .sort({ date: -1 })
      .select("date")
      .limit(90)
      .lean();

    if (activities.length === 0) return { current: 0, longest: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dates = activities.map((a) => {
      const d = new Date(a.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });

    // Calculate current streak
    let currentStreak = 0;
    const firstDate = dates[0];

    if (firstDate === today.getTime() || firstDate === yesterday.getTime()) {
      currentStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const diff = (dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 1;
    let tempStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = (dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    return {
      current: currentStreak,
      longest: Math.max(longestStreak, currentStreak),
    };
  }

  // ─── WEEKLY ACTIVITY ──────────────────────────────────────────────────

  private async getWeeklyActivity(
    userId: Types.ObjectId
  ): Promise<DailyActivityType[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const activities = await DailyActivity.find({
      userId,
      date: { $gte: sevenDaysAgo },
    })
      .sort({ date: 1 })
      .lean();

    // Fill in missing days with zeros
    const result: DailyActivityType[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sevenDaysAgo);
      day.setDate(day.getDate() + i);
      day.setHours(0, 0, 0, 0);

      const found = activities.find((a) => {
        const aDate = new Date(a.date);
        aDate.setHours(0, 0, 0, 0);
        return aDate.getTime() === day.getTime();
      });

      result.push({
        date: day.toISOString().split("T")[0],
        lessonsCompleted: found?.lessonsCompleted || 0,
        examsTaken: found?.examsTaken || 0,
        timeSpentMinutes: found?.timeSpentMinutes || 0,
        xpEarned: found?.xpEarned || 0,
      });
    }

    return result;
  }

  // ─── SUBJECT PROGRESS ─────────────────────────────────────────────────

  private async getSubjectProgress(
    userId: Types.ObjectId
  ): Promise<SubjectProgress[]> {
    // Get all course IDs this user has progress in
    const courseIds = await LessonProgress.distinct("courseId", { userId });
    if (courseIds.length === 0) return [];

    // Fetch courses, lessons, and progress in parallel
    const [courses, lessons, progresses] = await Promise.all([
      Course.find({ _id: { $in: courseIds } }).lean(),
      Lesson.find({ courseId: { $in: courseIds } }).sort({ order: 1 }).lean(),
      LessonProgress.find({ userId, courseId: { $in: courseIds } }).lean(),
    ]);

    // Build lookup maps
    const progressMap = new Map<string, any>();
    for (const p of progresses) {
      progressMap.set(p.lessonId.toString(), p);
    }

    const lessonsByTopic = new Map<string, any[]>();
    for (const l of lessons) {
      const key = l.topicId.toString();
      if (!lessonsByTopic.has(key)) lessonsByTopic.set(key, []);
      lessonsByTopic.get(key)!.push(l);
    }

    return courses.map((course) => {
      const courseLessons = lessons.filter(
        (l) => l.courseId.toString() === course._id.toString()
      );
      const courseProgresses = progresses.filter(
        (p) => p.courseId.toString() === course._id.toString()
      );

      const completedCount = courseProgresses.filter((p) => p.completed).length;
      const totalLessons = courseLessons.length;

      let totalTimeSpentMinutes = 0;
      let totalScore = 0;
      let totalQuestions = 0;
      let totalXp = 0;

      for (const p of courseProgresses) {
        totalTimeSpentMinutes += p.timeSpentSeconds || 0;
        totalScore += p.score || 0;
        totalQuestions += p.totalQuestions || 0;
        totalXp += p.xpEarned || 0;
      }

      const topics: TopicProgress[] = (course.topics || []).map((topic: any) => {
        const topicLessons = lessonsByTopic.get(topic._id.toString()) || [];
        const topicLessonProgresses = topicLessons.map(
          (l) => progressMap.get(l._id.toString()) || null
        );

        const topicCompleted = topicLessonProgresses.filter((p) => p?.completed).length;
        const topicTotal = topicLessons.length;

        let topicTime = 0;
        let topicScore = 0;
        let topicQuestions = 0;
        let topicXp = 0;

        const lessonProgressItems: LessonProgressType[] = topicLessons.map((l) => {
          const p = progressMap.get(l._id.toString());
          if (p) {
            topicTime += p.timeSpentSeconds || 0;
            topicScore += p.score || 0;
            topicQuestions += p.totalQuestions || 0;
            topicXp += p.xpEarned || 0;
          }
          return {
            lessonId: l._id.toString(),
            title: l.title,
            order: l.order,
            completed: p?.completed || false,
            score: p?.score || 0,
            totalQuestions: p?.totalQuestions || 0,
            accuracy: p?.accuracy || 0,
            timeSpentSeconds: p?.timeSpentSeconds || 0,
            attempts: p?.attempts || 0,
            xpEarned: p?.xpEarned || 0,
            masteryLevel: p?.masteryLevel || 0,
            lastAttemptedAt: p?.lastAttemptedAt?.toISOString(),
          };
        });

        const topicMastery =
          topicTotal > 0
            ? Math.round(
                topicLessonProgresses.reduce(
                  (sum, p) => sum + (p?.masteryLevel || 0),
                  0
                ) / topicTotal
              )
            : 0;

        return {
          topicId: topic._id.toString(),
          title: topic.title,
          description: topic.description,
          order: topic.order,
          lessons: lessonProgressItems,
          completedCount: topicCompleted,
          totalLessons: topicTotal,
          masteryLevel: topicMastery,
          timeSpentMinutes: Math.round(topicTime / 60),
        };
      });

      const overallMastery =
        totalLessons > 0
          ? Math.round(
              courseProgresses.reduce(
                (sum, p) => sum + (p.masteryLevel || 0),
                0
              ) / totalLessons
            )
          : 0;

      const lastActivity = courseProgresses
        .filter((p) => p.lastAttemptedAt)
        .sort(
          (a, b) =>
            new Date(b.lastAttemptedAt!).getTime() -
            new Date(a.lastAttemptedAt!).getTime()
        )[0];

      return {
        courseId: course._id.toString(),
        title: course.title,
        level: course.level as "O-Level" | "A-Level",
        subject: course.subject,
        topics,
        completedLessons: completedCount,
        totalLessons,
        overallMastery,
        totalTimeSpentMinutes: Math.round(totalTimeSpentMinutes / 60),
        averageAccuracy:
          totalQuestions > 0
            ? Math.round((totalScore / totalQuestions) * 100)
            : 0,
        lastActivityAt: lastActivity?.lastAttemptedAt?.toISOString(),
      };
    });
  }

  // ─── EXAM HISTORY ─────────────────────────────────────────────────────

  private async getExamHistory(
    userId: Types.ObjectId
  ): Promise<ExamHistory[]> {
    const attempts = await ExamAttempt.find({ userId })
      .sort({ completedAt: -1 })
      .lean();

    return attempts.map((a) => {
      const correctCount = a.questions.filter((q: any) => q.isCorrect).length;
      const incorrectCount = a.questions.length - correctCount;
      const percentage =
        a.totalMarks > 0
          ? Math.round((a.score / a.totalMarks) * 100)
          : 0;

      return {
        attemptId: a._id.toString(),
        paperTitle: a.paperTitle,
        subjectId: a.subjectId,
        score: a.score,
        totalMarks: a.totalMarks,
        percentage,
        timeSpentSeconds: a.timeSpentSeconds,
        completedAt: a.completedAt.toISOString(),
        correctCount,
        incorrectCount,
      };
    });
  }

  // ─── WEAK AREAS ───────────────────────────────────────────────────────

  private async getWeakAreas(
    userId: Types.ObjectId
  ): Promise<WeakArea[]> {
    // Aggregate lesson accuracy by topicId via lesson lookup
    const topicAccuracy = await LessonProgress.aggregate([
      {
        $match: {
          userId,
          completed: true,
          totalQuestions: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: "lessons",
          localField: "lessonId",
          foreignField: "_id",
          as: "lesson",
        },
      },
      { $unwind: "$lesson" },
      {
        $group: {
          _id: "$lesson.topicId",
          accuracy: { $avg: "$accuracy" },
          totalAttempts: { $sum: "$attempts" },
          lessonCount: { $sum: 1 },
          courseId: { $first: "$courseId" },
        },
      },
      {
        $match: { accuracy: { $lt: 80 } },
      },
      { $sort: { accuracy: 1 } },
      { $limit: 10 },
    ]);

    if (topicAccuracy.length === 0) return [];

    // Get topic titles from courses
    const courseIds = [
      ...new Set(topicAccuracy.map((t) => t.courseId.toString())),
    ];
    const courses = await Course.find({ _id: { $in: courseIds } }).lean();

    const topicTitleMap = new Map<string, { title: string; courseTitle: string }>();
    for (const course of courses) {
      for (const topic of course.topics || []) {
        topicTitleMap.set(topic._id.toString(), {
          title: topic.title,
          courseTitle: course.subject,
        });
      }
    }

    return topicAccuracy
      .map((t) => {
        const info = topicTitleMap.get(t._id.toString());
        if (!info) return null;
        return {
          topicId: t._id.toString(),
          topicTitle: info.title,
          courseId: t.courseId.toString(),
          courseTitle: info.courseTitle,
          accuracy: Math.round(t.accuracy),
          totalAttempts: t.totalAttempts,
          lessonCount: t.lessonCount,
        };
      })
      .filter(Boolean) as WeakArea[];
  }
}

export const progressService = new ProgressService();
export default progressService;