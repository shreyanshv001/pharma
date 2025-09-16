import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

// ✅ Helper: Verify Admin Auth
async function verifyAdmin(req: NextRequest) {
  const token = req.headers
    .get("cookie")
    ?.split("admin_token=")[1]
    ?.split(";")[0];

  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
    return { ok: true };
  } catch {
    return { error: "Invalid token", status: 403 };
  }
}

// 📌 GET: Single experiment by ID (with instruments)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = await verifyAdmin(req);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const experiment = await db.experiment.findUnique({
      where: { id },
      include: {
        instruments: {
          include: {
            instrument: true, // ✅ brings full instrument data
          },
        },
      },
    });

    if (!experiment) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    return NextResponse.json(experiment);
  } catch (error) {
    console.error("Fetch experiment error:", error);
    return NextResponse.json({ error: "Failed to fetch experiment" }, { status: 500 });
  }
}

// 📌 PUT: Update experiment details (only experiment fields, not instruments)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const auth = await verifyAdmin(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const form = await req.formData();

    const updated = await db.experiment.update({
      where: { id },
      data: {
        object: form.get("object") as string,
        reference: form.get("reference") as string,
        materials: form.get("materials") as string,
        theory: form.get("theory") as string,
        procedure: form.get("procedure") as string,
        observation: form.get("observation") as string,
        result: form.get("result") as string,
        chemicalReaction: form.get("chemicalReaction") as string,
        calculations: form.get("calculations") as string,
        videoUrl: form.get("videoUrl") as string,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update experiment error:", error);
    return NextResponse.json(
      { error: "Failed to update experiment" },
      { status: 500 }
    );
  }
}

// 📌 DELETE: Delete experiment & linked records
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = await verifyAdmin(req);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const experiment = await db.experiment.findUnique({
      where: { id },
      include: { instruments: true },
    });

    if (!experiment) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    // ✅ Transaction ensures consistency
    await db.$transaction(async (tx) => {
      await tx.experimentOnInstrument.deleteMany({
        where: { experimentId: id },
      });

      await tx.experiment.delete({
        where: { id },
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
        return NextResponse.json(
          {
            error:
              "Cannot delete experiment because it has linked instruments. Remove instrument links first.",
            details: error.message,
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json({ error: "Failed to delete experiment" }, { status: 500 });
  }
}
