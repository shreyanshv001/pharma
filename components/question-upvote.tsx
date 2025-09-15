"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface QuestionUpvoteProps {
  questionId: string;
  initialVotes: number;
  userVote?: number | null; // -1, 0, or 1
}

interface VoteResponse {
  totalVotes: number;
  userVote: number | null; // -1, 0, or 1
}

interface MutationContext {
  prevVotes: {
    voteCount: number;
    userVote: number | null;
  };
}

export default function QuestionUpvote({
  questionId,
  initialVotes,
  userVote: initialUserVote,
}: QuestionUpvoteProps) {
  const queryClient = useQueryClient();

  const [voteCount, setVoteCount] = useState(initialVotes);
  const [userVote, setUserVote] = useState<number | null>(
    initialUserVote ?? null
  );

  const mutation = useMutation<VoteResponse, Error, number, MutationContext>({
    mutationFn: async (newVoteState: number) => {
      const res = await fetch(`/api/qa/question/${questionId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newVoteState }),
      });

      if (!res.ok) {
        throw new Error("Vote failed");
      }

      return res.json();
    },

    onMutate: async (newVoteState) => {
      await queryClient.cancelQueries({ queryKey: ["question", questionId] });

      const prevVotes = { voteCount, userVote };

      let newVoteCount = voteCount;

      // remove old vote if exists
      if (userVote) newVoteCount -= userVote;
      // add new vote (0 means neutral, nothing added)
      if (newVoteState) newVoteCount += newVoteState;

      setVoteCount(newVoteCount);
      setUserVote(newVoteState === 0 ? null : newVoteState);

      return { prevVotes };
    },

    onError: (_err, _variables, context) => {
      if (context?.prevVotes) {
        setVoteCount(context.prevVotes.voteCount);
        setUserVote(context.prevVotes.userVote);
      }
    },

    onSuccess: (data) => {
      if (data.totalVotes !== undefined) {
        setVoteCount(data.totalVotes);
      }
      setUserVote(data.userVote ?? null);
      queryClient.invalidateQueries({ queryKey: ["question", questionId] });
    },
  });

  return (
    <div className="flex flex-col items-center gap-2 p-3">
      {/* UPVOTE */}
      <button
        className={`group relative w-11 h-11 rounded-full border transition-all duration-300 flex items-center justify-center
          focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
          ${
            userVote === 1
              ? "border-green-400/60 text-green-400"
              : "border-slate-600/60 text-slate-400 hover:text-green-400 hover:border-green-400/60"
          }
          ${mutation.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        onClick={() => {
          if (mutation.isPending) return;
          mutation.mutate(userVote === 1 ? 0 : 1);
        }}
        disabled={mutation.isPending}
        title={userVote === 1 ? "Remove upvote" : "Upvote this question"}
        aria-pressed={userVote === 1}
      >
        <i
          className={`ri-arrow-up-line text-lg transition-transform duration-300 filter ${
            userVote === 1
              ? "scale-110 drop-shadow-[0_0_10px_rgba(74,222,128,0.65)]"
              : "group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(74,222,128,0.45)]"
          }`}
        />
      </button>

      {/* VOTE COUNT */}
      <div className="flex flex-col items-center py-2">
        <span className="text-lg font-bold text-slate-200 transition-colors duration-300">
          {voteCount}
        </span>
        <span className="text-xs text-slate-500 font-medium">
          {Math.abs(voteCount) === 1 ? "vote" : "votes"}
        </span>
      </div>

      {/* DOWNVOTE */}
      <button
        className={`group relative w-11 h-11 rounded-full border transition-all duration-300 flex items-center justify-center
          focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
          ${
            userVote === -1
              ? "border-red-400/60 text-red-400"
              : "border-slate-600/60 text-slate-400 hover:text-red-400 hover:border-red-400/60"
          }
          ${mutation.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        onClick={() => {
          if (mutation.isPending) return;
          mutation.mutate(userVote === -1 ? 0 : -1);
        }}
        disabled={mutation.isPending}
        title={userVote === -1 ? "Remove downvote" : "Downvote this question"}
        aria-pressed={userVote === -1}
      >
        <i
          className={`ri-arrow-down-line text-lg transition-transform duration-300 filter ${
            userVote === -1
              ? "scale-110 drop-shadow-[0_0_10px_rgba(248,113,113,0.65)]"
              : "group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(248,113,113,0.45)]"
          }`}
        />
      </button>

      {/* Loading indicator (optional keep) */}
      {mutation.isPending && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
