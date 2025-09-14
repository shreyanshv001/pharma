"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

interface Comment {
    id: string;
    body: string;
    createdAt: string;
    answer: {
        id: string;
        description: string;
        question: {
            id: string;
        };
    };
}

interface CommentsResponse {
    success: boolean;
    comments: Comment[];
    nextCursor?: string;
}

export default function UserComments() {
    const observerRef = useRef<HTMLDivElement>(null);
    const { user } = useUser();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Add delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (commentId: string) => {
            const res = await fetch(`/api/user/comments/${commentId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete comment');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userComments'] });
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
    } = useInfiniteQuery<CommentsResponse>({
        queryKey: ["userComments"],
        queryFn: async ({ pageParam = "" }) => {
            const res = await fetch(`/api/user/comments?cursor=${pageParam}`);
            if (!res.ok) throw new Error("Failed to fetch comments");
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

    const comments = data?.pages.flatMap((page) => page.comments) ?? [];

    if (isLoading) {
        return <CommentsSkeleton />;
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-400">
                Error loading comments. Please try again.
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <div className="text-center py-10 text-gray-400">
                You haven&apos;t made any comments yet.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {comments.map((comment) => (
                <div key={comment.id}>
                    {/* Delete Confirmation Modal */}
                    {deleteConfirm === comment.id && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-[#182634] p-6 rounded-lg max-w-md w-full mx-4">
                                <h3 className="text-lg font-semibold text-[#E7EDF4] mb-4">
                                    Delete Comment
                                </h3>
                                <p className="text-[#9CA3AF] mb-6">
                                    Are you sure you want to delete this comment? This action cannot be undone.
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
                                        onClick={() => deleteMutation.mutate(comment.id)}
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
                        {/* Top section with action menu */}
                        <div className="flex justify-end ">
                            {/* Action Menu */}
                            <div className="relative action-menu">
                                <button
                                    onClick={() => setActiveMenu(activeMenu === comment.id ? null : comment.id)}
                                    className="text-[#9CA3AF] hover:text-[#E7EDF4] transition-colors p-2"
                                >
                                    <i className="ri-more-2-fill text-xl" />
                                </button>

                                {/* Dropdown Menu */}
                                {activeMenu === comment.id && (
                                    <div className="absolute right-0 top-full mt-1 bg-[#223243] rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                                        <button
                                            onClick={() => {
                                                setActiveMenu(null);
                                                setDeleteConfirm(comment.id);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[#2a3a4a] transition-colors w-full text-left"
                                        >
                                            <i className="ri-delete-bin-line" />
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Answer Content */}
                        <div
                            className="text-[#E7EDF4] prose prose-invert max-w-none mb-4 text-sm line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: comment.answer.description }}
                        />

                        {/* Comment Content */}
                        <div className="flex items-start gap-3">
                            <img
                                src={user?.imageUrl || "/default-avatar.png"}
                                alt={user?.username || "User"}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="bg-[#223243] p-3 rounded-lg flex-1">
                                <p className="text-sm text-[#D1D5DB] mb-2">{comment.body}</p>
                                <div className="text-xs text-[#9CA3AF]">
                                    {timeAgo(comment.createdAt)}
                                </div>
                            </div>
                        </div>

                        {/* View Full Discussion Link */}
                        <div className="mt-4 flex justify-end">
                            <Link
                                href={`/qa/${comment.answer.question.id}`}
                                className="text-sm text-[#6286A9] hover:text-[#7ba0c7] transition-colors flex items-center gap-1"
                            >
                                View Full Discussion
                                <i className="ri-arrow-right-line" />
                            </Link>
                        </div>
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
                    "No more comments"
                )}
            </div>
        </div>
    );
}

function CommentsSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="bg-[#182634] p-6 rounded-lg animate-pulse"
                >
                    <div className="h-6 bg-[#223243] rounded w-3/4 mb-4"></div>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-[#223243] rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-16 bg-[#223243] rounded mb-2"></div>
                            <div className="h-4 bg-[#223243] rounded w-24"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}