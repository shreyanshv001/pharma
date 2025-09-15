import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";

    // For pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    // Build dynamic filter conditions
    const filters: Prisma.ExperimentWhereInput[] = [];

    if (search) {
      filters.push({
        object: {
          contains: search,
          mode: "insensitive",
        },
      });
    }

    const where: Prisma.ExperimentWhereInput =
      filters.length > 0 ? { AND: filters } : {};

    // Fetch experiments with filter, pagination and ordering
    const experiments = await db.experiment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
      id: true,        // usually needed for unique identification
      object: true,
    },
    });

    const total = await db.experiment.count({ where });

    return NextResponse.json({
      experiments,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching experiments:", error.message);
    } else {
      console.error("Error fetching experiments:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch experiments" },
      { status: 500 }
    );
  }
}
