import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { Prisma } from '@prisma/client';

async function verifyAuth(req: NextRequest) {
  try {
    const token = req.headers.get("cookie")?.split("admin_token=")[1]?.split(";")[0];
    if (!token) {
      return { error: "Unauthorized", status: 401 };
    }

    try {
      jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
      return null; // valid
    } catch {
      return { error: "Invalid token", status: 403 };
    }
  } catch {
    return { error: "Auth check failed", status: 500 };
  }
}

// GET instrument by id
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const auth = await verifyAuth(req);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const instrument = await db.instrument.findUnique({ where: { id } });
    if (!instrument) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(instrument);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch instrument" }, { status: 500 });
  }
}

// UPDATE instrument
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const auth = await verifyAuth(req);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const data = await req.json();
    const updated = await db.instrument.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update instrument" }, { status: 500 });
  }
}

// DELETE instrument
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const auth = await verifyAuth(req);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    // First check if the instrument exists
    const instrument = await db.instrument.findUnique({
      where: { id },
      include: {
        experiments: true
      }
    });

    if (!instrument) {
      return NextResponse.json({ error: "Instrument not found" }, { status: 404 });
    }

    // Delete in a transaction to ensure data consistency
    await db.$transaction(async (tx) => {
      // First delete all experiment-instrument relationships
      await tx.experimentOnInstrument.deleteMany({
        where: {
          instrumentId: id
        }
      });

      // Then delete the instrument
      await tx.instrument.delete({
        where: { id }
      });
    });

    return NextResponse.json({ message: "Instrument deleted successfully" });
  } catch (error) {
    console.error("Delete instrument error:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Instrument not found" }, { status: 404 });
      }
      if (error.code === "P2003") {
        return NextResponse.json({ 
          error: "Cannot delete instrument because it is being used by one or more experiments. Please remove the instrument from all experiments first.",
          details: error.message 
        }, { status: 409 });
      }
    }
    
    return NextResponse.json(
      { error: "Failed to delete instrument" }, 
      { status: 500 }
    );
  }
}
