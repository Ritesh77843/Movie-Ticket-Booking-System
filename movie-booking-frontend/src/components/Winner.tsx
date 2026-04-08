"use client";

import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";

const banners = ["/banner1.svg", "/banner2.svg", "/banner3.svg"];

const encounterFlash: Variants = {
  hidden: { opacity: 0, filter: "brightness(0) invert(1) grayscale(1)" },
  flash: {
    opacity: 1,
    filter: [
      "brightness(0) invert(1) grayscale(1)", 
      "brightness(2) invert(0) grayscale(0)", 
      "brightness(1) invert(0) grayscale(0)"
    ],
    transition: { duration: 0.8, ease: "easeOut", times: [0, 0.2, 1] }
  }
};

export default function HeroCarousel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Hydration prevention layout block
  if (!mounted) return <div className="h-70 mt-6 bg-zinc-900/50 rounded-2xl animate-pulse" />;

  return (
    <motion.div 
      variants={encounterFlash}
      initial="hidden"
      animate="flash"
      className="rounded-2xl overflow-hidden mt-6 shadow-2xl shadow-cyan-900/20 border border-white/10 relative"
    >
      {/* Decorative Wild Encounter shine */}
      <motion.div 
        initial={{ x: "-150%", skewX: -20 }}
        animate={{ x: "300%", skewX: -20 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
        className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent z-10 pointer-events-none"
      />
      
      <motion.div
        className="flex"
        animate={{ x: ["0%", "-100%", "-200%", "0%"] }}
        transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
      >
        {banners.map((b, i) => (
          <img
            key={i}
            src={b}
            className="w-full h-70 object-cover shrink-0 brightness-90 hover:brightness-105 transition-all duration-500"
          />
        ))}
      </motion.div>
    </motion.div>
  );
}