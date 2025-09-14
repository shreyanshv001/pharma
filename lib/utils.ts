import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  let seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 0) seconds = 0;

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const key in intervals) {
    const interval = Math.floor(seconds / intervals[key]);
    if (interval >= 1) {
      return `${interval} ${key}${interval !== 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}