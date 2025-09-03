import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db"; // adjust path to your prisma client

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
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const objective = formData.get("objective") as string;
    const materials = formData.get("materials") as string;
    const procedure = formData.get("procedure") as string;
    const observation = formData.get("observation") as string;
    const result = formData.get("result") as string;
    const discussion = formData.get("discussion") as string;
    const conclusion = formData.get("conclusion") as string;
    const videoUrl = formData.get("videoUrl") as string;

    
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // 4. Create experiment in DB
    const experiment = await db.experiment.create({
      data: {
        title,
        objective,
        materials,
        procedure,
        observation,
        result,
        discussion,
        conclusion,
        videoUrl
      },
    });

    return NextResponse.json({ experiment }, { status: 201 });
  } catch (error) {
    console.error("Experiment creation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
