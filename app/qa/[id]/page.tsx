"use client";

import { useParams, useRouter } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import QuestionUpvote from "@/components/question-upvote";
import AnswersList from "@/components/AnswerList";
import { timeAgo } from "@/lib/utils";

// Update the Question interface to be more specific about user IDs
interface Question {
  user: string;
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string; // Add this field
  Userid: string;
  author: {
    id: string;
    name?: string;
    imageUrl?: string;
  };
  _count: { votes: number, answers: number };
  userVote?: number;
  totalVotes?: number;
}

export default function QuestionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser(); // Move useUser hook to top level

  // Fetch question with React Query
  const {
    data: question,
    isLoading: questionLoading,
    error: questionError,
    refetch: refetchQuestion
  } = useQuery({
    queryKey: ['question', id],
    queryFn: async () => {
      const res = await fetch(`/api/qa/question/${id}`);
      if (!res.ok) throw new Error("Failed to fetch question");
      return res.json() as Promise<Question>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes freshness
  });
  console.log("Question Data:", question);



  if (questionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101A23]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6286A9] mx-auto"></div>
          <p className="mt-4 text-[#6286A9]">Loading question...</p>
        </div>
      </div>
    );
  }

  if (questionError || !question) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#101A23]">
        <p className="text-center py-10 text-gray-400">Question not found</p>
        <button 
          onClick={() => router.push('/qa')}
          className="mt-4 px-4 py-2 bg-[#6286A9] text-white rounded-lg hover:bg-[#4a6b8a] transition"
        >
          Back to Questions
        </button>
      </div>
    );
  }

  // Add this debug log to check IDs
  console.log('User IDs:', {
    questionUserId: question?.Userid,
    currentUserId: user?.id,
    authorId: question?.author?.id
  });

  return (
    <>
      <SignedIn>
        {/* Mobile Header */}
        <div className="lg:hidden relative  bg-[#182634] py-4">
          <button
              onClick={() => router.back()}
              className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex items-center text-[#E7EDF4] hover:text-[#6286A9]"
            >
              <i className="ri-arrow-left-line mr-2 text-lg"></i>
          </button>

          <div className="text-center font-bold text-lg text-white">Question</div>
        </div>

        <div className="p-4 py-5 lg:pt-20 pb-28 min-h-screen bg-[#101A23] text-white">
          {/* Desktop Back Button */}
          <div className="hidden lg:block mb-6">
            <Link
              href="/qa"
              className="inline-flex items-center text-[#E7EDF4] hover:text-[#6286A9] transition"
            >
              <i className="ri-arrow-left-line mr-2 text-lg"></i>
              Back to Questions
            </Link>
          </div>

          {/* Question Section */}
          <div className="bg-[#182634] rounded-xl py-6 px-2 mb-8 shadow-lg">
            <div className="flex gap-3">
              {/* Left Column: Votes & Author Image */}
              <div className="flex flex-col pb-4 items-center justify-between ">
                <div className="flex flex-col gap-1 items-center space-y-4">

                {/* Author Image */}
                {question.author?.imageUrl ? (
                  <div className="w-12 h-12 overflow-hidden rounded-full">
                    <img
                      src={question.author.imageUrl}
                      alt={question.author.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-500 flex items-center justify-center text-white"> {/* Changed from rounded-full to rounded-lg */}
                    {question.author?.name?.charAt(0) || "U"}
                  </div>
                )}
              {/* Votes */}
                <QuestionUpvote
                  questionId={question.id}
                  initialVotes={question.totalVotes ?? 0} 
                  userVote={question.userVote ?? null} 
                />
                </div>
                
              </div>

              {/* Right Column: Question Content */}
              <div className="flex flex-col justify-between">
                <div>

                {/* Question Title */}
                <h1 className="text-2xl capitalize md:text-3xl font-bold mb-3">
                  {question.title}
                </h1>

                {/* Question Description */}
                <div 
                  className="text-[#9CA3AF] self-stretch capitalize table-styles mb-4 break-words prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: question.description }}
                />
                </div>

                {/* Author Info */}
                <div className="flex items-center text-[#6A717F]">
                  <div className="text-xs flex  gap-1 font-medium mr-2">
                    Asked by {question.author?.name 
                      ? (question.author.name.toLowerCase().startsWith('user') 
                         ? question.author.name.slice(0, 12) + (question.author.name.length > 12 ? '...' : '')
                         : question.author.name)
                      : "Anonymous"},
                    <p className="text-xs">
                      {question.updatedAt !== question.createdAt ? (
                        <div className="flex flex-col">
                          <span className="text-[#6A717F] mb-2 ">{timeAgo(question.createdAt)}</span>
                          <span className="text-[#4A90E2]  ">Edited {timeAgo(question.updatedAt)}</span>
                        </div>
                      ) : (
                        timeAgo(question.createdAt)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Answers List Component */}
          <AnswersList questionId={question.id} />

        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
