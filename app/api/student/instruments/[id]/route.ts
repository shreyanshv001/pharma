import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const instrument = await db.instrument.findUnique({
      where: { id },
      include: {
        experiments: {
          include: {
            experiment: true, // include experiment details
          },
        },
      },
    });
    if (!instrument) {
      return NextResponse.json({ error: "Instrument not found" }, { status: 404 });
    }
    return NextResponse.json(instrument);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch instrument" },
      { status: 500 }
    );
  }
}
