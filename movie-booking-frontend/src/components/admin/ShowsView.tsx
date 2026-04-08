"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, CalendarDays, Lock, Unlock, ShieldAlert, Pencil, X, Check } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAuthHeader() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export function ShowsView() {
  const [shows, setShows] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ movieId: "", screenId: "", showTime: "", price: 250 });

  // Edit modal
  const [editShow, setEditShow] = useState<any>(null);
  const [editForm, setEditForm] = useState({ showTime: "", price: 0 });

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Seat matrix view
  const [selectedShow, setSelectedShow] = useState<any>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shRes, mRes, scRes] = await Promise.all([
        axios.get(`${API_URL}/api/shows`),
        axios.get(`${API_URL}/api/movies`),
        axios.get(`${API_URL}/api/screens`, { headers: getAuthHeader() })
      ]);
      setShows(shRes.data);
      setMovies(mRes.data);
      setScreens(scRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/shows`, formData, { headers: getAuthHeader() });
      setShowModal(false);
      setFormData({ movieId: "", screenId: "", showTime: "", price: 250 });
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || "Failed to create show."); }
  };

  const openEdit = (show: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // Convert showTime to local datetime-local value
    const dt = new Date(show.showTime);
    const localIso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setEditForm({ showTime: localIso, price: show.price });
    setEditShow(show);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await axios.put(
        `${API_URL}/api/shows/${editShow._id}`,
        { showTime: new Date(editForm.showTime).toISOString(), price: Number(editForm.price) },
        { headers: getAuthHeader() }
      );
      setShows(prev => prev.map(s => s._id === editShow._id ? { ...s, ...updated.data } : s));
      setEditShow(null);
    } catch (err: any) { alert(err.response?.data?.message || "Failed to update show."); }
  };

  const handleDelete = async (showId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirm !== showId) {
      setDeleteConfirm(showId);
      return;
    }
    try {
      await axios.delete(`${API_URL}/api/shows/${showId}`, { headers: getAuthHeader() });
      setShows(prev => prev.filter(s => s._id !== showId));
      setDeleteConfirm(null);
    } catch (err: any) { alert(err.response?.data?.message || "Failed to delete show."); }
  };

  const handleSeatAction = async (seatNo: string, newStatus: string) => {
    if (!selectedShow) return;
    try {
      await axios.post(`${API_URL}/api/admin/shows/${selectedShow._id}/seats/force`, { seatNo, newStatus }, { headers: getAuthHeader() });
      const updatedShow = { ...selectedShow };
      const seatIndex = updatedShow.seats.findIndex((s: any) => s.seatNo === seatNo);
      if (seatIndex !== -1) updatedShow.seats[seatIndex].status = newStatus;
      setSelectedShow(updatedShow);
    } catch (err: any) { alert(err.response?.data?.message || "Failed to update seat status"); }
  };

  if (loading) return <div className="text-zinc-500 animate-pulse">Loading Shows...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      {!selectedShow ? (
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">Shows & Timing</h2>
            <p className="text-zinc-500 mt-1">Schedule, edit and manage movie screenings</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl font-medium transition flex items-center shadow-lg shadow-rose-600/20">
            <Plus className="w-5 h-5 mr-2" /> Schedule Show
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
          <div>
            <button onClick={() => setSelectedShow(null)} className="text-rose-500 hover:text-rose-400 text-sm font-semibold mb-2 flex items-center">
              ← Back to Shows
            </button>
            <h2 className="text-3xl font-bold text-white">Seat Management</h2>
            <p className="text-zinc-500 mt-1">{selectedShow.movie?.title} • {new Date(selectedShow.showTime).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Shows Grid */}
      {!selectedShow ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map(s => (
            <div
              key={s._id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 relative group overflow-hidden hover:border-zinc-700 transition cursor-pointer"
              onClick={() => setSelectedShow(s)}
            >
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-20 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-700">
                  <img src={s.movie?.poster || "/placeholder.jpg"} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-white truncate">{s.movie?.title || "Unknown Movie"}</h3>
                  <div className="flex items-center text-xs text-zinc-400 mt-1">
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
                    {new Date(s.showTime).toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Screen: <span className="text-zinc-300">{s.screen?.name || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-3 border-t border-zinc-800/50 flex justify-between items-center text-sm">
                <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-1 rounded">₹{s.price}</span>
                {/* Action Buttons */}
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  {/* Edit Button */}
                  <button
                    onClick={(e) => openEdit(s, e)}
                    className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 transition border border-blue-500/20"
                    title="Edit show timing & price"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  {deleteConfirm === s._id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => handleDelete(s._id, e)}
                        className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition"
                        title="Confirm delete"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                        className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white transition"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleDelete(s._id, e)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition border border-red-500/20"
                      title="Delete show"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Occupancy Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Occupancy</span>
                  <span className="text-zinc-300">{s.seats?.filter((se: any) => se.status === 'booked').length || 0} / {s.seats?.length || 0}</span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-orange-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${((s.seats?.filter((se: any) => se.status === 'booked').length || 0) / (s.seats?.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          {shows.length === 0 && <p className="col-span-full text-center text-zinc-500 py-10">No shows scheduled.</p>}
        </div>
      ) : (
        /* SEAT MATRIX VIEW */
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-wrap gap-4 mb-8 justify-center bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center"><div className="w-4 h-4 bg-zinc-800 border-2 border-zinc-600 rounded mr-2"></div><span className="text-sm text-zinc-400">Available</span></div>
            <div className="flex items-center"><div className="w-4 h-4 bg-zinc-800 border-2 border-red-500 rounded mr-2"></div><span className="text-sm text-zinc-400">Booked</span></div>
            <div className="flex items-center"><div className="w-4 h-4 bg-zinc-800 border-2 border-yellow-500 rounded mr-2"></div><span className="text-sm text-zinc-400">Locked (Cart)</span></div>
            <div className="flex items-center"><div className="w-4 h-4 bg-zinc-800 border-2 border-orange-500 rounded mr-2"></div><span className="text-sm text-zinc-400">Blocked (Admin)</span></div>
          </div>

          <div className="w-full h-8 bg-gradient-to-b from-white/20 to-transparent rounded-t-[100%] border-t border-white/30 mb-12 flex items-center justify-center relative shadow-[0_-10px_30px_rgb(255,255,255,0.05)]">
            <span className="text-[10px] text-zinc-500 absolute -top-4 font-mono tracking-widest uppercase">Screen</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {selectedShow.seats?.map((seat: any) => (
              <div key={seat.seatNo} className="group relative">
                <button
                  className={`w-10 h-10 rounded-t-lg rounded-b-sm border-b-4 text-xs font-bold transition-all flex items-center justify-center ${
                    seat.status === 'available' ? 'bg-zinc-800 border-zinc-600 text-zinc-500 hover:bg-zinc-700' :
                    seat.status === 'booked' ? 'bg-red-500/20 border-red-500 text-red-500' :
                    seat.status === 'locked' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' :
                    seat.status === 'blocked' ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-red-500'
                  }`}
                >
                  {seat.seatNo}
                </button>
                <div className="absolute opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 shadow-xl flex gap-1 z-50">
                  <button onClick={() => handleSeatAction(seat.seatNo, 'available')} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white" title="Release Seat"><Unlock className="w-4 h-4" /></button>
                  <button onClick={() => handleSeatAction(seat.seatNo, 'blocked')} className="p-1.5 hover:bg-orange-500/20 rounded text-orange-500" title="Block Seat"><ShieldAlert className="w-4 h-4" /></button>
                  <button onClick={() => handleSeatAction(seat.seatNo, 'booked')} className="p-1.5 hover:bg-red-500/20 rounded text-red-500" title="Force Book"><Lock className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE SHOW MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold mb-6 text-white flex items-center"><CalendarDays className="mr-3 text-rose-500" /> Schedule New Show</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Select Movie</label>
                <select required value={formData.movieId} onChange={e => setFormData({ ...formData, movieId: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500 appearance-none">
                  <option value="" disabled>-- Select a Movie --</option>
                  {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Select Theatre Screen</label>
                <select required value={formData.screenId} onChange={e => setFormData({ ...formData, screenId: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500 appearance-none">
                  <option value="" disabled>-- Select a Screen --</option>
                  {screens.map(s => <option key={s._id} value={s._id}>{s.name} ({s.rows * s.seatsPerRow || "?"} seats)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Show Date & Time</label>
                  <input required type="datetime-local" value={formData.showTime} onChange={e => setFormData({ ...formData, showTime: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500 [color-scheme:dark]" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Ticket Price (₹)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500" min={1} />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-lg font-medium transition-colors">Publish Show</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SHOW MODAL */}
      {editShow && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setEditShow(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold mb-2 text-white flex items-center"><Pencil className="mr-3 text-blue-400" /> Edit Show</h3>
            <p className="text-zinc-500 text-sm mb-6">{editShow.movie?.title} — {editShow.screen?.name}</p>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">New Show Date & Time</label>
                <input
                  required
                  type="datetime-local"
                  value={editForm.showTime}
                  onChange={e => setEditForm({ ...editForm, showTime: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Ticket Price (₹)</label>
                <input
                  required
                  type="number"
                  value={editForm.price}
                  onChange={e => setEditForm({ ...editForm, price: parseInt(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  min={1}
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Save Changes
                </button>
                <button type="button" onClick={() => setEditShow(null)} className="px-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
