"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

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
  console.log("Fetched instruments data:", data);

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

  // ---- NAVIGATE TO INSTRUMENT DETAILS ----
  const goToInstrument = (inst: Instrument) => router.push(`/instrument/${inst.id}`);

  // ---- LOADING SKELETON ----
  const LoadingSkeleton = () => (
    <div className="grid gap-6 grid-cols-2  sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="bg-slate-800/50 rounded-xl shadow-lg animate-pulse overflow-hidden border border-slate-700/30"
        >
          <div className="h-44 bg-slate-700/50"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-slate-700/50 rounded-md w-3/4"></div>
            <div className="h-3 bg-slate-700/30 rounded-md w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // ---- RENDER ----
  return (
    <div className="min-h-screen bg-gradient-to-br lg:pt-28 from-slate-950 via-slate-900 to-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
      
      <div className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-32">
        {/* Header Section */}
        <div className="text-center mb-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-6 tracking-tight">
            Pharmaceutical Instruments
          </h1>
          <p className="text-md  lg:block sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
            Explore our comprehensive collection of laboratory instruments designed for pharmaceutical research, 
            <span className="text-slate-300"> quality control, and educational purposes</span>
          </p>
        </div>

        {/* Search & Filter Section */}
        <div className="max-w-4xl mx-auto mb-4 lg:mb-14 space-y-6">
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <i className="ri-search-line absolute text-xl left-5 top-1/2 transform -translate-y-1/2 text-slate-400 z-10" />
              <Input
                placeholder="Search instruments by name, category, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-14 pr-6 py-4 text-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-xl"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="relative -mx-4 px-4">
          <div
            className="
              flex gap-3 justify-start flex-nowrap overflow-x-auto
              lg:flex-wrap  lg:justify-center px-2
              scroll-smooth snap-x snap-mandatory scrollbar-hide
            "
          >
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 snap-start lg:px-6 px-4 py-2 lg:py-3 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-sm border ${
                  category === cat
                    ? "bg-gradient-to-r from-slate-700 to-slate-600 text-white border-slate-500/50 shadow-lg shadow-slate-500/20 scale-105"
                    : "bg-slate-800/60 text-slate-300 border-slate-700/50 hover:bg-slate-700/80 hover:text-white hover:scale-105 hover:shadow-lg"
                }`}
              >
                {cat === "ALL"
                  ? "All Categories"
                  : cat
                      .replace(/_/g, " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
        </div>

        {/* Instruments Grid */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <i className="ri-error-warning-line text-2xl text-red-400"></i>
            </div>
            <h3 className="text-xl font-semibold text-red-400 mb-2">Unable to Load Instruments</h3>
            <p className="text-slate-400">Please check your connection and try again</p>
          </div>
        ) : instruments.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 rounded-full mb-4">
              <i className="ri-search-line text-2xl text-slate-400"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Instruments Found</h3>
            <p className="text-slate-400">Try adjusting your search terms or category filter</p>
          </div>
        ) : (
          <>

            {/* Instruments Grid */}
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {instruments.map((inst, index) => (
                <div
                  key={inst.id}
                  onClick={() => goToInstrument(inst)}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/30 shadow-xl group-hover:shadow-2xl group-hover:shadow-blue-500/10 group-hover:border-blue-500/30 transition-all duration-300">
                    {/* Image Container */}
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
                      {inst.imageUrls && inst.imageUrls.length > 0 ? (
                        <>
                          <img
                            src={inst.imageUrls[0]}
                            alt={inst.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 group-hover:text-slate-400 transition-colors duration-300">
                          <i className="ri-image-line text-3xl"></i>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 right-3 px-2 py-1 bg-slate-900/80 backdrop-blur-sm rounded-lg">
                        <span className="text-xs font-medium text-slate-300">
                          {inst.category.replace(/_/g, " ").slice(0, 12)}...
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-white text-sm leading-tight mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors duration-300">
                        {inst.name}
                      </h3>
                      {inst.discription && (
                        // <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        //   {inst.discription}
                        // </p>
                        <div
                          className="text-xs capitalize text-slate-400 line-clamp-2 leading-relaxedprose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: inst.discription }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Infinite Scroll Loader */}
        <div ref={loaderRef} className="text-center py-12 mt-8">
          {isFetchingNextPage ? (
            <div className="inline-flex items-center space-x-3 text-slate-400">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-400 border-t-transparent"></div>
              <span className="font-medium">Loading more instruments...</span>
            </div>
          ) : hasNextPage ? (
            <p className="text-slate-500 font-medium">Scroll down to load more</p>
          ) : instruments.length > 0 ? (
            <div className="text-slate-500">
              <div className="inline-flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span className="font-medium">All instruments loaded</span>
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
