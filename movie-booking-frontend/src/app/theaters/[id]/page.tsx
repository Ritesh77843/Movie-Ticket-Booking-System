"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Film, MapPin, Clock, Calendar } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

import { useParams } from "next/navigation";

export default function TheaterMoviesPage() {
  const params = useParams();
  const theaterId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [theater, setTheater] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [theaterId]);

  const fetchData = async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        axios.get(`${API_URL}/api/theaters`), // We can refine this to get specific theater if endpoint exists
        axios.get(`${API_URL}/api/theaters/${theaterId}/movies`)
      ]);
      
      const currentTheater = tRes.data.find((t: any) => t._id === theaterId);
      setTheater(currentTheater);
      setMovies(mRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center animate-pulse">Loading theater details...</div>;
  if (!theater) return <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center">Theater not found</div>;

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-16">
          <div className="flex items-center gap-3 text-rose-500 font-bold uppercase tracking-widest text-xs mb-3">
             <MapPin className="w-4 h-4" />
             {theater.subLocation}, {theater.location}
          </div>
          <h1 className="text-5xl font-black mb-4">{theater.name}</h1>
          <p className="text-zinc-500 text-lg max-w-2xl">{theater.address}. Experience state-of-the-art projection and sound at this premier destination.</p>
        </div>

        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <Film className="text-rose-500" /> Currently Showing
        </h2>

        {movies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {movies.map((movie) => (
              <div key={movie._id} className="bg-[#12121a] border border-white/5 rounded-3xl overflow-hidden group flex flex-col">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={movie.poster} 
                    alt={movie.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-rose-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{movie.rating}</span>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                   <h3 className="text-2xl font-bold mb-2">{movie.title}</h3>
                   <p className="text-zinc-500 text-sm mb-6 flex-1">{movie.genre} • {movie.language}</p>
                   
                   <Link 
                     href={`/movies/${movie._id}`}
                     className="block w-full bg-white/5 hover:bg-rose-600 border border-white/10 hover:border-rose-500 py-3 rounded-xl text-center font-bold transition-all text-sm"
                   >
                     Select Timings
                   </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/5 p-20 rounded-3xl text-center">
            <Film className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 text-lg">No movies currently playing at this theater.</p>
          </div>
        )}
      </div>
    </div>
  );
}
