"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function EditInstrumentPage() {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [discription, setDiscription] = useState("");
  const [principle, setPrinciple] = useState("");
  const [sop, setSop] = useState("");
  const [ichGuideline, setIchGuideline] = useState("");
  const [procedure, setProcedure] = useState("");
  const [advantages, setAdvantages] = useState("");
  const [limitations, setLimitations] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  function cleanHtml(content: string) {
    const stripped = content.replace(/<p><br><\/p>/gi, "").trim();
    return stripped === "" ? "" : content;
  }

  const categoryOptions = [
    "PHARMACEUTIC",
    "PHARMACOGNOSY",
    "PHARMACOLOGY",
    "PHARMACEUTICAL_CHEMISTRY",
  ];

  const editor = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchInstrument() {
      try {
        const res = await fetch(`/api/admin/instruments/${id}`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load instrument");
        const data = await res.json();

        setName(data.name || "");
        setCategory(data.category || "");
        setDiscription(data.discription || "");
        setPrinciple(data.principle || "");
        setSop(data.sop || "");
        setIchGuideline(data.ichGuideline || "");
        setProcedure(data.procedure || "");
        setAdvantages(data.advantages || "");
        setLimitations(data.limitations || "");
        setSpecifications(data.specifications || "");
        setVideoUrl(data.videoUrl || "");
        setExistingImages(data.images || []);
      } catch (err: unknown) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setError(err instanceof Error ? err.message : "Error occurred");
        }
      }
    }
    if (id) fetchInstrument();
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const editInstrumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`/api/admin/instruments/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update instrument");
      return data;
    },
    onSuccess: () => {
      setSuccess("Instrument updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin", "instruments"] });
      router.replace(`/admin/dashboard/instrument/${id}`);
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Error occurred");
    },
  });

  const isSubmitting = editInstrumentMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !category) {
      setError("Name and category are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", cleanHtml(name));
    formData.append("category", cleanHtml(category));
    formData.append("discription", cleanHtml(discription));
    formData.append("principle", cleanHtml(principle));
    formData.append("sop", cleanHtml(sop));
    formData.append("ichGuideline", cleanHtml(ichGuideline));
    formData.append("procedure", cleanHtml(procedure));
    formData.append("advantages", cleanHtml(advantages));
    formData.append("limitations", cleanHtml(limitations));
    formData.append("specifications", cleanHtml(specifications));
    formData.append("videoUrl", cleanHtml(videoUrl));
    formData.append("existingImages", JSON.stringify(existingImages));
    images.forEach((file) => formData.append("newImages", file));

    editInstrumentMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[#101A23] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-3xl bg-[#182634] rounded-lg p-6 sm:p-8 shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#E7EDF4] mb-6 text-center">
          Edit Instrument
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-[#0D141C] border border-[#2a3a4a] text-[#E7EDF4] px-3 py-2 rounded-md"
          />

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full bg-[#0D141C] border border-[#2a3a4a] text-[#E7EDF4] px-3 py-2 rounded-md"
          >
            <option value="" disabled>
              Select Category
            </option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {/* Description */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Description</label>
            <JoditEditor
              ref={editor}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              value={discription}
              onBlur={(newContent) => setDiscription(newContent)}
            />
          </div>

          {/* Principle */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Principle</label>
            <JoditEditor
              ref={editor}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              value={principle}
              onBlur={(newContent) => setPrinciple(newContent)}
            />
          </div>

          {/* SOP */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">SOP</label>
            <JoditEditor
              ref={editor}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              value={sop}
              onBlur={(newContent) => setSop(newContent)}
            />
          </div>

          {/* ICH Guideline */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">ICH Guideline</label>
            <JoditEditor
              ref={editor}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              value={ichGuideline}
              onBlur={(newContent) => setIchGuideline(newContent)}
            />
          </div>

          {/* Procedure */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Procedure</label>
            <JoditEditor
              ref={editor}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              value={procedure}
              onBlur={(newContent) => setProcedure(newContent)}
            />
          </div>

          {/* Advantages */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Advantages</label>
            <JoditEditor
              ref={editor}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              value={advantages}
              onBlur={(newContent) => setAdvantages(newContent)}
            />
          </div>

          {/* Limitations */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Limitations</label>
            <JoditEditor
              ref={editor}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              value={limitations}
              onBlur={(newContent) => setLimitations(newContent)}
            />
          </div>

          {/* Specifications */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Specifications</label>
            <JoditEditor
              ref={editor}
              config={{ uploader: { insertImageAsBase64URI: true } }}
              value={specifications}
              onBlur={(newContent) => setSpecifications(newContent)}
            />
          </div>

          {/* Video */}
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="YouTube Video URL"
            className="w-full bg-[#0D141C] border border-[#2a3a4a] text-[#E7EDF4] px-3 py-2 rounded-md"
          />

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {existingImages.map((url, index) => (
                <div
                  key={index}
                  className="relative bg-[#0D141C] rounded-lg overflow-hidden border border-[#2a3a4a]"
                >
                  <img src={url} className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New Images */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  setImages((prev) => [...prev, ...Array.from(files)]);
                }
            }}
          />
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((file, index) => {
                const url = URL.createObjectURL(file);
                return (
                  <div
                    key={index}
                    className="relative bg-[#0D141C] rounded-lg overflow-hidden border border-[#2a3a4a]"
                  >
                    <img src={url} className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#6286A9] hover:bg-[#4a6b8a] text-[#E7EDF4] py-3 px-4 rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update Instrument"}
          </button>
        </form>
      </div>
    </div>
  );
}
