"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface Instrument {
  id: string;
  name: string;
  category: string;
  principle?: string;
  imageUrls?: string[];
}

export default function InstrumentsList() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const categoryOptions = [
    "ALL",
    "PHARMACEUTIC",
    "PHARMACOGNOSY",
    "PHARMACOLOGY",
    "PHARMACEUTICAL_CHEMISTRY",
  ];

  const router = useRouter();
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const goToInstruments = (inst: Instrument) => {
    router.push(`${inst.id}`);
  };

  const fetchInstruments = useCallback(
    async (pageNumber: number, searchQuery: string, categoryFilter: string) => {
      if (pageNumber === 1) setInstruments([]);
      setLoading(true);
      try {
        const categoryParam =
          categoryFilter === "ALL"
            ? ""
            : `&category=${encodeURIComponent(categoryFilter)}`;
        const res = await fetch(
          `/api/student/instruments?search=${encodeURIComponent(
            searchQuery
          )}&page=${pageNumber}${categoryParam}`
        );
        const data = await res.json();

        if (pageNumber === 1) {
          setInstruments(data.instruments);
        } else {
          setInstruments((prev) => [...prev, ...data.instruments]);
        }
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Failed to fetch instruments:", err);
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
    fetchInstruments(1, search, category);
  }, [search, category, fetchInstruments]);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchInstruments(nextPage, search, category);
        }
      },
      { threshold: 1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loading, page, totalPages, search, category, fetchInstruments]);

  const LoadingSkeleton = () => (
    <div className="grid gap-6 grid-cols-2">
      {[...Array(6)].map((_, i) => (
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

  return (
    <div className="px-5 pb-28 pt-5 bg-[#101A23] min-h-screen">
      <h1 className="text-3xl font-bold text-center text-[#E7EDF4] mb-6">
        Instruments
      </h1>

      {/* Search */}
      <div className="relative mb-6">
        <i className="ri-search-line absolute text-xl left-3 top-1/2 transform -translate-y-1/2 text-[#6286A9]"></i>
        <Input
          placeholder="Search instruments"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[#E7EDF4] text-[#6286A9] placeholder:text-[#6286A9] border-0 focus:ring-0"
        />
      </div>

      {/* Categories Row */}
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

      {/* Content */}
      {initialLoading ? (
        <LoadingSkeleton />
      ) : instruments.length === 0 ? (
        <div className="text-center text-[#E7EDF4] py-16">
          No instruments found
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-2">
            {instruments.map((inst) => (
              <div
                key={inst.id}
                onClick={() => goToInstruments(inst)}
                className="bg-[#182634] hover:bg-[#223243] transition-colors rounded-lg shadow cursor-pointer flex flex-col"
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
                  <div className="h-40 w-full bg-[#2a3a4a] rounded-t-lg flex items-center justify-center text-[#6286A9]">
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
