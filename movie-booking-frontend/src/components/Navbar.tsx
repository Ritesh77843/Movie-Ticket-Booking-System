// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const syncUser = useCallback(() => {
    try {
      const stored = sessionStorage.getItem("user");
      const parsed = stored ? JSON.parse(stored) : null;
      setUser((prev: any) => {
        // Only update if changed to avoid unnecessary re-renders
        if (JSON.stringify(prev) !== JSON.stringify(parsed)) return parsed;
        return prev;
      });
    } catch {
      setUser(null);
    }
  }, []);

  // Re-check user on every route change (pathname change)
  useEffect(() => {
    syncUser();
  }, [pathname, syncUser]);

  // Listen for custom auth-change event (fired by login/logout)
  useEffect(() => {
    const handleAuthChange = () => syncUser();
    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [syncUser]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };

  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto flex items-center gap-6 p-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold text-blue-400">
          🎬 NJRA CINEMA
        </Link>

        <div className="flex-1 relative">
          <input
            placeholder="Search for Movies, Events, Plays..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full px-5 py-2.5 rounded-xl bg-zinc-800/50 text-white border border-zinc-700/50 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium placeholder:text-zinc-500"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 border border-zinc-700 rounded bg-zinc-900 text-[10px] font-bold">ENTER</kbd>
          </div>
        </div>

        {/* City */}
        <select className="border border-zinc-700 rounded-md bg-zinc-900 text-white px-3 py-2 text-sm">
          <option>Mumbai</option>
          <option>Pune</option>
          <option>Delhi</option>
        </select>

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-white">
              {isAdmin ? "🛡️" : "👤"} {user.name.split(" ")[0]}
            </span>
            {isAdmin ? (
              <Link
                href="/admin-dashboard"
                className="text-sm text-blue-300 hover:text-blue-100 transition"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/wishlist"
                  className="text-sm text-rose-400 hover:text-rose-300 transition"
                >
                  My Wishlist
                </Link>
                <Link
                  href="/bookings"
                  className="text-sm text-blue-300 hover:text-blue-100 transition"
                >
                  My Bookings
                </Link>
              </>
            )}
            <button
              onClick={handleLogout}
              className="bg-zinc-800 text-white px-4 py-2 rounded-md hover:bg-zinc-700 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Category Row - Hide for Admin */}
      {!isAdmin && (
        <div className="bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-7xl mx-auto flex gap-6 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Link href="/ai-picks" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors">
              <span className="text-sm">✨</span> AI Picks
            </Link>
            <Link href="/movies" className="hover:text-rose-500 transition-colors">
              Movies
            </Link>
            <Link href="/theaters" className="hover:text-rose-500 transition-colors">
              Cinemas
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}