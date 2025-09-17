"use client";
import UserAnswers from "@/components/UserAnswers";
import UserComments from "@/components/UserComments";
import UserQuestion from "@/components/UserQuestion";
import {
  SignedIn,
  SignedOut,
  useUser,
  useClerk,
} from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

// Add type for valid tabs
type ProfileTab = "questions" | "answers" | "comments";

// Helper to format date as dd/mm/yyyy
const formatDate = (input: Date | string | number) => {
  const d = new Date(input);
  if (isNaN(d.getTime())) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function ProfilePage() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  // Use React Query for tab state
  const { data: activeTab = "questions" } = useQuery<ProfileTab>({
    queryKey: ["profileTab"],
    initialData: "questions",
    staleTime: Infinity,
  });

  // Helper function to validate tab value
  const isValidTab = (tab: string): tab is ProfileTab => {
    return ["questions", "answers", "comments"].includes(tab);
  };

  // Update tab handler with type guard
  const handleTabChange = (tab: string) => {
    if (isValidTab(tab)) {
      queryClient.setQueryData(["profileTab"], tab);
    }
  };

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-br lg:pt-20 from-slate-950 via-slate-900 to-slate-950">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
          
          <div className="relative">
            {/* Header Section */}
            <div className="bg-slate-800/60 border-b border-slate-700/30 shadow-xl relative">
              {/* Three Dots Menu */}
              {isSignedIn && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700/50"
                  >
                    <i className="ri-more-2-fill text-xl" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 min-w-[140px] z-10">
                      <Link
                        href="/about-us"
                        className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                        onClick={() => setMenuOpen(false)}
                      >
                        About Us
                      </Link>
                      <Link
                        href="/contact-us"
                        className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                        onClick={() => setMenuOpen(false)}
                      >
                        Contact Us
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                  {/* Profile Image */}
                  <div className="relative flex-shrink-0">
                    <div className="relative">
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt="Profile"
                          className="w-32 h-32 lg:w-36 lg:h-36 rounded-full border-4 border-slate-600 shadow-2xl object-cover"
                        />
                      ) : (
                        <div className="w-32 h-32 lg:w-36 lg:h-36 rounded-full border-4 border-slate-600 shadow-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold text-4xl lg:text-5xl">
                          {user?.firstName?.[0] || user?.username?.[0] || user?.id?.[0] || "U"}
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-slate-800 rounded-full shadow-lg"></div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-3 tracking-tight">
                      {user?.fullName || user?.username || "User"}
                    </h1>
                    
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-400 mb-6">
                      <i className="ri-mail-line text-blue-400"></i>
                      <span className="text-lg">
                        {user?.primaryEmailAddress?.emailAddress}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                      <div className="flex gap-4">
                        <div className="bg-slate-700/40 border border-slate-600/30 px-4 py-4 rounded-xl shadow-lg">
                          <div className="flex items-center gap-3">
                            <i className="ri-calendar-line text-green-400"></i>
                            <div>
                              <div className="text-sm text-slate-400">Member since</div>
                              <div className="text-white font-semibold">
                                {user?.createdAt ? formatDate(user.createdAt) : "-"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-700/40 border border-slate-600/30 px-4 py-4 rounded-xl shadow-lg">
                          <div className="flex items-center gap-3">
                            <i className="ri-time-line text-blue-400"></i>
                            <div>
                              <div className="text-sm text-slate-400">Last active</div>
                              <div className="text-white font-semibold">
                                {user?.lastSignInAt ? formatDate(user.lastSignInAt) : "-"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-4 rounded-xl hover:bg-red-500/20 transition-all duration-300"
                      >
                        <i className="ri-logout-box-line"></i>
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
              <div className="mb-8">
                <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-2 shadow-xl">
                  <div className="flex flex-col sm:flex-row">
                    {(["questions", "answers", "comments"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-sm font-medium rounded-xl transition-all duration-300 ${
                          activeTab === tab
                            ? "bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg"
                            : "text-slate-400 hover:text-white hover:bg-slate-700/40"
                        }`}
                      >
                        <i className={`text-lg ${
                          tab === "questions" ? "ri-question-answer-line" :
                          tab === "answers" ? "ri-chat-3-line" :
                          "ri-message-2-line"
                        } ${activeTab === tab ? "text-blue-400" : ""}`}></i>
                        <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6">
                  {activeTab === "questions" && <UserQuestion />}
                  {activeTab === "answers" && <UserAnswers />}
                  {activeTab === "comments" && <UserComments />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
      
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
          
          <div className="relative min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-lg mx-auto">
              
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/60 rounded-full mb-8 border border-slate-700/30 shadow-2xl">
                <i className="ri-user-line text-3xl text-blue-400"></i>
              </div>

              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-6">
                Profile
              </h1>

              <p className="text-slate-400 mb-12">
                Sign in to access your dashboard
              </p>

              <div className="flex gap-4 justify-center mb-12">
                <Link href="/sign-in" className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                  Sign In
                </Link>

                <Link href="/sign-up" className="bg-slate-800/40 hover:bg-slate-700/60 text-white px-6 py-3 rounded-xl font-semibold border border-slate-600/50 transition-all duration-300 hover:scale-105">
                  Sign Up
                </Link>
              </div>

              <div className="bg-slate-800/40 border block lg:hidden border-slate-700/30 rounded-xl p-6 shadow-xl">
                <div className="flex justify-center gap-6">
                  <Link href="/about-us" className="text-slate-400 hover:text-blue-400 transition-colors">
                    About Us
                  </Link>
                  <Link href="/contact-us" className="text-slate-400 hover:text-blue-400 transition-colors">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
