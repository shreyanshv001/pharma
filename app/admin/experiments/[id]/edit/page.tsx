"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function EditExperimentPage() {
  const router = useRouter();
  const { id } = useParams(); // experiment id from route
  const editor = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // fields
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

   function cleanHtml(content: string) {
    // Remove empty tags like <p><br></p>, whitespace, etc.
    const stripped = content.replace(/<p><br><\/p>/gi, "").trim();
    return stripped === "" ? "" : content;
  }

  // fetch existing experiment
  useEffect(() => {
    async function fetchExperiment() {
      try {
        const res = await fetch(`/api/admin/experiments/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load experiment");
        const data = await res.json();
        console.log("Fetched experiment:", data);

        setObject(data.object || "");
        setReference(data.reference || "");
        setMaterials(data.materials || "");
        setTheory(data.theory || "");
        setProcedure(data.procedure || "");
        setObservation(data.observation || "");
        setResult(data.result || "");
        setChemicalReaction(data.chemicalReaction || "");
        setCalculations(data.calculations || "");
        setVideoUrl(data.videoUrl || "");
      } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
            }
    }
    if (id) fetchExperiment();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("object", cleanHtml(object));
      formData.append("reference", cleanHtml(reference));
      formData.append("materials", cleanHtml(materials));
      formData.append("theory", cleanHtml(theory));
      formData.append("procedure", cleanHtml(procedure));
      formData.append("observation", cleanHtml(observation));
      formData.append("result", cleanHtml(result));
      formData.append("chemicalReaction", cleanHtml(chemicalReaction));
      formData.append("calculations", cleanHtml(calculations));
      formData.append("videoUrl", cleanHtml(videoUrl));

      const res = await fetch(`/api/admin/experiments/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update experiment");
      } else {
        setSuccess("Experiment updated successfully!");
        setTimeout(() => router.push(`/admin/experiments/${id}`), 1500);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101A23] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-3xl bg-[#182634] rounded-lg p-6 sm:p-8 shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#E7EDF4] mb-6 text-center">
          Edit Experiment
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
          <input
            type="text"
            placeholder="Experiment Object"
            value={object}
            onChange={(e) => setObject(e.target.value)}
            required
            className="w-full bg-[#0D141C] border border-[#2a3a4a] text-[#E7EDF4] px-3 py-2 rounded-md"
          />

          {/* Jodit editors with existing values */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Reference</label>
            <JoditEditor
              ref={editor}
              value={reference}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              onBlur={(content) => setReference(content)}
            />
          </div>

          <div>
            <label className="block text-[#E7EDF4] mb-1">Materials Required</label>
            <JoditEditor
              ref={editor}
              value={materials}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              onBlur={(content) => setMaterials(content)}
            />  
          </div>

            <div>
            <label className="block text-[#E7EDF4] mb-1">Theory</label>
            <JoditEditor
              ref={editor}
              value={theory}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              onBlur={(content) => setTheory(content)}
            />
          </div>

          <div>
            <label className="block text-[#E7EDF4] mb-1">Procedure</label>
            <JoditEditor
              ref={editor}
              value={procedure}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              onBlur={(content) => setProcedure(content)}
            />
          </div>

          <div>
            <label className="block text-[#E7EDF4] mb-1">Observation</label>
            <JoditEditor
              ref={editor}
              value={observation}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              onBlur={(content) => setObservation(content)}
            />
          </div>

          <div>
            <label className="block text-[#E7EDF4] mb-1">Chemical Reaction</label>
            <JoditEditor
              ref={editor}
              value={chemicalReaction}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              onBlur={(content) => setChemicalReaction(content)}
            />  
          </div>

          <div>
            <label className="block text-[#E7EDF4] mb-1">Result</label>
            <JoditEditor
              ref={editor}
              value={result}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              onBlur={(content) => setResult(content)}
            />
          </div>

          {/* Repeat same for  , result, calculations */}
          {/* Example: */}
          

          
          <div>
            <label className="block text-[#E7EDF4] mb-1">Calculations</label>
            <JoditEditor
              ref={editor}
              value={calculations}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              onBlur={(content) => setCalculations(content)}
            />
          </div>
          
          

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6286A9] hover:bg-[#4a6b8a] text-[#E7EDF4] font-semibold py-3 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Experiment"}
          </button>
        </form>
      </div>
    </div>
  );
}
