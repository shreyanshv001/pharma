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

  // Reset to first page when search changes is handled automatically by React Query (because queryKey changes)

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-[#182634] rounded-lg shadow animate-pulse h-16"
        ></div>
      ))}
    </div>
  );

  return (
    <div className="px-5 pb-28 pt-5 bg-[#101A23] min-h-screen max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-[#E7EDF4] mb-6">
        Experiments
      </h1>

      {/* Search Input */}
      <div className="relative mb-6">
        <i className="ri-search-line absolute text-xl left-3 top-1/2 transform -translate-y-1/2 text-[#6286A9]"></i>
        <Input
          placeholder="Search experiments"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[#E7EDF4] text-[#6286A9] placeholder:text-[#6286A9] border-0 focus:ring-0"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <div className="text-center text-red-400 py-16">
          Error loading experiments. Please try again.
        </div>
      ) : allExperiments.length === 0 ? (
        <div className="text-center text-[#E7EDF4] py-16">No experiments found</div>
      ) : (
        <>
          <div className="grid gap-3">
            {allExperiments.map((exp) => (
              <Link
                key={exp.id}
                href={`/experiment/${exp.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors rounded-lg"
              >
                <div className="text-white flex items-center justify-center rounded-lg bg-[#283039] shrink-0 size-12">
                  <span className="material-symbols-outlined">
                    <i className="ri-flask-fill text-2xl"></i>
                  </span>
                </div>
                <div className="flex flex-col justify-center overflow-hidden">
                  <p className="text-white text-base font-medium leading-normal line-clamp-1">
                    {exp.title}
                  </p>
                  <p className="text-[#9dabb9] text-sm font-normal leading-normal line-clamp-2">
                    {exp.description || "No description available"}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Loader */}
          {hasNextPage && (
            <div ref={loaderRef} className="text-center py-6 text-[#E7EDF4]">
              {isFetchingNextPage ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-b-2 border-[#6286A9] rounded-full mr-2"></div>
                  <span>Loading more...</span>
                </div>
              ) : (
                "Scroll down to load more"
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
