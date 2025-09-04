"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Experiment } from "@prisma/client";

// Dynamically import browser-only components
const Swiper = dynamic(() => import("swiper/react").then(mod => mod.Swiper), { ssr: false });
const SwiperSlide = dynamic(() => import("swiper/react").then(mod => mod.SwiperSlide), { ssr: false });
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

const CollapsibleSection = ({ title, content, defaultOpen = true }: { title: string; content?: string; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!content) return null;

  return (
    <div className="bg-[#182634] rounded-xl shadow overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left bg-[#0D141C] hover:bg-[#1f2d3a] transition"
      >
        <h3 className="text-lg font-semibold text-[#6286A9]">{title}</h3>
        <i className={`ri-arrow-down-s-line text-xl text-[#6286A9] transition-transform ${isOpen ? "rotate-180" : ""}`}></i>
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
        <div className="p-4 table-styles text-[#e7edf4de] leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

export default function InstrumentDetail({ params }: { params: { id: string } }) {
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchInstrument = async () => {
      try {
        const response = await fetch(`/api/student/instruments/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setInstrument(data);
        }
      } catch (error) {
        console.error("Error fetching instrument:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInstrument();
  }, [params.id]);

  const handlePrev = () => {
    if (!instrument?.imageUrls) return;
    setLightboxIndex(prev => (prev === 0 ? instrument.imageUrls!.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!instrument?.imageUrls) return;
    setLightboxIndex(prev => (prev === instrument.imageUrls!.length - 1 ? 0 : prev + 1));
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101A23]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6286A9] mx-auto"></div>
          <p className="mt-4 text-[#6286A9]">Loading instrument...</p>
        </div>
      </div>
    );

  if (!instrument)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101A23]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#E7EDF4] mb-4">Instrument Not Found</h1>
          <Link href="/" className="text-[#6286A9] hover:text-[#0D141C]">
            ← Back to Instruments
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#101A23] pb-32">
      {/* Header */}
      <div className="px-6 py-4">
        <Link href="/" className="inline-flex items-center text-[#E7EDF4] hover:text-[#6286A9]">
          <i className="ri-arrow-left-line mr-2 text-lg"></i>Back
        </Link>
      </div>

      {instrument.name && (
        <h1 className="text-2xl w-full text-center capitalize font-bold text-[#E7EDF4]">{instrument.name}</h1>
      )}

      {/* Carousel */}
      {instrument.imageUrls && instrument.imageUrls.length > 0 && (
        <div className="px-6 relative group py-6">
          <Swiper
            modules={[]}
            spaceBetween={12}
            slidesPerView={1}
          >
            {instrument.imageUrls.map((url, index) => (
              <SwiperSlide key={index}>
                <div
                  className="relative w-full max-w-xs aspect-[3/4] bg-[#182634] rounded-xl overflow-hidden cursor-pointer mx-auto"
                  onClick={() => {
                    setLightboxIndex(index);
                    setIsLightboxOpen(true);
                  }}
                >
                  <img
                    src={url}
                    alt={`${instrument.name} ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && instrument.imageUrls && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button onClick={() => setIsLightboxOpen(false)} className="absolute top-6 right-6 text-white text-3xl font-bold hover:text-red-500">&times;</button>
          <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-400 select-none">&#10094;</button>
          <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="absolute right-6 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-400 select-none">&#10095;</button>
          <img src={instrument.imageUrls[lightboxIndex]} alt={`${instrument.name} large view`} className="max-h-[90%] max-w-[90%] object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Details */}
      <div className="px-6 space-y-6 max-w-5xl mx-auto">
        {instrument.category && (
          <div className="bg-[#182634] rounded-lg p-4">
            <p className="text-zinc-400 lowercase ">
              <span className="font-semibold capitalize">Category:</span> {instrument.category}
            </p>
          </div>
        )}

        <CollapsibleSection title="Description" content={instrument.discription} />
        <CollapsibleSection title="Principle" content={instrument.principle} />
        <CollapsibleSection title="SOP" content={instrument.sop} />
        <CollapsibleSection title="ICH Guidelines" content={instrument.ichGuideline} />
        <CollapsibleSection title="Procedure" content={instrument.procedure} />
        <CollapsibleSection title="Advantages" content={instrument.advantages} />
        <CollapsibleSection title="Limitations" content={instrument.limitations} />
        <CollapsibleSection title="Specifications" content={instrument.specifications} />

        {instrument.videoUrl && (
          <div className="bg-[#182634] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#E7EDF4] mb-4">Video</h3>
            <div className="w-full relative pb-[56.25%]">
              <div className="absolute inset-0">
                <YouTubePlayer url={`https://www.youtube.com/watch?v=${instrument.videoUrl}`} width="100%" height="100%" controls />
              </div>
            </div>
          </div>
        )}

        {instrument.experiments && instrument.experiments.length > 0 && (
          <div className="bg-[#182634] rounded-xl shadow overflow-hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between p-4 text-left bg-[#0D141C] hover:bg-[#1f2d3a] transition"
            >
              <h3 className="text-lg font-semibold text-[#6286A9]">Experiments</h3>
              <i className={`ri-arrow-down-s-line text-xl text-[#6286A9] transition-transform ${isOpen ? "rotate-180" : ""}`}></i>
            </button>
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
              <div className="p-4 space-y-2">
                {instrument.experiments.map((relation) => (
                  <Link
                    key={relation.experiment.id}
                    href={`/experiment/${relation.experiment.id}`}
                    className="block bg-[#182634] capitalize text-[#E7EDF4] hover:text-[#6286A9] px-3 py-2 rounded-lg border border-[#2c3b4d] transition"
                  >
                    <i className="ri-flask-fill mr-2"></i>
                    <span className="capitalize text-[#e7edf4de]">{relation.experiment.title}</span>
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
