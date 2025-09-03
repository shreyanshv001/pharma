// app/api/instruments/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    // For pagination
    const page = parseInt(searchParams.get("page") || "1"); // default page = 1
    const limit = 10; // number of items per page
    const skip = (page - 1) * limit;

    // Build dynamic filter conditions
    const filters: Prisma.InstrumentWhereInput[] = [];

    if (search) {
      filters.push({
        name: {
          contains: search,
          mode: "insensitive",
        },
      });
    }

    if (category && category !== "") {
      filters.push({ category });
    }

    const where: Prisma.InstrumentWhereInput =
      filters.length > 0 ? { AND: filters } : {};

    // Fetch instruments with filter, pagination and ordering
    const instruments = await db.instrument.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Get total count for pagination controls
    const total = await db.instrument.count({ where });

    return NextResponse.json({
      instruments,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch instruments" },
      { status: 500 }
    );
  }
}
