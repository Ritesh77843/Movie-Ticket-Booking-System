"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import MovieCard from "@/components/MovieCard";

const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function SearchPageInner() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    axios.get(`${API_URL}/api/shows`)
      .then(res => {
        const allShows = res.data;
        // Filter by movie title (case insensitive)
        const filtered = allShows.filter((show: any) => 
          show.movie?.title?.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      })
      .catch(err => console.error("Search fetch error:", err))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen bg-transparent text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            Search Results for <span className="text-blue-400">"{query}"</span>
          </h1>
          <p className="text-zinc-500 uppercase tracking-widest text-xs font-bold">
            Found {results.length} movie{results.length !== 1 ? "s" : ""}
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
             <p className="text-zinc-500 font-medium">Scanning the database...</p>
          </div>
        ) : results.length > 0 ? (
          <motion.div 
            variants={containerVariant}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            {results.map((show) => (
              <MovieCard key={show._id} movie={show} />
            ))}
          </motion.div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-20 text-center">
            <span className="text-5xl mb-4 block">🔍</span>
            <h2 className="text-xl font-bold text-white mb-2">No movies found</h2>
            <p className="text-zinc-500">Try searching with a different keyword like "Avengers" or "Batman".</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-transparent flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
       </div>
    }>
      <SearchPageInner />
    </Suspense>
  );
}
