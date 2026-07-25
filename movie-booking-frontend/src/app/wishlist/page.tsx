"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { HeartCrack, Heart } from "lucide-react";
import MovieCard from "@/components/MovieCard";

export default function WishlistPage() {
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await axios.get(`${API_URL}/api/users/wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMovies(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050507] text-white pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">

                <div className="flex items-center gap-4 mb-12">
                    <div className="bg-rose-500/20 p-4 rounded-2xl border border-rose-500/30 text-rose-500 shadow-xl shadow-rose-900/20">
                        <Heart className="w-10 h-10 fill-rose-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">My Wishlist</h1>
                        <p className="text-zinc-500 mt-2 text-lg">Your curated vault of cinematic experiences.</p>
                    </div>
                </div>

                {movies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-[#12121a] rounded-3xl border border-white/5 border-dashed">
                        <HeartCrack className="w-16 h-16 text-zinc-700 mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">Vault is Empty</h2>
                        <p className="text-zinc-500 text-center max-w-md">You haven't saved any movies yet. Tap the heart icon on any movie page to safely store them here!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {movies.map(movie => (
                            <div key={movie._id} className="relative group">
                                <MovieCard movie={movie} />
                                <button
                                    onClick={async () => {
                                        const token = sessionStorage.getItem("token");
                                        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/wishlist/${movie._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
                                        fetchWishlist(); // Optimistically clear it out
                                    }}
                                    className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all z-20"
                                    title="Remove from Wishlist"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
