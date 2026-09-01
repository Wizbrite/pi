import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISkillAnswer {
  questionId: string;
  isCorrect: boolean;
  isMcq: boolean;
  answeredAt: Date;
}

export interface ISkillMastery {
  skillId: string;
  courseId: string;
  topicTitle: string;
  masteryLevel: number;
  totalAttempts: number;
  correctAttempts: number;
  lastPracticedAt?: Date;
  firstPracticedAt?: Date;
  recentAnswers: ISkillAnswer[];
}

export interface ILearnerProfile {
  userId: Types.ObjectId;
  skills: ISkillMastery[];
  overallMastery: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILearnerProfileDocument extends ILearnerProfile, Document {
  _id: Types.ObjectId;
}

const skillAnswerSchema = new Schema<ISkillAnswer>(
  {
    questionId: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    isMcq: { type: Boolean, default: true },
    answeredAt: { type: Date, required: true },
  },
  { _id: false }
);

const skillMasterySchema = new Schema<ISkillMastery>(
  {
    skillId: { type: String, required: true, index: true },
    courseId: { type: String, required: true },
    topicTitle: { type: String, required: true },
    masteryLevel: { type: Number, default: 0, min: 0, max: 1 },
    totalAttempts: { type: Number, default: 0 },
    correctAttempts: { type: Number, default: 0 },
    lastPracticedAt: { type: Date },
    firstPracticedAt: { type: Date },
    recentAnswers: { type: [skillAnswerSchema], default: [] },
  },
  { _id: false }
);

const learnerProfileSchema = new Schema<ILearnerProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    skills: { type: [skillMasterySchema], default: [] },
    overallMastery: { type: Number, default: 0, min: 0, max: 1 },
  },
  { timestamps: true }
);

learnerProfileSchema.index({ userId: 1 });

const LearnerProfile =
  mongoose.models.LearnerProfile ||
  mongoose.model<ILearnerProfileDocument>("LearnerProfile", learnerProfileSchema);

export default LearnerProfile;