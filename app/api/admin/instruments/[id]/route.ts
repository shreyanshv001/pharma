import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

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
    await db.instrument.delete({ where: { id } });
    return NextResponse.json({ message: "Instrument deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete instrument" }, { status: 500 });
  }
}
