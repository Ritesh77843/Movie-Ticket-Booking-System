"use client";

import MovieCard from "./MovieCard";
import { motion } from "framer-motion";

const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Pokemon staggered entering the field
    },
  },
};

export default function MovieRow({ title, movies }: any) {
  if (!movies || movies.length === 0) return null;

  return (
    <section className="my-10 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 drop-shadow-md">
          {title}
        </h2>
        <motion.span 
          whileHover={{ scale: 1.1, x: 5 }} 
          whileTap={{ scale: 0.9 }} 
          className="text-red-500 font-bold text-xs cursor-pointer uppercase tracking-widest bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-full transition-colors border border-red-500/20"
        >
          See All ➔
        </motion.span>
      </div>

      <motion.div 
        variants={containerVariant} 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true, amount: 0.1 }}
        className="flex gap-5 overflow-x-auto pb-6 pt-2 -mx-2 px-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {movies.map((movie: any) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </motion.div>
    </section>
  );
}