import express from "express";
import { toggleWishlist, getWishlist } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/wishlist/:movieId", protect, toggleWishlist);
router.get("/wishlist", protect, getWishlist);

export default router;
