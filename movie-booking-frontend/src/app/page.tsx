// src/app/page.tsx

import Winner from "@/components/Winner";
import MovieRow from "@/components/MovieRow";

export default async function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!API_URL) {
    console.error("❌ NEXT_PUBLIC_API_URL is not defined");
    return (
      <div className="p-10 text-center text-red-600">
        API URL not configured.
      </div>
    );
  }

  let movies: any[] = [];

  try {
    const fetchUrl = (API_URL || "http://127.0.0.1:5000").replace("localhost", "127.0.0.1");
    const res = await fetch(`${fetchUrl}/api/movies`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();
    
    // Deduplicate movies by title visually to prevent repetitive cards
    if (Array.isArray(data)) {
      const uniqueMoviesMap = new Map();
      data.forEach(movie => {
        const normalizedTitle = (movie.title || "").trim().toLowerCase();
        if (normalizedTitle && !uniqueMoviesMap.has(normalizedTitle)) {
           uniqueMoviesMap.set(normalizedTitle, movie);
        }
      });
      movies = Array.from(uniqueMoviesMap.values());
    } else {
      movies = [];
    }

  } catch (error) {
    console.error("❌ Failed to fetch movies:", error);
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Hero Banner */}
      <Winner />

      {/* Content Wrapper */}
      <div className="max-w-7xl mx-auto px-6 pb-16 space-y-12">
        {/* Recommended */}
        <MovieRow title="🎯 Recommended Movies" movies={movies} />

        {/* Trending */}
        <MovieRow
          title="🔥 Trending Now"
          movies={movies.slice(0, 6)}
        />

      </div>

    </div>
  );
}