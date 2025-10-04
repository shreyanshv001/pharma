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
  object: string;
  reference?: string;
  materials?: string;
  procedure?: string;
  observation?: string;
  result?: string;
  theory?: string;
  chemicalReaction?: string;
  calculations?: string;
  createdAt: string;
  updatedAt?: string;
  videoUrl?: string;
  instruments?: { instrument: Instrument }[];
}

const CollapsibleSection = ({
  title,
  content,
  defaultOpen = true,
  icon = "ri-file-text-line"
}: {
  title: string;
  content?: string;
  defaultOpen?: boolean;
  icon?: string;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!content) return null;

  return (
    <div className="bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700/30 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-500/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-slate-700/50 hover:bg-slate-700/70 transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
            <i className={`${icon} text-lg text-blue-400 group-hover:text-blue-300 transition-colors duration-300`}></i>
          </div>
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
            {title}
          </h3>
        </div>
        <i
          className={`ri-arrow-down-s-line text-xl text-slate-400 group-hover:text-blue-400 transition-all duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        ></i>
      </button>
      <div
        className={`transition-all duration-500 ease-out ${
          isOpen
            ? "max-h-[2000px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div
          className="py-6 px-4 lg:px-6 table-styles text-slate-300 leading-relaxed text-lg prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default function ExperimentDetail() {
  const [instrumentsOpen, setInstrumentsOpen] = useState(true);
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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, 
  });
  console.log(experiment);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/60 rounded-full mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-400 border-t-transparent"></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading Experiment</h3>
            <p className="text-slate-400">Please wait while we fetch the details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
        <div className="relative min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-6">
              <i className="ri-error-warning-line text-2xl text-red-400"></i>
            </div>
            <h3 className="text-2xl font-bold text-red-400 mb-4">Unable to Load Experiment</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              There was a problem loading this experiment. Please check your connection and try again.
            </p>
            <Link 
              href="/experiment" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <i className="ri-arrow-left-line"></i>
              Back to Experiments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
        <div className="relative min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 rounded-full mb-6">
              <i className="ri-flask-line text-2xl text-slate-400"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-300 mb-4">Experiment Not Found</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              The requested experiment could not be found. It may have been removed or the link is incorrect.
            </p>
            <Link 
              href="/experiment" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <i className="ri-arrow-left-line"></i>
              Back to Experiments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br lg:pt-20 from-slate-950 via-slate-900 to-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
      
      <div className="relative pb-32">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/experiment"
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-300 hover:scale-105 group"
            >
              <i className="ri-arrow-left-line text-lg group-hover:-translate-x-1 transition-transform duration-300"></i>
              Back to Experiments
            </Link>
          </div>
        </div>

        {/* Title */}
        {experiment.object && (
          <div className="text-center mb-8 px-4">
            <h1 className="text-2xl sm:text-4xl lg:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-4 tracking-tight capitalize leading-tight">
              {experiment.object}
            </h1>
          </div>
        )}

        {/* Content Sections */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <CollapsibleSection 
              title="Reference" 
              content={experiment?.reference} 
              icon="ri-bookmark-line"
            />
            <CollapsibleSection 
              title="Material Required" 
              content={experiment?.materials} 
              icon="ri-list-check"
            />
            <CollapsibleSection 
              title="Theory" 
              content={experiment?.theory} 
              icon="ri-lightbulb-line"
            />
            <CollapsibleSection 
              title="Chemical Reaction" 
              content={experiment?.chemicalReaction} 
              icon="ri-flask-fill"
            />
            <CollapsibleSection 
              title="Procedure" 
              content={experiment?.procedure} 
              icon="ri-route-line"
            />
            <CollapsibleSection 
              title="Observation" 
              content={experiment?.observation} 
              icon="ri-eye-line"
            />
            <CollapsibleSection 
              title="Calculation" 
              content={experiment?.calculations} 
              icon="ri-calculator-line"
            />
            <CollapsibleSection 
              title="Result" 
              content={experiment?.result} 
              icon="ri-bar-chart-line"
            />

            {/* Video Section */}
            {experiment?.videoUrl && (
              <div className="bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700/30 shadow-xl">
                <div className="p-5 bg-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center shadow-lg">
                      <i className="ri-play-circle-line text-lg text-blue-400"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Demonstration Video</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="w-full relative pb-[56.25%] bg-slate-900/50 rounded-lg overflow-hidden">
                    <div className="absolute inset-0">
                      <YouTubePlayer
                        url={`https://www.youtube.com/watch?v=${experiment.videoUrl}`}
                        controls
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Related Instruments */}
            {experiment.instruments && experiment.instruments.length > 0 && (
              <div className="bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700/30 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-500/20">
                <button
                  onClick={() => setInstrumentsOpen(!instrumentsOpen)}
                  className="w-full flex items-center justify-between p-5 text-left bg-slate-700/50 hover:bg-slate-700/70 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
                      <i className="ri-microscope-line text-lg text-blue-400 group-hover:text-blue-300 transition-colors duration-300"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
                      Related Instruments ({experiment.instruments.length})
                    </h3>
                  </div>
                  <i
                    className={`ri-arrow-down-s-line text-xl text-slate-400 group-hover:text-blue-400 transition-all duration-300 ${
                      instrumentsOpen ? "rotate-180" : ""
                    }`}
                  ></i>
                </button>

                <div
                  className={`transition-all duration-500 ease-out ${
                    instrumentsOpen
                      ? "max-h-[2000px] opacity-100"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  <div className="p-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {experiment.instruments.map((relation, index) => (
                      <Link
                        key={relation.instrument.id}
                        href={`/instrument/${relation.instrument.id}`}
                        className="group flex items-center gap-3 p-4 bg-slate-700/40 hover:bg-slate-700/60 rounded-xl border border-slate-600/30 hover:border-blue-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                          <i className="ri-microscope-fill text-sm text-blue-400 group-hover:text-blue-300 transition-colors duration-300"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors duration-300 capitalize line-clamp-1">
                            {relation.instrument.name}
                          </span>
                        </div>
                        <i className="ri-arrow-right-line text-sm text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300"></i>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
