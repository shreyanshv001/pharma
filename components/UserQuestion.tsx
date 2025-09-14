"use client";

import { useUser } from "@clerk/nextjs";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

interface Question {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  totalVotes: number;
  totalAnswers: number;
}

interface QuestionsResponse {
  success: boolean;
  questions: Question[];
  nextCursor?: string;
}

export default function UserQuestions() {
  const { user } = useUser();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<QuestionsResponse>({
    queryKey: ["userQuestions"],
    queryFn: async ({ pageParam = "" }) => {
      const res = await fetch(`/api/user/question?cursor=${pageParam}`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: "",
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Merge all questions from all pages
  const questions = data?.pages.flatMap((page) => page.questions) ?? [];

  // Add delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const res = await fetch(`/api/user/question/${questionId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete question');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userQuestions'] });
      setDeleteConfirm(null);
    },
  });

  if (isLoading) {
    return <QuestionSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-400">
        Error loading questions. Please try again.
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        You haven&apos;t asked any questions yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <div key={question.id}>
          {/* Delete Confirmation Modal */}
          {deleteConfirm === question.id && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[#182634] p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-[#E7EDF4] mb-4">
                  Delete Question
                </h3>
                <p className="text-[#9CA3AF] mb-6">
                  Are you sure you want to delete this question? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-sm text-[#9CA3AF] hover:text-[#E7EDF4] transition-colors"
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(question.id)}
                    disabled={deleteMutation.isPending}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="block bg-[#182634] p-4 rounded-lg hover:bg-[#223243] transition-colors relative">
            {/* Top section with author and action menu */}
            <div className="flex justify-between items-center mb-4">
              {/* Author Info from Clerk */}
              <div className="flex items-center gap-2">
                <img
                  src={user?.imageUrl || "/default-avatar.png"}
                  alt={user?.username || "User"}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm text-[#9CA3AF]">
                  { user?.fullName || user?.id || "User"}
                </span>
              </div>

              {/* Action Menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveMenu(activeMenu === question.id ? null : question.id);
                  }}
                  className="text-[#9CA3AF] hover:text-[#E7EDF4] transition-colors p-2"
                >
                  <i className="ri-more-2-fill text-xl" />
                </button>

                {/* Dropdown Menu */}
                {activeMenu === question.id && (
                  <div className="absolute right-0 top-full mt-1 bg-[#223243] rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                    <Link
                      href={`/qa/${question.id}/edit`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[#E7EDF4] hover:bg-[#2a3a4a] transition-colors"
                      onClick={() => setActiveMenu(null)}
                    >
                      <i className="ri-edit-line" />
                      Edit
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveMenu(null);
                        setDeleteConfirm(question.id);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[#2a3a4a] transition-colors w-full"
                    >
                      <i className="ri-delete-bin-line" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Question Content - wrapped in Link */}
            <Link href={`/qa/${question.id}`}>
              <h3 className="text-lg font-semibold text-[#E7EDF4] mb-2">
                {question.title}
              </h3>
              <div
                className="text-[#9CA3AF] prose px-1 py-2 table-styles mb-4 prose-invert max-w-none 
                        whitespace-pre-wrap break-words overflow-wrap-anywhere"
                dangerouslySetInnerHTML={{ __html: question.description }}
              />

              <div className="flex items-center text-sm text-[#9CA3AF] gap-4">
                <span>{timeAgo(question.createdAt)}</span>
                <span>{question.totalVotes} votes</span>
                <span>{question.totalAnswers} answers</span>
              </div>
            </Link>
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      <div ref={observerRef} className="py-4 text-center text-[#9CA3AF]">
        {isFetchingNextPage
          ? "Loading more..."
          : hasNextPage
          ? "Scroll for more"
          : "No more questions"}
      </div>
    </div>
  );
}

// Loading skeleton component
function QuestionSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-[#182634] p-4 rounded-lg animate-pulse"
        >
          <div className="h-6 bg-[#223243] rounded w-3/4 mb-2"></div>
          <div className="flex gap-4">
            <div className="h-4 bg-[#223243] rounded w-20"></div>
            <div className="h-4 bg-[#223243] rounded w-20"></div>
            <div className="h-4 bg-[#223243] rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}