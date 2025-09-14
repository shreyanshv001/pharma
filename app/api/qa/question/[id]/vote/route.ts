import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/get-user";

// Update interface to use Promise
interface Context {
  params: Promise<{ id: string }>;
}

  // ✅ POST: User votes (upsert + maintain voteSum)
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

      const { value } = await req.json(); // Expecting -1, 0, or 1
      if (![1, -1, 0].includes(value)) {
        return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });
      }

      // ✅ Ensure question exists
      const question = await db.question.findUnique({ where: { id } });
      if (!question) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
      }

      // ✅ Check if user already voted
      const existingVote = await db.vote.findUnique({
        where: { userId_questionId: { userId: user.id, questionId: id } },
      });

      let voteChange = 0;

      if (existingVote) {
        // Undo → delete vote
        if (value === 0) {
          voteChange = -existingVote.value; // remove old vote
          await db.vote.delete({ where: { id: existingVote.id } });
        } else {
          // Switch vote
          voteChange = value - existingVote.value;
          await db.vote.update({
            where: { id: existingVote.id },
            data: { value },
          });
        }
      } else {
        if (value !== 0) {
          // New vote
          voteChange = value;
          await db.vote.create({
            data: { value, userId: user.id, questionId: id },
          });
        }
      }

      // ✅ Update precomputed voteSum
      const updatedQuestion = await db.question.update({
        where: { id },
        data: {
          voteSum: { increment: voteChange },
        },
        select: { voteSum: true },
      });

      return NextResponse.json(
        {
          totalVotes: updatedQuestion.voteSum ?? 0,
          userVote: value === 0 ? null : value,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error voting on question:", error);
      return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
    }
  }

  // ✅ GET: Fetch net votes + user's own vote
  export async function GET(req: Request, context: Context) {
    try {
      const { id } = await context.params;
      const { userId } = await auth();

      const question = await db.question.findUnique({
        where: { id },
        select: { voteSum: true },
      });

      if (!question) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
      }

      const totalVotes = question.voteSum ?? 0;

      let userVote: number | null = null;
      if (userId) {
        const user = await getUser();
        if (user) {
          const existingVote = await db.vote.findUnique({
            where: { userId_questionId: { userId: user.id, questionId: id } },
            select: { value: true },
          });
          userVote = existingVote?.value ?? null;
        }
      }

      return NextResponse.json({ totalVotes, userVote }, { status: 200 });
    } catch (error) {
      console.error("Error fetching question votes:", error);
      return NextResponse.json(
        { error: "Failed to fetch votes" },
        { status: 500 }
      );
    }
  }

