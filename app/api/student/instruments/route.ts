import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Category, Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

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
      filters.push({ category: category as Category });
    }

    const where: Prisma.InstrumentWhereInput =
      filters.length > 0 ? { AND: filters } : {};

    const instruments = await db.instrument.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await db.instrument.count({ where });

    return NextResponse.json({
      instruments,
      page,
      totalPages: Math.ceil(total / limit),
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
