import { db } from "@/lib/db";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 match Next.js typing
) {
  try {
    const { id } = await context.params; // 👈 await because it's a Promise

    const instrument = await db.instrument.findUnique({
      where: { id },
      include: {
        experiments: {
          include: {
            experiment: true,
          },
        },
      },
    });

    if (!instrument) {
      return NextResponse.json(
        { error: "Instrument not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(instrument);
  } catch (err) {
    console.error("Error fetching instrument:", err);
    return NextResponse.json(
      { error: "Failed to fetch instrument" },
      { status: 500 }
    );
  }
}
