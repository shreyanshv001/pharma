import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/get-user";

interface Context {
  params: { id: string };
}


// POST handler with Promise params
export async function POST(
  request: Request,
  context: Context
) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const { body } = await request.json();
    if (!body || body.trim() === "") {
      return NextResponse.json({ success: false, error: "Comment body is required" }, { status: 400 });
    }

    const answer = await db.answer.findUnique({ where: { id } });
    if (!answer) {
      return NextResponse.json({ success: false, error: "Answer not found" }, { status: 404 });
    }

    // Create comment + increment count in parallel
    const [comment, updatedAnswer] = await Promise.all([
      db.comment.create({
        data: {
          body,
          authorId: user.id,
          answerId: id, // Use destructured id
        },
        include: {
          author: { select: { id: true, name: true, email: true, imageUrl: true } },
        },
      }),
      db.answer.update({
        where: { id }, // Use destructured id
        data: { commentCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json(
      { success: true, comment, totalComments: updatedAnswer.commentCount },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error posting comment:", error);
    return NextResponse.json({ success: false, error: "Failed to post comment" }, { status: 500 });
  }
}

// GET handler with Promise params
export async function GET(
  request: Request,
  context: Context
) {
  try {
    const { id } = await context.params;

    const answer = await db.answer.findUnique({ where: { id } });
    if (!answer) {
      return NextResponse.json({ success: false, error: "Answer not found" }, { status: 404 });
    }

    const comments = await db.comment.findMany({
      where: { answerId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        body: true,
        createdAt: true,
        author: { select: { id: true, name: true, imageUrl: true } },
      },
    });

    return NextResponse.json({
      success: true,
      comments,
      totalComments: answer.commentCount,
    });
  } catch (error) {
    console.error("[COMMENTS_GET]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch comments" }, { status: 500 });
  }
}
