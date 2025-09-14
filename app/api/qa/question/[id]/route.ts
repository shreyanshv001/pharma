import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUser } from "@/lib/get-user";

// Add Context interface with Promise
interface Context {
  params: Promise<{ id: string }>;

}

export async function GET(
  req: Request,
  context: Context
) {
  try {
    const { id } = await context.params;
    const { userId: clerkId } = await auth(); // Clerk user ID

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Map Clerk user → DB user
    const currUser = await getUser(); // ✅ await needed
    if (!currUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch question in a single query
    const question = await db.question.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        voteSum: true, // ✅ precomputed value
        author: {
          select: { id: true, name: true, imageUrl: true },
        },
        _count: { select: { answers: true } },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Check if current user already voted
    const existingVote = await db.vote.findUnique({
      where: {
        userId_questionId: {
          userId: currUser.id,
          questionId: id,
        },
      },
      select: { value: true },
    });

    // Build response
    const response = {
      Userid: clerkId,
      id: question.id,
      title: question.title,
      description: question.description,
      author: question.author,
      totalVotes: question.voteSum ?? 0,
      _count: { answers: question._count.answers },
      userVote: existingVote?.value ?? null,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}
