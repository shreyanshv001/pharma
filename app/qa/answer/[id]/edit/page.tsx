"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import JoditEditor from "jodit-react";

function EditAnswerForm({ id }: { id: string }) {
  const router = useRouter();
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  // Fetch answer data
  const { data: answer, isLoading } = useQuery({
    queryKey: ["answer", id],
    queryFn: async () => {
      const res = await fetch(`/api/user/answer/${id}`);
      if (!res.ok) throw new Error("Failed to fetch answer");
      return res.json();
    },
  });

  // Set initial values when data is loaded
  useEffect(() => {
    if (answer) {
      setContent(answer.description);
    }
  }, [answer]);

  // Update mutation
  const mutation = useMutation({
    mutationFn: async (description: string) => {
      const res = await fetch(`/api/user/answer/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) throw new Error("Failed to update answer");
      return res.json();
    },
    onSuccess: () => {
      router.push(`/qa/${answer.question.id}`);
    },
  });

  // Jodit config
  const config = {
    readonly: false,
    height: 400,
    theme: "dark",
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'link', 'source', '|',
      'undo', 'redo', '|',
      'fullsize'
    ],
    uploader: {
      insertImageAsBase64URI: true
    },
    removeButtons: ['file', 'image'],
    showXPathInStatusbar: false,
    showCharsCounter: false,
    showWordsCounter: false,
    toolbarAdaptive: false,
    style: {
      background: '#1E293B',
      color: '#E5E7EB',
    },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const plainText = content.replace(/<[^>]*>?/gm, "").trim();
    if (!plainText) {
      setError("Answer content is required");
      return;
    }

    if (plainText.length < 20) {
      setError("Answer must be at least 20 characters long");
      return;
    }

    mutation.mutate(content);
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
        {/* Header */}
        <div className="flex items-center relative mb-8">
          <button
            onClick={() => router.back()}
            className="absolute left-0 flex items-center justify-center p-2 hover:bg-[#1E293B] rounded-full transition-colors"
            aria-label="Go back"
          >
            <i className="ri-arrow-left-line text-white text-xl"></i>
          </button>
          <h1 className="text-2xl font-bold text-white w-full text-center">
            Edit Answer
          </h1>
        </div>

        {/* Question Title Display */}
        {answer?.question && (
          <div className="mb-6 p-4 bg-[#182634] rounded-lg">
            <h2 className="text-[#9CA3AF] text-sm mb-2">Question:</h2>
            <p className="text-[#E7EDF4] text-lg">{answer.question.title}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Editor */}
          <div>
            <label className="block text-md font-medium text-gray-300 mb-3">
              Your Answer
            </label>
            <div className="editor-container bg-[#1E293B] rounded-md">
              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                onBlur={(newContent) => setContent(newContent)}
              />
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-600 text-gray-400 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-[#6286A9] hover:bg-[#4a6b8a]"
            >
              {mutation.isPending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Updating...
                </div>
              ) : (
                "Update Answer"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditAnswerPage({ params }: { params: { id: string } }) {
  return (
    <>
      <SignedIn>
        <EditAnswerForm id={params.id} />
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}