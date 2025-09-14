"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import YouTubePlayer from "@/components/YoutubePlayer";
import { useQuery } from "@tanstack/react-query";

interface Instrument {
  id: string;
  name: string;
}

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
  videoUrl?: string;
  instruments?: { instrument: Instrument }[];
}

const CollapsibleSection = ({
  title,
  content,
  defaultOpen = true,
}: {
  title: string;
  content?: string;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!content) return null;

  return (
    <div className="bg-[#182634] rounded-xl shadow overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left bg-[#0D141C] hover:bg-[#1f2d3a] transition"
      >
        <h3 className="text-lg font-semibold text-[#6286A9]">{title}</h3>
        <i
          className={`ri-arrow-down-s-line text-xl text-[#6286A9] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        ></i>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-[2000px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div
          className="p-4 table-styles text-[#e7edf4de] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default function ExperimentDetail() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const params = useParams();
  const experimentId = params.id as string;

  // Use React Query to fetch experiment details
  const {
    data: experiment,
    isLoading,
    error
  } = useQuery({
    queryKey: ['experiment', experimentId],
    queryFn: async () => {
      const response = await fetch(`/api/student/experiments/${experimentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch experiment");
      }
      return response.json() as Promise<Experiment>;
    },
    staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
    refetchOnWindowFocus: false, 
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101A23]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6286A9] mx-auto"></div>
          <p className="mt-4 text-[#6286A9]">Loading experiment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101A23]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Error Loading Experiment
          </h1>
          <p className="text-[#E7EDF4] mb-6">
            There was a problem loading this experiment.
          </p>
          <Link 
            href="/experiment" 
            className="px-4 py-2 bg-[#6286A9] text-white rounded-lg hover:bg-[#4a6b8a] transition"
          >
            ← Back to Experiments
          </Link>
        </div>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101A23]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#E7EDF4] mb-4">
            Experiment Not Found
          </h1>
          <Link 
            href="/experiment" 
            className="px-4 py-2 bg-[#6286A9] text-white rounded-lg hover:bg-[#4a6b8a] transition"
          >
            ← Back to Experiments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101A23] pb-32">
      {/* Header */}
      <div className="bg-[#101A23] ">
        <div className="px-6 py-4">
          <Link
            href="/experiment"
            className="inline-flex items-center text-[#E7EDF4] hover:text-[#6286A9]"
          >
            <i className="ri-arrow-left-line mr-2 text-lg"></i>
            Back to Experiments
          </Link>
        </div>
      </div>

      {/* Title */}
      {experiment.title && (
        <h1 className="text-2xl w-full text-center capitalize font-bold text-[#E7EDF4] px-4">
          {experiment.title}
        </h1>
      )}

      {/* Details */}
      <div className="px-6 space-y-6 max-w-5xl mx-auto mt-6">
        <CollapsibleSection title="Objective" content={experiment.objective} />
        <CollapsibleSection title="Materials" content={experiment.materials} />
        <CollapsibleSection title="Procedure" content={experiment.procedure} />
        <CollapsibleSection title="Observation" content={experiment.observation} />
        <CollapsibleSection title="Result" content={experiment.result} />
        <CollapsibleSection title="Discussion" content={experiment.discussion} />
        <CollapsibleSection title="Conclusion" content={experiment.conclusion} />

        {experiment.videoUrl && (
          <div className="bg-[#182634] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#E7EDF4] mb-4">Video</h3>
            <div className="w-full relative pb-[56.25%]">
              <div className="absolute inset-0">
                <YouTubePlayer
                  url={`https://www.youtube.com/watch?v=${experiment.videoUrl}`}
                  controls
                />
              </div>
            </div>
          </div>
        )}

        {experiment.instruments && experiment.instruments.length > 0 && (
          <div className="bg-[#182634] rounded-xl shadow overflow-hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between p-4 text-left bg-[#0D141C] hover:bg-[#1f2d3a] transition"
            >
              <h3 className="text-lg font-semibold text-[#6286A9]">
                Related Instruments
              </h3>
              <i
                className={`ri-arrow-down-s-line text-xl text-[#6286A9] transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            <div
              className={`transition-all duration-300 ease-in-out ${
                isOpen
                  ? "max-h-[2000px] opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <div className="p-4 space-y-2">
                {experiment.instruments.map((relation) => (
                  <Link
                    key={relation.instrument.id}
                    href={`/instrument/${relation.instrument.id}`}
                    className="block bg-[#182634] capitalize text-[#E7EDF4] hover:text-[#6286A9] px-3 py-2 rounded-lg border border-[#2c3b4d] transition"
                  >
                    <i className="ri-microscope-fill mr-2"></i>
                    <span className="capitalize text-[#e7edf4de]">
                      {relation.instrument.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
