"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Film } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function MoviesView() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", duration: 120, language: "Hindi", genre: "Action", releaseDate: "", poster: "/placeholder.jpg"
  });

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
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/movies`, formData, { headers: { Authorization: `Bearer ${token}` } });
      setShowModal(false);
      setFormData({ title: "", description: "", duration: 120, language: "Hindi", genre: "Action", releaseDate: "", poster: "/placeholder.jpg" });
      fetchMovies();
    } catch (err: any) { alert(err.response?.data?.message || "Failed to create movie"); }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this movie?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/movies/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchMovies();
    } catch (err: any) { alert(err.response?.data?.message || "Failed to delete"); }
  };

  if (loading) return <div className="text-zinc-500 animate-pulse">Loading Movies...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">Movies Vault</h2>
          <p className="text-zinc-500 mt-1">Manage film catalog and metadata</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl font-medium transition flex items-center shadow-lg shadow-rose-600/20">
          <Plus className="w-5 h-5 mr-2" /> Add Movie
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {movies.map(m => (
           <div key={m._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group">
             <div className="h-64 bg-zinc-800 relative overflow-hidden">
                <img src={m.poster} alt={m.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-300" onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }} />
                <button onClick={() => handleDelete(m._id)} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-red-500 hover:bg-red-500 active:scale-95 hover:text-white transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
             </div>
             <div className="p-4">
               <h3 className="font-bold text-lg text-white truncate">{m.title}</h3>
               <div className="flex gap-2 text-xs text-zinc-400 mt-1 mb-2">
                 <span>{m.duration} mins</span> • <span>{m.language}</span> • <span>{m.genre}</span>
               </div>
             </div>
           </div>
        ))}
        {movies.length === 0 && <p className="col-span-full text-center text-zinc-500 py-10">No movies found.</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center"><Film className="mr-3 text-rose-500" /> New Movie Release</h3>
            <form onSubmit={handleCreate} className="space-y-4">
               <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Title</label>
                  <input required type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Genre</label>
                    <input required type="text" value={formData.genre} onChange={e=>setFormData({...formData, genre: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500" />
                 </div>
                 <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Language</label>
                    <input required type="text" value={formData.language} onChange={e=>setFormData({...formData, language: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500" />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Duration (mins)</label>
                    <input required type="number" value={formData.duration} onChange={e=>setFormData({...formData, duration: parseInt(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500" min={1} />
                 </div>
                 <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Release Date</label>
                    <input required type="date" value={formData.releaseDate} onChange={e=>setFormData({...formData, releaseDate: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[color-scheme:dark]" />
                 </div>
               </div>
               <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Synopsis / Description</label>
                  <textarea value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500 resize-none" rows={3}></textarea>
               </div>
               <div>
                   <label className="text-xs text-zinc-400 mb-1 block">Poster URL / Path</label>
                  <input type="text" value={formData.poster} onChange={e=>setFormData({...formData, poster: e.target.value})} placeholder="/movies/Hindi/image.jpeg" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500" />
               </div>
               
               <div className="flex gap-3 pt-4 border-t border-zinc-800 mt-6">
                 <button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-lg font-medium transition-colors">Save Movie</button>
                 <button type="button" onClick={() => setShowModal(false)} className="px-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors">Cancel</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
