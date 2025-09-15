"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface Instrument {
  id: string;
  name: string;
  description?: string;
}
interface Experiment {
  id: string;
  object: string;
  instruments: {
    instrument: Instrument;
  }[];
}

// Fetcher using credentials (admin auth)
async function fetchExperiments(): Promise<Experiment[]> {
  const res = await fetch("/api/admin/all-experiments", {
    credentials: "include",
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("AUTH");
  }
  if (!res.ok) {
    throw new Error("FAILED");
  }
  return res.json();
}

export default function AdminExperiments() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: experiments = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin", "experiments"],
    queryFn: fetchExperiments,
    refetchOnWindowFocus: false,
  });

  // Redirect if unauthorized
  useEffect(() => {
    if (isError && (error as Error)?.message === "AUTH") {
      router.push("/admin/login");
    }
  }, [isError, error, router]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["admin"] });
      router.push("/admin/login");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#101A23] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6286A9] mx-auto" />
          <p className="mt-4 text-[#6286A9]">Loading experiments...</p>
        </div>
      </div>
    );
  }

  if (isError && (error as Error).message !== "AUTH") {
    return (
      <div className="min-h-screen bg-[#101A23] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#E7EDF4] mb-4">Error</h1>
          <p className="text-[#6286A9] mb-4">
            {(error as Error).message === "FAILED"
              ? "Failed to fetch experiments"
              : "Unexpected error"}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-[#6286A9] hover:bg-[#4a6b8a] text-[#E7EDF4] px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-[#101A23]">
      {/* Header */}
      <div className="bg-[#0D141C] shadow-sm border-b border-gray-600">
        <div className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#E7EDF4]">
              Admin Dashboard
            </h1>
            <p className="text-[#6286A9] text-sm sm:text-base flex items-center gap-2">
              Manage Experiments
              {isFetching && (
                <span className="animate-pulse text-xs text-[#4a6b8a]">
                  (refreshing…)
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <Link
              href="experiments/new-experiment"
              className="bg-[#6286A9] hover:bg-[#4a6b8a] text-[#E7EDF4] px-4 py-2 rounded-lg transition-colors duration-200 text-center"
            >
              Add Experiment
            </Link>
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-[#E7EDF4] px-4 py-2 rounded-lg transition-colors duration-200"
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-[#E7EDF4]">
            All Experiments ({experiments.length})
          </h2>
          <button
            onClick={() => refetch()}
            className="text-xs px-3 py-1 rounded bg-[#223243] hover:bg-[#2d3a47] text-[#6286A9] transition"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {experiments.map((exp) => (
            <div
              key={exp.id}
              className="bg-[#182634] rounded-lg shadow-sm p-4 sm:p-6 hover:bg-[#1f2d3a] transition-colors duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#E7EDF4]">
                    {exp.object}
                  </h3>
                  {/* {exp.instruments.length > 0 && (
                    <div className="mt-2 text-xs text-[#6286A9] flex flex-wrap gap-2">
                      {exp.instruments.slice(0, 4).map(({ instrument }) => (
                        <span
                          key={instrument.id}
                          className="px-2 py-1 bg-[#223243] rounded"
                        >
                          {instrument.name}
                        </span>
                      ))}
                      {exp.instruments.length > 4 && (
                        <span className="px-2 py-1 bg-[#223243] rounded">
                          +{exp.instruments.length - 4} more
                        </span>
                      )}
                    </div>
                  )} */}
                </div>
                <div className="flex flex-row sm:flex-col gap-2 sm:gap-1">
                  <Link
                    href={`experiments/${exp.id}`}
                    className="bg-[#2a3a4a] hover:bg-[#3a4a5a] text-[#E7EDF4] px-3 py-1 rounded text-sm text-center transition-colors duration-200"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {experiments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#6286A9] text-lg">No experiments found</p>
            <Link
              href="/admin/experiments/new-experiment"
              className="inline-block mt-4 bg-[#6286A9] hover:bg-[#4a6b8a] text-[#E7EDF4] px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Add Your First Experiment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
