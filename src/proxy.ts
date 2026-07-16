import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// The HTTP-only cookie name set by the backend on login/refresh.
// Update this if the backend uses a different name.
const AUTH_COOKIE = "refresh_token";

function isAuthenticated(req: NextRequest): boolean {
  return !!req.cookies.get(AUTH_COOKIE)?.value;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = isAuthenticated(req);

  // Unauthenticated user trying to access a protected route → /login
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/tasks") ||
      pathname.startsWith("/habits") || pathname.startsWith("/workouts") ||
      pathname.startsWith("/nutrition") || pathname.startsWith("/journal") ||
      pathname.startsWith("/finance") || pathname.startsWith("/shopping") ||
      pathname.startsWith("/stats") || pathname.startsWith("/calendar") ||
      pathname.startsWith("/profile") || pathname.startsWith("/goals") ||
      pathname.startsWith("/achievements") || pathname.startsWith("/upgrade") ||
      pathname.startsWith("/onboarding") || pathname.startsWith("/admin")) {
    if (!authed) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Authenticated user on auth pages → /dashboard
  if ((pathname.startsWith("/login") || pathname.startsWith("/register")) && authed) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|icon|manifest).*)",
  ],
};
