import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// "auth_ok" is a plain (non-HttpOnly) sentinel cookie set by the frontend after login.
// The backend's HttpOnly "access_token" is port-isolated on localhost and not visible
// to Next.js proxy, so we use this sentinel instead. It carries no secret — only "1".
const AUTH_SENTINEL = "auth_ok";

function isAuthenticated(req: NextRequest): boolean {
  return !!req.cookies.get(AUTH_SENTINEL)?.value;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = isAuthenticated(req);

  // Unauthenticated user trying to access a protected route → /login
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/tasks") ||
      pathname.startsWith("/habits") || pathname.startsWith("/workouts") ||
      pathname.startsWith("/nutrition") || pathname.startsWith("/journal") ||
      pathname.startsWith("/stats") || pathname.startsWith("/calendar") ||
      pathname.startsWith("/profile") || pathname.startsWith("/goals") ||
      pathname.startsWith("/achievements") || pathname.startsWith("/upgrade") ||
      pathname.startsWith("/onboarding") || pathname.startsWith("/admin") ||
      pathname.startsWith("/settings")) {
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
