import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user";
import { teacherConnectionService } from "@/modules/teacher/services/teacher-connection.service";
import connectToDatabase from "@/lib/db/mongodb";
import { User } from "@/modules/auth/models/user.model";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user || user.role !== "student") {
      return NextResponse.json({ message: "Student access required" }, { status: 403 });
    }

    const connections = await teacherConnectionService.getStudentConnections(userId);
    const accepted = connections.filter((c: any) => c.status === "accepted");
    const pending = connections.filter((c: any) => c.status === "pending");

    return NextResponse.json({ success: true, connections, accepted, pending });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { teacherEmail, message } = await request.json();
    if (!teacherEmail) {
      return NextResponse.json({ message: "Teacher email is required" }, { status: 400 });
    }

    const connection = await teacherConnectionService.sendStudentRequest(userId, teacherEmail, message);
    return NextResponse.json({ success: true, connection }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to send request" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { connectionId, action } = await request.json();
    if (!connectionId || !action || !["accepted", "rejected"].includes(action)) {
      return NextResponse.json({ message: "Invalid request parameters" }, { status: 400 });
    }

    const connection = await teacherConnectionService.respondToRequest(connectionId, userId, action);
    return NextResponse.json({ success: true, connection });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to respond to request" }, { status: 400 });
  }
}
