import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/get-user";
import connectToDatabase from "@/lib/db/mongodb";
import { parentConnectionService } from "@/modules/parent/services/parent-connection.service";

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
    const { accept } = await request.json();

    if (typeof accept !== "boolean") {
      return NextResponse.json({ message: "accept boolean is required" }, { status: 400 });
    }
    
    await connectToDatabase();
    const connection = await parentConnectionService.respondToRequest(userId, id, accept);

    return NextResponse.json({ success: true, connection });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 400 });
  }
}
