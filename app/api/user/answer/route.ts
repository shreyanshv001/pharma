import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/get-user";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Get cursor from URL
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = 10;

    const answers = await db.answer.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        description: true,
        createdAt: true,
        voteSum: true,
        commentCount: true,
        question: {
          select: {
            id: true,
            title: true,
          },
        }
      },
    });

    const formattedAnswers = answers.map(answer => ({
      id: answer.id,
      content: answer.description,
      createdAt: answer.createdAt,
      question: answer.question,
      _count: {
        votes: answer.voteSum,
        comments: answer.commentCount
      }
    }));

    let nextCursor: string | undefined;
    if (answers.length > limit) {
      const nextItem = answers.pop();
      nextCursor = nextItem?.id;
    }

    return NextResponse.json({
      success: true,
      answers: formattedAnswers,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching user answers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch answers" },
      { status: 500 }
    );
  }
}