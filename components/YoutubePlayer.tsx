"use client";

import YouTube from "react-youtube";

interface YouTubePlayerProps {
  url: string;
  width?: string;
  height?: string;
  autoplay?: 0 | 1;
  controls?: boolean;
}

function getYouTubeVideoId(url: string): string | null {
  const regExp =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export default function YouTubePlayer({
  url,
  width = "100%",
  height = "100%",
  autoplay = 0,
}: YouTubePlayerProps) {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return <div>Invalid YouTube URL</div>;
  }

  return (
    <YouTube
      videoId={videoId}
      opts={{
        width,
        height,
        playerVars: {
          autoplay, // 0 = off, 1 = auto
          controls: 1, // show controls
        },
      }}
    />
  );
}
