// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const config = {
  matcher: ["/admin/:path*"], // apply middleware only to /admin routes
  runtime: "nodejs", // force Node runtime
};

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));

  try {
    jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
    return NextResponse.next();
  } catch (err) {
    console.log("[Middleware] Invalid token:", err);
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}
