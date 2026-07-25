"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function BookingHistoryPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err: any) {
      console.error("BOOKINGS ERROR:", err?.response?.data || err.message);
      setError(
        err?.response?.data?.message || "Failed to fetch bookings"
      );
      if (err.response?.status === 401) {
        sessionStorage.clear();
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const token = sessionStorage.getItem("token");
    if (!token) return router.push("/login");

    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await axios.post(
        `${API_URL}/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Booking cancelled successfully!");
      fetchBookings();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <p className="text-gray-400">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent text-white">
        <div className="bg-zinc-900 border-b border-zinc-800 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold">📋 My Bookings</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-lg mb-6">
            {error}
          </div>
          <Link href="/shows" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
            ← Go back to shows
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">📋 My Bookings</h1>
          <p className="text-gray-400 mt-2">View and manage your movie reservations</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">

        {bookings.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg mb-6">You haven't made any bookings yet.</p>
            <Link
              href="/shows"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Browse Shows
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => {
              const showDate = new Date(booking.show?.showTime);
              const formattedDate = showDate
                .toLocaleDateString("en-IN", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
                .toUpperCase();
              const formattedTime = showDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              const statusColors: Record<string, string> = {
                active: "bg-green-500/20 text-green-400",
                completed: "bg-blue-500/20 text-blue-400",
                cancelled: "bg-red-500/20 text-red-400",
              };
              const statusColor = statusColors[booking.bookingStatus] || "bg-gray-500/20 text-gray-400";

              return (
                <div key={booking._id} className="bg-zinc-900 rounded-xl p-6 hover:bg-zinc-800 transition">
                  {/* Movie Title */}
                  <h2 className="text-xl font-bold mb-2">{booking.show?.movie?.title || "Unknown Movie"}</h2>

                  {/* Status Badge */}
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${statusColor}`}>
                    {booking.bookingStatus.toUpperCase()}
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-300 mb-4">
                    <p>
                      <span className="text-gray-400">Screen:</span> {booking.show?.screen?.name || "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-400">Date:</span> {formattedDate}
                    </p>
                    <p>
                      <span className="text-gray-400">Time:</span> {formattedTime}
                    </p>
                    <p>
                      <span className="text-gray-400">Seats:</span> {booking.seats.join(", ")}
                    </p>
                    <p className="text-lg font-semibold text-red-400 mt-3">
                      Total: ₹{booking.totalPrice}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-400 text-xs">Payment:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${booking.paymentStatus === "completed"
                          ? "bg-green-500/15 text-green-400"
                          : booking.paymentStatus === "refunded"
                            ? "bg-blue-500/15 text-blue-400"
                            : booking.paymentStatus === "failed"
                              ? "bg-red-500/15 text-red-400"
                              : "bg-yellow-500/15 text-yellow-400"
                        }`}>
                        {booking.paymentStatus === "completed" ? "✓" : "•"}{" "}
                        {booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1)}
                      </span>
                      {booking.paymentMethod && (
                        <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full text-xs">
                          {booking.paymentMethod === "razorpay" ? "⚡ Razorpay" : booking.paymentMethod}
                        </span>
                      )}
                    </div>
                    {booking.paymentReferenceId && (
                      <p className="text-[10px] text-gray-600 font-mono break-all">
                        Ref: {booking.paymentReferenceId.slice(-16)}
                      </p>
                    )}
                  </div>

                  {/* Booked on */}
                  <p className="text-xs text-gray-500 mb-4">
                    Booked on:{" "}
                    {new Date(booking.bookingTime)
                      .toLocaleDateString("en-IN")}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {booking.bookingStatus !== "cancelled" && (
                      <button
                        onClick={() => router.push(`/ticket/${booking._id}`)}
                        className="flex-2 bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded text-sm transition font-bold text-white shadow-md shadow-emerald-900/40"
                      >
                        🎟️ E-Ticket
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/shows/${booking.show?._id}`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm transition"
                    >
                      Show
                    </button>
                    {booking.bookingStatus === "active" && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="flex-1 bg-zinc-700 hover:bg-red-600 px-3 py-2 rounded text-sm transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
