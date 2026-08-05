import { NextResponse } from "next/server";
import { authService } from "@/modules/auth/services/auth.service";
import { forgotPasswordSchema } from "@/modules/auth/validation/auth.schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    const { resetLink } = await authService.createPasswordResetToken(email);

    // In Phase 1, log the reset link to console instead of sending email
    console.log("─────────────────────────────────────────────");
    console.log("🔑 PASSWORD RESET LINK (dev mode):");
    console.log(resetLink);
    console.log("─────────────────────────────────────────────");

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Forgot password API error:", error);
    // Return generic message to prevent email enumeration
    return NextResponse.json(
      {
        message:
          "If an account with that email exists, a password reset link has been sent.",
      },
      { status: 200 }
    );
  }
}
