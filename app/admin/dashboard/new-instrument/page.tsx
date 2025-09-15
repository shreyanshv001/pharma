"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Dynamically import JoditEditor to prevent SSR issues
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function AddInstrumentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
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

  const categoryOptions = [
    "PHARMACEUTIC",
    "PHARMACOGNOSY",
    "PHARMACOLOGY",
    "PHARMACEUTICAL_CHEMISTRY",
  ];

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    [newImages[index], newImages[targetIndex]] = [
      newImages[targetIndex],
      newImages[index],
    ];

    setImages(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // React Query mutation
  const createInstrumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/admin/add-instruments", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add instrument");
      return data;
    },
    onSuccess: () => {
      setSuccess("Instrument added successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin", "instruments"] });
      setTimeout(() => router.push("/admin/dashboard"), 1200);
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Error occurred");
    },
  });

  const isSubmitting = createInstrumentMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !category) {
      setError("Name and category are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("discription", discription);
    formData.append("principle", principle);
    formData.append("sop", sop);
    formData.append("ichGuideline", ichGuideline);
    formData.append("procedure", procedure);
    formData.append("advantages", advantages);
    formData.append("limitations", limitations);
    formData.append("specifications", specifications);
    formData.append("videoUrl", videoUrl);
    images.forEach((file) => formData.append("images", file));

    createInstrumentMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[#101A23] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-3xl bg-[#182634] rounded-lg p-6 sm:p-8 shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#E7EDF4] mb-6 text-center">
          Add New Instrument
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
            className="w-full bg-[#0D141C] border border-[#2a3a4a] text-[#E7EDF4] placeholder:text-[#6286A9] px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6286A9]"
          />

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full bg-[#0D141C] border border-[#2a3a4a] text-[#E7EDF4] px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6286A9]"
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

          <div>
              <label className="block text-[#E7EDF4] mb-1">Description</label>
              <JoditEditor
                ref={editor}
                config={config}
                value={discription}
                onBlur={(newContent: string) => setDiscription(newContent)}
              />
            </div>

            <div>
              <label className="block text-[#E7EDF4] mb-1">Principle</label>
              <JoditEditor
                ref={editor}
                config={config}
                value={principle}
                onBlur={(newContent: string) => setPrinciple(newContent)}
              />
            </div>

            <div>
              <label className="block text-[#E7EDF4] mb-1">SOP</label>
              <JoditEditor
                ref={editor}
                config={config}
                value={sop}
                onBlur={(newContent: string) => setSop(newContent)}
              />
            </div>

            <div>
              <label className="block text-[#E7EDF4] mb-1">ICH Guideline</label>
              <JoditEditor
                ref={editor}
                config={config}
                value={ichGuideline}
                onBlur={(newContent: string) => setIchGuideline(newContent)}
              />
            </div>

            <div>
              <label className="block text-[#E7EDF4] mb-1">Procedure</label>
              <JoditEditor
                ref={editor}
                config={config}
                value={procedure}
                onBlur={(newContent: string) => setProcedure(newContent)}
              />
            </div>

            <div>
              <label className="block text-[#E7EDF4] mb-1">Advantages</label>
              <JoditEditor
                ref={editor}
                config={config}
                value={advantages}
                onBlur={(newContent: string) => setAdvantages(newContent)}
              />
            </div>

            <div>
              <label className="block text-[#E7EDF4] mb-1">Limitations</label>
              <JoditEditor
                ref={editor}
                config={config}
                value={limitations}
                onBlur={(newContent: string) => setLimitations(newContent)}
              />
            </div>

            <div>
              <label className="block text-[#E7EDF4] mb-1">Specifications</label>
              <JoditEditor
                ref={editor}
                config={config}
                value={specifications}
                onBlur={(newContent: string) => setSpecifications(newContent)}
              />
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

          {/* Images */}
          <div>
            <label className="block text-[#E7EDF4] mb-1">Images (in order)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-[#E7EDF4]"
            />
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((file, index) => (
                  <div
                    key={index}
                    className="relative bg-[#0D141C] rounded-lg overflow-hidden shadow-md border border-[#2a3a4a]"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveImage(index, "up")}
                        disabled={index === 0}
                        className="bg-black/50 text-white text-xs px-2 py-1 rounded disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, "down")}
                        disabled={index === images.length - 1}
                        className="bg-black/50 text-white text-xs px-2 py-1 rounded disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="bg-red-600 text-white text-xs px-2 py-1 rounded"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-2 py-0.5 rounded">
                      {index + 1}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#6286A9] hover:bg-[#4a6b8a] text-[#E7EDF4] font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding..." : "Add Instrument"}
          </button>
        </form>
      </div>
    </div>
  );
}
