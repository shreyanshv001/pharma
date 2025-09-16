"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function EditInstrumentPage() {
  const router = useRouter();
  const { id } = useParams(); // instrument id from route
  const queryClient = useQueryClient();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // fields
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

  // fetch instrument
  useEffect(() => {
    async function fetchInstrument() {
      try {
        const res = await fetch(`/api/admin/instruments/${id}`, {
          credentials: "include",
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
        setExistingImages(data.images || []); // array of URLs
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error occurred");
      }
    }
    if (id) fetchInstrument();
  }, [id]);

  // image handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const removeExistingImage = (index: number) => {
    const newImgs = [...existingImages];
    newImgs.splice(index, 1);
    setExistingImages(newImgs);
  };

  const removeNewImage = (index: number) => {
    const newImgs = [...images];
    newImgs.splice(index, 1);
    setImages(newImgs);
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
      console.log(data);
      return data;
    },
    onSuccess: () => {
      setSuccess("Instrument updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin", "instruments"] });
      setTimeout(() => router.push(`/admin/dashboard/instrument/${id}`), 1200);
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
    formData.append("existingImages", JSON.stringify(existingImages)); // keep
    images.forEach((file) => formData.append("newImages", file)); // add

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
            <option value="" disabled>Select Category</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {/* Editors */}
          {([
            ["Description", discription, setDiscription],
            ["Principle", principle, setPrinciple],
            ["SOP", sop, setSop],
            ["ICH Guideline", ichGuideline, setIchGuideline],
            ["Procedure", procedure, setProcedure],
            ["Advantages", advantages, setAdvantages],
            ["Limitations", limitations, setLimitations],
            ["Specifications", specifications, setSpecifications],
          ] as [string, string, React.Dispatch<React.SetStateAction<string>>][]).map(([label, val, setVal]) => (
            <div key={label}>
              <label className="block text-[#E7EDF4] mb-1">{label}</label>
              <JoditEditor
                ref={editor}
                config={{ uploader: { insertImageAsBase64URI: true } }}
                value={val}
                onBlur={setVal}
              />
            </div>
          ))}

          {/* Video */}
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="YouTube Video ID"
            className="w-full bg-[#0D141C] border border-[#2a3a4a] text-[#E7EDF4] px-3 py-2 rounded-md"
          />

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {existingImages.map((url, index) => (
                <div key={index} className="relative bg-[#0D141C] rounded-lg overflow-hidden border border-[#2a3a4a]">
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
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((file, index) => (
                <div key={index} className="relative bg-[#0D141C] rounded-lg overflow-hidden border border-[#2a3a4a]">
                  <img src={URL.createObjectURL(file)} className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
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
