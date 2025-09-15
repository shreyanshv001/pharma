"use client";

import { 
  useInfiniteQuery, 
  useMutation, 
  useQueryClient, 
  InfiniteData 
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import AnswerUpvote from "@/components/Answer-voting";
import { timeAgo } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import CommentSection from "./CommentSection";

// Dynamically import Jodit Editor to avoid SSR issues
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-slate-800/60 rounded-lg animate-pulse min-h-[150px] border border-slate-700/30"></div>
  ),
});

interface Author {
  id: string;
  name?: string;
  imageUrl?: string;
}

// Define Question type for the question cache update
interface Question {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  author: Author;
  _count: { 
    votes: number;
    answers: number;
  };
  userVote?: number;
  totalVotes?: number;
}

interface Answer {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  totalVotes: number;
  userVote?: number;
  totalComments: number;
}

interface AnswersResponse {
  answers: Answer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalAnswers: number;
    remainingAnswers: number;
    hasMore: boolean;
  };
}

interface AnswersListProps {
  questionId: string;
}

export default function AnswersList({ questionId }: AnswersListProps) {
  const queryClient = useQueryClient();
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef(null);
  const [answerText, setAnswerText] = useState("");
  const isSubmitting = useRef(false);

  const { user } = useUser();

  // Editor configuration with pharmaceutical theme
  const config = {
    readonly: false,
    height: 300,
    placeholder: "Share your pharmaceutical knowledge and provide a detailed answer...",
    theme: "dark",
    buttons: [
      'bold', 
      'italic', 
      'underline', 
      'ul', 
      'ol',
      'paragraph',
      'align',
      'hr',
      'link',
      'image',
      'table',
      'undo', 
      'redo'
    ],
    buttonsMD: [
      'bold', 
      'italic', 
      'underline', 
      'ul', 
      'ol',
      'paragraph',
      'align',
      'hr',
      'link',
      'image',
      'table',
      'undo', 
      'redo'
    ],
    buttonsSM: [
      'bold', 
      'italic', 
      'underline', 
      'ul', 
      'ol',
      'paragraph',
      'align',
      'hr',
      'link',
      'image',
      'table',
      'undo', 
      'redo'
    ],
    buttonsXS: [
      'bold', 
      'italic', 
      'underline', 
      'ul', 
      'ol',
      'paragraph',
      'align',
      'hr',
      'link',
      'image',
      'table',
      'undo', 
      'redo'
    ],
    style: {
      background: 'rgb(51, 65, 85)',  // slate-700 to match theme
      color: '#E2E8F0',               // slate-200 for better readability
      wordBreak: "break-word",
      overflowWrap: "break-word",
      whiteSpace: "pre-wrap",
    },
    uploader: {
      insertImageAsBase64URI: true
    },
    toolbarAdaptive: false,
    toolbarSticky: true,
    allowResizeX: false,
    allowResizeY: true,
  };

  // ✅ Infinite Query for answers
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<AnswersResponse>({
    queryKey: ["answers", questionId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/qa/question/${questionId}/answers?page=${pageParam}`);
      if (!res.ok) throw new Error("Failed to fetch answers");
      return res.json();
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.currentPage + 1 : undefined,
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
  
  // Define the type for the mutation response
  interface PostAnswerResponse {
    answer: Answer;
    message: string;
  }

  // ✅ Mutation for posting a new answer
  const postAnswerMutation = useMutation<
    PostAnswerResponse, 
    Error, 
    { description: string }
  >({
    mutationFn: async (newAnswer: { description: string }) => {
      const res = await fetch(`/api/qa/question/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnswer),
      });
      if (!res.ok) throw new Error("Failed to post answer");
      return res.json();
    },
    onSuccess: (data) => {
      // Update the answers cache with proper TypeScript type
      queryClient.setQueryData<InfiniteData<AnswersResponse>>(
        ["answers", questionId], 
        (oldData: InfiniteData<AnswersResponse> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: [
              {
                ...oldData.pages[0],
                answers: [data.answer, ...oldData.pages[0].answers], // prepend
                pagination: {
                  ...oldData.pages[0].pagination,
                  totalAnswers: oldData.pages[0].pagination.totalAnswers + 1,
                },
              },
              ...oldData.pages.slice(1),
            ],
          };
        }
      );

      // Update the question cache to increment the answer count
      queryClient.setQueryData<Question>(
        ["question", questionId], 
        (oldQuestion: Question | undefined) => {
          if (!oldQuestion) return oldQuestion;
          return {
            ...oldQuestion,
            _count: {
              ...oldQuestion._count,
              answers: (oldQuestion._count.answers || 0) + 1
            }
          };
        }
      );
    },
  });

  // Handle answer submission
  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || isSubmitting.current) return;
    
    isSubmitting.current = true;
    postAnswerMutation.mutate(
      { description: answerText },
      {
        onSettled: () => {
          isSubmitting.current = false;
          setAnswerText(""); // Clear the input field
        }
      }
    );
  };

  // ✅ Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Total answers across all pages
  const totalAnswers = data?.pages[0]?.pagination.totalAnswers || 0;

  return (
    <div className="">
      {/* Answer Form with Jodit Editor */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700/30 shadow-xl overflow-hidden">
        <div className="p-2 lg:p-6 bg-slate-700/30 border-b border-slate-700/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
              <i className="ri-edit-line text-blue-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-white">Share Your Answer</h3>
          </div>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Provide a comprehensive answer based on your pharmaceutical knowledge and experience.
          </p>
        </div>

        <div className="px-3 py-5">
          <div className="flex gap-4">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-600 shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold border-2 border-slate-600 shadow-lg">
                  {user?.firstName?.[0] || user?.username?.[0] || "U"}
                </div>
              )}
            </div>

            {/* Answer Form */}
            <div className="flex-1">
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <div className="bg-slate-700/40 rounded-xl border border-slate-600/30 overflow-hidden">
                  <div className="jodit-editor-wrapper">
                    <JoditEditor
                      ref={editorRef}
                      value={answerText}
                      config={config}
                      onBlur={(content) => setAnswerText(content)} 
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={postAnswerMutation.isPending || isSubmitting.current || !answerText.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {postAnswerMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        <span>Posting Answer...</span>
                      </div>
                    ) : (
                      <>
                        <i className="ri-send-plane-line mr-2"></i>
                        Post Answer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      {totalAnswers > 0 && (
        <div className="flex items-center gap-3 mt-6 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
            <i className="ri-question-answer-line text-blue-400"></i>
          </div>
          <h2 className="text-xl font-semibold text-white">
            {totalAnswers === 1 ? "1 Answer" : `${totalAnswers} Answers`}
          </h2>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/60 rounded-full mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-400 border-t-transparent"></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading Answers</h3>
          <p className="text-slate-400">Please wait while we fetch the responses...</p>
        </div>
      ) : (
        <>
          {/* Render all answers */}
          <div className="space-y-6">
            {data?.pages.map((page, pageIndex) =>
              page.answers.map((answer, index) => (
                <AnswerCard 
                  key={answer.id} 
                  answer={answer} 
                  questionId={questionId}
                  index={index}
                />
              ))
            )}
          </div>

          {/* Empty state */}
          {totalAnswers === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 rounded-full mb-6">
                <i className="ri-chat-3-line text-2xl text-slate-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-300 mb-4">No Answers Yet</h3>
              <p className="text-slate-400 leading-relaxed max-w-md mx-auto">
                Be the first to share your pharmaceutical expertise and help answer this question.
              </p>
            </div>
          )}

          {/* Infinite scroll loader */}
          {hasNextPage && (
            <div ref={loaderRef} className="text-center py-8">
              {isFetchingNextPage ? (
                <div className="inline-flex items-center space-x-3 text-slate-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-400 border-t-transparent"></div>
                  <span className="font-medium">Loading more answers...</span>
                </div>
              ) : (
                <p className="text-slate-500 font-medium">Scroll down to load more</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Custom Jodit Styling */}
      <style jsx global>{`
        .jodit-editor-wrapper .jodit-container {
          border: none !important;
          background: rgb(51, 65, 85) !important;
        }
        .jodit-editor-wrapper .jodit-toolbar {
          background: rgb(30, 41, 59) !important;
          border-bottom: 1px solid rgb(71, 85, 105) !important;
        }
        .jodit-editor-wrapper .jodit-workplace {
          background: rgb(51, 65, 85) !important;
        }
        .jodit-editor-wrapper .jodit-wysiwyg {
          background: rgb(51, 65, 85) !important;
          color: rgb(226, 232, 240) !important;
          min-height: 150px !important;
        }
        .jodit-editor-wrapper .jodit-toolbar-button {
          color: rgb(148, 163, 184) !important;
        }
        .jodit-editor-wrapper .jodit-toolbar-button:hover {
          background: rgb(71, 85, 105) !important;
          color: rgb(226, 232, 240) !important;
        }
        .jodit-editor-wrapper .jodit-toolbar-button.jodit-toolbar-button_active {
          background: rgb(59, 130, 246) !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}

// ✅ Answer Card Component
function AnswerCard({ 
  answer, 
  questionId, 
  index 
}: { 
  answer: Answer; 
  questionId: string;
  index: number;
}) {
  return (
    <div 
      className="bg-slate-800/60 rounded-xl border  border-slate-700/30 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-500/20"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="py-6  px-2 lg:px-6">
        <div className="flex  gap-2 lg:gap-6  ">
          {/* Left Column: User Image & Votes */}
          <div className="flex flex-col  py-2 items-center space-y-4 flex-shrink-0">
            {/* Author Image */}
            {answer.author?.imageUrl ? (
              <div className="w-10 h-10 lg:w-14 lg:h-14 overflow-hidden rounded-full border-2 border-slate-600 shadow-lg">
                <img
                  src={answer.author.imageUrl}
                  alt={answer.author.name || "User"}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-6 h-6 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold text-lg border-2 border-slate-600 shadow-lg">
                {answer.author?.name?.charAt(0) || "U"}
              </div>
            )}

            {/* Votes */}
            <AnswerUpvote
              answerId={answer.id}
              initialVotes={answer.totalVotes}
              initialUserVote={answer.userVote ?? null}
            />
          </div>

          {/* Right Column: Answer Content & Meta */}
          <div className="flex justify-between flex-col min-full ">
            {/* Answer Content */}
            <div className="bg-slate-700/20 rounded-xl lg:p-6 py-4 px-2  mb-4 border border-slate-600/20">
              <div
                className="text-slate-300 leading-relaxed table-styles prose prose-invert max-w-none prose-headings:text-white prose-strong:text-white prose-em:text-slate-300 prose-code:text-blue-300 prose-code:bg-slate-800/50 prose-pre:bg-slate-800/50 prose-pre:border prose-pre:border-slate-600/30 whitespace-pre-wrap break-words overflow-wrap-anywhere"
                dangerouslySetInnerHTML={{ __html: answer.content }}
              />
            </div>

            {/* Meta Information */}
            <div className="flex text-xs items-center justify-between w-full gap-3 lg:text-sm text-slate-400 lg:mb-4">
              <div className="flex items-center gap-2">
                <i className="ri-user-line text-blue-400"></i>
                <span className="font-medium text-slate-300">
                  {answer.author?.name
                    ? (answer.author.name.toLowerCase().startsWith('user')
                      ? answer.author.name.slice(0, 12) + (answer.author.name.length > 12 ? '...' : '')
                      : answer.author.name)
                    : "Anonymous"}
                </span>
              </div>
              
              {/* <div className="w-1 h-1 bg-slate-500 rounded-full"></div> */}
              
              <div className="flex items-center gap-2">
                <i className="ri-time-line text-green-400"></i>
                  <span>Answered {timeAgo(answer.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-4 pt-1 border-t border-slate-700/30">
          <CommentSection
            answerId={answer.id} 
            totalComments={answer.totalComments} 
          />
        </div>
      </div>
    </div>
  );
}
