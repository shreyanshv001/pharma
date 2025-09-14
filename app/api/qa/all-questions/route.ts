import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor"); // last question ID
    const query = searchParams.get("search") || "";
    const limit = 5;

    // Fetch questions with cursor pagination
    const questions = await db.question.findMany({
      take: limit,
      skip: cursor ? 1 : 0, // skip the cursor itself if present
      ...(cursor ? { cursor: { id: cursor } } : {}),
      where: query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {},
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, imageUrl: true } },
        _count: { select: { answers: true } },
      },
    });

    // ✅ Use precomputed voteSum instead of aggregation
    const questionsWithVotes = questions.map((q) => ({
      ...q,
      totalVotes: q.voteSum ?? 0, // already stored in Question table
    }));

    // Determine next cursor
    const nextCursor =
      questionsWithVotes.length > 0
        ? questionsWithVotes[questionsWithVotes.length - 1].id
        : null;

    return NextResponse.json({
      questions: questionsWithVotes,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
