import { db } from "@/lib/db";
import { getUser } from "@/lib/get-user";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get cursor from URL
        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get("cursor");
        const limit = 10;

        const comments = await db.comment.findMany({
            where: { authorId: user.id },
            orderBy: { createdAt: "desc" },
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            select: {
                id: true,
                body: true,
                createdAt: true,
                answer: {
                    select: {
                        id: true,
                        description: true,
                        question: {
                            select: {
                                id: true,
                            }
                        }
                    }
                }
            }
        });

        let nextCursor: string | undefined;
        if (comments.length > limit) {
            const nextItem = comments.pop();
            nextCursor = nextItem?.id;
        }

        return NextResponse.json({
            success: true,
            comments,
            nextCursor
        });
    } catch (error) {
        console.error("Error fetching user comments:", error);
        return NextResponse.json(
            { error: "Failed to fetch user comments" },
            { status: 500 }
        );
    }
}