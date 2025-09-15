"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Experiment } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

// Dynamically import browser-only components
const YouTubePlayer = dynamic(() => import("@/components/YoutubePlayer"), { ssr: false });

interface Instrument {
  id: string;
  name: string;
  category?: string;
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
  experiments?: { experiment: Experiment }[];
}

interface CollapsibleSectionProps {
  title: string;
  content?: string;
  defaultOpen?: boolean;
  icon?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  content, 
  defaultOpen = true,
  icon = "ri-file-text-line"
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
          className="p-6 table-styles text-slate-300 leading-relaxed prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

interface InstrumentDetailProps {
  instrumentId: string;
}

const InstrumentDetailClient: React.FC<InstrumentDetailProps> = ({ instrumentId }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [experimentsOpen, setExperimentsOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use React Query to fetch instrument data
  const {
    data: instrument,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['instrument', instrumentId],
    queryFn: async () => {
      const res = await fetch(`/api/student/instruments/${instrumentId}`);
      if (!res.ok) throw new Error("Failed to fetch instrument");
      return res.json() as Promise<Instrument>;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handlePrev = () => {
    if (!instrument?.imageUrls?.length) return;
    setLightboxIndex(prev => (prev === 0 ? instrument.imageUrls!.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!instrument?.imageUrls?.length) return;
    setLightboxIndex(prev => (prev === instrument.imageUrls!.length - 1 ? 0 : prev + 1));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/60 rounded-full mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-400 border-t-transparent"></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading Instrument</h3>
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
            <h3 className="text-2xl font-bold text-red-400 mb-4">Unable to Load Instrument</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              There was a problem loading this instrument. Please check your connection and try again.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <i className="ri-arrow-left-line"></i>
              Back to Instruments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!instrument) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
        <div className="relative min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 rounded-full mb-6">
              <i className="ri-microscope-line text-2xl text-slate-400"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-300 mb-4">Instrument Not Found</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              The requested instrument could not be found. It may have been removed or the link is incorrect.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <i className="ri-arrow-left-line"></i>
              Back to Instruments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
      
      <div className="relative pb-32">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-300 hover:scale-105 group"
            >
              <i className="ri-arrow-left-line text-lg group-hover:-translate-x-1 transition-transform duration-300"></i>
              Back to Instruments
            </Link>
          </div>
        </div>

        {/* Title */}
        {instrument.name && (
          <div className="text-center mb-8 px-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-4 tracking-tight capitalize leading-tight">
              {instrument.name}
            </h1>
            {instrument.category && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-xl border border-slate-700/30">
                <i className="ri-price-tag-3-line text-blue-400"></i>
                <span className="text-slate-300 capitalize font-medium">{instrument.category.replace(/_/g, " ")}</span>
              </div>
            )}
          </div>
        )}

        {/* Image Carousel */}
        {instrument.imageUrls?.length ? (
          <div className="px-4 sm:px-6 lg:px-8 mb-8">
            <div className="max-w-md mx-auto relative group">
              {/* Main Image */}
              <div
                className="relative w-full aspect-[3/4] bg-slate-800/60 rounded-xl overflow-hidden cursor-pointer border border-slate-700/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
                onClick={() => { setLightboxIndex(currentIndex); setIsLightboxOpen(true); }}
              >
                <Image
                  src={instrument.imageUrls[currentIndex]}
                  alt={`${instrument.name} ${currentIndex + 1}`}
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                  className="transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4 bg-slate-900/80 rounded-lg px-2 py-1">
                  <span className="text-xs text-slate-300">{currentIndex + 1}/{instrument.imageUrls.length}</span>
                </div>
              </div>

              {/* Navigation Buttons */}
              {instrument.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === 0 ? instrument.imageUrls!.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900/80 hover:bg-slate-900/90 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                  >
                    <i className="ri-arrow-left-s-line text-xl"></i>
                  </button>

                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === instrument.imageUrls!.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900/80 hover:bg-slate-900/90 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                  >
                    <i className="ri-arrow-right-s-line text-xl"></i>
                  </button>
                </>
              )}

              {/* Pagination Dots */}
              {instrument.imageUrls.length > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  {instrument.imageUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentIndex 
                          ? "bg-blue-400 scale-110 shadow-lg shadow-blue-400/25" 
                          : "bg-slate-600 hover:bg-slate-500 hover:scale-105"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Enhanced Lightbox */}
        {isLightboxOpen && instrument.imageUrls && (
          <div
            className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => setIsLightboxOpen(false)}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
            
            {/* Close Button */}
            <button 
              onClick={() => setIsLightboxOpen(false)} 
              className="absolute top-6 right-6 w-12 h-12 bg-slate-800/80 hover:bg-red-500/80 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
            >
              <i className="ri-close-line text-xl"></i>
            </button>

            {/* Navigation Buttons */}
            {instrument.imageUrls.length > 1 && (
              <>
                <button 
                  onClick={e => { e.stopPropagation(); handlePrev(); }} 
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-slate-800/80 hover:bg-slate-700/90 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
                >
                  <i className="ri-arrow-left-s-line text-2xl"></i>
                </button>
                
                <button 
                  onClick={e => { e.stopPropagation(); handleNext(); }} 
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-slate-800/80 hover:bg-slate-700/90 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
                >
                  <i className="ri-arrow-right-s-line text-2xl"></i>
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute top-6 left-6 bg-slate-800/80 rounded-lg px-4 py-2 text-white font-medium z-10">
              {lightboxIndex + 1} of {instrument.imageUrls.length}
            </div>

            <Image
              src={instrument.imageUrls[lightboxIndex]}
              alt={`${instrument.name} large view`}
              width={1200}
              height={1200}
              style={{ objectFit: "contain", maxHeight: "85%", maxWidth: "85%" }}
              onClick={e => e.stopPropagation()}
              className="rounded-lg shadow-2xl"
            />
          </div>
        )}

        {/* Content Sections */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <CollapsibleSection 
              title="Description" 
              content={instrument.discription} 
              icon="ri-information-line"
            />
            <CollapsibleSection 
              title="Principle" 
              content={instrument.principle} 
              icon="ri-lightbulb-line"
            />
            <CollapsibleSection 
              title="Standard Operating Procedure" 
              content={instrument.sop} 
              icon="ri-file-list-3-line"
            />
            <CollapsibleSection 
              title="ICH Guidelines" 
              content={instrument.ichGuideline} 
              icon="ri-shield-check-line"
            />
            <CollapsibleSection 
              title="Procedure" 
              content={instrument.procedure} 
              icon="ri-route-line"
            />
            <CollapsibleSection 
              title="Advantages" 
              content={instrument.advantages} 
              icon="ri-thumb-up-line"
            />
            <CollapsibleSection 
              title="Limitations" 
              content={instrument.limitations} 
              icon="ri-alert-line"
            />
            <CollapsibleSection 
              title="Specifications" 
              content={instrument.specifications} 
              icon="ri-settings-3-line"
            />

            {/* Video Section */}
            {instrument.videoUrl && (
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
                        url={`https://www.youtube.com/watch?v=${instrument.videoUrl}`} 
                        width="100%" 
                        height="100%" 
                        controls 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Related Experiments */}
            {instrument.experiments?.length ? (
              <div className="bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700/30 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-500/20">
                <button
                  onClick={() => setExperimentsOpen(!experimentsOpen)}
                  className="w-full flex items-center justify-between p-5 text-left bg-slate-700/50 hover:bg-slate-700/70 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
                      <i className="ri-flask-line text-lg text-blue-400 group-hover:text-blue-300 transition-colors duration-300"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
                      Related Experiments ({instrument.experiments.length})
                    </h3>
                  </div>
                  <i
                    className={`ri-arrow-down-s-line text-xl text-slate-400 group-hover:text-blue-400 transition-all duration-300 ${
                      experimentsOpen ? "rotate-180" : ""
                    }`}
                  ></i>
                </button>

                <div
                  className={`transition-all duration-500 ease-out ${
                    experimentsOpen
                      ? "max-h-[2000px] opacity-100"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  <div className="p-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {instrument.experiments.map((rel, index) => (
                      <Link
                        key={rel.experiment.id}
                        href={`/experiment/${rel.experiment.id}`}
                        className="group flex items-center gap-3 p-4 bg-slate-700/40 hover:bg-slate-700/60 rounded-xl border border-slate-600/30 hover:border-blue-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                          <i className="ri-flask-fill text-sm text-blue-400 group-hover:text-blue-300 transition-colors duration-300"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors duration-300 capitalize line-clamp-1">
                            {rel.experiment.object}
                          </span>
                        </div>
                        <i className="ri-arrow-right-line text-sm text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300"></i>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstrumentDetailClient;
