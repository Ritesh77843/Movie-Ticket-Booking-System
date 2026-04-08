"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Ticket, 
  Film, 
  Popcorn, 
  MonitorPlay, 
  Users, 
  LogOut, 
  Settings 
} from "lucide-react";
import { DashboardView } from "../../components/admin/DashboardView";
import { BookingsView } from "../../components/admin/BookingsView";
import { MoviesView } from "../../components/admin/MoviesView";
import { ShowsView } from "../../components/admin/ShowsView";
import { ScreensView } from "../../components/admin/ScreensView";
import { UsersView } from "../../components/admin/UsersView";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== "admin") {
      router.push("/shows");
      return;
    }

    setUser(userData);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "bookings", label: "Bookings", icon: Ticket },
    { id: "movies", label: "Movies", icon: Film },
    { id: "shows", label: "Shows & Seats", icon: Popcorn },
    { id: "screens", label: "Theatres", icon: MonitorPlay },
    { id: "users", label: "Users & Admins", icon: Users },
  ];

  if (loading) {
    return <div className="min-h-screen bg-black text-white p-10 flex items-center justify-center">Loading Admin Panel...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col fixed h-full z-10 transition-all duration-300 shadow-2xl">
        <div className="p-6 border-b border-zinc-900 flex items-center justify-center">
          <div className="w-10 h-10 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-rose-500/30 mr-3">
            <Popcorn className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">
            Cinema<span className="text-rose-500">OS</span>
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-zinc-800 text-white shadow-md border border-zinc-700/50" 
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? "text-rose-500" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col bg-zinc-950 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-8 py-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
              {activeTab.replace("-", " ")}
            </h2>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-right">
              <div className="mr-3">
                <p className="text-sm font-bold text-white leading-tight">{user?.name}</p>
                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-tighter">System Administrator</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl flex items-center justify-center border border-zinc-700 shadow-inner group cursor-pointer hover:border-rose-500/50 transition-all">
                <span className="text-zinc-300 font-black group-hover:text-rose-500 transition-colors uppercase">{user?.name?.charAt(0)}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-zinc-800"></div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 rounded-xl transition-all duration-300 border border-rose-500/20 hover:border-rose-500/40 text-sm font-bold shadow-lg shadow-rose-900/20 active:scale-95 px-5"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-1 overflow-x-hidden">
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "bookings" && <BookingsView />}
        {activeTab === "movies" && <MoviesView />}
        {activeTab === "shows" && <ShowsView />}
        {activeTab === "screens" && <ScreensView />}
          {activeTab === "users" && <UsersView />}
        </div>
      </div>
    </div>
  );
}
