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
    <div className="flex flex-col w-full text-2xl items-center gap-3">
      {/* UPVOTE */}
      <i
        className={`border-[#9CA3AF] border-1 px-1 rounded-full ri-arrow-up-line cursor-pointer transition ${
          userVote === 1 ? "text-blue-500" : "text-gray-400"
        } ${mutation.isPending ? "opacity-50 cursor-not-allowed" : ""} `}
        onClick={() => {
          if (mutation.isPending) return;
          mutation.mutate(userVote === 1 ? 0 : 1); 
        }}
      />

      <span className="text-lg font-medium">{voteCount}</span>

      {/* DOWNVOTE */}
      <i
        className={`border-[#9CA3AF] border-1 px-1 rounded-full ri-arrow-down-line cursor-pointer transition ${
          userVote === -1 ? "text-red-500" : "text-gray-400"
        } ${mutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => {
          if (mutation.isPending) return;
          mutation.mutate(userVote === -1 ? 0 : -1); 
        }}
      />
    </div>
  );
}
