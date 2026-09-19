import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/modules/auth/models/user.model";
import { getUserRole } from "@/lib/auth/get-user";

export async function GET(request: Request) {
  try {
    const roleHeader = request.headers.get("x-user-role") || await getUserRole();
    if (roleHeader !== "admin") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    
    const query: any = {};
    if (role) query.role = role;
    if (status) query.teacherApprovalStatus = status;

    const users = await User.find(query).select("-passwordHash").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
