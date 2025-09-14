"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

interface Answer {
  id: string;
  content: string; // This matches the API response now
  createdAt: string;
  question: {
    id: string;
    title: string;
  };
  _count: {
    votes: number;
    comments: number;
  };
}

interface AnswersResponse {
  success: boolean;
  answers: Answer[];
  nextCursor?: string;
}

export default function UserAnswers() {
  const observerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Add delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (answerId: string) => {
      const res = await fetch(`/api/user/answer/${answerId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete answer');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAnswers'] });
      setDeleteConfirm(null);
    },
  });

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<AnswersResponse>({
    queryKey: ["userAnswers"],
    queryFn: async ({ pageParam = "" }) => {
      const res = await fetch(`/api/user/answer?cursor=${pageParam}`);
      if (!res.ok) throw new Error("Failed to fetch answers");
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

  // Merge all answers from all pages
  const answers = data?.pages.flatMap((page) => page.answers) ?? [];

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu && !(event.target as Element).closest('.action-menu')) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu]);

  if (isLoading) {
    return <AnswerSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-400">
        Error loading answers. Please try again.
      </div>
    );
  }

  if (answers.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        You haven&apos;t answered any questions yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {answers.map((answer) => (
        <div key={answer.id}>
          {/* Delete Confirmation Modal */}
          {deleteConfirm === answer.id && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[#182634] p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-[#E7EDF4] mb-4">
                  Delete Answer
                </h3>
                <p className="text-[#9CA3AF] mb-6">
                  Are you sure you want to delete this answer? This action cannot be undone.
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
                    onClick={() => deleteMutation.mutate(answer.id)}
                    disabled={deleteMutation.isPending}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[#182634] p-6 rounded-lg hover:bg-[#1d2b3a] transition-colors">
            {/* Top section with author and action menu */}
            <div className="flex justify-between items-center mb-4">
              {/* Author Info */}
              <div className="flex items-center gap-2">
                <img
                  src={user?.imageUrl || "/default-avatar.png"}
                  alt={user?.username || "User"}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm text-[#9CA3AF]">
                  {user?.username || user?.firstName || "User"}
                </span>
              </div>

              {/* Action Menu */}
              <div className="relative action-menu">
                <button
                  onClick={() => setActiveMenu(activeMenu === answer.id ? null : answer.id)}
                  className="text-[#9CA3AF] hover:text-[#E7EDF4] transition-colors p-2"
                >
                  <i className="ri-more-2-fill text-xl" />
                </button>

                {/* Dropdown Menu */}
                {activeMenu === answer.id && (
                  <div className="absolute right-0 top-full mt-1 bg-[#223243] rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                    <Link
                      href={`/qa/answer/${answer.id}/edit`}
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
                        setDeleteConfirm(answer.id);
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

            {/* Question Title with Link */}
            <div className="mb-4 flex justify-between items-start">
              <Link
                href={`/qa/${answer.question.id}`}
                className="text-lg font-semibold text-[#E7EDF4] hover:text-[#6286A9] transition-colors"
              >
                {answer.question.title}
              </Link>
            </div>

            {/* Answer Content */}
            <div
              className="text-[#D1D5DB] prose px-1 py-2 table-styles mb-4 prose-invert max-w-none 
                      whitespace-pre-wrap break-words overflow-wrap-anywhere"
              dangerouslySetInnerHTML={{ __html: answer.content }}
            />

            {/* Meta Information */}
            <div className="flex items-center justify-between text-sm text-[#9CA3AF]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <i className="ri-thumb-up-line" />
                  {answer._count.votes} votes
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-chat-1-line" />
                  {answer._count.comments} comments
                </span>
                <span>{timeAgo(answer.createdAt)}</span>
              </div>

            </div>
              <Link
                href={`/qa/${answer.question.id}`}
                className="text-[#6286A9] mt-2 hover:text-[#7ba0c7] transition-colors flex items-center gap-1"
              >
                View Question
                <i className="ri-arrow-right-line" />
              </Link>
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      <div ref={observerRef} className="py-4 text-center text-[#9CA3AF]">
        {isFetchingNextPage ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin h-5 w-5 border-b-2 border-[#6286A9] rounded-full" />
            Loading more...
          </div>
        ) : hasNextPage ? (
          "Scroll for more"
        ) : (
          "No more answers"
        )}
      </div>
    </div>
  );
}

function AnswerSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-[#182634] p-4 rounded-lg animate-pulse"
        >
          <div className="h-6 bg-[#223243] rounded w-3/4 mb-2"></div>
          <div className="h-16 bg-[#223243] rounded w-full mb-2"></div>
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