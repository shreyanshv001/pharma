"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import JoditEditor to avoid SSR issues
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function AddExperimentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [principle, setPrinciple] = useState("");
  const [procedure, setProcedure] = useState("");
  const [observation, setObservation] = useState("");
  const [result, setResult] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const editor = useRef(null);
    const config = {
      readonly: false,
      height: 200,
      placeholder: "Describe your question here...",
      theme: "dark",
      buttons: [
        'bold', 
        'italic', 
        'underline', 
        'ul', 
        'ol',
        'paragraph', // Add paragraph dropdown (contains alignment options)
        'align', // Explicit alignment buttons
        'hr', // Horizontal rule/line
        'link',
        'image',
        'table',
        'undo', 
        'redo'
      ],
      // Same buttons for all screen sizes
      buttonsMD: [
        'bold', 
        'italic', 
        'underline', 
        'ul', 
        'ol',
        'paragraph', // Add paragraph dropdown (contains alignment options)
        'align', // Explicit alignment buttons
        'hr', // Horizontal rule/line
        'link',
        'image',
        'table',
        'undo', 
        'redo'
      ],
      buttonsSM: [
        'bold', 
        'italic', 
        'underline', 
        'ul', 
        'ol',
        'paragraph', // Add paragraph dropdown (contains alignment options)
        'align', // Explicit alignment buttons
        'hr', // Horizontal rule/line
        'link',
        'image',
        'table',
        'undo', 
        'redo'
      ],
      buttonsXS: [
        'bold', 
        'italic', 
        'underline', 
        'ul', 
        'ol',
        'paragraph', // Add paragraph dropdown (contains alignment options)
        'align', // Explicit alignment buttons
        'hr', // Horizontal rule/line
        'link',
        'image',
        'table',
        'undo', 
        'redo'
      ],
      style: {
        background: '#101A23',  // Dark background to match your theme
        color: '#E5E7EB'        // Light text color
      },
      uploader: {
        insertImageAsBase64URI: true
      },
      toolbarAdaptive: false,   // Disable toolbar adaptation to maintain same buttons
      toolbarSticky: true,      // Keep toolbar visible when scrolling
      allowResizeX: false,      // Prevent horizontal resizing
      allowResizeY: true,       // Allow vertical resizing
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("objective", objective);
      formData.append("principle", principle);
      formData.append("procedure", procedure);
      formData.append("observation", observation);
      formData.append("result", result);
      formData.append("videoUrl", videoUrl);

      const response = await fetch("/api/admin/add-experiments", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add experiment");
      } else {
        setSuccess("Experiment added successfully!");
        setTimeout(() => router.push("/admin/experiments"), 1500);
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101A23] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-3xl bg-[#182634] rounded-lg p-6 sm:p-8 shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#E7EDF4] mb-6 text-center">
          Add New Experiment
        </h1>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3 mb-4">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <input
            type="text"
            placeholder="Experiment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-[#0D141C] border border-[#2a3a4a] text-[#E7EDF4] placeholder:text-[#6286A9] px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6286A9]"
          />

          {/* Objective */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Objective</label>
            <JoditEditor config={config} ref={editor} value={objective} onBlur={(content) => setObjective(content)} />
          </div>

          {/* Principle */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Principle</label>
            <JoditEditor config={config} ref={editor} value={principle} onBlur={(content) => setPrinciple(content)} />
          </div>

          {/* Procedure */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Procedure</label>
            <JoditEditor config={config} ref={editor} value={procedure} onBlur={(content) => setProcedure(content)} />
          </div>

          {/* Observation */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Observation</label>
            <JoditEditor config={config} ref={editor} value={observation} onBlur={(content) => setObservation(content)} />
          </div>

          {/* Result */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Result</label>
            <JoditEditor config={config} ref={editor} value={result} onBlur={(content) => setResult(content)} />
          </div>

          {/* Video */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">YouTube Video ID</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g., dQw4w9WgXcQ"
              className="w-full bg-[#0D141C] border border-[#2a3a4a] text-[#E7EDF4] placeholder:text-[#6286A9] px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6286A9]"
            />
          </div>


          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6286A9] hover:bg-[#4a6b8a] text-[#E7EDF4] font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Experiment"}
          </button>
        </form>
      </div>
    </div>
  );
}
