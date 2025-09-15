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
    icon: "/favicon-32x32.png", // ✅ no /public
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
