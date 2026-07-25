"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function TicketPage() {
    const params = useParams();
    const router = useRouter();
    const ticketRef = useRef<HTMLDivElement>(null);

    const bookingId = Array.isArray(params.bookingId) ? params.bookingId[0] : params.bookingId ?? "";

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchBooking = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/bookings/${bookingId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBooking(res.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load ticket details");
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId, router]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-dashed border-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center">
                <div className="bg-red-500/10 text-red-500 p-6 rounded-xl border border-red-500/20 mb-4">
                    {error || "Booking not found"}
                </div>
                <button onClick={() => router.push("/bookings")} className="text-blue-400 underline">
                    Return to Bookings
                </button>
            </div>
        );
    }

    const showDate = new Date(booking.show.showTime);
    const formattedDate = showDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const formattedTime = showDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const isCancelled = booking.bookingStatus === "cancelled";
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(booking._id)}`;

    // Basic URL resolution for poster
    const getPosterUrl = (url?: string) => {
        if (!url) return "/movie_placeholder.png";
        if (url.startsWith("http")) return url;
        return `https://image.tmdb.org/t/p/w500${url}`;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center py-10 px-4 ticket-print-bg">
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          body * { visibility: hidden; }
          .ticket-print-bg { background-color: white !important; }
          #printable-ticket, #printable-ticket * { visibility: visible; }
          #printable-ticket { position: absolute; left: 0; top: 0; transform: scale(0.9); margin: 0; box-shadow: none !important; }
          .hide-on-print { display: none !important; }
        }
      `}} />

            <h1 className="text-3xl font-black mb-8 hide-on-print bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
                Your Digital E-Ticket
            </h1>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-full max-w-[800px]"
            >
                {/* Ticket Container */}
                <div
                    id="printable-ticket"
                    ref={ticketRef}
                    className="flex flex-col md:flex-row bg-white text-zinc-900 rounded-[2rem] overflow-hidden drop-shadow-2xl relative"
                >
                    {isCancelled && (
                        <div className="absolute inset-0 z-50 bg-red-900/10 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="border-8 border-red-600 rounded-lg transform -rotate-12 bg-white px-8 py-2">
                                <span className="text-6xl font-black text-red-600 tracking-widest uppercase opacity-90">CANCELLED</span>
                            </div>
                        </div>
                    )}

                    {/* Left Side - Poster */}
                    <div className="w-full md:w-[35%] relative min-h-[300px] md:min-h-full">
                        <Image
                            src={getPosterUrl(booking.show.movie.posterUrl)}
                            alt="Movie Poster"
                            fill
                            className="object-cover"
                        />
                        {/* Gradient overlay for text visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                            <span className="bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full w-max mb-2 uppercase tracking-wide shadow-lg shadow-emerald-900/50">
                                {booking.show.movie.genre || "Cinema"}
                            </span>
                            <h2 className="text-2xl font-black text-white leading-tight drop-shadow-lg">
                                {booking.show.movie.title}
                            </h2>
                        </div>
                    </div>

                    {/* Middle/Right Side - Details & QR */}
                    <div className="w-full md:w-[65%] p-8 flex flex-col justify-between relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-50 to-white">

                        {/* Cutout punch holes for ticket aesthetic */}
                        <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#0a0a0f] rounded-full z-10 print:bg-white" />
                        <div className="md:hidden absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#0a0a0f] rounded-full z-10 print:bg-white" />

                        <div className="mb-8 border-b-2 border-dashed border-zinc-200 pb-8 flex flex-col md:flex-row gap-6 md:items-center">
                            <div className="flex-1">
                                <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Cinema/Theatre</p>
                                <p className="text-xl font-black text-zinc-800">{booking.show.screen.name}</p>

                                <div className="mt-6 flex flex-wrap gap-8">
                                    <div>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Date</p>
                                        <p className="font-bold text-zinc-900">{formattedDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Time</p>
                                        <p className="font-bold text-zinc-900">{formattedTime}</p>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div className="flex-shrink-0 bg-white p-3 rounded-2xl shadow-lg border border-zinc-100 flex flex-col items-center justify-center">
                                <Image
                                    src={qrCodeUrl}
                                    alt="Booking QR Code"
                                    width={120}
                                    height={120}
                                    className="rounded-lg mb-2"
                                    unoptimized // External arbitrary domain
                                />
                                <p className="text-[10px] text-zinc-400 font-mono text-center">SCAN AT ENTRY</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center">
                            <div>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Row & Seats</p>
                                <div className="flex flex-wrap gap-2">
                                    {booking.seats.map((seat: string, i: number) => (
                                        <span key={i} className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-3 py-1 rounded-lg font-bold text-lg shadow-inner">
                                            {seat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right mt-6 sm:mt-0">
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Booking ID</p>
                                <p className="font-mono text-lg font-black text-zinc-700">{booking._id.slice(-8).toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-zinc-100 flex justify-between items-center text-sm">
                            <span className="font-semibold text-zinc-500">
                                Paid: <span className="text-emerald-500">₹{booking.totalPrice}</span>
                            </span>
                            <span className="text-zinc-400 font-medium">Please arrive 15 mins early</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="mt-10 flex gap-4 hide-on-print">
                <button
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold transition"
                >
                    Go Back
                </button>
                <button
                    onClick={handlePrint}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 rounded-xl font-black flex gap-2 items-center transition"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Print Ticket
                </button>
            </div>

        </div>
    );
}
