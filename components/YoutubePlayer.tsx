"use client";

import YouTube from "react-youtube";

interface YouTubePlayerProps {
  url: string;
}

// Helper function to extract video ID from a YouTube URL
function getYouTubeVideoId(url: string): string | null {
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export default function YouTubePlayer({ url }: YouTubePlayerProps) {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return <div>Invalid YouTube URL</div>;
  }

  return (
    <YouTube
      videoId={videoId}
      opts={{
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 0 },
      }}
    />
  );
  
}
