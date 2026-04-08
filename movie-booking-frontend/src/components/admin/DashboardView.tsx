"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Ticket, DollarSign, Popcorn, User, Activity } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function DashboardView() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-zinc-500 animate-pulse">Loading dashboard...</div>;
  if (!stats) return <div className="text-red-500">Failed to load statistics</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">Dashboard Overview</h2>
          <p className="text-zinc-500 mt-1">Real-time system insights</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <DollarSign className="w-24 h-24 text-green-500 translate-x-4 -translate-y-4" />
          </div>
          <div className="flex items-center space-x-4 mb-4 relative z-10">
            <div className="p-3 bg-green-500/10 rounded-xl relative z-10 border border-green-500/20">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-zinc-400 font-medium">Total Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-white relative z-10">₹{stats.totalRevenue?.toLocaleString()}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <Ticket className="w-24 h-24 text-blue-500 translate-x-4 -translate-y-4" />
          </div>
          <div className="flex items-center space-x-4 mb-4 relative z-10">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Ticket className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-zinc-400 font-medium">Total Bookings</h3>
          </div>
          <p className="text-3xl font-bold text-white relative z-10">{stats.totalBookings}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <Activity className="w-24 h-24 text-purple-500 translate-x-4 -translate-y-4" />
          </div>
          <div className="flex items-center space-x-4 mb-4 relative z-10">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-zinc-400 font-medium">Active Shows</h3>
          </div>
          <p className="text-3xl font-bold text-white relative z-10">{stats.activeShows}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <User className="w-24 h-24 text-orange-500 translate-x-4 -translate-y-4" />
          </div>
          <div className="flex items-center space-x-4 mb-4 relative z-10">
            <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <User className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-zinc-400 font-medium">Seats Booked</h3>
          </div>
          <p className="text-3xl font-bold text-white relative z-10">{stats.totalSeatsBooked}</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl overflow-hidden mt-8">
        <h3 className="text-xl font-bold mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-3 text-rose-500" />
            Recent Bookings
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="py-3 px-4 text-zinc-400 font-medium text-sm">Booking ID</th>
                <th className="py-3 px-4 text-zinc-400 font-medium text-sm">User</th>
                <th className="py-3 px-4 text-zinc-400 font-medium text-sm">Movie</th>
                <th className="py-3 px-4 text-zinc-400 font-medium text-sm">Seats</th>
                <th className="py-3 px-4 text-zinc-400 font-medium text-sm">Amount</th>
                <th className="py-3 px-4 text-zinc-400 font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings?.map((b: any) => (
                <tr key={b._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-3 px-4 text-sm font-mono text-zinc-300">#{b._id.slice(-6).toUpperCase()}</td>
                  <td className="py-3 px-4 text-sm">{b.user?.name || "Guest"}</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-10 bg-zinc-800 rounded overflow-hidden border border-zinc-700 flex-shrink-0">
                        <img src={b.show?.movie?.poster || "/placeholder.jpg"} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }} />
                      </div>
                      <span className="text-zinc-300 truncate max-w-[150px]">{b.show?.movie?.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm"><span className="px-2 py-1 bg-zinc-800 rounded-md text-zinc-300">{b.seats.length}x</span></td>
                  <td className="py-3 px-4 text-sm font-semibold text-green-400">₹{b.totalPrice}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      b.paymentStatus === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      b.paymentStatus === 'refunded' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {b.paymentStatus.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.recentBookings?.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">No recent bookings</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
