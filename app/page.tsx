"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// ---- TYPE DEFINITIONS ----
interface Instrument {
  id: string;
  name: string;
  category: string;
  discription?: string;
  imageUrls?: string[];
}

interface PageData {
  instruments: Instrument[];
  nextCursor: string | null;
}

// ---- CATEGORY OPTIONS ----
const categoryOptions = [
  "ALL",
  "PHARMACEUTIC",
  "PHARMACOGNOSY",
  "PHARMACOLOGY",
  "PHARMACEUTICAL_CHEMISTRY"
];

// ---- MAIN COMPONENT ----
export default function InstrumentsList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const router = useRouter();
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // ---- INFINITE QUERY: FETCH USING CURSOR ----
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    isLoading,
  } = useInfiniteQuery<PageData>({
    queryKey: ["instruments", search, category],
    queryFn: async ({ pageParam = "" }) => {
      let url = `/api/student/instruments?search=${encodeURIComponent(search)}`;
      if (category !== "ALL") url += `&category=${encodeURIComponent(category)}`;
      if (pageParam) url += `&cursor=${encodeURIComponent(String(pageParam))}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch instruments");
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: "",
    refetchOnWindowFocus: false,
  });


  // ---- MERGE PAGES ----
  const instruments = data?.pages.flatMap(page => page.instruments) ?? [];

  // ---- INFINITE SCROLL: INTERSECTION OBSERVER ----
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { threshold: 1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ---- RESET DATA ON FILTER CHANGE ----
  useEffect(() => {
    // React Query will refetch when queryKey ([search,category]) changes automatically.
    // No need to manually reset.
  }, [search, category]);

  // ---- NAVIGATE TO INSTRUMENT DETAILS ----
  const goToInstrument = (inst: Instrument) => router.push(`/instrument/${inst.id}`);

  // ---- LOADING SKELETON ----
  const LoadingSkeleton = () => (
    <div className="grid gap-6 lg:grid-cols-5 lg:px-7 lg:h-72 grid-cols-2">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-[#182634] rounded-lg shadow animate-pulse h-48"
        >
          <div className="h-32 bg-[#2a3a4a] rounded-t-lg"></div>
          <div className="h-5 bg-[#2a3a4a] rounded w-3/4 mx-auto mt-3"></div>
        </div>
      ))}
    </div>
  );

  // ---- RENDER ----
  return (
    <div className="px-5 pt-5 md:p-0 pb-28 bg-[#101A23] min-h-screen">
      <h1 className="text-3xl font-bold block lg:hidden text-white mb-8 text-center">Instruments</h1>
      <div className="text-white lg:pt-34 pt-5 max-w-3xl lg:block hidden mx-auto mb-6 space-y-1 text-center">
        <div className="lg:text-4xl text-2xl font-bold ">Explore Pharmaceutical Instruments</div>
        <div className=" max-w-3xl text-zinc-400 mt-4 ">An extensive library of instruments for pharmacy students. </div>
        <div className="max-w-3xl text-zinc-400"> Search, learn, and master their details.</div>
      </div>
      {/* --- Search & Category Filters --- */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="relative mb-6">
          <i className="ri-search-line absolute text-xl left-3 top-1/2 transform -translate-y-1/2 text-[#6286A9]" />
          <Input
            placeholder="Search instruments"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#E7EDF4] text-[#6286A9] placeholder:text-[#6286A9] border-0 focus:ring-0"
          />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? "bg-[#6286A9] text-white"
                  : "bg-[#182634] text-[#E7EDF4] hover:bg-[#223243]"
              }`}
            >
              {cat === "ALL" ? "All" : cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>
      {/* --- Instruments Grid --- */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <div className="text-center text-red-400 py-16">
          Error loading instruments. Please try again.
        </div>
      ) : instruments.length === 0 ? (
        <div className="text-center text-[#E7EDF4] py-16">No instruments found</div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {instruments.map((inst) => (
            <div
              key={inst.id}
              onClick={() => goToInstrument(inst)}
              className="bg-[#182634] hover:bg-[#223243] transition-colors rounded-lg shadow cursor-pointer flex flex-col select-none"
            >
              {inst.imageUrls && inst.imageUrls.length > 0 ? (
                <div className="h-40 w-full overflow-hidden rounded-t-lg">
                  <img
                    src={inst.imageUrls[0]}
                    alt={inst.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 w-full bg-[#2a3a4a] rounded-t-lg flex items-center justify-center text-[#6286A9] text-sm">
                  No Image
                </div>
              )}
              <div className="p-3 text-center">
                <h2 className="text-sm capitalize text-[#E7EDF4] truncate">
                  {inst.name}
                </h2>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* --- Infinite Scroll Loader --- */}
      <div ref={loaderRef} className="text-center py-6 text-[#E7EDF4]">
        {isFetchingNextPage
          ? "Loading more..."
          : hasNextPage
          ? "Scroll down to load more"
          : instruments.length > 0
          ? "All instruments loaded"
          : null}
      </div>
    </div>
  );
}
