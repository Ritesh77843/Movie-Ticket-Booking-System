"use client";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

export const cardVariant: Variants = {
  hidden: { opacity: 0, scale: 0.1, rotate: -180 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 120,
    },
  },
};

export default function MovieCard({ movie }: any) {
  const getPoster = (path: string) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("/") && path.length > 20) return `https://image.tmdb.org/t/p/w500${path}`;
    return path;
  };

  return (
    <Link href={`/movies/${movie.movie?._id || movie._id}`}>
      <motion.div
        variants={cardVariant}
        whileHover={{
          scale: 1.05,
          boxShadow: "0px 0px 25px rgba(56, 189, 248, 0.4)",
          y: -5,
          transition: { duration: 0.2, type: "spring", stiffness: 300 }
        }}
        whileTap={{ scale: 0.95 }}
        className="w-45 cursor-pointer group bg-[#12121a] rounded-2xl pb-3 h-full border border-white/5 relative overflow-hidden"
      >
        <div className="relative overflow-hidden rounded-t-2xl">
          <img
            src={getPoster(movie.movie?.poster || movie.poster)}
            className="h-65 w-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent opacity-80" />

          {/* Rating badge */}
          {(movie.movie?.rating || movie.rating) && (
            <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10 shadow-lg">
              {movie.movie?.rating || movie.rating}
            </span>
          )}
          {/* Language badge */}
          {(movie.movie?.language || movie.language) && (
            <span className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg shadow-red-900/50 border border-red-400/30">
              {movie.movie?.language || movie.language}
            </span>
          )}
        </div>
        <div className="px-4 mt-3 relative z-10">
          <h3 className="font-bold text-sm leading-tight text-white line-clamp-2 drop-shadow-md">{movie.movie?.title || movie.title || "Unknown Movie"}</h3>
          <p className="text-[10px] text-blue-400 font-bold mt-1.5 uppercase tracking-widest">{movie.movie?.genre || movie.genre || "Movie"} {movie.screen?.name ? `| ${movie.screen.name}` : ""}</p>
          {movie.price && (
            <p className="text-xs text-emerald-400 font-bold mt-1 drop-shadow-sm">₹{movie.price}</p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
