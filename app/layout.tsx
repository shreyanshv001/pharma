import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import BottomNav from "@/components/bottom-nav";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "My App",
  description: "App with sidebar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-inter flex flex-col min-h-screen`}>
        {/* Page Content */}
        <main className="flex-1 bg-gray-100">{children}</main>

        {/* Bottom Navigation - Will be conditionally hidden by CSS */}
        <BottomNav />
      </body>
    </html>
  );
}