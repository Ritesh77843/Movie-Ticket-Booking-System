"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, MonitorPlay } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function ScreensView() {
  const [screens, setScreens] = useState<any[]>([]);
  const [theaters, setTheaters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", theater: "", rows: 10, seatsPerRow: 10 });

  useEffect(() => { 
    fetchScreens();
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/theaters`);
      setTheaters(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchScreens = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/screens`, { headers: { Authorization: `Bearer ${token}` } });
      setScreens(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${API_URL}/api/screens`, formData, { headers: { Authorization: `Bearer ${token}` } });
      setShowModal(false);
      setFormData({ name: "", theater: "", rows: 10, seatsPerRow: 10 });
      fetchScreens();
    } catch (err: any) { alert(err.response?.data?.message || "Failed to create screen"); }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this theatre screen?")) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/api/screens/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchScreens();
    } catch (err: any) { alert(err.response?.data?.message || "Failed to delete"); }
  };

  if (loading) return <div className="text-zinc-500 animate-pulse">Loading Theatres...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">Theatres & Screens</h2>
          <p className="text-zinc-500 mt-1">Manage physical cinema screens and capacities</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl font-medium transition flex items-center shadow-lg shadow-rose-600/20">
          <Plus className="w-5 h-5 mr-2" /> Add Screen
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {screens.map(s => (
           <div key={s._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><MonitorPlay className="w-32 h-32 -mt-8 -mr-8" /></div>
             
             <div className="flex justify-between items-start mb-4 relative z-10">
               <div className="flex items-center space-x-3">
                 <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                   <MonitorPlay className="w-6 h-6 text-rose-500" />
                 </div>
                 <h3 className="font-bold text-xl text-white">{s.name}</h3>
                 <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{s.theater?.name || "Unknown Theatre"}</p>
               </div>
               <button onClick={() => handleDelete(s._id)} className="p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
               </button>
             </div>
             
             <div className="grid grid-cols-3 gap-2 mt-6 relative z-10">
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-center">
                   <p className="text-xs text-zinc-500 mb-1">Rows</p>
                   <p className="font-bold text-white">{s.layoutConfig?.rows || 0}</p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-center">
                   <p className="text-xs text-zinc-500 mb-1">Seats/Row</p>
                   <p className="font-bold text-white">{s.layoutConfig?.seatsPerRow || 0}</p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-center">
                   <p className="text-xs text-zinc-500 mb-1">Total</p>
                   <p className="font-bold text-white">{(s.layoutConfig?.rows || 0) * (s.layoutConfig?.seatsPerRow || 0)}</p>
                </div>
             </div>
           </div>
        ))}
        {screens.length === 0 && <p className="col-span-full text-center text-zinc-500 py-10">No screens configured yet.</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <h3 className="text-xl font-bold mb-6 text-white flex items-center"><MonitorPlay className="mr-3 text-rose-500" /> New Theatre Screen</h3>
            <form onSubmit={handleCreate} className="space-y-4">
               <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Cinema Theatre</label>
                  <select required value={formData.theater} onChange={e=>setFormData({...formData, theater: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500 appearance-none mb-4">
                     <option value="" disabled>-- Select a Theatre --</option>
                     {theaters.map(t => <option key={t._id} value={t._id}>{t.name} ({t.subLocation})</option>)}
                  </select>
                  <label className="text-xs text-zinc-400 mb-1 block">Screen Name</label>
                  <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500" placeholder="e.g. IMAX Arena 1" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Number of Rows</label>
                    <input required type="number" value={formData.rows} onChange={e=>setFormData({...formData, rows: parseInt(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500" min={1} max={26} />
                 </div>
                 <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Seats per Row</label>
                    <input required type="number" value={formData.seatsPerRow} onChange={e=>setFormData({...formData, seatsPerRow: parseInt(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500" min={1} max={50} />
                 </div>
               </div>
               
               <div className="flex gap-3 pt-4 border-t border-zinc-800 mt-6">
                 <button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-lg font-medium transition-colors">Save</button>
                 <button type="button" onClick={() => setShowModal(false)} className="px-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors">Cancel</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
