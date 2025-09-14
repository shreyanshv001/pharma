import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/get-user";

interface Context {
  params: Promise<{ id: string }>;

}

// ✅ DELETE a comment
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser();
    if(!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const comment = await db.comment.findUnique({ where: { id } });
    if (!comment)
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    if (comment.authorId !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db.comment.delete({ where: { id } });

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
