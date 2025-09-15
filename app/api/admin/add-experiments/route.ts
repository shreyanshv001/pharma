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

    const object = formData.get("object") as string | null;
    const reference = formData.get("reference") as string | null;
    const materials = formData.get("materials") as string | null;
    const theory = formData.get("theory") as string | null;
    const procedure = formData.get("procedure") as string | null;
    const observation = formData.get("observation") as string | null;
    const result = formData.get("result") as string | null;
    const chemicalReaction = formData.get("chemicalReaction") as string | null;
    const calculations = formData.get("calculations") as string | null;
    const videoUrl = formData.get("videoUrl") as string | null;

    
    if (!object || !object.trim()) {
      return NextResponse.json({ error: "Field 'object' is required" }, { status: 400 });
    }

    // 4. Create experiment in DB
    const experiment = await db.experiment.create({
      data: {
        object,
        reference,
        materials,
        theory,
        procedure,
        observation,
        result,
        chemicalReaction,
        calculations,
        videoUrl
      },
    });

    return NextResponse.json({ experiment }, { status: 201 });
  } catch (error) {
    console.error("Experiment creation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
