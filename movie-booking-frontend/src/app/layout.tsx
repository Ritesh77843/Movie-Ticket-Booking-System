// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NJRA CINEMA | Cinema Ticket Booking",
  description: "Book movie tickets online with real-time seat selection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0e0400] text-white relative min-h-screen overflow-x-hidden`}
      >
        {/* Fiery Background Domain */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Deep Crimson Base Glow (Pushed back) */}
          <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-red-800/10 blur-[180px] rounded-full mix-blend-screen" />
          
          {/* Burning Orange Core (Toned down) */}
          <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-amber-600/20 blur-[180px] rounded-full mix-blend-screen" />
          
          {/* Massive Yellow Highlight (Increased size and intensity) */}
          <div className="absolute top-[20%] right-[10%] w-[80vw] h-[80vw] bg-yellow-400/30 blur-[160px] rounded-full mix-blend-screen" />
          
          {/* Center Yellow Pop */}
          <div className="absolute top-[40%] left-[20%] w-[50vw] h-[50vw] bg-yellow-300/20 blur-[140px] rounded-full mix-blend-screen" />
        </div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          {/* Main sets the global background to transparent so the layout glows bleed through */}
          <main className="flex-1 bg-transparent">{children}</main>
        </div>
      </body>
    </html>
  );
}