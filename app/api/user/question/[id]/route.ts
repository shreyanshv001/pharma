import { db } from "@/lib/db";
import { getUser } from "@/lib/get-user";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Update interface to use Promise
interface Context {
  params: Promise<{ id: string }>;

}

// ✅ DELETE: Only the author can delete their question
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check ownership
    const question = await db.question.findUnique({ where: { id } });
    if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

    if (question.authorId !== user.id) {
      return NextResponse.json({ error: "Forbidden: Not the author" }, { status: 403 });
    }

    // Delete question and all related records in a transaction
    await db.$transaction(async (tx) => {
      // 1. Delete all comments on answers
      await tx.comment.deleteMany({
        where: {
          answer: {
            questionId: id,
          },
        },
      });

      // 2. Delete all votes on answers
      await tx.vote.deleteMany({
        where: {
          answer: {
            questionId: id,
          },
        },
      });

      // 3. Delete all answers
      await tx.answer.deleteMany({
        where: { questionId: id },
      });

      // 4. Delete all votes on the question
      await tx.vote.deleteMany({
        where: { questionId: id },
      });

      // 5. Finally delete the question
      await tx.question.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "Question deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}

// ✅ PATCH: Only the author can update their question
export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { title, description } = body;

    // Check ownership
    const question = await db.question.findUnique({ where: { id } });
    if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

    if (question.authorId !== user.id) {
      return NextResponse.json({ error: "Forbidden: Not the author" }, { status: 403 });
    }

    const updatedQuestion = await db.question.update({
      where: { id },
      data: {
        title,
        description,
      },
    });

    return NextResponse.json(updatedQuestion, { status: 200 });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}
