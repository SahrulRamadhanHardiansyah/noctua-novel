import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ─── Protected routes (require authentication) ──────────────────────────────
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/achievements(.*)",
  "/bookmarks(.*)",
  "/coins(.*)",
  "/favorite(.*)",
  "/notifications(.*)",
  "/offline(.*)",
  "/admin(.*)",
]);

// ─── Admin-only routes ──────────────────────────────────────────────────────
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Protect authenticated routes
  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Protect admin routes — only ADMIN role allowed
  if (isAdminRoute(req)) {
    const role = (sessionClaims?.metadata as any)?.role;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Security headers on all responses
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
