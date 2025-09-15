"use client";
import UserAnswers from "@/components/UserAnswers";
import UserComments from "@/components/UserComments";
import UserQuestion from "@/components/UserQuestion";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useUser,
  useClerk,
} from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const { user } = useUser();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();

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
            <div className="bg-slate-800/60 border-b border-slate-700/30 shadow-xl">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                  {/* Profile Image Section */}
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
                      {/* Online Status Indicator */}
                      <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-slate-800 rounded-full shadow-lg"></div>
                    </div>
                  </div>

                  {/* User Info Section */}
                  <div className="flex-1 text-center lg:text-left">
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-3 tracking-tight">
                      {user?.fullName ||
                        (user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user?.username || "User")}
                    </h1>
                    
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-400 mb-6">
                      <i className="ri-mail-line text-blue-400"></i>
                      <span className="text-lg">
                        {user?.primaryEmailAddress?.emailAddress}
                      </span>
                    </div>

                    {/* Stats Cards */}
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                      <div className="flex gap-4">

                        <div className="bg-slate-700/40 border border-slate-600/30 px-2 lg:px-6 py-4 rounded-xl shadow-lg hover:bg-slate-700/60 transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                              <i className="ri-calendar-line text-green-400"></i>
                            </div>
                            <div>
                              <div className="text-sm text-slate-400 font-medium ">Member since</div>
                              <div className="text-white font-semibold">
                                {user?.createdAt ? formatDate(user.createdAt) : "-"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-700/40 border border-slate-600/30 px-4 lg:px-6 py-4 rounded-xl shadow-lg hover:bg-slate-700/60 transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                              <i className="ri-time-line text-blue-400"></i>
                            </div>
                            <div>
                              <div className="text-sm text-slate-400 font-medium">Last active</div>
                              <div className="text-white font-semibold">
                                {user?.lastSignInAt ? formatDate(user.lastSignInAt) : "-"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => signOut()}
                        className="group flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-red-600/20 to-red-700/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <i className="ri-logout-box-line"></i>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">Sign Out</div>
                          <div className="text-xs opacity-75">End session</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
              {/* Enhanced Tabs */}
              <div className="mb-12">
                <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-2 shadow-xl">
                  <div className="flex flex-col sm:flex-row">
                    {(["questions", "answers", "comments"] as const).map((tab, index) => (
                      <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-sm font-medium rounded-xl transition-all duration-300 ${
                          activeTab === tab
                            ? "bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg scale-105"
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

                {/* Tab Description */}
                <div className="text-center mt-6">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {activeTab === "questions" && "Questions you've asked in the pharmaceutical community"}
                    {activeTab === "answers" && "Your contributions and expertise shared with others"}
                    {activeTab === "comments" && "Your interactions and discussions on various topics"}
                  </p>
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[500px]">
                {activeTab === "questions" && (
                  <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 lg:p-8 border-b border-slate-700/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                          <i className="ri-question-answer-line text-blue-400"></i>
                        </div>
                        <h2 className="text-xl font-semibold text-white">Your Questions</h2>
                      </div>
                    </div>
                    <div className="p-6 lg:p-8">
                      <UserQuestion />
                    </div>
                  </div>
                )}

                {activeTab === "answers" && (
                  <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 lg:p-8 border-b border-slate-700/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                          <i className="ri-chat-3-line text-blue-400"></i>
                        </div>
                        <h2 className="text-xl font-semibold text-white">Your Answers</h2>
                      </div>
                    </div>
                    <div className="p-6 lg:p-8">
                      <UserAnswers />
                    </div>
                  </div>
                )}

                {activeTab === "comments" && (
                  <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 lg:p-8 border-b border-slate-700/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                          <i className="ri-message-2-line text-blue-400"></i>
                        </div>
                        <h2 className="text-xl font-semibold text-white">Your Comments</h2>
                      </div>
                    </div>
                    <div className="p-6 lg:p-8">
                      <UserComments />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn redirectUrl="/profile" />
      </SignedOut>
    </>
  );
}
