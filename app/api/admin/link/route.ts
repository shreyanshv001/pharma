import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db"; // adjust your prisma client import

export async function POST(req: Request) {
  try {
    // 1. Get admin_token from cookies
    const token = req.headers
      .get("cookie")
      ?.split("admin_token=")[1]
      ?.split(";")[0];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify token
    try {
      jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // 3. Parse request body
    const body = await req.json();
    const { instrumentId, experimentId } = body;

    if (!instrumentId || !experimentId) {
      return NextResponse.json(
        { error: "instrumentId and experimentId are required" },
        { status: 400 }
      );
    }

    // 4. Create link
    const link = await db.experimentOnInstrument.create({
      data: {
        instrumentId,
        experimentId,
      },
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    console.error("Linking error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
