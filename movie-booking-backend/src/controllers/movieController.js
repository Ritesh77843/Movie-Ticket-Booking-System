import Movie from "../models/Movie.js";

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
