// app/api/admin/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // Clear cookie by setting it with empty value and past expiry date
  const response = NextResponse.json({ message: "Logged out successfully" });

  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0), // expired in the past
    path: "/",
  });

  return response;
}
