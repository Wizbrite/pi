import { cookies } from "next/headers";
import { authService } from "@/modules/auth/services/auth.service";
import { extractUserId } from "./extract-user-id";


export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");

  if (!tokenCookie?.value) {
    return null;
  }

  const payload = await authService.verifyToken(tokenCookie.value);
  if (!payload) {
    return null;
  }

  const userId = extractUserId(payload);
  return userId || null;
}
