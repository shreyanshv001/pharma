import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Category, Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const cursor = searchParams.get("cursor"); // last instrument ID
    const limit = 10;

    // Build filters
    const filters: Prisma.InstrumentWhereInput[] = [];

    if (search) {
      filters.push({
        name: {
          contains: search,
          mode: "insensitive",
        },
      });
    }

    if (category) {
      filters.push({ category: category as Category });
    }

    const where: Prisma.InstrumentWhereInput =
      filters.length > 0 ? { AND: filters } : {};

    // Fetch instruments using cursor-based pagination
    const instruments = await db.instrument.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: cursor ? 1 : 0, // skip the cursor item itself
      ...(cursor ? { cursor: { id: cursor } } : {}),
      select:{ id: true, name: true, discription: true, imageUrls: true, category: true },
    });

    // Get next cursor (last item’s id)
    const nextCursor =
      instruments.length > 0 ? instruments[instruments.length - 1].id : null;

    return NextResponse.json({
      instruments,
      nextCursor,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching instruments:", error.message);
    } else {
      console.error("Error fetching instruments:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch instruments" },
      { status: 500 }
    );
  }
}
