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
    <div className="mt-4">
      <div className="bg-slate-700/30 rounded-xl lg:p-4 px-1 py-4 border border-slate-600/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                <i className="ri-add-line text-sm text-blue-400"></i>
              </div>
              <span className="text-sm font-medium text-slate-300">Add a comment</span>
            </div>
            
            <form onSubmit={handleSubmit} className="flex gap-2 lg:gap-4">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Your avatar"
                    className="w-8 h-8 rounded-full object-cover border border-slate-600"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-medium border border-slate-600">
                    {user?.firstName?.[0] || user?.username?.[0] || "U"}
                  </div>
                )}
              </div>

              {/* Input and Submit */}
              <div className="flex gap-2 lg:gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts or ask for clarification..."
                  className="flex-1 bg-slate-800/60 text-slate-200 rounded-lg lg:px-4 py-2 text-sm border border-slate-600/50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                />
                <button
                  type="submit"
                  disabled={postCommentMutation.isPending || !comment.trim()}
                  className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white px-2 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {postCommentMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="w-3 h-3 border border-t-transparent border-white rounded-full animate-spin mr-1"></div>
                    </div>
                  ) : (
                    <>
                      <i className="ri-send-plane-line mr-1"></i>
                      Post
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
      {/* Comments Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center mt-4 gap-2 px-4 py-2 rounded-xl transition-all duration-300 border ${
          isOpen 
            ? "bg-slate-700/60 border-blue-500/50 text-blue-400" 
            : "bg-slate-800/40 border-slate-600/30 text-slate-400 hover:bg-slate-700/60 hover:border-slate-500/50 hover:text-blue-400"
        }`}
      >
        <i className="ri-chat-3-line text-lg"></i>
        <span className="font-medium">
          {localTotalComments === 0 
            ? "Add comment" 
            : localTotalComments === 1 
              ? "1 comment" 
              : `${localTotalComments} comments`
          }
        </span>
        <i className={`text-lg transition-transform duration-300 ${
          isOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"
        }`} />
      </button>

      {/* Comments Section */}
      {isOpen && (
        <div className="mt-6 space-y-6">
          {/* Add Comment Form */}
          

          {/* Comments List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800/60 rounded-full mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-400 border-t-transparent"></div>
              </div>
              <p className="text-slate-400 text-sm">Loading comments...</p>
            </div>
          ) : comments?.length > 0 ? (
            <div className="space-y-4">
              
              
              {comments.map((comment: Comment, index: number) => (
                <div 
                  key={comment.id} 
                  className="bg-slate-700/20 rounded-xl p-4 border border-slate-600/20 transition-all duration-300 hover:bg-slate-700/30"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex gap-3">
                    {/* Comment Author Avatar */}
                    <div className="flex-shrink-0">
                      {comment.author?.imageUrl ? (
                        <img
                          src={comment.author.imageUrl}
                          alt={comment.author?.name || "User"}
                          className="w-8 h-8 rounded-full object-cover border border-slate-600"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-medium border border-slate-600">
                          {comment.author?.name?.[0] || "U"}
                        </div>
                      )}
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      {/* Comment Meta */}
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                        <span className="font-medium text-slate-300">
                          {comment.author?.name?.toLowerCase().startsWith("user")
                            ? comment.author.name.slice(0, 14) + (comment.author.name.length > 14 ? '...' : '')
                            : comment.author?.name || "Anonymous"}
                        </span>
                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                        <div className="flex items-center gap-1">
                          <i className="ri-time-line text-green-400"></i>
                          <span>{timeAgo(comment.createdAt)}</span>
                        </div>
                      </div>
                      
                      {/* Comment Body */}
                      <p className="text-sm text-slate-300 leading-relaxed capitalize break-words">
                        {comment.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-700/50 rounded-full mb-4">
                <i className="ri-chat-3-line text-xl text-slate-400"></i>
              </div>
              <h4 className="text-lg font-semibold text-slate-300 mb-2">No comments yet</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Be the first to share your thoughts or ask for clarification.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
