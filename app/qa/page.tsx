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
    <div className="min-h-screen bg-gradient-to-br lg:pt-20 from-slate-950 via-slate-900 to-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
      
      <div className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-18">
        {/* Header Section */}
        <div className="text-center mb-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-6 tracking-tight">
            Q&A Community
          </h1>
          <p className="text-md hidden lg:block sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
            Ask questions, share knowledge, and learn from fellow pharmaceutical students and professionals
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-4 lg:mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <i className="ri-search-line absolute text-xl left-5 top-1/2 transform -translate-y-1/2 text-slate-400 z-10" />
              <Input
                placeholder="Search questions about experiments, instruments, procedures..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-14 pr-6 py-4 text-lg bg-slate-800/80 border border-slate-700/50 rounded-2xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Floating Ask Question Button */}
        <div className="fixed bottom-28 lg:right-12 lg:bottom-24 right-6 z-40">
          <Link href="/qa/ask">
            <Button className="group bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white px-6 py-6 lg:py-8 lg:px-7 rounded-xl shadow-2xl hover:shadow-slate-500/20 transition-all duration-300 hover:scale-105 border border-slate-600/50">
              <i className="ri-question-answer-line text-xl mr-2 group-hover:scale-110 transition-transform duration-300"></i>
              Ask Question
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {status === "pending" && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/60 rounded-full mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-400 border-t-transparent"></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading Questions</h3>
            <p className="text-slate-400">Please wait while we fetch the latest discussions...</p>
          </div>
        )}
        
        {/* Error State */}
        {status === "error" && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-6">
              <i className="ri-error-warning-line text-2xl text-red-400"></i>
            </div>
            <h3 className="text-xl font-semibold text-red-400 mb-4">Unable to Load Questions</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              There was a problem loading the questions. Please check your connection and try again.
            </p>
            <Button 
              onClick={() => fetchNextPage()}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {status === "success" && data.pages[0].questions.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 rounded-full mb-6">
              <i className="ri-question-answer-line text-2xl text-slate-400"></i>
            </div>
            <h3 className="text-2xl font-semibold text-slate-300 mb-4">No Questions Yet</h3>
            <p className="text-slate-400 mb-8 leading-relaxed max-w-md mx-auto">
              Be the first to start a discussion! Ask about experiments, instruments, or pharmaceutical procedures.
            </p>
            <Link href="/qa/ask">
              <Button className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg">
                <i className="ri-add-line text-lg mr-2"></i>
                Ask First Question
              </Button>
            </Link>
          </div>
        )}

        {/* Questions Grid */}
        {status === "success" && data.pages[0].questions.length > 0 && (
          <>
            {/* Results Count */}
            <div className="text-center mb-8">
              <p className="text-slate-400 font-medium">
                Found <span className="text-white font-semibold">{data.pages.flatMap(p => p.questions).length}</span> questions
                {debouncedSearch && (
                  <> matching &quot;<span className="text-blue-400">{debouncedSearch}</span>&quot;</>
                )}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.pages.flatMap((page) =>
                page.questions.map((q, index) => (
                  <Link
                    key={q.id}
                    href={`/qa/${q.id}`}
                    className="group block transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700/30 shadow-xl group-hover:shadow-2xl group-hover:shadow-blue-500/10 group-hover:border-blue-500/30 transition-all duration-300 p-5 h-full flex flex-col">
                      {/* Question Title */}
                      <h2 className="text-lg font-semibold text-white mb-3 line-clamp-2 leading-tight group-hover:text-blue-300 transition-colors duration-300 capitalize">
                        {q.title}
                      </h2>
                      
                      {/* Question Description */}
                      <p className="text-sm text-slate-400 line-clamp-3 flex-1 leading-relaxed mb-4 group-hover:text-slate-300 transition-colors duration-300 capitalize">
                        {q.description.replace(/<[^>]*>?/gm, '')}
                      </p>
                      
                      {/* Stats */}
                      <div className="flex justify-between text-sm text-slate-500 mb-4 border-t border-slate-700/30 pt-3">
                        <div className="flex items-center gap-1">
                          <i className="ri-thumb-up-line text-green-400"></i>
                          <span>{q.totalVotes} votes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <i className="ri-message-2-line text-blue-400"></i>
                          <span>{q._count.answers} answers</span>
                        </div>
                      </div>
                      
                      {/* Author & Time */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {q.author?.imageUrl ? (
                            <Image
                              src={q.author.imageUrl}
                              alt={q.author.name ? `${q.author.name}'s profile` : "User"}
                              width={24}
                              height={24}
                              className="rounded-full object-cover border border-slate-600"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-medium text-white">
                              {q.author?.name?.[0] || "U"}
                            </div>
                          )}
                          <span className="text-xs text-slate-400 font-medium">
                            {q.author?.name 
                              ? (q.author.name.toLowerCase().startsWith('user') 
                                 ? q.author.name.slice(0, 12) + (q.author.name.length > 12 ? '...' : '')
                                 : q.author.name)
                              : "Anonymous"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <i className="ri-time-line"></i>
                          <span>{timeAgo(q.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </>
        )}

        {/* Infinite Scroll Loader */}
        <div ref={observerRef} className="text-center py-4 mt-8">
          {isFetchingNextPage ? (
            <div className="inline-flex items-center space-x-3 text-slate-400">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-400 border-t-transparent"></div>
              <span className="font-medium">Loading more questions...</span>
            </div>
          ) : hasNextPage ? (
            <p className="text-slate-500 font-medium">Scroll down to load more</p>
          ) : status === "success" && data.pages[0].questions.length > 0 ? (
            <div className="text-slate-500">
              <div className="inline-flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span className="font-medium">All questions loaded</span>
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              </div>
            </div>
          ) : null}
        </div>
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
