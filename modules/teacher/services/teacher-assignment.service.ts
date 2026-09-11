import { Types } from "mongoose";
import connectToDatabase from "@/lib/db/mongodb";
import { TeacherAssignment, type AssignmentType } from "../models/teacher-assignment.model";
import { teacherConnectionService } from "./teacher-connection.service";

export class TeacherAssignmentService {
  /**
   * Teacher creates and sends an exercise, correction, or recommendation to a student
   */
  async createAssignment(data: {
    teacherId: string;
    studentId: string;
    type: AssignmentType;
    title: string;
    instructions: string;
    subjectTitle?: string;
    topicTitle?: string;
    dueDate?: string;
  }) {
    await connectToDatabase();

    // Verify teacher and student are connected
    const connected = await teacherConnectionService.isConnected(data.teacherId, data.studentId);
    if (!connected) {
      throw new Error("You must be connected to this student before sending exercises or corrections.");
    }

    return TeacherAssignment.create({
      teacherId: new Types.ObjectId(data.teacherId),
      studentId: new Types.ObjectId(data.studentId),
      type: data.type,
      title: data.title.trim(),
      instructions: data.instructions.trim(),
      subjectTitle: data.subjectTitle?.trim(),
      topicTitle: data.topicTitle?.trim(),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      status: "assigned",
    });
  }

  /**
   * Get assignments for a teacher (optional filter by studentId)
   */
  async getTeacherAssignments(teacherId: string, studentId?: string) {
    await connectToDatabase();
    const filter: any = { teacherId: new Types.ObjectId(teacherId) };
    if (studentId) {
      filter.studentId = new Types.ObjectId(studentId);
    }
    return TeacherAssignment.find(filter)
      .populate("studentId", "fullName name email gceLevel")
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get assignments assigned to a student
   */
  async getStudentAssignments(studentId: string) {
    await connectToDatabase();
    return TeacherAssignment.find({ studentId: new Types.ObjectId(studentId) })
      .populate("teacherId", "fullName name email")
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Student submits an exercise answer/response
   */
  async submitAssignment(assignmentId: string, studentId: string, answerText: string) {
    await connectToDatabase();
    const assignment = await TeacherAssignment.findOne({
      _id: new Types.ObjectId(assignmentId),
      studentId: new Types.ObjectId(studentId),
    });

    if (!assignment) {
      throw new Error("Assignment not found or access denied.");
    }

    assignment.studentSubmission = {
      answerText: answerText.trim(),
      submittedAt: new Date(),
    };
    assignment.status = "submitted";
    await assignment.save();
    return assignment;
  }

  /**
   * Teacher reviews submission and provides feedback/score
   */
  async reviewAssignment(data: {
    assignmentId: string;
    teacherId: string;
    score?: number;
    comments?: string;
  }) {
    await connectToDatabase();
    const assignment = await TeacherAssignment.findOne({
      _id: new Types.ObjectId(data.assignmentId),
      teacherId: new Types.ObjectId(data.teacherId),
    });

    if (!assignment) {
      throw new Error("Assignment not found or access denied.");
    }

    assignment.teacherFeedback = {
      score: data.score != null ? Number(data.score) : undefined,
      comments: data.comments?.trim(),
      reviewedAt: new Date(),
    };
    assignment.status = "reviewed";
    await assignment.save();
    return assignment;
  }
}

export const teacherAssignmentService = new TeacherAssignmentService();
