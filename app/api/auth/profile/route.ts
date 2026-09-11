import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "@/modules/auth/services/auth.service";
import { extractUserId } from "@/lib/auth/extract-user-id";
import connectToDatabase from "@/lib/db/mongodb";
import { User } from "@/modules/auth/models/user.model";
import bcrypt from "bcryptjs";

/**
 * GET /api/auth/profile
 * Returns the authenticated user's full profile
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("token");
    if (!tokenCookie?.value) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const payload = await authService.verifyToken(tokenCookie.value);
    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const userId = extractUserId(payload);
    if (!userId) {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      const response = NextResponse.json({ message: "User not found" }, { status: 401 });
      response.cookies.set("token", "", { maxAge: 0, path: "/" });
      return response;
    }

    return NextResponse.json({
      profile: {
        id: user._id.toString(),
        fullName: user.fullName,
        name: user.name,
        email: user.email,
        role: user.role,
        gceLevel: user.gceLevel,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("[GET /api/auth/profile] Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/auth/profile
 * Updates name and/or password for the authenticated user
 *
 * Body: { fullName?: string; currentPassword?: string; newPassword?: string }
 */
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("token");
    if (!tokenCookie?.value) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const payload = await authService.verifyToken(tokenCookie.value);
    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const userId = extractUserId(payload);
    if (!userId) {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, currentPassword, newPassword } = body as {
      fullName?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    await connectToDatabase();

    const updates: Record<string, any> = {};

    if (fullName && typeof fullName === "string" && fullName.trim().length >= 2) {
      updates.fullName = fullName.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "Current password is required to set a new password" },
          { status: 400 }
        );
      }
      if (newPassword.length < 8) {
        return NextResponse.json(
          { message: "New password must be at least 8 characters" },
          { status: 400 }
        );
      }

      // Re-fetch with passwordHash to verify
      const userWithPw = await User.findById(userId).select("+passwordHash");
      if (!userWithPw) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      const isMatch = await bcrypt.compare(currentPassword, userWithPw.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
      }

      updates.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, select: "-passwordHash" }
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: {
        id: updatedUser!._id.toString(),
        fullName: updatedUser!.fullName,
        email: updatedUser!.email,
        role: updatedUser!.role,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/auth/profile] Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
