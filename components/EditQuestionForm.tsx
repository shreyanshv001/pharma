"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import JoditEditor from "jodit-react";

export function EditQuestionForm({ id }: { id: string }) {
  const router = useRouter();
  const editor = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const { data: question, isLoading } = useQuery({
    queryKey: ["question", id],
    queryFn: async () => {
      const res = await fetch(`/api/qa/question/${id}`);
      if (!res.ok) throw new Error("Failed to fetch question");
      return res.json();
    },
  });

  useEffect(() => {
    if (question) {
      setTitle(question.title);
      setDescription(question.description);
    }
  }, [question]);

  const mutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const res = await fetch(`/api/user/question/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update question");
      return res.json();
    },
    onSuccess: () => {
      router.push(`/qa/${id}`);
    },
  });

  const config = {
    readonly: false,
    height: 400,
    theme: "dark",
  } as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError("");
    setDescriptionError("");

    let isValid = true;

    if (!title.trim()) {
      setTitleError("Title is required");
      isValid = false;
    } else if (title.trim().length < 10) {
      setTitleError("Title must be at least 10 characters");
      isValid = false;
    }

    const plainText = description.replace(/<[^>]*>?/gm, "").trim();
    if (!plainText) {
      setDescriptionError("Description is required");
      isValid = false;
    } else if (plainText.length < 20) {
      setDescriptionError("Description must be at least 20 characters");
      isValid = false;
    }

    if (isValid) {
      mutation.mutate({ title, description });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#101A23] p-4 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-[#6286A9] border-[#1E293B] rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#101A23] min-h-screen pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center relative mb-8">
          <button
            onClick={() => router.back()}
            className="absolute left-0 flex items-center justify-center p-2 hover:bg-[#1E293B] rounded-full transition-colors"
            aria-label="Go back"
          >
            <i className="ri-arrow-left-line text-white text-xl"></i>
          </button>
          <h1 className="text-2xl font-bold text-white w-full text-center">
            Edit Question
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-md font-medium text-gray-300 mb-3">
              Question Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`bg-[#1E293B] text-white ${titleError ? "border-red-500" : "border-gray-700"}`}
            />
            {titleError && <p className="mt-1 text-sm text-red-500">{titleError}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-md font-medium text-gray-300 mb-3">
              Description
            </label>
            <div className="editor-container bg-[#1E293B] rounded-md text-black">
              <JoditEditor
                ref={editor}
                value={description}
                config={config}
                onBlur={(newContent) => setDescription(newContent)}
              />
            </div>
            {descriptionError && <p className="mt-1 text-sm text-red-500">{descriptionError}</p>}
          </div>

          <div className="flex justify-end gap-4 mt-12">
            <Button type="button" variant="outline" onClick={() => router.back()} className="border-gray-600 text-gray-700 hover:bg-gray-800">
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-[#6286A9]">
              {mutation.isPending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Updating...
                </div>
              ) : (
                "Update Question"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}