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
  const [ripple, setRipple] = useState(false);

  const handleVote = async (clicked: number) => {
    if (loading) return;

    // toggle undo
    const newVoteState = userVote === clicked ? 0 : clicked;

    setLoading(true);

    // optimistic update
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
        // rollback
        setVoteCount(voteCount);
        setUserVote(prevVote);
        console.error("Vote failed", data?.error);
      } else {
        // sync server
        if (data.totalVotes !== undefined) setVoteCount(data.totalVotes);
        setUserVote(data.userVote ?? null);

        // show ripple only for successful UPVOTE (not undo or downvote)
        if (newVoteState === 1) {
          setRipple(true);
          window.setTimeout(() => setRipple(false), 450);
        }
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
    <>
      <div className="relative flex flex-col items-center gap-3 text-2xl">
        {/* ripple element, centered and expanding */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 m-auto rounded-full opacity-0 transform scale-0 ${
            ripple ? "ripple-active" : ""
          }`}
        />
        <i
          className={`border-[#9CA3AF] border-1 px-1 rounded-full ri-arrow-up-line cursor-pointer transition ${
            userVote === 1 ? "text-blue-500" : "text-gray-400"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => handleVote(1)}
        />
        <span className="text-lg font-medium">{voteCount}</span>
        <i
          className={`border-[#9CA3AF] border-1 px-1 rounded-full ri-arrow-down-line cursor-pointer transition ${
            userVote === -1 ? "text-red-500" : "text-gray-400"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => handleVote(-1)}
        />
      </div>

      {/* ripple CSS */}
      <style jsx>{`
        .ripple-active {
          animation: rippleExpand 420ms ease-out forwards;
          background: rgba(96, 165, 250, 0.24); /* light blue */
          width: 160%;
          height: 160%;
          left: 50%;
          top: 50%;
          transform-origin: center;
          filter: blur(8px);
        }

        @keyframes rippleExpand {
          0% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(0.01);
          }
          60% {
            opacity: 0.35;
            transform: translate(-50%, -50%) scale(0.9);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }
      `}</style>
    </>
  );
}
