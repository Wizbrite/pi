import { Types } from "mongoose";
import connectToDatabase from "@/lib/db/mongodb";
import { TeacherConnection } from "../models/teacher-connection.model";
import { User } from "@/modules/auth/models/user.model";

export class TeacherConnectionService {
  /**
   * Teacher sends a connection request to a student by email
   */
  async sendTeacherRequest(teacherId: string, studentEmail: string, message?: string) {
    await connectToDatabase();

    const student = await User.findOne({
      email: studentEmail.toLowerCase().trim(),
      role: "student",
    });

    if (!student) {
      throw new Error("Student not found with this email address.");
    }

    const existing = await TeacherConnection.findOne({
      teacherId: new Types.ObjectId(teacherId),
      studentId: student._id,
    });

    if (existing) {
      if (existing.status === "accepted") {
        throw new Error("You are already connected to this student.");
      }
      if (existing.status === "pending") {
        throw new Error("A connection request is already pending with this student.");
      }
      // Re-open if previously rejected
      existing.status = "pending";
      existing.initiatedBy = "teacher";
      existing.message = message || "I would like to link with you as your teacher.";
      await existing.save();
      return existing;
    }

    return TeacherConnection.create({
      teacherId: new Types.ObjectId(teacherId),
      studentId: student._id,
      initiatedBy: "teacher",
      message: message || "I would like to link with you as your teacher.",
      status: "pending",
    });
  }

  /**
   * Student sends a connection request to a teacher by email
   */
  async sendStudentRequest(studentId: string, teacherEmail: string, message?: string) {
    await connectToDatabase();

    const teacher = await User.findOne({
      email: teacherEmail.toLowerCase().trim(),
      role: "teacher",
    });

    if (!teacher) {
      throw new Error("Teacher not found with this email address.");
    }

    const existing = await TeacherConnection.findOne({
      teacherId: teacher._id,
      studentId: new Types.ObjectId(studentId),
    });

    if (existing) {
      if (existing.status === "accepted") {
        throw new Error("You are already connected to this teacher.");
      }
      if (existing.status === "pending") {
        throw new Error("A connection request is already pending with this teacher.");
      }
      existing.status = "pending";
      existing.initiatedBy = "student";
      existing.message = message || "I would like to connect with you as my teacher.";
      await existing.save();
      return existing;
    }

    return TeacherConnection.create({
      teacherId: teacher._id,
      studentId: new Types.ObjectId(studentId),
      initiatedBy: "student",
      message: message || "I would like to connect with you as my teacher.",
      status: "pending",
    });
  }

  /**
   * Get all connected students & pending requests for a teacher
   */
  async getTeacherConnections(teacherId: string) {
    await connectToDatabase();
    return TeacherConnection.find({
      teacherId: new Types.ObjectId(teacherId),
    })
      .populate("studentId", "fullName name email gceLevel createdAt")
      .sort({ updatedAt: -1 })
      .lean();
  }

  /**
   * Get all connected teachers & pending requests for a student
   */
  async getStudentConnections(studentId: string) {
    await connectToDatabase();
    return TeacherConnection.find({
      studentId: new Types.ObjectId(studentId),
    })
      .populate("teacherId", "fullName name email gceLevel createdAt teacherApprovalStatus")
      .sort({ updatedAt: -1 })
      .lean();
  }

  /**
   * Respond to a connection request (accept or reject)
   */
  async respondToRequest(connectionId: string, userId: string, action: "accepted" | "rejected") {
    await connectToDatabase();

    const conn = await TeacherConnection.findById(connectionId);
    if (!conn) {
      throw new Error("Connection request not found.");
    }

    // Verify user is either the teacher or student in this connection
    const uId = userId.toString();
    const isTeacher = conn.teacherId.toString() === uId;
    const isStudent = conn.studentId.toString() === uId;

    if (!isTeacher && !isStudent) {
      throw new Error("Unauthorized to respond to this request.");
    }

    conn.status = action;
    await conn.save();
    return conn;
  }

  /**
   * Verify if teacher and student are accepted connected pair
   */
  async isConnected(teacherId: string, studentId: string): Promise<boolean> {
    await connectToDatabase();
    const conn = await TeacherConnection.findOne({
      teacherId: new Types.ObjectId(teacherId),
      studentId: new Types.ObjectId(studentId),
      status: "accepted",
    });
    return !!conn;
  }
}

export const teacherConnectionService = new TeacherConnectionService();
