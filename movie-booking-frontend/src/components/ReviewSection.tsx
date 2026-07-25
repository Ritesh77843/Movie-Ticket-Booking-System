"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Star, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviewSection({ movieId }: { movieId: string }) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isAuth, setIsAuth] = useState(false);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        setIsAuth(!!token);
        fetchReviews();
    }, [movieId]);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/reviews/${movieId}`);
            setReviews(res.data);
        } catch (err) { }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmitting(true);
        const token = sessionStorage.getItem("token");
        try {
            await axios.post(`${API_URL}/api/reviews`, {
                movieId, rating, comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComment("");
            setRating(5);
            fetchReviews();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to post review");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-12 bg-[#0a0a0f] border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl">
            <h3 className="text-3xl font-black mb-8 text-white flex items-center gap-3">
                <Star className="text-yellow-500 fill-yellow-500 w-8 h-8" />
                Audience Reviews <span className="text-zinc-600 text-xl font-medium">({reviews.length})</span>
            </h3>

            {isAuth ? (
                <form onSubmit={handleSubmit} className="mb-12 bg-[#12121a] p-6 rounded-2xl border border-white/5">
                    <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star className={`w-8 h-8 ${rating >= star ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"} transition-colors`} />
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Write your review here..."
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-rose-500 resize-none min-h-[120px]"
                            required
                        />
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={submitting}
                            className="absolute bottom-4 right-4 bg-rose-600 hover:bg-rose-500 text-white p-3 rounded-xl disabled:opacity-50 shadow-lg shadow-rose-900/30"
                        >
                            <Send className="w-5 h-5" />
                        </motion.button>
                    </div>
                </form>
            ) : (
                <div className="mb-12 bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
                    <p className="text-zinc-400">Please login to write a review.</p>
                </div>
            )}

            <div className="space-y-6">
                <AnimatePresence>
                    {reviews.length === 0 ? (
                        <p className="text-zinc-600 text-center py-10 font-medium">No reviews yet. Be the first to share your thoughts!</p>
                    ) : (
                        reviews.map(review => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={review._id}
                                className="flex gap-4 border-b border-white/5 pb-6 last:border-0"
                            >
                                <img src={review.user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} className="w-12 h-12 rounded-full border border-white/10 bg-zinc-900" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-white">{review.user?.name || "Verified User"}</h4>
                                        <span className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex gap-1 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-800"}`} />
                                        ))}
                                    </div>
                                    <p className="text-zinc-300 leading-relaxed text-sm md:text-base">{review.comment}</p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
