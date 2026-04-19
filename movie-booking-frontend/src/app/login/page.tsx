"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<"user" | "admin">("user");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Removed admin email-only restriction — phone login now supported
    
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        emailOrPhone: emailOrPhone.trim(),
        password: password.trim(),
      });
      
      // Check role if admin login
      if (loginType === "admin" && res.data.user.role !== "admin") {
        setError("This account does not have admin privileges");
        setLoading(false);
        return;
      }
      
      localStorage.clear();
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("auth-change"));
      router.push(loginType === "admin" ? "/admin-dashboard" : "/shows");
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[url('/login_bg.png')] bg-cover bg-center overflow-auto py-10">
      
      {/* Top right links simulation */}
      <div className="fixed top-6 right-10 text-white font-bold text-sm tracking-wide z-10 flex gap-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <span className="cursor-pointer hover:text-yellow-300 transition-colors">Home</span>
        <span className="text-white/50">|</span>
        <span className="cursor-pointer hover:text-yellow-300 transition-colors">News</span>
        <span className="text-white/50">|</span>
        <span className="cursor-pointer hover:text-yellow-300 transition-colors">Support</span>
      </div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="relative flex items-center justify-center w-full max-w-4xl h-full pl-0 md:pr-40"
      >
        
        {/* Pikachu Character Layer (Positioned absolutely so it breaks outside the card) */}
        <div className="absolute right-[-10%] sm:right-[5%] md:right-[-5%] bottom-[-5%] md:-bottom-10 z-20 pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
          {mounted && (
            <Image 
              src="/login_companion.png"
              alt="Companion Mascot" 
              width={450} 
              height={450}
              className="w-[280px] sm:w-[350px] md:w-[450px] object-contain" 
              unoptimized // Prevent Next.js from serving a cached old version
            />
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 pt-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-[6px] border-amber-50 relative z-10 mx-4">
          
          {/* Decorative Corner Icons */}
          <div className="absolute -top-6 -left-6 z-10 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-[3px] border-gray-100/50 rotate-[-15deg]">
             <div className="w-[85%] h-[85%] bg-red-500 rounded-full border-[3px] border-black flex items-center justify-center flex-col overflow-hidden relative">
               <div className="w-full h-1/2 bg-white absolute bottom-0 border-t-[3px] border-black"></div>
               <div className="w-4 h-4 bg-white border-[3px] border-black rounded-full absolute z-10 outline outline-[3px] outline-white"></div>
             </div>
          </div>

          <div className="absolute bottom-10 -left-8 z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-[3px] border-gray-100/50 rotate-[20deg]">
             <div className="w-[85%] h-[85%] bg-red-500 rounded-full border-[3px] border-black flex items-center justify-center flex-col overflow-hidden relative">
               <div className="w-full h-1/2 bg-white absolute bottom-0 border-t-[3px] border-black"></div>
               <div className="w-5 h-5 bg-white border-[3px] border-black rounded-full absolute z-10 outline outline-[4px] outline-white"></div>
             </div>
          </div>

          {/* Sparkles / Leaves decorators */}
          <div className="absolute top-4 right-4 text-yellow-400 text-3xl opacity-80">✦</div>
          <div className="absolute top-24 -left-3 text-green-500 text-2xl rotate-45 opacity-80">🌿</div>
          <div className="absolute bottom-4 left-6 text-yellow-400 text-2xl opacity-80 rotate-12">⭐</div>
          
          <h1 className="text-center font-black text-3xl leading-tight mb-2 drop-shadow-sm flex flex-col items-center">
            <span className="text-[#2a6db9]" style={{ WebkitTextStroke: '1px #FFD700', textShadow: '2px 2px 0px #FFD700' }}>
              ENTER TO
            </span>
            <span className="text-[#ffcb05] text-[2.2rem] mt-1" style={{ WebkitTextStroke: '2px #2a6db9', textShadow: '3px 3px 0px #2a6db9' }}>
              CINEMA WORLD
            </span>
          </h1>

          {/* Login Type Toggle native to the card */}
          <div className="flex gap-2 mb-6 mt-4 p-1.5 bg-amber-50/50 rounded-2xl justify-center shadow-inner border border-amber-100">
            <button
              type="button"
              onClick={() => {
                setLoginType("user");
                setError("");
              }}
              className={`flex-1 py-1.5 rounded-xl font-bold text-sm tracking-wide transition-all ${
                loginType === "user"
                  ? "bg-white text-blue-600 shadow-md border-b-2 border-blue-200"
                  : "bg-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              👤 Trainer
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType("admin");
                setError("");
              }}
              className={`flex-1 py-1.5 rounded-xl font-bold text-sm tracking-wide transition-all ${
                loginType === "admin"
                  ? "bg-white text-red-500 shadow-md border-b-2 border-red-200"
                  : "bg-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              🛡️ Admin
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-bold text-center mb-4 bg-red-50 rounded-xl px-3 py-2 border-2 border-red-100">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">{loginType === "admin" ? "🛡️" : "🧑‍🚀"}</span>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={
                  loginType === "admin"
                    ? "Admin Email or Phone"
                    : "Email or Phone Number"
                }
                required
                className="w-full border-[3px] border-amber-100 shadow-[inset_0_4px_6px_rgba(0,0,0,0.02)] rounded-2xl py-3.5 pl-12 pr-4 text-gray-700 font-bold bg-amber-50/30 outline-none focus:border-amber-400 focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-semibold"
              />
            </div>
            
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔑</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full border-[3px] border-amber-100 shadow-[inset_0_4px_6px_rgba(0,0,0,0.02)] rounded-2xl py-3.5 pl-12 pr-4 text-gray-700 font-bold bg-amber-50/30 outline-none focus:border-amber-400 focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-semibold"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className={`mt-4 font-black text-lg rounded-[1.2rem] py-3.5 transition-all duration-200 text-white shadow-[0_8px_0_#d49900] active:shadow-[0_0px_0_#d49900] active:translate-y-2 border-2 border-[#fff7cc] ${
                loginType === "admin"
                  ? "bg-gradient-to-b from-blue-400 to-blue-600 shadow-[0_8px_0_#1e40af] active:shadow-[0_0px_0_#1e40af]"
                  : "bg-gradient-to-b from-[#ffdb58] to-[#ffaa00] text-[#7a4c00]"
              }`}
            >
              {loading ? "Connecting..." : (
                <span className="flex items-center justify-center gap-2">
                  {loginType === "admin" ? "Admin Access" : "Log In"} ⚡
                </span>
              )}
            </motion.button>
          </form>

          <div className="flex flex-col items-center gap-2 mt-8 text-sm font-bold">
            <span className="text-[#3b82f6] cursor-pointer hover:underline underline-offset-2">Forgot Password?</span>
            <span 
              onClick={() => router.push("/register")}
              className="text-[#3b82f6] cursor-pointer hover:underline underline-offset-2"
            >
              Sign Up
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
