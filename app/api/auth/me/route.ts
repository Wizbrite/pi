import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Types } from "mongoose";
import { authService } from "@/modules/auth/services/auth.service";
import userRepository from "@/modules/auth/repositories/user.repository";

function extractUserId(payload: Record<string, any>): string {
  if (!payload) return "";
  const rawId = payload.id ?? payload.sub;
  if (!rawId) return "";

  if (typeof rawId === "string") {
    return rawId;
  }

  // Handle object with buffer: { buffer: { '0': 106, '1': 112, ... } }
  if (typeof rawId === "object") {
    if (rawId.buffer && typeof rawId.buffer === "object") {
      try {
        const bytes = Object.values(rawId.buffer) as number[];
        return Buffer.from(bytes).toString("hex");
      } catch {
        // Fall through
      }
    }
    if (typeof rawId.toString === "function") {
      const str = rawId.toString();
      if (str !== "[object Object]") {
        return str;
      }
    }
  }

  return String(rawId);
}

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
