import { db } from "@/lib/db";
import { getUser } from "@/lib/get-user";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ✅ GET: Fetch all questions asked by the logged-in user
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get cursor from URL
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = 10;

    const questions = await db.question.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        voteSum: true,
        _count: { select: { answers: true } },
      },
    });

    let nextCursor: string | undefined;
    if (questions.length > limit) {
      const nextItem = questions.pop();
      nextCursor = nextItem?.id;
    }

    // ✅ Format response
    const formatted = questions.map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      createdAt: q.createdAt,
      totalVotes: q.voteSum ?? 0,
      totalAnswers: q._count.answers,
    }));

    return NextResponse.json({
      success: true,
      questions: formatted,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching user questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user questions" },
      { status: 500 }
    );
  }
}
