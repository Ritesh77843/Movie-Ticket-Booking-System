"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Sparkles, Film, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AIPicksPage() {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await axios.get(`${API_URL}/api/movies/recommendations/ai`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecommendations(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center">
                <Sparkles className="w-12 h-12 text-blue-500 animate-pulse mb-6" />
                <p className="text-zinc-400 font-medium tracking-widest uppercase animate-pulse">Consulting the Oracle...</p>
            </div>
        );
    }

    const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;

    if (!token) {
        return (
            <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center p-6">
                <div className="bg-[#12121a] border border-white/5 p-10 rounded-3xl text-center max-w-md">
                    <Sparkles className="w-16 h-16 text-blue-500 fill-blue-500/20 mx-auto mb-6" />
                    <h2 className="text-3xl font-black mb-4">AI Magic Picks</h2>
                    <p className="text-zinc-400 mb-8 leading-relaxed">Sign in to unlock deeply personalized movie recommendations powered by Llama3 based on your exact watch history and wishlists.</p>
                    <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-900/20">Sign In to Unlock</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050507] text-white pt-24 pb-20 px-6 relative overflow-hidden">
            {/* Glow Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-16 mt-8">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-blue-400 font-bold tracking-widest text-xs uppercase mb-6 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                        <Sparkles className="w-4 h-4" /> Powered by Groq AI
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Magic Recommendations</h1>
                    <p className="text-zinc-400 text-xl max-w-2xl mx-auto">We analyzed your entire cinematic journey. Here are 3 masterpieces curated specifically for your tastes.</p>
                </div>

                <div className="space-y-8">
                    {recommendations.length > 0 ? recommendations.map((rec, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            key={i}
                            className="bg-[#12121a]/80 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 rounded-3xl p-8 md:p-10 transition-all hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)] group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full group-hover:bg-blue-500/10 transition-colors" />
                            <div className="flex items-start md:items-center gap-6 relative z-10">
                                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
                                    <Film className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <h2 className="text-3xl font-bold">{rec.title}</h2>
                                        <span className="bg-white/10 text-xs font-bold px-3 py-1 rounded-full text-blue-200">{rec.genre}</span>
                                    </div>
                                    <p className="text-zinc-400 text-lg leading-relaxed">{rec.reason}</p>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <Link href={`/search?q=${encodeURIComponent(rec.title)}`} className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                    Check Availability <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="text-center text-zinc-500 py-20">Something went wrong contacting the oracle. Try again later.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
