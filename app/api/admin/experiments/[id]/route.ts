import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

// GET a single experiment by id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // 🔑 Auth
  try {
    const token = req.headers.get("cookie")?.split("admin_token=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 });
  }

  // 🔑 Protected logic
  try {
    const experiment = await db.experiment.findUnique({
      where: { id: params.id },
    });

    if (!experiment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(experiment);
  } catch (error) {
    console.error("Fetch experiment error:", error);
    return NextResponse.json({ error: "Failed to fetch experiment" }, { status: 500 });
  }
}

// UPDATE an experiment
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  // 🔑 Auth
  try {
    const token = req.headers.get("cookie")?.split("admin_token=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 });
  }

  // 🔑 Protected logic
  try {
    const data = await req.json();
    const updated = await db.experiment.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update experiment error:", error);
    return NextResponse.json({ error: "Failed to update experiment" }, { status: 500 });
  }
}

// DELETE an experiment
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // 🔑 Auth
  try {
    const token = req.headers.get("cookie")?.split("admin_token=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 });
  }

  // 🔑 Protected logic
  try {
    await db.experiment.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Experiment deleted successfully" });
  } catch (error) {
    console.error("Delete experiment error:", error);
    return NextResponse.json({ error: "Failed to delete experiment" }, { status: 500 });
  }
}
