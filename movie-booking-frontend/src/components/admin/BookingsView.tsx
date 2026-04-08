"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Search, MoreVertical, XCircle, CheckCircle, RotateCcw } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function BookingsView() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "cancel" | "refund" | "verify") => {
    if (!confirm(`Are you sure you want to ${action} this booking?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/admin/bookings/${id}/action`, { action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings(); // refresh
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${action} booking`);
    }
  };

  const filtered = bookings.filter(b => 
    b._id.includes(searchTerm) || 
    b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.show?.movie?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-zinc-500 animate-pulse">Loading Bookings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">Bookings Management</h2>
          <p className="text-zinc-500 mt-1">Manage, verify, and refund user bookings</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by Booking ID, User, or Movie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800">
                <th className="py-4 px-5 text-zinc-400 font-medium text-sm">ID</th>
                <th className="py-4 px-5 text-zinc-400 font-medium text-sm">User & Contact</th>
                <th className="py-4 px-5 text-zinc-400 font-medium text-sm">Movie & Show</th>
                <th className="py-4 px-5 text-zinc-400 font-medium text-sm">Seats</th>
                <th className="py-4 px-5 text-zinc-400 font-medium text-sm">Status</th>
                <th className="py-4 px-5 text-zinc-400 font-medium text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b: any) => (
                <tr key={b._id} className="border-b border-zinc-800 hover:bg-zinc-900 transition-colors">
                  <td className="py-4 px-5 text-sm font-mono text-zinc-300">#{b._id.slice(-6).toUpperCase()}</td>
                  <td className="py-4 px-5">
                    <div className="font-medium text-white">{b.user?.name || "Guest"}</div>
                    <div className="text-xs text-zinc-500">{b.user?.email || b.user?.phone}</div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-14 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 flex-shrink-0">
                        <img src={b.show?.movie?.poster || "/placeholder.jpg"} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-white truncate max-w-[150px]">{b.show?.movie?.title}</div>
                        <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">{new Date(b.show?.showTime).toLocaleString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm text-zinc-300 break-words max-w-[150px]">
                    {b.seats.join(", ")}
                  </td>
                  <td className="py-4 px-5">
                     <span className={`px-2 py-1 inline-flex items-center gap-1 rounded-full text-xs font-medium border ${
                      b.bookingStatus === 'active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                      b.bookingStatus === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {b.bookingStatus.toUpperCase()}
                    </span>
                    <br/>
                    <span className="text-[10px] text-zinc-500 block mt-1 uppercase tracking-wider">{b.paymentStatus}</span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex justify-end gap-2">
                       {b.bookingStatus === 'active' && (
                         <>
                           <button onClick={() => handleAction(b._id, 'verify')} title="Verify Booking" className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors border border-green-500/20">
                             <CheckCircle className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleAction(b._id, 'cancel')} title="Cancel Booking" className="p-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-lg transition-colors border border-orange-500/20">
                             <XCircle className="w-4 h-4" />
                           </button>
                            <button onClick={() => handleAction(b._id, 'refund')} title="Refund (Stripe)" className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20">
                             <RotateCcw className="w-4 h-4" />
                           </button>
                         </>
                       )}
                       {b.bookingStatus !== 'active' && (
                         <span className="text-xs text-zinc-600 block">No actions</span>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">No bookings match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
