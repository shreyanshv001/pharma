"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Instrument {
  id: string;
  name: string;
  category: string;
  principle?: string;
  discription?: string;
  procedure?: string;
  sop?: string;
  ichGuideline?: string;
  advantages?: string;
  limitations?: string;
  specifications?: string;
  imageUrls?: string[];
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const response = await fetch("/api/admin/all-instruments", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setInstruments(data);
        } else if (response.status === 401 || response.status === 403) {
          router.push("/admin/login");
        } else {
          setError("Failed to fetch instruments");
        }
      } catch (err) {
        console.error(err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchInstruments();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101A23] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6286A9] mx-auto"></div>
          <p className="mt-4 text-[#6286A9]">Loading instruments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#101A23] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#E7EDF4] mb-4">Error</h1>
          <p className="text-[#6286A9] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#6286A9] hover:bg-[#4a6b8a] text-[#E7EDF4] px-4 py-2 rounded-lg"
          >
            Try Again
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
            <p className="text-[#6286A9] text-sm sm:text-base">
              Manage Instruments
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <Link
              href="dashboard/new-instrument"
              className="bg-[#6286A9] hover:bg-[#4a6b8a] text-[#E7EDF4] px-4 py-2 rounded-lg transition-colors duration-200 text-center"
            >
              Add Instrument
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-[#E7EDF4] px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-[#E7EDF4] mb-4">
          All Instruments ({instruments.length})
        </h2>

        {/* Instruments List */}
        <div className="space-y-4">
          {instruments.map((instrument) => (
            <div
              key={instrument.id}
              className="bg-[#182634] rounded-lg shadow-sm p-4 sm:p-6 hover:bg-[#1f2d3a] transition-colors duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                    <h3 className="text-lg font-semibold text-[#E7EDF4]">
                      {instrument.name}
                    </h3>
                    <span className="bg-[#6286A9] text-[#E7EDF4] px-2 py-1 rounded text-xs sm:text-sm">
                      {instrument.category}
                    </span>
                  </div>

                  {instrument.discription && (
                    <div
                      className="text-[#e7edf4c7] h-20 text-sm mb-2 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: instrument.discription }}
                    />
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-xs text-[#6286A9]">
                    <span>
                      Created:{" "}
                      {new Date(instrument.createdAt).toLocaleDateString()}
                    </span>
                    {instrument.imageUrls?.length && (
                      <span>📷 {instrument.imageUrls.length} images</span>
                    )}
                    {instrument.videoUrl && <span>🎥 Has video</span>}
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col gap-2 sm:gap-1">
                  <Link
                    href={`dashboard/instrument/${instrument.id}`}
                    className="bg-[#2a3a4a] hover:bg-[#3a4a5a] text-[#E7EDF4] px-3 py-1 rounded text-sm text-center transition-colors duration-200"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {instruments.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-[#6286A9] text-lg">No instruments found</p>
            <Link
              href="/admin/new-instrument"
              className="inline-block mt-4 bg-[#6286A9] hover:bg-[#4a6b8a] text-[#E7EDF4] px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Add Your First Instrument
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
