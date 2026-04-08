"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function VerifyPage() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const pending = localStorage.getItem("pendingVerify");
    if (pending) setEmailOrPhone(pending);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Decide whether it's email or phone by simple check
      const payload: any = { otp };

      if (emailOrPhone.includes("@")) payload.email = emailOrPhone;
      else payload.phone = emailOrPhone;

      const res = await axios.post(`${API_URL}/api/auth/verify`, payload);

      setSuccess(res.data.message || "Verified successfully!");
      localStorage.removeItem("pendingVerify");

      // Redirect to login after short delay
      setTimeout(() => router.push("/login"), 1200);
    } catch (err: any) {
      console.error("VERIFY ERROR:", err?.response?.data || err.message);
      setError(err?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-zinc-900 p-8 rounded-2xl w-87.5 shadow-2xl"
      >
        <h1 className="text-white text-2xl font-bold text-center mb-6">
          🔐 Verify Your Account
        </h1>

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            className="w-full p-3 rounded bg-zinc-800 text-white outline-none"
            placeholder="Email or Phone"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
          />

          <input
            className="w-full p-3 rounded bg-zinc-800 text-white outline-none tracking-widest text-center"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={loading || !emailOrPhone || !otp}
            className="w-full bg-green-600 p-3 rounded text-white font-semibold disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </motion.button>
        </form>

        <p className="text-gray-400 text-sm mt-4 text-center">
          Didn’t receive OTP?{" "}
          <span
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => router.push("/login")}
          >
            Go back to login
          </span>
        </p>
      </motion.div>
    </div>
  );
}
