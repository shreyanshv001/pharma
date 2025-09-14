"use client";

import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import Image from "next/image";

interface Question {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  author: { id: string; name?: string; imageUrl?: string };
  totalVotes: number;
  _count: { votes: number; answers: number };
}

interface QuestionsResponse {
  questions: Question[];
  nextCursor: string | null;
}

// API fetcher
async function fetchQuestions({
  pageParam = null,
  query = "",
}: {
  pageParam?: string | null;
  query?: string;
}): Promise<QuestionsResponse> {
  const url = `/api/qa/all-questions?search=${encodeURIComponent(
    query
  )}${pageParam ? `&cursor=${pageParam}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");

  return res.json();
}


// Main QA content component
function QAContent() {
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState(""); // controlled input
  const { isLoaded, user } = useUser();

  // Debounced search state
  const [searchInput, setSearchInput] = useState(""); // controlled input
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Apply debounce (500ms)
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Infinite Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<
    QuestionsResponse,
    Error,
    InfiniteData<QuestionsResponse>,
    [string, string],
    string | null
  >({
    queryKey: ["questions", debouncedSearch],
    queryFn: ({ pageParam }) => fetchQuestions({ pageParam, query: debouncedSearch }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 30_000,
    enabled:
      isLoaded &&
      !!user &&
      (debouncedSearch.length === 0 || debouncedSearch.length >= 3),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (prev) => prev, // keep previous pages while typing
  });
  console.log("Question Data:", data);
  // Infinite scroll observer
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="p-6 relative bg-[#101A23] pb-20 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">💬 Q&A Section</h1>
      
      {/* Ask Question Button */}
      <div className="flex fixed  bottom-28 right-6 justify-end ">
        <Link href="/qa/ask">
          <Button className="bg-blue-600 hover:bg-blue-700 py-6 text-white">
            <i className="ri-add-line text-xl"></i>
            Ask a Question
          </Button>
        </Link>
      </div>

      {/* Search bar */}
      <div className="max-w-xl mx-auto mb-8">
        <Input
          placeholder="Search questions..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="bg-[#1E293B] border-gray-700 text-white"
        />
        {/* Optional helper text */}
        {/* <p className="text-xs text-gray-400 mt-1">
          {debouncedSearch.length > 0 && debouncedSearch.length < 3
            ? "Type at least 3 characters to search"
            : "\u00A0"}
        </p> */}
      </div>

      {status === "pending" && (
        <div className="text-center py-6">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading questions...</p>
        </div>
      )}
      
      {status === "error" && (
        <div className="text-center text-red-400 py-6">
          <p>Error loading questions.</p>
          <Button 
            onClick={() => fetchNextPage()}
            className="mt-3 bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      )}

      {status === "success" && data.pages[0].questions.length === 0 && (
        <div className="text-center py-10">
          <p className="text-xl text-gray-300 mb-4">No questions found</p>
          <Link href="/qa/ask">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Be the first to ask a question
            </Button>
          </Link>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.pages.flatMap((page) =>
          page.questions.map((q) => (
            <Link
              key={q.id}
              href={`/qa/${q.id}`}
              className="bg-[#1E293B] hover:bg-[#334155] transition border border-gray-700 rounded-xl p-5 shadow-lg flex flex-col"
            >
              <h2 className="text-lg capitalize font-semibold mb-2 line-clamp-1 overflow-hidden text-ellipsis max-w-full break-all">
                {q.title}
              </h2>
              <p className="text-gray-300 capitalize px-1 text-sm line-clamp-3 flex-1 overflow-hidden break-all">
                {q.description.replace(/<[^>]*>?/gm, '')}
              </p>
              <div className="flex justify-between text-sm text-gray-400 mt-3">
                <span><i className="ri-thumb-up-line mr-1.5"></i> {q.totalVotes} votes</span>
                <span><i className="ri-message-2-line mr-1.5"></i> {q._count.answers} answers</span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center ">

                {q.author?.imageUrl ? (
                  <Image
                    src={q.author.imageUrl || "/default-avatar.png"} // fallback
                    alt={q.author.name ? `${q.author.name}'s profile picture` : "User"}
                    width={32}
                    height={32}
                    className="rounded-full mr-2 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center mr-2">
                    {q.author?.name?.[0] || "U"}
                  </div>
                )}
                <span className="text-xs text-gray-300">{q.author?.name 
                      ? (q.author.name.toLowerCase().startsWith('user') 
                         ? q.author.name.slice(0, 12) + (q.author.name.length > 12 ? '...' : '')
                         : q.author.name)
                      : "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-circle-fill text-gray-400 text-[5px] "></i>
                  <div className="text-xs text-gray-400">{timeAgo(q.createdAt)}</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={observerRef} className="h-12 flex justify-center items-center">
        {isFetchingNextPage && (
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-b-2 border-blue-500 rounded-full mr-2"></div>
            <p className="text-gray-400">Loading more...</p>
          </div>
        )}
        {!hasNextPage && status === "success" && data.pages[0].questions.length > 0 && (
          <p className="text-gray-500">You&apos;ve reached the end </p>
        )}
      </div>
    </div>
  );
}

// Main page component with auth handling
export default function QAPage() {
  return (
    <>
      <SignedIn>
        <QAContent />
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn redirectUrl="/qa" />
      </SignedOut>
    </>
  );
}
