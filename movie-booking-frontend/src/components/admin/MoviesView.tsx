"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Film, Search, Download } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function MoviesView() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Standard Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", duration: 120, language: "Hindi", genre: "Action", releaseDate: "", poster: "/placeholder.jpg"
  });

  // TMDB State
  const [showTMDBModal, setShowTMDBModal] = useState(false);
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState<any[]>([]);
  const [tmdbLoading, setTmdbLoading] = useState(false);

  useEffect(() => { fetchMovies(); }, []);

  const fetchMovies = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/movies`);
      setMovies(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${API_URL}/api/movies`, formData, { headers: { Authorization: `Bearer ${token}` } });
      setShowModal(false);
      setFormData({ title: "", description: "", duration: 120, language: "Hindi", genre: "Action", releaseDate: "", poster: "/placeholder.jpg" });
      fetchMovies();
    } catch (err: any) { alert(err.response?.data?.message || "Failed to create movie"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this movie?")) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/api/movies/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchMovies();
    } catch (err: any) { alert(err.response?.data?.message || "Failed to delete"); }
  };

  const searchTMDB = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!tmdbQuery.trim()) return;
    setTmdbLoading(true);
    try {
      // Fallback demo key for rapid iteration if env var isn't set
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "92b418e837b833be308bbfb1fb2aca1e";
      const res = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(tmdbQuery)}`);
      setTmdbResults(res.data.results || []);
    } catch (err) {
      alert("TMDB search failed. Ensure API key is valid.");
    } finally {
      setTmdbLoading(false);
    }
  };

  const selectTMDBMovie = (movie: any) => {
    setFormData({
      ...formData,
      title: movie.title || "",
      description: movie.overview || "",
      releaseDate: movie.release_date || "",
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.jpg",
      // Best guess genre placeholder
      genre: "Drama"
    });
    setShowTMDBModal(false);
    setShowModal(true);
  };

  const getPoster = (path: string) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("/") && path.length > 20) return `https://image.tmdb.org/t/p/w500${path}`;
    return path;
  };

  if (loading) return <div className="text-zinc-500 animate-pulse">Loading Movies...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">Movies Vault</h2>
          <p className="text-zinc-500 mt-1">Manage film catalog and metadata</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowTMDBModal(true)} className="bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 hover:bg-indigo-600 hover:text-white px-5 py-2.5 rounded-xl font-medium transition flex items-center shadow-lg shadow-indigo-600/10">
            <Search className="w-4 h-4 mr-2" /> Import from TMDB
          </button>
          <button onClick={() => { setFormData({ title: "", description: "", duration: 120, language: "Hindi", genre: "Action", releaseDate: "", poster: "/placeholder.jpg" }); setShowModal(true); }} className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl font-medium transition flex items-center shadow-lg shadow-rose-600/20">
            <Plus className="w-5 h-5 mr-2" /> Add Custom
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {movies.map(m => (
          <div key={m._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group shadow-md hover:shadow-xl hover:shadow-black/50 transition-all">
            <div className="h-64 bg-zinc-800 relative overflow-hidden">
              <img src={m.poster} alt={m.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-300" onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }} />
              <button onClick={() => handleDelete(m._id)} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-red-500 hover:bg-red-500 active:scale-95 hover:text-white transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-white truncate">{m.title}</h3>
              <div className="flex gap-2 text-xs text-zinc-400 mt-1 mb-2">
                <span>{m.duration} mins</span> • <span className="truncate">{m.language}</span> • <span className="truncate">{m.genre}</span>
              </div>
            </div>
          </div>
        ))}
        {movies.length === 0 && <p className="col-span-full text-center text-zinc-500 py-10">No movies found.</p>}
      </div>

      {/* TMDB Search Modal */}
      {showTMDBModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-3xl shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center"><Search className="mr-3 text-indigo-500" /> Search TMDB Database</h3>
              <button onClick={() => setShowTMDBModal(false)} className="text-zinc-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>

            <form onSubmit={searchTMDB} className="flex gap-3 mb-6">
              <input
                autoFocus
                type="text"
                placeholder="Search for a movie (e.g. Iron Man)..."
                value={tmdbQuery}
                onChange={e => setTmdbQuery(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" disabled={tmdbLoading} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 rounded-xl font-bold transition">
                {tmdbLoading ? "Searching..." : "Search"}
              </button>
            </form>

            {/* Results */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-3 custom-scrollbar">
              {tmdbResults.length === 0 && !tmdbLoading && tmdbQuery && (
                <p className="text-zinc-500 text-center py-10">No results found for "{tmdbQuery}"</p>
              )}
              {tmdbResults.map(movie => (
                <div key={movie.id} className="flex gap-4 p-3 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 transition bg-black/20 group">
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : "/placeholder.jpg"}
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded-md bg-zinc-800 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-lg font-bold text-white truncate">{movie.title}</h4>
                    <p className="text-sm text-zinc-500 mb-1">{movie.release_date?.substring(0, 4) || "Unknown Year"} • TMDB Score: {movie.vote_average?.toFixed(1)}</p>
                    <p className="text-xs text-zinc-400 line-clamp-2">{movie.overview}</p>
                  </div>
                  <div className="flex items-center">
                    <button onClick={() => selectTMDBMovie(movie)} className="bg-white/10 hover:bg-white text-white hover:text-black px-4 py-2 rounded-lg text-sm font-bold transition flex items-center whitespace-nowrap opacity-0 md:opacity-100 group-hover:opacity-100">
                      <Download className="w-4 h-4 mr-2" /> Import
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Movie Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center"><Film className="mr-3 text-rose-500" /> New Movie Release</h3>

            <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-8">
              {/* Left: Poster Preview */}
              <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
                <div className="w-full aspect-[2/3] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl shadow-black">
                  <img src={formData.poster} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }} />
                </div>
                <div className="w-full">
                  <label className="text-xs text-zinc-500 mb-1 block">Poster URL</label>
                  <input type="text" value={formData.poster} onChange={e => setFormData({ ...formData, poster: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500" />
                </div>
              </div>

              {/* Right: Details */}
              <div className="w-full md:w-2/3 space-y-5">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block font-bold tracking-wider uppercase">Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-rose-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block font-bold tracking-wider uppercase">Genre</label>
                    <input required type="text" value={formData.genre} onChange={e => setFormData({ ...formData, genre: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block font-bold tracking-wider uppercase">Language</label>
                    <input required type="text" value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block font-bold tracking-wider uppercase">Runtime (Mins)</label>
                    <input required type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500" min={1} />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block font-bold tracking-wider uppercase">Release Date</label>
                    <input required type="date" value={formData.releaseDate} onChange={e => setFormData({ ...formData, releaseDate: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[color-scheme:dark]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block font-bold tracking-wider uppercase">Synopsis</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 resize-y min-h-[120px]" rows={4}></textarea>
                </div>

                <div className="flex gap-3 pt-6 border-t border-zinc-800">
                  <button type="button" onClick={() => setShowModal(false)} className="px-8 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-rose-600/30 transition-all hover:-translate-y-0.5">Save Movie to Database</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
