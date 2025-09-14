import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { Prisma } from '@prisma/client';

// GET a single experiment by id
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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
      where: { id },
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
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update experiment error:", error);
    return NextResponse.json({ error: "Failed to update experiment" }, { status: 500 });
  }
}

// DELETE an experiment
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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
    // First check if the experiment exists
    const experiment = await db.experiment.findUnique({
      where: { id },
      include: {
        instruments: true
      }
    });

    if (!experiment) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    // Delete in a transaction to ensure data consistency
    await db.$transaction(async (tx) => {
      // First delete all experiment-instrument relationships
      await tx.experimentOnInstrument.deleteMany({
        where: {
          experimentId: id
        }
      });

      // Then delete the experiment
      await tx.experiment.delete({
        where: { id }
      });
    });

    return NextResponse.json({ message: "Experiment deleted successfully" });
  } catch (error) {
    console.error("Delete experiment error:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
      }
      if (error.code === "P2003") {
        return NextResponse.json({ 
          error: "Cannot delete experiment because it has linked instruments. Please remove the instrument links first.",
          details: error.message 
        }, { status: 409 });
      }
    }
    
    return NextResponse.json({ error: "Failed to delete experiment" }, { status: 500 });
  }
}
