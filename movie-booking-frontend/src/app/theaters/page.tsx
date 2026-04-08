"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { MapPin, Search, ChevronRight } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function TheatersPage() {
  const [locations] = useState(["Mumbai", "Navi Mumbai"]);
  const [selectedLocation, setSelectedLocation] = useState("Mumbai");
  const [theatersBySub, setTheatersBySub] = useState<any>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTheaters();
  }, [selectedLocation]);

  const fetchTheaters = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/theaters`);
      const filtered = res.data.filter((t: any) => t.location === selectedLocation);
      
      const grouped = filtered.reduce((acc: any, t: any) => {
        if (!acc[t.subLocation]) acc[t.subLocation] = [];
        acc[t.subLocation].push(t);
        return acc;
      }, {});
      
      setTheatersBySub(grouped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2"> Cinemas </h1>
            <p className="text-zinc-500">Discover cinemas near you in {selectedLocation}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 w-5 h-5" />
                <select 
                  value={selectedLocation} 
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-zinc-900 border border-white/5 pl-12 pr-10 py-3 rounded-2xl appearance-none focus:outline-none focus:border-rose-500 transition-colors cursor-pointer font-bold"
                >
                  {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
             </div>
             
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search cinema..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-zinc-900 border border-white/5 pl-12 pr-6 py-3 rounded-2xl focus:outline-none focus:border-rose-500 transition-colors font-medium w-full sm:w-64"
                />
             </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-zinc-500">Loading cinemas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.keys(theatersBySub).map(sub => (
              <div key={sub} className="space-y-4">
                <h2 className="text-xs font-black text-rose-500 uppercase tracking-[0.2em] mb-6">{sub}</h2>
                <div className="space-y-3">
                  {theatersBySub[sub].filter((t: any) => t.name.toLowerCase().includes(search.toLowerCase())).map((theater: any) => (
                    <Link 
                      key={theater._id} 
                      href={`/theaters/${theater._id}`}
                      className="flex items-center justify-between bg-[#12121a] hover:bg-[#1a1a25] border border-white/5 p-6 rounded-2xl transition-all group"
                    >
                      <div>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-rose-500 transition-colors">{theater.name}</h3>
                        <p className="text-zinc-500 text-sm">{theater.address}</p>
                      </div>
                      <div className="bg-white/5 group-hover:bg-rose-500/10 p-2 rounded-xl transition-colors">
                        <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-rose-500" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
