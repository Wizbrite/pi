import { NextResponse } from "next/server";
import { authService } from "@/modules/auth/services/auth.service";
import { resetPasswordSchema } from "@/modules/auth/validation/auth.schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { token, password } = validationResult.data;

    await authService.resetPassword(token, password);

    return NextResponse.json(
      { message: "Password has been reset successfully. You can now log in." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Reset password API error:", error);
    return NextResponse.json(
      {
        message:
          error.message || "Password reset failed. The token may be invalid or expired.",
      },
      { status: 400 }
    );
  }
}
