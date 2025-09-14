"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import YouTubePlayer from "@/components/YoutubePlayer";

interface Experiment {
  id: string;
  title: string;
  objective?: string;
  materials?: string;
  procedure?: string;
  observation?: string;
  result?: string;
  discussion?: string;
  conclusion?: string;
  createdAt: string;
  updatedAt?: string;
  videoUrl?: string;
}

export default function AdminExperimentDetail() {
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        const response = await fetch(`/api/admin/experiments/${params.id}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setExperiment(data);
        } else if (response.status === 401 || response.status === 403) {
          router.push("/admin/login");
        } else {
          setError("Failed to fetch experiment");
        }
      } catch (err) {
        console.error(err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchExperiment();
  }, [params.id, router]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101A23]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-[#6286A9] mx-auto rounded-full"></div>
          <p className="mt-4 text-[#6286A9]">Loading experiment...</p>
        </div>
      </div>
    );

  if (error || !experiment)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#101A23] text-[#6286A9]">
        <p className="text-lg">{error || "Experiment not found"}</p>
        <Link
          href="/admin/experiments"
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
    <div className="min-h-screen bg-[#101A23] pb-20 p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#E7EDF4]">
            {experiment.title}
          </h1>
        </div>
        <Link
          href="/admin/experiments"
          className="bg-[#6286A9] hover:bg-[#4a6b8a] text-[#E7EDF4] px-4 py-2 rounded-lg transition-colors duration-200 text-center"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Experiment Details */}
      <div className="space-y-4">
        {renderSection("Title", experiment.title)}
        {renderSection("Objective", experiment.objective)}
        {renderSection("Materials", experiment.materials)}
        {renderSection("Procedure", experiment.procedure)}
        {renderSection("Observation", experiment.observation)}
        {renderSection("Result", experiment.result)}
        {renderSection("Discussion", experiment.discussion)}
        {renderSection("Conclusion", experiment.conclusion)}

        {experiment.videoUrl && (
          <div className="bg-[#182634] rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-lg text-[#E7EDF4] mb-4">Video</h2>
            <div className="w-full relative pb-[56.25%]">
              <div className="absolute top-0 left-0 w-full h-full">
                <YouTubePlayer url={`https://www.youtube.com/watch?v=${experiment.videoUrl}`} />
              </div>
            </div>
          </div>
        )}
        {/* Metadata */}
        <div className="text-[#6286A9] text-sm mt-4 space-y-1">
          <p>Created: {new Date(experiment.createdAt).toLocaleString()}</p>
          {experiment.updatedAt && (
            <p>Updated: {new Date(experiment.updatedAt).toLocaleString()}</p>
          )}
        </div>

        {/* Delete Button */}
        <div>
          <button
            onClick={async () => {
              if (!confirm("Are you sure you want to delete this experiment?"))
                return;
              try {
                const response = await fetch(
                  `/api/admin/experiments/${experiment.id}`,
                  {
                    method: "DELETE",
                    credentials: "include",
                  }
                );
                const data = await response.json();
                
                if (response.ok) {
                  alert("Experiment deleted successfully");
                  router.push("/admin/experiments");
                } else if (response.status === 404) {
                  alert("Experiment not found. It may have been already deleted.");
                  router.push("/admin/experiments");
                } else if (response.status === 401 || response.status === 403) {
                  alert("You are not authorized to delete this experiment.");
                  router.push("/admin/login");
                } else if (response.status === 409) {
                  alert(data.error || "Cannot delete experiment because it has linked instruments. Please remove these links first.");
                } else {
                  console.error("Delete error:", data);
                  alert(data.error || "Failed to delete experiment");
                }
              } catch (err) {
                console.error("Delete network error:", err);
                alert("Network error while deleting experiment. Please try again.");
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-[#E7EDF4] px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Delete Experiment
          </button>
        </div>
      </div>
    </div>
  );
}
