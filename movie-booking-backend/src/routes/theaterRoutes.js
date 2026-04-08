import express from "express";
import Theater from "../models/Theater.js";
import Screen from "../models/Screen.js";
import Show from "../models/Show.js";

const router = express.Router();

// Get all theaters grouped by location
router.get("/", async (req, res) => {
  try {
    const theaters = await Theater.find();
    
    // Grouping logic can be handled here or on the frontend
    // For now, return all
    res.json(theaters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get movies playing at a specific theater
router.get("/:id/movies", async (req, res) => {
  try {
    const screens = await Screen.find({ theater: req.params.id });
    const screenIds = screens.map(s => s._id);
    
    const shows = await Show.find({ screen: { $in: screenIds } }).populate("movie");
    
    // Extract unique movies
    const moviesMap = new Map();
    shows.forEach(show => {
      if (show.movie) {
        moviesMap.set(show.movie._id.toString(), show.movie);
      }
    });
    
    res.json(Array.from(moviesMap.values()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get timing slots for a specific movie in a specific theater
router.get("/:id/movies/:movieId/shows", async (req, res) => {
  try {
    const screens = await Screen.find({ theater: req.params.id });
    const screenIds = screens.map(s => s._id);
    
    const shows = await Show.find({ 
      screen: { $in: screenIds },
      movie: req.params.movieId
    });
    
    res.json(shows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
