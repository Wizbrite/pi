import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEnrollment {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  enrolledAt: Date;
}

export interface IEnrollmentDocument extends IEnrollment, Document {}

const enrollmentSchema = new Schema<IEnrollmentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    enrolledAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Enrollment: Model<IEnrollmentDocument> =
  mongoose.models.Enrollment || mongoose.model<IEnrollmentDocument>("Enrollment", enrollmentSchema);

export default Enrollment;
