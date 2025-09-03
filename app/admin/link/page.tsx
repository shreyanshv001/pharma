"use client";

import { useEffect, useState } from "react";

interface Instrument {
  id: string;
  name: string;
}

interface Experiment {
  id: string;
  title: string;
}

export default function LinkPage() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch instruments & experiments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [instRes, expRes] = await Promise.all([
          fetch("/api/admin/all-instruments", { credentials: "include" }),
          fetch("/api/admin/all-experiments", { credentials: "include" }),
        ]);

        if (instRes.ok && expRes.ok) {
          setInstruments(await instRes.json());
          setExperiments(await expRes.json());
        } else {
          setMessage("Failed to load data");
        }
      } catch (err) {
        console.error(err);
        setMessage("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle link action
  const handleLink = async () => {
    if (!selectedInstrument || !selectedExperiment) {
      setMessage("Please select both an instrument and an experiment.");
      return;
    }

    try {
      const response = await fetch("/api/admin/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          instrumentId: selectedInstrument,
          experimentId: selectedExperiment,
        }),
      });

      if (response.ok) {
        setMessage("Instrument linked to Experiment successfully ✅");
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to link");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101A23] flex items-center justify-center">
        <p className="text-[#6286A9]">Loading instruments and experiments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101A23] p-6 pb-20 text-[#E7EDF4]">
      <h1 className="text-2xl font-bold mb-6 text-center">Link Instruments with Experiments</h1>

      {/* Two columns layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instruments */}
        <div className="bg-[#182634] rounded-xl p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Instruments</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {instruments.map((inst) => (
              <button
                key={inst.id}
                onClick={() => setSelectedInstrument(inst.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedInstrument === inst.id
                    ? "bg-[#6286A9] text-white"
                    : "bg-[#1f2d3a] hover:bg-[#2a3a4a]"
                }`}
              >
                {inst.name}
              </button>
            ))}
          </div>
        </div>

        {/* Experiments */}
        <div className="bg-[#182634] rounded-xl p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Experiments</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {experiments.map((exp) => (
              <button
                key={exp.id}
                onClick={() => setSelectedExperiment(exp.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedExperiment === exp.id
                    ? "bg-[#6286A9] text-white"
                    : "bg-[#1f2d3a] hover:bg-[#2a3a4a]"
                }`}
              >
                {exp.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Link Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleLink}
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-[#E7EDF4] transition-colors"
        >
          Link Selected
        </button>
        {message && <p className="mt-4 text-sm text-[#6286A9]">{message}</p>}
      </div>
    </div>
  );
}
