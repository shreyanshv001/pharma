import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeAgo } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';

interface Author {
  name?: string;
  imageUrl?: string;
}

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: Author;
}

interface CommentSectionProps {
  answerId: string;
  totalComments: number;
}

export default function CommentSection({ answerId, totalComments: initialTotalComments }: CommentSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [localTotalComments, setLocalTotalComments] = useState(initialTotalComments);
  const queryClient = useQueryClient();
  const { user } = useUser();

  // Fetch comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', answerId],
    queryFn: async () => {
      const res = await fetch(`/api/qa/answer/${answerId}/comments`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      return data.comments;
    },
    enabled: isOpen, // Only fetch when dropdown is open
  });
  // console.log(localTotalComments, "localTotalComments");
  // Update post comment mutation
  const postCommentMutation = useMutation({
    mutationFn: async (body: string) => {
      const res = await fetch(`/api/qa/answer/${answerId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      return res.json();
    },
    onSuccess: (res) => {
      const newComment = res.comment; // ✅ get the actual comment object
      const newTotal = res.totalComments; // ✅ keep it in sync with backend

      queryClient.setQueryData(['comments', answerId], (old: Comment[] = []) => [
        newComment,
        ...old,
      ]);


      setLocalTotalComments(newTotal);

      // Clear input
      setComment('');
    },

  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    postCommentMutation.mutate(comment);
  };

  return (
    <div className="mt-4 ">
      {/* Comments Toggle - Updated to use localTotalComments */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-md flex items-center font-semibold text-[#137FEB]"
      >
        View comments ({localTotalComments})
        <i className={`text-2xl ri-arrow-drop-${isOpen ? 'up' : 'down'}-line`} />
      </button>
      {/* Add Comment Form */}
          <form onSubmit={handleSubmit} className="flex mt-3 gap-2">
            <img
              src={user?.imageUrl || "/default-avatar.png"}
              alt="Your avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-[#223243] text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={postCommentMutation.isPending || !comment.trim()}
              className="bg-[#137FEB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {postCommentMutation.isPending ? '...' : 'Post'}
            </button>
          </form>

      {/* Comments Section */}
      {isOpen && (
        <div className="mt-4 space-y-4">
          

          {/* Comments List */}
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-5 w-5 border-b-2 border-blue-500 rounded-full mx-auto" />
            </div>
          ) : comments?.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment: Comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <img
                    src={comment.author?.imageUrl || "/default-avatar.png"}
                    alt={comment.author?.name || "User"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="bg-[#223243] p-2 px-3 rounded-lg flex-1">
                    <div className="flex gap-3 text-xs text-[#9CA3AF] mb-1">
                      {comment.author?.name?.toLowerCase().startsWith("user")
                        ? comment.author.name.slice(0, 14)
                        : comment.author?.name}
                      <span>{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className=" capitalize text-sm">{comment.body}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-4">No comments yet</p>
          )}
        </div>
      )}
    </div>
  );
}