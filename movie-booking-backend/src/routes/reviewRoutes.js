import express from "express";
import { addReview, getReviews } from "../controllers/reviewController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addReview);
router.get("/:movieId", getReviews);

export default router;
