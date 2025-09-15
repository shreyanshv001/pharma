"use client";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";

interface Experiment {
  id: string;
  title: string;
  description?: string;
}

interface ExperimentsResponse {
  experiments: Experiment[];
  page: number;
  totalPages: number;
}

export default function ExperimentsList() {
  const [search, setSearch] = useState("");
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Infinite Query for page-based pagination
  const {
    data,
    isLoading,
    isFetchingNextPage,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<ExperimentsResponse>({
    queryKey: ['experiments', search],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(
        `/api/student/experiments?search=${encodeURIComponent(search)}&page=${pageParam}`
      );
      if (!res.ok) throw new Error("Failed to fetch experiments");
      return res.json();
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    refetchOnWindowFocus: false,
    initialPageParam: 1,
  });

  // Flatten all fetched pages of experiments
  const allExperiments = data?.pages.flatMap(page => page.experiments) ?? [];

  // Setup intersection observer to trigger fetchNextPage when loader appears
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="max-w-4xl mx-auto space-y-4">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-slate-800/50 rounded-xl shadow-lg animate-pulse overflow-hidden border border-slate-700/30 p-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-700/50 rounded-lg shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-700/50 rounded-md w-3/4"></div>
              <div className="h-4 bg-slate-700/30 rounded-md w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br lg:pt-20 from-slate-950 via-slate-900 to-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
      
      <div className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-32">
        {/* Header Section */}
        <div className="text-center mb-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-6 tracking-tight">
            Laboratory Experiments
          </h1>
          <p className="text-md hidden lg:block sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
            Discover hands-on experiments designed for pharmaceutical education, 
            <span className="text-slate-300"> research methodology, and practical learning</span>
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-4 lg:mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <i className="ri-search-line absolute text-xl left-5 top-1/2 transform -translate-y-1/2 text-slate-400 z-10" />
              <Input
                placeholder="Search experiments by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-14 pr-6 py-4 text-lg bg-slate-800/80 border border-slate-700/50 rounded-2xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <i className="ri-error-warning-line text-2xl text-red-400"></i>
            </div>
            <h3 className="text-xl font-semibold text-red-400 mb-2">Unable to Load Experiments</h3>
            <p className="text-slate-400">Please check your connection and try again</p>
          </div>
        ) : allExperiments.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 rounded-full mb-4">
              <i className="ri-flask-line text-2xl text-slate-400"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Experiments Found</h3>
            <p className="text-slate-400">Try adjusting your search terms</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="text-center mb-8">
              <p className="text-slate-400 font-medium">
                Found <span className="text-white font-semibold">{allExperiments.length}</span> experiments
                {search && (
                  <> matching <span className="text-blue-400">{search}</span></>
                )}
              </p>
            </div>

            {/* Experiments List */}
            <div className="max-w-4xl mx-auto space-y-4">
              {allExperiments.map((exp, index) => (
                <Link
                  key={exp.id}
                  href={`/experiment/${exp.id}`}
                  className="group block transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700/30 shadow-xl group-hover:shadow-2xl group-hover:shadow-blue-500/10 group-hover:border-blue-500/30 transition-all duration-300 p-5">
                    <div className="flex items-center gap-5">
                      {/* Icon */}
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
                          <i className="ri-flask-fill text-2xl text-blue-400 group-hover:text-blue-300 transition-colors duration-300"></i>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-blue-300 transition-colors duration-300">
                          {exp.title}
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 group-hover:text-slate-300 transition-colors duration-300">
                          {exp.description || "No description available"}
                        </p>
                      </div>

                      {/* Arrow Icon */}
                      <div className="shrink-0">
                        <i className="ri-arrow-right-line text-xl text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300"></i>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Infinite Scroll Loader */}
            {hasNextPage && (
              <div ref={loaderRef} className="text-center py-12 mt-8">
                {isFetchingNextPage ? (
                  <div className="inline-flex items-center space-x-3 text-slate-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-400 border-t-transparent"></div>
                    <span className="font-medium">Loading more experiments...</span>
                  </div>
                ) : (
                  <p className="text-slate-500 font-medium">Scroll down to load more</p>
                )}
              </div>
            )}

            {/* End Message */}
            {!hasNextPage && allExperiments.length > 0 && (
              <div className="text-center py-8">
                <div className="text-slate-500">
                  <div className="inline-flex items-center space-x-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    <span className="font-medium">All experiments loaded</span>
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
