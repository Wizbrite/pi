import { cookies } from "next/headers";
import { authService } from "@/modules/auth/services/auth.service";

function extractUserId(payload: Record<string, any>): string {
  if (!payload) return "";
  const rawId = payload.id ?? payload.sub;
  if (!rawId) return "";

  if (typeof rawId === "string") {
    return rawId;
  }

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
