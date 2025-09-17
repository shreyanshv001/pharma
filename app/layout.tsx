import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import BottomNav from "@/components/bottom-nav";
import { ClerkProvider } from "@clerk/nextjs";
import ReactQueryProvider from "./providers/react-query-provider"; 

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PharmaLab",
  description: "App with sidebar",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} font-inter flex flex-col min-h-screen`}>
          {/* Wrap only here */}
          <ReactQueryProvider>
            <main className="flex-1 bg-[#101A23]">{children}</main>
            <BottomNav />
          </ReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
