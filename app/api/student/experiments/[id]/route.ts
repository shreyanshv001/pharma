import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 👈 await required

  try {
    const experiment = await db.experiment.findUnique({
      where: { id },
      include: {
        instruments: {
          include: { instrument: true },
        },
      },
    });

    if (!experiment) {
      return NextResponse.json(
        { error: "Experiment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(experiment);
  } catch (error: unknown) {
    console.error("Error fetching experiment:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiment" },
      { status: 500 }
    );
  }
}
