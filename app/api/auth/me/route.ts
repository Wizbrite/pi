import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "@/modules/auth/services/auth.service";
import userRepository from "@/modules/auth/repositories/user.repository";
import { extractUserId } from "@/lib/auth/extract-user-id";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("token");

    if (!tokenCookie?.value) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = await authService.verifyToken(tokenCookie.value);
    if (!payload) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = extractUserId(payload);

    if (!userId || typeof userId !== "string") {
      console.log("[/api/auth/me] Invalid userId extracted from payload:", userId, "Raw payload:", payload);
      return NextResponse.json(
        { message: "Invalid token payload" },
        { status: 401 }
      );
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      console.log("[/api/auth/me] User not found in DB for ID:", userId);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userResponse = {
      id: user._id.toString(),
      name: user.name || user.fullName,
      email: user.email,
      role: user.role,
      gceLevel: user.gceLevel,
      teacherApprovalStatus: user.teacherApprovalStatus,
      createdAt: user.createdAt,
    };

    return NextResponse.json({ user: userResponse }, { status: 200 });
  } catch (error) {
    console.error("Me API error:", error);
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 401 }
    );
  }
}
