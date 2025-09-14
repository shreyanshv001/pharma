"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import YouTubePlayer from "@/components/YoutubePlayer";

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

export default function AdminInstrumentDetail() {
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchInstrument = async () => {
      try {
        const response = await fetch(`/api/admin/instruments/${params.id}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setInstrument(data);
        } else if (response.status === 401 || response.status === 403) {
          router.push("/admin/login");
        } else {
          setError("Failed to fetch instrument");
        }
      } catch (err) {
        console.error(err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchInstrument();
  }, [params.id, router]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101A23]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-[#6286A9] mx-auto rounded-full"></div>
          <p className="mt-4 text-[#6286A9]">Loading instrument...</p>
        </div>
      </div>
    );

  if (error || !instrument)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#101A23] text-[#6286A9]">
        <p className="text-lg">{error || "Instrument not found"}</p>
        <Link
          href="/admin/dashboard"
          className="mt-4 bg-[#6286A9] hover:bg-[#4a6b8a] text-[#E7EDF4] px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Back to Dashboard
        </Link>
      </div>
    );

    const renderSection = (title: string, content?: string) => {
      if (!content) return null;
      return (
        <div className="bg-[#182634] rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold text-lg text-[#E7EDF4] mb-2">{title}</h2>
          <div
            className="table-styles text-[#E7EDF4]"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      );
    };
    

  return (
    <div className="min-h-screen bg-[#101A23] p-4 pb-20 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#E7EDF4]">{instrument.name}</h1>
          <p className="text-[#6286A9] mt-1">Category: {instrument.category}</p>
        </div>
        <Link
          href="/admin/dashboard"
          className="bg-[#6286A9] hover:bg-[#4a6b8a] text-[#E7EDF4] px-4 py-2 rounded-lg transition-colors duration-200 text-center"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Instrument Details */}
      <div className="space-y-4">
        {renderSection("Description", instrument.discription)}
        {renderSection("Principle", instrument.principle)}
        {renderSection("SOP", instrument.sop)}
        {renderSection("ICH Guideline", instrument.ichGuideline)}
        {renderSection("Procedure", instrument.procedure)}
        {renderSection("Advantages", instrument.advantages)}
        {renderSection("Limitations", instrument.limitations)}
        {renderSection("Specifications", instrument.specifications)}

        {/* Images */}
        {instrument.imageUrls && instrument.imageUrls.length > 0 && (
          <div>
            <h2 className="font-semibold text-lg text-[#E7EDF4] mb-2">Images</h2>
            <div className="flex flex-wrap gap-2 overflow-x-auto">
              {instrument.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Instrument ${index + 1}`}
                  className="h-32 sm:h-40 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Video */}
        {instrument.videoUrl && (
          <div className="bg-[#182634] rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-lg text-[#E7EDF4] mb-4">Video</h2>
            <div className="w-full relative pb-[56.25%]">
              <div className="absolute top-0 left-0 w-full h-full">
                <YouTubePlayer url={`https://www.youtube.com/watch?v=${instrument.videoUrl}`} />
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="text-[#6286A9] text-sm mt-4 space-y-1">
          <p>Created: {new Date(instrument.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(instrument.updatedAt).toLocaleString()}</p>
        </div>

        {/* Delete Button */}
        <div>
          <button
            onClick={async () => {
              if (!confirm("Are you sure you want to delete this instrument?")) return;
              try {
                const response = await fetch(`/api/admin/instruments/${instrument.id}`, {
                  method: "DELETE",
                  credentials: "include",
                });
                
                const data = await response.json();
                
                if (response.ok) {
                  alert("Instrument deleted successfully");
                  router.push("/admin/dashboard");
                } else if (response.status === 404) {
                  alert("Instrument not found. It may have been already deleted.");
                  router.push("/admin/dashboard");
                } else if (response.status === 401 || response.status === 403) {
                  alert("You are not authorized to delete this instrument.");
                  router.push("/admin/login");
                } else if (response.status === 409) {
                  alert(data.error || "Cannot delete instrument because it is linked to experiments. Please remove these links first.");
                } else {
                  console.error("Delete error:", data);
                  alert(data.error || "Failed to delete instrument");
                }
              } catch (err) {
                console.error("Delete network error:", err);
                alert("Network error while deleting instrument. Please try again.");
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-[#E7EDF4] px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Delete Instrument
          </button>
        </div>
      </div>
    </div>
  );
}
