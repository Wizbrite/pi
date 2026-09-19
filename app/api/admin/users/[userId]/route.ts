import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/modules/auth/models/user.model";
import { getUserRole } from "@/lib/auth/get-user";

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const roleHeader = request.headers.get("x-user-role") || await getUserRole();
    if (roleHeader !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { userId } = await params;
    const body = await request.json();
    const user = await User.findByIdAndUpdate(userId, body, { new: true }).select("-passwordHash");
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const roleHeader = request.headers.get("x-user-role") || await getUserRole();
    if (roleHeader !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { userId } = await params;
    await User.findByIdAndDelete(userId);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
