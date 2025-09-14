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
import { useState } from "react";

// Add type for valid tabs
type ProfileTab = "questions" | "answers" | "comments";

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  // Use React Query for tab state
  const { data: activeTab = "questions" } = useQuery<ProfileTab>({
    queryKey: ['profileTab'],
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
      queryClient.setQueryData(['profileTab'], tab);
    }
  };

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await user.setProfileImage({ file });
    } catch (err) {
      console.error("Image update failed", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <SignedIn>
      <div className="min-h-screen bg-[#101A23] text-white">
        {/* Header Section */}
        <div className="bg-[#182634] py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Image Section */}
              <div className="relative group">
                <img 
                  src={user?.imageUrl} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full border-4 border-[#2A3744] shadow-lg"
                />
                <label className="absolute bottom-0 right-0 bg-[#6286A9] p-2 rounded-full cursor-pointer hover:bg-[#4A6B8A] transition">
                  <i className="ri-camera-line text-white"></i>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-t-white border-white/30 rounded-full"></div>
                  </div>
                )}
              </div>

              {/* User Info Section */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{user?.fullName}</h1>
                <div className="text-[#9CA3AF] mb-4">{user?.primaryEmailAddress?.emailAddress}</div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="bg-[#223243] px-4 py-2 rounded-lg">
                    <div className="text-sm text-[#9CA3AF]">Member since</div>
                    <div className="font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                    </div>
                  </div>
                  <div className="bg-[#223243] px-4 py-2 rounded-lg">
                    <div className="text-sm text-[#9CA3AF]">Last active</div>
                    <div className="font-medium">
                      {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : "-"}
                    </div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500/20 transition"
                  >
                    <i className="ri-logout-box-line"></i>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Updated Tabs */}
          <div className="flex justify-center mb-8">
            {(["questions", "answers", "comments"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 
                  ${activeTab === tab 
                    ? "text-[#6286A9] border-[#6286A9]" 
                    : "text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-700"}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Updated Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "questions" && <UserQuestion />}
            {activeTab === "answers" && <UserAnswers />}
            {activeTab === "comments" && <UserComments />}
          </div>
        </div>
      </div>
    </SignedIn>
  );
}
