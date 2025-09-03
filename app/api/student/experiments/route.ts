// app/api/instruments/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";

    // For pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10; // number of items per page
    const skip = (page - 1) * limit;

    // Build dynamic filter conditions
    const filters: Array<Record<string, any>> = [];

    if (search) {
      filters.push({
        name: {
          contains: search,
          mode: "insensitive",
        },
      });
    }


    const where = filters.length > 0 ? { AND: filters } : {};

    // Fetch instruments with filter, pagination and ordering
    const experiments = await db.experiment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Get total count for pagination controls
    const total = await db.experiment.count({ where });

    return NextResponse.json({
     experiments,
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
