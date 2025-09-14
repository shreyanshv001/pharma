import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// Default version - just get basic user info, no related data
export const getUser = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  // Check if user exists in DB
  let user = await db.user.findUnique({
    where: { clerkId: clerkUser.id },
    // No includes by default - just get the user record
  });

  // If not, create user in DB
  if (!user) {
    const name = clerkUser.firstName
      ? `${clerkUser.firstName}${clerkUser.lastName ? " " + clerkUser.lastName : ""}`
      : clerkUser.id;

    user = await db.user.create({
      data: {
        clerkId: clerkUser.id,
        name,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        imageUrl: clerkUser.imageUrl,
      },
      // No includes here either
    });
  }

  return user;
};

// Only use this when you actually need questions
export const getUserWithQuestions = async () => {
  const user = await getUser();
  if (!user) return null;

  return db.user.findUnique({
    where: { id: user.id },
    include: { questions: true }, // without answers
  });
};

// Only use this when you need a specific question with its answers
export const getUserQuestion = async (questionId: string) => {
  const user = await getUser();
  if (!user) return null;

  return db.question.findUnique({
    where: {
      id: questionId,
      authorId: user.id,
    },
    include: { answers: true },
  });
};
