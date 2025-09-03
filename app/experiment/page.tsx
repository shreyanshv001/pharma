"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Experiment {
  id: string;
  title: string;
  description?: string;
}

export default function ExperimentsList() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchExperiments = useCallback(
    async (pageNumber: number, searchQuery: string) => {
      if (pageNumber === 1) setExperiments([]);
      setLoading(true);
      try {
        const res = await fetch(
          `/api/student/experiments?search=${encodeURIComponent(
            searchQuery
          )}&page=${pageNumber}`
        );
        const data = await res.json();

        if (pageNumber === 1) {
          setExperiments(data.experiments);
        } else {
          setExperiments((prev) => [...prev, ...data.experiments]);
        }
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Failed to fetch experiments:", err);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    setInitialLoading(true);
    fetchExperiments(1, search);
  }, [search, fetchExperiments]);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchExperiments(nextPage, search);
        }
      },
      { threshold: 1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loading, page, totalPages, search, fetchExperiments]);

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
    <div className="px-5 pb-28 pt-5 bg-[#101A23] min-h-screen">
      <h1 className="text-3xl font-bold text-center text-[#E7EDF4] mb-6">
        Experiments
      </h1>

      {/* Search */}
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
      {initialLoading ? (
        <LoadingSkeleton />
      ) : experiments.length === 0 ? (
        <div className="text-center text-[#E7EDF4] py-16">
          No experiments found
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {experiments.map((exp) => (
              <Link
                key={exp.id}
                href={`/experiment/${exp.id}`}
                className="flex items-center gap-4 px-4 py-1 hover:bg-white/5 transition-colors rounded-lg"
              >
                {/* Icon */}
                <div className="text-white flex items-center justify-center rounded-lg bg-[#283039] shrink-0 size-12">
                  <span className="material-symbols-outlined"><i className="ri-flask-fill text-2xl "></i></span>
                </div>

                {/* Text */}
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
          {page < totalPages && (
            <div ref={loaderRef} className="text-center py-6 text-[#E7EDF4]">
              {loading ? "Loading more..." : "Scroll down to load more"}
            </div>
          )}
        </>
      )}
    </div>
  );
}
