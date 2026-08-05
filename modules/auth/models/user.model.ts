import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type UserRole = "student" | "teacher" | "parent" | "admin";
export type GceLevel = "Ordinary" | "Advanced";
export type TeacherApprovalStatus = "pending" | "approved" | "rejected";

export interface IUser {
  
  fullName: string;
  name?: string;
  email: string;
  passwordHash: string;
  password?: string;
  role: UserRole;
  gceLevel?: GceLevel;
  teacherApprovalStatus?: TeacherApprovalStatus;
  parentLinkCode?: string | null;
  children?: Types.ObjectId[];
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false,
    },
    password: {
      type: String,
      select: false,
      default: null,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "parent", "admin"],
      required: [true, "Role is required"],
    },
    gceLevel: {
      type: String,
      enum: ["Ordinary", "Advanced"],
      required: function (this: IUserDocument) {
        return this.role === "student";
      },
    },
    teacherApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function (this: IUserDocument) {
        return this.role === "teacher" ? "pending" : "approved";
      },
    },
    parentLinkCode: {
      type: String,
      sparse: true,
      default: undefined,
    },
    children: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
