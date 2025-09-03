// app/api/admin/all-experiments/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

// GET /api/admin/all-experiments
export async function GET(req: Request) {
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

    // 3. Fetch all experiments with their instruments
    const experiments = await db.experiment.findMany({
      include: {
        instruments: {
          include: {
            instrument: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(experiments);
  } catch (error) {
    console.error("Error fetching experiments:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiments" },
      { status: 500 }
    );
  }
}
