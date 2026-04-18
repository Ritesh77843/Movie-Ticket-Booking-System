"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { MapPin, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function TheaterSelector({ movieId }: { movieId: string }) {
  const [locations, setLocations] = useState<string[]>(["Mumbai", "Navi Mumbai", "Pune", "Delhi"]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [theatersBySubLocation, setTheatersBySubLocation] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [selectedTheater, setSelectedTheater] = useState<any>(null);
  const [shows, setShows] = useState<any[]>([]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchTheaters();
    }
  }, [selectedLocation]);

  const fetchTheaters = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/theaters`);
      const filtered = res.data.filter((t: any) => t.location === selectedLocation);
      
      const grouped = filtered.reduce((acc: any, theater: any) => {
        const sub = theater.subLocation;
        if (!acc[sub]) acc[sub] = [];
        acc[sub].push(theater);
        return acc;
      }, {});
      
      setTheatersBySubLocation(grouped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTheaterSelect = async (theater: any) => {
    setSelectedTheater(theater);
    try {
      const res = await axios.get(`${API_URL}/api/theaters/${theater._id}/movies/${movieId}/shows`);
      setShows(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!mounted) return <div className="bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 shadow-2xl h-[400px]" />;

  return (
    <div className="bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 shadow-2xl">
      {!selectedLocation ? (
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <MapPin className="mr-2 text-rose-500" /> Select Location
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className="bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/50 p-6 rounded-2xl transition-all text-xl font-medium"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      ) : !selectedTheater ? (
        <div>
          <button 
            onClick={() => setSelectedLocation(null)}
            className="text-zinc-500 hover:text-white mb-4 text-sm flex items-center"
          >
            ← Back to Locations
          </button>
          <h2 className="text-2xl font-bold mb-6">Popular Theatres in {selectedLocation}</h2>
          
          <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
            {Object.keys(theatersBySubLocation).map((sub) => (
              <div key={sub}>
                <h3 className="text-rose-500 font-bold uppercase tracking-widest text-xs mb-4">{sub}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {theatersBySubLocation[sub].map((t: any) => (
                    <button
                      key={t._id}
                      onClick={() => handleTheaterSelect(t)}
                      className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 px-5 py-4 rounded-xl transition-all group"
                    >
                      <span className="font-medium">{t.name}</span>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button 
            onClick={() => setSelectedTheater(null)}
            className="text-zinc-500 hover:text-white mb-4 text-sm flex items-center"
          >
            ← Back to Theaters
          </button>
          <h2 className="text-2xl font-bold mb-2">{selectedTheater.name}</h2>
          <p className="text-zinc-500 mb-8">{selectedTheater.subLocation}, {selectedTheater.address}</p>
          
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Clock className="mr-2 text-rose-500 w-5 h-5" /> Available Timings
          </h3>
          
          {shows.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {shows.map((show) => (
                <Link 
                  key={show._id} 
                  href={`/shows/${show._id}`}
                  className="bg-zinc-900 hover:bg-rose-600 border border-zinc-800 hover:border-rose-500 p-4 rounded-xl text-center transition-all group"
                >
                  <span className="block text-zinc-400 group-hover:text-white/80 text-xs mb-1">
                    {new Date(show.showTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-lg font-bold">
                    {new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="block text-rose-500 group-hover:text-white text-xs mt-2 font-bold uppercase tracking-tighter">
                    ₹{show.price}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/5 p-8 rounded-2xl text-center text-zinc-500">
              No shows found for this theater.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
