"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function WishlistButton({ movieId }: { movieId: string }) {
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    useEffect(() => {
        checkWishlistStatus();
    }, [movieId]);

    const checkWishlistStatus = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`${API_URL}/api/users/wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // The API returns an array of populated movies, or object IDs.
            const saved = res.data.some((m: any) => m._id === movieId || m === movieId);
            setIsSaved(saved);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            alert("Please login to save this movie to your wishlist.");
            return;
        }

        // Optimistic Update
        setIsSaved(!isSaved);

        try {
            await axios.post(`${API_URL}/api/users/wishlist/${movieId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            // Revert if failed
            setIsSaved(isSaved);
            console.error(err);
        }
    };

    if (loading) return null;

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleWishlist}
            className={`p-3 md:p-4 rounded-full backdrop-blur-md shadow-2xl transition-all border ${isSaved
                    ? "bg-rose-500/20 border-rose-500/50 text-rose-500 shadow-rose-500/20"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
        >
            <Heart className={`w-6 h-6 md:w-8 md:h-8 ${isSaved ? "fill-rose-500" : ""}`} />
        </motion.button>
    );
}
