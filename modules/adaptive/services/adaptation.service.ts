import { Types } from "mongoose";
import connectToDatabase from "@/lib/db/mongodb";
import LearnerProfile from "@/modules/adaptive/models/learner-profile.model";
import Question from "@/modules/course/models/question.model";
import Lesson from "@/modules/course/models/lesson.model";
import Course from "@/modules/course/models/course.model";
import LessonProgress from "@/modules/course/models/lesson-progress.model";
import { BktService } from "./bkt.service";
import type {
  BatchRecordAnswerInput,
  RecordAnswerInput,
  RecordAnswerResult,
  BatchRecordAnswerResult,
  NextStep,
  WeakAreaItem,
} from "@/lib/types/adaptive";

interface SkillMasteryDoc {
  skillId: string;
  courseId: string;
  topicTitle: string;
  masteryLevel: number;
  totalAttempts: number;
  correctAttempts: number;
  lastPracticedAt?: Date;
  firstPracticedAt?: Date;
  recentAnswers: { questionId: string; isCorrect: boolean; isMcq: boolean; answeredAt: Date }[];
}

interface ProfileDoc {
  userId: Types.ObjectId;
  skills: SkillMasteryDoc[];
  overallMastery: number;
  save(): Promise<ProfileDoc>;
}

interface CourseDoc {
  _id: Types.ObjectId;
  subject: string;
  topics: {
    _id: Types.ObjectId;
    title: string;
    order: number;
    difficulty?: string;
    prerequisites?: Types.ObjectId[];
  }[];
}

interface LessonDoc {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  topicId: Types.ObjectId;
  title: string;
  order: number;
}

interface QuestionDoc {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  lessonId: Types.ObjectId;
  topicId?: Types.ObjectId;
  options: string[];
  questionText: string;
  correctAnswer: string;
  explanation: string;
}

export class AdaptationService {
  async recordAnswer(
    userId: string,
    input: RecordAnswerInput
  ): Promise<RecordAnswerResult> {
    await connectToDatabase();
    const userObjectId = new Types.ObjectId(userId);

    const question = await Question.findById(input.questionId) as QuestionDoc | null;
    if (!question) throw new Error("Question not found");

    const topicId = question.topicId?.toString() || question.lessonId.toString();
    const isMcq = input.isMcq ?? (question.options?.length > 0);

    const lesson = await Lesson.findById(question.lessonId) as LessonDoc | null;
    let topicTitle = "Unknown Topic";
    const courseId = question.courseId.toString();

    if (lesson) {
      const course = await Course.findById(lesson.courseId) as CourseDoc | null;
      if (course) {
        const topic = course.topics?.find(
          (t) => t._id.toString() === topicId
        );
        if (topic) topicTitle = topic.title;
      }
    }

    let profile = await LearnerProfile.findOne({ userId: userObjectId }) as ProfileDoc | null;
    if (!profile) {
      profile = await LearnerProfile.create({
        userId: userObjectId,
        skills: [],
        overallMastery: 0,
      }) as ProfileDoc;
    }

    let skill = profile.skills.find((s: SkillMasteryDoc) => s.skillId === topicId);
    const previousMastery = skill?.masteryLevel ?? 0;

    if (!skill) {
      skill = {
        skillId: topicId,
        courseId,
        topicTitle,
        masteryLevel: 0.25,
        totalAttempts: 0,
        correctAttempts: 0,
        recentAnswers: [],
      };
      profile.skills.push(skill);
    }

    const newMastery = new BktService().updateMastery(
      skill.masteryLevel,
      input.isCorrect,
      isMcq
    );

    skill.masteryLevel = Math.round(newMastery * 1000) / 1000;
    skill.totalAttempts += 1;
    if (input.isCorrect) skill.correctAttempts += 1;
    skill.lastPracticedAt = new Date();
    if (!skill.firstPracticedAt) skill.firstPracticedAt = new Date();

    skill.recentAnswers.push({
      questionId: input.questionId,
      isCorrect: input.isCorrect,
      isMcq,
      answeredAt: new Date(),
    });
    if (skill.recentAnswers.length > BktService.maxRecentAnswers) {
      skill.recentAnswers = skill.recentAnswers.slice(-BktService.maxRecentAnswers);
    }

    await this.recalculateOverallMastery(profile);
    await profile.save();

    return {
      skillId: topicId,
      topicTitle,
      previousMastery,
      newMastery: skill.masteryLevel,
      change: Math.round((skill.masteryLevel - previousMastery) * 1000) / 1000,
    };
  }

  async batchRecordAnswer(
    userId: string,
    input: BatchRecordAnswerInput
  ): Promise<BatchRecordAnswerResult> {
    const results: RecordAnswerResult[] = [];

    for (const answer of input.answers) {
      try {
        const result = await this.recordAnswer(userId, answer);
        results.push(result);
      } catch (err) {
        console.error(`Failed to record answer for question ${answer.questionId}:`, err);
      }
    }

    const profile = await LearnerProfile.findOne({
      userId: new Types.ObjectId(userId),
    }) as ProfileDoc | null;

    return {
      results,
      overallMastery: profile?.overallMastery ?? 0,
    };
  }

  async getNextSteps(userId: string, limit: number = 5): Promise<NextStep[]> {
    await connectToDatabase();
    const userObjectId = new Types.ObjectId(userId);

    const enrolledCourseIds = await LessonProgress.distinct("courseId", {
      userId: userObjectId,
    });
    if (enrolledCourseIds.length === 0) return [];

    const courses = await Course.find({
      _id: { $in: enrolledCourseIds },
    }).lean() as CourseDoc[];

    const profile = await LearnerProfile.findOne({ userId: userObjectId }).lean() as ProfileDoc | null;
    const skillMap = new Map<string, SkillMasteryDoc>();
    if (profile) {
      for (const skill of profile.skills) {
        skillMap.set(skill.skillId, skill);
      }
    }

    const candidates: NextStep[] = [];
    const masteredThreshold = 0.85;
    const notStartedThreshold = 0.05;

    for (const course of courses) {
      const topics = course.topics || [];

      for (const topic of topics) {
        const topicId = topic._id.toString();
        const skill = skillMap.get(topicId);
        const mastery = skill?.masteryLevel ?? 0;

        if (mastery >= masteredThreshold) continue;

        const prereqs = topic.prerequisites || [];
        const effectivePrereqs =
          prereqs.length > 0
            ? prereqs.map((p: Types.ObjectId) => p.toString())
            : topics
                .filter((t: { order: number }) => t.order < topic.order)
                .map((t: { _id: Types.ObjectId }) => t._id.toString());

        const prereqsMet = effectivePrereqs.every(
          (pid: string) => (skillMap.get(pid)?.masteryLevel ?? 0) > 0.5
        );

        if (!prereqsMet) continue;

        let priority = 0;

        if (mastery < notStartedThreshold) {
          priority += 50;
        }
        priority += (1 - mastery) * 30;
        priority += Math.max(0, 10 - topic.order);
        if (skill?.lastPracticedAt) {
          const daysSince = (Date.now() - skill.lastPracticedAt.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince > 3) priority += 5;
        } else {
          priority += 3;
        }

        let type: NextStep["type"];
        let reason: string;
        const difficulty = topic.difficulty || "beginner";

        if (mastery < notStartedThreshold) {
          type = "lesson";
          reason = `Start learning this topic — it's ready and you haven't begun`;
        } else if (mastery < 0.5) {
          type = "lesson";
          reason = `Low mastery (${Math.round(mastery * 100)}%) — review the lesson first`;
        } else if (mastery < 0.7) {
          type = "quiz";
          reason = `Building proficiency (${Math.round(mastery * 100)}%) — practice with the mastery quiz`;
        } else if (mastery < masteredThreshold) {
          type = "review";
          reason = `Almost mastered (${Math.round(mastery * 100)}%) — a few more correct answers will lock it in`;
        } else {
          continue;
        }

        const firstLesson = await Lesson.findOne(
          { courseId: course._id, topicId: topic._id },
          { sort: { order: 1 } }
        ).lean();

        candidates.push({
          type,
          courseId: course._id.toString(),
          courseTitle: course.subject,
          topicId,
          topicTitle: topic.title,
          lessonId: firstLesson?._id?.toString(),
          lessonTitle: (firstLesson as LessonDoc | null)?.title,
          reason,
          currentMastery: Math.round(mastery * 100),
          difficulty,
          priority: Math.round(priority * 10) / 10,
        });
      }
    }

    candidates.sort((a, b) => b.priority - a.priority);
    return candidates.slice(0, limit);
  }

  async getWeakAreas(userId: string, limit: number = 10): Promise<WeakAreaItem[]> {
    await connectToDatabase();
    const userObjectId = new Types.ObjectId(userId);

    const profile = await LearnerProfile.findOne({ userId: userObjectId }).lean() as ProfileDoc | null;
    if (!profile || profile.skills.length === 0) return [];

    const courseIds = [...new Set(profile.skills.map((s: SkillMasteryDoc) => s.courseId))];
    const courses = await Course.find({ _id: { $in: courseIds } }).lean() as CourseDoc[];

    const courseMap = new Map<string, CourseDoc>();
    for (const course of courses) {
      courseMap.set(course._id.toString(), course);
    }

    const weakSkills = profile.skills
      .filter((s: SkillMasteryDoc) => s.totalAttempts > 0 && s.masteryLevel < 0.8)
      .sort((a: SkillMasteryDoc, b: SkillMasteryDoc) => a.masteryLevel - b.masteryLevel)
      .slice(0, limit);

    return weakSkills.map((skill: SkillMasteryDoc) => {
      const course = courseMap.get(skill.courseId);
      const accuracy =
        skill.totalAttempts > 0
          ? Math.round((skill.correctAttempts / skill.totalAttempts) * 100)
          : 0;

      let suggestedAction: string;
      if (skill.masteryLevel < 0.3) {
        suggestedAction = "Re-read the lesson content before attempting more questions";
      } else if (skill.masteryLevel < 0.6) {
        suggestedAction = "Practice the mastery quiz again, focusing on areas you got wrong";
      } else {
        suggestedAction = "Almost there — a few more correct answers will boost your mastery";
      }

      return {
        skillId: skill.skillId,
        topicTitle: skill.topicTitle,
        courseId: skill.courseId,
        courseTitle: course?.subject || "Unknown",
        mastery: Math.round(skill.masteryLevel * 100),
        totalAttempts: skill.totalAttempts,
        accuracy,
        lastPracticedAt: skill.lastPracticedAt?.toISOString(),
        suggestedAction,
      };
    });
  }

  private async recalculateOverallMastery(profile: ProfileDoc): Promise<void> {
    const enrolledCourseIds = await LessonProgress.distinct("courseId", {
      userId: profile.userId,
    });

    const courses = await Course.find({
      _id: { $in: enrolledCourseIds },
    }).lean() as CourseDoc[];

    let totalSkills = 0;
    let totalMastery = 0;

    for (const course of courses) {
      const topics = course.topics || [];
      for (const topic of topics) {
        totalSkills += 1;
        const skill = profile.skills.find(
          (s: SkillMasteryDoc) => s.skillId === topic._id.toString()
        );
        totalMastery += skill?.masteryLevel ?? 0;
      }
    }

    profile.overallMastery =
      totalSkills > 0 ? Math.round((totalMastery / totalSkills) * 1000) / 1000 : 0;
  }
}

export const adaptationService = new AdaptationService();
export default adaptationService;