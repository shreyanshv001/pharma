import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/get-user";

// Update interface to use Promise
interface Context {
  params: Promise<{ id: string }>;

}

// ✅ POST: Vote on an answer
export async function POST(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { value } = await req.json(); // -1, 0, or 1
    if (![1, -1, 0].includes(value)) {
      return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });
    }

    // Ensure the answer exists
    const answer = await db.answer.findUnique({ where: { id } });
    if (!answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    // Check if user already voted
    const existingVote = await db.vote.findFirst({
      where: { userId: user.id, answerId: id },
    });

    if (existingVote) {
      if (value === 0) {
        // 🟢 User clicked again → remove vote
        await db.vote.delete({ where: { id: existingVote.id } });
        await db.answer.update({
          where: { id },
          data: { voteSum: answer.voteSum - existingVote.value },
        });
      } else {
        // 🟢 Update existing vote
        await db.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });
        await db.answer.update({
          where: { id },
          data: { voteSum: answer.voteSum - existingVote.value + value },
        });
      }
    } else if (value !== 0) {
      // 🟢 New vote
      await db.vote.create({
        data: { value, userId: user.id, answerId: id },
      });
      await db.answer.update({
        where: { id },
        data: { voteSum: answer.voteSum + value },
      });
    }

    // Return updated voteSum + user's current vote
    const updatedAnswer = await db.answer.findUnique({
      where: { id },
      select: { voteSum: true },
    });

    return NextResponse.json(
      { totalVotes: updatedAnswer?.voteSum ?? 0, userVote: value === 0 ? null : value },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error voting on answer:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}

// ✅ GET: Fetch votes for an answer
export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();

    const answer = await db.answer.findUnique({
      where: { id },
      select: { voteSum: true },
    });

    if (!answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    let userVote: number | null = null;

    if (userId) {
      const user = await getUser();
      if (user) {
        const existingVote = await db.vote.findFirst({
          where: { userId: user.id, answerId: id },
          select: { value: true },
        });
        userVote = existingVote?.value ?? null;
      }
    }

    return NextResponse.json(
      { totalVotes: answer.voteSum ?? 0, userVote },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching answer votes:", error);
    return NextResponse.json({ error: "Failed to fetch votes" }, { status: 500 });
  }
}
