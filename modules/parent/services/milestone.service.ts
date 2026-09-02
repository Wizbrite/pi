import { Milestone, type IMilestoneDocument, type MilestoneType, type IGift } from "../models/milestone.model";
import { ParentConnection } from "../models/parent-connection.model";
import { Notification } from "../models/notification.model";
import LessonProgress from "@/modules/course/models/lesson-progress.model";
import ExamAttempt from "@/modules/progress/models/exam-attempt.model";
import DailyActivity from "@/modules/progress/models/daily-activity.model";
import { Types } from "mongoose";

interface CreateMilestoneDto {
  parentId: string;
  studentId: string;
  title: string;
  description?: string;
  type: MilestoneType;
  targetValue: number;
  gift: IGift;
}

export class MilestoneService {
  async createMilestone(data: CreateMilestoneDto) {
    // Verify connection exists and is accepted
    const connection = await ParentConnection.findOne({
      parentId: data.parentId,
      studentId: data.studentId,
      status: "accepted",
    });

    if (!connection) {
      throw new Error("You must be connected to this student to set a milestone.");
    }

    const milestone = await Milestone.create({
      ...data,
      isUnlocked: false,
    });

    // Notify the student
    await Notification.create({
      userId: data.studentId,
      type: "general",
      title: "New Milestone Set! 🎯",
      message: `A new milestone "${data.title}" has been set for you. Achieve it to unlock a reward!`,
    });

    return milestone;
  }

  async getParentMilestones(parentId: string) {
    return Milestone.find({ parentId })
      .populate("studentId", "name fullName email")
      .sort({ createdAt: -1 });
  }

  async getStudentMilestones(studentId: string) {
    const milestones = await Milestone.find({ studentId })
      .populate("parentId", "name fullName email")
      .sort({ createdAt: -1 })
      .lean();

    // Compute live currentValue for each milestone based on real student stats
    const userObjectId = new Types.ObjectId(studentId);
    const [lessonXpResult, examXpResult, lessonsCompleted, accuracyResult, activities] = await Promise.all([
      LessonProgress.aggregate([{ $match: { userId: userObjectId } }, { $group: { _id: null, total: { $sum: "$xpEarned" } } }]),
      ExamAttempt.aggregate([{ $match: { userId: userObjectId } }, { $group: { _id: null, total: { $sum: "$xpEarned" } } }]),
      LessonProgress.countDocuments({ userId: userObjectId, completed: true }),
      LessonProgress.aggregate([{ $match: { userId: userObjectId, completed: true, totalQuestions: { $gt: 0 } } }, { $group: { _id: null, totalCorrect: { $sum: "$score" }, totalQuestions: { $sum: "$totalQuestions" } } }]),
      DailyActivity.find({ userId: userObjectId }).sort({ date: -1 }).select("date").limit(90).lean(),
    ]);

    const totalXp = (lessonXpResult[0]?.total || 0) + (examXpResult[0]?.total || 0);
    const overallAccuracy = accuracyResult[0]?.totalQuestions > 0
      ? Math.round((accuracyResult[0].totalCorrect / accuracyResult[0].totalQuestions) * 100)
      : 0;

    // Calculate streak
    let currentStreak = 0;
    if (activities.length > 0) {
      const today = new Date(); today.setHours(0,0,0,0);
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
      const dates = activities.map(a => { const d = new Date(a.date); d.setHours(0,0,0,0); return d.getTime(); });
      if (dates[0] === today.getTime() || dates[0] === yesterday.getTime()) {
        currentStreak = 1;
        for (let i = 1; i < dates.length; i++) {
          if ((dates[i-1] - dates[i]) / 86400000 === 1) currentStreak++;
          else break;
        }
      }
    }

    // Get best exam score
    const bestExam = await ExamAttempt.findOne({ userId: userObjectId }).sort({ score: -1 }).lean();
    const bestExamPercent = bestExam ? Math.round((bestExam.score / bestExam.totalMarks) * 100) : 0;

    const valueMap: Record<MilestoneType, number> = {
      xp: totalXp,
      lessons_completed: lessonsCompleted,
      accuracy: overallAccuracy,
      streak: currentStreak,
      exam_score: bestExamPercent,
    };

    return milestones.map((m: any) => ({
      ...m,
      currentValue: valueMap[m.type as MilestoneType] || 0,
    }));
  }

  async checkAndUnlockMilestone(studentId: string, type: MilestoneType, currentValue: number) {
    // Find all locked milestones of this type for this student
    const lockedMilestones = await Milestone.find({
      studentId,
      type,
      isUnlocked: false,
      targetValue: { $lte: currentValue },
    });

    for (const milestone of lockedMilestones) {
      milestone.isUnlocked = true;
      milestone.unlockedAt = new Date();
      await milestone.save();

      // Notify the student
      await Notification.create({
        userId: studentId,
        type: "milestone_unlocked",
        title: "🎉 Milestone Unlocked!",
        message: `You've reached your goal: "${milestone.title}". Your reward is waiting!`,
        meta: { milestoneId: milestone._id.toString() },
      });

      // Notify the parent
      await Notification.create({
        userId: milestone.parentId,
        type: "milestone_unlocked",
        title: "Milestone Reached! 🎉",
        message: `Your child has achieved the "${milestone.title}" milestone.`,
      });
    }

    return lockedMilestones;
  }
  
  async deleteMilestone(milestoneId: string, parentId: string) {
    const milestone = await Milestone.findOneAndDelete({ _id: milestoneId, parentId });
    if (!milestone) {
        throw new Error("Milestone not found or you don't have permission to delete it.");
    }
    return milestone;
  }
}

export const milestoneService = new MilestoneService();
export default milestoneService;
