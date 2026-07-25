import Movie from "../models/Movie.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import axios from "axios";

// ✅ Get all movies
export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (err) {
    console.error("getAllMovies error:", err);
    res.status(500).json({ message: "Failed to fetch movies" });
  }
};

// ✅ Get movie by id
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    console.error("getMovieById error:", err);
    res.status(500).json({ message: "Failed to fetch movie" });
  }
};

// ✅ Create movie
export const createMovie = async (req, res) => {
  try {
    const { title, poster, genre, language, rating, duration } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Movie title is required" });
    }

    const movie = await Movie.create({
      title,
      poster,
      genre,
      language,
      rating,
      duration,
    });

    res.status(201).json(movie);
  } catch (err) {
    console.error("createMovie error:", err);
    res.status(500).json({ message: "Failed to create movie" });
  }
};

// ✅ Delete movie
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "Movie deleted successfully" });
  } catch (err) {
    console.error("deleteMovie error:", err);
    res.status(500).json({ message: "Failed to delete movie" });
  }
};

// ✅ Get AI Recommendations
export const getAIRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    const bookings = await Booking.find({ user: req.user._id }).populate({
      path: "show",
      populate: { path: "movie" }
    });

    const wishlisted = user.wishlist.map((m) => m.title).join(", ");
    const watched = bookings.map((b) => b.show?.movie?.title).filter(Boolean);
    const uniqueWatched = [...new Set(watched)].join(", ");

    const contextStr = [
      uniqueWatched ? `I have watched: ${uniqueWatched}.` : "",
      wishlisted ? `I have these in my wishlist: ${wishlisted}.` : ""
    ].filter(Boolean).join(" ");

    let prompt = `I am a user looking for movie recommendations. ${contextStr || "I like critically acclaimed action and thriller movies."} `;
    prompt += `Recommend exactly 3 excellent movies. Return ONLY a pure raw JSON string representing an array of 3 objects with properties: "title" (string), "reason" (a 1 sentence explanation starting with 'Because you...'), and "genre" (string). Absolutely no markdown formatting or backticks around the json.`;

    const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    let aiRes = response.data.choices[0].message.content.trim();
    // Safety fallback for stray markdown codeblocks
    if (aiRes.startsWith("\`\`\`json")) {
      aiRes = aiRes.replace(/^\`\`\`json/g, "").replace(/\`\`\`$/g, "").trim();
    }

    res.json(JSON.parse(aiRes));

  } catch (err) {
    console.error("getAIRecommendations error:", err);
    res.status(500).json({ message: "Failed to fetch AI recommendations" });
  }
};
