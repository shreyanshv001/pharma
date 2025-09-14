import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/get-user";

// Update interface to use Promise
interface Context {
  params: Promise<{ id: string }>;

}

// ✅ GET: Fetch a single answer
export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const answer = await db.answer.findUnique({
      where: { id, authorId: user.id },
      include: {
        question: { select: { id: true, title: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, imageUrl: true } },
          },
        },
        _count: { select: { votes: true, comments: true } },
      },
    });

    if (!answer) return NextResponse.json({ error: "Answer not found" }, { status: 404 });

    return NextResponse.json(answer, { status: 200 });
  } catch (error) {
    console.error("Error fetching answer:", error);
    return NextResponse.json({ error: "Failed to fetch answer" }, { status: 500 });
  }
}

// ✅ PATCH: Update an answer
export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { description } = await req.json();

    const answer = await db.answer.findUnique({ where: { id } });
    if (!answer) return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    if (answer.authorId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await db.answer.update({
      where: { id },
      data: { description },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating answer:", error);
    return NextResponse.json({ error: "Failed to update answer" }, { status: 500 });
  }
}

// ✅ DELETE: Remove an answer
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Validate id parameter
    if (!id) return NextResponse.json({ error: "Invalid answer ID" }, { status: 400 });

    const answer = await db.answer.findUnique({ where: { id } });
    if (!answer) return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    if (answer.authorId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Delete related records in a transaction
    await db.$transaction(async (tx) => {
      // 1. Delete all comments on the answer
      await tx.comment.deleteMany({
        where: { answerId: id }
      });

      // 2. Delete all votes on the answer
      await tx.vote.deleteMany({
        where: { answerId: id }
      });

      // 3. Finally delete the answer
      await tx.answer.delete({
        where: { id }
      });
    });

    return NextResponse.json({ message: "Answer deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting answer:", error);
    return NextResponse.json({ error: "Failed to delete answer" }, { status: 500 });
  }
}
