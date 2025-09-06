"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation"
import Link from "next/link";

interface Instrument {
  id: string;
  name: string;
  category: string;
  discription?: string;
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
        console.log(data)

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

  return (
    <div className="px-5 pt-5 md:p-0 pb-28  bg-[#101A23] min-h-screen">
      


      {/* Mobile view (default) */}
    <div className="block lg:hidden">
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
     {/* Desktop view */}
<div className="hidden lg:block">
  {/* example: show grid with more columns and extra UI */}
  <div className="flex text-white p-5 px-19 bg-[#223243] justify-between items-center mb-6">
    <div>Pharma Learn</div>
    <div className="w-1/2">
      <div className="relative w-full">
        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#6286A9] text-lg"></i>
        <Input
          placeholder="Search instruments"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[#E7EDF4] text-[#6286A9] placeholder:text-[#6286A9] border-0 focus:ring-0"
        />
      </div>
    </div>
    <div className="flex gap-14">
      <div>Home</div>
      <Link href={"/experiment"} >Experiment </Link>
      <div>Q&A</div>
      <div>Profile</div>
    </div>
  </div>

  <div className="text-white flex flex-col mb-12 gap-6 text-center">
    <h1 className=" text-4xl font-bold ">
      Explore Pharmaceutical Instruments
    </h1>
    <div className="text-[#93A2B7] text-lg ">
      An extensive library of instruments for pharmacy students. Search, learn,
      and master their details.
    </div>
  </div>

  <div className="flex justify-center gap-4 mb-8">
    {categoryOptions.map((cat) => (
      <button
        key={cat}
        onClick={() => setCategory(cat)}
        className={`px-4 cursor-pointer py-2 rounded-xl text-sm font-medium transition-colors ${
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
    <div className="grid gap-6 px-8 grid-cols-3 xl:grid-cols-5">
      {instruments.map((inst) => (
        <div
          key={inst.id}
          onClick={() => goToInstruments(inst)}
          className="bg-[#182634] hover:bg-[#223243] transition-colors rounded-lg shadow cursor-pointer flex flex-col"
        >
          {inst.imageUrls && inst.imageUrls.length > 0 ? (
            <div className="h-80 w-full overflow-hidden rounded-t-lg">
              <img
                src={inst.imageUrls[0]}
                alt={inst.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-48 w-full bg-[#2a3a4a] rounded-t-lg flex items-center justify-center text-[#6286A9]">
              No Image
            </div>
          )}
          <div className="py-5 px-7 ">
            <h2 className="font-bold capitalize text-xl text-[#E7EDF4] truncate">
              {inst.name}
            </h2>
            <div
              className="mt-2 table-styles text-[#94A3B8] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: inst.discription || "" }}
            />
            <div className="text-[#38BBF6] font-semibold mt-5 hover:text-[#38baf6af]">
              Learn More <i className="ri-arrow-right-line"></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>


    </div>
  );
}
