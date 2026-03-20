import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Ignore Next.js internals, static files, and admin API routes (large uploads)
    "/((?!_next|.*\\..*|api/admin).*)",

    // Explicitly allow Clerk routes
    "/sign-in(.*)",
    "/sign-up(.*)",
  ],
};
