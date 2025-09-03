import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

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
  } catch (err) {
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 });
  }

  // 🔑 Protected logic
  try {
    const instrument = await db.instrument.findUnique({ where: { id: params.id } });
    if (!instrument) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(instrument);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch instrument" }, { status: 500 });
  }
}

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
  } catch (err) {
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 });
  }

  // 🔑 Protected logic
  try {
    const data = await req.json();
    const updated = await db.instrument.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update instrument" }, { status: 500 });
  }
}

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
  } catch (err) {
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 });
  }

  // 🔑 Protected logic
  try {
    await db.instrument.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Instrument deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete instrument" }, { status: 500 });
  }
}
