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

  // Jodit config with pharmaceutical theme
  const config = {
    readonly: false,
    height: 400,
    placeholder: "Describe your question about pharmaceutical procedures, experiments, or instruments...",
    theme: "dark",
    buttons: [
      'bold', 
      'italic', 
      'underline', 
      'ul', 
      'ol',
      'paragraph',
      'align',
      'hr',
      'link',
      'image',
      'table',
      'undo', 
      'redo'
    ],
    buttonsMD: [
      'bold', 
      'italic', 
      'underline', 
      'ul', 
      'ol',
      'paragraph',
      'align',
      'hr',
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
      'paragraph',
      'align',
      'hr',
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
      'paragraph',
      'align',
      'hr',
      'link',
      'image',
      'table',
      'undo', 
      'redo'
    ],
    style: {
      background: 'rgb(30, 41, 59)',  // slate-800 to match theme
      color: '#E2E8F0'                // slate-200 for better readability
    },
    uploader: {
      insertImageAsBase64URI: true
    },
    toolbarAdaptive: false,
    toolbarSticky: true,
    allowResizeX: false,
    allowResizeY: true,
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
    <div className="min-h-screen bg-gradient-to-br lg:pt-20 from-slate-950 via-slate-900 to-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
      
      <div className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-32">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push("/qa")}
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-300 hover:scale-105 group"
            >
              <i className="ri-arrow-left-line  text-lg group-hover:-translate-x-1 transition-transform duration-300"></i>
              <span className="hidden lg:inline-block"> 
              Back to Q&A

              </span>
            </button>
            
            <div className="text-center flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
                Ask a Question
              </h1>
              <p className="text-slate-400 hidden lg:block mt-2 text-sm">
                Get help from the pharmaceutical community
              </p>
            </div>
            
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>

          {/* Form Container */}
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/30 shadow-2xl overflow-hidden">
            <div className="p-5 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Title Section */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                      <i className="ri-edit-line text-sm text-blue-400"></i>
                    </div>
                    <label htmlFor="title" className="text-lg font-semibold text-white">
                      Question Title
                    </label>
                  </div>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    Be specific about your pharmaceutical question. Include details about experiments, instruments, or procedures.
                  </p>
                  <Input
                    id="title"
                    placeholder="e.g., How to calibrate a UV-Vis spectrophotometer for pharmaceutical analysis?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`bg-slate-700/60 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/25 transition-all duration-300 py-3 text-base ${
                      titleError ? "border-red-500/70 focus:border-red-500/70 focus:ring-red-500/25" : ""
                    }`}
                  />
                  {titleError && (
                    <div className="flex items-center gap-2 mt-2">
                      <i className="ri-error-warning-line text-red-400"></i>
                      <p className="text-sm text-red-400">{titleError}</p>
                    </div>
                  )}
                </div>

                {/* Description Section */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                      <i className="ri-file-text-line text-sm text-blue-400"></i>
                    </div>
                    <label htmlFor="description" className="text-lg font-semibold text-white">
                      Detailed Description
                    </label>
                  </div>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    Provide comprehensive details about your question. Include context, what you&apos;ve tried, and specific areas where you need help.
                  </p>
                  
                  {/* Editor Container */}
                  <div className="bg-slate-700/40 rounded-xl border border-slate-600/30 overflow-hidden shadow-inner">
                    <div className="jodit-editor-wrapper">
                      <JoditEditor
                        ref={editor}
                        value={description}
                        config={config}
                        onBlur={(newContent) => setDescription(newContent)}
                      />
                    </div>
                  </div>
                  
                  {descriptionError && (
                    <div className="flex items-center gap-2 mt-3">
                      <i className="ri-error-warning-line text-red-400"></i>
                      <p className="text-sm text-red-400">{descriptionError}</p>
                    </div>
                  )}
                </div>

                {/* Guidelines Section */}
                <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                      <i className="ri-lightbulb-line text-sm text-yellow-400"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Tips for Better Questions</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-green-400 mt-0.5 flex-shrink-0"></i>
                      <span>Be specific about pharmaceutical instruments, procedures, or experiments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-green-400 mt-0.5 flex-shrink-0"></i>
                      <span>Include what you&apos;ve already tried or researched</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-green-400 mt-0.5 flex-shrink-0"></i>
                      <span>Provide context about your educational level or experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-green-400 mt-0.5 flex-shrink-0"></i>
                      <span>Use proper formatting and clear language</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-slate-700/30">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/qa")}
                    className="border-slate-600/50 hover:text-white text-[#060E21] hover:bg-slate-700/60 hover:border-slate-500/50 transition-all duration-300 px-6 py-3"
                  >
                    <i className="ri-close-line mr-2"></i>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white px-8 py-3 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {mutation.isPending ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        Posting Question...
                      </div>
                    ) : (
                      <>
                        <i className="ri-send-plane-line mr-2"></i>
                        Post Your Question
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Error Display */}
          {mutation.isError && (
            <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <i className="ri-error-warning-line text-red-400 text-lg"></i>
                <div>
                  <h4 className="font-semibold text-red-400">Error Posting Question</h4>
                  <p className="text-sm text-red-300 mt-1">
                    {mutation.error?.message || "Something went wrong. Please try again."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .jodit-editor-wrapper .jodit-container {
          border: none !important;
          background: rgb(51, 65, 85) !important;
        }
        .jodit-editor-wrapper .jodit-toolbar {
          background: rgb(30, 41, 59) !important;
          border-bottom: 1px solid rgb(71, 85, 105) !important;
        }
        .jodit-editor-wrapper .jodit-workplace {
          background: rgb(51, 65, 85) !important;
        }
        .jodit-editor-wrapper .jodit-wysiwyg {
          background: rgb(51, 65, 85) !important;
          color: rgb(226, 232, 240) !important;
          min-height: 300px !important;
        }
        .jodit-editor-wrapper .jodit-toolbar-button {
          color: rgb(148, 163, 184) !important;
        }
        .jodit-editor-wrapper .jodit-toolbar-button:hover {
          background: rgb(71, 85, 105) !important;
          color: rgb(226, 232, 240) !important;
        }
        .jodit-editor-wrapper .jodit-toolbar-button.jodit-toolbar-button_active {
          background: rgb(59, 130, 246) !important;
          color: white !important;
        }
      `}</style>
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
