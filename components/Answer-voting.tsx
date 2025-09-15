"use client";

import { useState } from "react";

interface AnswerUpvoteProps {
  answerId: string;
  initialVotes: number;
  initialUserVote?: number | null; // -1, 0, or 1
}

export default function AnswerUpvote({
  answerId,
  initialVotes,
  initialUserVote = null,
}: AnswerUpvoteProps) {
  const [voteCount, setVoteCount] = useState(initialVotes);
  const [userVote, setUserVote] = useState<number | null>(initialUserVote);
  const [loading, setLoading] = useState(false);

  const handleVote = async (clicked: number) => {
    if (loading) return;
    const newVoteState = userVote === clicked ? 0 : clicked;

    setLoading(true);

    const prevVote = userVote;
    let newVoteCount = voteCount;
    if (prevVote) newVoteCount -= prevVote;
    if (newVoteState) newVoteCount += newVoteState;
    setVoteCount(newVoteCount);
    setUserVote(newVoteState === 0 ? null : newVoteState);

    try {
      const res = await fetch(`/api/qa/answer/${answerId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newVoteState }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVoteCount(voteCount);
        setUserVote(prevVote);
        console.error("Vote failed", data?.error);
      } else {
        if (data.totalVotes !== undefined) setVoteCount(data.totalVotes);
        setUserVote(data.userVote ?? null);
      }
    } catch (err) {
      setVoteCount(voteCount);
      setUserVote(prevVote);
      console.error("Vote error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 py-2 relative">
      {/* UPVOTE */}
      <button
        className={`group relative w-11 h-11 rounded-full border transition-all duration-300 flex items-center justify-center
          focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
          ${userVote === 1 ? "border-green-400/60" : "border-slate-600/60 hover:border-green-400/60"}
          ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => handleVote(1)}
        disabled={loading}
        title={userVote === 1 ? "Remove upvote" : "Upvote this answer"}
        aria-pressed={userVote === 1}
      >
        <i
          className={`ri-arrow-up-line text-lg transition-transform duration-300 ${
            userVote === 1
              ? "text-green-400 scale-110 drop-shadow-[0_0_10px_rgba(74,222,128,0.65)]"
              : "text-slate-400 group-hover:text-green-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(74,222,128,0.45)]"
          }`}
        />
      </button>

      {/* VOTE COUNT */}
      <div className="flex flex-col items-center py-2">
        <span className="text-lg font-bold text-slate-200">{voteCount}</span>
        <span className="text-xs text-slate-500 font-medium">
          {Math.abs(voteCount) === 1 ? "vote" : "votes"}
        </span>
      </div>

      {/* DOWNVOTE */}
      <button
        className={`group relative w-11 h-11 rounded-full border transition-all duration-300 flex items-center justify-center
          focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
          ${userVote === -1 ? "border-red-400/60" : "border-slate-600/60 hover:border-red-400/60"}
          ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => handleVote(-1)}
        disabled={loading}
        title={userVote === -1 ? "Remove downvote" : "Downvote this answer"}
        aria-pressed={userVote === -1}
      >
        <i
          className={`ri-arrow-down-line text-lg transition-transform duration-300 ${
            userVote === -1
              ? "text-red-400 scale-110 drop-shadow-[0_0_10px_rgba(248,113,113,0.65)]"
              : "text-slate-400 group-hover:text-red-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(248,113,113,0.45)]"
          }`}
        />
      </button>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
