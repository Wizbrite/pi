import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user";
import connectToDatabase from "@/lib/db/mongodb";
import { notificationService } from "@/modules/notifications/services/notification.service";

export async function PATCH(
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
    const notification = await notificationService.markAsRead(id, userId);

    if (!notification) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
