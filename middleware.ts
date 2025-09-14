import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Protect everything except Next.js internals & static files
    "/((?!_next|.*\\..*).*)",

    // Explicitly allow Clerk routes
    "/sign-in(.*)",
    "/sign-up(.*)",
  ],
};
