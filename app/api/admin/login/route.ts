// app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log("[Admin Login] Attempt for email:", email);

    // Check if admin exists
    const admin = await db.admin.findUnique({ where: { email } });
    if (!admin) {
      console.log("[Admin Login] Admin not found:", email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      console.log("[Admin Login] Invalid password for admin:", email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      process.env.ADMIN_JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // Create NextResponse
    const res = NextResponse.json({ success: true });

    // Set cookie
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only true in production
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 1 day
    });

    console.log("[Admin Login] Login successful:", email);
    return res;
  } catch (err) {
    console.error("[Admin Login] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
