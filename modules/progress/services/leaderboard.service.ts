import { Types } from "mongoose";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/modules/auth/models/user.model";
import DailyActivity from "@/modules/progress/models/daily-activity.model";
import LessonProgress from "@/modules/course/models/lesson-progress.model";
import ExamAttempt from "@/modules/progress/models/exam-attempt.model";
import Course from "@/modules/course/models/course.model";
import { StudentRank } from "@/lib/leaderboard-data";

export interface LeaderboardResponse {
  leaderboard: StudentRank[];
  currentUserRank: StudentRank | null;
}

export class LeaderboardService {
  async getLeaderboard(
    currentUserId?: string | null,
    timeframe: string = "All Time",
    subject: string = "Global"
  ): Promise<LeaderboardResponse> {
    await connectToDatabase();

    // Determine date filter for timeframe
    let dateFilter: Date | null = null;
    const now = new Date();

    if (timeframe === "This Week") {
      dateFilter = new Date();
      dateFilter.setDate(now.getDate() - 7);
      dateFilter.setHours(0, 0, 0, 0);
    } else if (timeframe === "This Month") {
      dateFilter = new Date();
      dateFilter.setDate(now.getDate() - 30);
      dateFilter.setHours(0, 0, 0, 0);
    }

    // Map to store userId -> total XP
    const userXpMap = new Map<string, number>();

    if (subject === "Global") {
      // Query DailyActivity aggregated XP
      const matchStage: any = {};
      if (dateFilter) {
        matchStage.date = { $gte: dateFilter };
      }

      const dailyXpResults = await DailyActivity.aggregate([
        { $match: matchStage },
        { $group: { _id: "$userId", totalXp: { $sum: "$xpEarned" } } },
      ]);

      for (const item of dailyXpResults) {
        if (item._id) {
          userXpMap.set(item._id.toString(), item.totalXp || 0);
        }
      }
    } else {
      // Subject specific XP calculation: search Courses matching subject
      const courses = await Course.find({
        subject: { $regex: new RegExp(subject, "i") },
      })
        .select("_id")
        .lean();

      const courseIds = courses.map((c) => c._id);

      // Lesson XP for this subject
      const lessonMatch: any = { courseId: { $in: courseIds } };
      if (dateFilter) {
        lessonMatch.updatedAt = { $gte: dateFilter };
      }

      const lessonXpResults = await LessonProgress.aggregate([
        { $match: lessonMatch },
        { $group: { _id: "$userId", totalXp: { $sum: "$xpEarned" } } },
      ]);

      for (const item of lessonXpResults) {
        if (item._id) {
          const uid = item._id.toString();
          userXpMap.set(uid, (userXpMap.get(uid) || 0) + (item.totalXp || 0));
        }
      }

      // Exam XP for this subject
      const examMatch: any = {
        $or: [
          { subjectId: { $in: courseIds } },
          { paperTitle: { $regex: new RegExp(subject, "i") } },
        ],
      };
      if (dateFilter) {
        examMatch.completedAt = { $gte: dateFilter };
      }

      const examXpResults = await ExamAttempt.aggregate([
        { $match: examMatch },
        { $group: { _id: "$userId", totalXp: { $sum: "$xpEarned" } } },
      ]);

      for (const item of examXpResults) {
        if (item._id) {
          const uid = item._id.toString();
          userXpMap.set(uid, (userXpMap.get(uid) || 0) + (item.totalXp || 0));
        }
      }
    }

    // Fetch all real student users from database strictly
    const students = await User.find({ role: "student" }).lean();

    // Map real DB students to StudentRank
    const realStudentRanks: StudentRank[] = students.map((s) => {
      const uid = s._id.toString();
      const xp = userXpMap.get(uid) || 0;
      const level: "Advanced" | "Ordinary" =
        s.gceLevel === "Advanced" ? "Advanced" : "Ordinary";

      const badges: string[] = [];
      if (xp >= 15000) badges.push("Grandmaster", "Scholar");
      else if (xp >= 10000) badges.push("Scholar", "Quiz Master");
      else if (xp >= 5000) badges.push("Quiz Master", "Consistent");
      else if (xp >= 2000) badges.push("Consistent");
      else if (xp >= 500) badges.push("Rising Star");
      else badges.push("Novice");

      return {
        id: uid,
        name: s.fullName || s.name || s.email.split("@")[0],
        rank: 0, // Assigned after sorting
        xp,
        level,
        badges,
      };
    });

    // Sort strictly by XP descending
    realStudentRanks.sort((a, b) => b.xp - a.xp);

    // Assign sequential ranks (1, 2, 3...)
    const leaderboard = realStudentRanks.map((s, index) => ({
      ...s,
      rank: index + 1,
    }));

    // Find current authenticated user rank
    let currentUserRank: StudentRank | null = null;
    if (currentUserId) {
      currentUserRank = leaderboard.find((s) => s.id === currentUserId) || null;

      if (!currentUserRank) {
        const dbUser = await User.findById(currentUserId).lean();
        if (dbUser) {
          const uName = (dbUser.fullName || dbUser.name || "").toLowerCase();
          currentUserRank =
            leaderboard.find((s) => s.name.toLowerCase() === uName) || null;
        }
      }
    }

    return {
      leaderboard,
      currentUserRank,
    };
  }
}

export const leaderboardService = new LeaderboardService();
export default leaderboardService;
