import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user";
import connectToDatabase from "@/lib/db/mongodb";
import { parentConnectionService } from "@/modules/parent/services/parent-connection.service";
import { User } from "@/modules/auth/models/user.model";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Check if user is parent or student to return appropriate connections
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role === "parent") {
      const connections = await parentConnectionService.getParentConnections(userId);
      return NextResponse.json({ connections });
    } else if (user.role === "student") {
      const pending = await parentConnectionService.getStudentPendingRequests(userId);
      const accepted = await parentConnectionService.getStudentConnections(userId);
      return NextResponse.json({ pending, accepted });
    }

    return NextResponse.json({ message: "Role not supported for this endpoint" }, { status: 400 });
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

    const { studentEmail, message } = await request.json();
    if (!studentEmail) {
      return NextResponse.json({ message: "Student email is required" }, { status: 400 });
    }

    await connectToDatabase();
    const connection = await parentConnectionService.sendRequest(userId, studentEmail, message);

    return NextResponse.json({ success: true, connection }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 400 });
  }
}
