"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import dynamic from "next/dynamic";

// ✅ Dynamic import to avoid SSR issues
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

// Ask Question Component
function AskQuestionForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const editor = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  // React Query mutation for posting a question
  const mutation = useMutation({
    mutationFn: async (questionData: { title: string; description: string }) => {
      const response = await fetch("/api/qa/post-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post question");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      router.push("/qa");
    },
    onError: (error: Error) => {
      console.error("Error posting question:", error);
    },
  });

  // Jodit config
  const config = {
    readonly: false,
    height: 400,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError("");
    setDescriptionError("");

    let isValid = true;

    // Title validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("Title is required");
      isValid = false;
    } else if (trimmedTitle.length < 10) {
      setTitleError("Title must be at least 10 characters (excluding spaces)");
      isValid = false;
    } else if (trimmedTitle.replace(/\s+/g, '').length < 10) {
      setTitleError("Title must contain at least 10 non-space characters");
      isValid = false;
    }

    // Description validation
    const plainText = description.replace(/<[^>]*>?/gm, "").trim();
    const plainTextNoSpaces = plainText.replace(/\s+/g, '');
    
    if (!plainText) {
      setDescriptionError("Description is required");
      isValid = false;
    } else if (plainTextNoSpaces.length < 10) {
      setDescriptionError("Description must contain at least 10 non-space characters");
      isValid = false;
    }

    if (isValid) {
      mutation.mutate({ 
        title: trimmedTitle, 
        description 
      });
    }
  };

  return (
    <div className="p-6 bg-[#101A23] min-h-screen pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center relative mb-8">
          <button
            onClick={() => router.push("/qa")}
            className="absolute left-0 flex items-center justify-center p-2 hover:bg-[#1E293B] rounded-full transition-colors"
            aria-label="Go back"
          >
            <i className="ri-arrow-left-line text-white text-xl"></i>
          </button>
          <h1 className="text-2xl font-bold text-white w-full text-center">
            Ask a Question
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-md font-medium text-gray-300 mb-3">
              Question Title
            </label>
            <Input
              id="title"
              placeholder="What's your question? Be specific."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`bg-[#1E293B] text-white ${
                titleError ? "border-red-500" : "border-gray-700"
              }`}
            />
            {titleError && <p className="mt-1 text-sm text-red-500">{titleError}</p>}
          </div>

          {/* Description with Jodit */}
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

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-12">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/qa")}
              className="border-gray-600 text-gray-700  hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-[#6286A9]"
            >
              {mutation.isPending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Posting...
                </div>
              ) : (
                "Post Your Question"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main page with authentication
export default function AskQuestion() {
  return (
    <>
      <SignedIn>
        <AskQuestionForm />
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn redirectUrl="/qa/ask" />
      </SignedOut>
    </>
  );
}
