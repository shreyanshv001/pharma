"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function AddExperimentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields (match backend schema)
  const [object, setObject] = useState("");
  const [reference, setReference] = useState("");
  const [materials, setMaterials] = useState("");
  const [theory, setTheory] = useState("");
  const [procedure, setProcedure] = useState("");
  const [observation, setObservation] = useState("");
  const [result, setResult] = useState("");
  const [chemicalReaction, setChemicalReaction] = useState("");
  const [calculations, setCalculations] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const editor = useRef(null);
  const config = {
    readonly: false,
    height: 200,
    placeholder: "Write here...",
    theme: "dark",
    buttons: [
      "bold",
      "italic",
      "underline",
      "ul",
      "ol",
      "paragraph",
      "align",
      "hr",
      "link",
      "image",
      "table",
      "undo",
      "redo",
    ],
    toolbarAdaptive: false,
    toolbarSticky: true,
    style: { background: "#101A23", color: "#E5E7EB" },
    uploader: { insertImageAsBase64URI: true },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("object", object);
      formData.append("reference", reference);
      formData.append("materials", materials);
      formData.append("theory", theory);
      formData.append("procedure", procedure);
      formData.append("observation", observation);
      formData.append("result", result);
      formData.append("chemicalReaction", chemicalReaction);
      formData.append("calculations", calculations);
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
          {/* Object */}
          <input
            type="text"
            placeholder="Experiment Object"
            value={object}
            onChange={(e) => setObject(e.target.value)}
            required
            className="w-full bg-[#0D141C] border border-[#2a3a4a] text-[#E7EDF4] px-3 py-2 rounded-md"
          />

          {/* Reference */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Reference</label>
            <JoditEditor
              config={config}
              ref={editor}
              value={reference}
              onBlur={(content) => setReference(content)}
            />
          </div>

          {/* Materials */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Materials</label>
            <JoditEditor
              config={config}
              ref={editor}
              value={materials}
              onBlur={(content) => setMaterials(content)}
            />
          </div>

          {/* Theory */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Theory</label>
            <JoditEditor
              config={config}
              ref={editor}
              value={theory}
              onBlur={(content) => setTheory(content)}
            />
          </div>

          {/* Procedure */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Procedure</label>
            <JoditEditor
              config={config}
              ref={editor}
              value={procedure}
              onBlur={(content) => setProcedure(content)}
            />
          </div>

          {/* Observation */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Observation</label>
            <JoditEditor
              config={config}
              ref={editor}
              value={observation}
              onBlur={(content) => setObservation(content)}
            />
          </div>

          {/* Result */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Result</label>
            <JoditEditor
              config={config}
              ref={editor}
              value={result}
              onBlur={(content) => setResult(content)}
            />
          </div>

          {/* Chemical Reaction */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Chemical Reaction</label>
            <JoditEditor
              config={config}
              ref={editor}
              value={chemicalReaction}
              onBlur={(content) => setChemicalReaction(content)}
            />
          </div>

          {/* Calculations */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Calculations</label>
            <JoditEditor
              config={config}
              ref={editor}
              value={calculations}
              onBlur={(content) => setCalculations(content)}
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">YouTube Video ID</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g., dQw4w9WgXcQ"
              className="w-full bg-[#0D141C] border border-[#2a3a4a] text-[#E7EDF4] px-3 py-2 rounded-md"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6286A9] hover:bg-[#4a6b8a] text-[#E7EDF4] font-semibold py-3 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Experiment"}
          </button>
        </form>
      </div>
    </div>
  );
}
