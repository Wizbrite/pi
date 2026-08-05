import { NextResponse } from "next/server";
import { authService } from "@/modules/auth/services/auth.service";
import { loginSchema } from "@/modules/auth/validation/auth.schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;
    const { user, token } = await authService.login(email, password);

    const response = NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          gceLevel: user.gceLevel,
          teacherApprovalStatus: user.teacherApprovalStatus,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error: any) {
    console.error("❌ Login API error:", error);
    return NextResponse.json(
      {
        message: error.message || "Invalid email or password",
      },
      { status: 401 }
    );
  }
}
