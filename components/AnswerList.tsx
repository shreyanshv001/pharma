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
    <div className="w-full bg-[#101A23] rounded-lg animate-pulse min-h-[150px]"></div>
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
  updatedAt: string; // Add this field
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

  const {user} = useUser();

  // Editor configuration
  const config = {
    readonly: false,
    height: 200,
    placeholder: "Write your answer here...",
    theme: "dark",
    buttons: [
      'bold', 
      'italic', 
      'underline', 
      'ul', 
      'ol',
      'paragraph', // Add paragraph dropdown (contains alignment options)
      'align', // Explicit alignment buttons
      'hr', // Horizontal rule/line
      'link',
      'image',
      'table',
      'undo', 
      'redo'
    ],
    // Same buttons for all screen sizes
    buttonsMD: [
      'bold', 
      'italic', 
      'underline', 
      'ul', 
      'ol',
      'paragraph', // Add paragraph dropdown (contains alignment options)
      'align', // Explicit alignment buttons
      'hr', // Horizontal rule/line
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
      'paragraph', // Add paragraph dropdown (contains alignment options)
      'align', // Explicit alignment buttons
      'hr', // Horizontal rule/line
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
      'paragraph', // Add paragraph dropdown (contains alignment options)
      'align', // Explicit alignment buttons
      'hr', // Horizontal rule/line
      'link',
      'image',
      'table',
      'undo', 
      'redo'
    ],
    style: {
      background: '#374151',  // Dark background to match your theme
      color: '#E5E7EB',       // Light text color,
      wordBreak: "break-word",
      overflowWrap: "break-word",
      whiteSpace: "pre-wrap",

    },
    uploader: {
      insertImageAsBase64URI: true
    },
    toolbarAdaptive: false,   // Disable toolbar adaptation to maintain same buttons
    toolbarSticky: true,      // Keep toolbar visible when scrolling
    allowResizeX: false,      // Prevent horizontal resizing
    allowResizeY: true,       // Allow vertical resizing
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // cache for 5 minutes
  });
  console.log("Answers Data:", data);
  
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
    <div className="space-y-6">
      

      {/* Answer Form with Jodit Editor */}
      <div className="mb-8 bg-[#182634] rounded-xl py-5 px-3 shadow-lg">
        <h3 className="text-lg font-semibold  mb-4">Post your answer</h3>
        <div className="flex gap-3 ">
          <img
            src={user?.imageUrl || "/default-profile.png"}
            className="w-10 h-10 rounded-full object-cover"
          />
          <form onSubmit={handleSubmitAnswer}>
            <div className="editor-container break-words whitespace-pre-wrap  jodit-dark mb-4">
              <JoditEditor
                ref={editorRef}
                value={answerText}
                config={config}
                onBlur={(content) => setAnswerText(content)} 
                
              />
            </div>
            <div className="flex justify-end mt-4">
              <button 
                type="submit"
                disabled={postAnswerMutation.isPending || isSubmitting.current || !answerText.trim()}
                className="px-4 w-full py-2 bg-[#137FEC] font-semibold text-white rounded-lg hover:bg-blue-700 transition  disabled:cursor-not-allowed"
              >
                {postAnswerMutation.isPending ? (
                  <div className="flex justify-center items-center">
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    <span>Posting...</span>
                  </div>
                ) : (
                  "Post Answer"
                )}
              </button>
            </div>
        </form>

      </div>
    </div>
      {/* Answers Section Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Answers ({totalAnswers})
        </h2>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="text-center py-6">
          <div className="animate-spin h-8 w-8 border-b-2 border-[#6286A9] mx-auto rounded-full"></div>
          <p className="mt-2 text-gray-400">Loading answers...</p>
        </div>
      ) : (
        <>
          {/* Render all answers */}
          {data?.pages.map((page, pageIndex) =>
            page.answers.map((answer) => (
              <AnswerCard key={answer.id} answer={answer} questionId={questionId} />
            ))
          )}

          {/* Empty state */}
          {totalAnswers === 0 && (
            <div className="text-center py-8 text-gray-400">
              Be the first to answer this question!
            </div>
          )}

          {/* Infinite scroll loader */}
          {hasNextPage && (
            <div ref={loaderRef} className="flex justify-center py-6">
              {isFetchingNextPage && (
                <div className="animate-spin h-6 w-6 border-b-2 border-[#6286A9] rounded-full"></div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ✅ Answer Card Component
function AnswerCard({ answer, questionId }: { answer: Answer, questionId: string }) {
  return (
    <div className="bg-[#182634] py-6 px-2 rounded-xl p-6 shadow-lg">
      <div className="flex gap-6">
        {/* Left Column: User Image & Votes */}
        <div className="flex flex-col items-center space-y-4">
          {/* Author Image */}
          {answer.author?.imageUrl ? (
            <img
              src={answer.author.imageUrl}
              alt={answer.author.name || "User"}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center text-white">
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
        <div className="flex flex-col justify-between">
          {/* Answer Content */}
          <div
            className="text-[#D1D5DB] prose px-1 py-2 table-styles mb-4 prose-invert max-w-none 
                      whitespace-pre-wrap break-words overflow-wrap-anywhere"
            dangerouslySetInnerHTML={{ __html: answer.content }}
          />

          {/* Meta Information */}
          <div className="flex flex-col gap-2 text-gray-400">
            {/* Author & Time with Edit Status */}
            <div className="flex items-center text-xs">
              <span>
                Answered by {answer.author?.name
                  ? (answer.author.name.toLowerCase().startsWith('user')
                    ? answer.author.name.slice(0, 12) + (answer.author.name.length > 12 ? '...' : '')
                    : answer.author.name)
                  : "Anonymous"}, 
                {answer.updatedAt !== answer.createdAt ? (
                  <span className="ml-1">
                    <span className="text-[#6A717F]">{timeAgo(answer.createdAt)}</span>
                    <span className="text-[#6A717F] mx-1">•</span>
                    <span className="text-[#4A90E2]">edited {timeAgo(answer.updatedAt)}</span>
                  </span>
                ) : (
                  <span className="ml-1">{timeAgo(answer.createdAt)}</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-2 mt-4">

            <CommentSection
              answerId={answer.id} 
              totalComments={answer.totalComments} 
            />
      </div>
    </div>
  );
}

// Make sure to add the CSS for Jodit Dark theme to your globals.css
