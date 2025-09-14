import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/get-user";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description } = await req.json();
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Ensure Prisma user exists
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create question
    const question = await db.question.create({
      data: {
        title,
        description,
        authorId: user.id,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/qa/post-question:", error);

    // Ensure frontend always gets valid JSON
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
