import { Milestone, type IMilestoneDocument, type MilestoneType, type IGift } from "../models/milestone.model";
import { ParentConnection } from "../models/parent-connection.model";
import { Notification } from "../models/notification.model";
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
    return Milestone.find({ parentId }).sort({ createdAt: -1 });
  }

  async getStudentMilestones(studentId: string) {
    return Milestone.find({ studentId }).sort({ createdAt: -1 });
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
