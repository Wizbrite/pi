import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";
import { extractUserId } from "@/lib/auth/extract-user-id";
function getJwtSecret() {
  const secret = process.env.JWT_SECRET || "super_secret_jwt_key_at_least_32_characters_long";
  return new TextEncoder().encode(secret);
}

// Routes that require authentication
const protectedRoutes = ["/student", "/teacher", "/parent", "/admin"];

// Routes only accessible when NOT authenticated
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

// Map role → dashboard path
const roleDashboardMap: Record<string, string> = {
  student: "/student",
  teacher: "/teacher",
  parent: "/parent",
  admin: "/admin",
};

async function verifyToken(token: string) {
  try {
    const secret = getJwtSecret();
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// function extractUserId(payload: Record<string, any>): string {
//   if (!payload) return "";
//   const rawId = payload.id ?? payload.sub;
//   if (!rawId) return "";

//   if (typeof rawId === "string") return rawId;

//   if (typeof rawId === "object") {
//     if (rawId.buffer && typeof rawId.buffer === "object") {
//       try {
//         const bytes = Object.values(rawId.buffer) as number[];
//         return Buffer.from(bytes).toString("hex");
//       } catch {
//         // Fall through
//       }
//     }
//     if (typeof rawId.toString === "function") {
//       const str = rawId.toString();
//       if (str !== "[object Object]") return str;
//     }
//   }

//   return String(rawId);
// }

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If accessing a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    const payload = await verifyToken(token);

    if (!payload) {
      // Token is invalid or expired — clear it and redirect to login
      if (isProtectedRoute) {
        const response = NextResponse.redirect(
          new URL("/login", request.url)
        );
        response.cookies.set("token", "", { maxAge: 0, path: "/" });
        return response;
      }
      // For non-protected routes, just clear the bad cookie
      const response = NextResponse.next();
      response.cookies.set("token", "", { maxAge: 0, path: "/" });
      return response;
    }

    const userId = extractUserId(payload);
    const userRole = (payload.role as string) || "student";
    const userDashboard = roleDashboardMap[userRole] || "/student";

    // Authenticated users visiting auth pages get redirected to their dashboard
    if (isAuthRoute || pathname === "/") {
      return NextResponse.redirect(new URL(userDashboard, request.url));
    }

    // Role-based access: ensure user can only access their own dashboard
    if (isProtectedRoute) {
      const allowedPrefix = roleDashboardMap[userRole];
      const isAllowed =
        pathname === allowedPrefix ||
        pathname.startsWith(`${allowedPrefix}/`);

      if (!isAllowed) {
        return NextResponse.redirect(new URL(userDashboard, request.url));
      }
    }

    // Attach user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", userId);
    requestHeaders.set("x-user-role", userRole);
    requestHeaders.set("x-user-email", (payload.email as string) || "");

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public folder assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
