import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user";
import connectToDatabase from "@/lib/db/mongodb";
import { milestoneService } from "@/modules/parent/services/milestone.service";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    await connectToDatabase();
    
    // The service ensures only the parent who created it can delete it
    await milestoneService.deleteMilestone(id, userId);

    return NextResponse.json({ success: true, message: "Milestone deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 400 });
  }
}
