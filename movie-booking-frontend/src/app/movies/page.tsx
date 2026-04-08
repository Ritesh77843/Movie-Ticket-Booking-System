// src/app/movies/page.tsx

import MovieCard from "@/components/MovieCard";
import Filters from "@/components/Filters";

export default async function MoviesPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/shows`,
    { cache: "no-store" }
  );

  const movies = await res.json();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Movies in Mumbai</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <Filters />
        </div>

        {/* Movie Grid */}
        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {movies.map((m: any) => (
            <MovieCard key={m._id} movie={m} />
          ))}
        </div>
      </div>
    </div>
  );
}