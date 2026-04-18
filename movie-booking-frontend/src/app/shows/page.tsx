"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import MovieCard from "@/components/MovieCard";

const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Staggered entry
    },
  },
};

export default function ShowsPage() {
  const router = useRouter();
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    axios
      .get(`${API_URL}/api/movies`)
      .then((res) => {
        setShows(res.data);
      })
      .catch((err) => {
        console.error("MOVIE LIST ERROR:", err?.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-400 font-medium tracking-wide">Searching for Shows...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-blue-500/30">
      {/* Header */}
      <div className="bg-[#0d0d14] border-b border-white/5 p-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            🎥 Now Showing
          </h1>
          <p className="text-blue-400/80 mt-2 font-medium tracking-wide uppercase text-sm">Browse and catch your favorite movies</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 mt-4">
        {shows.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
            <p className="text-gray-400 text-lg">No wild movies appeared!</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariant}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10"
          >
            {shows.map((show) => (
              <MovieCard key={show._id} movie={show} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
