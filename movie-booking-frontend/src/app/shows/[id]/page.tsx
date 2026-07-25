"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { socket } from "../../../lib/socket";

import { playRetroClick, playGotcha, playErrorSound } from "../../../lib/sounds";
import { motion } from "framer-motion";

type Seat = {
  seatNo: string;
  status: "available" | "locked" | "booked";
  lockedBy: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ShowDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [show, setShow] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const user =
    typeof window !== "undefined"
      ? (() => {
        try {
          return JSON.parse(sessionStorage.getItem("user") || "null");
        } catch {
          return null;
        }
      })()
      : null;

  const fetchShow = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    try {
      const res = await axios.get(`${API_URL}/api/shows/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShow(res.data);
      setError(null);
    } catch (err: any) {
      console.error("FETCH SHOW ERROR:", err?.response?.data || err.message);
      setError(err?.response?.data?.message || "Show not found. It may have been removed or updated.");
    }
  };

  useEffect(() => {
    if (id) fetchShow();
  }, [id]);

  // Realtime seat updates
  useEffect(() => {
    if (!id) return;
    socket.connect();
    socket.emit("join-show", id);
    socket.on("seats-updated", ({ showId }: { showId: string }) => {
      if (showId === id) fetchShow();
    });
    return () => {
      socket.off("seats-updated");
      socket.disconnect();
    };
  }, [id]);

  const toggleSeat = (seatNo: string) => {
    playRetroClick();
    setSelectedSeats((prev) =>
      prev.includes(seatNo) ? prev.filter((s) => s !== seatNo) : [...prev, seatNo]
    );
  };

  const lockSeats = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return router.push("/login");
    if (selectedSeats.length === 0) return;

    setLoading(true);
    setMessage(null);
    try {
      await axios.post(
        `${API_URL}/api/shows/${id}/lock`,
        { seats: selectedSeats },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      playGotcha();
      setMessage({ text: `✅ Gotcha! ${selectedSeats.length} seat(s) locked for 5 minutes! Now click "Pay" to complete your booking.`, type: "success" });
      fetchShow();
    } catch (err: any) {
      playErrorSound();
      setMessage({ text: err?.response?.data?.message || "Failed to lock seats", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const proceedToPayment = () => {
    if (selectedSeats.length === 0) {
      playErrorSound();
      setMessage({ text: "Please lock your seats first before proceeding to payment.", type: "info" });
      return;
    }
    // Check if selected seats are locked by current user
    const lockedByMe = show?.seats?.filter(
      (s: Seat) =>
        selectedSeats.includes(s.seatNo) &&
        s.status === "locked" &&
        s.lockedBy === user?.id
    );
    if (!lockedByMe || lockedByMe.length === 0) {
      playErrorSound();
      setMessage({ text: "⚠️ Lock your seats first before paying.", type: "error" });
      return;
    }
    playRetroClick();
    router.push(`/checkout/${id}?seats=${selectedSeats.join(",")}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center max-w-md shadow-2xl backdrop-blur-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <span className="text-4xl text-red-500">🎞️</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">Show Disappeared!</h2>
          <p className="text-gray-400 mb-8 leading-relaxed text-sm">
            {error}. This usually happens if the schedule was recently updated.
          </p>
          <button
            onClick={() => router.push("/shows")}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/40 active:scale-95"
          >
            ← View Active Shows
          </button>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-400">Loading show details…</p>
        </div>
      </div>
    );
  }

  const availableCount = show.seats.filter((s: Seat) => s.status === "available").length;
  const bookedCount = show.seats.filter((s: Seat) => s.status === "booked").length;

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d0d14] to-[#0a0a0f] border-b border-white/5 p-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex items-start justify-between gap-4 relative z-10">
          <div>
            <button
              onClick={() => { playRetroClick(); router.push("/shows"); }}
              className="text-gray-500 hover:text-gray-300 text-sm mb-3 transition-colors flex items-center gap-1"
            >
              ← All Shows
            </button>
            <h1 className="text-3xl font-bold tracking-tight">
              🎬 {show.movie?.title || "Unknown Movie"}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
              <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-blue-300 font-medium">
                {show.screen?.name || "Screen"}
              </span>
              <span>
                {new Date(show.showTime).toLocaleString("en-IN", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded">₹{show.price} / seat</span>
            </div>
          </div>
          <div className="flex gap-6 text-center shrink-0">
            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <p className="text-2xl font-black text-cyan-400">{availableCount}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Available</p>
            </div>
            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 opacity-50">
              <p className="text-2xl font-black text-gray-500">{bookedCount}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Booked</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Seat map */}
        <div className="lg:col-span-2 bg-gradient-to-b from-white/[0.04] to-transparent border border-white/8 rounded-2xl p-6 shadow-xl">
          {/* Screen indicator */}
          <div className="mb-8 relative">
            <div className="h-2 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent rounded-full mb-2 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
            <p className="text-center text-xs text-gray-500 uppercase tracking-widest font-bold">Screen</p>
          </div>

          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">🎫 Select Seats</h2>

          <div className="grid grid-cols-10 gap-2.5 mb-6">
            {show.seats.map((seat: Seat) => {
              const isSelected = selectedSeats.includes(seat.seatNo);
              const isBooked = seat.status === "booked";
              const isLocked = seat.status === "locked";
              const isLockedByMe = seat.lockedBy === user?.id;

              let cls =
                "p-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 select-none flex items-center justify-center ";

              if (isBooked) {
                cls += "bg-white/5 text-gray-700 cursor-not-allowed";
              } else if (isLocked && !isLockedByMe) {
                cls += "bg-amber-900/40 text-amber-700 cursor-not-allowed border border-amber-700/20";
              } else if (isLockedByMe) {
                cls += "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)] text-white border border-blue-400";
              } else if (isSelected) {
                cls += "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.6)] border border-green-400";
              } else {
                cls +=
                  "bg-white/5 hover:bg-white/10 hover:scale-110 text-gray-400 hover:text-white cursor-pointer border border-white/5";
              }

              return (
                <motion.button
                  key={seat.seatNo}
                  whileTap={!isBooked && (!isLocked || isLockedByMe) ? { scale: 0.8, rotate: [0, -10, 10, -10, 0] } : {}}
                  disabled={isBooked || (isLocked && !isLockedByMe)}
                  onClick={() => toggleSeat(seat.seatNo)}
                  title={
                    isBooked
                      ? "Booked"
                      : isLocked && !isLockedByMe
                        ? "Locked by another user"
                        : isLockedByMe
                          ? "Locked by you"
                          : "Available"
                  }
                  className={cls}
                >
                  {seat.seatNo}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2">
            {[
              {
                color: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)] border border-green-400",
                label: "Selected",
                textColor: "text-green-400",
              },
              {
                color: "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.7)] border border-blue-400",
                label: "Your Lock",
                textColor: "text-blue-400",
              },
              {
                color: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] border border-amber-400",
                label: "Locked",
                textColor: "text-amber-400",
              },
              {
                color: "bg-rose-900 border border-rose-700/60",
                label: "Booked",
                textColor: "text-rose-400",
              },
              {
                color: "bg-white/10 border border-white/25",
                label: "Available",
                textColor: "text-gray-300",
              },
            ].map(({ color, label, textColor }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-md ${color}`} />
                <span className={`text-xs font-semibold ${textColor}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Booking panel */}
        <div className="space-y-4">
          {/* Selection summary */}
          <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Your Selection
            </h3>

            {selectedSeats.length === 0 ? (
              <p className="text-gray-600 text-sm">No seats selected yet.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedSeats.map((s) => (
                    <span
                      key={s}
                      className="bg-green-900/30 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-lg text-xs font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="h-px bg-white/5 mb-4" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total</span>
                  <span className="text-xl font-bold text-white">
                    ₹{(selectedSeats.length * show.price).toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Notification message */}
          {message && (
            <div
              className={`rounded-xl px-4 py-3 text-sm border ${message.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : message.type === "error"
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                }`}
            >
              {message.text}
            </div>
          )}

          {/* Workflow steps */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
              How to Book
            </p>
            {["Select your seats", "Lock seats (holds for 5 min)", "Pay securely with Razorpay"].map(
              (step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-gray-400 text-sm">{step}</span>
                </div>
              )
            )}
          </div>

          {/* Action buttons */}
          <motion.button
            whileTap={{ scale: 0.9, rotate: -2, transition: { type: "spring", stiffness: 300 } }}
            disabled={loading || selectedSeats.length === 0}
            onClick={lockSeats}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-white/5 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Catching…
              </>
            ) : (
              <>
                🔒 Lock {selectedSeats.length > 0 ? selectedSeats.length : ""} Seat
                {selectedSeats.length !== 1 ? "s" : ""}
              </>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9, rotate: 2, transition: { type: "spring", stiffness: 300 } }}
            disabled={
              loading ||
              selectedSeats.length === 0 ||
              !show.seats.some(
                (s: Seat) =>
                  selectedSeats.includes(s.seatNo) &&
                  s.status === "locked" &&
                  s.lockedBy === user?.id
              )
            }
            onClick={proceedToPayment}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-white/5 disabled:to-white/5 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
          >
            ⚡ Pay ₹{(selectedSeats.length * show.price).toLocaleString()}
          </motion.button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
            <span>🔒</span>
            <span>Secured by Razorpay · 256-bit SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
