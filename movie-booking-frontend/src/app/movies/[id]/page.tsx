import TheaterSelector from "@/components/TheaterSelector";
import WishlistButton from "@/components/WishlistButton";
import ReviewSection from "@/components/ReviewSection";
import { Star, Clock, Calendar, Languages } from "lucide-react";

async function getMovie(id: string) {
  const fetchUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000").replace("localhost", "127.0.0.1");
  const res = await fetch(`${fetchUrl}/api/movies/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await getMovie(id);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Movie not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      {/* Movie Backdrop & Hero */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-lg scale-125 opacity-40"
          style={{ backgroundImage: `url(${movie.poster})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/70 to-[#050507]/30" />

        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <div className="w-48 h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 relative">
              <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 z-10">
                <WishlistButton movieId={movie._id} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-rose-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{movie.rating}</span>
                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{movie.genre}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter">{movie.title}</h1>
              <div className="flex flex-wrap gap-6 text-zinc-400 font-medium">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span>{movie.averageRating ? `${movie.averageRating.toFixed(1)}/5` : "8.5/10"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{movie.duration || "2h 30m"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  <span>{movie.language}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Calendar className="text-rose-500" /> Select Theatre & Timing
            </h2>
            <TheaterSelector movieId={id} />
          </div>

          <div className="space-y-8">
            <div className="bg-[#12121a] border border-white/5 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-4">About Movie</h3>
              <p className="text-zinc-400 leading-relaxed">
                Experience the magic of {movie.title} on the big screen. A thrilling journey through {movie.genre.toLowerCase()} that will leave you wanting more.
              </p>
            </div>

            <div className="bg-gradient-to-br from-rose-600 to-orange-600 rounded-3xl p-8 shadow-xl shadow-rose-900/20">
              <h3 className="text-xl font-bold mb-2 text-white">Offers Available</h3>
              <p className="text-white/80 text-sm mb-6">Get up to 20% off on your first booking with NJRA.</p>
              <button className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-100 transition-colors">
                View All Offers
              </button>
            </div>
          </div>
        </div>

        {/* Audience Reviews */}
        <ReviewSection movieId={movie._id} />
      </div>
    </div>
  );
}
