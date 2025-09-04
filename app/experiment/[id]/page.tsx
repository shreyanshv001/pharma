"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import YouTubePlayer from "@/components/YoutubePlayer";

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
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        const response = await fetch(`/api/student/experiments/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          console.log(data)
          setExperiment(data);
        }
      } catch (error) {
        console.error("Error fetching experiment:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperiment();
  }, [params.id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101A23]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6286A9] mx-auto"></div>
          <p className="mt-4 text-[#6286A9]">Loading experiment...</p>
        </div>
      </div>
    );

  if (!experiment)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101A23]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#E7EDF4] mb-4">
            Experiment Not Found
          </h1>
          <Link href="/experiment" className="text-[#6286A9] hover:text-[#0D141C]">
            ← Back to Experiments
          </Link>
        </div>
      </div>
    );

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
          </Link>
        </div>
      </div>

      {/* Title */}
      {experiment.title && (
        <h1 className="text-2xl w-full text-center capitalize font-bold text-[#E7EDF4]">
          {experiment.title}
        </h1>
      )}

      {/* Details */}
      <div className="px-6 space-y-6 max-w-5xl mx-auto mt-6">
        {experiment.objective && (
          <CollapsibleSection title="Objective" content={experiment.objective} />
        )}
        {experiment.materials && (
          <CollapsibleSection title="Materials" content={experiment.materials} />
        )}
        {experiment.procedure && (
          <CollapsibleSection title="Procedure" content={experiment.procedure} />
        )}
        {experiment.observation && (
          <CollapsibleSection
            title="Observation"
            content={experiment.observation}
          />
        )}
        {experiment.result && (
          <CollapsibleSection title="Result" content={experiment.result} />
        )}
        {experiment.discussion && (
          <CollapsibleSection title="Discussion" content={experiment.discussion} />
        )}
        {experiment.conclusion && (
          <CollapsibleSection title="Conclusion" content={experiment.conclusion} />
        )}

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
                    href={`/${relation.instrument.id}`}
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
