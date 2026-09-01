import { Types } from "mongoose";
import { ParentConnection, type IParentConnectionDocument } from "../models/parent-connection.model";
import { User } from "@/modules/auth/models/user.model";
import { emailService } from "@/modules/email/services/email.service";
import { Notification } from "../models/notification.model";

export class ParentConnectionService {
  async sendRequest(parentId: string, studentEmail: string, message?: string) {
    const parent = await User.findById(parentId);
    if (!parent || parent.role !== "parent") {
      throw new Error("Invalid parent account");
    }

    const student = await User.findOne({ email: studentEmail, role: "student" });
    if (!student) {
      throw new Error("No student found with this email address.");
    }

    // Check if a connection already exists
    const existingConnection = await ParentConnection.findOne({
      parentId: parent._id,
      studentId: student._id,
    });

    if (existingConnection) {
      if (existingConnection.status === "pending") {
        throw new Error("A request is already pending for this student.");
      }
      if (existingConnection.status === "accepted") {
        throw new Error("You are already connected to this student.");
      }
    }

    const connection = await ParentConnection.create({
      parentId: parent._id,
      studentId: student._id,
      initiatedBy: "parent",
      message,
      status: "pending",
    });

    // Create in-app notification for the student
    await Notification.create({
      userId: student._id,
      type: "parent_request",
      title: "New Parent Request",
      message: `${parent.fullName || parent.name} sent a request to connect.`,
      meta: { connectionId: connection._id.toString() },
    });

    // Send email notification
    await emailService.sendParentRequestEmail(
      studentEmail,
      parent.fullName || parent.name || "A parent",
      message
    );

    return connection;
  }

  async respondToRequest(studentId: string, connectionId: string, accept: boolean) {
    const connection = await ParentConnection.findOne({
      _id: connectionId,
      studentId,
      status: "pending",
    }).populate("parentId");

    if (!connection) {
      throw new Error("Request not found or already processed.");
    }

    connection.status = accept ? "accepted" : "rejected";
    await connection.save();

    if (accept) {
      // Add child to parent's children array
      await User.findByIdAndUpdate(connection.parentId, {
        $addToSet: { children: studentId },
      });
      // (Optional: add parent to student's parent list if needed)
    }

    // Notify the parent
    const student = await User.findById(studentId);
    await Notification.create({
      userId: connection.parentId,
      type: accept ? "request_accepted" : "request_rejected",
      title: accept ? "Request Accepted" : "Request Declined",
      message: `${student?.fullName || "The student"} has ${accept ? "accepted" : "declined"} your connection request.`,
    });

    return connection;
  }

  async getParentConnections(parentId: string) {
    return ParentConnection.find({ parentId }).populate("studentId", "name fullName email gceLevel").sort({ createdAt: -1 });
  }

  async getStudentPendingRequests(studentId: string) {
    return ParentConnection.find({ studentId, status: "pending" }).populate("parentId", "name fullName email").sort({ createdAt: -1 });
  }
  
  async getStudentConnections(studentId: string) {
    return ParentConnection.find({ studentId, status: "accepted" }).populate("parentId", "name fullName email");
  }
}

export const parentConnectionService = new ParentConnectionService();
export default parentConnectionService;
