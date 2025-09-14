import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/get-user";

// Update interface to use Promise
interface Context {
  params: Promise<{ id: string }>;

}

// GET: Fetch paginated answers
export async function GET(req: Request, context: Context) {
  try {
    const { id: questionId } = await context.params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 3;
    const skip = (page - 1) * limit;

    // 1️⃣ Check if question exists and get total answers
    const question = await db.question.findUnique({
      where: { id: questionId },
      select: { _count: { select: { answers: true } } },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const totalAnswers = question._count.answers;
    const totalPages = Math.ceil(totalAnswers / limit);
    const remainingAnswers = Math.max(0, totalAnswers - page * limit);

    // 2️⃣ Authenticate user
    const { userId } = await auth();
    const currentUser = userId ? await getUser() : null;

    // 3️⃣ Fetch paginated answers with author and current user's vote
    const answers = await db.answer.findMany({
      where: { questionId },
      take: limit,
      skip,
      include: {
        author: { select: { id: true, name: true, imageUrl: true } },
        votes: currentUser
          ? {
              where: { userId: currentUser.id },
              select: { value: true },
              take: 1,
            }
          : false,
      },
      orderBy: [
        { voteSum: "desc" },   // ✅ Most upvoted answers first
        { createdAt: "desc" }, // ✅ Tie-breaker: newer answers first
      ],
    });

    // 4️⃣ Format answers using precomputed fields
    const formattedAnswers = answers.map(a => ({
      id: a.id,
      content: a.description,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      author: a.author,
      totalVotes: a.voteSum,          // ✅ use precomputed voteSum
      userVote: a.votes?.[0]?.value ?? null,
      totalComments: a.commentCount,  // ✅ use precomputed commentCount
    }));

    return NextResponse.json({
      answers: formattedAnswers,
      pagination: {
        currentPage: page,
        totalPages,
        totalAnswers,
        remainingAnswers,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 });
  }
}

// POST: Create a new answer
export async function POST(req: Request, context: Context) {
  try {
    const { id: questionId } = await context.params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check if question exists
    const question = await db.question.findUnique({ where: { id: questionId } });
    if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

    // Parse request
    const { description } = await req.json();
    if (!description || description.trim() === "")
      return NextResponse.json({ error: "Answer content is required" }, { status: 400 });

    // Create answer
    const answer = await db.answer.create({
      data: {
        description,
        authorId: user.id,
        questionId,
      },
      include: {
        author: { select: { id: true, name: true, imageUrl: true } },
      },
    });

    return NextResponse.json({
      answer: {
        id: answer.id,
        content: answer.description,
        createdAt: answer.createdAt,
        author: answer.author,
        totalVotes: 0,     // ✅ starts with 0
        userVote: null,    // ✅ user hasn’t voted yet
        totalComments: 0,  // ✅ starts with 0
      },
      message: "Answer posted successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Error posting answer:", error);
    return NextResponse.json({ error: "Failed to post answer" }, { status: 500 });
  }
}
