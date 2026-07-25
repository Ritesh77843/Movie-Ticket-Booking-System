import express from "express";
import {
  getAllMovies,
  getMovieById,
  createMovie,
  deleteMovie,
  getAIRecommendations
} from "../controllers/movieController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllMovies);
router.get("/recommendations/ai", protect, getAIRecommendations);
router.get("/:id", getMovieById);
router.post("/", protect, isAdmin, createMovie);
router.delete("/:id", protect, isAdmin, deleteMovie);

export default router;
