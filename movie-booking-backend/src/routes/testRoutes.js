import express from "express";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Any logged-in user
router.get("/user", protect, (req, res) => {
  res.json({ message: "Hello user", user: req.user });
});

// Admin only
router.get("/admin", protect, isAdmin, (req, res) => {
  res.json({ message: "Hello admin", user: req.user });
});

export default router;
