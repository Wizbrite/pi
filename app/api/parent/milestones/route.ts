import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user";
import connectToDatabase from "@/lib/db/mongodb";
import { milestoneService } from "@/modules/parent/services/milestone.service";
import { User } from "@/modules/auth/models/user.model";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role === "parent") {
      const milestones = await milestoneService.getParentMilestones(userId);
      return NextResponse.json({ milestones });
    } else if (user.role === "student") {
      const milestones = await milestoneService.getStudentMilestones(userId);
      return NextResponse.json({ milestones });
    }

    return NextResponse.json({ message: "Role not supported" }, { status: 400 });
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

    const data = await request.json();
    if (!data.studentId || !data.title || !data.type || !data.targetValue || !data.gift) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    
    const user = await User.findById(userId);
    if (user?.role !== "parent") {
      return NextResponse.json({ message: "Only parents can create milestones" }, { status: 403 });
    }

    const milestone = await milestoneService.createMilestone({
      ...data,
      parentId: userId,
    });

    return NextResponse.json({ success: true, milestone }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 400 });
  }
}
