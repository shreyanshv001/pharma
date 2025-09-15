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

  if (questionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/60 rounded-full mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-400 border-t-transparent"></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading Question</h3>
            <p className="text-slate-400">Please wait while we fetch the details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (questionError || !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
        <div className="relative min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-6">
              <i className="ri-question-answer-line text-2xl text-red-400"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-300 mb-4">Question Not Found</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              The requested question could not be found. It may have been removed or the link is incorrect.
            </p>
            <button 
              onClick={() => router.push('/qa')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <i className="ri-arrow-left-line"></i>
              Back to Questions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-br pb-20 from-slate-950 via-slate-900 to-slate-950">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
          
          <div className="relative">
            {/* Mobile Header */}
            <div className="lg:hidden bg-slate-800/60 border-b border-slate-700/30 shadow-xl">
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-xl transition-all duration-300"
                >
                  <i className="ri-arrow-left-line text-lg"></i>
                </button>
                
                <div className="flex items-center gap-2">
                  <i className="ri-question-answer-line text-blue-400"></i>
                  <span className="font-semibold text-2xl text-white">Question</span>
                </div>
                
                <div className="w-12"></div> {/* Spacer */}
              </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-6 lg:pt-20 ">
              {/* Desktop Back Button */}
              <div className="hidden lg:block mb-8">
                <Link
                  href="/qa"
                  className="inline-flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-300 hover:scale-105 group"
                >
                  <i className="ri-arrow-left-line text-lg group-hover:-translate-x-1 transition-transform duration-300"></i>
                  Back to Q&A Community
                </Link>
              </div>

              <div className="max-w-5xl mx-auto">
                {/* Question Section */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/30 shadow-xl overflow-hidden mb-8">
                  <div className="py-5 px-1 lg:p-8">
                    <div className="flex gap-2 lg:gap-6 ">
                      {/* Left Column: User Image & Votes */}
                      <div className="flex flex-col items-center space-y-4 flex-shrink-0">
                        {/* Author Image */}
                        {question.author?.imageUrl ? (
                          <div className="w-12 h-12 lg:w-14 lg:h-14 overflow-hidden rounded-full border-2 border-slate-600 shadow-lg">
                            <img
                              src={question.author.imageUrl}
                              alt={question.author.name || "User"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold text-lg border-2 border-slate-600 shadow-lg">
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

                      {/* Right Column: Question Content */}
                      <div className="flex flex-col min-w-0 justify-between ">
                        <div  className="flex-1 min-w-0">

                          {/* Question Title */}
                          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 leading-tight capitalize">
                            {question.title}
                          </h1>

                          {/* Question Description */}
                          <div 
                            className="text-slate-300 leading-relaxed capitalize table-styles mb-6 prose prose-invert max-w-none prose-headings:text-white prose-strong:text-white prose-em:text-slate-300 prose-code:text-blue-300 prose-code:bg-slate-800/50 prose-pre:bg-slate-800/50 prose-pre:border prose-pre:border-slate-600/30"
                            dangerouslySetInnerHTML={{ __html: question.description }}
                          />
                        </div>

                        {/* Question Stats */}
                        <div className="flex items-center justify-between text-xs px-2 py-2 bg-slate-700/30 rounded-lg border border-slate-600/30">
                         
                            <div className="flex items-center gap-1">
                              <i className="ri-user-line text-blue-400"></i>
                              <span className="font-medium text-xs text-slate-300">
                                Asked by {question.author?.name 
                                  ? (question.author.name.toLowerCase().startsWith('user') 
                                    ? question.author.name.slice(0, 12) + (question.author.name.length > 12 ? '...' : '')
                                    : question.author.name)
                                  : "Anonymous"}
                              </span>
                            </div>
                            
                            <div className="flex text-xs items-center gap-1">
                              <i className="ri-time-line text-green-400"></i>
                              <span className="text-slate-400">{timeAgo(question.createdAt)}</span>
                            </div>
                       
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

                {/* Answers Section */}
                <div className="py-3 rounded-xl border border-slate-700/30  shadow-xl overflow-hidden">
                  <div className="p-2 lg:p-8 border-b border-slate-700/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                        <i className="ri-chat-3-line text-blue-400"></i>
                      </div>
                      <h2 className="text-xl font-semibold text-white">
                        {question._count.answers === 0 
                          ? "No answers yet" 
                          : question._count.answers === 1 
                            ? "1 Answer" 
                            : `${question._count.answers} Answers`
                        }
                      </h2>
                    </div>
                    
                    {question._count.answers === 0 && (
                      <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                        Be the first to help by providing an answer to this pharmaceutical question.
                      </p>
                    )}
                  </div>
                  
                  <div className="p-2 lg:p-8">
                    <AnswersList questionId={question.id} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
